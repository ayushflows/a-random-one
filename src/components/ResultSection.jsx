import React, { useState, useEffect } from 'react';
import { fetchPaginatedData } from '../api/TableDataApi';
import { FileJson, FileText, Loader } from 'lucide-react';
import styles from '../styles/ResultSection.module.css';

const ResultSection = ({ queryResults, isLoading, error }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedResults, setPaginatedResults] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const pageSize = 5;

  useEffect(() => {
    setCurrentPage(1);
    setSortConfig({ key: null, direction: 'asc' });
  }, [queryResults]);

  useEffect(() => {
    let sortedData = [...(queryResults || [])]; // Handle null/undefined queryResults
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
  }, [queryResults, currentPage, sortConfig]);

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


  return (
    <div className={styles.resultsSection}>
      <div className={styles.resultHeader}>
        <h4>Output</h4>
        <div className={styles.resultActions}>
          <button onClick={exportToJson} className={styles.exportButton} title="Export as JSON">
            <FileJson size={16} className={styles.icon} />
            JSON
          </button>
          <button onClick={exportToCsv} className={styles.exportButton} title="Export as CSV">
            <FileText size={16} className={styles.icon} />
            CSV
          </button>
        </div>
      </div>

      <div className={styles.resultsTableContainer}>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <Loader size={24} className={styles.spinner} />
            <p>Executing query...</p>
          </div>
        ) : error ? (
          <div className={styles.errorMessage}>
            <h4>Error executing query:</h4>
            <pre>{error}</pre>
          </div>
        ) : paginatedResults.length > 0 ? (
          <table className={styles.resultsTable}>
            <thead>
              <tr>
                {Object.keys(paginatedResults[0]).map((key) => (
                  <th key={key}>
                    {key}
                    <button
                      className={styles.sortButton}
                      onClick={() => handleSort(key)}
                      title={`Sort by ${key}`}
                    >
                      {sortConfig.key === key
                        ? sortConfig.direction === 'asc'
                          ? '▲'
                          : '▼'
                        : '↕'}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedResults.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, i) => (
                    <td key={i}>{value !== null ? value : 'NULL'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
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
            Page {currentPage} of {Math.ceil(totalRows / pageSize)}
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
