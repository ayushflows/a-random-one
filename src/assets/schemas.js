import { readCsvFile } from '../services/csvService';

export const CUSTOMER_ORDERS_DB = {
  name: 'Customer Orders Database',
  tables: [
    {
      name: 'customers',
      schema: [
        { name: 'customer_id', type: 'INTEGER', isPrimary: true },
        { name: 'name', type: 'TEXT' },
        { name: 'email', type: 'TEXT' },
        { name: 'country', type: 'TEXT' },
        { name: 'join_date', type: 'DATE' }
      ],
      initialData: [
        { customer_id: 1, name: 'John Doe', email: 'john@example.com', country: 'USA', join_date: '2023-01-15' },
        { customer_id: 2, name: 'Jane Smith', email: 'jane@example.com', country: 'Canada', join_date: '2023-02-20' },
        { customer_id: 3, name: 'Alice Brown', email: 'alice@example.com', country: 'UK', join_date: '2023-03-10' },
        { customer_id: 4, name: 'Bob Wilson', email: 'bob@example.com', country: 'USA', join_date: '2023-04-05' },
        { customer_id: 5, name: 'Emma Davis', email: 'emma@example.com', country: 'Australia', join_date: '2023-05-12' },
        { customer_id: 6, name: 'Michael Chen', email: 'michael@example.com', country: 'China', join_date: '2023-06-01' },
        { customer_id: 7, name: 'Sophie Martin', email: 'sophie@example.com', country: 'France', join_date: '2023-06-15' },
        { customer_id: 8, name: 'Luis Garcia', email: 'luis@example.com', country: 'Spain', join_date: '2023-07-01' },
        { customer_id: 9, name: 'Anna Kowalski', email: 'anna@example.com', country: 'Poland', join_date: '2023-07-15' },
        { customer_id: 10, name: 'David Kim', email: 'david@example.com', country: 'Korea', join_date: '2023-08-01' }
      ]
    },
    {
      name: 'orders',
      schema: [
        { name: 'order_id', type: 'INTEGER', isPrimary: true },
        { name: 'customer_id', type: 'INTEGER', isFK: true },
        { name: 'order_date', type: 'DATE' },
        { name: 'total_amount', type: 'DECIMAL' },
        { name: 'status', type: 'TEXT' }
      ],
      initialData: [
        { order_id: 1, customer_id: 1, order_date: '2023-06-01', total_amount: 150.50, status: 'delivered' },
        { order_id: 2, customer_id: 2, order_date: '2023-06-15', total_amount: 89.99, status: 'processing' },
        { order_id: 3, customer_id: 1, order_date: '2023-07-01', total_amount: 299.99, status: 'delivered' },
        { order_id: 4, customer_id: 3, order_date: '2023-07-10', total_amount: 75.50, status: 'delivered' },
        { order_id: 5, customer_id: 4, order_date: '2023-07-15', total_amount: 199.99, status: 'processing' },
        { order_id: 6, customer_id: 2, order_date: '2023-07-20', total_amount: 149.99, status: 'delivered' },
        { order_id: 7, customer_id: 5, order_date: '2023-07-25', total_amount: 399.99, status: 'processing' },
        { order_id: 8, customer_id: 6, order_date: '2023-08-01', total_amount: 299.99, status: 'delivered' },
        { order_id: 9, customer_id: 7, order_date: '2023-08-05', total_amount: 199.99, status: 'delivered' },
        { order_id: 10, customer_id: 8, order_date: '2023-08-10', total_amount: 99.99, status: 'processing' },
        { order_id: 11, customer_id: 9, order_date: '2023-08-15', total_amount: 149.99, status: 'delivered' },
        { order_id: 12, customer_id: 10, order_date: '2023-08-20', total_amount: 499.99, status: 'processing' },
        { order_id: 13, customer_id: 1, order_date: '2023-08-25', total_amount: 199.99, status: 'delivered' },
        { order_id: 14, customer_id: 2, order_date: '2023-09-01', total_amount: 299.99, status: 'processing' },
        { order_id: 15, customer_id: 3, order_date: '2023-09-05', total_amount: 399.99, status: 'delivered' }
      ]
    },
    {
      name: 'products',
      schema: [
        { name: 'product_id', type: 'INTEGER', isPrimary: true },
        { name: 'name', type: 'TEXT' },
        { name: 'category', type: 'TEXT' },
        { name: 'price', type: 'DECIMAL' },
        { name: 'stock', type: 'INTEGER' }
      ],
      initialData: [
        { product_id: 1, name: 'Laptop Pro', category: 'Electronics', price: 1299.99, stock: 50 },
        { product_id: 2, name: 'Wireless Mouse', category: 'Electronics', price: 29.99, stock: 100 },
        { product_id: 3, name: 'Coffee Maker', category: 'Appliances', price: 79.99, stock: 30 },
        { product_id: 4, name: 'Gaming Chair', category: 'Furniture', price: 199.99, stock: 25 },
        { product_id: 5, name: 'Desk Lamp', category: 'Lighting', price: 39.99, stock: 75 }
      ]
    },
    {
      name: 'order_items',
      schema: [
        { name: 'order_id', type: 'INTEGER', isFK: true },
        { name: 'product_id', type: 'INTEGER', isFK: true },
        { name: 'quantity', type: 'INTEGER' },
        { name: 'unit_price', type: 'DECIMAL' }
      ],
      initialData: [
        { order_id: 1, product_id: 1, quantity: 1, unit_price: 1299.99 },
        { order_id: 1, product_id: 2, quantity: 1, unit_price: 29.99 },
        { order_id: 2, product_id: 3, quantity: 1, unit_price: 79.99 },
        { order_id: 3, product_id: 4, quantity: 1, unit_price: 199.99 },
        { order_id: 4, product_id: 5, quantity: 2, unit_price: 39.99 },
        { order_id: 5, product_id: 1, quantity: 1, unit_price: 1299.99 },
        { order_id: 6, product_id: 2, quantity: 3, unit_price: 29.99 },
        { order_id: 7, product_id: 4, quantity: 2, unit_price: 199.99 }
      ]
    }
  ]
};

