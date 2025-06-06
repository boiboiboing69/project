document.addEventListener('DOMContentLoaded', async () => {
    const productGrid = document.getElementById('shop-product-grid');
    const productCardTemplateSource = document.getElementById('product-card-template'); // Renamed for clarity
    const categoryFilter = document.getElementById('category-filter');
    const metalFilter = document.getElementById('metal-filter');
    const sortBy = document.getElementById('sort-by');
    const applyFiltersBtn = document.getElementById('apply-filters-btn');

    let allProducts = []; // To store all fetched products

    // Ensure common.js (fetchProducts, formatCurrency) is loaded
    if (typeof fetchProducts !== 'function' || typeof formatCurrency !== 'function') {
        console.error('Required functions from common.js are not available. Ensure common.js is loaded before shop.js.');
        // Display an error to the user on the page
        if (productGrid) {
            productGrid.innerHTML = '<p style="color:red; text-align:center;">Error loading products. Required resources are missing.</p>';
        }
        return; // Stop execution if dependencies are missing
    }

    async function loadProducts() {
        try {
            allProducts = await fetchProducts();
            if (!allProducts || allProducts.length === 0) {
                console.warn("No products fetched or products array is empty.");
                if (productGrid) productGrid.innerHTML = '<p style="text-align:center;">No products found.</p>';
                return;
            }
            populateFilters(allProducts);
            renderProducts(allProducts);
        } catch (error) {
            console.error("Error loading products:", error);
            if (productGrid) productGrid.innerHTML = '<p style="color:red; text-align:center;">Could not load products. Please try again later.</p>';
        }
    }

    function populateFilters(products) {
        if (!categoryFilter || !metalFilter) {
            console.warn("Filter select elements not found.");
            return;
        }

        const categories = [...new Set(products.map(p => p.category))];
        categories.sort().forEach(cat => {
            if(cat) { // Ensure category is not null/undefined/empty
                const option = new Option(cat, cat);
                categoryFilter.add(option);
            }
        });

        const metals = [...new Set(products.flatMap(p => p.attributes?.metals || []))];
        metals.sort().forEach(metal => {
            if(metal) {
                const option = new Option(metal, metal.toLowerCase().replace(/\s/g, '_')); // Value: gold_18k
                metalFilter.add(option);
            }
        });
    }

    function renderProducts(productsToRender) {
        if (!productGrid || !productCardTemplateSource) {
            console.error("Product grid or template not found for rendering!");
            return;
        }
        productGrid.innerHTML = ''; // Clear existing products (except the template itself if it's a child)

        if (productsToRender.length === 0) {
            productGrid.innerHTML = '<p style="text-align:center;">No products match your criteria.</p>';
            return;
        }

        productsToRender.forEach(product => {
            const cardClone = productCardTemplateSource.cloneNode(true);
            cardClone.removeAttribute('id');
            cardClone.style.display = '';
            cardClone.dataset.productId = product.id;

            const productLinkElements = cardClone.querySelectorAll('.product-link');
            const productDetailUrl = `product-detail.html?id=${product.id}`;
            productLinkElements.forEach(el => el.href = productDetailUrl);

            const productImage = cardClone.querySelector('.product-image');
            if (productImage) {
                productImage.src = product.imageUrls.thumbnail || product.imageUrls.main;
                productImage.alt = product.name;
            }

            // The h3 in template is product-name-placeholder, update its content and link
            const productNamePlaceholder = cardClone.querySelector('.product-name-placeholder');
            if (productNamePlaceholder) {
                 const productLink = document.createElement('a');
                 productLink.href = productDetailUrl;
                 productLink.textContent = product.name;
                 productLink.classList.add('product-name'); // Add class for styling if needed
                 productNamePlaceholder.replaceWith(productLink); // Replace h3 content with a link
            }


            const productPrice = cardClone.querySelector('.product-price');
            if (productPrice) {
                productPrice.textContent = formatCurrency(product.basePrice);
            }

            const addToCartBtn = cardClone.querySelector('.add-to-cart-btn');
            if (addToCartBtn) {
                addToCartBtn.dataset.productId = product.id;
                // Assuming a global event listener for '.add-to-cart-btn' is set up in cart.js or common.js
                // If not, add listener here:
                // addToCartBtn.addEventListener('click', () => { /* ... addToCart logic ... */ });
            }
            productGrid.appendChild(cardClone);
        });
    }

    function filterAndSortProducts() {
        let filtered = [...allProducts];
        const selectedCategory = categoryFilter.value;
        const selectedMetal = metalFilter.value; // This will be like 'gold_18k'
        const sortOption = sortBy.value;

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }
        if (selectedMetal !== 'all') {
            // Need to match against the values in product.attributes.metals which are like "Gold (18K)"
            // So, we either need to store normalized values in filter or normalize here.
            // For now, let's assume a simple match or that JSON metals are already normalized.
            // This part might need adjustment based on exact metal value formats.
            filtered = filtered.filter(p => p.attributes?.metals?.map(m => m.toLowerCase().replace(/\s/g, '_')).includes(selectedMetal) );
        }

        switch (sortOption) {
            case 'price-asc': filtered.sort((a, b) => a.basePrice - b.basePrice); break;
            case 'price-desc': filtered.sort((a, b) => b.basePrice - a.basePrice); break;
            case 'name-asc': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
            case 'name-desc': filtered.sort((a, b) => b.name.localeCompare(a.name)); break;
            default: // 'default' or any other case
                // Could revert to original order if needed, e.g., by product ID or original fetch order
                // For simplicity, current filtered state is maintained if not a recognized sort.
                break;
        }
        renderProducts(filtered);
    }

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', filterAndSortProducts);
    } else {
        // Fallback: Apply on change if no dedicated button
        if (categoryFilter) categoryFilter.addEventListener('change', filterAndSortProducts);
        if (metalFilter) metalFilter.addEventListener('change', filterAndSortProducts);
        if (sortBy) sortBy.addEventListener('change', filterAndSortProducts);
    }

    loadProducts();
});
