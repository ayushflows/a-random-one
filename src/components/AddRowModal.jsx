import React, { useState } from 'react';
import { X } from 'lucide-react';
import styles from '../styles/AddRowModal.module.css';

const AddRowModal = ({ isOpen, onClose, columns, onAddRow }) => {
  const [formData, setFormData] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validatedData = {};
    columns.forEach(column => {
      const value = formData[column.name];
      if (column.type.includes('INT')) {
        validatedData[column.name] = value ? parseInt(value, 10) : 0;
      } else if (column.type.includes('DECIMAL')) {
        validatedData[column.name] = value ? parseFloat(value) : 0.0;
      } else if (column.type.includes('DATE')) {
        validatedData[column.name] = value || new Date().toISOString().split('T')[0];
      } else {
        validatedData[column.name] = value || '';
      }
    });

    onAddRow(validatedData);
    setFormData({});
    onClose();
  };

  const handleChange = (columnName, value) => {
    setFormData(prev => ({
      ...prev,
      [columnName]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Add New Row</h3>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.modalContent}>
            {columns.map((column) => (
              <div key={column.name} className={styles.formGroup}>
                <label htmlFor={column.name}>{column.name}</label>
                <input
                  type={column.type === 'number' ? 'number' : 'text'}
                  id={column.name}
                  value={formData[column.name] || ''}
                  onChange={(e) => handleChange(column.name, e.target.value)}
                  placeholder={`Enter ${column.name}`}
                  required
                />
              </div>
            ))}
          </div>
          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              Add Row
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRowModal; 