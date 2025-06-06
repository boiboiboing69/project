document.addEventListener('DOMContentLoaded', () => {
    const checkoutForm = document.getElementById('checkout-main-form'); // Assuming a main form wrapping all steps or handle individually
    const placeOrderButton = document.querySelector('.place-order-btn-updated'); // Use the updated class

    // Function to display order summary
    function displayOrderSummary() {
        const summaryContainer = document.querySelector('.order-summary-sticky'); // Or specific div for items
        if (!summaryContainer) return;

        const itemsContainer = summaryContainer.querySelector('#summary-items-container'); // Assuming you add this div
        if (!itemsContainer) { // Create one if not exists, or directly append to summaryContainer
            // For this example, let's clear and rebuild parts of summaryContainer if #summary-items-container isn't there.
            // This is a simplified approach. A more robust way is to have dedicated item containers.
            const existingItems = summaryContainer.querySelectorAll('.summary-item-detailed');
            existingItems.forEach(item => item.remove()); // Clear old items before re-rendering
        }


        const cart = getCartItems(); // From cart.js or common.js
        let subtotal = 0;

        if (cart.length === 0 && itemsContainer) {
            itemsContainer.innerHTML = '<p>Your cart is empty.</p>';
        } else if (cart.length === 0) {
             // If no itemsContainer, modify a different part of summary or show msg
            const summaryFirstItem = summaryContainer.querySelector('.summary-item-detailed');
            if (summaryFirstItem) summaryFirstItem.parentElement.innerHTML = '<p>Your cart is empty.</p>';
        }


        cart.forEach(item => {
            subtotal += item.price * item.quantity;
            const itemElement = document.createElement('div');
            itemElement.classList.add('summary-item-detailed');
            itemElement.innerHTML = `
                <img src="${item.image || 'https://via.placeholder.com/60x60'}" alt="${item.name}" class="summary-item-image">
                <div class="summary-item-info">
                    <p class="item-name">${item.name} (x${item.quantity})</p>
                    <p class="item-price">₹${(item.price * item.quantity).toLocaleString()}</p>
                </div>
                <button class="remove-item-btn" data-product-id="${item.id}" title="Remove item">×</button>
            `;
            // Prepend or append based on where summary-hr and other lines are
            // For simplicity, inserting before the first <hr> or before subtotal line
            const firstHr = summaryContainer.querySelector('.summary-hr');
            if (firstHr) {
                summaryContainer.insertBefore(itemElement, firstHr);
            } else { // Fallback if no hr
                summaryContainer.appendChild(itemElement); // Or a more specific target
            }

        });

        // Update totals in summary
        const shippingCost = cart.length > 0 ? 100 : 0; // Example shipping
        const taxRate = 0.05; // Example 5% tax
        const tax = subtotal * taxRate;
        const total = subtotal + shippingCost + tax;

        document.getElementById('summary-subtotal').textContent = `₹${subtotal.toLocaleString()}`;
        document.getElementById('summary-shipping').textContent = `₹${shippingCost.toLocaleString()}`;
        document.getElementById('summary-tax').textContent = `₹${tax.toLocaleString()}`;
        document.getElementById('summary-total').textContent = `₹${total.toLocaleString()}`;

        addRemoveButtonListeners();
    }

    function addRemoveButtonListeners() {
        const removeButtons = document.querySelectorAll('.remove-item-btn');
        removeButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.dataset.productId;
                if (typeof removeFromCart === "function") {
                    removeFromCart(productId); // from cart.js
                    displayOrderSummary(); // Re-render summary
                } else {
                    console.error("removeFromCart function not defined.");
                }
            });
        });
    }


    function validateField(field) {
        let isValid = true;
        let errorMessage = '';
        const inputElement = document.getElementById(field.id);
        const errorElement = document.getElementById(`${field.id}-error`);

        if (inputElement.type === 'checkbox' && field.required && !inputElement.checked) {
            isValid = false;
            errorMessage = field.message || 'This field is required.';
        } else if (field.required && !inputElement.value.trim()) {
            isValid = false;
            errorMessage = field.message || 'This field is required.';
        } else if (field.pattern && !field.pattern.test(inputElement.value.trim())) {
            isValid = false;
            errorMessage = field.message || 'Invalid format.';
        }

        if (!isValid) {
            inputElement.classList.add('invalid-field');
            if (errorElement) {
                errorElement.textContent = errorMessage;
                errorElement.style.display = 'block';
            }
        } else {
            inputElement.classList.remove('invalid-field');
            if (errorElement) {
                errorElement.textContent = '';
                errorElement.style.display = 'none';
            }
        }
        return isValid;
    }

    function validateForm() {
        let isFormValid = true;
        const fieldsToValidate = [
            { id: 'email', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address.' },
            { id: 'phone', required: true, pattern: /^\+?[0-9\s-]{10,}$/, message: 'Enter a valid phone number.' },
            { id: 'fname', required: true, message: 'First name is required.' },
            { id: 'lname', required: true, message: 'Last name is required.' },
            { id: 'address', required: true, message: 'Address is required.' },
            { id: 'city', required: true, message: 'City is required.' },
            { id: 'state', required: true, message: 'State is required.' },
            { id: 'zip', required: true, pattern: /^[0-9]{5,6}$/, message: 'Enter a valid zip code.' },
            { id: 'cardholder-name', required: true, message: 'Cardholder name is required.' },
            { id: 'card-number', required: true, pattern: /^[0-9\s]{13,19}$/, message: 'Enter a valid card number.' }, // Basic pattern
            { id: 'expiry-date', required: true, pattern: /^(0[1-9]|1[0-2])\/?([0-9]{2})$/, message: 'Enter MM/YY format.' },
            { id: 'cvv', required: true, pattern: /^[0-9]{3,4}$/, message: 'Enter a valid CVV.' },
        ];

        fieldsToValidate.forEach(field => {
            // Ensure error message divs exist for each field (HTML should have them)
            // e.g., <div id="email-error" class="error-message"></div>
            if (!validateField(field)) {
                isFormValid = false;
            }
        });

        return isFormValid;
    }

    if (placeOrderButton) {
        placeOrderButton.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default form submission
            if (validateForm()) {
                // Simulate order placement
                console.log('Order placed successfully (simulated).');
                alert('Thank you for your order! (Simulated)');
                // Clear cart (optional, from cart.js)
                if(typeof clearCart === "function") clearCart();
                // Redirect to a thank you page or homepage
                window.location.href = 'index.html';
            } else {
                console.log('Checkout form validation failed.');
                // General error message if needed, though individual field errors are now shown
                const generalError = document.getElementById('checkout-general-error');
                if(generalError) {
                    generalError.textContent = 'Please correct the errors highlighted below.';
                    generalError.style.display = 'block';
                }
            }
        });
    }

    // Initial display of order summary
    if (typeof getCartItems === "function") {
         displayOrderSummary();
    } else {
        console.error("getCartItems function not available. Checkout summary may not load.");
    }

});
