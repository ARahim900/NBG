"""Import the 2025 Women & Child Health workbooks without changing them.

Reads three department workbooks and writes the JSON the dashboards bundle:

  * 3 & 4-year visits     → src/data/childVisits2025.json
  * Down syndrome registry → src/data/downSyndrome2025.json
  * Maltreatment notices   → src/data/maltreatment2025.json

Counts are copied exactly. A blank cell stays null (never zero), totals must
reconcile with the workbook's own total rows, and anything that looks wrong in
the source (more referrals than visits, age bands that do not add up) is kept
as reported and listed under "flags" so the dashboard can say so. Maltreatment
notifications are published as aggregates only — no individual records.

    python3 scripts/build_wch_2025.py --visits V.xlsx --down-syndrome D.xlsx \
        --maltreatment M.xlsx
"""
import argparse
import hashlib
import json
from collections import Counter
from datetime import datetime
from pathlib import Path

import openpyxl

DATA = Path(__file__).resolve().parents[1] / 'src' / 'data'
MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
WILAYAT_ORDER = ['Shinas', 'Liwa', 'Sohar', 'Saham', 'Al Khabourah', 'As Suwayq']

# Workbook label → (name used in population.json, wilayat). Keeping the
# population names means one centre has one name everywhere in the app.
VISIT_CENTRES = {
    'shinas pc': ('Shinas EHC', 'Shinas'),
    'abu baqra': ('Abu Baqra HC', 'Shinas'),
    'liwa pc': ('Liwa HC', 'Liwa'),
    'nuber pc': ('Nabur HC', 'Liwa'),
    'rahab': ('Rahab HC', 'Liwa'),
    'suhar pc': ('Sohar EHC', 'Sohar'),
    'multaqa': ('Al Multaqa HC', 'Sohar'),
    'tarif': ('Al Traif HC', 'Sohar'),
    'falaj al qabil': ('Falaj Al Qabail HC', 'Sohar'),
    'al uwainate': ('Al Uwainat HC', 'Sohar'),
    'wadi hibi': ('Wadi Hibi Hospital', 'Sohar'),
    'wadi ahin': ('Wadi Ahin HC', 'Sohar'),
    'saham pc': ('Saham EHC', 'Saham'),
    'guwisah': ('Al Ghwaisah HC', 'Saham'),
    'hafeet': ('Hafeet HC', 'Saham'),
    'wadi bani omar': ('Wadi Bani Umar HC', 'Saham'),
    'khabourah': ('Al Khabourah EHC', 'Al Khabourah'),
    'qasabiah': ('Al Qasabiyah HC', 'Al Khabourah'),
    'wadi shafan': ('Wadi Shafan HC', 'Al Khabourah'),
    'wadi hawasnah': ('Wadi Al Hawasinah Hospital', 'Al Khabourah'),
    'wadi sarami': ('Wadi As Sarami Hospital', 'Al Khabourah'),
    'al suwaiq pc': ('As Suwayq EHC', 'As Suwayq'),
    'al bidayah': ('Al Bidayah HC', 'As Suwayq'),
    'al khadra': ('Al Khadra HC', 'As Suwayq'),
    'al shareesa': ('Al Shreesah HC', 'As Suwayq'),
    'al tharmad': ('Al Tharmed HC', 'As Suwayq'),
    'wadi jahawer': ('Wadi Al Jahawir HC', 'As Suwayq'),
    'mashaiq': ('Al Mashaiq HC', 'As Suwayq'),
}

# Down-syndrome clinics: registry label, comorbidity label → name used in the
# 2023/2024 registry (nbg.json) so the years line up.
DS_CENTRES = [
    ('sohar ehc', 'suhar', 'Sohar EHC', 'Sohar'),
    ('suwaiq ehc', 'suwaiq', 'Suwaiq EHC', 'As Suwayq'),
    ('khaboura ehc', 'khabourah', 'Khaboura EHC', 'Al Khabourah'),
    ('saham poly clinic', 'saham', 'Saham Poly Clinic', 'Saham'),
    ('shinas ehc', 'shinas', 'Shinas EHC', 'Shinas'),
    ('liwa hc', 'liwa', 'Liwa HC', 'Liwa'),
]
DS_COMORBIDITY_COLUMNS = [
    ('cardiac', 2), ('earsHearing', 3), ('ophthalmic', 4), ('hypothyroidism', 5),
    ('hyperthyroidism', 6), ('diabetes', 7), ('haematological', 8), ('underweight', 9),
    ('normalWeight', 10), ('overweight', 11), ('developmentalDelay', 12),
    ('noDevelopmentalDelay', 13), ('gastrointestinal', 14),
]

