// js/common.js

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

function formatCurrency(amount) {
    if (typeof amount !== 'number') {
        const parsedAmount = parseFloat(String(amount).replace(/[^0-9.-]+/g, ''));
        if (isNaN(parsedAmount)) {
            console.warn("Invalid amount for formatCurrency:", amount);
            return '₹--';
        }
        amount = parsedAmount;
    }
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Enhanced showGlobalToast function
function showGlobalToast(message, type = 'info', duration = 3000) {
    let toast = document.getElementById('global-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'global-toast';
        // Class will be added by this function, no need for .classList.add('toast-message') here
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = 'global-toast'; // Reset classes first
    toast.classList.add(type); // 'success', 'error', 'info'

    // Trigger reflow to restart animation if class 'show' is toggled rapidly
    void toast.offsetWidth;

    toast.classList.add('show');

    // Clear existing timeout if any
    if (toast.currentTimeout) {
        clearTimeout(toast.currentTimeout);
    }

    toast.currentTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

const metalPriceModifiers = {
    "default_metal": 0, "gold_18k": 0, "gold_22k": 3000, "platinum": 6000, "silver": -1000, "gold_18k_rose": 500
};
const stonePriceModifiers = {
    "none": 0, "diamond": 0, "emerald": 2500, "ruby": 2000, "sapphire": 1800, "diamond_accent": 500
};
const stylePriceModifiers = {
    "default_style":0, "classic": 0, "vintage": 1200, "modern": 600, "minimalist": -400, "floral": 800
};
const sizePriceModifiers = {
    "default_size": 0, "6": 0, "7": 50, "8": 100, "9": 150
};

function calculateItemPrice(basePrice, options = {}, productAttributes = null) {
    let calculatedPrice = parseFloat(basePrice) || 0;
    // Ensure options values are normalized keys for lookup
    const normalizedOptions = {};
    for (const key in options) {
        if (options.hasOwnProperty(key) && typeof options[key] === 'string') {
            normalizedOptions[key] = options[key].toLowerCase().replace(/[()\s]/g, '_');
        } else {
            normalizedOptions[key] = options[key]; // Use as is if not string (e.g. size number)
        }
    }

    if (normalizedOptions.metal && metalPriceModifiers.hasOwnProperty(normalizedOptions.metal)) {
        calculatedPrice += metalPriceModifiers[normalizedOptions.metal];
    }
    if (normalizedOptions.stone && stonePriceModifiers.hasOwnProperty(normalizedOptions.stone)) {
        calculatedPrice += stonePriceModifiers[normalizedOptions.stone];
    }
    if (normalizedOptions.style && stylePriceModifiers.hasOwnProperty(normalizedOptions.style)) {
        calculatedPrice += stylePriceModifiers[normalizedOptions.style];
    }
    if (normalizedOptions.size && sizePriceModifiers.hasOwnProperty(String(normalizedOptions.size))) { // Ensure size is string for lookup
        calculatedPrice += sizePriceModifiers[String(normalizedOptions.size)];
    }
    return calculatedPrice;
}


document.addEventListener('DOMContentLoaded', () => {
    const navbarSearchForm = document.getElementById('navbar-search-form');
    if (navbarSearchForm) {
        navbarSearchForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const searchInput = document.getElementById('navbar-search-input');
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
            } else {
                window.location.href = 'shop.html';
            }
        });
    }

    // Global Add to Cart listener (for buttons not handled by page-specific JS like PDP/Customization)
    document.body.addEventListener('click', async (event) => {
        const addToCartButton = event.target.closest('.add-to-cart-btn');
        if (addToCartButton && !addToCartButton.id?.startsWith('pdp-') && !addToCartButton.id?.startsWith('ai-') && !addToCartButton.id?.startsWith('custom-')) {
            const productId = addToCartButton.dataset.productId;
            if (!productId) {
                console.error('Button with .add-to-cart-btn class clicked, but no product ID found.', addToCartButton);
                showGlobalToast('Error: Could not add item.', 'error');
                return;
            }
            if (addToCartButton.disabled) return;

            try {
                const products = await fetchProducts();
                const productToAdd = products.find(p => p.id === productId);
                if (!productToAdd) {
                    console.error(`Product with ID ${productId} not found.`);
                    showGlobalToast('Error: Product not found.', 'error');
                    return;
                }

                const productData = {
                    id: productToAdd.id,
                    name: productToAdd.name,
                    price: productToAdd.basePrice,
                    quantity: 1,
                    image: productToAdd.imageUrls.thumbnail || productToAdd.imageUrls.main,
                    options: {}
                };

                if (typeof addToCart === "function") {
                    addToCart(productData); // from cart.js

                    const originalText = addToCartButton.textContent;
                    addToCartButton.textContent = 'Added!';
                    addToCartButton.classList.add('btn-success-feedback');
                    addToCartButton.disabled = true;

                    setTimeout(() => {
                        addToCartButton.textContent = originalText;
                        addToCartButton.classList.remove('btn-success-feedback');
                        addToCartButton.disabled = false;
                    }, 2000);
                    // showGlobalToast(`${productToAdd.name} added to cart!`, 'success'); // Redundant with button text change
                } else {
                    console.error("addToCart function not defined.");
                    showGlobalToast("Error adding to cart.", 'error');
                }
            } catch (error) {
                console.error("Error processing add to cart:", error);
                showGlobalToast("Error: Could not add item.", 'error');
                addToCartButton.disabled = false;
            }
        }
    }

    // Basic Contact Form Feedback (contact-us.html)
    const contactForm = document.getElementById('contact-form-static');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const feedbackEl = document.getElementById('contact-form-feedback');
            const nameInput = contactForm.querySelector('#contact-name');
            const emailInput = contactForm.querySelector('#contact-email');
            const messageInput = contactForm.querySelector('#contact-message');
            let isValid = true;

            // Clear previous errors
            contactForm.querySelectorAll('.error-message-inline').forEach(el => el.textContent = '');
            contactForm.querySelectorAll('input, textarea').forEach(el => el.classList.remove('invalid-field'));

            if (!nameInput.value.trim()) {
                document.getElementById('contact-name-error').textContent = 'Name is required.';
                nameInput.classList.add('invalid-field');
                isValid = false;
            }
            if (!emailInput.value.trim()) {
                document.getElementById('contact-email-error').textContent = 'Email is required.';
                emailInput.classList.add('invalid-field');
                isValid = false;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
                document.getElementById('contact-email-error').textContent = 'Invalid email format.';
                emailInput.classList.add('invalid-field');
                isValid = false;
            }
            if (!messageInput.value.trim()) {
                document.getElementById('contact-message-error').textContent = 'Message is required.';
                messageInput.classList.add('invalid-field');
                isValid = false;
            }

            if (feedbackEl) { // Ensure feedbackEl exists
                if (isValid) {
                    feedbackEl.textContent = 'Thank you for your message! (This is a demo - form not actually submitted)';
                    feedbackEl.style.color = '#4CAF50'; // Success
                    contactForm.reset();
                } else {
                    feedbackEl.textContent = 'Please correct the errors above.';
                    feedbackEl.style.color = '#E67E22'; // Error
                }
                feedbackEl.style.display = 'block';
                setTimeout(() => { feedbackEl.style.display = 'none'; }, 7000); // Hide after 7 seconds
            }
        });
    }

    // Newsletter Signup Feedback (Footer)
    const newsletterFormFooter = document.getElementById('newsletter-signup-form-footer');
    if(newsletterFormFooter) {
        newsletterFormFooter.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = newsletterFormFooter.querySelector('#footer-newsletter-email'); // Corrected ID
            if (emailInput.value.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
                showGlobalToast(`Subscribed ${emailInput.value}! (Demo)`, 'success');
                emailInput.value = '';
            } else {
                showGlobalToast('Please enter a valid email address to subscribe.', 'error');
            }
        });
    });
});
