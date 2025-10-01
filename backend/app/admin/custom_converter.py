import re
import struct

from geoalchemy2 import WKTElement
from wtforms import StringField, ValidationError
from wtforms.widgets import TextInput


class GeometryWKTField(StringField):
    widget = TextInput()

    def _value(self):
        if self.data is None:
            return ""
        try:
            if hasattr(self.data, "desc"):
                return self.data.desc
            return str(self.data)
        except Exception:
            return ""

    def process_formdata(self, valuelist):
        if valuelist:
            wkt_str = valuelist[0].strip()
            if wkt_str:
                if not re.match(r"^(POINT|LINESTRING|POLYGON)\s*\(", wkt_str.upper()):
                    raise ValidationError(
                        "Неверный формат WKT. Пример: POINT(30.5234 50.4501)"
                    )

                try:
                    self.data = WKTElement(wkt_str, srid=4326)
                except Exception as e:
                    raise ValidationError(f"Ошибка обработки координат: {e}")
            else:
                self.data = None
        else:
            self.data = None


def format_coordinates(model, value):
    """Форматирует координаты из WKB в строку 'lat, lon'"""
    field_value = getattr(model, value)

    if field_value is None:
        return "No coordinates"
    try:
        raw = bytes.fromhex(str(field_value))
        lon = struct.unpack("<d", raw[9:17])[0]
        lat = struct.unpack("<d", raw[17:25])[0]
        return f"{lat}, {lon}"
    except Exception as e:
        return f"Error: {e}"
