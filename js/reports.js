// Reports JavaScript
let revenueChart, categoryChart;
let allOrders = [];
let filteredOrders = [];

document.addEventListener('DOMContentLoaded', async () => {
    await loadOrders();
    setupEventListeners();
    initializeCharts();
    setDefaultDates();
});

function setDefaultDates() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    document.getElementById('startDate').value = startOfMonth.toISOString().split('T')[0];
    document.getElementById('endDate').value = today.toISOString().split('T')[0];
}

async function loadOrders() {
    try {
        allOrders = await api.getOrders();
        filteredOrders = allOrders;
        generateReport();
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

function setupEventListeners() {
    document.getElementById('generateReportBtn').addEventListener('click', generateReport);
    document.getElementById('resetFiltersBtn').addEventListener('click', resetFilters);
    document.getElementById('exportCSVBtn').addEventListener('click', exportToCSV);
    document.getElementById('exportPDFBtn').addEventListener('click', exportToPDF);
    
    document.getElementById('reportType').addEventListener('change', (e) => {
        updateDateRange(e.target.value);
    });
}

function updateDateRange(reportType) {
    const today = new Date();
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    let startDate, endDate;
    
    switch (reportType) {
        case 'daily':
            startDate = new Date(today);
            endDate = new Date(today);
            break;
        case 'weekly':
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 7);
            endDate = new Date(today);
            break;
        case 'monthly':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today);
            break;
        case 'custom':
            // Don't change dates for custom
            return;
    }
    
    startDateInput.value = startDate.toISOString().split('T')[0];
    endDateInput.value = endDate.toISOString().split('T')[0];
}

async function generateReport() {
    const reportType = document.getElementById('reportType').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const category = document.getElementById('categoryFilter').value;

    const filters = {
        startDate: startDate || null,
        endDate: endDate || null,
        category: category
    };

    try {
        filteredOrders = await api.getReports(filters);
        updateReportSummary();
        updateOrdersTable();
        updateCharts();
    } catch (error) {
        console.error('Error generating report:', error);
    }
}

function updateReportSummary() {
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = filteredOrders.length;
    const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    let itemsSold = 0;
    filteredOrders.forEach(order => {
        order.items.forEach(item => {
            itemsSold += item.quantity;
        });
    });

    document.getElementById('reportTotalRevenue').textContent = `₹${totalRevenue.toFixed(2)}`;
    document.getElementById('reportTotalOrders').textContent = totalOrders;
    document.getElementById('reportAvgOrder').textContent = `₹${avgOrder.toFixed(2)}`;
    document.getElementById('reportItemsSold').textContent = itemsSold;
}

function updateOrdersTable() {
    const tbody = document.getElementById('ordersTableBody');
    
    if (filteredOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center">No orders found for the selected filters.</td></tr>';
        return;
    }

    tbody.innerHTML = filteredOrders.map(order => {
        const date = new Date(order.timestamp);
        const itemsList = order.items.map(item => `${item.name} (${item.quantity})`).join(', ');
        const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
        
        return `
            <tr>
                <td>#${order.invoiceNumber}</td>
                <td>${date.toLocaleString()}</td>
                <td>${order.customerName}</td>
                <td>${itemsList}</td>
                <td>${totalQuantity}</td>
                <td>₹${order.subtotal.toFixed(2)}</td>
                <td>₹${order.discount.toFixed(2)}</td>
                <td>₹${order.tax.toFixed(2)}</td>
                <td><strong>₹${order.total.toFixed(2)}</strong></td>
            </tr>
        `;
    }).join('');
}

function initializeCharts() {
    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        revenueChart = new Chart(revenueCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Revenue (₹)',
                    data: [],
                    backgroundColor: 'rgba(28, 181, 224, 0.6)',
                    borderColor: '#1cb5e0',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
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
            type: 'pie',
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

function updateCharts() {
    // Group orders by date
    const ordersByDate = {};
    filteredOrders.forEach(order => {
        const date = new Date(order.timestamp).toLocaleDateString();
        if (!ordersByDate[date]) {
            ordersByDate[date] = 0;
        }
        ordersByDate[date] += order.total;
    });

    const dates = Object.keys(ordersByDate).sort();
    const revenues = dates.map(date => ordersByDate[date]);

    if (revenueChart) {
        revenueChart.data.labels = dates;
        revenueChart.data.datasets[0].data = revenues;
        revenueChart.update();
    }

    // Category distribution
    const categoryRevenue = {};
    filteredOrders.forEach(order => {
        order.items.forEach(item => {
            if (!categoryRevenue[item.category]) {
                categoryRevenue[item.category] = 0;
            }
            categoryRevenue[item.category] += item.price * item.quantity;
        });
    });

    if (categoryChart) {
        categoryChart.data.labels = Object.keys(categoryRevenue);
        categoryChart.data.datasets[0].data = Object.values(categoryRevenue);
        categoryChart.update();
    }
}

function resetFilters() {
    document.getElementById('reportType').value = 'monthly';
    document.getElementById('categoryFilter').value = 'all';
    setDefaultDates();
    generateReport();
}

function exportToCSV() {
    if (filteredOrders.length === 0) {
        alert('No data to export.');
        return;
    }

    const headers = ['Invoice Number', 'Date', 'Customer', 'Items', 'Quantity', 'Subtotal', 'Discount', 'Tax', 'Total'];
    const rows = filteredOrders.map(order => {
        const date = new Date(order.timestamp).toLocaleString();
        const itemsList = order.items.map(item => `${item.name} (${item.quantity})`).join('; ');
        const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
        
        return [
            order.invoiceNumber,
            date,
            order.customerName,
            itemsList,
            totalQuantity,
            order.subtotal.toFixed(2),
            order.discount.toFixed(2),
            order.tax.toFixed(2),
            order.total.toFixed(2)
        ];
    });

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bakery_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function exportToPDF() {
    if (typeof window.jspdf === 'undefined') {
        alert('PDF library not loaded. Please check your internet connection.');
        return;
    }

    if (filteredOrders.length === 0) {
        alert('No data to export.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text('Bakery Sales Report', 14, 20);
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Total Orders: ${filteredOrders.length}`, 14, 36);
    doc.text(`Total Revenue: ₹${filteredOrders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}`, 14, 42);

    // Table
    let y = 50;
    doc.setFontSize(10);
    
    // Table headers
    doc.setFillColor(0, 0, 70);
    doc.setTextColor(255, 255, 255);
    doc.rect(14, y, 180, 8, 'F');
    doc.text('Invoice', 16, y + 6);
    doc.text('Date', 40, y + 6);
    doc.text('Customer', 70, y + 6);
    doc.text('Total', 150, y + 6);
    doc.text('Items', 170, y + 6);

    y += 8;
    doc.setTextColor(0, 0, 0);

    filteredOrders.forEach((order, index) => {
        if (y > 280) {
            doc.addPage();
            y = 20;
        }

        const date = new Date(order.timestamp).toLocaleDateString();
        const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

        doc.text(order.invoiceNumber, 16, y);
        doc.text(date, 40, y);
        doc.text(order.customerName.substring(0, 20), 70, y);
        doc.text(`₹${order.total.toFixed(2)}`, 150, y);
        doc.text(itemsCount.toString(), 170, y);

        y += 7;
    });

    doc.save(`bakery_report_${new Date().toISOString().split('T')[0]}.pdf`);
}

