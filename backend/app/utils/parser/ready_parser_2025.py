import csv
import re
import tempfile
from typing import Dict, List, Optional, Tuple

import pandas as pd


class FlightDataParser:
    """Класс для парсинга данных полетов из CSV файла"""

    def extract_coordinates(self, coord_str: str) -> Optional[str]:
        """Извлечение координат из строки формата ГГММС(N/S)ДДДММС(E/W)"""
        if not coord_str:
            return None

        coord_pattern = r'(\d{2})(\d{2})([NS])(\d{3})(\d{2})([EW])'
        match = re.search(coord_pattern, coord_str)
        if match:
            lat_deg = int(match.group(1))
            lat_min = int(match.group(2))
            lat_dir = match.group(3)
            lon_deg = int(match.group(4))
            lon_min = int(match.group(5))
            lon_dir = match.group(6)

            lat_decimal = lat_deg + lat_min / 100.0
            lon_decimal = lon_deg + lon_min / 100.0

            if lat_dir == 'S':
                lat_decimal = -lat_decimal
            if lon_dir == 'W':
                lon_decimal = -lon_decimal

            return f"{lat_decimal:.2f} {lon_decimal:.2f}"

        return coord_str

    def extract_coordinates_from_text(self, text: str) -> List[str]:
        """Извлечение всех координат из любого текста"""
        if not text:
            return []

        coord_pattern_extended = r'(\d{6}[NS]\d{7}[EW])'
        coordinates_extended = re.findall(coord_pattern_extended, text)

        coord_pattern_normal = r'(\d{4}[NS]\d{5}[EW])'
        coordinates_normal = re.findall(coord_pattern_normal, text)

        all_coordinates = coordinates_extended + coordinates_normal

        converted_coords = []
        for coord in all_coordinates:
            converted = self.extract_coordinates_extended(coord)
            if not converted:
                converted = self.extract_coordinates(coord)
            if converted:
                converted_coords.append(converted)

        return converted_coords

    def extract_coordinates_extended(self, coord_str: str) -> Optional[str]:
        """Извлечение координат из расширенного формата ГГММСС(N/S)ДДДММСС(E/W)"""
        if not coord_str:
            return None

        coord_pattern = r'(\d{2})(\d{2})(\d{2})([NS])(\d{3})(\d{2})(\d{2})([EW])'
        match = re.search(coord_pattern, coord_str)
        if match:
            lat_deg = int(match.group(1))
            lat_min = int(match.group(2))
            lat_sec = int(match.group(3))
            lat_dir = match.group(4)
            lon_deg = int(match.group(5))
            lon_min = int(match.group(6))
            lon_sec = int(match.group(7))
            lon_dir = match.group(8)

            lat_decimal = lat_deg + lat_min / 60.0 + lat_sec / 3600.0
            lon_decimal = lon_deg + lon_min / 60.0 + lon_sec / 3600.0

            if lat_dir == 'S':
                lat_decimal = -lat_decimal
            if lon_dir == 'W':
                lon_decimal = -lon_decimal

            return f"{lat_decimal:.2f} {lon_decimal:.2f}"

        return self.extract_coordinates(coord_str)

    def extract_time(self, time_str: str) -> Optional[str]:
        """Извлечение времени в формате HHMM"""
        if not time_str or len(time_str) < 4:
            return None

        time_match = re.search(r'\d{4}', time_str)
        if time_match:
            time_val = time_match.group()
            return f"{time_val[:2]}:{time_val[2:]}"

        return None

    def extract_date(self, date_str: str) -> Optional[str]:
        """Извлечение даты в формате YYMMDD из DOF поля и конвертация в DD.MM.YY"""
        if not date_str:
            return None

        date_match = re.search(r'DOF/(\d{6})', date_str)
        if date_match:
            date_val = date_match.group(1)
        else:
            date_match = re.search(r'ADD (\d{6})', date_str)
            if date_match:
                date_val = date_match.group(1)
            else:
                return None

        if len(date_val) == 6:
            yy = date_val[:2]
            mm = date_val[2:4]
            dd = date_val[4:6]
            return f"{dd}.{mm}.{yy}"

        return None

    def extract_aircraft_type(self, rmk_str: str) -> str:
        """Извлечение типа воздушного судна из TYP поля"""
        if not rmk_str:
            return "Нет данных"

        typ_match = re.search(r'TYP/([A-Z0-9]+)', rmk_str)
        if typ_match:
            typ_code = typ_match.group(1)
            return typ_code

        return "Нет данных"

    def extract_flight_id(self, text: str) -> Optional[str]:
        """Извлечение ID полета из SID или REG поля"""
        sid_match = re.search(r'SID/(\d+)', text)
        if sid_match:
            return sid_match.group(1)

        sid_match = re.search(r'-SID (\d+)', text)
        if sid_match:
            return sid_match.group(1)

        reg_match = re.search(r'REG/([A-Z0-9,]+)', text)
        if reg_match:
            return reg_match.group(1)

        reg_match = re.search(r'-REG ([A-Z0-9,]+)', text)
        if reg_match:
            return reg_match.group(1)

        return None

    def parse_single_flight(self, region: str, flight_data: str, idep_data: str = "", iarr_data: str = "") -> Dict:
        """Парсинг данных одного полета"""

        all_data = f"{flight_data} {idep_data} {iarr_data}"

        flight_id = self.extract_flight_id(all_data)

        aircraft_type = self.extract_aircraft_type(flight_data)

        flight_date = self.extract_date(flight_data) or self.extract_date(idep_data)

        dep_coords = None
        dep_match = re.search(r'DEP/([^\s]+)', flight_data)
        if dep_match:
            dep_coords = self.extract_coordinates(dep_match.group(1))

        if not dep_coords:
            adepz_match = re.search(r'-ADEPZ ([^\n]+)', idep_data)
            if adepz_match:
                dep_coords = self.extract_coordinates(adepz_match.group(1))

        dest_coords = None
        dest_match = re.search(r'DEST/([^\s]+)', flight_data)
        if dest_match:
            dest_coords = self.extract_coordinates(dest_match.group(1))

        if not dest_coords:
            adarrz_match = re.search(r'-ADARRZ ([^\n]+)', iarr_data)
            if adarrz_match:
                dest_coords = self.extract_coordinates(adarrz_match.group(1))

        if not dep_coords or not dest_coords:
            rmk_match = re.search(r'RMK/(.+?)(?:SID/|$)', flight_data, re.DOTALL)
            rmk_coordinates = []
            if rmk_match:
                rmk_text = rmk_match.group(1)
                rmk_coordinates = self.extract_coordinates_from_text(rmk_text)

            if not rmk_coordinates:
                all_coordinates = self.extract_coordinates_from_text(flight_data)
            else:
                all_coordinates = rmk_coordinates

            if all_coordinates:
                if not dep_coords and all_coordinates:
                    dep_coords = all_coordinates[0]

                if not dest_coords and len(all_coordinates) > 1:
                    dest_coords = all_coordinates[-1]
                elif not dest_coords and len(all_coordinates) == 1:
                    dest_coords = all_coordinates[0]

        if dep_coords and not dest_coords:
            dest_coords = dep_coords
        elif dest_coords and not dep_coords:
            dep_coords = dest_coords

        dep_time = None
        arr_time = None

        zzzz_matches = re.findall(r'-ZZZZ(\d{4})', flight_data)
        if zzzz_matches:
            dep_time = self.extract_time(zzzz_matches[0])  # Первое время - взлет

        if len(zzzz_matches) >= 2:
            arr_time = self.extract_time(zzzz_matches[-1])  # Последнее время - посадка

        if not dep_time:
            atd_match = re.search(r'-ATD (\d{4})', idep_data)
            if atd_match:
                dep_time = self.extract_time(atd_match.group(1))

        if not arr_time:
            ata_match = re.search(r'-ATA (\d{4})', iarr_data)
            if ata_match:
                arr_time = self.extract_time(ata_match.group(1))

        return {
            'ID полета': flight_id or "Нет данных",
            'Тип БПЛА': aircraft_type,
            'Координаты взлета': dep_coords or "Нет данных",
            'Координаты посадки': dest_coords or "Нет данных",
            'Дата (DD.MM.YY)': flight_date or "Нет данных",
            'Время взлета (UTC)': dep_time or "Нет данных",
            'Время посадки (UTC)': arr_time or "Нет данных",
            'Регион': region
        }

    def parse_csv_file(self, csv_file_path: str) -> str:
        """Парсинг данных из CSV файла"""
        flights = []

        try:
            with open(csv_file_path, 'r', encoding='utf-8-sig', newline='') as file:
                csv_reader = csv.reader(file, delimiter=';')

                for row in csv_reader:
                    if len(row) >= 2:
                        region = row[0].strip()
                        flight_data = row[1].strip().strip('"') if len(row) > 1 else ""
                        idep_data = row[2].strip().strip('"') if len(row) > 2 else ""
                        iarr_data = row[3].strip().strip('"') if len(row) > 3 else ""

                        # Парсим полет
                        if region and flight_data:
                            flight_info = self.parse_single_flight(
                                region, flight_data, idep_data, iarr_data
                            )
                            flights.append(flight_info)

            df = pd.DataFrame(flights)
            with tempfile.TemporaryDirectory() as tmpdirname:
                parser_file = f"{tmpdirname}.csv"

            df.to_csv(parser_file, encoding='utf-8-sig', index=False)

        except FileNotFoundError:
            print(f"Файл {csv_file_path} не найден!")
            return []
        except Exception as e:
            print(f"Ошибка при чтении файла: {e}")
            return []

        return parser_file
