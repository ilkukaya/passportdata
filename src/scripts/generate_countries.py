"""
Ülke meta verilerini oluşturur/günceller.
Bu script countries.json dosyasını güncellemek için kullanılır.
"""
import json
from pathlib import Path

DATA_DIR = Path('src/data')


def generate_countries():
    """countries.json dosyasını günceller."""
    countries_file = DATA_DIR / 'countries.json'

    if countries_file.exists():
        with open(countries_file, 'r', encoding='utf-8') as f:
            countries = json.load(f)
        print(f"✓ countries.json loaded ({len(countries)} countries)")
    else:
        print("⚠ countries.json not found")
        return

    # Validate structure
    required_fields = ['iso2', 'iso3', 'names', 'slugs', 'continent', 'flag_url']
    issues = []
    for code, data in countries.items():
        for field in required_fields:
            if field not in data:
                issues.append(f"{code} missing {field}")

    if issues:
        print(f"⚠ Found {len(issues)} issues:")
        for issue in issues[:10]:
            print(f"  - {issue}")
    else:
        print("✓ All countries have required fields")


if __name__ == '__main__':
    generate_countries()
