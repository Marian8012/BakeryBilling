// Dashboard Main JavaScript
let salesChart, categoryChart;

document.addEventListener('DOMContentLoaded', async () => {
    await loadDashboardData();
    initializeCharts();
});

async function loadDashboardData() {
    try {
        const [items, orders] = await Promise.all([
            api.getItems(),
            api.getOrders()
        ]);

        // Update summary cards
        updateSummaryCards(items, orders);

        // Update top selling items
        updateTopSellingItems(orders);

        // Update recent orders
        updateRecentOrders(orders);

        // Update charts
        updateCharts(orders);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function updateSummaryCards(items, orders) {
    // Total Sales
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    document.getElementById('totalSales').textContent = `₹${totalSales.toFixed(2)}`;

    // Total Orders
    document.getElementById('totalOrders').textContent = orders.length;

    // Today's Revenue
    const today = new Date().toDateString();
    const todayOrders = orders.filter(order => 
        new Date(order.timestamp).toDateString() === today
    );
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    document.getElementById('todayRevenue').textContent = `₹${todayRevenue.toFixed(2)}`;

    // Active Items
    const activeItems = items.filter(item => item.status === 'Active').length;
    document.getElementById('activeItems').textContent = activeItems;
}

function updateTopSellingItems(orders) {
    const itemSales = {};

    orders.forEach(order => {
        order.items.forEach(item => {
            if (!itemSales[item.name]) {
                itemSales[item.name] = {
                    name: item.name,
                    category: item.category,
                    quantity: 0,
                    revenue: 0
                };
            }
            itemSales[item.name].quantity += item.quantity;
            itemSales[item.name].revenue += item.price * item.quantity;
        });
    });

    const topItems = Object.values(itemSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

    const tbody = document.getElementById('topItemsTable');
    if (topItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No sales data available</td></tr>';
        return;
    }

    tbody.innerHTML = topItems.map((item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${item.name}</td>
            <td><span class="badge bg-primary">${item.category}</span></td>
            <td>${item.quantity}</td>
            <td>₹${item.revenue.toFixed(2)}</td>
        </tr>
    `).join('');
}

function updateRecentOrders(orders) {
    const recentOrders = orders
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10);

    const tbody = document.getElementById('recentOrdersTable');
    if (recentOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No orders yet</td></tr>';
        return;
    }

    tbody.innerHTML = recentOrders.map(order => {
        const date = new Date(order.timestamp);
        const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
        return `
            <tr>
                <td>#${order.invoiceNumber}</td>
                <td>${date.toLocaleString()}</td>
                <td>${itemsCount} items</td>
                <td>₹${order.total.toFixed(2)}</td>
                <td><span class="badge badge-success">Completed</span></td>
            </tr>
        `;
    }).join('');
}

function initializeCharts() {
    // Sales Chart
    const salesCtx = document.getElementById('salesChart');
    if (salesCtx) {
        salesChart = new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Sales (₹)',
                    data: [],
                    borderColor: '#1cb5e0',
                    backgroundColor: 'rgba(28, 181, 224, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Category Chart
    const categoryCtx = document.getElementById('categoryChart');
    if (categoryCtx) {
        categoryChart = new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#000046',
                        '#1cb5e0',
                        '#667eea',
                        '#764ba2',
                        '#f093fb',
                        '#f5576c',
                        '#4facfe',
                        '#00f2fe'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

function updateCharts(orders) {
    // Update Sales Chart (Last 7 days)
    const last7Days = [];
    const salesData = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        last7Days.push(dateStr);

        const dayOrders = orders.filter(order => {
            const orderDate = new Date(order.timestamp);
            return orderDate.toDateString() === date.toDateString();
        });
        const daySales = dayOrders.reduce((sum, order) => sum + order.total, 0);
        salesData.push(daySales);
    }

    if (salesChart) {
        salesChart.data.labels = last7Days;
        salesChart.data.datasets[0].data = salesData;
        salesChart.update();
    }

    // Update Category Chart
    const categorySales = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            if (!categorySales[item.category]) {
                categorySales[item.category] = 0;
            }
            categorySales[item.category] += item.price * item.quantity;
        });
    });

    if (categoryChart) {
        categoryChart.data.labels = Object.keys(categorySales);
        categoryChart.data.datasets[0].data = Object.values(categorySales);
        categoryChart.update();
    }
}

