import React from 'react';
import styles from '../styles/ResultSection.module.css';

const ResultSection = ({ queryResults }) => {
  return (
    <div className={styles.resultsSection}>
      <div className={styles.resultHeader}>
        <h4>Output</h4>
        <div className={styles.resultActions}>

        </div>
      </div>
      <div className={styles.resultsTableContainer}>
        {queryResults.length > 0 && (
          <table className={styles.resultsTable}>
            <thead>
              <tr>
                {Object.keys(queryResults[0]).map(key => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {queryResults.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, i) => (
                    <td key={i}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ResultSection;
