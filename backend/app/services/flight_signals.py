from sqlalchemy import event
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models.flight import Flight
from backend.app.services.flight_cache_manager import flight_cache_manager
from backend.app.logging import logger


def register_flight_signals():
    """Регистрация обработчиков сигналов для полетов"""

    @event.listens_for(Flight, 'after_insert')
    @event.listens_for(Flight, 'after_update')
    @event.listens_for(Flight, 'after_delete')
    def on_flight_change(mapper, connection, target):
        """Обработчик изменений в таблице Flight"""
        logger.info(f"Обнаружено изменение в таблице Flight, инвалидация кэша")

        import asyncio
        from fastapi import Depends

        from backend.app.database import get_db

        async def update_cache(db: AsyncSession = Depends(get_db)):

            await flight_cache_manager.invalidate_all_cache()
            await flight_cache_manager.initialize_cache(db)

        asyncio.create_task(update_cache())
