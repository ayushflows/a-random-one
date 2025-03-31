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
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const initializeData = async () => {
      if (selectedTable) {
        setTableData(selectedTable.initialData);
        
        await writeCsvFile(selectedTable.name, selectedTable.initialData);
      }
    };

    initializeData();
  }, [selectedTable, selectedTable?.initialData]);

  const findIdColumn = (schema) => {
    const primaryKey = schema.find(col => col.isPrimary)?.name;
    if (primaryKey) return primaryKey;

    const idColumn = schema.find(col => col.name.toLowerCase().includes('id'))?.name;
    if (idColumn) return idColumn;

    return schema[0]?.name;
  };

  const handleAddRow = async (newRow) => {
    try {
      const idColumnName = findIdColumn(selectedTable.schema);
      if (!idColumnName) {
        console.error('No suitable ID column found');
        return;
      }

      const lastId = Math.max(...tableData.map(row => Number(row[idColumnName])), 0);
      const newRowWithId = {
        [idColumnName]: lastId + 1,
        ...newRow
      };

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
      
      const success = await writeCsvFile(selectedTable.name, updatedData);
      
      if (success) {
        setTableData(updatedData);
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

      const success = await writeCsvFile(selectedTable.name, updatedData);
      
      if (success) {
        setTableData(updatedData);
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
      await deleteTable(selectedTable.name);
      localStorage.removeItem(`table_${selectedTable.name}`);
      onDeleteTable(selectedTable.name);
      
      setShowDeleteConfirm(false);
      setIsSchemaVisible(false);
    } catch (error) {
      console.error('Error deleting table:', error);
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
      const updatedSchema = [...selectedTable.schema, {
        name: columnData.name,
        type: columnData.type,
        isPrimary: false
      }];

      const updatedData = tableData.map(row => ({
        ...row,
        [columnData.name]: columnData.defaultValue
      }));

      await writeCsvFile(selectedTable.name, updatedData);
      
      setTableData(updatedData);
      
      await syncTableData(selectedTable.name, updatedData);

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

      await writeCsvFile(selectedTable.name, updatedData);
      
      setTableData(updatedData);
      
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

  const getPaginatedData = () => {
    const startIndex = 0;
    return tableData.slice(startIndex, ITEMS_PER_PAGE);
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
                            {column.isPrimary && column.isFK
                              ? 'PK, FK'
                              : column.isPrimary
                              ? 'PK'
                              : column.isFK
                              ? 'FK'
                              : ''}
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
                    <Database size={14} className={styles.sectionIcon} /> 
                    Data Sample
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
                      {getPaginatedData().map((row, rowIndex) => (
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
                  {tableData.length > 10 && (
                    <div className={styles.tableFooter}>
                      Showing first 10 of {tableData.length} entries
                    </div>
                  )}
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