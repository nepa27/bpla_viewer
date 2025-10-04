// eslint-disable-next-line no-unused-vars
import { Skeleton, Space, Spin } from 'antd';

import styles from './MapSkeleton.module.css';

// export const MapSkeleton = () => (
//   <div className="map-container">
//     <Skeleton active paragraph={{ rows: 0 }} style={{ height: '600px' }}>
//       <Spin>Загрузка...</Spin>
//     </Skeleton>
//   </div>
// );
export const MapSkeleton = () => (
  <div
    className="map-container"
    style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
  >
    {/* <div 
    className="map-container" 
    style={{ 
      height: '600px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#1a1a1a' // тёмный фон
    }} */}
    <span className={styles['loader']}></span>
  </div>
);

export const FlightStatsSkeleton = () => (
  <div className="chart-container">
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} active paragraph={{ rows: 4 }} />
      ))}
    </Space>
  </div>
);

export const ChartSkeleton = () => <Skeleton active paragraph={{ rows: 4 }} />;

export const ChartsSkeletonStatistics = ({ count }) => (
  <Space direction="vertical" size="large" style={{ width: '100%' }}>
    {[...Array(count)].map((_, index) => (
      <ChartSkeleton key={index} />
    ))}
  </Space>
);
