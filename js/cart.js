// js/cart.js

const CART_KEY = 'bluestone_cart';

// Function to get cart items from localStorage
function getCartItems() {
    const cartJson = localStorage.getItem(CART_KEY);
    return cartJson ? JSON.parse(cartJson) : [];
}

// Function to save cart items to localStorage
function saveCartItems(cartItems) { // Renamed from saveCart to saveCartItems for clarity
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
    updateCartCount(); // Update count whenever cart is saved
}

// Function to update cart count in the navbar
function updateCartCount() {
    const cartItems = getCartItems();
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const cartIconLink = document.querySelector('.cart-icon a'); // Target the link within .cart-icon
    let cartCountBadge = cartIconLink ? cartIconLink.querySelector('.cart-count-badge-dynamic') : null;

    if (cartIconLink && !cartCountBadge && totalQuantity > 0) {
        cartCountBadge = document.createElement('span');
        cartCountBadge.classList.add('cart-count-badge-dynamic');
        cartIconLink.appendChild(cartCountBadge); // Append badge to the link
    }

    if (cartCountBadge) {
        if (totalQuantity > 0) {
            cartCountBadge.textContent = totalQuantity;
            cartCountBadge.style.display = 'inline-block';
        } else {
            cartCountBadge.style.display = 'none';
            if (cartCountBadge.classList.contains('cart-count-badge-dynamic')) {
                 // Optionally remove if it was dynamically created and is now zero,
                 // or just keep it hidden. Hiding is simpler.
            }
        }
    }
    // console.log(`Cart count updated: ${totalQuantity}`);
}

// Helper to compare options objects (case-insensitive for values, if needed)
function compareOptions(options1, options2) {
    if (!options1 && !options2) return true;
    if (!options1 || !options2) return false;

    const keys1 = Object.keys(options1).sort();
    const keys2 = Object.keys(options2).sort();

    if (keys1.length !== keys2.length) return false;

    for (let i = 0; i < keys1.length; i++) {
        const key = keys1[i];
        if (keys2[i] !== key || String(options1[key]).toLowerCase() !== String(options2[key]).toLowerCase()) {
            return false;
        }
    }
    return true;
}

// Function to add an item to the cart
function addToCart(productData) {
    if (!productData || !productData.id || !productData.name || typeof productData.price !== 'number') {
        console.error('Invalid product data passed to addToCart:', productData);
        alert('Error: Could not add item to cart due to invalid product data.');
        return;
    }

    const cartItems = getCartItems();
    const productOptions = productData.options || {};
    const existingItemIndex = cartItems.findIndex(item =>
        item.id === productData.id &&
        compareOptions(item.options || {}, productOptions)
    );

    if (existingItemIndex > -1) {
        cartItems[existingItemIndex].quantity += productData.quantity || 1;
    } else {
        cartItems.push({
            id: productData.id,
            name: productData.name,
            price: productData.price,
            image: productData.image || 'https://via.placeholder.com/60x60',
            quantity: productData.quantity || 1,
            options: productOptions,
        });
    }
    saveCartItems(cartItems);
    // console.log(`${productData.name} (Options: ${JSON.stringify(productOptions)}) added/updated in cart.`);
}

// Helper to parse itemKey from cart-page.js
function parseItemKey(itemKey) {
    try {
        const parts = itemKey.split(/-(.+)/); // Split on the first hyphen only
        const id = parts[0];
        const options = parts[1] ? JSON.parse(parts[1]) : {};
        return { id, options };
    } catch (e) {
        console.error("Error parsing itemKey:", itemKey, e);
        return null;
    }
}

// Function to update quantity of an item identified by itemKey
function updateCartQuantityByKey(itemKey, newQuantity) {
    const parsedKey = parseItemKey(itemKey);
    if (!parsedKey) return false;

    const { id, options } = parsedKey;
    const cartItems = getCartItems();
    const itemIndex = cartItems.findIndex(item => item.id === id && compareOptions(item.options || {}, options));

    if (itemIndex !== -1 && newQuantity >= 1) {
        cartItems[itemIndex].quantity = newQuantity;
        saveCartItems(cartItems);
        // console.log(`Quantity updated for itemKey ${itemKey}. New quantity: ${newQuantity}`);
        return true;
    } else if (itemIndex !== -1 && newQuantity <= 0) { // If quantity is 0 or less, remove item
        return removeFromCartByKey(itemKey);
    }
    // console.warn(`Item not found for update or invalid quantity for itemKey ${itemKey}`);
    return false;
}

// Function to remove an item identified by itemKey
function removeFromCartByKey(itemKey) {
    const parsedKey = parseItemKey(itemKey);
    if (!parsedKey) return false;

    const { id, options } = parsedKey;
    let cartItems = getCartItems();
    const initialLength = cartItems.length;
    cartItems = cartItems.filter(item => !(item.id === id && compareOptions(item.options || {}, options)));

    if (cartItems.length < initialLength) {
        saveCartItems(cartItems);
        // console.log(`Item removed for itemKey ${itemKey}.`);
        return true;
    }
    // console.warn(`Item not found for removal with itemKey ${itemKey}`);
    return false;
}


// Function to clear all items from the cart
function clearCart() {
    localStorage.removeItem(CART_KEY);
    updateCartCount();
    console.log('Cart cleared.');
    if (window.location.pathname.includes('cart.html') && typeof renderCartPage === 'function') {
        renderCartPage(); // If on cart page, re-render it
    } else if (window.location.pathname.includes('checkout.html') && typeof displayOrderSummary === 'function') {
        displayOrderSummary(); // If on checkout page, re-render summary
    }
}

// Initial cart count update on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
});
