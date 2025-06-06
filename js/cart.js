// js/cart.js

const CART_KEY = 'bluestone_cart';

// Function to get cart items from localStorage
function getCartItems() {
    const cartJson = localStorage.getItem(CART_KEY);
    return cartJson ? JSON.parse(cartJson) : [];
}

// Function to save cart items to localStorage
function saveCartItems(cartItems) {
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
    updateCartCount(); // Update count whenever cart is saved
}

// Function to update cart count in the navbar
function updateCartCount() {
    const cartItems = getCartItems();
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const cartIcon = document.querySelector('.cart-icon'); // Assuming a general cart icon selector
    // Attempt to find a specific count element, or update text content of cart-icon
    let cartCountElement = document.getElementById('cart-item-count-badge');

    if (cartIcon && !cartCountElement) { // If no specific badge, try to append/update within cart-icon
        cartCountElement = cartIcon.querySelector('.cart-count-badge-dynamic');
        if(!cartCountElement && totalQuantity > 0) {
            cartCountElement = document.createElement('span');
            cartCountElement.classList.add('cart-count-badge-dynamic'); // For styling
            cartIcon.appendChild(cartCountElement);
        } else if (!cartCountElement && totalQuantity === 0) {
            // No badge needed if no items and no static badge exists
        }
    }


    if (cartCountElement) {
        if (totalQuantity > 0) {
            cartCountElement.textContent = totalQuantity;
            cartCountElement.style.display = 'inline-block'; // Or your preferred display style
        } else {
            cartCountElement.style.display = 'none';
            // If it was dynamically created and is now empty, consider removing it
             if(cartCountElement.classList.contains('cart-count-badge-dynamic')) {
                cartCountElement.remove();
            }
        }
    } else if (cartIcon && totalQuantity > 0) { // Fallback: update cart icon text directly if no badge
        // This might interfere with an icon if text is not desired.
        // Example: cartIcon.textContent = `Cart (${totalQuantity})`;
        console.log(`Cart items: ${totalQuantity}`);
    } else if (cartIcon && totalQuantity === 0) {
        // Example: cartIcon.textContent = 'Cart';
         console.log('Cart is empty');
    }
}

// Function to add an item to the cart
function addToCart(productData) {
    if (!productData || !productData.id || !productData.name || !productData.price) {
        console.error('Invalid product data passed to addToCart:', productData);
        return;
    }

    const cartItems = getCartItems();
    const existingItemIndex = cartItems.findIndex(item => item.id === productData.id);

    if (existingItemIndex > -1) {
        // Item exists, update quantity (simple increment, could be more complex)
        cartItems[existingItemIndex].quantity += productData.quantity || 1;
    } else {
        // New item, add to cart
        cartItems.push({
            id: productData.id,
            name: productData.name,
            price: productData.price,
            image: productData.image || 'https://via.placeholder.com/60x60', // Default image
            quantity: productData.quantity || 1,
            size: productData.size, // Store selected options
            metal: productData.metal,
            // Add other options as needed
        });
    }
    saveCartItems(cartItems);
    console.log(`${productData.name} added to cart. Current cart:`, cartItems);
}

// Function to remove an item from the cart by product ID
function removeFromCart(productId) {
    let cartItems = getCartItems();
    cartItems = cartItems.filter(item => item.id !== productId);
    saveCartItems(cartItems);
    console.log(`Product ${productId} removed. Current cart:`, cartItems);
}

// Function to clear all items from the cart
function clearCart() {
    localStorage.removeItem(CART_KEY);
    updateCartCount(); // Update count to 0
    console.log('Cart cleared.');
}

// Initial cart count update on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
});
