

document.addEventListener('DOMContentLoaded', () => {
 

    const gallery = document.getElementById('gallery');
    const messageDiv = document.getElementById('Message'); // Add a div in HTML for messages
    const heroImage = document.getElementById('heroImage');
    const heroText = document.getElementById('heroText');

    const heroImages = [
        {
            src: "https://images.pexels.com/photos/1579708/pexels-photo-1579708.jpeg?auto=compress&cs=tinysrgb&w=600",
            text: "Art is not what you see, but what you make others see."
        },
        {
            src: "https://images.pexels.com/photos/1589279/pexels-photo-1589279.jpeg?auto=compress&cs=tinysrgb&w=600",
            text: "Every artist was first an amateur."
        },
        {
            src: "https://images.pexels.com/photos/2123337/pexels-photo-2123337.jpeg?auto=compress&cs=tinysrgb&w=600",
            text: "Creativity takes courage."
        },
        {
            src: "https://images.pexels.com/photos/2372978/pexels-photo-2372978.jpeg?auto=compress&cs=tinysrgb&w=600",
            text: "Art is the most beautiful of all lies."
        }
    ];

    let currentIndex = 0;

    // Function to display messages
    function displayMessage(message, type = 'error') {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`; // Apply type as a class
        messageDiv.style.opacity = '1'; // Ensure visible
        messageDiv.style.display = 'block';

        setTimeout(() => {
            messageDiv.style.opacity = '0'; // Fade out smoothly
            setTimeout(() => {
                messageDiv.style.display = 'none'; // Hide after fade-out
            }, 500);
        }, 5000); 
    }

    // Function to update hero image and text
    function updateHero() {
        heroImage.src = heroImages[currentIndex].src;
        heroText.textContent = heroImages[currentIndex].text;
    }

    // Carousel functionality
    function startCarousel() {
        updateHero();
        setInterval(() => {
            currentIndex = (currentIndex + 1) % heroImages.length; // Loop back
            updateHero();
        }, 10000);
    }

    // Fetch and display products
    async function fetchProducts() {
        try {
            const response = await fetch('http://localhost:3000/products');
            if (!response.ok) throw new Error('Network response was not ok');
            const products = await response.json();
            displayProducts(products);
        } catch (error) {
            console.error('Error fetching products:', error);
            gallery.innerHTML = '<p>Failed to load products. Please try again later.</p>';
        }
    }

    function displayProducts(products) {
        gallery.innerHTML = '';
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.title}">
                <h2>${product.title}</h2>
                <div>
                    <p>${product.description}</p>
                    <p class="price">$${product.price}</p>
                </div>
                <div class="cartContainer">
                    <p class="artist">~${product.artist}</p>
                    <a id="addCart" class="cart" data-id="${product.id}">
                        <ion-icon name="cart-outline"></ion-icon>
                    </a>
                </div>
            `;
            gallery.appendChild(productCard);
        });
        addCartEventListeners();
    }

    // Cart event listeners
    function addCartEventListeners() {
        const cartIcons = document.querySelectorAll('.cart');
        cartIcons.forEach(icon => {
            icon.addEventListener('click', (event) => {
                const productId = event.currentTarget.dataset.id;
                addToCart(productId);
            });
        });
    }

    async function addToCart(productId) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        if (!currentUser) {
            displayMessage("Please log in to add items to your cart.", 'error');
            return;
        }

        try {
            const cartResponse = await fetch('http://localhost:3000/cart');
            const carts = await cartResponse.json();
            let userCart = carts.find(cart => cart.userId === currentUser.id && cart.isCheckedOut === 0);

            const productResponse = await fetch(`http://localhost:3000/products/${productId}`);
            const productData = await productResponse.json();

            const newProduct = {
                productId: productId,
                productTitle: productData.title,
                quantity: 1,
                price: productData.price,
                image: productData.image
            };

            if (userCart) {
                const existingProduct = userCart.products.find(p => p.productId === productId);
                if (existingProduct) {
                    displayMessage("Item already exists in your cart.", 'error');
                } else {
                    userCart.products.push(newProduct);

                    await fetch(`http://localhost:3000/cart/${userCart.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ products: userCart.products })
                    });
                    await fetchCartCount();
                    displayMessage("Item added to your cart.", 'success');
                }
            } else {
                const newCart = {
                    userId: currentUser.id,
                    time: new Date().toISOString(),
                    isCheckedOut: 0,
                    products: [newProduct]
                };

                await fetch('http://localhost:3000/cart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newCart)
                });
                await fetchCartCount();
                displayMessage("New cart created, and item added.", 'success');
            }
        } catch (error) {
            console.error('Error adding item to cart:', error);
            displayMessage("An error occurred while adding the item to your cart.", 'error');
        }
    }

    async function fetchCartCount() {
        try {
            const response = await fetch('http://localhost:3000/cart');
            const carts = await response.json();
            const userCart = carts.find(cart => cart.userId === JSON.parse(localStorage.getItem('currentUser')).id && cart.isCheckedOut === 0);

            document.getElementById('cartCount').textContent = userCart
                ? userCart.products.reduce((total, product) => total + product.quantity, 0)
                : '0';
        } catch (error) {
            console.error('Error fetching cart count:', error);
            document.getElementById('cartCount').textContent = '0';
        }
    }

    function logout() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        if (currentUser?.id) {
            fetch(`http://localhost:3000/users/${currentUser.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionToken: null })
            }).catch(error => console.error('Error clearing session:', error));
        }

        localStorage.removeItem('sessionToken');
        localStorage.removeItem('currentUser');
        window.location.href = '/';
    }

    document.getElementById('exit').addEventListener('click', logout);

    startCarousel();
    fetchProducts();
    fetchCartCount();
});
