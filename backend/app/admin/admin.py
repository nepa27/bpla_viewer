import os
import tempfile

from fastapi import UploadFile
from fastapi.templating import Jinja2Templates
from sqladmin import BaseView, expose
from sqladmin import ModelView
from starlette.requests import Request
from starlette.responses import JSONResponse

from backend.app.admin.custom_converter import GeometryWKTField, format_coordinates
from backend.app.models import Flight, Region
from backend.app.utils.csv_load import main as csv_load
from backend.app.utils.parser.flight_data_processor import main as xlsx_load


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
        Обрабатывает файл и загружает данные в базу.
        Возвращает результат обработки.
        """
        try:
            suffix = file.filename.rsplit('.', 1)[-1]
            with tempfile.NamedTemporaryFile(
                    delete=False,
                    suffix=suffix
            ) as tmp_file:
                tmp_path = tmp_file.name

                contents = await file.read()
                tmp_file.write(contents)

            print(f"Файл сохранен во временное расположение: {tmp_path}")

            try:
                if suffix in ['xlsx', 'xls']:
                    ready_csv = xlsx_load(tmp_path)
                    await csv_load(ready_csv)
                else:
                    await csv_load(tmp_path)

                result = {
                    "success": True,
                    "message": f"Файл '{file.filename}' успешно обработан и данные загружены в базу!",
                    "file_info": {
                        "filename": file.filename,
                        "size": f"{len(contents) / 1024 / 1024:.2f} MB",
                        "type": "CSV"
                    }
                }

                return result

            except Exception as e:
                print(f"Ошибка в функции main(): {e}")
                return {
                    "success": False,
                    "message": f"Ошибка при обработке данных: {str(e)}"
                }

            finally:
                if os.path.exists(tmp_path):
                    os.unlink(tmp_path)
                    print(f"Временный файл удален: {tmp_path}")

        except Exception as e:
            print(f"Ошибка при сохранении файла: {e}")
            return {
                "success": False,
                "message": f"Ошибка при сохранении файла: {str(e)}"
            }
        finally:
            await file.close()
