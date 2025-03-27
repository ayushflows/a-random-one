import Papa from 'papaparse';

const STORAGE_PREFIX = 'table_data_';

export const readCsvFile = async (tableName) => {
  try {
    // Get from localStorage
    const storedData = localStorage.getItem(`${STORAGE_PREFIX}${tableName}`);
    if (storedData) {
      return JSON.parse(storedData);
    }

    // If no data in localStorage, return null so we can initialize with demo data
    return null;
  } catch (error) {
    console.error(`Error reading data for ${tableName}:`, error);
    return null;
  }
};

export const writeCsvFile = async (tableName, data) => {
  try {
    // Store in localStorage
    localStorage.setItem(`${STORAGE_PREFIX}${tableName}`, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error writing data for ${tableName}:`, error);
    return false;
  }
}; 