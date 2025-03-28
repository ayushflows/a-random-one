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
    // Always reinitialize on each call
    initialized = false;
    
    // Drop all existing tables first
    const existingTables = alasql('SHOW TABLES');
    existingTables.forEach(table => {
      alasql(`DROP TABLE IF EXISTS ${table.tableid}`);
    });

    // Create tables and insert initial data
    Object.entries(tableData).forEach(([tableName, data]) => {
      if (data && data.length > 0) {
        // Get schema from first data row
        const sampleRow = data[0];
        const columns = Object.keys(sampleRow).map(key => {
          let type = typeof sampleRow[key];
          switch (type) {
            case 'number':
              return `${key} ${key.includes('price') || key.includes('amount') ? 'DECIMAL' : 'INT'}`;
            case 'string':
              return `${key} STRING`;
            default:
              return `${key} STRING`;
          }
        }).join(', ');

        // Create table with schema
        const createTableSQL = `CREATE TABLE ${tableName} (${columns})`;
        console.log('Creating table:', createTableSQL);
        alasql(createTableSQL);
        
        // Insert initial data
        alasql(`INSERT INTO ${tableName} SELECT * FROM ?`, [data]);
      }
    });
    
    initialized = true;
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

    // Preprocess the query
    let processedQuery = query
      .replace(/EXTRACT\s*\(\s*(\w+)\s+FROM\s+([^\)]+)\)/gi, 'EXTRACT("$1", $2)')
      .replace(/DATEDIFF\s*\(\s*([^,]+)\s*,\s*([^\)]+)\s*\)/gi, 'DATE_DIFF($2, $1)');

    console.log('Processed query:', processedQuery);

    // Check if it's an INSERT query before executing
    if (query.trim().toUpperCase().startsWith('INSERT INTO')) {
      const tableName = query.match(/INSERT\s+INTO\s+(\w+)/i)[1];
      
      // Execute the insert
      const rowCount = alasql(processedQuery);
      
      // Fetch the updated table data
      const updatedTableInfo = getTableInfo(tableName);
      
      return { 
        type: 'INSERT', 
        tableName, 
        tableInfo: updatedTableInfo,
        rowCount,
        message: `Successfully inserted ${rowCount} row(s) into ${tableName}`
      };
    }

    // For other queries (CREATE TABLE, SELECT, etc.)
    const results = alasql(processedQuery);

    // Check if it's a CREATE TABLE query
    if (query.trim().toUpperCase().startsWith('CREATE TABLE')) {
      const tableName = query.match(/CREATE\s+TABLE\s+(\w+)/i)[1];
      return { type: 'CREATE', tableName, tableInfo: getTableInfo(tableName) };
    }

    // For SELECT and other queries, return results as before
    return Array.isArray(results) ? results : [];

  } catch (error) {
    console.error('Query execution error:', error);
    throw new Error(error.message);
  }
};

export const syncTableData = (tableName, data) => {
  try {
    // Clear existing data
    alasql(`DELETE FROM ${tableName}`);
    
    // Insert new data
    if (data && data.length > 0) {
      alasql(`INSERT INTO ${tableName} SELECT * FROM ?`, [data]);
    }
    return true;
  } catch (error) {
    console.error('Error syncing table data:', error);
    throw error;
  }
};

// Add this new function to create table with schema
export const createTableWithData = (tableName, schema, data) => {
  try {
    // Drop table if exists
    alasql(`DROP TABLE IF EXISTS ${tableName}`);

    // Generate CREATE TABLE SQL with proper column definitions
    const columns = schema.map(col => {
      let colDef = `${col.name} `;
      
      // Map the type to AlaSQL compatible type
      switch(col.type.toUpperCase()) {
        case 'INTEGER':
        case 'INT':
          colDef += 'INT';
          break;
        case 'DECIMAL':
        case 'FLOAT':
          colDef += 'DECIMAL';
          break;
        case 'VARCHAR':
        case 'TEXT':
          colDef += 'STRING';
          break;
        case 'DATE':
          colDef += 'DATE';
          break;
        default:
          colDef += 'STRING';
      }

      if (col.isPrimary) colDef += ' PRIMARY KEY';
      return colDef;
    }).join(', ');

    // Create table
    const createTableSQL = `CREATE TABLE ${tableName} (${columns})`;
    console.log('Creating table with SQL:', createTableSQL);
    alasql(createTableSQL);

    // Insert data if provided
    if (data && data.length > 0) {
      alasql(`INSERT INTO ${tableName} SELECT * FROM ?`, [data]);
    }

    return true;
  } catch (error) {
    console.error('Error creating table:', error);
    throw error;
  }
};

// Add this new function to delete table from AlaSQL
export const deleteTable = (tableName) => {
  try {
    // Drop the table from AlaSQL
    alasql(`DROP TABLE IF EXISTS ${tableName}`);
    return true;
  } catch (error) {
    console.error('Error deleting table:', error);
    throw error;
  }
};

// Add these new functions
export const getTableInfo = (tableName) => {
  try {
    // Get table schema
    const columns = alasql(`SHOW COLUMNS FROM ${tableName}`);
    const schema = columns.map(col => ({
      name: col.columnid,
      type: col.dbtypeid.toUpperCase(),
      isPrimary: col.pk === 1
    }));

    // Get table data
    const data = alasql(`SELECT * FROM ${tableName}`);

    return {
      name: tableName,
      schema,
      initialData: data
    };
  } catch (error) {
    console.error('Error getting table info:', error);
    throw error;
  }
};

export const getAllTables = () => {
  try {
    const tables = alasql('SHOW TABLES');
    return tables.map(t => t.tableid);
  } catch (error) {
    console.error('Error getting tables:', error);
    throw error;
  }
};
