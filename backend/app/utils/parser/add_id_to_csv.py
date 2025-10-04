import csv
import json
import os
import tempfile

from backend.app.config import STATIC_DIR


def add_id_to_csv(input_file: str) -> str:
    """Добавляет столбец с region_id в csv файл."""
    polygon_path = os.path.join(STATIC_DIR, "russia_regions_id.geo.json")
    with open(polygon_path, "r", encoding="utf-8-sig") as f:
        data = json.load(f)

        region_with_id = {}

        for feature in data["features"]:
            region_with_id[feature["properties"]["region"]] = feature["properties"][
                "region_id"
            ]

    with (
        open(input_file, "r", encoding="utf-8-sig", newline="") as infile,
        tempfile.NamedTemporaryFile(
            "w", newline="", encoding="utf-8-sig", delete=False
        ) as outfile,
    ):
        csv_reader = csv.reader(infile)
        csv_writer = csv.writer(outfile)

        next(csv_reader, None)

        for row in csv_reader:
            try:
                row.append(region_with_id[row[-1]])
            except KeyError:
                # TODO: Fix hardcoded region_id for unknown regions
                row.append("91")

            csv_writer.writerow(row)

    return outfile.name
