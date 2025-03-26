import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from '../styles/SqlEditor.module.css';

const TableSchema = ({ selectedTable, isSchemaVisible, setIsSchemaVisible }) => {
  return (<>
          <button className={`${styles.toggleButton} ${isSchemaVisible ? styles.closeButton : styles.openButton}`} onClick={() => setIsSchemaVisible(!isSchemaVisible)}>
            {isSchemaVisible ? <ChevronRight /> : <ChevronLeft />}
          </button>
    <div className={`${styles.tableSchema} ${isSchemaVisible ? '' : styles.collapsed}`}>
      {isSchemaVisible && (
        <>
          <div className={styles.tableSchemaHeader}>
            <h3>Table Schema: {selectedTable.name}</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>Column</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {selectedTable.columns.map(column => (
                <tr key={column.name}>
                  <td>{column.name}</td>
                  <td>{column.type}</td>
                  <td>{column.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
    </>
  );
};

export default TableSchema;
