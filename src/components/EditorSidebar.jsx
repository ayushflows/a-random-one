import React from 'react';
import { Database, Table, BookOpen, Clock } from 'lucide-react';
import styles from '../styles/EditorSidebar.module.css';

const EditorSidebar = ({ database, predefinedQueries, pastQueries, selectedTable, onTableSelect, onQuerySelect }) => {
  return (
    <div className={styles.sidebar}>
      <div className={styles.databaseInfo}>
        <h2>
          <Database size={20} />
          {database.name}
        </h2>
      </div>

      <div className={`${styles.section} ${styles.tableList}`}>
        <div className={styles.sectionHeader}>
          <Table size={18} />
          <h3>Tables</h3>
        </div>
        {database.tables.map(table => (
          <div
            key={table.name}
            className={`${styles.tableItem} ${selectedTable?.name === table.name ? styles.activeTable : ''}`}
            onClick={() => onTableSelect(table)}
          >
            {table.name}
            <span>{table.sampleRowCount} rows</span>
          </div>
        ))}
      </div>

      <div className={`${styles.section} ${styles.savedQueries}`}>
        <div className={styles.sectionHeader}>
          <BookOpen size={18} />
          <h3>Saved Queries</h3>
        </div>
        {predefinedQueries.map(query => (
          <div
            key={query.id}
            className={styles.savedQueryItem}
            onClick={() => onQuerySelect(query.query)}
          >
            {query.name}
          </div>
        ))}
      </div>

      <div className={`${styles.section} ${styles.pastQueries}`}>
        <div className={styles.sectionHeader}>
          <Clock size={18} />
          <h3>Past Queries</h3>
        </div>
        {pastQueries.length === 0 ? (
          <p>No past queries</p>
        ) : (
          pastQueries.slice(0, 5).map((query, index) => (
            <div
              key={index}
              className={styles.pastQueryItem}
              onClick={() => onQuerySelect(query)}
              title={query}
            >
              {query.length > 50 ? `${query.slice(0, 47)}...` : query}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EditorSidebar;
