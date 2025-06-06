// js/common.js

// Function to fetch product data from products.json
async function fetchProducts() {
    try {
        const response = await fetch('products.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const products = await response.json();
        return products;
    } catch (error) {
        console.error("Could not fetch products:", error);
        return [];
    }
}

// Function to format currency (INR for this example)
function formatCurrency(amount) {
    if (typeof amount !== 'number') {
        const parsedAmount = parseFloat(String(amount).replace(/[^0-9.-]+/g, '')); // More robust parsing
        if (isNaN(parsedAmount)) {
            console.warn("Invalid amount for formatCurrency:", amount);
            return '₹--';
        }
        amount = parsedAmount;
    }
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Function to display a temporary toast message
function showGlobalToast(message, duration = 3000) {
    let toast = document.getElementById('global-toast-message');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'global-toast-message';
        toast.classList.add('toast-message');
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// --- Shared Pricing Logic ---
const metalPriceModifiers = {
    "default_metal": 0, "gold_18k": 0, "gold_22k": 3000, "platinum": 6000, "silver": -1000, "gold_18k_rose": 500
};
const stonePriceModifiers = {
    "none": 0, "diamond": 0, "emerald": 2500, "ruby": 2000, "sapphire": 1800, "diamond_accent": 500 // diamond_accent for product.attributes.stones
};
const stylePriceModifiers = {
    "default_style":0, "classic": 0, "vintage": 1200, "modern": 600, "minimalist": -400, "floral": 800
};
const sizePriceModifiers = { // Assuming sizes are stored as strings e.g., "6", "7"
    "default_size": 0, "6": 0, "7": 50, "8": 100, "9": 150
};

/**
 * Calculates the price of an item based on its base price and selected options.
 * @param {number} basePrice - The base price of the product.
 * @param {object} options - Selected options, e.g., { metal: "gold_18k", stone: "diamond", size: "7" }. Values should be normalized keys.
 * @param {object} productAttributes - (Optional) Full attributes of the product, for more complex rules in future.
 * @returns {number} - The calculated price.
 */
function calculateItemPrice(basePrice, options = {}, productAttributes = null) { // productAttributes not used yet but good for future
    let calculatedPrice = parseFloat(basePrice) || 0;

    if (options.metal && metalPriceModifiers.hasOwnProperty(options.metal)) {
        calculatedPrice += metalPriceModifiers[options.metal];
    }
    if (options.stone && stonePriceModifiers.hasOwnProperty(options.stone)) {
        calculatedPrice += stonePriceModifiers[options.stone];
    }
    if (options.style && stylePriceModifiers.hasOwnProperty(options.style)) {
        calculatedPrice += stylePriceModifiers[options.style];
    }
    if (options.size && sizePriceModifiers.hasOwnProperty(options.size)) {
        calculatedPrice += sizePriceModifiers[options.size];
    }
    return calculatedPrice;
}


// --- Event Listeners for Add to Cart (if using event delegation from common.js) ---
document.addEventListener('click', async (event) => {
    if (event.target && event.target.classList.contains('add-to-cart-btn')) {
        const button = event.target;
        const productId = button.dataset.productId;

        if (!productId) {
            console.error('Add to Cart button clicked, but no product ID found.', button);
            showGlobalToast('Error: Could not add item.', 3000);
            return;
        }

        // Prevent multiple quick clicks
        if (button.disabled) return;

        try {
            const products = await fetchProducts();
            const productToAdd = products.find(p => p.id === productId);

            if (!productToAdd) {
                console.error(`Product with ID ${productId} not found.`);
                showGlobalToast('Error: Product not found.', 3000);
                return;
            }

            // For listing pages (index.html featured, shop.html grid), add with base price & no specific options
            // PDP and Customization pages have their own more specific Add to Cart logic
            const productData = {
                id: productToAdd.id,
                name: productToAdd.name,
                price: productToAdd.basePrice,
                quantity: 1,
                image: productToAdd.imageUrls.thumbnail || productToAdd.imageUrls.main,
                options: {} // Default empty options for listing page "Add to Cart"
            };

            if (typeof addToCart === "function") { // from cart.js
                addToCart(productData);

                const originalText = button.textContent;
                button.textContent = 'Added!';
                button.classList.add('btn-success-feedback'); // Use class for styling
                button.disabled = true;

                setTimeout(() => {
                    button.textContent = originalText;
                    button.classList.remove('btn-success-feedback');
                    button.disabled = false;
                }, 2000);

            } else {
                console.error("addToCart function not defined.");
                showGlobalToast("Error adding to cart.", 3000);
            }

        } catch (error) {
            console.error("Error processing add to cart:", error);
            showGlobalToast("Error: Could not add item.", 3000);
            button.disabled = false; // Re-enable button on error
        }
    }
});
