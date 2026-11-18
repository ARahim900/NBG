"""Aggregate the corrected 2026 MPDSR workbook without exporting individual case details.

The corrected workbook uses the 2025 layout (delivery date, death date and labour
time removed), so the output mirrors the 2025 report: monthly counts, ICD-PM final
and selected codes, quality of care, modifiable factors and demographics.

Pending items = every highlighted case row plus every case row with an empty field
in the case details (B–O), the final ICD-PM code (Y) or the quality of care (AZ).
Pending rows stay in the case totals; code, factor and quality counts use only rows
with a final code.
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
CATEGORY, FINAL, QUALITY = 8, 24, 51  # I, Y, AZ (0-based)
REQUIRED = list(range(1, 15)) + [FINAL, QUALITY]  # B–O, Y, AZ
MATERNAL = range(15, 21)  # P–U: M1–M6
CAUSE = range(21, 24)  # V–X: antepartum, intrapartum, neonatal
FACTOR_COLS = [i for i in range(25, 51) if i not in (33, 43, 50)]  # Z–AY without the "Others" columns
DEMOGRAPHICS = [(11, 'Sex'), (12, 'Place of delivery'), (13, 'Mode of delivery')]
EXPECTED_HEADERS = {CATEGORY: 'FD/ENND', FINAL: 'Final ICD10 after review', QUALITY: 'Quality of Care'}


def clean(value):
    return re.sub(r'\s+', ' ', str(value)).strip() if value is not None else ''


def analyse(path):
    workbook = openpyxl.load_workbook(path, data_only=True)
    sheet, lookup = workbook['Sheet1'], workbook['Sheet2']
    for i, start in EXPECTED_HEADERS.items():
        if not clean(sheet.cell(2, i + 1).value).startswith(start):
            raise ValueError(f'Column {get_column_letter(i + 1)} header is not "{start}"; workbook layout changed')
    codes = {}
    for row in lookup:
        match = re.match(r'^([MAIN]\d+)\s*:\s*(.+)$', clean(row[0].value))
        if match:
            codes[match[1]] = match[2]

    headers = {i: clean(sheet.cell(2, i + 1).value) for i in REQUIRED}
    records, skipped = [], []
    for cells in sheet.iter_rows(min_row=FIRST_ROW):
        values = [cell.value for cell in cells][:QUALITY + 1]
        row = cells[0].row
        if not any(v is not None for v in values):
            continue
        category = CATEGORIES.get(clean(values[CATEGORY]).lower())
        month = next((m for m in MONTHS if m.lower() == clean(values[0]).lower()), None)
        if category is None or month is None:
            skipped.append(row)
            continue
        final = clean(values[FINAL]).upper().replace(' ', '')
        match = re.fullmatch(r'(M\d+)([AIN]\d+)', final)
        if final and not (match and match[1] in codes and match[2] in codes):
            raise ValueError(f'Row {row}: final code {final!r} not in Sheet2')
        cause_selected = []
        for i in CAUSE:
            selected = re.match(r'^([AIN]\d+):', clean(values[i]), re.I)
            if selected:
                cause_selected.append(selected[1].upper())
        records.append({
            'row': row,
            'month': month,
            'category': category,
            'highlighted': any(c.fill.fill_type == 'solid' and c.fill.fgColor.rgb == HIGHLIGHT for c in cells[:FINAL + 1]),
            'empty': [headers[i] for i in REQUIRED if clean(values[i]) == ''],
            'mcode': match[1] if match else None,
            'fcode': match[2] if match else None,
            'maternalSelected': [f'M{i - 14}' for i in MATERNAL if clean(values[i])],
            'causeSelected': cause_selected,
            'factors': {i for i in FACTOR_COLS if clean(values[i]).lower() == 'yes'},
            'quality': clean(values[QUALITY]),
            'demographics': {label: clean(values[i]) or 'Not recorded' for i, label in DEMOGRAPHICS},
        })

    coded = [r for r in records if r['mcode']]
    pending = [r for r in records if r['highlighted'] or r['empty']]
    totals = Counter(r['category'] for r in records)

    monthly = []
    for month in MONTHS:
        subset = Counter(r['category'] for r in records if r['month'] == month)
        monthly.append({'month': month[:3], **{key: subset[key] for key in CATEGORIES.values()}, 'total': sum(subset.values())})

    final_m = Counter(r['mcode'] for r in coded)
    final_f = Counter(r['fcode'] for r in coded)
    selected_m = Counter(code for r in coded for code in r['maternalSelected'])
    selected_f = Counter(code for r in coded for code in r['causeSelected'])
    code_tables = []
    for prefix, title in [('M', 'Maternal conditions'), ('A', 'Antepartum causes'), ('I', 'Intrapartum causes'), ('N', 'Neonatal causes')]:
        final_counts, selected_counts = (final_m, selected_m) if prefix == 'M' else (final_f, selected_f)
        code_tables.append({'prefix': prefix, 'title': title, 'rows': [
            {'code': c, 'description': d, 'finalCount': final_counts[c], 'selectedCount': selected_counts[c]}
            for c, d in codes.items() if c.startswith(prefix)
        ]})
    factors = [
        {'label': clean(sheet.cell(4, i + 1).value), 'group': 'Family' if i < 34 else 'Medical team' if i < 44 else 'Health facility', 'yes': sum(i in r['factors'] for r in coded), 'sourceColumn': get_column_letter(i + 1)}
        for i in FACTOR_COLS
    ]
    quality = [{'label': k, 'count': v} for k, v in Counter(r['quality'] for r in coded).items()]
    demographics = [
        {'title': label, 'rows': [{'label': 'Ambiguous' if k == 'Ambigous' else k, 'count': v} for k, v in Counter(r['demographics'][label] for r in records).items()]}
        for _, label in DEMOGRAPHICS
    ]

    result = {
        'source': {'filename': path.name, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'caseSheet': 'Sheet1', 'codeSheet': 'Sheet2', 'caseRange': f'A{FIRST_ROW}:AZ{records[-1]["row"]}'},
        'summary': {
            'records': len(records), **{k: totals[k] for k in CATEGORIES.values()},
            'pending': len(pending), 'highlighted': sum(r['highlighted'] for r in records), 'coded': len(coded),
            'lastMonth': max((r['month'] for r in records), key=MONTHS.index)[:3],
        },
        'monthly': monthly,
        'codeTables': code_tables,
        'factors': factors,
        'quality': quality,
        'demographics': demographics,
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
