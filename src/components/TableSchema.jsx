import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Table, Database, Plus, Trash2, Settings } from 'lucide-react';
import { writeCsvFile, readCsvFile } from '../services/csvService';
import styles from '../styles/TableSchema.module.css';
import AddRowModal from './AddRowModal';

const TableSchema = ({ selectedTable, isSchemaVisible, setIsSchemaVisible }) => {
  const [isAddRowModalOpen, setIsAddRowModalOpen] = useState(false);
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const initializeData = async () => {
      if (selectedTable) {
        const storedData = await readCsvFile(selectedTable.name);
        if (!storedData) {
          // Initialize with demo data if no stored data exists
          await writeCsvFile(selectedTable.name, selectedTable.initialData);
          setTableData(selectedTable.initialData);
        } else {
          setTableData(storedData);
        }
      }
    };

    initializeData();
  }, [selectedTable]);

  const handleAddRow = async (newRow) => {
    // Generate new ID for the row if needed
    const lastId = Math.max(...tableData.map(row => row[`${selectedTable.name.slice(0, -1)}_id`]), 0);
    const newRowWithId = {
      [`${selectedTable.name.slice(0, -1)}_id`]: lastId + 1,
      ...newRow
    };

    // Convert string values to proper types
    const typedRow = {};
    selectedTable.columns.forEach(column => {
      const value = newRowWithId[column.name];
      if (column.type.includes('INT')) {
        typedRow[column.name] = parseInt(value, 10);
      } else if (column.type.includes('DECIMAL')) {
        typedRow[column.name] = parseFloat(value);
      } else {
        typedRow[column.name] = value;
      }
    });

    const updatedData = [...tableData, typedRow];
    const success = await writeCsvFile(selectedTable.name, updatedData);
    
    if (success) {
      setTableData(updatedData);
    } else {
      console.error('Failed to save new row');
    }
  };

  const handleDeleteRow = async (idToDelete) => {
    const idColumnName = `${selectedTable.name.slice(0, -1)}_id`;
    const updatedData = tableData.filter(row => row[idColumnName] !== idToDelete);
    
    const success = await writeCsvFile(selectedTable.name, updatedData);
    if (success) {
      setTableData(updatedData);
    } else {
      console.error('Failed to delete row');
    }
  };

  return (
    <div className={`${styles.tableSchema} ${isSchemaVisible ? '' : styles.collapsed}`}>
      <div className={styles.stickyHeader}>
        <button
          className={styles.toggleButton}
          onClick={() => setIsSchemaVisible(!isSchemaVisible)}
          title={isSchemaVisible ? "Hide schema" : "Show schema"}
        >
          {isSchemaVisible ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
        
        {isSchemaVisible && (
          <div className={styles.tableSchemaHeader}>
            <Database size={25} />
            <h3>{selectedTable.name}</h3>
          </div>
        )}
      </div>

      {isSchemaVisible && (
        <div className={styles.schemaContent}>
          <div className={styles.schemaSection}>
            <h3>
              <Table size={14} className={styles.sectionIcon} /> Structure
            </h3>
            <div className={styles.tableWrapper}>
              <table>
                <thead>
                  <tr>
                    <th>Column</th>
                    <th>Type</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTable.columns.map((column) => (
                    <tr key={column.name}>
                      <td>{column.name}</td>
                      <td>{column.type}</td>
                      <td>{column.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.schemaSection}>
            <div className={styles.sectionHeaderWithAction}>
              <h3>
                <Database size={14} className={styles.sectionIcon} /> Sample Data
              </h3>
              <button 
                className={styles.addRowButton}
                onClick={() => setIsAddRowModalOpen(true)}
                title="Add new row"
              >
                <Plus size={14} />
                Add Row
              </button>
            </div>
            <div className={styles.tableWrapper}>
              <table>
                <thead>
                  <tr>
                    <th className={styles.actionColumn}>
                      <Settings size={16} className={styles.actionIcon} />
                    </th>
                    {selectedTable.columns.map((column) => (
                      <th key={column.name}>{column.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, index) => (
                    <tr key={index}>
                      <td className={styles.actionColumn}>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDeleteRow(row[`${selectedTable.name.slice(0, -1)}_id`])}
                          title="Delete row"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                      {selectedTable.columns.map((column) => (
                        <td key={column.name}>{row[column.name]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <AddRowModal
        isOpen={isAddRowModalOpen}
        onClose={() => setIsAddRowModalOpen(false)}
        columns={selectedTable.columns}
        onAddRow={handleAddRow}
      />
    </div>
  );
};

export default TableSchema;