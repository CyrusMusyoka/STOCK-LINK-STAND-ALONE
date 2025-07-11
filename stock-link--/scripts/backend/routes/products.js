const express = require('express');
const router = express.Router();
const db = require('../db'); // This should export a sqlite3.Database instance
const multer = require('multer');
const path = require('path');
const NodeCache = require('node-cache');

// Cache setup
const myCache = new NodeCache({ stdTTL: 60 });

// File upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// GET all products
router.get('/', (req, res) => {
  const cachedProducts = myCache.get('products');
  if (cachedProducts) {
    return res.json(cachedProducts);
  }

  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch products' });

    myCache.set('products', rows);
    res.json(rows);
  });
});

// GET product by ID
router.get('/:id', (req, res) => {
  const id = req.params.id;

  db.get('SELECT * FROM products WHERE id = ?', [id], (err, product) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch product' });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    res.json({ success: true, product });
  });
});

// POST: create a new product
router.post('/', upload.single('image'), (req, res) => {
  const { name, price, stock, category } = req.body;
  const image = req.file ? req.file.filename : '';

  const sql = `INSERT INTO products (name, category, price, stock, image) VALUES (?, ?, ?, ?, ?)`;
  const params = [name, category, parseFloat(price), parseInt(stock), image];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: 'Error creating product' });

    myCache.del('products');
    res.json({ id: this.lastID, name, category, price, stock, image });
  });
});

// PUT: update a product
router.put('/:id', upload.single('image'), (req, res) => {
  const { name, price, stock, category } = req.body;
  const id = req.params.id;

  if (!name || !price || !stock) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const parsedPrice = parseFloat(price);
  const parsedStock = parseInt(stock);

  if (isNaN(parsedPrice) || isNaN(parsedStock)) {
    return res.status(400).json({ error: 'Invalid number format' });
  }

  let sql, params;

  if (req.file) {
    const image = req.file.filename;
    sql = `UPDATE products SET name = ?, category = ?, price = ?, stock = ?, image = ? WHERE id = ?`;
    params = [name, category, parsedPrice, parsedStock, image, id];
  } else {
    sql = `UPDATE products SET name = ?, category = ?, price = ?, stock = ? WHERE id = ?`;
    params = [name, category, parsedPrice, parsedStock, id];
  }

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: 'Error updating product' });

    myCache.del('products');
    res.json({ success: true });
  });
});

// DELETE product
router.delete('/:id', (req, res) => {
  const id = req.params.id;

  db.run('DELETE FROM products WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: 'Error deleting product' });

    myCache.del('products');
    res.json({ success: true });
  });
});

module.exports = router;
