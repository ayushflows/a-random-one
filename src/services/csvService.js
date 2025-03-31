import Papa from 'papaparse';

const STORAGE_PREFIX = 'table_data_';

export const readCsvFile = async (filePath) => {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvText = await response.text();
    
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      if (!line.trim()) return null;
      const values = line.split(',');
      
      return headers.reduce((obj, header, index) => {
        let value = values[index]?.trim();
        if (value === undefined || value === '') {
          value = null;
        } else if (!isNaN(value)) {
          value = Number(value);
        }
        obj[header] = value;
        return obj;
      }, {});
    }).filter(item => item !== null);
  } catch (error) {
    console.error('Error reading CSV file:', error);
    throw error;
  }
};

export const writeCsvFile = async (tableName, data) => {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${tableName}`, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error writing data for ${tableName}:`, error);
    return false;
  }
}; 