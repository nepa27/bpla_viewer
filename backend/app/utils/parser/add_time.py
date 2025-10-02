import csv
from datetime import datetime, timedelta
import tempfile


def parse_time(time_str):
    """Парсит время в формате HH:MM, включая 24:00"""
    if time_str == "24:00":
        return datetime.strptime("00:00", "%H:%M"), True
    return datetime.strptime(time_str, "%H:%M"), False


def calculate_flight_time(takeoff_time, landing_time):
    """Вычисляет время полета в формате HH:MM"""
    try:
        takeoff, takeoff_next_day = parse_time(takeoff_time)
        landing, landing_next_day = parse_time(landing_time)

        days = 0
        if landing_next_day:
            days += 1
        if takeoff_next_day:
            days -= 1

        if landing < takeoff or landing_next_day:
            days += 1

        landing = landing + timedelta(days=days)
        flight_time = landing - takeoff

        hours = flight_time.seconds // 3600
        minutes = (flight_time.seconds % 3600) // 60

        return f"{hours:02d}:{minutes:02d}"
    except (ValueError, TypeError):
        return "Нет данных"


def add_duration_time(input_file):
    """Обрабатывает CSV файл и добавляет время полета, сохраняет в tempfile"""
    with (
        open(input_file, "r", encoding="utf-8") as infile,
        tempfile.NamedTemporaryFile(
            "w", newline="", encoding="utf-8-sig", delete=False
        ) as outfile,
    ):
        reader = csv.reader(infile)
        writer = csv.writer(outfile)

        for row in reader:
            if len(row) >= 8:
                if (
                    row[5] not in ["Нет данных", ""]
                    and row[6] not in ["Нет данных", ""]
                    and row[5] is not None
                    and row[6] is not None
                ):
                    flight_time = calculate_flight_time(row[5], row[6])
                else:
                    flight_time = "Нет данных"

                new_row = row[:7] + [flight_time] + row[7:]
                writer.writerow(new_row)
            else:
                flight_time = "Нет данных"
                new_row = row + [flight_time] + ([""] * (8 - len(row)))
                writer.writerow(new_row)

    return outfile.name
