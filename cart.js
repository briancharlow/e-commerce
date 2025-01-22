document.addEventListener('DOMContentLoaded', () => {
    const messageDiv = document.getElementById('Message'); // Ensure this div exists in your HTML

    function displayMessage(message, type = 'success') {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`; // Apply type as a class (e.g., "success" or "error")
        messageDiv.style.opacity = '1'; // Ensure visibility
        messageDiv.style.display = 'block';

        // Clear existing timeout if another message is displayed
        if (messageDiv.hideTimeout) {
            clearTimeout(messageDiv.hideTimeout);
        }

        // Hide the message after 5 seconds
        messageDiv.hideTimeout = setTimeout(() => {
            messageDiv.style.opacity = '0'; // Smooth fade-out
            setTimeout(() => {
                messageDiv.style.display = 'none'; // Hide after fade-out
            }, 5000);
        }, 10000); // Show for 5 seconds
    }

    const logoutIcon = document.getElementById('exit');
    logoutIcon.addEventListener('click', () => {
        function logout() {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));

            if (currentUser?.id) {
                fetch(`http://localhost:3000/users/${currentUser.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionToken: null }),
                }).catch((error) => console.error('Error clearing session:', error));
            }

            localStorage.removeItem('sessionToken');
            localStorage.removeItem('currentUser');
            window.location.href = '/';
        }
        logout();
    });

    const cartItemsDiv = document.getElementById('cartItems');
    const totalAmountSpan = document.getElementById('totalAmount');
    const checkoutButton = document.getElementById('checkoutButton');

    async function fetchCart() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        if (!currentUser) {
            displayMessage('Please log in to view your cart.', 'error');
            window.location.href = '/';
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/cart');
            const carts = await response.json();
            const userCart = carts.find(
                (cart) => cart.userId === currentUser.id && cart.isCheckedOut === 0
            );

            if (userCart) {
                displayCartItems(userCart.products);
            } else {
                cartItemsDiv.innerHTML = '<p>Your cart is empty.</p>';
                totalAmountSpan.textContent = '0';
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
            displayMessage('Failed to load cart. Please try again later.', 'error');
        }
    }

    function displayCartItems(products) {
        cartItemsDiv.innerHTML = ''; // Clear existing content
        let totalAmount = 0;

        products.forEach((product) => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('cart-item');
            itemDiv.innerHTML = `
                <img src="${product.image}" alt="">
                <div class="item-details">
                    <h3>${product.productTitle}</h3>
                    <p>Price: $${product.price}</p>
                    <button class="removeButton" data-id="${product.productId}">Remove</button>
                </div>
            `;
            cartItemsDiv.appendChild(itemDiv);

            totalAmount += product.price * product.quantity; // Calculate total amount
        });

        totalAmountSpan.textContent = totalAmount.toFixed(2);

        const removeButtons = document.querySelectorAll('.removeButton');
        removeButtons.forEach((button) => {
            button.addEventListener('click', (event) => {
                const productId = event.currentTarget.dataset.id;
                removeFromCart(productId);
            });
        });
    }

    async function removeFromCart(productId) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        try {
            const response = await fetch('http://localhost:3000/cart');
            const carts = await response.json();
            const userCart = carts.find(
                (cart) => cart.userId === currentUser.id && cart.isCheckedOut === 0
            );

            if (userCart) {
                userCart.products = userCart.products.filter(
                    (product) => product.productId !== productId
                );
                await fetch(`http://localhost:3000/cart/${userCart.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ products: userCart.products }),
                });

                displayMessage('Item removed from your cart.', 'success');
                displayCartItems(userCart.products); // Refresh the displayed items
            }
        } catch (error) {
            console.error('Error removing item from cart:', error);
            displayMessage('An error occurred while removing the item from your cart.', 'error');
        }
    }

    async function checkout() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        try {
            const response = await fetch('http://localhost:3000/cart');
            const carts = await response.json();
            const userCart = carts.find(
                (cart) => cart.userId === currentUser.id && cart.isCheckedOut === 0
            );

            if (userCart) {
                const purchasedProducts = [...userCart.products];

                userCart.isCheckedOut = 1;

                await fetch(`http://localhost:3000/cart/${userCart.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        isCheckedOut: userCart.isCheckedOut,
                        products: [],
                    }),
                });

                displayMessage('Thank you for your purchase!', 'success');
                window.location.href = 'artifacts.html';
            }
        } catch (error) {
            console.error('Error during checkout:', error);
            displayMessage('An error occurred during checkout.', 'error');
        }
    }

    checkoutButton.addEventListener('click', checkout);
    fetchCart();
});
