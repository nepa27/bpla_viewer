import csv
from collections import defaultdict
import json
import tempfile

from shapely.geometry import Point, Polygon


class AdvancedRegionFinder:
    """Класс для поиска регионов в России с улучшенными методами"""

    def __init__(self, geojson_file):
        self.geojson_data = self.load_geojson_data(geojson_file)
        self.region_polygons = self.create_region_polygons()
        self.setup_advanced_methods()

    def load_geojson_data(self, filename):
        """Загрузка GeoJSON данных"""
        with open(filename, "r", encoding="utf-8") as f:
            return json.load(f)

    def create_region_polygons(self):
        """Создание полигонов с улучшенной обработкой"""
        regions = {}

        for feature in self.geojson_data["features"]:
            geometry = feature["geometry"]
            properties = feature.get("properties", {})

            region_name = (
                properties.get("name")
                or properties.get("region")
                or properties.get("NAME")
                or properties.get("federal_district")
                or properties.get("subject")
                or "Неизвестный регион"
            )

            region_polygons = []

            try:
                if geometry["type"] == "Polygon":
                    for polygon_coords in geometry["coordinates"]:
                        if len(polygon_coords) >= 3:
                            coords = [
                                (float(coord[0]), float(coord[1]))
                                for coord in polygon_coords
                            ]
                            polygon = Polygon(coords)
                            if polygon.is_valid:
                                region_polygons.append(polygon)

                elif geometry["type"] == "MultiPolygon":
                    for multi_poly in geometry["coordinates"]:
                        for polygon_coords in multi_poly:
                            if len(polygon_coords) >= 3:
                                coords = [
                                    (float(coord[0]), float(coord[1]))
                                    for coord in polygon_coords
                                ]
                                polygon = Polygon(coords)
                                if polygon.is_valid:
                                    region_polygons.append(polygon)

            except Exception as e:
                print(f"Ошибка создания полигона для {region_name}: {e}")
                continue

            if region_polygons:
                regions[region_name] = {
                    "polygons": region_polygons,
                    "bbox": self.calculate_bbox(region_polygons),
                    "center": self.calculate_center(region_polygons),
                }

        return regions

    def calculate_bbox(self, polygons):
        """Вычисление bounding box для региона"""
        all_coords = []
        for polygon in polygons:
            all_coords.extend(polygon.exterior.coords)
        lons = [coord[0] for coord in all_coords]
        lats = [coord[1] for coord in all_coords]
        return (min(lons), min(lats), max(lons), max(lats))

    def calculate_center(self, polygons):
        """Вычисление центра региона"""
        all_coords = []
        for polygon in polygons:
            all_coords.extend(polygon.exterior.coords)
        lons = [coord[0] for coord in all_coords]
        lats = [coord[1] for coord in all_coords]
        return (sum(lons) / len(lons), sum(lats) / len(lats))

    def setup_advanced_methods(self):
        """Настройка дополнительных методов поиска"""
        self.region_index = []
        for name, data in self.region_polygons.items():
            bbox = data["bbox"]
            self.region_index.append((bbox, name))

        # Приграничные зоны и их российские соседи
        self.border_zones = {
            # Граница с Латвией -> Псковская область
            (57.0, 27.0): "Псковская область",
            (57.5, 27.5): "Псковская область",
            # Граница с Эстонией -> Ленинградская область
            (59.0, 27.5): "Ленинградская область",
            # Граница с Финляндией -> Республика Карелия
            (69.0, 28.0): "Республика Карелия",
            # Граница с Норвегией -> Мурманская область
            (69.5, 30.0): "Мурманская область",
            # Граница с Украиной -> Ростовская область, Белгородская область
            (49.0, 36.0): "Белгородская область",
            (47.0, 39.0): "Ростовская область",
            # Граница с Казахстаном -> Астраханская область, Оренбургская область
            (48.0, 46.0): "Астраханская область",
            (51.0, 54.0): "Оренбургская область",
            # Граница с Китаем -> Приморский край, Амурская область
            (45.0, 131.0): "Приморский край",
            (53.0, 123.0): "Амурская область",
        }

        # Расширенные географические эвристики
        self.extended_heuristics = [
            # Северо-Западный ФО
            {"bbox": (27.0, 56.0, 32.0, 61.0), "region": "Ленинградская область"},
            {"bbox": (27.0, 56.0, 31.0, 59.0), "region": "Псковская область"},
            {"bbox": (28.0, 57.0, 30.0, 58.0), "region": "Псковская область"},
            # Центральный ФО
            {"bbox": (35.0, 54.0, 40.0, 57.0), "region": "Московская область"},
            {"bbox": (36.0, 55.0, 38.0, 56.0), "region": "Москва"},
            # Дальний Восток - приграничные зоны
            {"bbox": (130.0, 42.0, 140.0, 50.0), "region": "Приморский край"},
            {"bbox": (120.0, 50.0, 140.0, 60.0), "region": "Республика Саха (Якутия)"},
        ]

    def point_in_bbox(self, point, bbox):
        """Проверка точки в bounding box"""
        lon, lat = point.x, point.y
        return bbox[0] <= lon <= bbox[2] and bbox[1] <= lat <= bbox[3]

    def find_region_exact(self, lat, lon):
        """Точный поиск по полигонам"""
        point = Point(lon, lat)

        candidate_regions = []
        for bbox, name in self.region_index:
            if self.point_in_bbox(point, bbox):
                candidate_regions.append(name)

        for name in candidate_regions:
            for polygon in self.region_polygons[name]["polygons"]:
                if polygon.contains(point):
                    return name

        return None

    def find_region_proximity(self, lat, lon, max_distance=1.0):
        """Поиск по близости с улучшенным алгоритмом"""
        point = Point(lon, lat)
        best_region = None
        min_distance = float("inf")

        for name, data in self.region_polygons.items():
            for polygon in data["polygons"]:
                try:
                    distance = point.distance(polygon)
                    if distance < min_distance:
                        min_distance = distance
                        best_region = name
                except Exception:
                    continue

        return best_region if min_distance < max_distance else None

    def find_region_border_zone(self, lat, lon):
        """Поиск в приграничных зонах - ВСЕГДА возвращает российский регион"""

        # Проверка приграничных зон
        for zone_coords, region in self.border_zones.items():
            zone_lat, zone_lon = zone_coords
            if abs(lat - zone_lat) < 2.0 and abs(lon - zone_lon) < 2.0:
                return region

        # Расширенные эвристики для приграничных территорий
        if 56.0 < lat < 58.0 and 26.0 < lon < 28.0:  # Граница с Латвией
            return "Псковская область"
        elif 59.0 < lat < 60.0 and 27.0 < lon < 29.0:  # Граница с Эстонией
            return "Ленинградская область"
        elif 68.0 < lat < 70.0 and 28.0 < lon < 32.0:  # Граница с Финляндией
            return "Республика Карелия"
        elif 69.0 < lat < 70.0 and 29.0 < lon < 33.0:  # Граница с Норвегией
            return "Мурманская область"
        elif 48.0 < lat < 50.0 and 45.0 < lon < 48.0:  # Граница с Казахстаном
            return "Астраханская область"
        elif 44.0 < lat < 46.0 and 131.0 < lon < 134.0:  # Граница с Китаем
            return "Приморский край"

        return None

    def find_region_extended_heuristics(self, lat, lon):
        """Расширенные географические эвристики"""
        point = Point(lon, lat)

        for heuristic in self.extended_heuristics:
            if self.point_in_bbox(point, heuristic["bbox"]):
                return heuristic["region"]

        if 55.5 < lat < 56.0 and 37.0 < lon < 38.0:
            return "Москва"
        elif 55.0 < lat < 57.0 and 36.0 < lon < 40.0:
            return "Московская область"
        elif 59.0 < lat < 61.0 and 28.0 < lon < 32.0:
            if 59.8 < lat < 60.0 and 29.8 < lon < 30.5:
                return "Санкт-Петербург"
            return "Ленинградская область"
        elif 43.0 < lat < 45.0 and 39.0 < lon < 42.0:
            return "Краснодарский край"
        elif 68.0 < lat < 70.0 and 85.0 < lon < 90.0:
            return "Красноярский край"

        return None

    def find_region_russian_priority(self, lat, lon):
        """Главный метод поиска с приоритетом российских регионов"""
        methods = [
            self.find_region_exact,  # 1. Точный поиск
            self.find_region_border_zone,  # 2. Приграничные зоны (российские регионы)
            lambda lat, lon: self.find_region_proximity(
                lat, lon, 0.5
            ),  # 3. Близкие регионы
            self.find_region_extended_heuristics,  # 4. Расширенные эвристики
            lambda lat, lon: self.find_region_proximity(
                lat, lon, 1.0
            ),  # 5. Более дальние регионы
        ]

        for method in methods:
            try:
                result = method(lat, lon)
                if result:
                    return result
            except Exception:
                continue

        # 6. Финальная попытка - ближайший российский регион (даже если далеко)
        point = Point(lon, lat)
        best_region = None
        min_distance = float("inf")

        for name, data in self.region_polygons.items():
            for polygon in data["polygons"]:
                try:
                    distance = point.distance(polygon)
                    if distance < min_distance:
                        min_distance = distance
                        best_region = name
                except Exception:
                    continue

        return best_region if best_region else "Регион не найден"


