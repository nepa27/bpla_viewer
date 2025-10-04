from time import time
from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.responses import (
    get_all_flights_gzip_responses,
    get_flights_by_region_gzip_responses,
)
from backend.app.database import get_db
from backend.app.services.flight_service import FlightService
from backend.app.logging import log_function, logger

router = APIRouter(tags=["Полеты БПЛА"])


@router.get(
    "/regions",
    responses=get_all_flights_gzip_responses,
)
@log_function(logger)
async def get_all_flights_gzip(
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
    """Получить все полеты в виде GZIP с CSV"""
    try:
        time_before = time()
        logger.info(f"Запрос на получение полетов с {from_date} по {to_date}")
        flights_data = await FlightService.get_data(
            db, from_date=from_date, to_date=to_date
        )

        if not flights_data:
            logger.warning("Полеты не найдены")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="No flights found"
            )

        gzip_data = await FlightService.create_csv_gzip_async(flights_data)
        logger.info("Данные успешно подготовлены и сжаты")

        time_after = time()
        logger.info(f"Время обработки запроса: {time_after - time_before} секунд")

        return Response(
            content=gzip_data,
            media_type="application/gzip",
            headers={"Content-Disposition": "attachment; filename=all_flights.csv.gz"},
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при генерации GZIP файла: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating GZIP file: {str(e)}",
        )


@router.get(
    "/regions/{region_id}",
    responses=get_flights_by_region_gzip_responses,
)
@log_function(logger)
async def get_flights_by_region_gzip(
    region_id: int,
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
    """Получить полеты региона в виде GZIP с CSV"""
    try:
        logger.info(
            f"Запрос на получение полетов для региона {region_id} с {from_date} по {to_date}"
        )
        flights_data = await FlightService.get_data(
            db, region_id=region_id, from_date=from_date, to_date=to_date
        )
        if not flights_data:
            logger.warning(f"Полеты не найдены для региона {region_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No flights found for region ID {region_id} in the specified date range",
            )
        gzip_data = await FlightService.create_csv_gzip_async(flights_data)
        logger.info(f"Данные для региона {region_id} успешно подготовлены и сжаты")
        return Response(
            content=gzip_data,
            media_type="application/gzip",
            headers={
                "Content-Disposition": f"attachment; filename=region_{region_id}_flights.csv.gz"
            },
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Ошибка при генерации GZIP файла для региона {region_id}: {str(e)}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating GZIP file for region {region_id}: {str(e)}",
        )
