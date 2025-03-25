export const CUSTOMER_ORDERS_DB = {
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
      sampleRowCount: 1000,
      demoEntries: [
        { customer_id: 1, first_name: 'John', last_name: 'Doe', email: 'john.doe@example.com', registration_date: '2021-01-01', total_purchases: 150.50 },
        { customer_id: 2, first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@example.com', registration_date: '2021-02-15', total_purchases: 200.00 },
        { customer_id: 3, first_name: 'Alice', last_name: 'Johnson', email: 'alice.johnson@example.com', registration_date: '2021-03-10', total_purchases: 300.75 },
        { customer_id: 4, first_name: 'Bob', last_name: 'Brown', email: 'bob.brown@example.com', registration_date: '2021-04-20', total_purchases: 120.00 },
        { customer_id: 5, first_name: 'Charlie', last_name: 'Davis', email: 'charlie.davis@example.com', registration_date: '2021-05-05', total_purchases: 180.25 }
      ]
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
      sampleRowCount: 5000,
      demoEntries: [
        { order_id: 1, customer_id: 1, order_date: '2021-06-01', total_amount: 100.00, status: 'Shipped' },
        { order_id: 2, customer_id: 2, order_date: '2021-06-05', total_amount: 150.00, status: 'Delivered' },
        { order_id: 3, customer_id: 3, order_date: '2021-06-10', total_amount: 200.00, status: 'Processing' },
        { order_id: 4, customer_id: 4, order_date: '2021-06-15', total_amount: 250.00, status: 'Cancelled' },
        { order_id: 5, customer_id: 5, order_date: '2021-06-20', total_amount: 300.00, status: 'Shipped' }
      ]
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
      sampleRowCount: 4500,
      demoEntries: [
        { shipping_id: 1, order_id: 1, shipping_date: '2021-06-02', carrier: 'UPS', tracking_number: '1Z999AA10123456784', delivery_status: 'In Transit' },
        { shipping_id: 2, order_id: 2, shipping_date: '2021-06-06', carrier: 'FedEx', tracking_number: '123456789012', delivery_status: 'Delivered' },
        { shipping_id: 3, order_id: 3, shipping_date: '2021-06-11', carrier: 'DHL', tracking_number: 'JD014600003828000000', delivery_status: 'Pending' },
        { shipping_id: 4, order_id: 4, shipping_date: '2021-06-16', carrier: 'USPS', tracking_number: '9400111899560000000000', delivery_status: 'Cancelled' },
        { shipping_id: 5, order_id: 5, shipping_date: '2021-06-21', carrier: 'UPS', tracking_number: '1Z999AA10123456785', delivery_status: 'In Transit' }
      ]
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