/* eslint-disable compat/compat */
import { Button, Table } from 'antd';

import React, { useMemo, useState } from 'react';

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
  // Разделение строки на день и месяц
  const [dayA, monthA] = a.split(':').map(Number);
  const [dayB, monthB] = b.split(':').map(Number);

  // Преобразование даты в общее число для сравнения
  const dateValueA = monthA * 100 + dayA;
  const dateValueB = monthB * 100 + dayB;

  return dateValueA - dateValueB;
}

const TableMain = ({ data = [] }) => {
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  // Используем useMemo для оптимизации вычислений
  const rowsData = useMemo(() => {
    return data?.map((el) => ({ key: el.id, ...el })) || [];
  }, [data]);

  // Используем useMemo для создания колонок
  const columnsData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return Object.keys(data[0]).map((key) => {
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
    pageSize: 5, // Установка 5 строк на странице
    showSizeChanger: false, // Отключаем возможность изменения размера страницы
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} из ${total} записей`,
    responsive: true,
  };

  // Проверка наличия данных
  if (!data || data.length === 0) {
    return <div className="table-empty-state">Нет данных для отображения</div>;
  }

  // Функция для рендеринга раскрытых строк с адаптивной группировкой
  const expandedRowRender = (record) => {
    // Определяем группы значений
    const groups = [
      // Группа 1: ID полета и Дата
      [
        { label: columnNamesRu.id, value: record.id },
        { label: columnNamesRu.date, value: record.date },
      ],
      // Группа 2: Время взлета и Время посадки
      [
        { label: columnNamesRu.takeoff_time, value: record.takeoff_time },
        { label: columnNamesRu.landing_time, value: record.landing_time },
      ],
      // Группа 3: Широта и Долгота
      [
        { label: columnNamesRu.lat, value: record.lat },
        { label: columnNamesRu.lng, value: record.lng },
      ],
      // Группа 4: Длительность и Тип
      [
        { label: columnNamesRu.durationMinutes, value: record.durationMinutes },
        { label: columnNamesRu.type, value: record.type },
      ],
      // Группа 5: Регион
      [{ label: columnNamesRu.region, value: record.region }],
    ];

    return (
      <div
        style={{
          padding: '16px',
          backgroundColor: 'rgba(10, 25, 47, 0.6)',
          borderRadius: '8px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '12px',
            width: '100%',
          }}
        >
          {groups.map((group, groupIndex) => (
            <div
              key={groupIndex}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                minWidth: '200px',
              }}
            >
              {group.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <strong>{item.label}:</strong>
                  <span>{item.value}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="table-wrapper">
      <Table
        columns={columnsData}
        dataSource={rowsData}
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
// /* eslint-disable compat/compat */
// import { Table } from 'antd';

// import React, { useEffect, useState } from 'react';

// const columnNamesRu = {
//   id: 'ID полета',
//   date: 'Дате',
//   lat: 'Широта',
//   lng: 'Долгота',
//   takeoff_time: 'Время взлета',
//   landing_time: 'Время посадки',
//   type: 'Тип',
//   region: 'Регион',
//   durationMinutes: 'Длительность полета(мин)',
// };

// function compareDates(a, b) {
//   // Разделение строки на день и месяц
//   const [dayA, monthA] = a.split(':').map(Number);
//   const [dayB, monthB] = b.split(':').map(Number);

//   // Преобразование даты в общее число для сравнения
//   const dateValueA = monthA * 100 + dayA;
//   const dateValueB = monthB * 100 + dayB;

//   return dateValueA - dateValueB;
// }

// const TableMain = ({ data = [] }) => {
//   const rowsData = data?.map((el) => ({ key: el.id, ...el })); //.slice(0, 5);

//   // const [dataOnePage, setDataOnePage] = useState([]);
//   const [tableParams, setTableParams] = useState({
//     pagination: {
//       current: 1,
//       pageSize: 5,
//     },
//   });

//   if (!data.length) return;
//   const columnsData = Object.keys(data[0]).map((key) => {
//     const obj = {
//       title: columnNamesRu[key],
//       dataIndex: key,
//     };

//     if (key === 'id') {
//       obj.sorter = (a, b) => +a.id - +b.id;
//     }

//     if (key === 'lat') {
//       obj.sorter = (a, b) => +a.lat - +b.lat;
//     }

//     if (key === 'lng') {
//       obj.sorter = (a, b) => +a.lng - +b.lng;
//     }

//     if (key === 'takeoff_time') {
//       obj.sorter = (a, b) => compareDates(a.takeoff_time, b.takeoff_time);
//     }

//     if (key === 'landing_time') {
//       obj.sorter = (a, b) => compareDates(a.landing_time, b.landing_time);
//     }

//     if (key === 'region') {
//       obj.onFilter = (value, record) => record.region.indexOf(value) === 0;
//     }

//     return obj;
//   });

//   const onChange = (pagination, filters, sorter, extra) => {
//     console.log('params', pagination, filters, sorter, extra);

//     const from = pagination.current * pagination.pageSize;
//     const to = from + pagination.pageSize;

//     // setDataOnePage([...rowsData.slice(from, to)]);
//     setTableParams((prev) => ({
//       ...prev,
//       pagination: {
//         ...prev.pagination,
//         current: pagination.current,
//         pageSize: pagination.pageSize,
//       },
//     }));
//   };

//   return (
//     <Table
//       columns={columnsData}
//       dataSource={rowsData}
//       onChange={onChange}
//       showSorterTooltip={{ target: 'sorter-icon' }}
//       pagination={tableParams.pagination}
//     />
//   );
// };
// export default TableMain;