def parse_coordinates(coord_str):
    """Улучшенный парсинг координат"""
    if not coord_str or coord_str == "Нет данных":
        return None, None

    try:
        clean_str = coord_str.strip("()[]").replace(",", " ").replace(";", " ")
        parts = [p for p in clean_str.split() if p]

        if len(parts) >= 2:
            lat = float(parts[0])
            lon = float(parts[1])
            return lat, lon

    except Exception:
        pass

    return None, None


def process_csv_russian_priority(input_csv, geojson_file):
    """Обработка с приоритетом российских регионов"""
    finder = AdvancedRegionFinder(geojson_file)

    with (
        open(input_csv, "r", encoding="utf-8") as infile,
        tempfile.NamedTemporaryFile(
            "w", newline="", encoding="utf-8", delete=False
        ) as outfile,
    ):
        reader = csv.reader(infile)
        writer = csv.writer(outfile)

        header = next(reader)
        region_index = header.index("Регион")
        takeoff_coords_index = header.index("Координаты взлета")

        writer.writerow(header)

        stats = defaultdict(int)

        for row in reader:
            if len(row) <= max(region_index, takeoff_coords_index):
                writer.writerow(row)
                stats["Ошибка формата"] += 1
                continue

            takeoff_coord_str = row[takeoff_coords_index]
            lat, lon = parse_coordinates(takeoff_coord_str)

            if lat is not None and lon is not None:
                region = finder.find_region_russian_priority(lat, lon)
                row[region_index] = region
                stats["Успешно"] += 1
            else:
                row[region_index] = "Неверные координаты"
                stats["Ошибка парсинга"] += 1

            writer.writerow(row)

        return outfile.name
