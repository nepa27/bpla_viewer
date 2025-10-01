import { Skeleton, Space } from 'antd';

export const MapSkeleton = () => (
  <div className="map-container">
    <Skeleton active paragraph={{ rows: 0 }} style={{ height: '600px' }} />
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
