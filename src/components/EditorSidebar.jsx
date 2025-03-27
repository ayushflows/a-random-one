import React from 'react';
import { Database, Table, BookOpen, Clock } from 'lucide-react';
import styles from '../styles/EditorSidebar.module.css';

const EditorSidebar = ({ database, predefinedQueries, pastQueries, selectedTable, onTableSelect, onQuerySelect }) => {
  return (
    <div className={styles.sidebar}>
      <div className={styles.databaseInfo}>
        <h2><Database /> {database.name}</h2>
        <p>{database.description}</p>
      </div>
      <div className={styles.tableList}>
        <h3><Table /> Tables</h3>
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
      <div className={styles.savedQueries}>
        <h3><BookOpen /> Saved Queries</h3>
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
      <div className={styles.pastQueries}>
        <h3><Clock /> Past Queries</h3>
        {pastQueries.slice(0, 5).map((query, index) => (
          <div
            key={index}
            className={styles.pastQueryItem}
            onClick={() => onQuerySelect(query)}
            title={query}
          >
            {query.length > 50 ? `${query.slice(0, 50)}...` : query}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditorSidebar;
