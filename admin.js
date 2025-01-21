document.addEventListener('DOMContentLoaded', () => {
    const productsTableBody = document.querySelector('#productsTable tbody');
    const productForm = document.getElementById('productForm');
    

    const logoutIcon = document.getElementById('exit');

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

    // Handle form submission for adding/updating products
    productForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const productId = document.getElementById('productId').value;
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const artist = document.getElementById('artist').value;
        const image = document.getElementById('image').value;
        const price = parseFloat(document.getElementById('price').value);

        const productData = { title, description, artist, image, price };

        try {
            if (productId) {
                // Update existing product
                await fetch(`http://localhost:3000/products/${productId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData)
                });
                alert('Product updated successfully!');
            } else {
                // Add new product
                await fetch('http://localhost:3000/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData)
                });
                alert('Product added successfully!');
            }
            
            // Reset form and refresh product list
            productForm.reset();
            await fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
            alert('An error occurred while saving the product.');
        }
    });

    // Edit button click event
    productsTableBody.addEventListener('click', async (event) => {
        if (event.target.classList.contains('editBtn')) {
            const productId = event.target.dataset.id;
            
            try {
                const response = await fetch(`http://localhost:3000/products/${productId}`);
                const product = await response.json();

                // Populate form with product data
                document.getElementById('productId').value = product.id;
                document.getElementById('title').value = product.title;
                document.getElementById('description').value = product.description;
                document.getElementById('artist').value = product.artist;
                document.getElementById('image').value = product.image;
                document.getElementById('price').value = product.price;
                
                window.scrollTo(0, 0); // Scroll to top to show form
            } catch (error) {
                console.error('Error fetching product:', error);
            }
        }

        if (event.target.classList.contains('deleteBtn')) {
            const productId = event.target.dataset.id;

            if (confirm("Are you sure you want to delete this product?")) {
                try {
                    await fetch(`http://localhost:3000/products/${productId}`, { method: 'DELETE' });
                    alert('Product deleted successfully!');
                    await fetchProducts(); // Refresh the list after deletion
                } catch (error) {
                    console.error('Error deleting product:', error);
                    alert('An error occurred while deleting the product.');
                }
            }
        }
    });

    // Initial fetch of products when the page loads
    fetchProducts();
});
