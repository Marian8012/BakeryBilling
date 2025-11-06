# Bakery Shop Billing System

A complete, responsive real-time Bakery Shop Billing Website built with HTML, CSS, Bootstrap, and JavaScript. Features modern UI/UX with a beautiful gradient theme, professional menu cards, real-time billing functionality, and comprehensive reporting.

## Features

### 🎯 Real-time Billing System
- Add multiple bakery items to a bill with quantity, price, discount, and tax
- Automatically calculate subtotal, total amount, and tax in real-time
- Generate printable bills (A4 and thermal printer format)
- Save bill history with invoice numbers
- Search and filter items in the billing screen

### 📋 Menu Management (CRUD)
- Add, Edit, and Delete bakery items
- Fields: Item Name, Category, Price, Description, Image, Status (Active/Inactive)
- Categories: Tea, Coffee, Vada, Puffs, Cake, Cookies, Chocolates, Samosa, Cool Drinks, etc.
- Beautiful menu cards with images from Unsplash/Pexels/Pixabay

### 📊 Dashboard with Insights
- Professional sales analytics
- Total sales, total orders, top-selling items, and daily revenue
- Interactive charts and graphs using Chart.js (Bar, Line, Pie)
- Summary cards with quick view of today's performance
- Recent orders display

### 📈 Reports Section
- Generate reports (daily, weekly, monthly, custom range)
- Export reports to CSV or PDF
- Search and filter orders by date range or category
- Revenue trends and category distribution charts

### 🎨 Design & Theme
- Beautiful gradient theme: `linear-gradient(90deg, #000046 0%, #1cb5e0 100%)`
- Clean, minimal, professional layout
- Rounded cards, shadows, and responsive grid
- Attractive bakery-style fonts and icons
- Fully responsive for desktop, tablet, and mobile
- Smooth transitions and hover effects

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Framework**: Bootstrap 5.3.0
- **Charts**: Chart.js 4.4.0
- **Icons**: Font Awesome 6.4.0
- **Backend** (Optional): Node.js, Express.js, SQLite3
- **PDF Export**: jsPDF

## Installation & Setup

### Option 1: Standalone (LocalStorage - No Backend Required)

1. Clone or download this repository
2. Open `index.html` in a web browser
3. The application will work with localStorage (data persists in browser)

### Option 2: With Backend Server (Recommended for Production)

1. Install Node.js (v14 or higher)

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

5. For development with auto-reload:
```bash
npm run dev
```

## Project Structure

```
BillingApplication/
│
├── index.html          # Dashboard page
├── billing.html        # Billing/POS page
├── menu.html           # Menu management page
├── reports.html        # Reports and analytics page
│
├── css/
│   └── styles.css      # Main stylesheet with gradient theme
│
├── js/
│   ├── api.js          # API simulation/localStorage handler
│   ├── main.js         # Dashboard functionality
│   ├── billing.js      # Billing system logic
│   ├── menu.js         # Menu CRUD operations
│   └── reports.js      # Reports and export functionality
│
├── server.js           # Express backend server (optional)
├── package.json        # Node.js dependencies
└── README.md           # This file
```

## Usage Guide

### Dashboard
- View sales analytics and summary cards
- Check top-selling items
- View recent orders
- Monitor daily revenue and performance

### Billing
1. Select items from the menu grid
2. Adjust quantities using +/- buttons
3. Apply discount percentage if needed
4. Tax (GST 5%) is calculated automatically
5. Click "Save Bill" to save the order
6. Click "Print Bill" to generate a printable invoice

### Menu Management
1. Click "Add New Item" to create a new menu item
2. Fill in item details (name, category, price, description, image URL)
3. Set status to Active/Inactive
4. Click "Edit" to modify existing items
5. Click "Delete" to remove items

### Reports
1. Select report type (Daily, Weekly, Monthly, Custom)
2. Choose date range and category filter
3. Click "Generate Report" to view filtered data
4. Export to CSV or PDF using the export buttons

## API Endpoints (Backend Server)

### Items
- `GET /api/items` - Get all items
- `GET /api/items/:id` - Get single item
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Features in Detail

### Real-time Calculations
- Subtotal updates automatically as items are added/removed
- Discount is calculated as a percentage
- Tax (GST 5%) is applied on the discounted amount
- Total amount updates in real-time

### Print Functionality
- A4 format for standard printing
- Thermal printer format support
- Includes bakery name, address, invoice number
- Itemized bill with totals
- Thank you message

### Data Persistence
- **LocalStorage Mode**: Data stored in browser localStorage
- **Backend Mode**: Data stored in SQLite database
- Automatic data initialization with default items

## Customization

### Changing Theme Colors
Edit `css/styles.css`:
```css
:root {
    --gradient-start: #000046;
    --gradient-end: #1cb5e0;
}
```

### Adding Categories
Edit the category dropdown in `menu.html` and category filter buttons in `billing.html`.

### Modifying Tax Rate
Edit the tax calculation in `js/billing.js`:
```javascript
const taxAmount = (taxableAmount * 5) / 100; // Change 5 to your tax rate
```

## License

MIT License - Feel free to use this project for personal or commercial purposes.

## Support

For issues, questions, or contributions, please open an issue on the repository.

## Credits

- Images: Unsplash, Pexels, Pixabay
- Icons: Font Awesome
- Charts: Chart.js
- Framework: Bootstrap

---

**Enjoy your Bakery Billing System! 🎂🍰☕**

