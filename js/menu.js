// Menu Management JavaScript
let items = [];
let editingItemId = null;
let uploadedImageBase64 = null;

document.addEventListener('DOMContentLoaded', async () => {
    await loadItems();
    setupEventListeners();
});

async function loadItems() {
    try {
        items = await api.getItems();
        displayItems(items);
    } catch (error) {
        console.error('Error loading items:', error);
    }
}

function displayItems(itemsList) {
    const grid = document.getElementById('menuItemsGrid');
    
    if (itemsList.length === 0) {
        grid.innerHTML = '<div class="col-12 text-center"><p class="text-muted">No items found. Add your first item!</p></div>';
        return;
    }

    grid.innerHTML = itemsList.map(item => `
        <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
            <div class="card menu-item-card">
                <img src="${item.image || 'https://via.placeholder.com/400x200?text=No+Image'}" 
                     class="card-img-top" alt="${item.name}"
                     onerror="this.src='https://via.placeholder.com/400x200?text=No+Image'">
                <div class="card-body">
                    <h6 class="card-title">${item.name}</h6>
                    <p class="card-text text-muted small">${item.description || 'No description'}</p>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="price">₹${item.price.toFixed(2)}</span>
                        <span class="badge ${item.status === 'Active' ? 'badge-success' : 'badge-danger'}">${item.status}</span>
                    </div>
                    <div class="mb-2">
                        <span class="badge bg-primary">${item.category}</span>
                    </div>
                    <div class="btn-group w-100" role="group">
                        <button class="btn btn-sm btn-primary" onclick="editItem(${item.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteItem(${item.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function setupEventListeners() {
    // Add item button
    document.getElementById('addItemBtn').addEventListener('click', () => {
        editingItemId = null;
        uploadedImageBase64 = null;
        resetForm();
        document.getElementById('modalTitle').textContent = 'Add New Item';
    });

    // Save item button
    document.getElementById('saveItemBtn').addEventListener('click', saveItem);

    // Image file upload
    document.getElementById('itemImageUpload').addEventListener('change', handleImageUpload);

    // Image URL preview
    document.getElementById('itemImage').addEventListener('input', (e) => {
        const url = e.target.value;
        if (url) {
            // Clear uploaded image if URL is entered
            uploadedImageBase64 = null;
            document.getElementById('itemImageUpload').value = '';
            showImagePreview(url);
        } else if (!uploadedImageBase64) {
            hideImagePreview();
        }
    });

    // Remove image button
    document.getElementById('removeImageBtn').addEventListener('click', () => {
        uploadedImageBase64 = null;
        document.getElementById('itemImage').value = '';
        document.getElementById('itemImageUpload').value = '';
        hideImagePreview();
    });
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        event.target.value = '';
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB.');
        event.target.value = '';
        return;
    }

    // Read file as base64
    const reader = new FileReader();
    reader.onload = (e) => {
        uploadedImageBase64 = e.target.result;
        // Clear URL input if file is uploaded
        document.getElementById('itemImage').value = '';
        showImagePreview(uploadedImageBase64);
    };
    reader.onerror = () => {
        alert('Error reading image file.');
        event.target.value = '';
    };
    reader.readAsDataURL(file);
}

function showImagePreview(imageSrc) {
    const previewContainer = document.getElementById('imagePreviewContainer');
    const preview = document.getElementById('imagePreview');
    const removeBtn = document.getElementById('removeImageBtn');
    
    preview.src = imageSrc;
    previewContainer.style.display = 'block';
    removeBtn.style.display = 'inline-block';
    
    preview.onerror = () => {
        hideImagePreview();
    };
}

function hideImagePreview() {
    const previewContainer = document.getElementById('imagePreviewContainer');
    const removeBtn = document.getElementById('removeImageBtn');
    previewContainer.style.display = 'none';
    removeBtn.style.display = 'none';
}

function resetForm() {
    document.getElementById('itemForm').reset();
    document.getElementById('itemId').value = '';
    uploadedImageBase64 = null;
    hideImagePreview();
}

async function editItem(id) {
    const item = items.find(i => i.id === id);
    if (!item) return;

    editingItemId = id;
    uploadedImageBase64 = null;
    document.getElementById('modalTitle').textContent = 'Edit Item';
    document.getElementById('itemId').value = item.id;
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemCategory').value = item.category;
    document.getElementById('itemPrice').value = item.price;
    document.getElementById('itemDescription').value = item.description || '';
    document.getElementById('itemImage').value = item.image || '';
    document.getElementById('itemImageUpload').value = '';
    document.getElementById('itemStatus').value = item.status;

    // Check if image is base64 (uploaded) or URL
    if (item.image) {
        if (item.image.startsWith('data:image')) {
            // It's a base64 image
            uploadedImageBase64 = item.image;
            showImagePreview(item.image);
        } else {
            // It's a URL
            showImagePreview(item.image);
        }
    } else {
        hideImagePreview();
    }

    const modal = new bootstrap.Modal(document.getElementById('itemModal'));
    modal.show();
}

async function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) {
        return;
    }

    try {
        const success = await api.deleteItem(id);
        if (success) {
            alert('Item deleted successfully!');
            await loadItems();
        } else {
            alert('Error deleting item. Please try again.');
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        alert('Error deleting item. Please try again.');
    }
}

async function saveItem() {
    const form = document.getElementById('itemForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Determine which image source to use (uploaded file takes priority)
    let imageSource = '';
    if (uploadedImageBase64) {
        imageSource = uploadedImageBase64;
    } else {
        imageSource = document.getElementById('itemImage').value.trim();
    }

    const itemData = {
        name: document.getElementById('itemName').value.trim(),
        category: document.getElementById('itemCategory').value,
        price: parseFloat(document.getElementById('itemPrice').value),
        description: document.getElementById('itemDescription').value.trim(),
        image: imageSource,
        status: document.getElementById('itemStatus').value
    };

    try {
        let savedItem;
        if (editingItemId) {
            savedItem = await api.updateItem(editingItemId, itemData);
        } else {
            savedItem = await api.createItem(itemData);
        }

        if (savedItem) {
            alert(`Item ${editingItemId ? 'updated' : 'created'} successfully!`);
            const modal = bootstrap.Modal.getInstance(document.getElementById('itemModal'));
            modal.hide();
            uploadedImageBase64 = null;
            await loadItems();
        } else {
            alert('Error saving item. Please try again.');
        }
    } catch (error) {
        console.error('Error saving item:', error);
        alert('Error saving item. Please try again.');
    }
}

// Make functions globally available
window.editItem = editItem;
window.deleteItem = deleteItem;

