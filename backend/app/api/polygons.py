import os
from fastapi import APIRouter, HTTPException, status, Response

from backend.app.config import STATIC_DIR
from backend.app.constants import RUSSIA_ID_POLYGON
from backend.app.logging import log_function, logger

router = APIRouter(prefix="/polygons", tags=["Полигон координат"])


@router.get("")
@log_function(logger)
async def get_polygons():
    """Получить полигон координат."""
    try:
        logger.info("Запрос на получение полигона координат")
        polygon_path = os.path.join(STATIC_DIR, RUSSIA_ID_POLYGON)

        if not os.path.exists(polygon_path):
            logger.error(f"Файл полигона не найден: {polygon_path}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Polygon file not found",
            )

        with open(polygon_path, "rb") as f:
            data = f.read()
            logger.info("Полигон координат успешно загружен")
            return Response(
                content=data,
                media_type="application/gzip",
                headers={
                    "Content-Disposition": "attachment; filename=polygons.geo.json.gz"
                },
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при загрузке полигона: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating GZIP file: {str(e)}",
        )
