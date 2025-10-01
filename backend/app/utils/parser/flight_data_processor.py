import os

from backend.app.config import STATIC_DIR
from backend.app.constants import RUSSIA_FULL_POLYGON
from backend.app.utils.parser.add_id_to_csv import add_id_to_csv
from backend.app.utils.parser.add_time import add_duration_time
from backend.app.utils.parser.check_coord_final import process_csv_russian_priority
from backend.app.utils.parser.ready_parser_2025 import FlightDataParser
from backend.app.utils.parser.xls_to_csv import convert_xls_to_csv


def main(path_raw_data: str) -> str:
    """Основная функция обработки xls файла с данными о полетах."""
    try:
        csv_file_path = convert_xls_to_csv(path_raw_data)

        parser = FlightDataParser()
        parser_file = parser.parse_csv_file(csv_file_path)

        parser_file_with_duration = add_duration_time(parser_file)

        polygon_path = os.path.join(STATIC_DIR, RUSSIA_FULL_POLYGON)
        parser_file_check_coordinate = process_csv_russian_priority(
            parser_file_with_duration, polygon_path
        )

        data_ready_for_db = add_id_to_csv(parser_file_check_coordinate)

        return data_ready_for_db
    except Exception as e:
        print(e)
