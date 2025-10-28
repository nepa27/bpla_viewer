/* eslint-disable no-unused-vars */
import { DownloadOutlined } from '@ant-design/icons';
import { Space } from 'antd';

import { memo, useCallback, useState } from 'react';

import { useMapExport } from '../../hooks/useMapExport';
import { BtnCustom } from '../../ui/BtnCustom/BtnCustom';
import { exportRegionChartByType } from '../../utils/exportUtilsOneRegion';
import { convertDatesToReadableFormat } from '../../utils/functions';

const ChartExportSelectorRegion = memo(({ regionName, chartsData, dateRange }) => {
  const [loadingPPTX, setLoadingPPTX] = useState(false);
  const { exportMapWithLegend } = useMapExport();

  const handlePPTXExport = useCallback(async () => {
    setLoadingPPTX(true);
    try {
      const date = convertDatesToReadableFormat(dateRange);
      const base64Image = await exportMapWithLegend();

      await exportRegionChartByType('all-region', regionName, chartsData, date, base64Image);
    } finally {
      setLoadingPPTX(false);
    }
  }, [chartsData, regionName, dateRange, exportMapWithLegend]);

  return (
    <Space style={{ marginBottom: '16px' }}>
      <BtnCustom icon={<DownloadOutlined />} onClick={handlePPTXExport} loading={loadingPPTX}>
        Экспорт в pptx
      </BtnCustom>
    </Space>
  );
});

export default ChartExportSelectorRegion;
