import asyncio
import os

from fastapi import UploadFile
from fastapi.templating import Jinja2Templates
from sqladmin import BaseView, expose
from sqladmin import ModelView
from starlette.requests import Request
from starlette.responses import JSONResponse

from backend.app.admin.custom_converter import GeometryWKTField, format_coordinates
from backend.app.models import Flight, Region


current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(current_dir))
templates_dir = os.path.join(project_root, "templates")

templates = Jinja2Templates(directory=templates_dir)


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


class UploadView(BaseView):
    name = "Загрузить данные"
    icon = "fa-upload"

    @expose("/upload", methods=["GET"])
    async def upload_page(self, request: Request):
        """Страница загрузки файла"""
        return templates.TemplateResponse(
            "upload.html",
            context={"request": request}
        )

class UploadFileView(BaseView):
    name = "Загрузить файл"
    icon = "fa-file-upload"

    def is_accessible(self, request: Request) -> bool:
        return True

    def is_visible(self, request: Request) -> bool:
        return False

    @expose("/upload-file", methods=["POST"])
    async def upload_file(self, request: Request):
        """Обработчик загрузки файла"""
        try:
            form = await request.form()
            file = form.get("file")

            if not file or not hasattr(file, 'file'):
                return JSONResponse({
                    "success": False,
                    "message": "Файл не был загружен"
                }, status_code=400)

            filename = file.filename.lower()
            if not (filename.endswith('.xlsx') or filename.endswith('.xls') or filename.endswith('.csv')):
                return JSONResponse({
                    "success": False,
                    "message": "Неподдерживаемый формат файла. Используйте XLSX, XLS или CSV"
                }, status_code=400)

            result = await self.process_uploaded_file(file)

            return JSONResponse(result)

        except Exception as e:
            return JSONResponse({
                "success": False,
                "message": f"Ошибка при обработке файла: {str(e)}"
            }, status_code=500)

    async def process_uploaded_file(self, file: UploadFile):
        """
        Функция-заглушка для обработки загруженного файла
        В будущем здесь будет логика обработки Excel файла
        """
        try:
            print(f"Начинаем обработку файла: {file.filename}")
            await asyncio.sleep(3)

            # Здесь будет ваша логика обработки Excel
            result = {
                "success": True,
                "message": f"Файл '{file.filename}' успешно обработан! Обработано 15 записей.",
                "processed_records": 15,
                "file_info": {
                    "filename": file.filename,
                    "size": "~2.5 MB",
                    "type": "Excel"
                }
            }

            print(f"Обработка завершена: {result}")
            return result

        except Exception as e:
            print(f"Ошибка при обработке файла: {e}")
            return {
                "success": False,
                "message": f"Ошибка при обработке файла: {str(e)}"
            }
