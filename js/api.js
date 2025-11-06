// API Simulation - Can be replaced with real backend
class BakeryAPI {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.useLocalStorage = true; // Default to localStorage, set to false to use backend
        this.backendAvailable = false;
        
        // Initialize data if using localStorage
        this.initLocalStorage();
        
        // Try to detect backend availability (optional)
        this.checkBackendAvailability();
    }

    async checkBackendAvailability() {
        // Only check if not explicitly using localStorage
        if (!this.useLocalStorage) {
            try {
                const response = await fetch(`${this.baseURL}/items`, { 
                    method: 'HEAD',
                    mode: 'no-cors' 
                });
                this.backendAvailable = true;
            } catch (error) {
                console.log('Backend not available, using localStorage');
                this.useLocalStorage = true;
            }
        }
    }

    initLocalStorage() {
        // Initialize items if not exists
        if (!localStorage.getItem('bakeryItems')) {
            const defaultItems = this.getDefaultItems();
            localStorage.setItem('bakeryItems', JSON.stringify(defaultItems));
        }

        // Initialize orders if not exists
        if (!localStorage.getItem('bakeryOrders')) {
            localStorage.setItem('bakeryOrders', JSON.stringify([]));
        }
    }

    getDefaultItems() {
        return [
            {
                id: 1,
                name: "Masala Chai",
                category: "Tea",
                price: 15,
                description: "Spiced Indian tea with milk",
                image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400",
                status: "Active"
            },
            {
                id: 2,
                name: "Cappuccino",
                category: "Coffee",
                price: 50,
                description: "Espresso with steamed milk foam",
                image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400",
                status: "Active"
            },
            {
                id: 3,
                name: "Vada",
                category: "Snacks",
                price: 20,
                description: "Crispy lentil fritters",
                image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400",
                status: "Active"
            },
            {
                id: 4,
                name: "Chicken Puff",
                category: "Snacks",
                price: 35,
                description: "Flaky pastry with chicken filling",
                image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400",
                status: "Active"
            },
            {
                id: 5,
                name: "Chocolate Cake",
                category: "Cake",
                price: 250,
                description: "Rich chocolate layer cake",
                image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
                status: "Active"
            },
            {
                id: 6,
                name: "Butter Cookies",
                category: "Cookies",
                price: 180,
                description: "Crispy butter cookies",
                image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400",
                status: "Active"
            },
            {
                id: 7,
                name: "Dark Chocolate",
                category: "Chocolates",
                price: 120,
                description: "Premium dark chocolate bar",
                image: "https://images.unsplash.com/photo-1606312619070-d48b4cbc6b7c?w=400",
                status: "Active"
            },
            {
                id: 8,
                name: "Samosa",
                category: "Snacks",
                price: 25,
                description: "Spiced potato filled pastry",
                image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400",
                status: "Active"
            },
            {
                id: 9,
                name: "Cold Coffee",
                category: "Drinks",
                price: 60,
                description: "Iced coffee with cream",
                image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400",
                status: "Active"
            },
            {
                id: 10,
                name: "Vanilla Cake",
                category: "Cake",
                price: 220,
                description: "Soft vanilla sponge cake",
                image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400",
                status: "Active"
            }
        ];
    }

    // Items API
    async getItems() {
        if (this.useLocalStorage) {
            return JSON.parse(localStorage.getItem('bakeryItems') || '[]');
        }
        try {
            const response = await fetch(`${this.baseURL}/items`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching items:', error);
            return this.getDefaultItems();
        }
    }

    async getItem(id) {
        if (this.useLocalStorage) {
            const items = JSON.parse(localStorage.getItem('bakeryItems') || '[]');
            return items.find(item => item.id === parseInt(id));
        }
        try {
            const response = await fetch(`${this.baseURL}/items/${id}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching item:', error);
            return null;
        }
    }

    async createItem(item) {
        if (this.useLocalStorage) {
            const items = JSON.parse(localStorage.getItem('bakeryItems') || '[]');
            const newItem = {
                ...item,
                id: items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1
            };
            items.push(newItem);
            localStorage.setItem('bakeryItems', JSON.stringify(items));
            return newItem;
        }
        try {
            const response = await fetch(`${this.baseURL}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating item:', error);
            return null;
        }
    }

    async updateItem(id, item) {
        if (this.useLocalStorage) {
            const items = JSON.parse(localStorage.getItem('bakeryItems') || '[]');
            const index = items.findIndex(i => i.id === parseInt(id));
            if (index !== -1) {
                items[index] = { ...items[index], ...item, id: parseInt(id) };
                localStorage.setItem('bakeryItems', JSON.stringify(items));
                return items[index];
            }
            return null;
        }
        try {
            const response = await fetch(`${this.baseURL}/items/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating item:', error);
            return null;
        }
    }

    async deleteItem(id) {
        if (this.useLocalStorage) {
            const items = JSON.parse(localStorage.getItem('bakeryItems') || '[]');
            const filtered = items.filter(i => i.id !== parseInt(id));
            localStorage.setItem('bakeryItems', JSON.stringify(filtered));
            return true;
        }
        try {
            const response = await fetch(`${this.baseURL}/items/${id}`, {
                method: 'DELETE'
            });
            return response.ok;
        } catch (error) {
            console.error('Error deleting item:', error);
            return false;
        }
    }

    // Orders API
    async getOrders() {
        if (this.useLocalStorage) {
            return JSON.parse(localStorage.getItem('bakeryOrders') || '[]');
        }
        try {
            const response = await fetch(`${this.baseURL}/orders`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching orders:', error);
            return [];
        }
    }

    async createOrder(order) {
        if (this.useLocalStorage) {
            const orders = JSON.parse(localStorage.getItem('bakeryOrders') || '[]');
            const newOrder = {
                ...order,
                id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1,
                timestamp: new Date().toISOString()
            };
            orders.push(newOrder);
            localStorage.setItem('bakeryOrders', JSON.stringify(orders));
            return newOrder;
        }
        try {
            const response = await fetch(`${this.baseURL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(order)
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating order:', error);
            return null;
        }
    }

    // Reports API
    async getReports(filters = {}) {
        const orders = await this.getOrders();
        let filtered = [...orders];

        // Filter by date range
        if (filters.startDate) {
            filtered = filtered.filter(order => new Date(order.timestamp) >= new Date(filters.startDate));
        }
        if (filters.endDate) {
            filtered = filtered.filter(order => new Date(order.timestamp) <= new Date(filters.endDate));
        }

        // Filter by category
        if (filters.category && filters.category !== 'all') {
            filtered = filtered.filter(order => 
                order.items.some(item => item.category === filters.category)
            );
        }

        return filtered;
    }
}

// Create global API instance
const api = new BakeryAPI();

