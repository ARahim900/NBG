"""Aggregate the 2026 MPDSR workbook without exporting individual case details.

Pending items = every highlighted case row plus every case row with an empty
field in the case details (B–R), the final ICD-PM code (AB) or the quality of
care (BC). Pending rows stay in the case totals; cause, factor and quality
counts use only rows with a final code.
"""
import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import re

import openpyxl
from openpyxl.utils import get_column_letter

MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
CATEGORIES = {'feotal': 'stillbirth', 'early neonatal': 'earlyNeonatal', 'late neonatal': 'lateNeonatal'}
HIGHLIGHT = 'FFFFFF00'
FIRST_ROW = 5
REQUIRED = list(range(1, 18)) + [27, 54]  # B–R, AB, BC (0-based)
FACTOR_COLS = [i for i in range(28, 54) if i not in (36, 46, 53)]  # AC–BB without the "Others" columns


def clean(value):
    return re.sub(r'\s+', ' ', str(value)).strip() if value is not None else ''


def analyse(path):
    workbook = openpyxl.load_workbook(path, data_only=True)
    sheet, lookup = workbook['Sheet1'], workbook['Sheet2']
    codes = {}
    for row in lookup:
        match = re.match(r'^([MAIN]\d+)\s*:\s*(.+)$', clean(row[0].value))
        if match:
            codes[match[1]] = match[2]

    headers = {i: clean(sheet.cell(2, i + 1).value) for i in REQUIRED}
    records, skipped = [], []
    for cells in sheet.iter_rows(min_row=FIRST_ROW):
        values = [cell.value for cell in cells][:55]
        row = cells[0].row
        if not any(v is not None for v in values):
            continue
        category = CATEGORIES.get(clean(values[8]).lower())
        month = next((m for m in MONTHS if m.lower() == clean(values[0]).lower()), None)
        if category is None or month is None:
            skipped.append(row)
            continue
        final = clean(values[27]).upper().replace(' ', '')
        match = re.fullmatch(r'(M\d+)([AIN]\d+)', final)
        if final and not (match and match[1] in codes and match[2] in codes):
            raise ValueError(f'Row {row}: final code {final!r} not in Sheet2')
        records.append({
            'row': row,
            'month': month,
            'category': category,
            'highlighted': any(c.fill.fill_type == 'solid' and c.fill.fgColor.rgb == HIGHLIGHT for c in cells[:28]),
            'empty': [headers[i] for i in REQUIRED if clean(values[i]) == ''],
            'mcode': match[1] if match else None,
            'fcode': match[2] if match else None,
            'factors': {i for i in FACTOR_COLS if clean(values[i]).lower() == 'yes'},
            'quality': clean(values[54]),
        })

    coded = [r for r in records if r['mcode']]
    pending = [r for r in records if r['highlighted'] or r['empty']]
    totals = Counter(r['category'] for r in records)
    reviewed = Counter(r['category'] for r in records if not (r['highlighted'] or r['empty']))

    monthly = []
    for month in MONTHS:
        subset = Counter(r['category'] for r in records if r['month'] == month)
        monthly.append({'month': month[:3], **{key: subset[key] for key in CATEGORIES.values()}, 'total': sum(subset.values())})

    final_m = Counter(r['mcode'] for r in coded)
    final_f = Counter(r['fcode'] for r in coded)
    code_tables = [
        {'prefix': prefix, 'rows': [{'code': c, 'description': d, 'finalCount': (final_m if prefix == 'M' else final_f)[c]} for c, d in codes.items() if c.startswith(prefix)]}
        for prefix in 'MAIN'
    ]
    factors = [
        {'label': clean(sheet.cell(4, i + 1).value), 'group': 'Family' if i < 37 else 'Medical team' if i < 47 else 'Health facility', 'yes': sum(i in r['factors'] for r in coded), 'sourceColumn': get_column_letter(i + 1)}
        for i in FACTOR_COLS
    ]
    quality = [{'label': k, 'count': v} for k, v in Counter(r['quality'] for r in coded).items()]

    result = {
        'source': {'filename': path.name, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'caseSheet': 'Sheet1', 'codeSheet': 'Sheet2', 'caseRange': f'A{FIRST_ROW}:BC{records[-1]["row"]}'},
        'summary': {
            'records': len(records), **{k: totals[k] for k in CATEGORIES.values()},
            'reviewed': len(records) - len(pending), 'reviewedByCategory': {k: reviewed[k] for k in CATEGORIES.values()},
            'pending': len(pending), 'highlighted': sum(r['highlighted'] for r in records), 'coded': len(coded),
            'lastMonth': max((r['month'] for r in records), key=MONTHS.index)[:3],
        },
        'monthly': monthly,
        'codeTables': code_tables,
        'factors': factors,
        'quality': quality,
        'pending': [
            {'row': r['row'], 'month': r['month'][:3], 'category': r['category'], 'highlighted': r['highlighted'], 'emptyFields': r['empty']}
            for r in pending
        ],
        'excludedNonCaseRows': skipped,
    }
    assert sum(m['total'] for m in monthly) == len(records) == sum(totals.values())
    assert sum(final_m.values()) == sum(final_f.values()) == len(coded)
    return result


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('source', type=Path)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    data = analyse(args.source)
    args.output.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n')
    print(json.dumps({'summary': data['summary'], 'pending': len(data['pending'])}, indent=2))
