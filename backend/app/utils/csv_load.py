import csv
from datetime import datetime, timedelta
from os import getenv

from dotenv import load_dotenv
from geoalchemy2 import WKTElement
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import text, select

from backend.app.models.flight import Flight
from backend.app.models.region import Region
from backend.app.logging import log_function, logger



@log_function(logger)
def parse_coordinates(coord_str):
    """Парсит строку координат вида 'lat lon' и возвращает WKT POINT. Возвращает None для 'Нет данных'."""
    coord_str = coord_str.strip()
    if coord_str.lower() in ["нет данных", "нет_данных", "", "null"]:
        logger.info(f"Получено пустое значение координат: '{coord_str}'")
        return None
    try:
        lat_str, lon_str = coord_str.split()
        lat = float(lat_str)
        lon = float(lon_str)
        logger.debug(f"Успешно распарсены координаты: lat={lat}, lon={lon}")
        return f"POINT({lon} {lat})"
    except (ValueError, IndexError) as e:
        logger.error(f"Ошибка парсинга координат '{coord_str}': {e}")
        return None


@log_function(logger)
def parse_duration(duration_str):
    """Парсит строку длительности вида 'HH:MM' в объект timedelta. Возвращает None для 'Нет данных'."""
    duration_str = duration_str.strip()
    if duration_str.lower() in ["нет данных", "нет_данных", "", "null"]:
        logger.info(f"Получено пустое значение длительности: '{duration_str}'")
        return None
    try:
        parts = duration_str.split(":")
        if len(parts) != 2:
            raise ValueError("Неверный формат длительности")
        hours = int(parts[0])
        minutes = int(parts[1])
        result = timedelta(hours=hours, minutes=minutes)
        logger.debug(f"Успешно распарсена длительность: {result}")
        return result
    except (ValueError, IndexError) as e:
        logger.error(f"Ошибка парсинга длительности '{duration_str}': {e}")
        return None


@log_function(logger)
def parse_time(time_str):
    """Парсит строку времени вида 'HH:MM' в объект time. Возвращает None для 'Нет данных'."""
    time_str = time_str.strip()
    if time_str.lower() in ["нет данных", "нет_данных", "", "null"]:
        logger.info(f"Получено пустое значение времени: '{time_str}'")
        return None

    try:
        if time_str == "24:00":
            return datetime.strptime("00:00", "%H:%M").time()

        return datetime.strptime(time_str, "%H:%M").time()
    except ValueError as e:
        logger.error(f"Ошибка парсинга времени '{time_str}': {e}")
        return None


@log_function(logger)
def parse_date(date_str):
    """Парсит строку даты вида 'DD.MM.YY' в объект date. Возвращает None для 'Нет данных'."""
    date_str = date_str.strip()
    if date_str.lower() in ["нет данных", "нет_данных", "", "null"]:
        logger.info(f"Получено пустое значение даты: '{date_str}'")
        return None
    try:
        result = datetime.strptime(date_str, "%d.%m.%y").date()
        logger.debug(f"Успешно распарсена дата: {result}")
        return result
    except ValueError as e:
        logger.error(f"Ошибка парсинга даты '{date_str}': {e}")
        return None


@log_function(logger)
def parse_drone_type(drone_type_str):
    """Парсит тип дрона, обрабатывает 'Нет данных'."""
    drone_type_str = drone_type_str.strip()
    if drone_type_str.lower() in ["нет данных", "нет_данных", "", "null"]:
        logger.info(f"Получен пустой тип дрона: '{drone_type_str}'")
        return "Неизвестный"
    logger.debug(f"Успешно определен тип дрона: {drone_type_str}")
    return drone_type_str


