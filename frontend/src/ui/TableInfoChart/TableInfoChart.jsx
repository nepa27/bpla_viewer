import style from './TableInfoChart.module.css';

const TableInfoChart = ({ data }) => {
  return (
    <div className={style['info-board']}>
      {data.map(({ id, name, value }) => {
        return (
          <div className={style['info-item']} key={id}>
            <span className={style['info-label']}>{name}</span>
            <span className={style['info-value']}>{value}</span>
          </div>
        );
      })}
    </div>
  );
};

export default TableInfoChart;
