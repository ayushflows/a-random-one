import { CUSTOMER_ORDERS_DB } from '../assets/schemas';

export const fetchTableData = (tableName, page = 1, pageSize = 5) => {
  const table = CUSTOMER_ORDERS_DB.tables.find(t => t.name === tableName);
  if (!table) {
    throw new Error(`Table ${tableName} not found`);
  }
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return {
    rows: table.demoEntries.slice(startIndex, endIndex),
    totalRows: table.demoEntries.length
  };
};

export const fetchPaginatedData = (data, page = 1, pageSize = 5) => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return {
    rows: data.slice(startIndex, endIndex),
    totalRows: data.length
  };
};
