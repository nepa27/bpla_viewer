# Сервис для анализа количества и длительности полетов гражданских беспилотников в регионах Российской Федерации

[![Python](https://img.shields.io/badge/-Python-464646?style=flat-square&logo=Python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/-FastAPI-464646?style=flat-square&logo=FastAPI)](https://fastapi.tiangolo.com/)
[![Pydantic](https://img.shields.io/badge/-Pydantic-464646?style=flat-square&logo=Pydantic)](https://pydantic.dev/)
[![SQLAlchemy](https://img.shields.io/badge/-SQLAlchemy-464646?style=flat-square&logo=SQLAlchemy)](https://www.sqlalchemy.org/)
[![Alembic](https://img.shields.io/badge/-Alembic-464646?style=flat-square&logo=Alembic)](https://alembic.sqlalchemy.org/en/latest/)
[![Uvicorn](https://img.shields.io/badge/-Uvicorn-464646?style=flat-square&logo=Uvicorn)](https://www.uvicorn.org/)
[![Docker](https://img.shields.io/badge/-Docker-464646?style=flat-square&logo=Docker)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-464646?style=flat-square&logo=PostgreSQL)](https://www.postgresql.org/)
[![PostGIS](https://img.shields.io/badge/-PostGIS-464646?style=flat-square&logo=PostGIS)](https://postgis.net/)
[![Docker Compose](https://img.shields.io/badge/-Docker%20Compose-464646?style=flat-square&logo=Docker)](https://docs.docker.com/compose/)
[![Starlette](https://img.shields.io/badge/-Starlette-464646?style=flat-square&logo=Starlette)](https://www.starlette.io/)
[![Pandas](https://img.shields.io/badge/-Pandas-464646?style=flat-square&logo=Pandas)](https://pandas.pydata.org/)
[![Openpyxl](https://img.shields.io/badge/-Openpyxl-464646?style=flat-square)](https://openpyxl.readthedocs.io/en/stable/)
[![GeoAlchemy2](https://img.shields.io/badge/-GeoAlchemy2-464646?style=flat-square)](https://geoalchemy-2.readthedocs.io/en/latest/)
[![JavaScript](https://img.shields.io/badge/-JavaScript-464646?style=flat-square&logo=JavaScript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![React](https://img.shields.io/badge/-React-464646?style=flat-square&logo=React)](https://reactjs.org/)
[![Ant Design](https://img.shields.io/badge/-Ant%20Design-464646?style=flat-square&logo=Ant%20Design)](https://ant.design/)
[![React Router](https://img.shields.io/badge/-React%20Router-464646?style=flat-square&logo=React%20Router)](https://reactrouter.com/)
[![TanStack Query](https://img.shields.io/badge/-TanStack%20Query-464646?style=flat-square&logo=TanStack)](https://tanstack.com/query/)
[![Yandex Maps](https://img.shields.io/badge/-Yandex%20Maps-464646?style=flat-square&logo=Yandex)](https://yandex.ru/maps/)
[![D3.js](https://img.shields.io/badge/-D3.js-464646?style=flat-square&logo=D3.js)](https://d3js.org/)
[![Vite](https://img.shields.io/badge/-Vite-464646?style=flat-square&logo=Vite)](https://vitejs.dev/)

## Описание
Основной задачей проекта является создание сервиса для анализа количества и длительности полетов гражданских беспилотных летательных аппаратов (БПЛА) в регионах Российской Федерации на основе данных Росавиации. Интеграция с системой Госкорпораций ОРВД в области накопления и систематизации стандартизированных сообщений, согласно приказу Минтранса РФ от 25.12.2018 г., с фокусом на эффективность, простоту и наглядность для конечных пользователей.

## Основные особенности
- Создан эффективный парсер формализованных сообщений, который уверенно справляется с обработкой практически всех типов данных (более 99,4%).
- Разработана система геопривязки полетов именно к территориям конкретных регионов России, исключив возможные ошибки.
- Наш сервис способен одновременно отображать на карте тысячи точек маршрутов, создавая красивое и информативное представление воздушного пространства.
- Пользователям доступен удобный инструмент фильтрации и сортировки данных по регионам, продолжительности и другим важным критериям.
- Важнейшие статистические показатели предоставляются в удобочитаемом виде, позволяя увидеть динамику полетов, выявить наиболее активные регионы и оценить общую картину воздушного пространства.
- Разработана админ-панель для загрузки новых данных и редактирования имеющихся.

## Стек использованных технологий

### Backend
+ Python 3.11
+ FastAPI 0.104.1
+ Pydantic 2.11.9
+ SQLAlchemy 2.0.23
+ Alembic 1.12.1
+ Uvicorn 0.24.0
+ Docker 24.0.5
+ Docker Compose 2.20.2
+ PostgreSQL 18 + PostGIS 3.4
+ Starlette 0.27.0
+ Pandas 2.1.3
+ Openpyxl 3.1.5
+ GeoAlchemy2 0.14.2

### Frontend
+ React 19.1.1 (React Router DOM v7.9.1, TanStack Query v5.90.2)
+ Ant Design 5.27.4 (UI компоненты)
+ @pbe/react-yandex-maps 1.2.5 (Интеграция с Яндекс Картами)
+ D3.js 7.9.0 (Визуализация данных)
+ date-fns 4.1.0 (Работа с датами)
+ pptxgenjs 4.0.1 (Экспорт в PowerPoint)
+ Vite 7.1.2 (Сборка проекта)
+ ESLint & Prettier (Код-стайл и форматирование)

## Запуск проекта

### Установка
- **Предварительно установите PostgreSQL с расширением PostGIS на Вашу операционную систему!**

#### Backend
Во-первых установите Python и pip (команды для Ubuntu)
```
sudo apt-get install python
sudo apt-get install pip
```
Если вы используйте Windows, то установите Python [по ссылке](https://www.python.org/downloads/release/python-31112/).
Создайте виртуальное окружение и активируйте его.
```
python -m venv venv
source venv/bin/activate    # (Ubuntu)
./venv/Scripts/python       # (Windows)
```
Затем установите необходимые зависимости из файла requirements.txt
```
pip install -r requirements.txt
```
#### Frontend
Переходим в директорию instruction/client
```
cd bpla_viewer/frontend
```
Устанавливаем зависимости
```
npm install
```
## Запуск
В двух разных терминалах запускаем **backend** и **frontend**
#### Backend
Перейдите в корень проекта и запустите сервер
```
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```
Если вы все правильно сделали, то высветится приглашение
```
INFO:     Will watch for changes in these directories: ['/home/alex/Документы/projects/bpla_viewer']
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [21424] using WatchFiles
INFO:     Started server process [21426]
INFO:     Waiting for application startup.
...
INFO:     Application startup complete.

```

При возникновении ошибок, убедитесь, что вы находитесь в корневой директории проекта (bpla_viewer)
и что у вас запущен PostgreSQL сервер.


```
#### Frontend
Запускаем сервер

npm run dev - запуск в режиме разработки
npm run built - сборка проекта на продакшн
```
Откройте браузер и перейдите по адресу http://127.0.0.1:3000/ 

### Для успешного развертывания проекта необходимо в главной директории создать файл .env, где будут указаны следующие параметры:
APP_NAME=Drone Flights API
DEBUG=true

DB_HOST='localhost'
DB_PORT=5432
DB_USER='postgres'
DB_PASS='postgres'
DB_NAME='НАЗВАНИЕ_ВАШЕЙ_БАЗЫ_ДАННЫХ'


### Планируемые улучшение
- Полностью развернуть проект с помощью Docker и Docker Compose;
- Добавить возможность регистрации и аутентификации пользователей;
- Добавить систему отслеживания изменений в данных (Grafana, Prometheus);

## Авторы
+ [Всеволод Яковцев](https://github.com/seva123321) - Frontend Developer
+ [Александр Непочатых](https://github.com/nepa27) - Backend Developer