MT_WILAYAT = {'sohar': 'Sohar', 'saham': 'Saham', 'as suwayq': 'As Suwayq',
              'shinas': 'Shinas', 'al khaburah': 'Al Khabourah', 'liwa': 'Liwa'}
MT_TYPES = {'neglect': 'Neglect', 'physical': 'Physical abuse', 'sexual abuse': 'Sexual abuse',
            'emotional abuse': 'Emotional abuse', 'others': 'Others'}
MT_AGE_BANDS = [('Under 1', 0, 0), ('1–4', 1, 4), ('5–9', 5, 9), ('10–14', 10, 14), ('15–17', 15, 17)]


def key(value):
    return ' '.join(str(value or '').split()).casefold()


def count(value, location, allow_blank=False):
    """A non-negative whole number. Blank → None only when allowed."""
    if value is None or (isinstance(value, str) and not value.strip()):
        if allow_blank:
            return None
        raise ValueError(f'Missing count at {location}')
    if isinstance(value, bool) or not isinstance(value, (int, float)) or value < 0 or value != int(value):
        raise ValueError(f'Invalid count at {location}: {value!r}')
    return int(value)


def source_info(path, sheets):
    return {'filename': path.name, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'sheets': sheets}


# ---------------------------------------------------------------------------
# 3 & 4-year visits
# ---------------------------------------------------------------------------
def extract_visit_sheet(sheet, label):
    header_row = next((r for r in range(1, 20) if key(sheet.cell(r, 2).value) == 'institution name / months'), None)
    if header_row is None:
        raise ValueError(f'{label}: heading "Institution Name / Months" not found')
    if [key(sheet.cell(header_row + 1, c).value) for c in (3, 4, 5)] != ['target', 'clerked', 'refarred']:
        raise ValueError(f'{label}: monthly columns are not Target / Clerked / Referred')
    total_col = next((c for c in range(39, 50) if key(sheet.cell(header_row, c).value) == 'total'), None)
    if total_col is None:
        raise ValueError(f'{label}: "Total" column not found')

    centres, seen, total_row = [], set(), None
    for row in range(header_row + 2, sheet.max_row + 1):
        name = key(sheet.cell(row, 2).value)
        if not name:
            continue
        if name == 'total per month':
            total_row = row
            break
        if name not in VISIT_CENTRES:
            raise ValueError(f'{label}: unknown institution "{sheet.cell(row, 2).value}" at row {row}')
        if name in seen:
            raise ValueError(f'{label}: duplicate institution at row {row}')
        seen.add(name)
        monthly = []
        for m in range(12):
            col = 3 + m * 3
            cells = [count(sheet.cell(row, col + i).value, f'{label} row {row} col {col + i}', allow_blank=True)
                     for i in range(3)]
            monthly.append(None if all(v is None for v in cells) else
                           {'target': cells[0], 'clerked': cells[1], 'referred': cells[2]})
        target, clerked, referred = (count(sheet.cell(row, total_col + i).value, f'{label} row {row} total')
                                     for i in range(3))
        en, wilayat = VISIT_CENTRES[name]
        # The workbook's Total column is the department's reported figure; a
        # month sum that disagrees is shown as a flag, never silently replaced.
        mismatches = []
        for field, total in (('clerked', clerked), ('referred', referred)):
            month_sum = sum((m or {}).get(field) or 0 for m in monthly)
            if month_sum != total:
                mismatches.append(f'{field} months add to {month_sum}, total column says {total}')
        centres.append({'sourceRow': row, 'sourceName': str(sheet.cell(row, 2).value).strip(), 'name': en,
                        'wilayat': wilayat, 'target': target, 'clerked': clerked, 'referred': referred,
                        'monthly': monthly, 'mismatches': mismatches})
    if total_row is None:
        raise ValueError(f'{label}: "Total per month" row not found')
    if seen != set(VISIT_CENTRES):
        raise ValueError(f'{label}: missing institutions {sorted(set(VISIT_CENTRES) - seen)}')
    flags = []
    stated = {}
    for i, field in enumerate(('target', 'clerked', 'referred')):
        stated[field] = count(sheet.cell(total_row, total_col + i).value, f'{label} total row')
        summed = sum(c[field] for c in centres)
        if stated[field] != summed:
            flags.append(f'Governorate: the {field} total row says {stated[field]}; '
                         f'the institutions add to {summed}.')

    for c in centres:
        flags.extend(f"{c['name']}: {m}." for m in c.pop('mismatches'))
        missing = [MONTHS[i] for i, m in enumerate(c['monthly']) if m is None]
        if missing:
            flags.append(f"{c['name']}: no figures for {', '.join(missing)}.")
        for i, m in enumerate(c['monthly']):
            if m and m['referred'] is not None and m['clerked'] is not None and m['referred'] > m['clerked']:
                flags.append(f"{c['name']}: {MONTHS[i]} reports {m['referred']} referrals from "
                             f"{m['clerked']} visits.")
        if c['target'] and c['clerked'] > c['target']:
            flags.append(f"{c['name']}: {c['clerked']} visits against a target of {c['target']} "
                         f"({c['clerked'] / c['target'] * 100:.0f}%).")
    monthly_clerked = [sum((c['monthly'][i] or {}).get('clerked') or 0 for c in centres) for i in range(12)]
    return {'centres': centres, 'statedTotals': stated, 'monthlyClerked': monthly_clerked, 'flags': flags}


