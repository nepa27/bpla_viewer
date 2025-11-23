import { getDateNow } from '../../utils/functions';
import style from './DateRangeShower.module.css';

const DateRangeShower = ({ dateRange }) => {
  return (
    <div className={style.date__wrapper}>
      <h4 className={style.date__header}>Фильтр дат:</h4>
      <div>
        <span>c {getDateNow(dateRange[0]) + ' '}</span>
        <span>по {getDateNow(dateRange[1])}</span>
      </div>
    </div>
  );
};

export default DateRangeShower;
