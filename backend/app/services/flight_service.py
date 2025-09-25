import csv
from datetime import timedelta
import gzip
import os
import tempfile
from typing import List, Dict, Any, Tuple, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, engine

from app.models.flight import Flight
from app.models.region import Region


class FlightService:
    @staticmethod
    async def get_all_flights(
            db: AsyncSession,
            skip: int = 0,
            limit: int = 100
    ) -> Tuple[List[Dict[str, Any]], int]:
        """Получить все полеты из всех регионов с пагинацией"""
        total_count = await FlightService._get_count(db)

        result = await FlightService.get_data(db, skip, limit)

        flights = result.all()
        formatted_flights = FlightService._format_flights_data(flights)

        return formatted_flights, total_count

    @staticmethod
    async def get_flights_by_region(
            db: AsyncSession,
            region_id: int,
            skip: int = 0,
            limit: int = 100
    ) -> Tuple[List[Dict[str, Any]], int]:
        """Получить все полеты в конкретном регионе с пагинацией"""
        total_count = await FlightService._get_count(db, region_id)

        result = await FlightService.get_data(db, skip, limit, region_id)
        flights = result.all()
        formatted_flights = FlightService._format_flights_data(flights)

        return formatted_flights, total_count

    @staticmethod
    def _format_csv_value(value):
        """Форматирует значение для CSV"""
        if value is None:
            return "Нет данных"
        return str(value)

    @staticmethod
    def _format_coordinates(lat, lon):
        """Форматирует координаты в строку 'lat lon'"""
        if lat is None or lon is None:
            return "Нет данных"
        return f"{lat} {lon}"

    @staticmethod
    def _format_date_for_csv(flight_date):
        """Форматирует дату в DD.MM.YY для CSV"""
        if not flight_date:
            return "Нет данных"
        return flight_date.strftime("%d.%m.%y")

    @staticmethod
    def _format_time_for_csv(time_obj):
        """Форматирует время в HH:MM для CSV"""
        if not time_obj:
            return "Нет данных"
        return time_obj.strftime("%H:%M")

    @staticmethod
    def _format_duration(duration: timedelta):
        """Форматирует продолжительность в HH:MM для CSV"""
        if not duration:
            return "Нет данных"
        total_seconds = int(duration.total_seconds())
        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60
        return f"{hours:01d}:{minutes:02d}"

    @staticmethod
    def _format_flights_data(flights: list) -> list:
        formatted_flights: list = []
        for flight in flights:
            formatted_flights.append({
                "flight_id": flight.flight_id,
                "drone_type": flight.drone_type,
                "takeoff_lat": float(flight.takeoff_lat) if flight.takeoff_lat else None,
                "takeoff_lon": float(flight.takeoff_lon) if flight.takeoff_lon else None,
                "landing_lat": float(flight.landing_lat) if flight.landing_lat else None,
                "landing_lon": float(flight.landing_lon) if flight.landing_lon else None,
                "flight_date": flight.flight_date.strftime("%d.%m.%Y") if flight.flight_date else None,
                "takeoff_time": flight.takeoff_time.strftime("%H:%M:%S") if flight.takeoff_time else None,
                "landing_time": flight.landing_time.strftime("%H:%M:%S") if flight.landing_time else None,
                "flight_duration": FlightService._format_duration(flight.flight_duration),
                "region_name": flight.region_name
            })

        return formatted_flights

    @staticmethod
    async def get_data(
            db: AsyncSession,
            skip: Optional[int] = None,
            limit: Optional[int] = None,
            region_id: Optional[int] = None
    ) -> engine.result.ChunkedIteratorResult:
        query = (select(
            Flight.flight_id,
            Flight.drone_type,
            func.ST_Y(Flight.takeoff_coordinates).label('takeoff_lat'),
            func.ST_X(Flight.takeoff_coordinates).label('takeoff_lon'),
            func.ST_Y(Flight.landing_coordinates).label('landing_lat'),
            func.ST_X(Flight.landing_coordinates).label('landing_lon'),
            Flight.flight_date,
            Flight.takeoff_time,
            Flight.landing_time,
            Flight.flight_duration,
            Region.name.label('region_name')
        ).join(Region, Flight.region_id == Region.id, isouter=True)
        ).order_by(Flight.flight_date)
        # )
        if skip:
            query = query.offset(skip)
        if limit:
            query = query.limit(limit)
        if region_id:
            query = query.where(Flight.region_id == region_id)

        result = await db.execute(query)
        return result

    @staticmethod
    async def _get_count(db: AsyncSession, region_id: Optional[int] = None) -> int:
        query = select(func.count(Flight.flight_id))
        if region_id is not None:
            query = query.where(Flight.region_id == region_id)
        total_count_result = await db.execute(query)
        return total_count_result.scalar()

    @staticmethod
    def create_csv_gzip(flights_data) -> bytes:
        """Создает CSV и сжимает его с помощью внешней утилиты gzip для максимального сжатия"""

        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as csv_file:
            writer = csv.writer(csv_file)

            writer.writerow([
                'flight_id', 'drone_type', 'takeoff_coords', 'landing_coords',
                'flight_date', 'takeoff_time', 'landing_time', 'flight_duration', 'region_name'
            ])

            for flight in flights_data:
                takeoff_coords = FlightService._format_coordinates(
                    float(flight.takeoff_lat) if flight.takeoff_lat else None,
                    float(flight.takeoff_lon) if flight.takeoff_lon else None
                )

                landing_coords = FlightService._format_coordinates(
                    float(flight.landing_lat) if flight.landing_lat else None,
                    float(flight.landing_lon) if flight.landing_lon else None
                )

                writer.writerow([
                    FlightService._format_csv_value(flight.flight_id),
                    FlightService._format_csv_value(flight.drone_type),
                    takeoff_coords,
                    landing_coords,
                    FlightService._format_date_for_csv(flight.flight_date),
                    FlightService._format_time_for_csv(flight.takeoff_time),
                    FlightService._format_time_for_csv(flight.landing_time),
                    FlightService._format_duration(flight.flight_duration),
                    FlightService._format_csv_value(flight.region_name)
                ])

            csv_filename = csv_file.name

        try:
            gz_filename = csv_filename + '.gz'
            with open(csv_filename, 'rb') as f_in:
                with gzip.open(gz_filename, 'wb', compresslevel=9) as f_out:
                    f_out.writelines(f_in)

            with open(gz_filename, 'rb') as f:
                return f.read()

        finally:
            for temp_file in [csv_filename, gz_filename]:
                if os.path.exists(temp_file):
                    os.unlink(temp_file)
