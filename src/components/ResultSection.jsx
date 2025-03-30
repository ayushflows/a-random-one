import React, { useState, useEffect, useRef } from 'react';
import { fetchPaginatedData } from '../api/TableDataApi';
import { FileJson, FileText, Loader, ChevronRight, Table as TableIcon, BarChart2, PieChart, LineChart, MoreVertical, Maximize2, Minimize2, ChevronLeft } from 'lucide-react';
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
import editorSidebarStyles from '../styles/EditorSidebar.module.css';
import tableSchemaStyles from '../styles/TableSchema.module.css';

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
  const [isCustomFullScreen, setIsCustomFullScreen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [rowsPerPageOptions] = useState([5, 10, 20, 50, 100]);

  // Calculate total pages
  const totalPages = Math.ceil(queryResults.length / itemsPerPage);
  
  // Get current page data
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return queryResults.slice(startIndex, endIndex);
  };

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

  // Update page change handler
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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
    // Use current page data instead of limited data
    const currentPageData = getCurrentPageData();
    if (!currentPageData || currentPageData.length === 0) return null;

    const columns = Object.keys(currentPageData[0]);
    const numericColumns = columns.filter(col => 
      currentPageData.every(row => !isNaN(row[col]) && !col.toLowerCase().includes('id'))
    );
    const categoricalColumns = columns.filter(col => 
      isNaN(currentPageData[0][col]) && !col.toLowerCase().includes('id')
    );

    const getChartColors = (count) => {
      const colors = [
        '#10B981', // Green
        '#3B82F6', // Blue
        '#EC4899', // Pink
        '#8B5CF6', // Purple
        '#F59E0B', // Orange
        '#6366F1', // Indigo
        '#06B6D4', // Cyan
        '#EF4444', // Red
        '#14B8A6', // Teal
        '#F472B6', // Light Pink
      ];
      return Array(count).fill().map((_, i) => colors[i % colors.length]);
    };

    switch (type) {
      case 'bar': {
        const categoryCol = categoricalColumns[0];
        const numericCol = numericColumns[0];
        
        // Group and aggregate data using all current page data
        const groupedData = currentPageData.reduce((acc, row) => {
          const category = String(row[categoryCol]).substring(0, 20);
          if (!acc[category]) {
            acc[category] = { total: 0, count: 0 };
          }
          acc[category].total += Number(row[numericCol]) || 0;
          acc[category].count += 1;
          return acc;
        }, {});

        const sortedEntries = Object.entries(groupedData)
          .sort(([, a], [, b]) => b.total - a.total);

        const colors = getChartColors(sortedEntries.length);

        return {
          data: {
            labels: sortedEntries.map(([label]) => label),
            datasets: [{
              label: `Total ${numericCol}`,
              data: sortedEntries.map(([, value]) => value.total),
              backgroundColor: colors.map(c => `${c}99`),
              borderColor: colors,
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  color: 'var(--text-color)',
                  font: {
                    size: 12
                  }
                }
              },
              tooltip: {
                backgroundColor: 'var(--editor-bg-color)',
                titleColor: 'var(--text-color)',
                bodyColor: 'var(--text-color)',
                borderColor: 'var(--border-color)',
                borderWidth: 1,
                callbacks: {
                  label: (context) => {
                    const value = context.raw;
                    return `${context.dataset.label}: ${value >= 1000 ? 
                      `${(value/1000).toFixed(1)}K` : 
                      value.toFixed(1)}`;
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'var(--border-color)',
                  drawBorder: false
                },
                ticks: {
                  color: 'var(--text-color)',
                  font: {
                    size: 11
                  },
                  callback: (value) => {
                    if (value >= 1000000) return `${(value/1000000).toFixed(1)}M`;
                    if (value >= 1000) return `${(value/1000).toFixed(1)}K`;
                    return value;
                  }
                }
              },
              x: {
                grid: {
                  color: 'var(--border-color)',
                  drawBorder: false
                },
                ticks: {
                  color: 'var(--text-color)',
                  font: {
                    size: 11
                  },
                  maxRotation: 45,
                  minRotation: 45
                }
              }
            }
          }
        };
      }

      case 'pie': {
        const numericCol = numericColumns[0];
        const categoryCol = categoricalColumns[0];

        // Use all current page data for pie chart
        const groupedData = currentPageData.reduce((acc, row) => {
          const category = String(row[categoryCol]).substring(0, 20);
          if (!acc[category]) {
            acc[category] = 0;
          }
          acc[category] += Number(row[numericCol]) || 0;
          return acc;
        }, {});

        const sortedEntries = Object.entries(groupedData)
          .sort(([, a], [, b]) => b - a);

        const total = sortedEntries.reduce((sum, [, value]) => sum + value, 0);
        const colors = getChartColors(sortedEntries.length);

        return {
          data: {
            labels: sortedEntries.map(([label, value]) => {
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label} (${percentage}%)`;
            }),
            datasets: [{
              data: sortedEntries.map(([, value]) => value),
              backgroundColor: colors.map(c => `${c}99`),
              borderColor: colors,
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
                  color: 'var(--text-color)',
                  font: {
                    size: 11
                  },
                  padding: 10
                }
              },
              tooltip: {
                backgroundColor: 'var(--editor-bg-color)',
                titleColor: 'var(--text-color)',
                bodyColor: 'var(--text-color)',
                borderColor: 'var(--border-color)',
                borderWidth: 1,
                callbacks: {
                  label: (context) => {
                    const value = context.raw;
                    const percentage = ((value / total) * 100).toFixed(1);
                    return `${percentage}% (${value >= 1000 ? 
                      `${(value/1000).toFixed(1)}K` : 
                      value.toFixed(1)})`;
                  }
                }
              }
            }
          }
        };
      }

      case 'scatter': {
        const [xAxis, yAxis] = numericColumns.slice(0, 2);
        const categoryCol = categoricalColumns[0];
        
        // Use all current page data for scatter plot
        let datasets;
        if (categoryCol) {
          const groupedData = currentPageData.reduce((acc, row) => {
            const category = String(row[categoryCol]);
            if (!acc[category]) {
              acc[category] = [];
            }
            acc[category].push({
              x: Number(row[xAxis]),
              y: Number(row[yAxis])
            });
            return acc;
          }, {});

          const colors = getChartColors(Object.keys(groupedData).length);
          datasets = Object.entries(groupedData).map(([category, points], i) => ({
            label: category,
            data: points,
            backgroundColor: `${colors[i]}99`,
            borderColor: colors[i],
            pointRadius: 6,
            pointHoverRadius: 8
          }));
        } else {
          datasets = [{
            label: `${yAxis} vs ${xAxis}`,
            data: currentPageData.map(row => ({
              x: Number(row[xAxis]),
              y: Number(row[yAxis])
            })),
            backgroundColor: '#6366F199',
            borderColor: '#6366F1',
            pointRadius: 6,
            pointHoverRadius: 8
          }];
        }

        return {
          data: { datasets },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  color: 'var(--text-color)',
                  font: {
                    size: 11
                  }
                }
              },
              tooltip: {
                backgroundColor: 'var(--editor-bg-color)',
                titleColor: 'var(--text-color)',
                bodyColor: 'var(--text-color)',
                borderColor: 'var(--border-color)',
                borderWidth: 1
              }
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: xAxis,
                  color: 'var(--text-color)',
                  font: {
                    size: 12
                  }
                },
                grid: {
                  color: 'var(--border-color)',
                  drawBorder: false
                },
                ticks: {
                  color: 'var(--text-color)',
                  font: {
                    size: 11
                  }
                }
              },
              y: {
                title: {
                  display: true,
                  text: yAxis,
                  color: 'var(--text-color)',
                  font: {
                    size: 12
                  }
                },
                grid: {
                  color: 'var(--border-color)',
                  drawBorder: false
                },
                ticks: {
                  color: 'var(--text-color)',
                  font: {
                    size: 11
                  }
                }
              }
            }
          }
        };
      }

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

  const toggleFullScreen = () => {
    // Get both sidebar elements using the correct class names
    const editorSidebar = document.querySelector(`.${styles.sidebarWrapper}`);
    const schemaWrapper = document.querySelector(`.${styles.schemaWrapper}`);
    const sidebarToggle = document.querySelector(`.${styles.sidebarToggle}`);
    const schemaToggle = document.querySelector(`.${styles.schemaToggle}`);

    if (!isCustomFullScreen) {
      // Entering fullscreen
      editorSidebar?.classList.add(styles.collapsed);
      schemaWrapper?.classList.add(styles.collapsed);
      // Hide the toggle buttons
      sidebarToggle?.style.setProperty('display', 'none');
      schemaToggle?.style.setProperty('display', 'none');
    } else {
      // Exiting fullscreen
      // Only restore sidebars if they weren't collapsed before
      if (!localStorage.getItem('sidebarCollapsed')) {
        editorSidebar?.classList.remove(styles.collapsed);
      }
      if (!localStorage.getItem('schemaCollapsed')) {
        schemaWrapper?.classList.remove(styles.collapsed);
      }
      // Restore toggle buttons
      sidebarToggle?.style.removeProperty('display');
      schemaToggle?.style.removeProperty('display');
    }

    setIsCustomFullScreen(!isCustomFullScreen);
  };

  // Add useEffect to store sidebar states
  useEffect(() => {
    if (isCustomFullScreen) {
      // Store current sidebar states before going fullscreen
      const editorSidebar = document.querySelector(`.${styles.sidebarWrapper}`);
      const schemaWrapper = document.querySelector(`.${styles.schemaWrapper}`);
      
      localStorage.setItem('sidebarCollapsed', editorSidebar?.classList.contains(styles.collapsed));
      localStorage.setItem('schemaCollapsed', schemaWrapper?.classList.contains(styles.collapsed));
    } else {
      // Clean up storage when exiting fullscreen
      localStorage.removeItem('sidebarCollapsed');
      localStorage.removeItem('schemaCollapsed');
    }
  }, [isCustomFullScreen]);

  const ResultContent = () => (
    <>
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
              <div className={styles.desktopActions}>
                <button onClick={exportToJson} className={styles.exportButton} title="Export as JSON">
                  <FileJson size={16} className={styles.icon} />
                  JSON
                </button>
                <button onClick={exportToCsv} className={styles.exportButton} title="Export as CSV">
                  <FileText size={16} className={styles.icon} />
                  CSV
                </button>
                <button 
                  onClick={toggleFullScreen} 
                  className={styles.exportButton} 
                  title={isCustomFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                  {isCustomFullScreen ? <Minimize2 size={16} className={styles.icon} /> : <Maximize2 size={16} className={styles.icon} />}
                </button>
              </div>
              
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
                    <button onClick={() => { toggleFullScreen(); setShowExportDropdown(false); }}>
                      {isCustomFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                      {isCustomFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
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
                  {getCurrentPageData().map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <td className={styles.serialNumberColumn}>
                        {(currentPage - 1) * itemsPerPage + rowIndex + 1}
                      </td>
                      {Object.values(row).map((cell, cellIndex) => (
                        <td key={cellIndex} title={cell !== null ? cell.toString() : 'NULL'}>
                          {cell !== null ? cell : 'NULL'}
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
            className={styles.pageButton}
          >
            <ChevronLeft size={16} />
          </button>
          
          <span className={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={styles.pageButton}
          >
            <ChevronRight size={16} />
          </button>

          <div className={styles.rowsPerPageControl}>
            <select 
              value={itemsPerPage} 
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1); // Reset to first page when changing items per page
              }}
              className={styles.rowsPerPageSelect}
            >
              {rowsPerPageOptions.map(option => (
                <option key={option} value={option}>
                  {option} rows
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      <div className={styles.resultsSection}>
        <ResultContent />
      </div>

      <div className={`${styles.fullscreenOverlay} ${isCustomFullScreen ? styles.active : ''}`}>
        <div className={styles.fullscreenContent}>
          <ResultContent />
        </div>
      </div>
    </>
  );
};

export default ResultSection;
