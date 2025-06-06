// js/cart-page.js
document.addEventListener('DOMContentLoaded', () => {
    const cartItemsList = document.getElementById('cart-items-list');
    const cartSubtotalEl = document.getElementById('cart-subtotal');
    const cartShippingEl = document.getElementById('cart-shipping');
    const cartGrandTotalEl = document.getElementById('cart-grand-total');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const proceedToCheckoutBtn = document.getElementById('proceed-to-checkout-btn');
    const cartPageSummaryDiv = document.getElementById('cart-page-summary');

    const SHIPPING_COST = 100.00; // Fixed shipping cost

    // Ensure common.js (formatCurrency) and cart.js (getCartItems, etc.) are loaded
    if (typeof formatCurrency !== 'function' || typeof getCartItems !== 'function') {
        console.error('Required functions from common.js or cart.js are not available.');
        if(cartItemsList) cartItemsList.innerHTML = "<p style='color:red; text-align:center;'>Error loading cart page. Dependencies missing.</p>";
        if(emptyCartMessage) emptyCartMessage.style.display = 'none';
        if(cartPageSummaryDiv) cartPageSummaryDiv.style.display = 'none';
        return;
    }

    function renderCartPage() {
        const cartItems = getCartItems();
        cartItemsList.innerHTML = '';

        if (cartItems.length === 0) {
            if (emptyCartMessage) emptyCartMessage.style.display = 'block';
            if (cartPageSummaryDiv) cartPageSummaryDiv.style.display = 'none';

            // Update totals for empty cart explicitly
            if (cartSubtotalEl) cartSubtotalEl.textContent = formatCurrency(0);
            if (cartShippingEl) cartShippingEl.textContent = formatCurrency(0);
            if (cartGrandTotalEl) cartGrandTotalEl.textContent = formatCurrency(0);
            return;
        }

        if (emptyCartMessage) emptyCartMessage.style.display = 'none';
        if (cartPageSummaryDiv) cartPageSummaryDiv.style.display = 'block';

        let currentSubtotal = 0;

        cartItems.forEach((item) => {
            // Generate a consistent key for the item based on its ID and options
            const itemKey = `${item.id}-${JSON.stringify(item.options || {})}`;

            let optionsString = '';
            if (item.options && typeof item.options === 'object' && Object.keys(item.options).length > 0) {
                optionsString = Object.entries(item.options)
                                    .filter(([key, value]) => value !== null && value !== undefined && value !== '') // Filter out empty options
                                    .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
                                    .join(', ');
            }

            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.dataset.itemKey = itemKey;

            itemElement.innerHTML = `
                <img src="${item.image || 'https://via.placeholder.com/100x100'}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h3 class="item-name">${item.name}</h3>
                    ${optionsString ? `<p class="item-options">${optionsString}</p>` : ''}
                    <p class="item-price-unit">Price: ${formatCurrency(item.price)}</p>
                </div>
                <div class="cart-item-quantity">
                    <label for="qty-${itemKey.replace(/\W/g, '_')}">Qty:</label> <!-- Sanitize itemKey for ID -->
                    <input type="number" id="qty-${itemKey.replace(/\W/g, '_')}" class="quantity-input" value="${item.quantity}" min="1" data-item-key="${itemKey}">
                </div>
                <div class="cart-item-subtotal">
                    <p>Item Total: <span class="item-subtotal-value">${formatCurrency(item.price * item.quantity)}</span></p>
                </div>
                <button class="btn-remove-item" data-item-key="${itemKey}" aria-label="Remove ${item.name}">&times; Remove</button>
            `;
            cartItemsList.appendChild(itemElement);
            currentSubtotal += item.price * item.quantity;
        });

        // Update totals
        const finalShippingCost = cartItems.length > 0 ? SHIPPING_COST : 0;
        if (cartSubtotalEl) cartSubtotalEl.textContent = formatCurrency(currentSubtotal);
        if (cartShippingEl) cartShippingEl.textContent = formatCurrency(finalShippingCost);
        if (cartGrandTotalEl) cartGrandTotalEl.textContent = formatCurrency(currentSubtotal + finalShippingCost);

        addCartItemEventListeners();
    }

    function addCartItemEventListeners() {
        document.querySelectorAll('.quantity-input').forEach(input => {
            // Remove old listener to prevent duplicates if re-rendering without full page reload
            input.replaceWith(input.cloneNode(true));
        });
        document.querySelectorAll('.quantity-input').forEach(input => {
             input.addEventListener('change', handleQuantityChange);
        });


        document.querySelectorAll('.btn-remove-item').forEach(button => {
             button.replaceWith(button.cloneNode(true));
        });
        document.querySelectorAll('.btn-remove-item').forEach(button => {
            button.addEventListener('click', handleItemRemoval);
        });
    }

    function handleQuantityChange(event) {
        const itemKey = event.target.dataset.itemKey;
        const newQuantity = parseInt(event.target.value);
        if (newQuantity >= 1) {
            // This function should now be in cart.js
            if (typeof updateCartQuantityByKey === "function") {
                updateCartQuantityByKey(itemKey, newQuantity);
                renderCartPage(); // Re-render the whole cart
            } else {
                console.error("updateCartQuantityByKey function not found in cart.js");
            }
        } else {
            event.target.value = 1; // Reset to 1 if invalid input (e.g., 0 or negative)
        }
    }

    function handleItemRemoval(event) {
        const itemKey = event.target.dataset.itemKey;
        // This function should now be in cart.js
        if (typeof removeFromCartByKey === "function") {
            removeFromCartByKey(itemKey);
            renderCartPage(); // Re-render the whole cart
        } else {
            console.error("removeFromCartByKey function not found in cart.js");
        }
    }

    if (proceedToCheckoutBtn) {
        proceedToCheckoutBtn.addEventListener('click', () => {
            if (getCartItems().length > 0) {
                window.location.href = 'checkout.html';
            } else {
                alert("Your cart is empty. Please add items before proceeding to checkout.");
            }
        });
    }

    // Initial render
    renderCartPage();
});
