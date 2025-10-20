import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ChartExportSelector from './ChartExportSelector';

// Используем vi.hoisted для создания переменных, которые будут доступны в фабриках моков
const mocks = vi.hoisted(() => {
  return {
    mockUseFileExcelDownload: {
      mutate: vi.fn(),
      isPending: false,
    },
    mockExportChartByType: vi.fn().mockResolvedValue(undefined),
    mockConvertDatesToReadableFormat: vi.fn().mockReturnValue('01.01.2025 - 01.10.2025'),
  };
});

// Моки модулей
vi.mock('../../hooks/useFileExcelDownload', () => ({
  useFileExcelDownload: () => mocks.mockUseFileExcelDownload,
}));

vi.mock('../../utils/functions', () => ({
  convertDatesToReadableFormat: mocks.mockConvertDatesToReadableFormat,
}));

describe('ChartExportSelector', () => {
  const mockChartsData = {
    dailyFlights: [],
    flightsByRegion: [],
    flightsDurationByRegion: [],
  };

  const mockDateRange = ['2025-01-01T00:00:00Z', '2025-10-01T00:00:00Z'];

  it('should render without crashing', () => {
    render(<ChartExportSelector chartsData={mockChartsData} dateRange={mockDateRange} />);

    expect(screen.getByText('Экспорт в pptx')).toBeInTheDocument();
    expect(screen.getByText('Экспорт в excel')).toBeInTheDocument();
  });

  it('should render export buttons', () => {
    render(<ChartExportSelector chartsData={mockChartsData} dateRange={mockDateRange} />);

    const pptxButton = screen.getByText('Экспорт в pptx');
    const excelButton = screen.getByText('Экспорт в excel');

    expect(pptxButton).toBeInTheDocument();
    expect(excelButton).toBeInTheDocument();
  });

  it('should call Excel export when Excel button is clicked', () => {
    render(<ChartExportSelector chartsData={mockChartsData} dateRange={mockDateRange} />);

    const excelButton = screen.getByText('Экспорт в excel');
    fireEvent.click(excelButton);

    expect(mocks.mockUseFileExcelDownload.mutate).toHaveBeenCalledWith(mockDateRange);
  });

  it('should handle empty date range properly', () => {
    render(<ChartExportSelector chartsData={mockChartsData} dateRange={null} />);

    expect(screen.getByText('Экспорт в pptx')).toBeInTheDocument();
    expect(screen.getByText('Экспорт в excel')).toBeInTheDocument();
  });

  it('should handle undefined date range properly', () => {
    render(<ChartExportSelector chartsData={mockChartsData} dateRange={undefined} />);

    expect(screen.getByText('Экспорт в pptx')).toBeInTheDocument();
    expect(screen.getByText('Экспорт в excel')).toBeInTheDocument();
  });

  it('should handle empty charts data', () => {
    const emptyChartsData = {
      dailyFlights: null,
      flightsByRegion: null,
      flightsDurationByRegion: null,
    };

    render(<ChartExportSelector chartsData={emptyChartsData} dateRange={mockDateRange} />);

    expect(screen.getByText('Экспорт в pptx')).toBeInTheDocument();
    expect(screen.getByText('Экспорт в excel')).toBeInTheDocument();
  });
});
