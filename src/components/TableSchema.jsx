import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Table, Database, Plus, Trash2, Settings, Columns, Check, X } from 'lucide-react';
import { writeCsvFile, readCsvFile } from '../services/csvService';
import { syncTableData, deleteTable } from '../services/sqlService';
import styles from '../styles/TableSchema.module.css';
import AddRowModal from './AddRowModal';
import AddColumnModal from './AddColumnModal';

const TableSchema = ({ selectedTable, isSchemaVisible, setIsSchemaVisible, onDeleteTable, isCollapsed }) => {
  const [isAddRowModalOpen, setIsAddRowModalOpen] = useState(false);
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    const initializeData = async () => {
      if (selectedTable) {
        // Always use the most recent data from selectedTable.initialData
        setTableData(selectedTable.initialData);
        
        // Also sync this data with localStorage
        await writeCsvFile(selectedTable.name, selectedTable.initialData);
      }
    };

    initializeData();
  }, [selectedTable, selectedTable?.initialData]); // Add selectedTable.initialData as dependency

  // Helper function to find ID column
  const findIdColumn = (schema) => {
    // First try to find primary key
    const primaryKey = schema.find(col => col.isPrimary)?.name;
    if (primaryKey) return primaryKey;

    // If no primary key, look for first column with 'id' in its name
    const idColumn = schema.find(col => col.name.toLowerCase().includes('id'))?.name;
    if (idColumn) return idColumn;

    // If no id column found, return the first column name as fallback
    return schema[0]?.name;
  };

  const handleAddRow = async (newRow) => {
    try {
      const idColumnName = findIdColumn(selectedTable.schema);
      if (!idColumnName) {
        console.error('No suitable ID column found');
        return;
      }

      // Generate new ID for the row
      const lastId = Math.max(...tableData.map(row => Number(row[idColumnName])), 0);
      const newRowWithId = {
        [idColumnName]: lastId + 1,
        ...newRow
      };

      // Convert string values to proper types
      const typedRow = {};
      selectedTable.schema.forEach(column => {
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
      
      // Update localStorage
      const success = await writeCsvFile(selectedTable.name, updatedData);
      
      if (success) {
        // Update local state
        setTableData(updatedData);
        
        // Sync with AlaSQL
        await syncTableData(selectedTable.name, updatedData);
      } else {
        console.error('Failed to save new row');
      }
    } catch (error) {
      console.error('Error adding row:', error);
    }
  };

  const handleDeleteRow = async (idToDelete) => {
    try {
      const idColumnName = findIdColumn(selectedTable.schema);
      if (!idColumnName) {
        console.error('No suitable ID column found');
        return;
      }

      const updatedData = tableData.filter(row => {
        const rowId = Number(row[idColumnName]);
        return rowId !== Number(idToDelete);
      });

      // Update localStorage
      const success = await writeCsvFile(selectedTable.name, updatedData);
      
      if (success) {
        // Update local state
        setTableData(updatedData);
        
        // Sync with AlaSQL
        await syncTableData(selectedTable.name, updatedData);
      } else {
        console.error('Failed to delete row');
      }
    } catch (error) {
      console.error('Error deleting row:', error);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      // Delete table from AlaSQL first
      await deleteTable(selectedTable.name);
      
      // Remove from localStorage
      localStorage.removeItem(`table_${selectedTable.name}`);
      
      // Call the parent component's delete handler
      onDeleteTable(selectedTable.name);
      
      setShowDeleteConfirm(false);
      setIsSchemaVisible(false);
    } catch (error) {
      console.error('Error deleting table:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const toggleSchema = () => {
    setIsSchemaVisible(!isSchemaVisible);
  };

  const handleAddColumn = async (columnData) => {
    try {
      // Update schema
      const updatedSchema = [...selectedTable.schema, {
        name: columnData.name,
        type: columnData.type,
        isPrimary: false
      }];

      // Update existing data with the new column
      const updatedData = tableData.map(row => ({
        ...row,
        [columnData.name]: columnData.defaultValue
      }));

      // Save updated data to localStorage
      await writeCsvFile(selectedTable.name, updatedData);
      
      // Update local state
      setTableData(updatedData);
      
      // Sync with AlaSQL
      await syncTableData(selectedTable.name, updatedData);

      // Update the table schema
      selectedTable.schema = updatedSchema;
    } catch (error) {
      console.error('Failed to add column:', error);
      throw new Error('Failed to add column');
    }
  };

  const handleCellEdit = (rowIndex, columnName, value) => {
    setEditingCell({ rowIndex, columnName, value });
    setEditValue(value.toString());
  };

  const handleCellUpdate = async () => {
    try {
      const { rowIndex, columnName } = editingCell;
      const column = selectedTable.schema.find(col => col.name === columnName);
      
      // Convert value based on column type
      let parsedValue = editValue;
      if (column.type === 'INTEGER') {
        parsedValue = parseInt(editValue, 10);
        if (isNaN(parsedValue)) throw new Error('Invalid integer value');
      } else if (column.type === 'DECIMAL') {
        parsedValue = parseFloat(editValue);
        if (isNaN(parsedValue)) throw new Error('Invalid decimal value');
      } else if (column.type === 'DATE') {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(editValue)) {
          throw new Error('Invalid date format (YYYY-MM-DD)');
        }
      }

      const updatedData = tableData.map((row, idx) => {
        if (idx === rowIndex) {
          return { ...row, [columnName]: parsedValue };
        }
        return row;
      });

      // Update localStorage
      await writeCsvFile(selectedTable.name, updatedData);
      
      // Update local state
      setTableData(updatedData);
      
      // Sync with AlaSQL
      await syncTableData(selectedTable.name, updatedData);
      
      setEditingCell(null);
    } catch (error) {
      console.error('Failed to update cell:', error);
    }
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const renderCell = (row, column, rowIndex) => {
    const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.columnName === column.name;
    const value = row[column.name];

    if (isEditing) {
      return (
        <td className={styles.editingCell}>
          <div className={styles.editingWrapper}>
            <input
              type={column.type === 'DATE' ? 'date' : 'text'}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className={styles.cellInput}
              autoFocus
            />
            <div className={styles.editActions}>
              <button
                onClick={handleCellUpdate}
                className={styles.editActionButton}
                title="Save"
              >
                <Check size={14} />
              </button>
              <button
                onClick={handleCellCancel}
                className={styles.editActionButton}
                title="Cancel"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </td>
      );
    }

    return (
      <td
        onClick={() => handleCellEdit(rowIndex, column.name, value)}
        className={styles.editableCell}
        title="Click to edit"
      >
        {value}
      </td>
    );
  };

  if (!selectedTable) return null;

  return (
    <div className={`${styles.tableSchema} ${isCollapsed ? styles.collapsed : ''}`}>
      {!isCollapsed && (
        <>
          <div className={styles.stickyHeader}>

            {isSchemaVisible && (
              <div className={styles.tableSchemaHeader}>
                <Database size={25} />
                <h3>{selectedTable.name}</h3>
                <button
                  onClick={handleDeleteClick}
                  className={styles.deleteButtonMain}
                  title="Delete table"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          {showDeleteConfirm && (
            <div className={styles.deleteConfirmation}>
              <p>Are you sure you want to delete <strong>{selectedTable.name}</strong> table?</p>
              <div className={styles.deleteActions}>
                <button 
                  onClick={handleCancelDelete}
                  className={styles.cancelDeleteButton}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmDelete}
                  className={styles.confirmDeleteButton}
                >
                  Delete
                </button>
              </div>
            </div>
          )}

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
                        <th>Key</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTable.schema.map((column, index) => (
                        <tr key={index}>
                          <td>{column.name}</td>
                          <td>{column.type}</td>
                          <td>
                            {column.isPrimary ? 'PK' : ''}
                            {column.isFK ? 'FK' : ''}
                          </td>
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
                  <div className={styles.actionButtons}>
                    <button 
                      className={styles.addColumnButton}
                      onClick={() => setIsAddColumnModalOpen(true)}
                      title="Add new column"
                    >
                      <Columns size={14} />
                      Add Column
                    </button>
                    <button 
                      className={styles.addRowButton}
                      onClick={() => setIsAddRowModalOpen(true)}
                      title="Add new row"
                    >
                      <Plus size={14} />
                      Add Row
                    </button>
                  </div>
                </div>
                <div className={styles.tableWrapper}>
                  <table>
                    <thead>
                      <tr>
                        <th className={styles.actionColumn}>
                          <Settings size={16} className={styles.actionIcon} />
                        </th>
                        {selectedTable.schema.map((column) => (
                          <th key={column.name}>{column.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          <td className={styles.actionColumn}>
                            <button
                              className={styles.deleteButton}
                              onClick={() => {
                                const idColumnName = findIdColumn(selectedTable.schema);
                                if (idColumnName) {
                                  handleDeleteRow(row[idColumnName]);
                                }
                              }}
                              title="Delete row"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                          {selectedTable.schema.map((column) => renderCell(row, column, rowIndex))}
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
            columns={selectedTable.schema}
            onAddRow={handleAddRow}
          />

          <AddColumnModal
            isOpen={isAddColumnModalOpen}
            onClose={() => setIsAddColumnModalOpen(false)}
            onAddColumn={handleAddColumn}
          />
        </>
      )}
    </div>
  );
};

export default TableSchema;