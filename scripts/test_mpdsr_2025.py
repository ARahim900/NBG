import json
import os
from pathlib import Path
import unittest

from build_mpdsr_2025 import analyse, parse_date


class DateTests(unittest.TestCase):
    def test_invalid_non_leap_day_is_not_repaired(self):
        self.assertIsNone(parse_date('29/2/2025'))

    def test_text_date_is_day_first(self):
        self.assertEqual(parse_date('17/12/2025').isoformat(), '2025-12-17')


@unittest.skipUnless(os.environ.get('MPDSR_SOURCE'), 'Set MPDSR_SOURCE to the original workbook')
class WorkbookTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = analyse(Path(os.environ['MPDSR_SOURCE']))

    def test_category_and_month_reconciliation(self):
        self.assertEqual(self.data['summary']['records'], 119)
        self.assertEqual([self.data['summary'][k] for k in ('stillbirth','earlyNeonatal','lateNeonatal')], [59,47,13])
        expected = [(7,5,0),(6,5,1),(6,4,2),(2,7,0),(4,5,0),(5,3,0),(7,6,1),(2,3,3),(4,1,1),(4,1,1),(6,3,2),(6,4,2)]
        self.assertEqual([tuple(r[k] for k in ('stillbirth','earlyNeonatal','lateNeonatal')) for r in self.data['monthly']], expected)

    def test_partial_and_possible_duplicate_are_not_silently_resolved(self):
        self.assertEqual(self.data['summary']['incompleteRows'], [44])
        self.assertEqual(self.data['summary']['duplicateCandidateGroups'], [[17,19]])
        self.assertEqual(self.data['summary']['exactDuplicateGroups'], [])

    def test_final_code_unknowns_and_case_normalisation(self):
        self.assertEqual(self.data['unknownCodes'], [{'code':'Not recorded','count':1},{'code':'A7','count':1}])
        codes = {r['code']:r for t in self.data['codeTables'] for r in t['rows']}
        self.assertEqual(codes['A4']['finalCount'], 18)
        self.assertEqual(codes['N6']['description'], 'Infection')
        self.assertEqual(codes['N7']['description'], 'Respiratory and cardiovascular disorders')
        self.assertEqual(sum(codes[f'M{i}']['finalCount'] for i in range(1,7)), 118)
        self.assertEqual(sum(r['finalCount'] for k,r in codes.items() if not k.startswith('M')), 117)

    def test_assessment_and_factor_denominators(self):
        self.assertEqual(sorted(r['count'] for r in self.data['quality']), [3,4,112])
        self.assertTrue(all(r['yes']+r['no']+r['unknown']==119 for r in self.data['factors']))
        self.assertTrue(all(sum(r['count'] for r in t['rows'])==119 for t in self.data['demographics']))

    def test_known_data_issues_stay_visible(self):
        checks = {(r['row'],r['kind']) for r in self.data['issues']}
        for issue in [(46,'Invalid date'),(107,'Death year mismatch'),(70,'Weight unit requires confirmation'),(100,'Gestation not known'),(79,'Missing final code'),(95,'Unmapped final code')]:
            self.assertIn(issue, checks)
        self.assertEqual(self.data['summary']['flaggedRecords'], 52)

    def test_saved_aggregate_matches_source_without_case_values(self):
        saved = json.loads((Path(__file__).parents[1] / 'src/data/mpdsr2025.json').read_text())
        self.assertEqual(saved, self.data)
        self.assertNotIn('values', saved)
        self.assertNotIn('records', saved)


if __name__ == '__main__':
    unittest.main()
