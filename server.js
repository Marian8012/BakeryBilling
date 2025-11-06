// Express Backend Server (Optional - for production use)
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

// Initialize SQLite Database
const db = new sqlite3.Database('./bakery.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        initializeDatabase();
    }
});

function initializeDatabase() {
    // Create items table
    db.run(`CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        image TEXT,
        status TEXT DEFAULT 'Active'
    )`, (err) => {
        if (err) {
            console.error('Error creating items table:', err.message);
        } else {
            // Insert default items if table is empty
            db.get('SELECT COUNT(*) as count FROM items', (err, row) => {
                if (!err && row.count === 0) {
                    insertDefaultItems();
                }
            });
        }
    });

    // Create orders table
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoiceNumber TEXT UNIQUE NOT NULL,
        customerName TEXT,
        items TEXT NOT NULL,
        subtotal REAL NOT NULL,
        discount REAL DEFAULT 0,
        tax REAL NOT NULL,
        total REAL NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('Error creating orders table:', err.message);
        }
    });
}

function insertDefaultItems() {
    const defaultItems = [
        ['Masala Chai', 'Tea', 15, 'Spiced Indian tea with milk', 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400', 'Active'],
        ['Cappuccino', 'Coffee', 50, 'Espresso with steamed milk foam', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400', 'Active'],
        ['Vada', 'Snacks', 20, 'Crispy lentil fritters', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400', 'Active'],
        ['Chicken Puff', 'Snacks', 35, 'Flaky pastry with chicken filling', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', 'Active'],
        ['Chocolate Cake', 'Cake', 250, 'Rich chocolate layer cake', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', 'Active'],
        ['Butter Cookies', 'Cookies', 180, 'Crispy butter cookies', 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400', 'Active'],
        ['Dark Chocolate', 'Chocolates', 120, 'Premium dark chocolate bar', 'https://images.unsplash.com/photo-1606312619070-d48b4cbc6b7c?w=400', 'Active'],
        ['Samosa', 'Snacks', 25, 'Spiced potato filled pastry', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', 'Active'],
        ['Cold Coffee', 'Drinks', 60, 'Iced coffee with cream', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', 'Active'],
        ['Vanilla Cake', 'Cake', 220, 'Soft vanilla sponge cake', 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400', 'Active']
    ];

    const stmt = db.prepare('INSERT INTO items (name, category, price, description, image, status) VALUES (?, ?, ?, ?, ?, ?)');
    defaultItems.forEach(item => {
        stmt.run(item);
    });
    stmt.finalize();
    console.log('Default items inserted.');
}

// API Routes - Items
app.get('/api/items', (req, res) => {
    db.all('SELECT * FROM items ORDER BY id DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/items/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM items WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Item not found' });
            return;
        }
        res.json(row);
    });
});

app.post('/api/items', (req, res) => {
    const { name, category, price, description, image, status } = req.body;
    db.run(
        'INSERT INTO items (name, category, price, description, image, status) VALUES (?, ?, ?, ?, ?, ?)',
        [name, category, price, description, image, status],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID, ...req.body });
        }
    );
});

app.put('/api/items/:id', (req, res) => {
    const id = req.params.id;
    const { name, category, price, description, image, status } = req.body;
    db.run(
        'UPDATE items SET name = ?, category = ?, price = ?, description = ?, image = ?, status = ? WHERE id = ?',
        [name, category, price, description, image, status, id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: 'Item not found' });
                return;
            }
            res.json({ id: parseInt(id), ...req.body });
        }
    );
});

app.delete('/api/items/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM items WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Item not found' });
            return;
        }
        res.json({ message: 'Item deleted successfully' });
    });
});

// API Routes - Orders
app.get('/api/orders', (req, res) => {
    db.all('SELECT * FROM orders ORDER BY timestamp DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        // Parse items JSON string
        const orders = rows.map(row => ({
            ...row,
            items: JSON.parse(row.items)
        }));
        res.json(orders);
    });
});

app.post('/api/orders', (req, res) => {
    const { invoiceNumber, customerName, items, subtotal, discount, tax, total } = req.body;
    const itemsJson = JSON.stringify(items);
    
    db.run(
        'INSERT INTO orders (invoiceNumber, customerName, items, subtotal, discount, tax, total) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [invoiceNumber, customerName, itemsJson, subtotal, discount, tax, total],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ 
                id: this.lastID, 
                invoiceNumber,
                customerName,
                items,
                subtotal,
                discount,
                tax,
                total,
                timestamp: new Date().toISOString()
            });
        }
    );
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('API endpoints available at http://localhost:3000/api');
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Database connection closed.');
        process.exit(0);
    });
});

