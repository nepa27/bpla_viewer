/* eslint-disable no-unused-vars */
import { DownloadOutlined } from '@ant-design/icons';
import { Space } from 'antd';

import { memo, useCallback, useState } from 'react';

import { useFileExcelDownload } from '../../hooks/useFileExcelDownload';
import { useMapExport } from '../../hooks/useMapExport';
import { BtnCustom } from '../../ui/BtnCustom/BtnCustom';
import { exportChartByType } from '../../utils/exportUtilsRegions';
import { convertDatesToReadableFormat } from '../../utils/functions';

const ChartExportSelector = memo(({ chartsData, dateRange }) => {
  const [loadingPPTX, setLoadingPPTX] = useState(false);

  const { mutate: downloadExcel, isPending: loadingExcel } = useFileExcelDownload();
  const { exportMapWithLegend } = useMapExport();

  const handlePPTXExport = useCallback(async () => {
    setLoadingPPTX(true);
    try {
      const date = convertDatesToReadableFormat(dateRange);
      const base64Image = await exportMapWithLegend();

      await exportChartByType('all', chartsData, date, base64Image);
    } finally {
      setLoadingPPTX(false);
    }
  }, [chartsData, dateRange, exportMapWithLegend]);

  const handleExcelExport = useCallback(() => {
    if (dateRange) {
      downloadExcel(dateRange);
    }
  }, [dateRange, downloadExcel]);

  return (
    <Space>
      <BtnCustom icon={<DownloadOutlined />} onClick={handlePPTXExport} loading={loadingPPTX}>
        Экспорт в pptx
      </BtnCustom>
      <BtnCustom icon={<DownloadOutlined />} onClick={handleExcelExport} loading={loadingExcel}>
        Экспорт в excel
      </BtnCustom>
    </Space>
  );
});

export default ChartExportSelector;
