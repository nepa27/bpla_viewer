import csv
from datetime import timedelta, date
import gzip
from io import StringIO, BytesIO
from typing import Optional

import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, engine

from backend.app.models.flight import Flight
from backend.app.models.region import Region
from backend.app.logging import log_function, logger


class FlightService:
    @staticmethod
    @log_function(logger)
    def _format_csv_value(value):
        """Форматирует значение для CSV"""
        if value is None:
            return "Нет данных"
        return str(value)

    @staticmethod
    @log_function(logger)
    def _format_coordinates(lat, lon):
        """Форматирует координаты в строку 'lat lon'"""
        if lat is None or lon is None:
            return "Нет данных"
        return f"{lat} {lon}"

    @staticmethod
    @log_function(logger)
    def _format_date_for_csv(flight_date):
        """Форматирует дату в DD.MM.YY для CSV"""
        if not flight_date:
            return "Нет данных"
        return flight_date.strftime("%d.%m.%y")

    @staticmethod
    @log_function(logger)
    def _format_time_for_csv(time_obj):
        """Форматирует время в HH:MM для CSV"""
        if not time_obj:
            return "Нет данных"
        return time_obj.strftime("%H:%M")

    @staticmethod
    @log_function(logger)
    def _format_duration(duration: timedelta):
        """Форматирует продолжительность в HH:MM для CSV"""
        if not duration:
            return "Нет данных"
        total_seconds = int(duration.total_seconds())
        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60
        return f"{hours:01d}:{minutes:02d}"

    @staticmethod
    async def get_data(
        db: AsyncSession,
        skip: Optional[int] = None,
        limit: Optional[int] = None,
        region_id: Optional[int] = None,
        from_date: Optional[date] = None,
        to_date: Optional[date] = None,
    ) -> engine.result.ChunkedIteratorResult:
        query = (
            select(
                Flight.flight_id,
                Flight.drone_type,
                func.ST_Y(Flight.takeoff_coordinates).label("takeoff_lat"),
                func.ST_X(Flight.takeoff_coordinates).label("takeoff_lon"),
                func.ST_Y(Flight.landing_coordinates).label("landing_lat"),
                func.ST_X(Flight.landing_coordinates).label("landing_lon"),
                Flight.flight_date,
                Flight.takeoff_time,
                Flight.landing_time,
                Flight.flight_duration,
                Region.name.label("region_name"),
            ).join(Region, Flight.region_id == Region.region_id, isouter=True)
        ).order_by(Flight.flight_date)
        if from_date:
            query = query.where(Flight.flight_date >= from_date)
        if to_date:
            query = query.where(Flight.flight_date <= to_date)
        if skip:
            query = query.offset(skip)
        if limit:
            query = query.limit(limit)
        if region_id:
            query = query.where(Flight.region_id == region_id)

        result = await db.execute(query)
        return result

    @staticmethod
    async def create_csv_gzip_async(flights_data) -> bytes:
        """Асинхронное создание CSV и сжатие"""

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None, FlightService.create_csv_gzip_sync, flights_data
        )

    @staticmethod
    def create_csv_gzip_sync(flights_data) -> bytes:
        """Синхронная версия для executor"""
        csv_buffer = StringIO()
        writer = csv.writer(csv_buffer)

        writer.writerow(
            [
                "flight_id",
                "drone_type",
                "takeoff_coords",
                "landing_coords",
                "flight_date",
                "takeoff_time",
                "landing_time",
                "flight_duration",
                "region_name",
            ]
        )

        for flight in flights_data:
            takeoff_coords = FlightService._format_coordinates(
                float(flight.takeoff_lat) if flight.takeoff_lat else None,
                float(flight.takeoff_lon) if flight.takeoff_lon else None,
            )

            landing_coords = FlightService._format_coordinates(
                float(flight.landing_lat) if flight.landing_lat else None,
                float(flight.landing_lon) if flight.landing_lon else None,
            )

            writer.writerow(
                [
                    FlightService._format_csv_value(flight.flight_id),
                    FlightService._format_csv_value(flight.drone_type),
                    takeoff_coords,
                    landing_coords,
                    FlightService._format_date_for_csv(flight.flight_date),
                    FlightService._format_time_for_csv(flight.takeoff_time),
                    FlightService._format_time_for_csv(flight.landing_time),
                    FlightService._format_duration(flight.flight_duration),
                    FlightService._format_csv_value(flight.region_name),
                ]
            )

        gz_buffer = BytesIO()
        with gzip.GzipFile(fileobj=gz_buffer, mode="wb", compresslevel=9) as f_out:
            f_out.write(csv_buffer.getvalue().encode("utf-8"))

        return gz_buffer.getvalue()
