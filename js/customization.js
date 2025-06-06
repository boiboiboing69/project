document.addEventListener('DOMContentLoaded', async () => { // Make async for product fetch
    // Tab switching logic
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    tabLinks.forEach(link => {
        link.addEventListener('click', () => {
            const tabId = link.getAttribute('data-tab');
            tabLinks.forEach(item => item.classList.remove('active'));
            tabContents.forEach(item => item.classList.remove('active'));
            link.classList.add('active');
            const activeTabContent = document.getElementById(tabId);
            if (activeTabContent) activeTabContent.classList.add('active');
        });
    });

    // Ensure common.js functions are available
    if (typeof fetchProducts !== 'function' || typeof formatCurrency !== 'function' || typeof calculateItemPrice !== 'function' || typeof showGlobalToast !== 'function') {
        console.error('Required functions from common.js are not available for Customization page.');
        // Optionally display an error to the user on the page
        const pageContainer = document.querySelector('.page-container');
        if(pageContainer) pageContainer.innerHTML = "<p style='color:red; text-align:center;'>Error loading customization page. Required resources missing.</p>";
        return;
    }
     if (typeof addToCart !== 'function') { // from cart.js
        console.error('addToCart function from cart.js is not available for Customization page.');
    }


    // --- AI Design Section ---
    const aiRequestApprovalButton = document.getElementById('ai-request-approval');
    const aiAddToCartButton = document.getElementById('ai-add-to-cart');
    const aiStatusBadge = document.querySelector('#ai-design-tab .status-badge');
    const aiPromptInput = document.getElementById('ai-prompt-input');
    const aiTotalPriceEl = document.getElementById('ai-total-price');
    // Placeholders for AI design pricing components
    const aiBasePriceEl = document.getElementById('ai-base-price');
    const aiStonePriceEl = document.getElementById('ai-stone-price');
    const aiDesignFeeEl = document.getElementById('ai-design-fee');


    let aiGeneratedProduct = { basePrice: 20000, name: "AI Custom Piece", options: {} }; // Default base for AI

    function updateAIPriceDisplay() {
        // Simulate option extraction from prompt or AI logic
        // For now, let's imagine AI suggests some options based on prompt.
        // This is highly conceptual as there's no actual AI.
        // Example: if prompt contains "emerald", AI chooses emerald.
        aiGeneratedProduct.options = {}; // Reset options
        if (aiPromptInput.value.toLowerCase().includes("platinum")) aiGeneratedProduct.options.metal = "platinum";
        else if (aiPromptInput.value.toLowerCase().includes("gold")) aiGeneratedProduct.options.metal = "gold_18k";
        if (aiPromptInput.value.toLowerCase().includes("emerald")) aiGeneratedProduct.options.stone = "emerald";
        else if (aiPromptInput.value.toLowerCase().includes("ruby")) aiGeneratedProduct.options.stone = "ruby";

        const calculatedPrice = calculateItemPrice(aiGeneratedProduct.basePrice, aiGeneratedProduct.options);

        // Update individual price components (conceptual for AI)
        if(aiBasePriceEl) aiBasePriceEl.textContent = formatCurrency(aiGeneratedProduct.basePrice);
        let stoneCost = 0;
        if(aiGeneratedProduct.options.stone && stonePriceModifiers[aiGeneratedProduct.options.stone]) {
            stoneCost = stonePriceModifiers[aiGeneratedProduct.options.stone];
        }
        if(aiStonePriceEl) aiStonePriceEl.textContent = formatCurrency(stoneCost);
        // Design fee can be fixed or based on complexity (not implemented)
        const designFee = 500; // Example fixed design fee
        if(aiDesignFeeEl) aiDesignFeeEl.textContent = formatCurrency(designFee);

        if (aiTotalPriceEl) aiTotalPriceEl.textContent = formatCurrency(calculatedPrice + designFee); // Add design fee to final
        aiGeneratedProduct.finalPrice = calculatedPrice + designFee; // Store for Add to Cart
    }

    if(aiPromptInput) aiPromptInput.addEventListener('input', updateAIPriceDisplay);
    updateAIPriceDisplay(); // Initial calculation for AI


    if (aiRequestApprovalButton && aiStatusBadge) {
        aiRequestApprovalButton.addEventListener('click', () => {
            console.log('AI Design - Approval Requested for prompt:', aiPromptInput.value);
            aiStatusBadge.textContent = 'Approval Requested';
            aiStatusBadge.classList.remove('pending'); // Assuming 'pending' is a class
            aiStatusBadge.classList.add('requested'); // Add a new class for styling 'requested' state
            // Example: aiStatusBadge.style.backgroundColor = '#f0ad4e'; (direct style change)
            aiRequestApprovalButton.textContent = 'Requested';
            aiRequestApprovalButton.disabled = true;
            showGlobalToast("AI design approval requested.", 2000);
        });
    }

    if (aiAddToCartButton) {
        aiAddToCartButton.addEventListener('click', () => {
            const productData = {
                id: 'ai_design_' + Date.now(),
                name: aiGeneratedProduct.name + (aiPromptInput.value ? ` (${aiPromptInput.value.substring(0,20)}...)` : ''),
                price: aiGeneratedProduct.finalPrice || aiGeneratedProduct.basePrice,
                image: document.getElementById('ai-preview-image')?.textContent === "[AI Generated Image Placeholder]" ? 'https://via.placeholder.com/100x100/FDF9F5/1E1E1E?text=AI+Design' : document.getElementById('ai-preview-image').innerHTML, // Conceptual image
                quantity: 1,
                options: { ...aiGeneratedProduct.options, prompt: aiPromptInput.value } // Include prompt as an option
            };

            if (typeof addToCart === "function") {
                addToCart(productData);
                showGlobalToast(`${productData.name} added to cart!`, 2000);
                const originalText = aiAddToCartButton.textContent;
                aiAddToCartButton.textContent = 'Added!';
                aiAddToCartButton.classList.add('btn-success-feedback');
                setTimeout(() => {
                    aiAddToCartButton.textContent = originalText;
                    aiAddToCartButton.classList.remove('btn-success-feedback');
                }, 2000);
            } else {
                console.error("addToCart function not defined.");
                showGlobalToast("Error: Could not add AI design to cart.", 3000);
            }
        });
    }

    // --- Custom Design Section ("Create Your Own") ---
    const metalDropdown = document.getElementById('metal-dropdown');
    const stoneDropdown = document.getElementById('stone-dropdown');
    const styleDropdown = document.getElementById('style-dropdown');
    const customTotalPriceEl = document.getElementById('custom-total-price');
    // Placeholders for custom design pricing components
    const customBasePriceEl = document.getElementById('custom-base-price');
    const customMetalPriceEl = document.getElementById('custom-metal-price');
    const customStonePriceEl = document.getElementById('custom-stone-price');


    const customDesignBasePrice = 15000; // Base for "Create Your Own"

    function updateCustomPriceDisplay() {
        const selectedOptions = {
            metal: metalDropdown ? metalDropdown.value : null, // e.g., "gold_18k"
            stone: stoneDropdown ? stoneDropdown.value : null, // e.g., "diamond"
            style: styleDropdown ? styleDropdown.value : null  // e.g., "vintage"
        };

        const calculatedPrice = calculateItemPrice(customDesignBasePrice, selectedOptions);

        if(customBasePriceEl) customBasePriceEl.textContent = formatCurrency(customDesignBasePrice);

        let metalCost = 0;
        if(selectedOptions.metal && metalPriceModifiers[selectedOptions.metal]) {
            metalCost = metalPriceModifiers[selectedOptions.metal];
        }
        if(customMetalPriceEl) customMetalPriceEl.textContent = formatCurrency(metalCost);

        let stoneCost = 0;
        if(selectedOptions.stone && stonePriceModifiers[selectedOptions.stone]) {
            stoneCost = stonePriceModifiers[selectedOptions.stone];
        }
        if(customStonePriceEl) customStonePriceEl.textContent = formatCurrency(stoneCost);


        if (customTotalPriceEl) customTotalPriceEl.textContent = formatCurrency(calculatedPrice);
    }

    if (metalDropdown) metalDropdown.addEventListener('change', updateCustomPriceDisplay);
    if (stoneDropdown) stoneDropdown.addEventListener('change', updateCustomPriceDisplay);
    if (styleDropdown) styleDropdown.addEventListener('change', updateCustomPriceDisplay);
    updateCustomPriceDisplay(); // Initial calculation


    const customRequestApprovalButton = document.getElementById('custom-request-approval');
    const customAddToCartButton = document.getElementById('custom-add-to-cart');

    if (customRequestApprovalButton) {
        customRequestApprovalButton.addEventListener('click', () => {
            console.log('Custom Design - Approval Requested with options:', {
                metal: metalDropdown.options[metalDropdown.selectedIndex].text,
                stone: stoneDropdown.options[stoneDropdown.selectedIndex].text,
                style: styleDropdown.options[styleDropdown.selectedIndex].text
            });
            customRequestApprovalButton.textContent = 'Requested';
            customRequestApprovalButton.disabled = true;
            showGlobalToast("Custom design approval requested.", 2000);
        });
    }

    if (customAddToCartButton) {
        customAddToCartButton.addEventListener('click', () => {
            const selectedOptions = {
                metal: metalDropdown.options[metalDropdown.selectedIndex].text,
                stone: stoneDropdown.options[stoneDropdown.selectedIndex].text,
                style: styleDropdown.options[styleDropdown.selectedIndex].text
            };
            const currentPriceText = customTotalPriceEl.textContent;
            const finalPrice = parseFloat(currentPriceText.replace(/[^0-9.-]+/g, ''));

            const productData = {
                id: `custom_made_${Date.now()}`,
                name: `Custom Made Piece (${selectedOptions.metal}, ${selectedOptions.stone}, ${selectedOptions.style})`,
                price: finalPrice,
                image: 'https://via.placeholder.com/100x100/FDF9F5/1E1E1E?text=Custom+Jewelry',
                quantity: 1,
                options: selectedOptions,
            };

            if (typeof addToCart === "function") {
                addToCart(productData);
                showGlobalToast(`${productData.name} added to cart!`, 2000);
                const originalText = customAddToCartButton.textContent;
                customAddToCartButton.textContent = 'Added!';
                customAddToCartButton.classList.add('btn-success-feedback');
                setTimeout(() => {
                    customAddToCartButton.textContent = originalText;
                    customAddToCartButton.classList.remove('btn-success-feedback');
                }, 2000);
            } else {
                console.error("addToCart function not defined.");
                showGlobalToast("Error: Could not add custom design to cart.", 3000);
            }
        });
    }

    // Inspiration Gallery (code from previous subtask, ensure fetchProducts is available)
    const inspirationGallery = document.querySelector('.inspiration-gallery');
    if (inspirationGallery && typeof fetchProducts === "function") {
        fetchProducts()
            .then(products => {
                inspirationGallery.innerHTML = '';
                const itemsToShow = products.slice(0, 5);

                itemsToShow.forEach(product => {
                    const inspirationLink = document.createElement('a');
                    inspirationLink.href = `product-detail.html?id=${product.id}`;
                    inspirationLink.classList.add('inspiration-link');

                    const productCard = document.createElement('div');
                    productCard.classList.add('product-card', 'inspiration-item');
                    productCard.setAttribute('data-product-id', product.id);

                    productCard.innerHTML = `
                        <div class="product-image-container">
                            <img src="${product.imageUrls.thumbnail || product.imageUrls.main}" alt="${product.name}">
                        </div>
                        <div class="product-info">
                            <h3>${product.name}</h3>
                            <p class="product-price">${formatCurrency(product.basePrice)}</p>
                        </div>
                    `;
                    inspirationLink.appendChild(productCard);
                    inspirationGallery.appendChild(inspirationLink);
                });
            })
            .catch(error => {
                console.error('Error fetching products for inspiration gallery:', error);
                if(inspirationGallery) inspirationGallery.innerHTML = '<p>Could not load inspiration items.</p>';
            });
    } else if (inspirationGallery) {
        console.warn("fetchProducts function not found, inspiration gallery might not be populated dynamically.");
    }
});
