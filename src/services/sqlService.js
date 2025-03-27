import alasql from 'alasql';

let initialized = false;

// Add custom functions to alasql
alasql.fn.EXTRACT = function(part, date) {
  const d = new Date(date);
  switch(part.toUpperCase()) {
    case 'MONTH':
      return d.getMonth() + 1;
    case 'YEAR':
      return d.getFullYear();
    case 'DAY':
      return d.getDate();
    default:
      return null;
  }
};

// Updated DATEDIFF function
alasql.fn.DATE_DIFF = function(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
};

export const initDatabase = async (tableData) => {
  try {
    if (!initialized) {
      // Create tables and insert initial data
      Object.entries(tableData).forEach(([tableName, data]) => {
        if (data && data.length > 0) {
          // Drop table if exists
          alasql(`DROP TABLE IF EXISTS ${tableName}`);
          
          // Create table
          const createTableSQL = `CREATE TABLE ${tableName}`;
          alasql(createTableSQL);
          
          // Insert data
          alasql(`INSERT INTO ${tableName} SELECT * FROM ?`, [data]);
        }
      });
      
      initialized = true;
    }
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

export const executeQuery = async (query) => {
  try {
    if (!initialized) {
      throw new Error('Database not initialized');
    }

    // Preprocess the query to handle unsupported functions
    let processedQuery = query
      // Handle EXTRACT function
      .replace(/EXTRACT\s*\(\s*(\w+)\s+FROM\s+([^\)]+)\)/gi, 
               'EXTRACT("$1", $2)')
      // Handle DATEDIFF function - convert to DATE_DIFF
      .replace(/DATEDIFF\s*\(\s*([^,]+)\s*,\s*([^\)]+)\s*\)/gi,
               'DATE_DIFF($2, $1)'); // Note: swapped parameters order

    console.log('Processed query:', processedQuery); // For debugging
    const results = alasql(processedQuery);
    return Array.isArray(results) ? results : [];

  } catch (error) {
    console.error('Query execution error:', error);
    throw new Error(error.message);
  }
};
