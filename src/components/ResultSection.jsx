import React, { useState, useEffect } from 'react';
import { fetchPaginatedData } from '../api/TableDataApi';
import styles from '../styles/ResultSection.module.css';

const ResultSection = ({ queryResults }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedResults, setPaginatedResults] = useState([]);
  const [totalRows, setTotalRows] = useState(0);

  const pageSize = 5;

  useEffect(() => {
    const { rows, totalRows } = fetchPaginatedData(queryResults, currentPage, pageSize);
    setPaginatedResults(rows);
    setTotalRows(totalRows);
  }, [queryResults, currentPage]);

  const totalPages = Math.ceil(totalRows / pageSize);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className={styles.resultsSection}>
      <div className={styles.resultHeader}>
        <h4>Output</h4>
      </div>
      <div className={styles.resultsTableContainer}>
        {paginatedResults.length > 0 ? (
          <table className={styles.resultsTable}>
            <thead>
              <tr>
                {Object.keys(paginatedResults[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedResults.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, i) => (
                    <td key={i}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No results to display</p>
        )}
      </div>
      <div className={styles.paginationControls}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ResultSection;
