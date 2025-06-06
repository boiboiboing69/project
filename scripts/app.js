// General JavaScript for the application
console.log("app.js loaded");

// --- Sample Product Data ---
const sampleProducts = [
    {
        id: 1, name: "Elegant Gold Ring", imageUrl: "assets/images/placeholder-ring-large.jpg",
        thumbnails: ["assets/images/placeholder-ring-thumb1.jpg", "assets/images/placeholder-ring-thumb2.jpg", "assets/images/placeholder-ring-thumb3.jpg", "assets/images/placeholder-ring-thumb4.jpg"],
        price: 1250, category: "Rings", metal: "gold-22k", stone: "diamond-05ct",
        description: "A beautifully crafted 22K gold ring, featuring a stunning 0.5 carat central diamond. Perfect for engagements, anniversaries, or as a timeless gift.",
        goldValue: 800, stoneBaseValue: 300, makingChargesBase: 100
    },
    {
        id: 2, name: "Diamond Pendant Necklace", imageUrl: "assets/images/placeholder-necklace.jpg",
        thumbnails: ["assets/images/placeholder-necklace.jpg", "assets/images/placeholder-ring-thumb1.jpg", "assets/images/placeholder-earrings.jpg"],
        price: 2800, category: "Necklaces", metal: "white-gold-18k", stone: "diamond-075ct",
        description: "Featuring a stunning 0.75 carat brilliant-cut diamond on an 18K white gold chain. A classic piece that adds sparkle to any outfit.",
        goldValue: 1500, stoneBaseValue: 1000, makingChargesBase: 200
    },
    {
        id: 3, name: "Sapphire Stud Earrings", imageUrl: "assets/images/placeholder-earrings.jpg",
        thumbnails: ["assets/images/placeholder-earrings.jpg", "assets/images/placeholder-ring-thumb2.jpg"],
        price: 850, category: "Earrings", metal: "platinum", stone: "sapphire-blue",
        description: "Classic sapphire studs in a sleek platinum setting, ideal for a touch of color and sophistication. Each sapphire is 0.5 carat.",
        goldValue: 300, stoneBaseValue: 400, makingChargesBase: 100
    },
    {
        id: 4, name: "Platinum Tennis Bracelet", imageUrl: "assets/images/placeholder-bracelet.jpg",
        thumbnails: ["assets/images/placeholder-bracelet.jpg", "assets/images/placeholder-ring-thumb3.jpg"],
        price: 4200, category: "Bracelets", metal: "platinum", stone: "diamond-1ct",
        description: "An exquisite platinum bracelet adorned with a continuous line of sparkling diamonds, totaling over 1 carat. The epitome of luxury.",
        goldValue: 2000, stoneBaseValue: 1800, makingChargesBase: 300
    },
    {
        id: 5, name: "Ruby Drop Earrings", imageUrl: "assets/images/placeholder-earrings.jpg",
        thumbnails: ["assets/images/placeholder-earrings.jpg", "assets/images/placeholder-ring-thumb4.jpg"],
        price: 1500, category: "Earrings", metal: "rose-gold-18k", stone: "ruby-red",
        description: "Elegant 18K rose gold drop earrings featuring pear-shaped rubies and delicate diamond accents. Perfect for a glamorous evening out.",
        goldValue: 700, stoneBaseValue: 600, makingChargesBase: 150
    },
    {
        id: 6, name: "Emerald Cocktail Ring", imageUrl: "assets/images/placeholder-ring-large.jpg",
        thumbnails: ["assets/images/placeholder-ring-large.jpg", "assets/images/placeholder-ring-thumb1.jpg"],
        price: 3200, category: "Rings", metal: "gold-18k", stone: "emerald-green",
        description: "A statement cocktail ring crafted in 18K yellow gold, with a large emerald-cut emerald surrounded by a dazzling halo of diamonds.",
        goldValue: 1200, stoneBaseValue: 1500, makingChargesBase: 350
    }
];

// --- Product Listing Page Logic ---
function renderProductCard(product) {
    return `
        <article class="product-card" data-product-id="${product.id}">
            <img src="${product.imageUrl}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="price">$${product.price.toLocaleString()}</p>
            <a href="product-detail.html?id=${product.id}" class="cta-button">View Details</a>
        </article>
    `;
}

function displayProducts(productsArray) {
    const productGrid = document.querySelector('.product-grid');
    if (productGrid) {
        productGrid.innerHTML = '';
        productsArray.forEach(product => {
            productGrid.innerHTML += renderProductCard(product);
        });
    }
}

// --- Active Navigation Link Highlighting ---
function updateActiveNavLinks() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('header nav a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').endsWith(currentPath)) {
            link.classList.add('active');
        }
    });
}

// --- Product Detail Page Population Logic ---
function getProductById(id, productsArray) {
    return productsArray.find(p => p.id === parseInt(id));
}

