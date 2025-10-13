/* eslint-disable compat/compat */
import { Button, Table } from 'antd';

import React, { useEffect, useMemo, useRef, useState } from 'react';

import Input from '../Input/Input';

const columnNamesRu = {
  id: 'ID полета',
  date: 'Дате',
  lat: 'Широта',
  lng: 'Долгота',
  takeoff_time: 'Время взлета',
  landing_time: 'Время посадки',
  type: 'Тип',
  region: 'Регион',
  durationMinutes: 'Длительность полета(мин)',
};

function compareDates(a, b) {
  // Для формата YYYY-MM-DD
  if (typeof a === 'string' && typeof b === 'string' && a.includes('-') && b.includes('-')) {
    // Сравнение дат в формате YYYY-MM-DD
    return new Date(a) - new Date(b);
  }

  // Разделение строки на день и месяц для старого формата
  const [dayA, monthA] = a.split(':').map(Number);
  const [dayB, monthB] = b.split(':').map(Number);

  // Преобразование даты в общее число для сравнения
  const dateValueA = monthA * 100 + dayA;
  const dateValueB = monthB * 100 + dayB;

  return dateValueA - dateValueB;
}

// Web Worker для фильтрации данных
const createFilterWorker = () => {
  const workerCode = `
    self.onmessage = function(e) {
      const { data, searchText } = e.data;
      if (!searchText) {
        self.postMessage(data);
        return;
      }
      
      const searchLower = searchText.toLowerCase();
      const filteredData = data.filter(row => {
        return Object.values(row).some(value => {
          if (typeof value === 'string') {
            return value.toLowerCase().includes(searchLower);
          }
          return String(value).toLowerCase().includes(searchLower);
        });
      });
      
      self.postMessage(filteredData);
    };
  `;

  const blob = new Blob([workerCode], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  return new Worker(url);
};

const TableMain = ({ data = [], showSizeChanger = true }) => {
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredRowsData, setFilteredRowsData] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [pageSize, setPageSize] = useState(5);

  const workerRef = useRef(null);
  const timeoutRef = useRef(null);

  // Используем useMemo для оптимизации вычислений
  const rowsData = useMemo(() => {
    return data?.map((el) => ({ key: el.id, ...el })) || [];
  }, [data]);

  // Инициализация Web Worker
  useEffect(() => {
    workerRef.current = createFilterWorker();

    workerRef.current.onmessage = function (e) {
      setFilteredRowsData(e.data);
      setIsFiltering(false);
    };

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Оптимизированная фильтрация с debounce
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsFiltering(true);

    timeoutRef.current = setTimeout(() => {
      if (workerRef.current) {
        workerRef.current.postMessage({
          data: rowsData,
          searchText: searchText,
        });
      }
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchText, rowsData]);

  // Используем useMemo для создания колонок для основной таблицы
  const columnsData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return Object.keys(data[0])
      .filter(
        (key) =>
          key !== 'takeoff_time' &&
          key !== 'landing_time' &&
          key !== 'durationMinutes' &&
          key !== 'lat' &&
          key !== 'lng',
      )
      .map((key) => {
        const obj = {
          title: columnNamesRu[key],
          dataIndex: key,
          sorter: false, // По умолчанию без сортировки
          width: key === 'region' ? 150 : key === 'type' ? 100 : 120, // Установка ширины колонок
          ellipsis: true, // Добавлено для обрезки текста
          render: (text) => {
            if (typeof text === 'string') {
              const words = text.split(' ');
              if (words.length > 3) {
                return words.slice(0, 3).join(' ') + '...';
              }
            }
            return text;
          },
        };

        // Настройка сортировки для конкретных полей
        switch (key) {
          case 'id':
            obj.sorter = (a, b) => +a.id - +b.id;
            break;
          case 'lat':
            obj.sorter = (a, b) => +a.lat - +b.lat;
            break;
          case 'lng':
            obj.sorter = (a, b) => +a.lng - +b.lng;
            break;
          case 'takeoff_time':
            obj.sorter = (a, b) => compareDates(a.takeoff_time, b.takeoff_time);
            break;
          case 'landing_time':
            obj.sorter = (a, b) => compareDates(a.landing_time, b.landing_time);
            break;
          case 'date':
            obj.sorter = (a, b) => compareDates(a.date, b.date);
            break;
          case 'region':
            // Создаем уникальные значения для фильтрации
            const uniqueRegions = Array.from(new Set(data.map((item) => item.region)));
            obj.filters = uniqueRegions.map((region) => ({
              text: region,
              value: region,
            }));
            obj.onFilter = (value, record) => record.region === value;
            break;
          default:
            obj.sorter = false;
        }

        return obj;
      });
  }, [data]);

  // Конфигурация пагинации
  const paginationConfig = {
    pageSize: pageSize,
    showSizeChanger, // Теперь управляемый через пропс
    showTotal: (total) => `Всего ${total} записей`,
    responsive: true,
    onChange: (page, size) => {
      setPageSize(size);
    },
  };

  // Обработчик изменений
  const handleChange = (pagination, filters, sorter, extra) => {
    console.log('params', pagination, filters, sorter, extra);
  };

  // Проверка наличия данных
  if (!data || data.length === 0) {
    return <div className="table-empty-state">Нет данных для отображения</div>;
  }

  // Колонки для вложенной таблицы с полной информацией
  const fullInfoColumns = [
    {
      title: 'Время взлета',
      dataIndex: 'takeoff_time',
      key: 'takeoff_time',
      width: 150,
    },
    {
      title: 'Время посадки',
      dataIndex: 'landing_time',
      key: 'landing_time',
      width: 150,
    },
    {
      title: 'Длительность полета(мин)',
      dataIndex: 'durationMinutes',
      key: 'durationMinutes',
      width: 180,
    },
    {
      title: 'Широта',
      dataIndex: 'lat',
      key: 'lat',
      width: 120,
    },
    {
      title: 'Долгота',
      dataIndex: 'lng',
      key: 'lng',
      width: 120,
    },
  ];

  // Функция для рендеринга раскрытых строк с полной информацией в виде таблицы
  const expandedRowRender = (record) => (
    <div style={{ padding: '16px', backgroundColor: 'rgba(10, 25, 47, 0.6)', borderRadius: '8px' }}>
      <Table
        columns={fullInfoColumns}
        dataSource={[record]}
        pagination={false}
        size="small"
        bordered={true}
        tableLayout="fixed"
        className="full-info-table"
      />
    </div>
  );

  return (
    <div className="table-wrapper">
      <div
        style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', maxWidth: '300px' }}
      >
        <Input
          value={searchText}
          placeholder="Поиск по всем полям..."
          containerClass={{ width: 300, marginRight: '10px' }}
          onChange={(e) => setSearchText(e.target.value)}
        />
        {/* {isFiltering && <span style={{ marginLeft: '10px', color: '#64ffda' }}>Поиск...</span>} */}
      </div>
      <Table
        columns={columnsData}
        dataSource={filteredRowsData}
        onChange={handleChange}
        showSorterTooltip={{ target: 'sorter-icon' }}
        pagination={paginationConfig}
        scroll={{ x: 'auto' }}
        className="custom-table"
        size="middle"
        bordered={false}
        tableLayout="fixed"
        expandable={{
          expandedRowRender,
          expandedRowKeys,
          onExpand: (expanded, record) => {
            if (expanded) {
              setExpandedRowKeys([...expandedRowKeys, record.key]);
            } else {
              setExpandedRowKeys(expandedRowKeys.filter((key) => key !== record.key));
            }
          },
        }}
      />
    </div>
  );
};

export default TableMain;
