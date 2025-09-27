from sqladmin import ModelView

from backend.app.admin.custom_converter import GeometryWKTField, format_coordinates
from backend.app.models import Flight, Region


class FlightAdmin(ModelView, model=Flight):
    name = "Полет"
    name_plural = "Полеты"

    column_list = [
        Flight.id,
        Flight.drone_type,
        Flight.takeoff_coordinates,
        Flight.landing_coordinates,
        Flight.flight_date,
        Flight.takeoff_time,
        Flight.landing_time,
        Flight.flight_duration,
        Flight.region_rel,
    ]

    form_columns = [
        'region_rel',
        'drone_type',
        'takeoff_coordinates',
        'landing_coordinates',
        'flight_date',
        'takeoff_time',
        'landing_time',
        'flight_duration',
    ]

    form_args = {
        'takeoff_coordinates': {
            'description': 'Введите координаты в формате WKT,'
                           ' например: POINT(30.5234 50.4501)'
        },
        'landing_coordinates': {
            'description': 'Введите координаты в формате WKT,'
                           ' например: POINT(30.5234 50.4501)'
        }
    }
    form_overrides = {
        "takeoff_coordinates": GeometryWKTField,
        "landing_coordinates": GeometryWKTField,
    }
    column_details_list = [
        Flight.id,
        Flight.drone_type,
        Flight.takeoff_coordinates,
        Flight.landing_coordinates,
        Flight.flight_date,
        Flight.takeoff_time,
        Flight.landing_time,
        Flight.flight_duration,
        Flight.region_rel,
    ]

    column_formatters = {
        'takeoff_coordinates': format_coordinates,
        'landing_coordinates': format_coordinates,
    }

    column_formatters_detail = {
        'takeoff_coordinates': format_coordinates,
        'landing_coordinates': format_coordinates,
    }

    column_labels = {
        'id': 'ID',
        'drone_type': 'Тип дрона',
        'flight_date': 'Дата полета',
        'takeoff_time': 'Время взлета',
        'landing_time': 'Время посадки',
        'flight_duration': 'Продолжительность полета',
        'flight_id': 'ID полета',
        'takeoff_coordinates': 'Координаты взлета',
        'landing_coordinates': 'Координаты посадки',
        'region_rel': 'Регион'
    }


class RegionAdmin(ModelView, model=Region):
    name = "Регион"
    name_plural = "Регионы"

    column_list = [
        Region.region_id,
        Region.name,
    ]

    form_columns = [
        'name',
    ]

    column_details_list = [
        Region.region_id,
        Region.name,
    ]

    column_labels = {
        'region_id': 'ID региона',
        'name': 'Название региона',
    }
    can_delete = False
    can_edit = False
    can_create = False
