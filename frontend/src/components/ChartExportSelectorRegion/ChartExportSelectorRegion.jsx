/* eslint-disable no-unused-vars */
import { DownloadOutlined } from '@ant-design/icons';
import { Select, Space } from 'antd';

import { memo, useState } from 'react';

import { BtnCustom } from '../../ui/BtnCustom/BtnCustom';
import { exportOptionsRegion, exportRegionChartByType } from '../../utils/exportUtilsOneRegion';
import { convertDatesToReadableFormat } from '../../utils/functions';

const ChartExportSelectorRegion = memo(({ regionName, chartsData, dateRange }) => {
  const [selectedType, setSelectedType] = useState('all-region');
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const date = convertDatesToReadableFormat(dateRange);

      await exportRegionChartByType(selectedType, regionName, chartsData, date);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Space style={{ marginBottom: '16px' }}>
      <Select
        options={exportOptionsRegion}
        value={selectedType}
        onChange={setSelectedType}
        style={{ width: 200 }}
      />
      <BtnCustom icon={<DownloadOutlined />} onClick={handleExport} loading={loading}>
        Экспорт в pptx
      </BtnCustom>
    </Space>
  );
});

export default ChartExportSelectorRegion;
