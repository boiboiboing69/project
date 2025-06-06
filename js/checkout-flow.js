// js/checkout-flow.js
document.addEventListener('DOMContentLoaded', async () => {
    const phases = document.querySelectorAll('.checkout-phase');
    const stepIndicators = document.querySelectorAll('.step-indicator');
    const nextPhaseButtons = document.querySelectorAll('.btn-next-phase');
    const prevPhaseButtons = document.querySelectorAll('.btn-prev-phase');

    if (typeof formatCurrency !== 'function' || typeof getCartItems !== 'function' || typeof clearCart !== 'function' || typeof fetchProducts !== 'function' || typeof calculateItemPrice !== 'function' || typeof showGlobalToast !== 'function') {
        console.error('Required functions from common.js or cart.js are not available for Checkout Flow.');
        const flowContainer = document.querySelector('.checkout-flow-container');
        if (flowContainer) {
            flowContainer.innerHTML = '<p style="color:red; text-align:center;">Error loading checkout. Required resources missing.</p>';
        }
        return;
    }

    let currentPhase = 'userInfo';
    let allProducts = [];
    let checkoutCart = [];

    try {
        allProducts = await fetchProducts();
    } catch (error) {
        console.error("Failed to fetch all products for checkout flow:", error);
        showGlobalToast("Error loading product data. Please try refreshing.", 4000);
    }

    function updatePhaseView() {
        phases.forEach(phase => {
            phase.style.display = (phase.id === `phase-${currentPhase}`) ? 'block' : 'none';
        });
        let phaseReached = false;
        stepIndicators.forEach(indicator => {
            indicator.classList.remove('active', 'completed');
            if (indicator.dataset.phase === currentPhase) {
                indicator.classList.add('active');
                phaseReached = true;
            } else if (!phaseReached) {
                indicator.classList.add('completed');
            }
        });
        window.scrollTo(0,0);
    }

    nextPhaseButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (validateCurrentPhase(currentPhase)) {
                const nextPhase = button.dataset.nextPhase;
                if(document.getElementById(`phase-${nextPhase}`)){
                    currentPhase = nextPhase;
                    if (currentPhase === 'designFinalization') loadDesignFinalizationPhase();
                    else if (currentPhase === 'pricingReview') loadPricingReviewPhase();
                    else if (currentPhase === 'payment') loadPaymentPhase(); // Prepare for payment
                    updatePhaseView();
                } else {
                    console.error(`Next phase section with ID 'phase-${nextPhase}' not found!`);
                }
            }
        });
    });

    prevPhaseButtons.forEach(button => {
        button.addEventListener('click', () => {
            const prevPhase = button.dataset.prevPhase;
             if(document.getElementById(`phase-${prevPhase}`)){
                currentPhase = prevPhase;
                if (currentPhase === 'designFinalization') loadDesignFinalizationPhase();
                updatePhaseView();
            } else {
                console.error(`Previous phase section with ID 'phase-${prevPhase}' not found!`);
            }
        });
    });

    function validateCurrentPhase(phaseId) {
        if (phaseId === 'userInfo') {
            let isValid = true;
            const fieldsToValidate = [
                { id: 'email', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email.' },
                { id: 'phone', required: true, pattern: /^\+?[0-9\s-]{10,}$/, message: 'Enter a valid phone.' },
                { id: 'fname', required: true, message: 'First name is required.' },
                { id: 'lname', required: true, message: 'Last name is required.' },
                { id: 'address', required: true, message: 'Address is required.' },
                { id: 'city', required: true, message: 'City is required.' },
                { id: 'state', required: true, message: 'State is required.' },
                { id: 'zip', required: true, pattern: /^[0-9]{5,6}$/, message: 'Enter a valid zip code.' },
            ];
            fieldsToValidate.forEach(field => { /* ... (validation logic as before) ... */
                const inputElement = document.getElementById(field.id);
                const errorElement = document.getElementById(`${field.id}-error`);
                let fieldValid = true;
                let errorMessage = '';
                if(!inputElement) { // If field doesn't exist, skip (e.g. billing fields if same as shipping)
                    return;
                }
                if (inputElement.type === 'checkbox' && field.required && !inputElement.checked) {
                    fieldValid = false; errorMessage = field.message;
                } else if (field.required && !inputElement.value.trim()) {
                    fieldValid = false; errorMessage = field.message;
                } else if (field.pattern && inputElement.value.trim() && !field.pattern.test(inputElement.value.trim())) {
                    fieldValid = false; errorMessage = field.message;
                }
                if (!fieldValid) {
                    inputElement.classList.add('invalid-field');
                    if (errorElement) { errorElement.textContent = errorMessage; errorElement.style.display = 'block';}
                    isValid = false;
                } else {
                    inputElement.classList.remove('invalid-field');
                    if (errorElement) { errorElement.textContent = ''; errorElement.style.display = 'none';}
                }
            });
            if (!isValid) showGlobalToast('Please correct the highlighted errors.', 3000);
            return isValid;
        }
        if (phaseId === 'payment') { // Basic validation for payment phase
            let isValid = true;
            const paymentFields = [
                { id: 'checkout-cardholder-name', required: true, message: "Cardholder name is required." },
                { id: 'checkout-card-number', required: true, pattern: /^[0-9\s]{13,19}$/, message: "Valid card number required." },
                { id: 'checkout-expiry-date', required: true, pattern: /^(0[1-9]|1[0-2])\/?([0-9]{2})$/, message: "MM/YY format." },
                { id: 'checkout-cvv', required: true, pattern: /^[0-9]{3,4}$/, message: "Valid CVV required." }
            ];
            paymentFields.forEach(field => { /* ... (similar validation logic) ... */
                const inputElement = document.getElementById(field.id);
                const errorElement = document.getElementById(`${field.id}-error`);
                let fieldValid = true;
                let errorMessage = '';
                 if (field.required && !inputElement.value.trim()) {
                    fieldValid = false; errorMessage = field.message;
                } else if (field.pattern && inputElement.value.trim() && !field.pattern.test(inputElement.value.trim())) {
                    fieldValid = false; errorMessage = field.message;
                }
                if (!fieldValid) {
                    inputElement.classList.add('invalid-field');
                    if (errorElement) { errorElement.textContent = errorMessage; errorElement.style.display = 'block';}
                    isValid = false;
                } else {
                    inputElement.classList.remove('invalid-field');
                    if (errorElement) { errorElement.textContent = ''; errorElement.style.display = 'none';}
                }
            });
             if (!isValid) showGlobalToast('Please correct payment errors.', 3000);
            return isValid;
        }
        return true;
    }

    function getProductDefinition(productId) {
        return allProducts.find(p => p.id === productId);
    }

    function loadDesignFinalizationPhase() {
        const itemsListContainer = document.getElementById('checkout-design-items-list');
        if (!itemsListContainer) return;

        checkoutCart = JSON.parse(JSON.stringify(getCartItems()));

        if (checkoutCart.length === 0) {
            itemsListContainer.innerHTML = '<p>Your cart is empty. Please <a href="shop.html" class="link-styled">add items</a> to your cart first.</p>';
            const continueButton = document.querySelector('#phase-designFinalization .btn-next-phase');
            if (continueButton) continueButton.disabled = true;
            return;
        } else {
             const continueButton = document.querySelector('#phase-designFinalization .btn-next-phase');
            if (continueButton) continueButton.disabled = false;
        }

        itemsListContainer.innerHTML = '<h3>Review and Finalize Your Items:</h3>';

        checkoutCart.forEach((item, index) => {
            const productDef = getProductDefinition(item.id);
            if (!productDef) {
                console.warn(`Product definition not found for cart item ID: ${item.id}`);
                const errorItemDisplay = `<div class="checkout-design-item"><h4>${item.name} (Details Unavailable)</h4><p>Price: ${formatCurrency(item.price * item.quantity)} (Qty: ${item.quantity})</p></div>`;
                itemsListContainer.innerHTML += errorItemDisplay;
                return;
            }

            let optionsString = '';
            if (item.options && typeof item.options === 'object' && Object.keys(item.options).length > 0) {
                optionsString = Object.entries(item.options)
                    .filter(([, value]) => value)
                    .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
                    .join(', ');
            }

            const itemElement = document.createElement('div');
            itemElement.classList.add('checkout-design-item');
            itemElement.dataset.itemIndex = index;

            let customizationControlsHTML = '<small><em>Item options are final.</em></small>'; // Default
            // Check if product definition has attributes that could be customized
            if (productDef.attributes && (productDef.attributes.metals || productDef.attributes.stones || productDef.attributes.styles || productDef.attributes.sizes)) {
                customizationControlsHTML = ''; // Clear default if options exist

                const createSelect = (attrType, attributeList) => {
                    if (!attributeList || attributeList.length === 0) return '';
                    let selectHTML = `<div class="form-group"><label for="checkout-${attrType}-${index}">${attrType.charAt(0).toUpperCase() + attrType.slice(1)}:</label><select id="checkout-${attrType}-${index}" class="checkout-option-select" data-option-type="${attrType}">`;
                    attributeList.forEach(opt => {
                        const optValue = typeof opt === 'object' ? opt.name : opt; // If attributes are objects with name/modifier
                        const normalizedOptValue = String(optValue).toLowerCase().replace(/[()\s]/g, '_');
                        const currentItemOptValue = item.options && item.options[attrType] ? String(item.options[attrType]).toLowerCase().replace(/[()\s]/g, '_') : null;

                        selectHTML += `<option value="${normalizedOptValue}" ${currentItemOptValue === normalizedOptValue ? 'selected' : ''}>${optValue}</option>`;
                    });
                    selectHTML += `</select></div>`;
                    return selectHTML;
                };

                customizationControlsHTML += createSelect('metal', productDef.attributes.metals);
                customizationControlsHTML += createSelect('stone', productDef.attributes.stones);
                customizationControlsHTML += createSelect('style', productDef.attributes.styles);
                customizationControlsHTML += createSelect('size', productDef.attributes.sizes);
                 if(customizationControlsHTML === '') customizationControlsHTML = '<small><em>No specific variants available for this item in checkout.</em></small>';
            }


            itemElement.innerHTML = `
                <img src="${item.image || 'https://via.placeholder.com/80x80'}" alt="${item.name}" class="checkout-item-image">
                <div class="checkout-item-details">
                    <h4>${item.name}</h4>
                    ${optionsString ? `<p class="item-current-options" id="options-display-${index}">Current: ${optionsString}</p>` : `<p class="item-current-options" id="options-display-${index}"></p>`}
                    <p id="price-display-${index}">Price: ${formatCurrency(item.price * item.quantity)} (Qty: ${item.quantity})</p>
                    <div class="in-checkout-customization-controls" data-product-id="${item.id}">
                        ${customizationControlsHTML}
                    </div>
                </div>`;
            itemsListContainer.appendChild(itemElement);
        });

        document.querySelectorAll('.checkout-option-select').forEach(select => {
            select.addEventListener('change', handleCheckoutOptionChange);
        });
    }

    function handleCheckoutOptionChange(event) {
        const selectElement = event.target;
        const itemElement = selectElement.closest('.checkout-design-item');
        const itemIndex = parseInt(itemElement.dataset.itemIndex);
        const optionType = selectElement.dataset.optionType;
        const selectedNormalizedValue = selectElement.value; // Normalized value e.g. "gold_18k"
        const selectedDisplayText = selectElement.options[selectElement.selectedIndex].text;

        if (checkoutCart[itemIndex]) {
            const productDef = getProductDefinition(checkoutCart[itemIndex].id);
            if (!productDef) return;

            checkoutCart[itemIndex].options = checkoutCart[itemIndex].options || {};
            checkoutCart[itemIndex].options[optionType] = selectedDisplayText; // Store display text for options summary

            // For price calculation, we need to pass the normalized values that match modifier keys
            const priceCalculationOptions = { ...checkoutCart[itemIndex].options }; // Clone
            // Ensure the option used for price calculation is the normalized key
            Object.keys(priceCalculationOptions).forEach(key => {
                if (key === optionType) priceCalculationOptions[key] = selectedNormalizedValue;
                else if (priceCalculationOptions[key]) { // Normalize other existing options for calculation
                    priceCalculationOptions[key] = String(priceCalculationOptions[key]).toLowerCase().replace(/[()\s]/g, '_');
                }
            });

            const newUnitPrice = calculateItemPrice(productDef.basePrice, priceCalculationOptions, productDef.attributes);
            checkoutCart[itemIndex].price = newUnitPrice;

            const priceDisplay = document.getElementById(`price-display-${itemIndex}`);
            if (priceDisplay) {
                priceDisplay.textContent = `Price: ${formatCurrency(newUnitPrice * checkoutCart[itemIndex].quantity)} (Qty: ${checkoutCart[itemIndex].quantity})`;
            }
            const optionsDisplay = document.getElementById(`options-display-${itemIndex}`);
            if (optionsDisplay) {
                 let updatedOptionsString = Object.entries(checkoutCart[itemIndex].options)
                    .filter(([, value]) => value)
                    .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
                    .join(', ');
                optionsDisplay.textContent = updatedOptionsString ? `Current Selections: ${updatedOptionsString}` : 'Standard';
            }
            console.log("Updated checkoutCart item:", checkoutCart[itemIndex]);
        }
    }

    function loadPricingReviewPhase() {
        const summaryContainer = document.getElementById('checkout-pricing-summary');
        const finalCartItemsDisplay = document.getElementById('final-cart-items-display');
        const discountLine = document.getElementById('discount-line');
        const discountNameEl = document.getElementById('discount-name');
        const discountAmountEl = document.getElementById('discount-amount');
        const finalSubtotalEl = document.getElementById('final-subtotal');
        const finalShippingEl = document.getElementById('final-shipping');
        const finalGrandTotalEl = document.getElementById('final-grand-total');
        const appliedOffersEl = document.getElementById('applied-offers');


        if(!summaryContainer || !finalCartItemsDisplay || !discountLine || !discountAmountEl || !finalSubtotalEl || !finalShippingEl || !finalGrandTotalEl || !appliedOffersEl) {
            console.error("One or more pricing review elements not found.");
            return;
        }

        if (checkoutCart.length === 0) {
            finalCartItemsDisplay.innerHTML = '<p>Your cart is empty.</p>';
            // Hide or zero out other elements
            if (discountLine) discountLine.style.display = 'none';
            if (finalSubtotalEl) finalSubtotalEl.textContent = formatCurrency(0);
            if (finalShippingEl) finalShippingEl.textContent = formatCurrency(0);
            if (finalGrandTotalEl) finalGrandTotalEl.textContent = formatCurrency(0);
            if (appliedOffersEl) appliedOffersEl.textContent = "- None -";
            const continueButton = document.querySelector('#phase-pricingReview .btn-next-phase');
            if (continueButton) continueButton.disabled = true;
            return;
        } else {
            const continueButton = document.querySelector('#phase-pricingReview .btn-next-phase');
            if (continueButton) continueButton.disabled = false;
        }

        let subtotal = 0;
        finalCartItemsDisplay.innerHTML = ''; // Clear previous items
        checkoutCart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            let optionsStr = '';
            if(item.options && Object.keys(item.options).length > 0) {
                optionsStr = ` <small>(${Object.values(item.options).filter(v=>v).join(', ')})</small>`;
            }
            finalCartItemsDisplay.innerHTML += `<div class="summary-line"><p>${item.name}${optionsStr} x ${item.quantity}</p><p><span>${formatCurrency(itemTotal)}</span></p></div>`;
        });

        finalSubtotalEl.textContent = formatCurrency(subtotal);

        // Offer Simulation
        let discountAmount = 0;
        const offerCode = "WELCOME10";
        const offerThreshold = 50000;

        if (subtotal > offerThreshold) {
            discountAmount = subtotal * 0.10; // 10% discount
            if (discountLine) discountLine.style.display = 'flex'; // Assuming .summary-line is flex
            if (discountNameEl) discountNameEl.textContent = offerCode;
            if (discountAmountEl) discountAmountEl.textContent = formatCurrency(discountAmount);
            if (appliedOffersEl) appliedOffersEl.textContent = `Code ${offerCode} applied! You saved ${formatCurrency(discountAmount)}.`;
        } else {
            if (discountLine) discountLine.style.display = 'none';
            if (appliedOffersEl) appliedOffersEl.textContent = "- None -";
        }

        const shipping = checkoutCart.length > 0 ? 100 : 0;
        finalShippingEl.textContent = formatCurrency(shipping);

        const grandTotal = subtotal - discountAmount + shipping;
        finalGrandTotalEl.textContent = formatCurrency(grandTotal);
    }

    function loadPaymentPhase() {
        // Pre-fill any known user details if desired, or just load the form.
        // E.g., set cardholder name if fname/lname are known from Phase 1.
        const fname = document.getElementById('fname')?.value;
        const lname = document.getElementById('lname')?.value;
        const cardholderNameInput = document.getElementById('checkout-cardholder-name');
        if (cardholderNameInput && fname && lname) {
            cardholderNameInput.value = `${fname} ${lname}`;
        }
    }

    const placeOrderFinalBtn = document.getElementById('place-order-final-btn');
    if (placeOrderFinalBtn) {
        placeOrderFinalBtn.addEventListener('click', () => {
            if (validateCurrentPhase('payment')) {
                console.log("Order Placed (Simulated)!");
                const orderNumber = `#BS${Date.now().toString().slice(-7)}`;
                document.getElementById('order-number-placeholder').textContent = orderNumber;

                const finalGrandTotalText = document.getElementById('final-grand-total')?.textContent || formatCurrency(0);

                const orderDetails = {
                    orderNumber: orderNumber,
                    date: new Date().toLocaleDateString(),
                    items: checkoutCart,
                    totalAmount: finalGrandTotalText,
                    shippingInfo: { /* Collect from Phase 1 form */ }
                };
                // Example of collecting shipping info
                orderDetails.shippingInfo.email = document.getElementById('email')?.value;
                orderDetails.shippingInfo.phone = document.getElementById('phone')?.value;
                // ... and so on for other fields.

                let orderHistory = JSON.parse(localStorage.getItem('bluestone_order_history') || '[]');
                orderHistory.push(orderDetails);
                localStorage.setItem('bluestone_order_history', JSON.stringify(orderHistory));

                clearCart();
                checkoutCart = [];
                currentPhase = 'confirmation';
                updatePhaseView();
                showGlobalToast("Order placed successfully!", 4000);
            } else {
                 showGlobalToast("Please correct payment details.", 3000);
            }
        });
    }

    updatePhaseView();
});
