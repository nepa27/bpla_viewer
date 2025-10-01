// src/components/ChartExportSelector.jsx
import { DownloadOutlined } from '@ant-design/icons';
import { Button, Select, Space, message } from 'antd';

import { exportChartsToPPTX } from '../../utils/exportUtils';
import { convertDatesToReadableFormat } from '../../utils/functions';

const { Option } = Select;

const ChartExportSelector = ({
  dataRange,
  dailyFlights,
  flightsByRegion,
  flightsDurationByRegion,
  onExportComplete,
  disabled = false,
}) => {
  const handleExport = async (value) => {
    if (!dailyFlights || !flightsByRegion || !flightsDurationByRegion) {
      message.warning('Нет данных для экспорта');
      return;
    }
    console.log(convertDatesToReadableFormat(dataRange))
    try {
      // Показываем сообщение о начале экспорта
      message.loading('Подготовка презентации...', 0);

      // Экспорт всех данных как таблицы
      const result = await exportChartsToPPTX(
        {
          dailyFlights,
          flightsByRegion,
          flightsDurationByRegion,
        },
        'flight_statistics.pptx',
        convertDatesToReadableFormat(dataRange),
      );

      if (result.success) {
        message.destroy(); // Убираем лоадер
        message.success('Презентация успешно сохранена!');
        onExportComplete?.(value);
      } else {
        message.destroy();
        message.error(`Ошибка экспорта: ${result.error}`);
      }
    } catch (error) {
      message.destroy();
      message.error(`Ошибка экспорта: ${error.message}`);
    }
  };

  return (
    <Space style={{ marginBottom: 16 }}>
      <Select
        defaultValue="all"
        style={{ width: 200 }}
        disabled={disabled}
        placeholder="Выберите график"
      >
        <Option value="all">Все данные</Option>
      </Select>
      <Button
        style={{ backgroundColor: '#64ffda', color: '#0d1d37' }}
        type="primary"
        icon={<DownloadOutlined />}
        onClick={() => handleExport('all')}
        disabled={disabled}
      >
        Экспорт в PPTX
      </Button>
    </Space>
  );
};

export default ChartExportSelector;

// // src/components/ChartExportSelector.jsx
// import { DownloadOutlined } from '@ant-design/icons';
// import { Button, Select, Space, message } from 'antd';

// import { exportChartsToPPTX } from '../../utils/exportUtils';

// const { Option } = Select;

// const ChartExportSelector = ({ chartsData, onExportComplete, disabled = false }) => {
//   const handleExport = async (value) => {
//     if (!value || !chartsData || chartsData.length === 0) {
//       message.warning('Нет данных для экспорта');
//       return;
//     }

//     try {
//       let selectedCharts = [];

//       if (value === 'all') {
//         selectedCharts = [...chartsData];
//       } else {
//         const chart = chartsData.find((c) => c.id === value);
//         if (chart) {
//           selectedCharts = [chart];
//         }
//       }

//       if (selectedCharts.length === 0) {
//         message.warning('График не найден');
//         return;
//       }

//       // Показываем сообщение о начале экспорта
//       message.loading('Подготовка презентации...', 0);

//       // Экспорт
//       const result = await exportChartsToPPTX(selectedCharts);

//       if (result.success) {
//         message.destroy(); // Убираем лоадер
//         message.success('Презентация успешно сохранена!');
//         onExportComplete?.(value);
//       } else {
//         message.destroy();
//         message.error(`Ошибка экспорта: ${result.error}`);
//       }
//     } catch (error) {
//       message.destroy();
//       message.error(`Ошибка экспорта: ${error.message}`);
//     }
//   };

//   return (
//     <Space style={{ marginBottom: 16 }}>
//       <Select
//         defaultValue="all"
//         style={{ width: 200 }}
//         disabled={disabled}
//         placeholder="Выберите график"
//         onChange={(value) => {
//           // Можно добавить логику изменения состояния
//         }}
//       >
//         <Option value="all">Все графики</Option>
//         {chartsData?.map((chart) => (
//           <Option key={chart.id} value={chart.id}>
//             {chart.title}
//           </Option>
//         ))}
//       </Select>
//       <Button
//         style={{ backgroundColor: '#64ffda', color: '#0d1d37' }}
//         type="primary"
//         icon={<DownloadOutlined />}
//         onClick={() => handleExport('all')}
//         disabled={disabled}
//       >
//         Экспорт в PPTX
//       </Button>
//     </Space>
//   );
// };

// export default ChartExportSelector;
