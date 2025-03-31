import alasql from 'alasql';

let initialized = false;

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

alasql.fn.DATE_DIFF = function(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
};

export const initDatabase = async (tableData) => {
  try {
    initialized = false;
    
    const existingTables = alasql('SHOW TABLES');
    existingTables.forEach(table => {
      alasql(`DROP TABLE IF EXISTS ${table.tableid}`);
    });

    Object.entries(tableData).forEach(([tableName, data]) => {
      if (data && data.length > 0) {
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

        const createTableSQL = `CREATE TABLE ${tableName} (${columns})`;
        console.log('Creating table:', createTableSQL);
        alasql(createTableSQL);
        
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

    let processedQuery = query
      .replace(/EXTRACT\s*\(\s*(\w+)\s+FROM\s+([^\)]+)\)/gi, 'EXTRACT("$1", $2)')
      .replace(/DATEDIFF\s*\(\s*([^,]+)\s*,\s*([^\)]+)\s*\)/gi, 'DATE_DIFF($2, $1)');

    console.log('Processed query:', processedQuery);

    if (query.trim().toUpperCase().startsWith('INSERT INTO')) {
      const tableName = query.match(/INSERT\s+INTO\s+(\w+)/i)[1];
      
      const rowCount = alasql(processedQuery);
      
      const updatedTableInfo = getTableInfo(tableName);
      
      return { 
        type: 'INSERT', 
        tableName, 
        tableInfo: updatedTableInfo,
        rowCount,
        message: `Successfully inserted ${rowCount} row(s) into ${tableName}`
      };
    }

    const results = alasql(processedQuery);

    if (query.trim().toUpperCase().startsWith('CREATE TABLE')) {
      const tableName = query.match(/CREATE\s+TABLE\s+(\w+)/i)[1];
      return { type: 'CREATE', tableName, tableInfo: getTableInfo(tableName) };
    }

    return Array.isArray(results) ? results : [];

  } catch (error) {
    console.error('Query execution error:', error);
    throw new Error(error.message);
  }
};

export const syncTableData = (tableName, data) => {
  try {
    alasql(`DELETE FROM ${tableName}`);
    
    if (data && data.length > 0) {
      alasql(`INSERT INTO ${tableName} SELECT * FROM ?`, [data]);
    }
    return true;
  } catch (error) {
    console.error('Error syncing table data:', error);
    throw error;
  }
};

export const createTableWithData = (tableName, schema, data) => {
  try {
    alasql(`DROP TABLE IF EXISTS ${tableName}`);

    const columns = schema.map(col => {
      let colDef = `${col.name} `;
      
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

    const createTableSQL = `CREATE TABLE ${tableName} (${columns})`;
    console.log('Creating table with SQL:', createTableSQL);
    alasql(createTableSQL);

    if (data && data.length > 0) {
      alasql(`INSERT INTO ${tableName} SELECT * FROM ?`, [data]);
    }

    return true;
  } catch (error) {
    console.error('Error creating table:', error);
    throw error;
  }
};

export const deleteTable = (tableName) => {
  try {
    alasql(`DROP TABLE IF EXISTS ${tableName}`);
    return true;
  } catch (error) {
    console.error('Error deleting table:', error);
    throw error;
  }
};

export const getTableInfo = (tableName) => {
  try {
    const columns = alasql(`SHOW COLUMNS FROM ${tableName}`);
    const schema = columns.map(col => ({
      name: col.columnid,
      type: col.dbtypeid.toUpperCase(),
      isPrimary: col.pk === 1
    }));

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
