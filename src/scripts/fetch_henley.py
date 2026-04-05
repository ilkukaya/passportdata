"""
Henley Passport Index sıralamasını günceller.
Not: Henley resmi API sunmadığı için, bu script statik veriyi günceller
veya alternatif kaynaklardan çeker.
"""
import json
from datetime import datetime
from pathlib import Path

DATA_DIR = Path('src/data')


def fetch_henley():
    """Henley Passport Index verilerini günceller."""
    ranking_file = DATA_DIR / 'passport_ranking.json'

    if ranking_file.exists():
        with open(ranking_file, 'r', encoding='utf-8') as f:
            ranking = json.load(f)
    else:
        ranking = {}

    # Henley verisi genellikle yılda bir güncellenir
    # Otomatik scraping yerine, CSV datasından visa_free sayısını hesapla
    matrix_file = DATA_DIR / 'visa_matrix.json'
    if matrix_file.exists():
        with open(matrix_file, 'r', encoding='utf-8') as f:
            matrix = json.load(f)

        # Her pasaport için visa_free + visa_on_arrival sayısını hesapla
        scores = {}
        for country, destinations in matrix.get('data', {}).items():
            vf = sum(1 for d in destinations.values()
                     if d.get('status') in ('visa_free', 'visa_on_arrival'))
            scores[country] = vf

        # Sırala ve rank ata
        sorted_countries = sorted(scores.items(), key=lambda x: -x[1])
        current_rank = 0
        prev_score = -1
        for i, (country, score) in enumerate(sorted_countries):
            if score != prev_score:
                current_rank = i + 1
                prev_score = score
            if country in ranking:
                ranking[country]['rank'] = current_rank
                ranking[country]['total'] = score
            else:
                ranking[country] = {
                    'rank': current_rank,
                    'total': score,
                    'country': country
                }

        with open(ranking_file, 'w', encoding='utf-8') as f:
            json.dump(ranking, f, ensure_ascii=False, indent=2)

        print(f"✓ passport_ranking.json updated ({len(ranking)} countries)")
    else:
        print("⚠ visa_matrix.json not found, skipping ranking update")


if __name__ == '__main__':
    fetch_henley()
