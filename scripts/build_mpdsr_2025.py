"""Aggregate the supplied MPDSR workbook without exporting individual case details."""
import argparse
from collections import Counter, defaultdict
from datetime import datetime
import hashlib
import json
from pathlib import Path
import re

import openpyxl


MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
CATEGORIES = {'feotal': 'stillbirth', 'early neonatal': 'earlyNeonatal', 'late neonatal': 'lateNeonatal'}


def clean(value):
    return re.sub(r'\s+', ' ', str(value)).strip() if value is not None else ''


def parse_date(value):
    if isinstance(value, datetime):
        return value.date()
    for fmt in ('%d/%m/%Y', '%Y-%m-%d'):
        try:
            return datetime.strptime(clean(value), fmt).date()
        except ValueError:
            continue
    return None


def analyse(path):
    workbook = openpyxl.load_workbook(path, data_only=True)
    sheet, lookup = workbook['Sheet1'], workbook['Sheet2']
    codes = {}
    for row in lookup:
        match = re.match(r'^([MAIN]\d+):\s*(.+)$', clean(row[0].value))
        if match:
            code, description = match.groups()
            if code in codes:
                raise ValueError(f'Duplicate lookup code {code}')
            codes[code] = {'code': code, 'description': description, 'sourceCell': row[0].coordinate}

    issues = []
    records = []
    incomplete = []
    skipped = []

    def flag(row, kind, cells, detail):
        issues.append({'row': row, 'kind': kind, 'cells': cells, 'detail': detail})

    for cells in sheet.iter_rows(min_row=5):
        values = [cell.value for cell in cells]
        row = cells[0].row
        if not any(value is not None for value in values):
            continue
        if not any(values[i] is not None for i in range(2, 52)) or any(clean(value).startswith('Red=') for value in values):
            skipped.append(row)
            continue
        if clean(values[6]).lower() not in CATEGORIES or clean(values[0]).title() not in MONTHS:
            incomplete.append(row)
            flag(row, 'Incomplete record', f'A{row}:I{row}', 'No reporting month, death category or dates; excluded from case totals and coding denominators.')
            continue
        category = CATEGORIES[clean(values[6]).lower()]
        month = clean(values[0]).title()
        birth, death = parse_date(values[7]), parse_date(values[8])
        for col, date in [('H', birth), ('I', death)]:
            if date is None:
                flag(row, 'Invalid date', f'{col}{row}', 'Date is missing or cannot be parsed as a valid calendar date; not corrected.')
        if death and death.year != 2025:
            flag(row, 'Death year mismatch', f'I{row}', 'Recorded death year is outside 2025; retained only in the provisional workbook cohort.')
        if death and death.month != MONTHS.index(month) + 1:
            flag(row, 'Reporting month mismatch', f'A{row}, I{row}', 'Reporting month differs from recorded death month; chart uses the reporting month.')
        if birth and birth.year not in (2024, 2025):
            flag(row, 'Delivery year mismatch', f'H{row}', 'Delivery year is outside 2024–2025; requires source confirmation.')
        timing = clean(values[14])
        expected_timing = {'stillbirth': ('before delivery', 'during'), 'earlyNeonatal': ('0-6 days of birth',), 'lateNeonatal': ('7-28 days of birth',)}[category]
        if timing not in expected_timing:
            flag(row, 'Category / timing conflict', f'G{row}, O{row}', 'Death category and timing selection disagree; reported category is retained.')
        if birth and death:
            days = (death - birth).days
            if category != 'stillbirth' and days < 0:
                flag(row, 'Neonatal chronology conflict', f'H{row}:I{row}', 'Recorded neonatal death precedes delivery.')
            elif category == 'earlyNeonatal' and days > 6 or category == 'lateNeonatal' and days >= 0 and not 7 <= days <= 28:
                flag(row, 'Neonatal interval conflict', f'G{row}:I{row}', 'Calendar-day interval falls outside the category selected in the workbook; no reclassification applied.')
            if category == 'stillbirth' and death > birth:
                flag(row, 'Foetal date conflict', f'G{row}:I{row}', 'Foetal category has a death date after delivery; needs source review.')
        maternal = [f'M{i-14}' for i in range(15, 21) if clean(values[i])]
        selected = []
        for i in range(21, 24):
            match = re.match(r'^([AIN]\d+):', clean(values[i]), re.I)
            if match:
                selected.append(match[1].upper())
        final = clean(values[24]).upper().replace(' ', '')
        match = re.fullmatch(r'(M\d+)([AIN]\d+)', final)
        mcode, fcode = match.groups() if match else (None, None)
        if not final:
            flag(row, 'Missing final code', f'Y{row}', 'Final code is blank; no code inferred from selected fields.')
        elif not match or mcode not in codes or fcode not in codes:
            flag(row, 'Unmapped final code', f'Y{row}', f'Final code {final} is not fully defined in Sheet2; unknown component retained as unmapped.')
        if match and (maternal != [mcode] or selected != [fcode]):
            flag(row, 'Final / selected code conflict', f'P{row}:Y{row}', 'Final code differs from selected maternal or cause fields; final-code counts and selected-field counts are shown separately.')
        expected_prefix = ('A', 'I') if category == 'stillbirth' else ('N',)
        if fcode and not fcode.startswith(expected_prefix):
            flag(row, 'Category / final code conflict', f'G{row}, Y{row}', 'Final cause-code group conflicts with the recorded death category.')
        if category == 'stillbirth' and fcode and ((timing == 'during' and fcode.startswith('A')) or (timing == 'before delivery' and fcode.startswith('I'))):
            flag(row, 'Timing / final code conflict', f'O{row}, Y{row}', 'Antepartum/intrapartum code conflicts with the selected timing of death.')
        for i in (10, 11):
            if values[i] is None:
                flag(row, 'Missing descriptive field', f'{openpyxl.utils.get_column_letter(i+1)}{row}', 'Birth weight or sex is missing; not imputed.')
        if isinstance(values[10], (int, float)) and values[10] > 10:
            flag(row, 'Weight unit requires confirmation', f'K{row}', 'Weight appears inconsistent with the kg heading; no conversion or correction applied.')
        gestation = clean(values[9])
        if gestation.lower() == 'not known':
            flag(row, 'Gestation not known', f'J{row}', 'Gestational age is explicitly recorded as not known.')
        elif re.fullmatch(r'\d+\+', gestation):
            flag(row, 'Incomplete gestation notation', f'J{row}', 'Weeks-plus notation has no day component; days have not been inferred.')
        records.append({'row': row, 'values': values, 'category': category, 'month': month, 'maternal': maternal, 'selected': selected, 'mcode': mcode, 'fcode': fcode})

    signatures = defaultdict(list)
    exact = defaultdict(list)
    for record in records:
        vals = record['values']
        signatures[tuple(clean(vals[i]).lower() for i in (2,3,4,5,6,7,8,9,10,11))].append(record['row'])
        exact[tuple(clean(value).lower() for value in vals)].append(record['row'])
    candidates = [rows for rows in signatures.values() if len(rows) > 1]
    for rows in candidates:
        for row in rows:
            flag(row, 'Possible duplicate', f'C{row}:L{row}', f'Matching demographic, category and date fields in rows {", ".join(map(str, rows))}; retained because no unique case identifier is supplied.')

    totals = Counter(record['category'] for record in records)
    monthly = []
    for month in MONTHS:
        subset = [r for r in records if r['month'] == month]
        counts = Counter(r['category'] for r in subset)
        monthly.append({'month': month[:3], **{key: counts[key] for key in CATEGORIES.values()}, 'total': len(subset)})
    final_m = Counter(r['mcode'] for r in records)
    final_f = Counter(r['fcode'] for r in records)
    selected_m = Counter(code for r in records for code in r['maternal'])
    selected_f = Counter(code for r in records for code in r['selected'])
    code_tables = []
    for prefix, title in [('M', 'Maternal conditions'), ('A', 'Antepartum causes'), ('I', 'Intrapartum causes'), ('N', 'Neonatal causes')]:
        final_counts, selected_counts = (final_m, selected_m) if prefix == 'M' else (final_f, selected_f)
        code_tables.append({'prefix': prefix, 'title': title, 'rows': [{**item, 'finalCount': final_counts[code], 'selectedCount': selected_counts[code]} for code, item in codes.items() if code.startswith(prefix)]})
    qualities = Counter(clean(r['values'][51]) for r in records)
    quality = [{'label': label, 'count': count} for label, count in qualities.items()]
    factors = []
    for i in range(25, 51):
        if i in (33,43,50):
            continue
        values = [clean(r['values'][i]).lower() for r in records]
        factors.append({'label': clean(sheet.cell(4,i+1).value), 'group': 'Family' if i < 34 else 'Medical team' if i < 44 else 'Health facility', 'yes': values.count('yes'), 'no': values.count('no'), 'unknown': sum(v not in ('yes','no') for v in values), 'sourceColumn': openpyxl.utils.get_column_letter(i+1)})
    demographics = []
    for i, label in [(11,'Sex'), (12,'Place of delivery'), (13,'Mode of delivery')]:
        counts = Counter(clean(r['values'][i]) or 'Not recorded' for r in records)
        demographics.append({'title':label,'rows':[{'label':'Ambiguous' if key == 'Ambigous' else key,'count':value} for key,value in counts.items()]})
    result = {
        'source': {'filename':path.name, 'sha256':hashlib.sha256(path.read_bytes()).hexdigest(), 'caseSheet':'Sheet1', 'codeSheet':'Sheet2', 'caseRange':'A6:AZ135', 'codeRange':'A5:A101'},
        'summary': {'records':len(records), **dict(totals), 'incompleteRows':incomplete, 'flaggedRecords':len({i['row'] for i in issues} - set(incomplete)), 'duplicateCandidateGroups':candidates, 'exactDuplicateGroups':[v for v in exact.values() if len(v)>1], 'finalCodeMissing':sum(r['mcode'] is None for r in records), 'finalCodeUnmapped':sum(r['mcode'] is not None and (r['mcode'] not in codes or r['fcode'] not in codes) for r in records)},
        'monthly':monthly, 'codeTables':code_tables, 'quality':quality, 'factors':factors, 'demographics':demographics,
        'issues':issues, 'issueSummary':[{'kind':kind,'count':len({i['row'] for i in issues if i['kind']==kind})} for kind in dict.fromkeys(i['kind'] for i in issues)],
        'unknownCodes':[{'code':code or 'Not recorded','count':count} for code,count in final_f.items() if code not in codes],
        'excludedNonCaseRows':skipped,
    }
    assert sum(r['total'] for r in monthly) == len(records)
    assert sum(totals.values()) == len(records)
    assert sum(final_m.values()) == sum(final_f.values()) == len(records)
    assert sum(qualities.values()) == len(records)
    return result


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('source', type=Path)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    data = analyse(args.source)
    args.output.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n')
    print(json.dumps({'summary': data['summary'], 'issues':data['issueSummary']}, indent=2))
