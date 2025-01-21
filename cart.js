document.addEventListener('DOMContentLoaded', () => {
    requireAuth(); // Protect this route
    const cartItemsDiv = document.getElementById('cartItems');
    const totalAmountSpan = document.getElementById('totalAmount');
    const checkoutButton = document.getElementById('checkoutButton');

    
    async function fetchCart() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!currentUser) {
            alert("Please log in to view your cart.");
            window.location.href = '/'; 
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/cart');
            const carts = await response.json();

            console.log('carts:', carts);
            const userCart = carts.find(cart => cart.userId === currentUser.id && cart.isCheckedOut === 0);

            console.log('userCart:', userCart);

            if (userCart) {
                displayCartItems(userCart.products);
            } else {
                cartItemsDiv.innerHTML = '<p>Your cart is empty.</p>';
                totalAmountSpan.textContent = '0';
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
            cartItemsDiv.innerHTML = '<p>Failed to load cart. Please try again later.</p>';
        }
    }

    // Display items in the cart
    function displayCartItems(products) {
        cartItemsDiv.innerHTML = ''; // Clear existing content
        let totalAmount = 0;

        products.forEach(product => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('cart-item');
            itemDiv.innerHTML = `
                <img src="${product.image}" alt="">
                <h3>${product.productId}</h3> <!-- You may want to fetch product details using productId -->
                <p>Price: $${product.price}</p>
                <p>Quantity: ${product.quantity}</p>
                <button class="removeButton" data-id="${product.productId}">Remove</button>
            `;
            cartItemsDiv.appendChild(itemDiv);
            
            totalAmount += product.price * product.quantity; // Calculate total amount
        });

        totalAmountSpan.textContent = totalAmount.toFixed(2); // Update total amount display

        // Add event listeners for remove buttons
        const removeButtons = document.querySelectorAll('.removeButton');
        removeButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.currentTarget.dataset.id;
                removeFromCart(productId);
            });
        });
    }

    // Remove an item from the cart
    async function removeFromCart(productId) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        try {
            const response = await fetch('http://localhost:3000/cart');
            const carts = await response.json();
            const userCart = carts.find(cart => cart.userId === currentUser.id && cart.isCheckedOut === 0);

            if (userCart) {
                userCart.products = userCart.products.filter(product => product.productId !== productId); // Remove product

                // Update the cart on the server
                await fetch(`http://localhost:3000/cart/${userCart.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ products: userCart.products })
                });

                alert("Item removed from your cart.");
                displayCartItems(userCart.products); // Refresh the displayed items
            }
        } catch (error) {
            console.error('Error removing item from cart:', error);
            alert("An error occurred while removing the item from your cart.");
        }
    }

    // Checkout function
    async function checkout() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        try {
            const response = await fetch('http://localhost:3000/cart');
            const carts = await response.json();
            const userCart = carts.find(cart => cart.userId === currentUser.id && cart.isCheckedOut === 0);

            if (userCart) {
                userCart.isCheckedOut = 1; // Mark as checked out

                // Update the cart on the server
                await fetch(`http://localhost:3000/cart/${userCart.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isCheckedOut: userCart.isCheckedOut })
                });

                alert("Thank you for your purchase!");
                window.location.href = 'artifacts.html'; // Redirect to products page after checkout
            }
        } catch (error) {
            console.error('Error during checkout:', error);
            alert("An error occurred during checkout.");
        }
    }

    // Event listener for checkout button
    checkoutButton.addEventListener('click', checkout);

    // Fetch the user's active cart when the page loads
    fetchCart();
});
