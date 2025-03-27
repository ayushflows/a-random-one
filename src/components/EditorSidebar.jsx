import React, { useState } from 'react';
import { Database, Table, BookOpen, Clock, ChevronRight, Plus } from 'lucide-react';
import styles from '../styles/EditorSidebar.module.css';
import AddTableModal from './AddTableModal';

const EditorSidebar = ({ database, predefinedQueries, pastQueries, selectedTable, onTableSelect, onQuerySelect, onAddTable }) => {
  const [isAddTableModalOpen, setIsAddTableModalOpen] = useState(false);

  const handleAddTable = async (tableData) => {
    try {
      await onAddTable(tableData);
      setIsAddTableModalOpen(false);
    } catch (error) {
      console.error('Error adding table:', error);
      // You might want to show an error message to the user
    }
  };

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
          <div className={styles.sectionTitle}>
            <Table size={18} />
            <h3>Tables</h3>
          </div>
          <button 
            className={styles.addButton}
            onClick={() => setIsAddTableModalOpen(true)}
            title="Add new table"
          >
            <Plus size={25} />
          </button>
        </div>
        {database.tables.map(table => (
          <div
            key={table.name}
            className={`${styles.tableItem} ${selectedTable?.name === table.name ? styles.activeTable : ''}`}
            onClick={() => onTableSelect(table)}
          >
            <span>{table.name}</span>
            <ChevronRight size={16} />
          </div>
        ))}
      </div>

      <div className={`${styles.section} ${styles.savedQueries}`}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            <BookOpen size={18} />
            <h3>Saved Queries</h3>
          </div>
        </div>
        {predefinedQueries.map(query => (
          <div
            key={query.name}
            className={styles.savedQueryItem}
            onClick={() => onQuerySelect(query.query)}
            title={query.description}
          >
            <span>{query.name}</span>
          </div>
        ))}
      </div>

      <div className={`${styles.section} ${styles.pastQueries}`}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            <Clock size={18} />
            <h3>Recent Queries</h3>
          </div>
        </div>
        {pastQueries.length === 0 ? (
          <p className={styles.emptyMessage}>No past queries</p>
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

      <AddTableModal
        isOpen={isAddTableModalOpen}
        onClose={() => setIsAddTableModalOpen(false)}
        onAddTable={handleAddTable}
      />
    </div>
  );
};

export default EditorSidebar;
