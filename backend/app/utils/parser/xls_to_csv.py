import tempfile

import pandas as pd


def convert_xls_to_csv(xlsx_path):
    """Конвертация xls/xlsx файла в csv."""

    xlsx = pd.ExcelFile(xlsx_path)
    sheet_names = xlsx.sheet_names


    df = pd.read_excel(xlsx_path, sheet_name=sheet_names[0], dtype=str)

    with tempfile.TemporaryDirectory() as tmpdirname:
        csv_file_name = f"{tmpdirname}.csv"

    df.to_csv(csv_file_name, encoding='utf-8-sig', index=False, sep=';')

    return csv_file_name
