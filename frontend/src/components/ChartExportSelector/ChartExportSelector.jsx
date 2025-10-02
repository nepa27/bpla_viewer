/* eslint-disable no-unused-vars */
import { DownloadOutlined } from '@ant-design/icons';
import { Button, Select, Space } from 'antd';

import { memo, useCallback, useState } from 'react';

import { useFileExcelDownload } from '../../hooks/useFileExcelDownload';
import { BtnCustom } from '../../ui/BtnCustom/BtnCustom';
import { exportChartByType, exportOptions } from '../../utils/exportUtilsRegions';
import { convertDatesToReadableFormat } from '../../utils/functions';

const ChartExportSelector = memo(({ chartsData, dateRange }) => {
  const [selectedType, setSelectedType] = useState('all');

  const [loadingPPTX, setLoadingPPTX] = useState(false);

  const { mutate: downloadExcel, isPending: loadingExcel } = useFileExcelDownload();

  const handlePPTXExport = useCallback(async () => {
    setLoadingPPTX(true);
    try {
      const date = convertDatesToReadableFormat(dateRange);
      await exportChartByType(selectedType, chartsData, date);
    } finally {
      setLoadingPPTX(false);
    }
  }, [chartsData, dateRange, selectedType]);

  const handleExcelExport = useCallback(() => {
    if (dateRange) {
      downloadExcel(dateRange);
    }
  }, [dateRange, downloadExcel]);

  return (
    <Space>
      <Select
        options={exportOptions}
        value={selectedType}
        onChange={setSelectedType}
        style={{ width: 200 }}
      />
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
