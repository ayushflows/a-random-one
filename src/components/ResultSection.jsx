import React, { useState, useEffect, useRef } from 'react';
import { fetchPaginatedData } from '../api/TableDataApi';
import { FileJson, FileText, Loader, ChevronRight, Table as TableIcon, BarChart2, PieChart, LineChart } from 'lucide-react';
import styles from '../styles/ResultSection.module.css';
import { Bar, Line, Pie, Scatter as ScatterChart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ResultSection = ({ queryResults, isLoading, error }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedResults, setPaginatedResults] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [viewMode, setViewMode] = useState('table');
  const [chartType, setChartType] = useState('bar');
  const [chartConfig, setChartConfig] = useState(null);
  const [pageSize, setPageSize] = useState(5);
  const resultsTableRef = useRef(null);

  useEffect(() => {
    setCurrentPage(1);
    setSortConfig({ key: null, direction: 'asc' });
  }, [queryResults]);

  useEffect(() => {
    const calculatePageSize = () => {
      if (!resultsTableRef.current) return;
      
      const containerHeight = resultsTableRef.current.clientHeight;
      const rowHeight = 41;
      const availableHeight = containerHeight - 50;
      const possibleRows = Math.floor(availableHeight / rowHeight);
      
      const newPageSize = Math.max(5, Math.min(20, possibleRows));
      setPageSize(newPageSize);
    };

    calculatePageSize();

    const resizeObserver = new ResizeObserver(calculatePageSize);
    if (resultsTableRef.current) {
      resizeObserver.observe(resultsTableRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    let sortedData = [...(queryResults || [])];
    if (sortConfig.key) {
      sortedData.sort((a, b) => {
        const aValue = a[sortConfig.key] ?? '';
        const bValue = b[sortConfig.key] ?? '';
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc'
            ? aValue - bValue
            : bValue - aValue;
        } else {
          return sortConfig.direction === 'asc'
            ? String(aValue).localeCompare(String(bValue))
            : String(bValue).localeCompare(String(aValue));
        }
      });
    }
    const { rows, totalRows } = fetchPaginatedData(sortedData, currentPage, pageSize);
    setPaginatedResults(rows);
    setTotalRows(totalRows);
  }, [queryResults, currentPage, sortConfig, pageSize]);

  const totalPages = Math.ceil(totalRows / pageSize);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const exportToJson = () => {
    const jsonData = JSON.stringify(paginatedResults, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'results.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToCsv = () => {
    if (!paginatedResults.length) return;
    
    try {
      const headers = Object.keys(paginatedResults[0]);
      const csvRows = paginatedResults.map(row => {
        return headers.map(header => {
          const value = row[header]?.toString() ?? '';
          const escaped = value.replace(/"/g, '""');
          return value.includes(',') || value.includes('"') 
            ? `"${escaped}"`
            : escaped;
        }).join(',');
      });

      const csvContent = [headers.join(','), ...csvRows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'query_results.csv';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  const detectChartTypes = (data) => {
    if (!data || data.length === 0) return [];
    
    const columns = Object.keys(data[0]);
    const suitableCharts = [];
    
    const numericColumns = columns.filter(col => 
      data.every(row => !isNaN(row[col]))
    );
    
    const dateColumns = columns.filter(col =>
      data.every(row => !isNaN(Date.parse(row[col])))
    );
    
    const categoricalColumns = columns.filter(col =>
      !numericColumns.includes(col) && !dateColumns.includes(col)
    );
    
    if (numericColumns.length > 0) {
      suitableCharts.push('bar', 'line');
      if (numericColumns.length >= 2) suitableCharts.push('scatter');
    }
    
    if (categoricalColumns.length > 0 && numericColumns.length > 0) {
      suitableCharts.push('pie');
    }
    
    return [...new Set(suitableCharts)];
  };

  const generateChartConfig = (type, data) => {
    if (!data || data.length === 0) return null;
    
    const columns = Object.keys(data[0]);
    const numericColumns = columns.filter(col => !isNaN(data[0][col]));
    const categoricalColumns = columns.filter(col => isNaN(data[0][col]));
    
    switch (type) {
      case 'bar':
        return {
          labels: data.map(row => row[categoricalColumns[0]]),
          datasets: [{
            label: numericColumns[0],
            data: data.map(row => row[numericColumns[0]]),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
          }],
        };
      case 'pie':
        return {
          labels: data.map(row => row[categoricalColumns[0]]),
          datasets: [{
            data: data.map(row => row[numericColumns[0]]),
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
            ],
          }],
        };
      default:
        return null;
    }
  };

  return (
    <div className={styles.resultsSection}>
      <div className={styles.resultHeader}>
        <div className={styles.headerLeft}>
          <h4 className={styles.outputTitle}>
            Output
            <ChevronRight size={14} />
          </h4>
          <div className={styles.visualizationTabs}>
            <button
              className={`${styles.viewTab} ${viewMode === 'table' ? styles.active : ''}`}
              onClick={() => setViewMode('table')}
              data-type="table"
            >
              <TableIcon size={16} />
              Table
            </button>
            {detectChartTypes(paginatedResults).includes('bar') && (
              <button
                className={`${styles.viewTab} ${viewMode === 'chart' && chartType === 'bar' ? styles.active : ''}`}
                onClick={() => {
                  setViewMode('chart');
                  setChartType('bar');
                  setChartConfig(generateChartConfig('bar', paginatedResults));
                }}
                data-type="bar"
              >
                <BarChart2 size={16} />
                Bar
              </button>
            )}
            {detectChartTypes(paginatedResults).includes('pie') && (
              <button
                className={`${styles.viewTab} ${viewMode === 'chart' && chartType === 'pie' ? styles.active : ''}`}
                onClick={() => {
                  setViewMode('chart');
                  setChartType('pie');
                  setChartConfig(generateChartConfig('pie', paginatedResults));
                }}
                data-type="pie"
              >
                <PieChart size={16} />
                Pie
              </button>
            )}
            {detectChartTypes(paginatedResults).includes('scatter') && (
              <button
                className={`${styles.viewTab} ${viewMode === 'chart' && chartType === 'scatter' ? styles.active : ''}`}
                onClick={() => {
                  setViewMode('chart');
                  setChartType('scatter');
                  setChartConfig(generateChartConfig('scatter', paginatedResults));
                }}
                data-type="scatter"
              >
                <LineChart size={16} />
                Scatter
              </button>
            )}
          </div>
        </div>
        <div className={styles.resultActions}>
          {!error && queryResults.length > 0 && (
            <>
              <button onClick={exportToJson} className={styles.exportButton} title="Export as JSON">
                <FileJson size={16} className={styles.icon} />
                JSON
              </button>
              <button onClick={exportToCsv} className={styles.exportButton} title="Export as CSV">
                <FileText size={16} className={styles.icon} />
                CSV
              </button>
            </>
          )}
        </div>
      </div>

      <div className={styles.resultsTableContainer} ref={resultsTableRef}>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <Loader size={24} className={styles.spinner} />
            <p>Executing query...</p>
          </div>
        ) : error ? (
          <div className={styles.errorMessage}>
            <h4>SQL Error</h4>
            <div className={styles.errorDetails}>
              <pre>{error}</pre>
              <p className={styles.errorHint}>
                Please check your SQL syntax and try again.
              </p>
            </div>
          </div>
        ) : paginatedResults.length > 0 ? (
          <>
            {viewMode === 'table' ? (
              <table className={styles.resultsTable}>
                <thead>
                  <tr>
                    <th className={styles.serialNumberColumn}>S.No</th>
                    {Object.keys(paginatedResults[0]).map((key) => (
                      <th key={key}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>{key}</span>
                          <button
                            className={styles.sortButton}
                            onClick={() => handleSort(key)}
                            title={`Sort by ${key}`}
                          >
                            {sortConfig.key === key
                              ? sortConfig.direction === 'asc'
                                ? '↑'
                                : '↓'
                              : '⇅'}
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedResults.map((row, index) => (
                    <tr key={index}>
                      <td className={styles.serialNumberColumn}>
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      {Object.values(row).map((value, i) => (
                        <td key={i} title={value !== null ? value.toString() : 'NULL'}>
                          {value !== null ? value : 'NULL'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className={styles.chartContainer}>
                {chartType === 'bar' && <Bar data={chartConfig} />}
                {chartType === 'pie' && <Pie data={chartConfig} />}
              </div>
            )}
          </>
        ) : (
          <p className={styles.message}>No results to display</p>
        )}
      </div>

      {totalRows > pageSize && (
        <div className={styles.paginationControls}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
          (showing {pageSize} rows per page)   Page {currentPage} of {Math.ceil(totalRows / pageSize)}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === Math.ceil(totalRows / pageSize)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ResultSection;
