const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('stock.db');
const { generateReceiptPDF } = require('../utils/receipt');
const { sendEmailWithAttachment, sendReceiptEmail } = require('../utils/email');
const fs = require('fs');
const path = require('path');
const { print } = require('pdf-to-printer');
const NodeCache = require('node-cache');

const myCache = new NodeCache({ stdTTL: 60 });

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());

const runQuery = (query, params = []) =>
  new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });

const getQuery = (query, params = []) =>
  new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

const allQuery = (query, params = []) =>
  new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

// ======================
// POST / (Create Sale)
// ======================
router.post('/', async (req, res) => {
  const { items, total, paymentMethod, customerEmail, receiptMethod, amountTendered } = req.body;

  if (!Array.isArray(items) || items.length === 0 || !items.every(item => item.id && item.qty > 0)) {
    return res.status(400).json({ error: 'Invalid items' });
  }

  if (typeof total !== 'number' || total <= 0) {
    return res.status(400).json({ error: 'Invalid total amount' });
  }

  try {
    await runQuery('BEGIN');

    const itemsWithDetails = [];
    for (const item of items) {
      const product = await getQuery('SELECT id, name, price, stock FROM products WHERE id = ?', [item.id]);
      if (!product) throw new Error(`Product ${item.id} not found`);
      if (product.stock < item.qty) throw new Error(`Insufficient stock for ${product.name}`);

      itemsWithDetails.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        qty: item.qty,
        total: product.price * item.qty
      });
    }

    const calculatedTotal = itemsWithDetails.reduce((sum, item) => sum + item.total, 0);
    if (Math.abs(calculatedTotal - total) > 0.01) throw new Error('Total mismatch');

    const saleDate = new Date().toISOString();
    const saleStmt = await runQuery(`
      INSERT INTO sales (items, total, payment_method, customer_email, amount_tendered, sale_date)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [JSON.stringify(itemsWithDetails), total, paymentMethod, customerEmail || null, amountTendered || null, saleDate]
    );

    for (const item of items) {
      await runQuery('UPDATE products SET stock = stock - ? WHERE id = ?', [item.qty, item.id]);
    }

    await runQuery('COMMIT');

    const response = {
      success: true,
      receiptId: saleStmt.lastID,
      total,
      change: paymentMethod === 'cash' && amountTendered ? amountTendered - total : 0
    };

    if (receiptMethod === 'email' && customerEmail && isValidEmail(customerEmail)) {
      await sendReceiptEmail({
        receiptId: saleStmt.lastID,
        items: itemsWithDetails,
        total,
        paymentMethod,
        saleDate,
        customerEmail
      }, customerEmail);
    }

    res.json(response);
  } catch (err) {
    await runQuery('ROLLBACK');
    console.error('Sale Error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// ======================
// GET /analytics
// ======================
router.get('/analytics', async (req, res) => {
  try {
    const todaySales = await getQuery(`
      SELECT SUM(total) AS totalSales, COUNT(*) AS transactions
      FROM sales
      WHERE date(sale_date) = date('now')
    `);

    const totalItemsSold = await getQuery(`
      SELECT SUM(json_extract(je.value, '$.qty')) AS totalItemsSold
      FROM sales, json_each(sales.items) AS je
      WHERE date(sale_date) = date('now')
    `);

    const topProducts = await allQuery(`
      SELECT 
        p.id, p.name, p.image,
        SUM(CAST(json_extract(je.value, '$.qty') AS INTEGER)) AS totalSold,
        SUM(CAST(json_extract(je.value, '$.qty') AS INTEGER) * CAST(json_extract(je.value, '$.price') AS REAL)) AS revenue
      FROM sales
      JOIN json_each(sales.items) je
      JOIN products p ON p.id = json_extract(je.value, '$.productId')
      WHERE date(sale_date) = date('now')
      GROUP BY p.id
      ORDER BY totalSold DESC
      LIMIT 5
    `);

    const paymentMethods = await allQuery(`
      SELECT payment_method, COUNT(*) AS transactions, SUM(total) AS totalRevenue
      FROM sales
      WHERE date(sale_date) = date('now')
      GROUP BY payment_method
    `);

    const repeatCustomers = await allQuery(`
      SELECT 
        s1.customer_email,
        COUNT(*) AS transactionCount,
        SUM(s1.total) AS lifetimeValue
      FROM sales s1
      WHERE s1.customer_email IS NOT NULL
      GROUP BY s1.customer_email
      HAVING COUNT(*) > 1
      ORDER BY lifetimeValue DESC
    `);

    const analytics = {
      todaySales: {
        ...todaySales,
        totalItemsSold: totalItemsSold.totalItemsSold || 0
      },
      topProducts,
      paymentMethods,
      repeatCustomers
    };

    res.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error.message);
    res.status(500).json({ error: 'Failed to generate analytics' });
  }
});

// ======================
// PATCH /stock/:id
// ======================
router.patch('/stock/:id', async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (typeof quantity !== 'number') {
    return res.status(400).json({ error: 'Quantity must be a number' });
  }

  try {
    await runQuery('UPDATE products SET stock = stock + ? WHERE id = ?', [quantity, id]);
    const product = await getQuery('SELECT id, name, stock FROM products WHERE id = ?', [id]);

    if (!product) return res.status(404).json({ error: 'Product not found' });

    myCache.del('products');
    res.json({ message: 'Stock updated', product });
  } catch (err) {
    console.error('Stock update error:', err.message);
    res.status(500).json({ error: 'Stock update failed' });
  }
});

// ======================
// GET /discounts
// ======================
router.get('/discounts', async (req, res) => {
  try {
    const discounts = await allQuery('SELECT * FROM discounts');
    res.json(discounts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load discounts' });
  }
});

// ======================
// POST /discounts/notify
// ======================
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

router.post('/discounts/notify', async (req, res) => {
  const { discounts, emailTemplate } = req.body;

  try {
    const customers = await allQuery(
      'SELECT DISTINCT customer_email FROM sales WHERE customer_email IS NOT NULL'
    );

    let sentCount = 0;
    for (const customer of customers) {
      await transporter.sendMail({
        from: `"Store Discounts" <${process.env.EMAIL_USER}>`,
        to: customer.customer_email,
        subject: emailTemplate.subject,
        html: `
          <h2>Special Discounts Just for You!</h2>
          <p>${emailTemplate.body}</p>
          <div style="display:flex;flex-wrap:wrap">
            ${discounts.map(product => `
              <div style="width:200px;margin:10px;text-align:center">
                <img src="http://localhost:5000/uploads/${product.image}" style="width:100px;height:100px" />
                <h3>${product.name}</h3>
                <p>Ksh ${product.discountedPrice}</p>
              </div>
            `).join('')}
          </div>
        `
      });
      sentCount++;
    }

    res.json({ success: true, sentCount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send discount emails' });
  }
});

module.exports = router;
