import React, { useState } from 'react';
import styles from '../styles/AddColumnModal.module.css';
import { X } from 'lucide-react';

const AddColumnModal = ({ isOpen, onClose, onAddColumn }) => {
  const [columnName, setColumnName] = useState('');
  const [columnType, setColumnType] = useState('TEXT');
  const [defaultValue, setDefaultValue] = useState('');
  const [error, setError] = useState('');

  const dataTypes = ['TEXT', 'INTEGER', 'DECIMAL', 'DATE', 'BOOLEAN'];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!columnName.trim()) {
      setError('Column name is required');
      return;
    }

    // Validate column name format
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(columnName)) {
      setError('Column name must start with a letter and contain only letters, numbers, and underscores');
      return;
    }

    try {
      onAddColumn({
        name: columnName,
        type: columnType,
        defaultValue: defaultValue || getDefaultValueForType(columnType)
      });
      handleClose();
    } catch (err) {
      setError(err.message);
    }
  };

  const getDefaultValueForType = (type) => {
    switch (type) {
      case 'INTEGER':
      case 'DECIMAL':
        return '0';
      case 'BOOLEAN':
        return 'false';
      case 'DATE':
        return new Date().toISOString().split('T')[0];
      default:
        return '';
    }
  };

  const handleClose = () => {
    setColumnName('');
    setColumnType('TEXT');
    setDefaultValue('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Add New Column</h3>
          <button onClick={handleClose} className={styles.closeButton}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="columnName">Column Name</label>
            <input
              type="text"
              id="columnName"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              placeholder="Enter column name"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="columnType">Data Type</label>
            <select
              id="columnType"
              value={columnType}
              onChange={(e) => setColumnType(e.target.value)}
              className={styles.input}
            >
              {dataTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="defaultValue">Default Value (Optional)</label>
            <input
              type="text"
              id="defaultValue"
              value={defaultValue}
              onChange={(e) => setDefaultValue(e.target.value)}
              placeholder={`Default: ${getDefaultValueForType(columnType)}`}
              className={styles.input}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.modalFooter}>
            <button type="button" onClick={handleClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              Add Column
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddColumnModal; 