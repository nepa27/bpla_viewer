import os

import openpyxl
from fastapi import HTTPException
from starlette import status

from backend.app.config import STATIC_DIR
from backend.app.constants import (
    PATH_TO_TEMPLATE_EXCEL,
    WORD_NAME_OF_REGION,
    WORD_COUNT_OF_FLIGHT, NUMBER_OF_ROW
)
from backend.app.logging import logger


def add_data_to_xlsx(data: list) -> str:
    template_excel_path = os.path.join(STATIC_DIR, PATH_TO_TEMPLATE_EXCEL)

    data_d: dict = {}

    if not os.path.exists(template_excel_path):
        logger.error(f"Файл шаблона: {template_excel_path}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template file not found",
        )

    book = openpyxl.load_workbook(template_excel_path)
    sheet = book.active
    count_rows = len(data) + NUMBER_OF_ROW

    for i in data:
        data_d[i[0]] = i[1]

    for i in range(NUMBER_OF_ROW, count_rows):
        if sheet[f'{WORD_NAME_OF_REGION + str(i)}'].value in data_d:
            sheet[f'{WORD_COUNT_OF_FLIGHT + str(i)}'].value = data_d[sheet[f'{WORD_NAME_OF_REGION + str(i)}'].value]

    book.save(template_excel_path)
    book.close()

    return template_excel_path