export const PREDEFINED_QUERIES = [
  {
    name: 'Customer Orders Summary',
    description: 'Shows total orders and amount spent by each customer',
    query: `SELECT 
  c.name as customer_name,
  c.country,
  COUNT(o.order_id) as total_orders,
  SUM(o.total_amount) as total_spent
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.name, c.country
ORDER BY total_spent DESC;`
  },
  {
    name: 'Popular Products',
    description: 'Shows most ordered products with their total quantity sold',
    query: `SELECT 
  p.name as product_name,
  p.category,
  SUM(oi.quantity) as total_quantity_sold,
  SUM(oi.quantity * oi.unit_price) as total_revenue
FROM products p
JOIN order_items oi ON p.product_id = oi.product_id
GROUP BY p.product_id, p.name, p.category
ORDER BY total_quantity_sold DESC;`
  },
  {
    name: 'Recent Orders Status',
    description: 'Shows recent orders with customer details and status',
    query: `SELECT 
  o.order_id,
  c.name as customer_name,
  o.order_date,
  o.total_amount,
  o.status
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
ORDER BY o.order_date DESC
LIMIT 5;`
  },
  {
    name: 'Low Stock Alert',
    description: 'Shows products with low stock (less than 30 units)',
    query: `SELECT 
  name as product_name,
  category,
  price,
  stock,
  CASE 
    WHEN stock < 10 THEN 'Critical'
    WHEN stock < 20 THEN 'Low'
    ELSE 'Moderate'
  END as stock_status
FROM products
WHERE stock < 30
ORDER BY stock ASC;`
  },
  {
    name: 'Detailed Order Analysis',
    description: 'Shows detailed order information with customer details and product information',
    query: `SELECT 
  o.order_id,
  c.name as customer_name,
  c.country as customer_country,
  o.order_date,
  p.name as product_name,
  p.category as product_category,
  oi.quantity,
  oi.unit_price,
  (oi.quantity * oi.unit_price) as line_total,
  o.total_amount as order_total,
  o.status as order_status
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
JOIN order_items oi ON o.order_id = oi.order_id
JOIN products p ON oi.product_id = p.product_id
ORDER BY o.order_date DESC, o.order_id, p.name;`
  }
];