function populateProductDetail(productId) {
    const product = getProductById(productId, sampleProducts);

    if (product) {
        document.title = `${product.name} - Luxury Jewels`;
        const productNameEl = document.querySelector('.product-info-section h1');
        if (productNameEl) productNameEl.textContent = product.name;
        const shortDescEl = document.querySelector('.short-description');
        if (shortDescEl) shortDescEl.textContent = product.description;
        const currentPriceEl = document.querySelector('.current-price');
        if (currentPriceEl) currentPriceEl.textContent = `$${product.price.toLocaleString()}`;
        const mainImageEl = document.getElementById('main-product-image');
        if (mainImageEl) {
            mainImageEl.src = product.imageUrl;
            mainImageEl.alt = product.name;
        }

        const thumbnailGalleryEl = document.querySelector('.thumbnail-gallery');
        if (thumbnailGalleryEl) {
            thumbnailGalleryEl.innerHTML = '';
            const thumbnailsToDisplay = product.thumbnails && product.thumbnails.length > 0 ? product.thumbnails : [product.imageUrl];
            thumbnailsToDisplay.forEach((thumbUrl, index) => {
                const img = document.createElement('img');
                img.src = thumbUrl;
                img.alt = `${product.name} - Thumbnail ${index + 1}`;
                img.dataset.largeUrl = thumbUrl;
                if (index === 0) img.classList.add('active');
                thumbnailGalleryEl.appendChild(img);
            });
            initializeImageCarousel();
        }

        const metalSelectEl = document.getElementById('metal-select');
        if (metalSelectEl && product.metal) metalSelectEl.value = product.metal;
        const stoneSelectEl = document.getElementById('stone-select');
        if (stoneSelectEl && product.stone) stoneSelectEl.value = product.stone;

        const goldValueEl = document.getElementById('gold-value');
        if (goldValueEl && product.goldValue) goldValueEl.textContent = `$${product.goldValue.toLocaleString()}`;
        const stoneValueEl = document.getElementById('stone-value');
        if (stoneValueEl && product.stoneBaseValue) stoneValueEl.textContent = `$${product.stoneBaseValue.toLocaleString()}`;
        const makingChargesEl = document.getElementById('making-charges');
        if (makingChargesEl && product.makingChargesBase) makingChargesEl.textContent = `$${product.makingChargesBase.toLocaleString()}`;

        const totalEstimateSpan = document.querySelector('#price-details-list #total-estimate');
        if (totalEstimateSpan) totalEstimateSpan.textContent = `$${product.price.toLocaleString()}`;

        const loanAmountEl = document.querySelector('#emi-calculator-widget #loan-amount');
        if (loanAmountEl) loanAmountEl.value = product.price.toFixed(2);

    } else {
        const productDetailContainer = document.querySelector('.product-detail-page .container');
        if (productDetailContainer) productDetailContainer.innerHTML = '<p class="error-message">Product not found.</p>';
    }
}