def extract_visits(path):
    book = openpyxl.load_workbook(path, data_only=True)
    names = {'three': '3 years Visits 2025', 'four': '4 years Visits 2025'}
    for sheet in names.values():
        if sheet not in book.sheetnames:
            raise ValueError(f'Sheet "{sheet}" not found; review the workbook layout before importing.')
    return {'source': source_info(path, list(names.values())), 'year': 2025, 'months': MONTHS,
            'three': extract_visit_sheet(book[names['three']], '3-year'),
            'four': extract_visit_sheet(book[names['four']], '4-year')}


# ---------------------------------------------------------------------------
# Down syndrome registry
# ---------------------------------------------------------------------------
def extract_down_syndrome(path):
    sheet = openpyxl.load_workbook(path, data_only=True).active
    if 'january–december 2025' not in key(sheet['A2'].value):
        raise ValueError('Reporting period is not January–December 2025; review the source first.')
    expected = {'A4': 'institution name', 'G4': '***number of newly diagnosed cases', 'L6': 'male',
                'M6': 'female', 'A18': 'total number of cases with comorbidities', 'B18': 'cardiac'}
    for cell, heading in expected.items():
        if key(sheet[cell].value) != heading:
            raise ValueError(f'Unexpected heading at {cell}')

    rows = {key(sheet.cell(r, 1).value): r for r in range(1, sheet.max_row + 1) if sheet.cell(r, 1).value}
    centres, flags = [], []
    for reg_label, morb_label, name, wilayat in DS_CENTRES:
        if reg_label not in rows or morb_label not in rows:
            raise ValueError(f'Clinic "{name}" not found in both tables')
        r, m = rows[reg_label], rows[morb_label]
        rec = {'name': name, 'wilayat': wilayat}
        for field, col in (('newCases', 7), ('registered', 8), ('age0to5', 9), ('age6to12', 10),
                           ('age13to18', 11), ('male', 12), ('female', 13)):
            rec[field] = count(sheet.cell(r, col).value, f'row {r} col {col}')
        rec['comorbidities'] = {field: count(sheet.cell(m, col).value, f'row {m} col {col}')
                                for field, col in DS_COMORBIDITY_COLUMNS}
        if rec['male'] + rec['female'] != rec['registered']:
            raise ValueError(f'{name}: males + females do not equal registered cases')
        ages = rec['age0to5'] + rec['age6to12'] + rec['age13to18']
        if ages != rec['registered']:
            flags.append(f'{name}: age groups add to {ages}; {rec["registered"]} children are registered.')
        weights = sum(rec['comorbidities'][k] for k in ('underweight', 'normalWeight', 'overweight'))
        if weights != rec['registered']:
            flags.append(f'{name}: weight categories cover {weights} of {rec["registered"]} children.')
        centres.append(rec)

    total_row = rows.get('total')
    if total_row is None:
        raise ValueError('Total row not found')
    for field, col in (('newCases', 7), ('registered', 8), ('age0to5', 9), ('age6to12', 10),
                       ('age13to18', 11), ('male', 12), ('female', 13)):
        stated = count(sheet.cell(total_row, col).value, f'total row col {col}')
        if stated != sum(c[field] for c in centres):
            raise ValueError(f'{field} total {stated} does not match the clinics')
    return {'source': source_info(path, [sheet.title]), 'year': 2025,
            'focalPoints': {'doctors': count(sheet.cell(total_row, 2).value, 'total row doctors'),
                            'nurses': count(sheet.cell(total_row, 3).value, 'total row nurses')},
            'centres': centres, 'flags': flags}


