import { requireAuth } from './auth-utils.js';

document.addEventListener('DOMContentLoaded', () => {
    requireAuth();

    const gallery = document.getElementById('gallery');

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

    // Function to update hero image and text
    function updateHero() {
        heroImage.src = heroImages[currentIndex].src;
        heroText.textContent = heroImages[currentIndex].text;
    }

    // Function to change image every 5 seconds
    function startCarousel() {
        updateHero();
        setInterval(() => {
            currentIndex = (currentIndex + 1) % heroImages.length; // Loop back to the start
            updateHero();
        }, 10000); 
    }

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
                <p class="price"> $${product.price}</p>
                </div>
              
                 <div class="cartContainer">
                <p class="artist"> ~${product.artist}</p>
                <a id="addCart" class="cart" data-id="${product.id}">
                    <ion-icon name="cart-outline"></ion-icon>
                </a>
                 </div>
                
            `;
            gallery.appendChild(productCard);
        });
        addCartEventListeners();
    }

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
            alert("Please log in to add items to your cart.");
            return;
        }
    
        try {
            // Fetch all carts from the server
            const cartResponse = await fetch('http://localhost:3000/cart');
            const carts = await cartResponse.json();
    
            // Find the user's active cart (where isCheckedOut is 0)
            let userCart = carts.find(cart => cart.userId === currentUser.id && cart.isCheckedOut === 0);
    
            // Fetch product details
            const productResponse = await fetch(`http://localhost:3000/products/${productId}`);
            const productData = await productResponse.json();
    
            // Prepare the product to be added
            const newProduct = {
                productId: productId,
                quantity: 1,
                price: productData.price,
                image: productData.image
            };
    
            if (userCart) {
                // Check if the product is already in the cart
                const existingProduct = userCart.products.find(p => p.productId === productId);
                if (existingProduct) {
                    alert("Item already exists in your cart. Please choose other items to add.");
            
                } else {
                   
                    userCart.products.push(newProduct);
                }
    
                
                await fetch(`http://localhost:3000/cart/${userCart.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ products: userCart.products })
                });
    
                alert("Item added to your existing cart!");
            } else {
                // If no active cart exists, create a new one
                const newCart = {
                    id: Date.now().toString(), // Generate a unique ID for the new cart
                    userId: currentUser.id,
                    time: new Date().toISOString(),
                    isCheckedOut: 0,
                    products: [newProduct]
                };
    
                // Save the new cart to the server
                await fetch('http://localhost:3000/cart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newCart)
                });
    
                alert("A new cart has been created, and the item has been added!");
            }
        } catch (error) {
            console.error('Error adding item to cart:', error);
            alert("An error occurred while adding the item to your cart.");
        }
    }
    
    

    const logoutBtn = document.getElementById('exit');

    logoutBtn.addEventListener('click', logout);
    function logout() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (currentUser?.id) {
            // Clear session token in JSON Server
            fetch(`http://localhost:3000/users/${currentUser.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sessionToken: null })
            }).catch(error => console.error('Error clearing session:', error));
        }
    
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('currentUser');
        window.location.href = '/';
    }
    


    startCarousel()
   
   
    fetchProducts();
});
