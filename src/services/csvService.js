import Papa from 'papaparse';

const STORAGE_PREFIX = 'table_data_';

export const readCsvFile = async (filePath) => {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvText = await response.text();
    
    // Parse CSV text to array of objects
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      if (!line.trim()) return null; // Skip empty lines
      const values = line.split(',');
      
      return headers.reduce((obj, header, index) => {
        // Convert string values to appropriate types
        let value = values[index]?.trim();
        if (value === undefined || value === '') {
          value = null;
        } else if (!isNaN(value)) {
          value = Number(value);
        }
        obj[header] = value;
        return obj;
      }, {});
    }).filter(item => item !== null); // Remove any null entries
  } catch (error) {
    console.error('Error reading CSV file:', error);
    throw error; // Propagate error for handling
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