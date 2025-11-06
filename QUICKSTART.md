# Quick Start Guide

## Getting Started in 3 Steps

### Step 1: Open the Application

**Option A: Standalone (No Installation Required)**
- Simply open `index.html` in your web browser
- The application will work immediately using browser localStorage
- All data will be saved in your browser

**Option B: With Backend Server**
```bash
# Install dependencies
npm install

# Start the server
npm start

# Open browser to http://localhost:3000
```

### Step 2: Explore the Features

1. **Dashboard** (`index.html`)
   - View sales analytics
   - Check top-selling items
   - Monitor daily revenue

2. **Billing** (`billing.html`)
   - Add items to cart
   - Calculate totals in real-time
   - Print bills
   - Save orders

3. **Menu Management** (`menu.html`)
   - Add new items
   - Edit existing items
   - Delete items
   - Manage item status

4. **Reports** (`reports.html`)
   - Generate sales reports
   - Filter by date and category
   - Export to CSV/PDF

### Step 3: Start Using

1. Go to **Menu** page and add your bakery items
2. Go to **Billing** page and start creating bills
3. View **Dashboard** for insights
4. Generate **Reports** for analysis

## Default Items

The application comes with 10 default items:
- Masala Chai (Tea)
- Cappuccino (Coffee)
- Vada (Snacks)
- Chicken Puff (Snacks)
- Chocolate Cake (Cake)
- Butter Cookies (Cookies)
- Dark Chocolate (Chocolates)
- Samosa (Snacks)
- Cold Coffee (Drinks)
- Vanilla Cake (Cake)

## Tips

- **Search Items**: Use the search box in the billing page to quickly find items
- **Category Filter**: Click category buttons to filter items
- **Discount**: Apply discount percentage in the billing cart
- **Print Bills**: Click "Print Bill" to generate printable invoices
- **Export Reports**: Use CSV or PDF export buttons in the reports page

## Troubleshooting

**Images not loading?**
- Check your internet connection (images are loaded from Unsplash)
- You can add your own image URLs in the menu management

**Data not saving?**
- If using standalone mode, check browser localStorage is enabled
- If using backend, ensure the server is running

**Charts not showing?**
- Ensure Chart.js CDN is loading (check internet connection)
- Check browser console for errors

## Need Help?

Refer to the main README.md for detailed documentation.

