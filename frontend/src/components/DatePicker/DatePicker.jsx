import { ConfigProvider, DatePicker } from 'antd';
import 'antd/dist/reset.css';
import ruRU from 'antd/locale/ru_RU';

// import dayjs from 'dayjs';

import React, { useEffect, useState } from 'react';

import { useParams } from 'react-router';

import { timeToDateConverter } from '../../utils/functions';

const { RangePicker } = DatePicker;

const DateRangeFieldForm = ({ dateRange, setDateRange }) => {
  // const [dateRange, setDateRange] = useState([dayjs().subtract(1, 'year'), dayjs()]);
  const { id } = useParams();

  useEffect(() => {
    if (dateRange && dateRange[0] && dateRange[1]) {
      // Вывод в консоль
      console.log('Дата начала:', timeToDateConverter(dateRange[0].toDate()));
      console.log('Дата окончания:', timeToDateConverter(dateRange[1].toDate()));
    }
  }, [dateRange]);

  return (
    <ConfigProvider locale={ruRU}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          // gap: '12px',
          padding: '16px',
          backgroundColor: 'var(--card-bg, rgba(17, 34, 64, 0.7))',
          borderRadius: '12px',
          boxShadow: 'var(--shadow)',
          border: '1px solid var(--card-border)',
          // maxWidth: '400px',
          width: '100%',
          margin: '0 auto',
        }}
      >
        <h4
          style={{
            margin: '0 0 8px',
            color: 'var(--accent-blue, #64ffda)',
            fontSize: '1.1rem',
            fontWeight: '600',
          }}
        >
          Выберите диапазон дат
        </h4>
        <RangePicker
          value={dateRange}
          onChange={setDateRange}
          format="DD.MM.YYYY"
          style={{
            // width: '100%',
            backgroundColor: 'var(--secondary-dark, #112240)',
            borderColor: 'var(--border-color, rgba(136, 146, 176, 0.2))',
            color: 'var(--text-light, #ccd6f6)',
            borderRadius: '8px',
            height: '42px',
            padding: '0 12px',
            fontSize: '1rem',
          }}
          inputReadOnly
          placeholder={['Начало', 'Окончание']}
        />
        {/* <div
          style={{
            fontSize: '0.9rem',
            color: 'var(--text-secondary, #8892b0)',
            textAlign: 'center',
            marginTop: '8px',
          }}
        >
          Выбранный диапазон: {dateRange[0]?.format('DD.MM.YYYY')} —{' '}
          {dateRange[1]?.format('DD.MM.YYYY')}
        </div> */}
      </div>
    </ConfigProvider>
  );
};

export default DateRangeFieldForm;
// MUI
// import Box from '@mui/material/Box';
// import Button from '@mui/material/Button';
// import { ThemeProvider, createTheme } from '@mui/material/styles';
// import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { addYears, subYears } from 'date-fns';
// import ruLocale from 'date-fns/locale/ru';

// import React, { useEffect, useState } from 'react';

// // Создаём тему с кастомными стилями
// const customTheme = createTheme({
//   palette: {
//     mode: 'dark',
//   },
//   components: {
//     MuiTextField: {
//       styleOverrides: {
//         root: {
//           '& .MuiOutlinedInput-root': {
//             'backgroundColor': 'var(--card-bg, rgba(17, 34, 64, 0.7))',
//             'borderRadius': '4px',
//             '& fieldset': {
//               borderColor: 'var(--border-color, rgba(136, 146, 176, 0.2)',
//             },
//             '&:hover fieldset': {
//               borderColor: 'var(--accent-blue, #64ffda)',
//             },
//             '&.Mui-focused fieldset': {
//               borderColor: 'var(--accent-blue, #64ffda)',
//             },
//           },
//           '& .MuiInputBase-input': {
//             color: 'var(--text-light, #ccd6f6)',
//           },
//           '& .MuiInputLabel-root': {
//             color: 'var(--text-secondary, #8892b0)',
//           },
//           '& .MuiInputLabel-root.Mui-focused': {
//             color: 'var(--accent-blue, #64ffda)',
//           },
//         },
//       },
//     },
//     MuiButton: {
//       styleOverrides: {
//         root: {
//           'backgroundColor': 'var(--accent-blue, #64ffda)',
//           'color': 'var(--primary-dark, #0a192f)',
//           '&:hover': {
//             backgroundColor: 'var(--accent-blue-dark, #52c4b9)',
//           },
//         },
//       },
//     },
//   },
// });

// const DateRangePickerForm = () => {
//   const [startDate, setStartDate] = useState(() => subYears(new Date(), 1)); // Год назад
//   const [endDate, setEndDate] = useState(() => new Date()); // Сегодня

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log('Дата начала:', startDate);
//     console.log('Дата окончания:', endDate);
//   };

//   return (
//     <ThemeProvider theme={customTheme}>
//       <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ruLocale}>
//         <Box component="form" onSubmit={handleSubmit} display="flex" gap={2} alignItems="center">
//           <DatePicker
//             label="Дата начала"
//             value={startDate}
//             onChange={setStartDate}
//             slotProps={{
//               textField: {
//                 variant: 'outlined',
//               },
//             }}
//           />
//           <DatePicker
//             label="Дата окончания"
//             value={endDate}
//             onChange={setEndDate}
//             slotProps={{
//               textField: {
//                 variant: 'outlined',
//               },
//             }}
//           />
//           <Button type="submit" variant="contained">
//             Отправить
//           </Button>
//         </Box>
//       </LocalizationProvider>
//     </ThemeProvider>
//   );
// };

// export default DateRangePickerForm;
