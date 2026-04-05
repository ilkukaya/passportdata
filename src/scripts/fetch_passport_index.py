"""
Passport Index verilerini çekerek visa_matrix.json dosyasını günceller.
Kaynak: https://github.com/ilyankou/passport-index-dataset
"""
import requests
import json
from datetime import datetime
from pathlib import Path

DATA_DIR = Path('src/data')

STATUS_MAP = {
    'visa free': 'visa_free',
    'visa on arrival': 'visa_on_arrival',
    'visa on arrival / eta': 'visa_on_arrival',
    'e-visa': 'e_visa',
    'eta': 'e_visa',
    'visa required': 'visa_required',
    '-1': 'visa_required',
    'no admission': 'visa_required',
}


def fetch_passport_index():
    """passportindex.org dataset'inden bilateral vize verilerini çeker."""
    matrix_file = DATA_DIR / 'visa_matrix.json'

    # Mevcut veriyi yükle
    if matrix_file.exists():
        with open(matrix_file, 'r', encoding='utf-8') as f:
            matrix = json.load(f)
    else:
        matrix = {'last_updated': '', 'source': '', 'data': {}}

    # Passport Index public dataset (CSV)
    url = "https://raw.githubusercontent.com/ilyankou/passport-index-dataset/master/passport-index-tidy.csv"
    print(f"Fetching data from {url}...")
    response = requests.get(url, timeout=30)
    response.raise_for_status()

    lines = response.text.strip().split('\n')

    updated_count = 0
    for line in lines[1:]:  # Skip header
        parts = line.split(',')
        if len(parts) < 3:
            continue

        passport = parts[0].strip()
        destination = parts[1].strip()
        requirement = parts[2].strip().lower()
        days_raw = parts[3].strip() if len(parts) > 3 else ''

        status = STATUS_MAP.get(requirement, 'visa_required')
        try:
            days = int(days_raw)
        except (ValueError, TypeError):
            days = None

        if passport == destination:
            continue

        if passport not in matrix['data']:
            matrix['data'][passport] = {}

        matrix['data'][passport][destination] = {
            'status': status,
            'days': days,
            'notes': ''
        }
        updated_count += 1

    matrix['last_updated'] = datetime.now().strftime('%Y-%m-%d')
    matrix['source'] = 'Passport Index Dataset (ilyankou/passport-index-dataset)'

    with open(matrix_file, 'w', encoding='utf-8') as f:
        json.dump(matrix, f, ensure_ascii=False, indent=2)

    print(f"✓ visa_matrix.json updated: {matrix['last_updated']} ({updated_count} entries)")


if __name__ == '__main__':
    fetch_passport_index()
