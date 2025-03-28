import React, { useState, useEffect, useRef } from 'react';
import { fetchPaginatedData } from '../api/TableDataApi';
import { FileJson, FileText, Loader, ChevronRight, Table as TableIcon, BarChart2, PieChart, LineChart, MoreVertical } from 'lucide-react';
import styles from '../styles/ResultSection.module.css';
import { Bar, Pie, Scatter } from 'react-chartjs-2';
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
  const [showExportDropdown, setShowExportDropdown] = useState(false);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportDropdown && !event.target.closest(`.${styles.mobileActions}`)) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportDropdown]);

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
    if (!data || data.length === 0) return ['table'];
    
    const columns = Object.keys(data[0]);
    const types = columns.map(col => ({
      name: col,
      isNumeric: data.every(row => !isNaN(row[col]) && !col.toLowerCase().includes('id')),
      isDate: data.every(row => !isNaN(Date.parse(row[col]))),
      values: data.map(row => row[col])
    }));

    const numericColumns = types.filter(t => t.isNumeric);
    const categoricalColumns = types.filter(t => !t.isNumeric && !t.isDate);
    const chartTypes = ['table'];

    // For Bar Chart
    if (numericColumns.length >= 1 && categoricalColumns.length >= 1) {
      chartTypes.push('bar');
    }

    // For Pie Chart - more strict conditions
    if (numericColumns.length >= 1 && categoricalColumns.length >= 1) {
      const numericValues = data.map(row => Number(row[numericColumns[0].name]) || 0);
      const sum = numericValues.reduce((a, b) => a + b, 0);
      const uniqueCategories = new Set(data.map(row => row[categoricalColumns[0].name])).size;
      
      // Only show pie chart if:
      // 1. We have positive values
      // 2. Not too many categories (max 10)
      // 3. All numeric values are valid
      if (sum > 0 && uniqueCategories <= 10 && numericValues.every(v => !isNaN(v))) {
        chartTypes.push('pie');
      }
    }

    // For Scatter Plot
    if (numericColumns.length >= 2) {
      chartTypes.push('scatter');
    }

    return chartTypes;
  };

  const generateChartConfig = (type, data) => {
    if (!data || data.length === 0) return null;

    const columns = Object.keys(data[0]);
    const numericColumns = columns.filter(col => 
      data.every(row => !isNaN(row[col]) && !col.toLowerCase().includes('id'))
    );
    const categoricalColumns = columns.filter(col => 
      isNaN(data[0][col]) && !col.toLowerCase().includes('id')
    );

    switch (type) {
      case 'bar':
        const categoryCol = categoricalColumns[0];
        return {
          data: {
            labels: data.map(row => String(row[categoryCol]).substring(0, 20)), // Truncate long labels
            datasets: numericColumns.map(col => ({
              label: col,
              data: data.map(row => row[col]),
              backgroundColor: getRandomColor(0.6),
              borderColor: getRandomColor(1),
              borderWidth: 1
            }))
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: (value) => {
                    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                    if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
                    return value;
                  }
                }
              },
              x: {
                ticks: {
                  maxRotation: 45,
                  minRotation: 45
                }
              }
            },
            plugins: {
              legend: {
                position: 'top'
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    let value = context.raw;
                    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
                    if (value >= 1000) return `${(value / 1000).toFixed(2)}K`;
                    return value;
                  }
                }
              }
            }
          }
        };

      case 'pie':
        // Find first numeric and categorical columns
        const numericColumn = numericColumns[0];
        const categoryColumn = categoricalColumns[0];
        
        if (!numericColumn || !categoryColumn) return null;

        // Group and sum the data
        const groupedData = data.reduce((acc, row) => {
          const category = String(row[categoryColumn]).substring(0, 20); // Truncate long labels
          const value = Number(row[numericColumn]) || 0;
          
          if (!acc[category]) {
            acc[category] = value;
          } else {
            acc[category] += value;
          }
          return acc;
        }, {});

        // Calculate total for percentages
        const total = Object.values(groupedData).reduce((sum, value) => sum + value, 0);

        // Prepare data for chart
        const labels = Object.keys(groupedData);
        const values = Object.values(groupedData);
        const backgroundColors = labels.map(() => getRandomColor(0.7));
        const borderColors = labels.map(() => getRandomColor(1));

        return {
          data: {
            labels: labels.map(label => {
              const value = groupedData[label];
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label} (${percentage}%)`;
            }),
            datasets: [{
              data: values,
              backgroundColor: backgroundColors,
              borderColor: borderColors,
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  boxWidth: 15,
                  padding: 15,
                  font: {
                    size: 11
                  }
                }
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const value = context.raw;
                    const percentage = ((value / total) * 100).toFixed(1);
                    let label = `${context.label.split(' (')[0]}: `;
                    
                    if (value >= 1000000) {
                      label += `${(value / 1000000).toFixed(2)}M`;
                    } else if (value >= 1000) {
                      label += `${(value / 1000).toFixed(2)}K`;
                    } else {
                      label += value.toFixed(2);
                    }
                    
                    label += ` (${percentage}%)`;
                    return label;
                  }
                }
              }
            }
          }
        };

      case 'scatter':
        const [xAxis, yAxis] = numericColumns.slice(0, 2);
        return {
          data: {
            datasets: [{
              label: `${yAxis} vs ${xAxis}`,
              data: data.map(row => ({
                x: row[xAxis],
                y: row[yAxis]
              })),
              backgroundColor: getRandomColor(0.6),
              borderColor: getRandomColor(1),
              borderWidth: 1,
              pointRadius: 6,
              pointHoverRadius: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                title: {
                  display: true,
                  text: xAxis
                }
              },
              y: {
                title: {
                  display: true,
                  text: yAxis
                }
              }
            },
            plugins: {
              legend: {
                position: 'top'
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const xValue = context.raw.x;
                    const yValue = context.raw.y;
                    return `${xAxis}: ${xValue}, ${yAxis}: ${yValue}`;
                  }
                }
              }
            }
          }
        };

      default:
        return null;
    }
  };

  const getRandomColor = (opacity) => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
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
              <span className={styles.tabText}>Table</span>
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
                <span className={styles.tabText}>Bar</span>
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
                <span className={styles.tabText}>Pie</span>
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
                <span className={styles.tabText}>Scatter</span>
              </button>
            )}
          </div>
        </div>
        <div className={styles.resultActions}>
          {!error && queryResults.length > 0 && (
            <>
              {/* Desktop Actions */}
              <div className={styles.desktopActions}>
                <button onClick={exportToJson} className={styles.exportButton} title="Export as JSON">
                  <FileJson size={16} className={styles.icon} />
                  JSON
                </button>
                <button onClick={exportToCsv} className={styles.exportButton} title="Export as CSV">
                  <FileText size={16} className={styles.icon} />
                  CSV
                </button>
              </div>
              
              {/* Mobile Actions */}
              <div className={styles.mobileActions}>
                <button 
                  className={styles.moreButton} 
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  title="Export Options"
                >
                  <MoreVertical size={20} />
                </button>
                {showExportDropdown && (
                  <div className={styles.exportDropdown}>
                    <button onClick={() => { exportToJson(); setShowExportDropdown(false); }}>
                      <FileJson size={16} />
                      Export as JSON
                    </button>
                    <button onClick={() => { exportToCsv(); setShowExportDropdown(false); }}>
                      <FileText size={16} />
                      Export as CSV
                    </button>
                  </div>
                )}
              </div>
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
                <div className={styles.chartWrapper}>
                  {chartType === 'bar' && <Bar data={chartConfig.data} options={chartConfig.options} />}
                  {chartType === 'pie' && <Pie data={chartConfig.data} options={chartConfig.options} />}
                  {chartType === 'scatter' && <Scatter data={chartConfig.data} options={chartConfig.options} />}
                </div>
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
