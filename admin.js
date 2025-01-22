document.addEventListener('DOMContentLoaded', () => {
    const productsTableBody = document.querySelector('#productsTable tbody');
    const productForm = document.getElementById('productForm');
    const messageDiv = document.getElementById('Message');
    const logoutIcon = document.getElementById('exit');

    // Display message function
    function displayMessage(message, type = 'success') {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`; // Apply the type as a class
        messageDiv.style.opacity = '1'; // Ensure it's fully visible
        messageDiv.style.display = 'block';

        setTimeout(() => {
            messageDiv.style.opacity = '0'; // Fade out smoothly
            setTimeout(() => {
                messageDiv.style.display = 'none'; // Hide after fade-out
            }, 500); // Wait for fade-out to complete (500ms)
        }, 5000); // Show message for 5 seconds
    }

    // Logout functionality
    logoutIcon.addEventListener('click', () => {
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('currentUser');

        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser?.id) {
            fetch(`http://localhost:3000/users/${currentUser.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionToken: null })
            }).catch(error => console.error('Error clearing session:', error));
        }

        window.location.href = 'index.html';
    });

    async function fetchProducts() {
        try {
            const response = await fetch('http://localhost:3000/products');
            const products = await response.json();
            displayProducts(products);
        } catch (error) {
            console.error('Error fetching products:', error);
            displayMessage('Error fetching products. Please try again later.', 'error');
        }
    }

    function displayProducts(products) {
        productsTableBody.innerHTML = '';
        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.title}</td>
                <td>${product.description}</td>
                <td>${product.artist}</td>
                <td><img src="${product.image}" alt="${product.title}" width="50"></td>
                <td>${product.price}</td>
                <td>
                    <button class="editBtn" data-id="${product.id}">Edit</button>
                    <button class="deleteBtn" data-id="${product.id}">Delete</button>
                </td>`;
            productsTableBody.appendChild(row);
        });
    }

    // Form submission handler
    productForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const productId = document.getElementById('productId').value;
        const title = document.getElementById('title').value.trim();
        const description = document.getElementById('description').value.trim();
        const artist = document.getElementById('artist').value.trim();
        const image = document.getElementById('image').value.trim();
        const price = document.getElementById('price').value.trim();

        let errors = [];

        // Validate form inputs
        if (!title) errors.push('Title is required.');
        if (!description) errors.push('Description is required.');
        if (!artist) errors.push('Artist name is required.');
        if (!image) errors.push('Image URL is required.');
        if (!price || isNaN(price) || parseFloat(price) <= 0) {
            errors.push('Price must be a positive number.');
        }

        // Display errors if any
        if (errors.length > 0) {
            displayMessage(errors.join(' '), 'error');
            return;
        }

        const productData = { title, description, artist, image, price: parseFloat(price) };

        try {
            if (productId) {
                await fetch(`http://localhost:3000/products/${productId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData)
                });
                displayMessage('Product updated successfully!', 'success');
            } else {
                await fetch('http://localhost:3000/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData)
                });
                displayMessage('Product added successfully!', 'success');
            }

            productForm.reset();
            await fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
            displayMessage('An error occurred while saving the product.', 'error');
        }
    });

    productsTableBody.addEventListener('click', async (event) => {
        if (event.target.classList.contains('editBtn')) {
            const productId = event.target.dataset.id;

            try {
                const response = await fetch(`http://localhost:3000/products/${productId}`);
                const product = await response.json();

                document.getElementById('productId').value = product.id;
                document.getElementById('title').value = product.title;
                document.getElementById('description').value = product.description;
                document.getElementById('artist').value = product.artist;
                document.getElementById('image').value = product.image;
                document.getElementById('price').value = product.price;

                window.scrollTo(0, 0);
            } catch (error) {
                console.error('Error fetching product:', error);
                displayMessage('Error fetching product details.', 'error');
            }
        }

        if (event.target.classList.contains('deleteBtn')) {
            const productId = event.target.dataset.id;

            if (confirm('Are you sure you want to delete this product?')) {
                try {
                    await fetch(`http://localhost:3000/products/${productId}`, { method: 'DELETE' });
                    displayMessage('Product deleted successfully!', 'success');
                    await fetchProducts();
                } catch (error) {
                    console.error('Error deleting product:', error);
                    displayMessage('An error occurred while deleting the product.', 'error');
                }
            }
        }
    });

    fetchProducts();
});
