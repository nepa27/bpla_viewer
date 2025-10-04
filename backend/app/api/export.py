import os
from datetime import date
from typing import Optional

from fastapi import APIRouter, HTTPException, status, Response, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.config import STATIC_DIR
from backend.app.constants import PATH_TO_TEMPLATE_EXCEL
from backend.app.database import get_db
from backend.app.logging import logger
from backend.app.services.flight_service import FlightService
from backend.app.utils.export_xlsx import add_data_to_xlsx

router = APIRouter(prefix="/export_excel", tags=["Экспорт Excel"])


@router.get("")
async def export_excel(
    from_date: Optional[date] = Query(
        None,
        description="Дата начала периода в формате YYYY-MM-DD",
        example="2025-01-01",
    ),
    to_date: Optional[date] = Query(
        None,
        description="Дата конца периода в формате YYYY-MM-DD",
        example="2025-08-01",
    ),
    db: AsyncSession = Depends(get_db),
):
    """Получить полигон координат."""
    try:
        logger.info(f"Запрос количества полетов по регионам с {from_date} по {to_date}")
        template_excel_path = os.path.join(STATIC_DIR, PATH_TO_TEMPLATE_EXCEL)

        count_flights = await FlightService.get_data_to_excel(
            db, from_date=from_date, to_date=to_date
        )
        add_data_to_xlsx(count_flights)

        with open(template_excel_path, 'rb') as f:
            data = f.read()
            logger.info("Шаблон успешно загружен")
            return Response(
                content=data,
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={"Content-Disposition": "attachment; filename=export_excel.xlsx"},
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при загрузке шаблона: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error sending file: {str(e)}",
        )