@log_function(logger)
async def load_csv_to_db(csv_file_path, db_engine):
    """Асинхронно загружает данные из CSV в базу данных."""
    logger.info(f"Начало загрузки данных из файла: {csv_file_path}")
    AsyncSessionLocal = async_sessionmaker(bind=db_engine, expire_on_commit=False)

    async with AsyncSessionLocal() as session:
        try:
            with open(csv_file_path, "r", encoding="utf-8") as csvfile:
                reader = csv.reader(csvfile)
                logger.info("Файл CSV успешно открыт")

                first_row = next(reader, None)
                if first_row and first_row[0].lower() == "flight_id":
                    logger.info("Пропущена строка заголовка")
                elif first_row:
                    rows_to_process = [first_row]
                    rows_to_process.extend(list(reader))
                    reader = iter(rows_to_process)

                for row_num, row in enumerate(reader):
                    if len(row) < 9:
                        logger.warning(
                            f"Строка {row_num + 1} пропущена: недостаточно полей ({len(row)})"
                        )
                        continue

                    flight_id = row[0].strip()
                    logger.info(f"Обработка полета ID: {flight_id}")

                    (
                        flight_id,
                        drone_type_str,
                        takeoff_coords_str,
                        landing_coords_str,
                        flight_date_str,
                        takeoff_time_str,
                        landing_time_str,
                        flight_duration_str,
                        region_name,
                        region_id,
                    ) = row[:10]

                    takeoff_wkt = parse_coordinates(takeoff_coords_str)
                    landing_wkt = parse_coordinates(landing_coords_str)
                    flight_date = parse_date(flight_date_str)
                    takeoff_time_obj = parse_time(takeoff_time_str)
                    landing_time_obj = parse_time(landing_time_str)
                    flight_duration = parse_duration(flight_duration_str)
                    drone_type = parse_drone_type(drone_type_str)

                    region_name = region_name.strip()

                    result = await session.execute(
                        select(Region).filter(Region.name == region_name)
                    )
                    region = result.scalars().first()

                    if not region:
                        logger.info(f"Создан новый регион: {region_name}")
                        region = Region(name=region_name, region_id=int(region_id))
                        session.add(region)
                        await session.flush()

                    result = await session.execute(
                        select(Flight).filter(Flight.flight_id == flight_id)
                    )
                    existing_flight = result.scalars().first()

                    if existing_flight:
                        logger.info(f"Полет с ID {flight_id} уже существует. Пропущен.")
                        continue

                    flight_params = {
                        "flight_id": flight_id.strip(),
                        "drone_type": drone_type,
                        "takeoff_coordinates": text(
                            f"ST_GeomFromText('{takeoff_wkt}', 4326)"
                        ),
                        "flight_date": flight_date,
                        "takeoff_time": takeoff_time_obj,
                        "region_id": region.region_id,
                    }

                    if takeoff_wkt:
                        flight_params["takeoff_coordinates"] = WKTElement(
                            takeoff_wkt, srid=4326
                        )
                    else:
                        flight_params["takeoff_coordinates"] = None

                    if landing_wkt:
                        flight_params["landing_coordinates"] = WKTElement(
                            landing_wkt, srid=4326
                        )
                    else:
                        flight_params["landing_coordinates"] = None

                    if landing_time_obj:
                        flight_params["landing_time"] = landing_time_obj
                    if flight_duration:
                        flight_params["flight_duration"] = flight_duration

                    new_flight = Flight(**flight_params)
                    session.add(new_flight)
                    logger.info(f"Добавлен новый полет: {flight_id}")

                await session.commit()
                logger.info("Загрузка данных завершена успешно")

        except FileNotFoundError:
            logger.error(f"Ошибка: Файл {csv_file_path} не найден")
            await session.rollback()
        except SQLAlchemyError as e:
            logger.error(f"Ошибка базы данных при загрузке: {str(e)}")
            await session.rollback()
        except Exception as e:
            logger.error(f"Произошла неожиданная ошибка при загрузке: {str(e)}")
            await session.rollback()


@log_function(logger)
async def main(csv_path):
    logger.info("Запуск процесса загрузки CSV")
    load_dotenv()

    DB_HOST = getenv("DB_HOST", "localhost")
    DB_PORT = getenv("DB_PORT", "5432")
    DB_USER = getenv("DB_USER", "postgres")
    DB_PASS = getenv("DB_PASS", "password")
    DB_NAME = getenv("DB_NAME", "flight_db")

    DATABASE_URL = f"postgresql+asyncpg://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    logger.info(f"Подключение к базе данных: {DB_HOST}:{DB_PORT}/{DB_NAME}")

    engine = create_async_engine(DATABASE_URL, echo=False)

    await load_csv_to_db(csv_path, engine)
    await engine.dispose()
    logger.info("Процесс загрузки CSV завершен")
