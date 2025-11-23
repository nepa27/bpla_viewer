from datetime import date
from typing import Optional
from pathlib import Path

import asyncio
import aiofiles
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.constants import PATH_TO_CACHES
from backend.app.services.flight_service import FlightService
from backend.app.models.region import Region
from backend.app.logging import logger


class FlightCacheManager:
    def __init__(self, cache_dir: str = PATH_TO_CACHES):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(exist_ok=True)
        self._lock = asyncio.Lock()

    def _get_cache_key(self, region_id: Optional[int] = None,
                       from_date: Optional[date] = None,
                       to_date: Optional[date] = None) -> str:
        """Генерация ключа для кэша"""
        key_parts = []

        if region_id:
            key_parts.append(f"region_{region_id}")
        else:
            key_parts.append("all_regions")

        if from_date:
            key_parts.append(f"from_{from_date}")
        if to_date:
            key_parts.append(f"to_{to_date}")

        return "_".join(key_parts) + ".csv.gz"

    def get_cache_file_path(self, region_id: Optional[int] = None,
                            from_date: Optional[date] = None,
                            to_date: Optional[date] = None) -> Path:
        """Получить путь к файлу в кэше"""
        filename = self._get_cache_key(region_id, from_date, to_date)
        return self.cache_dir / filename

    async def get_cached_data(self, region_id: Optional[int] = None,
                              from_date: Optional[date] = None,
                              to_date: Optional[date] = None) -> Optional[bytes]:
        """Получить данные из кэша"""
        cache_file = self.get_cache_file_path(region_id, from_date, to_date)

        if not cache_file.exists():
            return None

        try:
            async with aiofiles.open(cache_file, 'rb') as f:
                return await f.read()
        except Exception as e:
            logger.error(f"Ошибка чтения кэша {cache_file}: {str(e)}")
            return None

    async def update_cache(self, db: AsyncSession, region_id: Optional[int] = None,
                           from_date: Optional[date] = None,
                           to_date: Optional[date] = None) -> bool:
        """Обновить кэш для конкретных параметров"""
        async with self._lock:
            try:
                flights_data = await FlightService.get_data(
                    db, region_id=region_id, from_date=from_date, to_date=to_date
                )

                if not flights_data:
                    cache_file = self.get_cache_file_path(region_id, from_date, to_date)
                    if cache_file.exists():
                        cache_file.unlink()
                    return False

                gzip_data = await FlightService.create_csv_gzip_async(flights_data)

                cache_file = self.get_cache_file_path(region_id, from_date, to_date)
                async with aiofiles.open(cache_file, 'wb') as f:
                    await f.write(gzip_data)

                logger.info(f"Кэш обновлен: {cache_file.name}")
                return True

            except Exception as e:
                logger.error(f"Ошибка обновления кэша: {str(e)}")
                return False

    async def invalidate_all_cache(self):
        """Полная очистка кэша"""
        async with self._lock:
            try:
                for cache_file in self.cache_dir.glob("*.csv.gz"):
                    cache_file.unlink()
                logger.info("Весь кэш очищен")
            except Exception as e:
                logger.error(f"Ошибка очистки кэша: {str(e)}")

    async def initialize_cache(self, db: AsyncSession):
        """Инициализация кэша при старте приложения"""
        logger.info("Инициализация кэша полетов...")

        await self.update_cache(db)

        regions_query = await db.execute(select(Region.region_id))
        regions = regions_query.scalars().all()

        for region_id in regions:
            await self.update_cache(db, region_id=region_id)

        logger.info("Инициализация кэша завершена")

flight_cache_manager = FlightCacheManager()
