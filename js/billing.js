// Billing System JavaScript
let cart = [];
let currentInvoiceNumber = generateInvoiceNumber();
let selectedCategory = 'all';
let allItems = [];

document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('invoiceNumber').value = currentInvoiceNumber;
    await loadMenuItems();
    setupEventListeners();
});

function generateInvoiceNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}${day}-${random}`;
}

async function loadMenuItems() {
    try {
        allItems = await api.getItems();
        const activeItems = allItems.filter(item => item.status === 'Active');
        displayMenuItems(activeItems);
    } catch (error) {
        console.error('Error loading menu items:', error);
    }
}

function displayMenuItems(items) {
    const grid = document.getElementById('menuItemsGrid');
    
    if (items.length === 0) {
        grid.innerHTML = '<div class="col-12 text-center"><p class="text-muted">No items available</p></div>';
        return;
    }

    grid.innerHTML = items.map(item => `
        <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
            <div class="card menu-item-card" data-item-id="${item.id}">
                <img src="${item.image || 'https://via.placeholder.com/400x200?text=No+Image'}" 
                     class="card-img-top" alt="${item.name}" 
                     onerror="this.src='https://via.placeholder.com/400x200?text=No+Image'">
                <div class="card-body">
                    <h6 class="card-title">${item.name}</h6>
                    <p class="card-text text-muted small">${item.description || ''}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="price">₹${item.price.toFixed(2)}</span>
                        <span class="badge bg-primary">${item.category}</span>
                    </div>
                    <button class="btn btn-primary btn-sm w-100 mt-2 add-to-cart-btn" 
                            data-item-id="${item.id}">
                        <i class="fas fa-plus me-1"></i>Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Add event listeners to add to cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const itemId = parseInt(btn.getAttribute('data-item-id'));
            addToCart(itemId);
        });
    });
}

function setupEventListeners() {
    // Search functionality
    document.getElementById('searchItems').addEventListener('input', (e) => {
        filterItems(e.target.value, selectedCategory);
    });

    // Category filter
    document.querySelectorAll('#categoryFilter button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#categoryFilter button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedCategory = btn.getAttribute('data-category');
            const searchTerm = document.getElementById('searchItems').value;
            filterItems(searchTerm, selectedCategory);
        });
    });

    // Discount percentage change
    document.getElementById('discountPercent').addEventListener('input', updateBillSummary);

    // Clear cart
    document.getElementById('clearCartBtn').addEventListener('click', clearCart);

    // Save bill
    document.getElementById('saveBillBtn').addEventListener('click', saveBill);

    // Print bill
    document.getElementById('printBillBtn').addEventListener('click', showPrintModal);
    document.getElementById('printNowBtn').addEventListener('click', printBill);
}

function filterItems(searchTerm, category) {
    let filtered = allItems.filter(item => item.status === 'Active');

    if (category !== 'all') {
        filtered = filtered.filter(item => item.category === category);
    }

    if (searchTerm) {
        filtered = filtered.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    displayMenuItems(filtered);
}

function addToCart(itemId) {
    const item = allItems.find(i => i.id === itemId);
    if (!item) return;

    const existingItem = cart.find(c => c.id === itemId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...item,
            quantity: 1
        });
    }

    updateCartDisplay();
    updateBillSummary();
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    updateCartDisplay();
    updateBillSummary();
}

function updateQuantity(itemId, change) {
    const item = cart.find(c => c.id === itemId);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
        removeFromCart(itemId);
    } else {
        updateCartDisplay();
        updateBillSummary();
    }
}

