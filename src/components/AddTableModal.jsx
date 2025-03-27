import React, { useState } from 'react';
import { X, Upload, Plus } from 'lucide-react';
import styles from '../styles/AddTableModal.module.css';

const AddTableModal = ({ isOpen, onClose, onAddTable }) => {
  const [tableName, setTableName] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!tableName.trim()) {
      setError('Table name is required');
      return;
    }

    if (!file) {
      setError('Please upload a CSV file');
      return;
    }

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          await onAddTable({
            name: tableName,
            data: event.target.result
          });
          handleClose();
        } catch (err) {
          setError('Error processing CSV file. Please check the format.');
        }
      };
      reader.onerror = () => {
        setError('Error reading file');
      };
      reader.readAsText(file);
    } catch (err) {
      setError('Error processing file');
    }
  };

  const handleClose = () => {
    setTableName('');
    setFile(null);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Add New Table</h3>
          <button onClick={handleClose} className={styles.closeButton}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="tableName">Table Name</label>
            <input
              type="text"
              id="tableName"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="Enter table name"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Upload CSV</label>
            <div className={styles.fileUpload}>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files[0])}
                id="csvFile"
                className={styles.fileInput}
              />
              <label htmlFor="csvFile" className={styles.fileLabel}>
                <Upload size={18} />
                {file ? file.name : 'Choose CSV file'}
              </label>
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.modalFooter}>
            <button type="button" onClick={handleClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              Add Table
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTableModal; 