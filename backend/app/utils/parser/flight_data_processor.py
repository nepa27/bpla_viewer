import os
import logging
from typing import Optional

from backend.app.config import STATIC_DIR
from backend.app.constants import RUSSIA_FULL_POLYGON
from backend.app.utils.parser.add_id_to_csv import add_id_to_csv
from backend.app.utils.parser.add_time import add_duration_time
from backend.app.utils.parser.check_coord_final import process_csv_russian_priority
from backend.app.utils.parser.ready_parser_2025 import FlightDataParser
from backend.app.utils.parser.xls_to_csv import convert_xls_to_csv
from backend.app.logging import log_function

logger = logging.getLogger(__name__)


@log_function(logger)
def main(path_raw_data: str) -> Optional[str]:
    """Основная функция обработки xls файла с данными о полетах."""
    try:
        logger.info(f"Начало обработки файла: {path_raw_data}")

        logger.info("Конвертация XLS в CSV")
        csv_file_path = convert_xls_to_csv(path_raw_data)
        logger.info(f"Файл успешно конвертирован в CSV: {csv_file_path}")

        logger.info("Парсинг данных полетов")
        parser = FlightDataParser()
        parser_file = parser.parse_csv_file(csv_file_path)
        logger.info("Данные полетов успешно распарсены")

        logger.info("Добавление расчета длительности полетов")
        parser_file_with_duration = add_duration_time(parser_file)
        logger.info("Длительность полетов успешно добавлена")

        logger.info("Проверка координат по полигону России")
        polygon_path = os.path.join(STATIC_DIR, RUSSIA_FULL_POLYGON)
        parser_file_check_coordinate = process_csv_russian_priority(
            parser_file_with_duration, polygon_path
        )
        logger.info("Координаты успешно проверены")

        logger.info("Добавление ID к записям")
        data_ready_for_db = add_id_to_csv(parser_file_check_coordinate)
        logger.info("ID успешно добавлены, данные готовы к загрузке в БД")

        return data_ready_for_db
    except Exception as e:
        logger.error(f"Ошибка при обработке файла: {str(e)}")
        raise
