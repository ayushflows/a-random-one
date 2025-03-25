export const CUSTOMER_ORDERS_DB= {
    name: 'E-Commerce Sales Database',
    description: 'A comprehensive database tracking customer orders, product details, and shipping information',
    tables: [
      {
        name: 'customers',
        columns: [
          { name: 'customer_id', type: 'INT', description: 'Unique identifier for each customer' },
          { name: 'first_name', type: 'VARCHAR(50)', description: 'Customer\'s first name' },
          { name: 'last_name', type: 'VARCHAR(50)', description: 'Customer\'s last name' },
          { name: 'email', type: 'VARCHAR(100)', description: 'Customer\'s email address' },
          { name: 'registration_date', type: 'DATE', description: 'Date when customer registered' },
          { name: 'total_purchases', type: 'DECIMAL(10,2)', description: 'Total amount spent by customer' }
        ],
        sampleRowCount: 1000
      },
      {
        name: 'orders',
        columns: [
          { name: 'order_id', type: 'INT', description: 'Unique identifier for each order' },
          { name: 'customer_id', type: 'INT', description: 'Foreign key linking to customers table' },
          { name: 'order_date', type: 'DATE', description: 'Date of the order' },
          { name: 'total_amount', type: 'DECIMAL(10,2)', description: 'Total order amount' },
          { name: 'status', type: 'VARCHAR(20)', description: 'Current status of the order' }
        ],
        sampleRowCount: 5000
      },
      {
        name: 'shipping',
        columns: [
          { name: 'shipping_id', type: 'INT', description: 'Unique identifier for each shipping record' },
          { name: 'order_id', type: 'INT', description: 'Foreign key linking to orders table' },
          { name: 'shipping_date', type: 'DATE', description: 'Date when order was shipped' },
          { name: 'carrier', type: 'VARCHAR(50)', description: 'Shipping carrier name' },
          { name: 'tracking_number', type: 'VARCHAR(100)', description: 'Tracking number for the shipment' },
          { name: 'delivery_status', type: 'VARCHAR(20)', description: 'Current delivery status' }
        ],
        sampleRowCount: 4500
      }
    ]
  };
  
  // Predefined Example Queries
  export const PREDEFINED_QUERIES = [
    {
      id: 1,
      name: 'Top 5 Customers by Total Purchases',
      query: `SELECT 
    first_name, 
    last_name, 
    total_purchases 
  FROM customers 
  ORDER BY total_purchases DESC 
  LIMIT 5;`
    },
    {
      id: 2,
      name: 'Monthly Order Analysis',
      query: `SELECT 
    EXTRACT(MONTH FROM order_date) as month, 
    COUNT(*) as total_orders, 
    SUM(total_amount) as total_revenue 
  FROM orders 
  GROUP BY month 
  ORDER BY month;`
    },
    {
      id: 3,
      name: 'Shipping Carrier Performance',
      query: `SELECT 
    carrier, 
    COUNT(*) as total_shipments, 
    AVG(DATEDIFF(delivery_date, shipping_date)) as avg_delivery_time 
  FROM shipping 
  GROUP BY carrier 
  ORDER BY total_shipments DESC;`
    }
  ];