function initializeImageCarousel() {
    const thumbnails = document.querySelectorAll('.thumbnail-gallery img');
    const mainImage = document.getElementById('main-product-image');
    if (!mainImage || thumbnails.length === 0) return;
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', function() {
            mainImage.src = this.dataset.largeUrl || this.src;
            mainImage.alt = this.alt;
            thumbnails.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// --- Checkout Form Logic & Persistence ---
const CHECKOUT_FORM_FIELDS = ['fullName', 'email', 'phone', 'inquiryType', 'address', 'message', 'designId'];

function saveCheckoutForm() {
    const form = document.getElementById('checkout-form');
    if (!form) return;
    CHECKOUT_FORM_FIELDS.forEach(fieldName => {
        const field = form.elements[fieldName];
        if (field) {
            sessionStorage.setItem(`checkoutForm_${fieldName}`, field.value);
        }
    });
    console.log("Checkout form data saved to sessionStorage.");
}

function loadCheckoutForm() {
    const form = document.getElementById('checkout-form');
    if (!form) return;
    CHECKOUT_FORM_FIELDS.forEach(fieldName => {
        const storedValue = sessionStorage.getItem(`checkoutForm_${fieldName}`);
        const field = form.elements[fieldName];
        if (field && storedValue && !field.value) { // Populate only if field is empty
            field.value = storedValue;
        }
    });
    console.log("Checkout form data loaded from sessionStorage if available.");
}

function clearCheckoutFormStorage() {
    CHECKOUT_FORM_FIELDS.forEach(fieldName => {
        sessionStorage.removeItem(`checkoutForm_${fieldName}`);
    });
    console.log("Cleared checkout form data from sessionStorage.");
}

function populateCheckoutWithDesign(designId) {
    const designQueueKey = 'userLuxuryDesignsAI';
    const designs = JSON.parse(localStorage.getItem(designQueueKey)) || [];
    const designToSubmit = designs.find(d => d.id === parseInt(designId));

    if (designToSubmit) {
        const summarySection = document.getElementById('design-preview-summary');
        if (summarySection) summarySection.style.display = 'block';
        const summaryIdEl = document.getElementById('summary-design-id');
        if (summaryIdEl) summaryIdEl.textContent = designToSubmit.id;
        const summarySpecsEl = document.getElementById('summary-design-specs');
        if (summarySpecsEl) summarySpecsEl.textContent = designToSubmit.specJson.detail || JSON.stringify(designToSubmit.specJson, null, 2);
        const summaryPriceEl = document.getElementById('summary-design-price');
        if (summaryPriceEl) summaryPriceEl.textContent = `$${designToSubmit.estimatedPrice.toLocaleString()}`;

        const inquiryTypeEl = document.getElementById('inquiry-type');
        if (inquiryTypeEl) inquiryTypeEl.value = 'custom-design';
        const messageEl = document.getElementById('message');
        if (messageEl) messageEl.value = `Regarding AI Design ID: ${designToSubmit.id}\nPrompt: ${designToSubmit.specJson.originalPrompt}\n\nAdditional Notes:\n`;
        const designIdInputEl = document.getElementById('design-id-input');
        if (designIdInputEl) {
            designIdInputEl.value = designToSubmit.id; // Set value for the form data
            const designIdLabelEl = document.getElementById('design-id-input-label');
            if(designIdLabelEl) designIdLabelEl.style.display = 'block';
            designIdInputEl.style.display = 'block'; // Make it visible if it was hidden
        }
        const actualSummaryContentEl = document.getElementById('actual-summary-content');
        const summaryPlaceholderMessageEl = document.getElementById('summary-placeholder-message');
        if (actualSummaryContentEl && summaryPlaceholderMessageEl) {
            summaryPlaceholderMessageEl.style.display = 'none'; // Hide placeholder since content is there
        }
        saveCheckoutForm(); // Save populated data to session storage
    } else {
        console.warn("Design ID from URL not found in localStorage queue.");
        const summarySection = document.getElementById('design-preview-summary');
        if (summarySection) summarySection.style.display = 'block';
        const summaryPlaceholderMessageEl = document.getElementById('summary-placeholder-message');
        if (summaryPlaceholderMessageEl) summaryPlaceholderMessageEl.textContent = "The design ID from the URL was not found in your saved designs. Please fill out the form for a general inquiry.";
    }
}

function handleCheckoutFormSubmission(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const formProps = Object.fromEntries(formData.entries());
    console.log("Checkout Form Submitted:", formProps);

    const messageEl = document.getElementById('form-submission-message');
    if (messageEl) {
        messageEl.textContent = 'Thank you for your submission! Our team will get back to you shortly. (Simulated)';
        messageEl.className = 'submission-message success-message';
        messageEl.style.display = 'block';
    }
    clearCheckoutFormStorage(); // Clear data on successful submission
    form.reset();
    const summarySection = document.getElementById('design-preview-summary');
    if (summarySection) summarySection.style.display = 'none';
    const designIdInputEl = document.getElementById('design-id-input');
    if (designIdInputEl) designIdInputEl.style.display = 'none';
    const designIdLabelEl = document.getElementById('design-id-input-label');
    if(designIdLabelEl) designIdLabelEl.style.display = 'none';
    setTimeout(() => { if (messageEl) messageEl.style.display = 'none'; }, 5000);
}

// --- DOMContentLoaded Main Listener ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed. Initializing site-wide JS.");
    updateActiveNavLinks();

    if (document.querySelector('.product-grid')) {
        displayProducts(sampleProducts);
    }

    const productDetailPage = document.querySelector('.product-detail-page');
    if (productDetailPage) {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        if (productId) {
            populateProductDetail(productId);
        } else {
            productDetailPage.innerHTML = '<p class="error-message">No product ID specified in the URL.</p>';
        }
    }

    const checkoutFormEl = document.getElementById('checkout-form');
    if (checkoutFormEl) {
        loadCheckoutForm(); // Load any saved data first
        const urlParams = new URLSearchParams(window.location.search);
        const designIdParam = urlParams.get('designId');
        if (designIdParam) {
            populateCheckoutWithDesign(designIdParam); // This might overwrite loaded data for specific fields
        } else {
            const summarySection = document.getElementById('design-preview-summary');
            if (summarySection) summarySection.style.display = 'none';
        }

        CHECKOUT_FORM_FIELDS.forEach(fieldName => {
            const field = checkoutFormEl.elements[fieldName];
            if (field) {
                field.addEventListener('input', saveCheckoutForm);
            }
        });
        checkoutFormEl.addEventListener('submit', handleCheckoutFormSubmission);
    }

    // Service Worker Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch(error => {
                    console.log('ServiceWorker registration failed: ', error);
                });
        });
    }
});