# ---------------------------------------------------------------------------
# Child maltreatment notifications (aggregates only)
# ---------------------------------------------------------------------------
def extract_maltreatment(path):
    sheet = openpyxl.load_workbook(path, data_only=True).active
    headers = [key(c.value) for c in sheet[1][:8]]
    if headers != ['reporting institute', 'reporting region', 'reporting wilayat', 'note date', 'age', 'sex',
                   'nationality', 'maltreatment type']:
        raise ValueError('Unexpected column headings; review the export before importing.')
    by_wilayat, by_type, by_month, by_age, by_sex = Counter(), Counter(), Counter(), Counter(), Counter()
    by_institution, wilayat_type, omani = Counter(), Counter(), 0
    total = 0
    for row in range(2, sheet.max_row + 1):
        values = [sheet.cell(row, c).value for c in range(1, 9)]
        if all(v is None for v in values):
            continue
        institution, region, wilayat, date, age, sex, nationality, kind = values
        if key(region) != 'north batinah':
            raise ValueError(f'Row {row}: region is {region!r}, not North Batinah')
        if key(wilayat) not in MT_WILAYAT:
            raise ValueError(f'Row {row}: unknown wilayat {wilayat!r}')
        if key(kind) not in MT_TYPES:
            raise ValueError(f'Row {row}: unknown maltreatment type {kind!r}')
        if key(sex) not in ('m', 'f'):
            raise ValueError(f'Row {row}: unknown sex {sex!r}')
        when = date if isinstance(date, datetime) else datetime.strptime(str(date).strip(), '%d-%m-%Y')
        if when.year != 2025:
            raise ValueError(f'Row {row}: notification dated {when:%Y-%m-%d}, outside 2025')
        years = count(age, f'row {row} age')
        band = next((b for b, lo, hi in MT_AGE_BANDS if lo <= years <= hi), None)
        if band is None:
            raise ValueError(f'Row {row}: age {years} is outside 0–17')
        w, t = MT_WILAYAT[key(wilayat)], MT_TYPES[key(kind)]
        total += 1
        by_wilayat[w] += 1
        by_type[t] += 1
        by_month[when.month - 1] += 1
        by_age[band] += 1
        by_sex['Male' if key(sex) == 'm' else 'Female'] += 1
        by_institution[(' '.join(str(institution).split()), w)] += 1
        wilayat_type[(w, t)] += 1
        omani += key(nationality) == 'sultanate of oman'
    if not total:
        raise ValueError('No notifications found')
    types = list(MT_TYPES.values())
    return {
        'source': source_info(path, [sheet.title]), 'year': 2025, 'total': total, 'omani': omani,
        'types': types,
        'byWilayat': [{'wilayat': w, 'count': by_wilayat[w], **{t: wilayat_type[(w, t)] for t in types}}
                      for w in WILAYAT_ORDER],
        'byType': [{'type': t, 'count': by_type[t]} for t in types],
        'byMonth': [by_month[i] for i in range(12)],
        'byAge': [{'band': b, 'count': by_age[b]} for b, _, _ in MT_AGE_BANDS],
        'bySex': [{'sex': s, 'count': by_sex[s]} for s in ('Male', 'Female')],
        'byInstitution': [{'institution': i, 'wilayat': w, 'count': n}
                          for (i, w), n in sorted(by_institution.items(), key=lambda x: (-x[1], x[0][0]))],
    }


def write(path, data):
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n')
    print(f'wrote {path.relative_to(DATA.parents[1])}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--visits', type=Path)
    parser.add_argument('--down-syndrome', type=Path)
    parser.add_argument('--maltreatment', type=Path)
    args = parser.parse_args()
    if not (args.visits or args.down_syndrome or args.maltreatment):
        parser.error('give at least one workbook')
    if args.visits:
        write(DATA / 'childVisits2025.json', extract_visits(args.visits))
    if args.down_syndrome:
        write(DATA / 'downSyndrome2025.json', extract_down_syndrome(args.down_syndrome))
    if args.maltreatment:
        write(DATA / 'maltreatment2025.json', extract_maltreatment(args.maltreatment))