function updateCartDisplay() {
    const cartItemsDiv = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p class="text-muted text-center">No items in cart</p>';
        return;
    }

    cartItemsDiv.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-header">
                <strong>${item.name}</strong>
                <button class="btn btn-sm btn-danger" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="d-flex justify-content-between align-items-center mt-2">
                <span>₹${item.price.toFixed(2)} × </span>
                <div class="cart-item-controls">
                    <button class="btn btn-sm btn-outline-primary" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <input type="number" class="form-control form-control-sm" 
                           value="${item.quantity}" min="1" 
                           onchange="setQuantity(${item.id}, this.value)">
                    <button class="btn btn-sm btn-outline-primary" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
                <strong>₹${(item.price * item.quantity).toFixed(2)}</strong>
            </div>
        </div>
    `).join('');
}

function setQuantity(itemId, quantity) {
    const item = cart.find(c => c.id === parseInt(itemId));
    if (item) {
        item.quantity = Math.max(1, parseInt(quantity) || 1);
        updateCartDisplay();
        updateBillSummary();
    }
}

function updateBillSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountPercent = parseFloat(document.getElementById('discountPercent').value) || 0;
    const discountAmount = (subtotal * discountPercent) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * 5) / 100; // 5% GST
    const total = taxableAmount + taxAmount;

    document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('discountAmount').textContent = `₹${discountAmount.toFixed(2)}`;
    document.getElementById('taxAmount').textContent = `₹${taxAmount.toFixed(2)}`;
    document.getElementById('totalAmount').textContent = `₹${total.toFixed(2)}`;
}

function clearCart() {
    if (confirm('Are you sure you want to clear the cart?')) {
        cart = [];
        currentInvoiceNumber = generateInvoiceNumber();
        document.getElementById('invoiceNumber').value = currentInvoiceNumber;
        document.getElementById('customerName').value = '';
        document.getElementById('discountPercent').value = 0;
        updateCartDisplay();
        updateBillSummary();
    }
}

async function saveBill() {
    if (cart.length === 0) {
        alert('Cart is empty. Please add items to the cart.');
        return;
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountPercent = parseFloat(document.getElementById('discountPercent').value) || 0;
    const discountAmount = (subtotal * discountPercent) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * 5) / 100;
    const total = taxableAmount + taxAmount;

    const order = {
        invoiceNumber: currentInvoiceNumber,
        customerName: document.getElementById('customerName').value || 'Walk-in Customer',
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            category: item.category,
            price: item.price,
            quantity: item.quantity
        })),
        subtotal: subtotal,
        discount: discountAmount,
        tax: taxAmount,
        total: total,
        timestamp: new Date().toISOString()
    };

    try {
        await api.createOrder(order);
        alert('Bill saved successfully!');
        clearCart();
    } catch (error) {
        console.error('Error saving bill:', error);
        alert('Error saving bill. Please try again.');
    }
}

function showPrintModal() {
    if (cart.length === 0) {
        alert('Cart is empty. Please add items to the cart.');
        return;
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountPercent = parseFloat(document.getElementById('discountPercent').value) || 0;
    const discountAmount = (subtotal * discountPercent) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * 5) / 100;
    const total = taxableAmount + taxAmount;
    const customerName = document.getElementById('customerName').value || 'Walk-in Customer';

    const billContent = generateBillHTML(currentInvoiceNumber, customerName, cart, subtotal, discountAmount, taxAmount, total);
    document.getElementById('printBillContent').innerHTML = billContent;

    const modal = new bootstrap.Modal(document.getElementById('printBillModal'));
    modal.show();
}

function generateBillHTML(invoiceNumber, customerName, items, subtotal, discount, tax, total) {
    const date = new Date().toLocaleString();
    
    return `
        <div class="print-bill" id="printBill">
            <div class="print-bill-header">
                <h2>Sweet Bakery</h2>
                <p>123 Bakery Street, City - 123456</p>
                <p>Phone: +91 9876543210 | Email: info@sweetbakery.com</p>
            </div>
            <div class="print-bill-info">
                <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
                <p><strong>Date:</strong> ${date}</p>
                <p><strong>Customer:</strong> ${customerName}</p>
            </div>
            <div class="print-bill-items">
                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td>${item.quantity}</td>
                                <td>₹${item.price.toFixed(2)}</td>
                                <td>₹${(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="print-bill-summary">
                <p>Subtotal: ₹${subtotal.toFixed(2)}</p>
                <p>Discount: ₹${discount.toFixed(2)}</p>
                <p>Tax (GST 5%): ₹${tax.toFixed(2)}</p>
                <h4>Total: ₹${total.toFixed(2)}</h4>
            </div>
            <div class="print-bill-footer">
                <p>Thank you for your visit!</p>
                <p>Visit us again soon!</p>
            </div>
        </div>
    `;
}

function printBill() {
    const printContent = document.getElementById('printBill').innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    
    // Reload the page to restore functionality
    location.reload();
}

// Make functions globally available
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.setQuantity = setQuantity;

