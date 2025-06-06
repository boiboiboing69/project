document.addEventListener('DOMContentLoaded', async () => {
    const productGrid = document.getElementById('shop-product-grid');
    const productCardTemplateSource = document.getElementById('product-card-template');
    const categoryFilter = document.getElementById('category-filter');
    const metalFilter = document.getElementById('metal-filter');
    const sortBy = document.getElementById('sort-by');
    const priceMinInput = document.getElementById('price-min');
    const priceMaxInput = document.getElementById('price-max');
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    const loadingIndicator = document.getElementById('shop-loading-indicator');

    let allProducts = [];

    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search')?.toLowerCase().trim() || '';

    if (typeof fetchProducts !== 'function' || typeof formatCurrency !== 'function') {
        console.error('Required functions from common.js are not available.');
        if (productGrid) productGrid.innerHTML = '<p style="color:red; text-align:center;">Error: Required resources missing.</p>';
        return;
    }

    if (searchQuery) {
        const shopPageContainer = document.querySelector('.shop-page-container');
        if (shopPageContainer) {
            let searchResultTitle = document.getElementById('search-result-title');
            if (!searchResultTitle) {
                searchResultTitle = document.createElement('h2');
                searchResultTitle.id = 'search-result-title';
                searchResultTitle.className = 'section-title container';
                // Insert before the .shop-page-container itself, but within .page-container
                const pageContainer = document.querySelector('main.page-container');
                const mainHeading = pageContainer.querySelector('.page-main-heading');
                if(mainHeading) {
                    mainHeading.after(searchResultTitle);
                } else {
                    pageContainer.insertBefore(searchResultTitle, pageContainer.firstChild);
                }
            }
            searchResultTitle.textContent = `Search Results for: "${decodeURIComponent(searchQuery)}"`;
        }
    }


    async function loadProducts() {
        if (loadingIndicator) loadingIndicator.style.display = 'block';
        if (productGrid) productGrid.innerHTML = ''; // Clear grid while loading

        try {
            allProducts = await fetchProducts();
            if (!allProducts || allProducts.length === 0) {
                if (productGrid) productGrid.innerHTML = '<p style="text-align:center;">No products found.</p>';
                if (loadingIndicator) loadingIndicator.style.display = 'none';
                return;
            }
            populateFilters(allProducts);
            filterAndSortProducts(); // Apply initial filters (including search)
        } catch (error) {
            console.error("Error loading products:", error);
            if (productGrid) productGrid.innerHTML = '<p style="color:red; text-align:center;">Could not load products.</p>';
        } finally {
            if (loadingIndicator) loadingIndicator.style.display = 'none';
        }
    }

    function populateFilters(products) {
        if (!categoryFilter || !metalFilter) {
            console.warn("Filter select elements not found.");
            return;
        }
        categoryFilter.length = 1;
        metalFilter.length = 1;

        const categories = [...new Set(products.map(p => p.category))];
        categories.sort().forEach(cat => {
            if(cat) {
                const option = new Option(cat, cat);
                categoryFilter.add(option);
            }
        });

        const metals = [...new Set(products.flatMap(p => p.attributes?.metals || []))];
        metals.sort().forEach(metal => {
            if(metal) {
                const option = new Option(metal, metal);
                metalFilter.add(option);
            }
        });
    }

    function renderProducts(productsToRender) {
        if (!productGrid || !productCardTemplateSource) {
            console.error("Product grid or template not found for rendering!");
            return;
        }

        const templateHtml = productCardTemplateSource.innerHTML; // Get inner HTML of the template
        productGrid.innerHTML = ''; // Clear existing products

        if (productsToRender.length === 0) {
            if (searchQuery) {
                 productGrid.innerHTML = `<p style="text-align:center; padding: 2rem;">No products found matching "${decodeURIComponent(searchQuery)}". Try broadening your search or clearing filters.</p>`;
            } else {
                 productGrid.innerHTML = '<p style="text-align:center; padding: 2rem;">No products match your criteria.</p>';
            }
            return;
        }

        productsToRender.forEach(product => {
            const cardClone = document.createElement('div'); // Create a new div for the card
            cardClone.classList.add('product-card'); // Add the class
            cardClone.innerHTML = templateHtml; // Set its inner HTML from the template

            // cardClone.removeAttribute('id'); // Template ID removed by not cloning the #product-card-template itself
            // cardClone.style.display = ''; // No longer needed as we create fresh divs
            cardClone.dataset.productId = product.id;

            const productLinkElements = cardClone.querySelectorAll('.product-link');
            const productDetailUrl = `product-detail.html?id=${product.id}`;
            productLinkElements.forEach(el => el.href = productDetailUrl);

            const productImage = cardClone.querySelector('.product-image');
            if (productImage) {
                productImage.src = product.imageUrls.thumbnail || product.imageUrls.main;
                productImage.alt = product.name; // Dynamic Alt Text
            }

            // The h3 in template is product-name-placeholder, update its content and link
            const namePlaceholder = cardClone.querySelector('.product-name-placeholder');
            if (namePlaceholder) { // Check if placeholder exists
                 const nameLinkElement = document.createElement('a');
                 nameLinkElement.href = productDetailUrl;
                 nameLinkElement.textContent = product.name;
                 nameLinkElement.classList.add('product-name');
                 namePlaceholder.replaceWith(nameLinkElement);
            } else { // Fallback if structure is different (e.g. directly an h3 with an a)
                const h3Link = cardClone.querySelector('h3 a.product-name');
                if(h3Link) {
                    h3Link.textContent = product.name;
                    h3Link.href = productDetailUrl;
                }
            }


            const productPrice = cardClone.querySelector('.product-price');
            if (productPrice) {
                productPrice.textContent = formatCurrency(product.basePrice);
            }

            const addToCartBtn = cardClone.querySelector('.add-to-cart-btn');
            if (addToCartBtn) {
                addToCartBtn.dataset.productId = product.id;
                addToCartBtn.setAttribute('aria-label', `Add ${product.name} to cart`); // ARIA Label
            }
            productGrid.appendChild(cardClone);
        });
    }

    function filterAndSortProducts() {
        let productsToProcess = [...allProducts];

        // Apply search query first
        if (searchQuery) {
            productsToProcess = productsToProcess.filter(p => {
                const nameMatch = p.name.toLowerCase().includes(searchQuery);
                const tagMatch = p.tags && p.tags.some(tag => tag.toLowerCase().includes(searchQuery));
                const categoryMatch = p.category.toLowerCase().includes(searchQuery);
                const descriptionMatch = p.description.toLowerCase().includes(searchQuery); // Added description
                return nameMatch || tagMatch || categoryMatch || descriptionMatch;
            });
        }

        // Then apply other filters
        const selectedCategory = categoryFilter.value;
        const selectedMetal = metalFilter.value;
        const minPrice = parseFloat(priceMinInput.value);
        const maxPrice = parseFloat(priceMaxInput.value);

        if (selectedCategory !== 'all') {
            productsToProcess = productsToProcess.filter(p => p.category === selectedCategory);
        }
        if (selectedMetal !== 'all') {
            productsToProcess = productsToProcess.filter(p => p.attributes?.metals?.includes(selectedMetal));
        }

        if (!isNaN(minPrice) && minPrice >= 0) {
            productsToProcess = productsToProcess.filter(p => p.basePrice >= minPrice);
        }
        if (!isNaN(maxPrice) && maxPrice > 0 && (isNaN(minPrice) || maxPrice >= minPrice)) {
            productsToProcess = productsToProcess.filter(p => p.basePrice <= maxPrice);
        }

        // Apply sorting
        const sortOption = sortBy.value;
        switch (sortOption) {
            case 'price-asc': productsToProcess.sort((a, b) => a.basePrice - b.basePrice); break;
            case 'price-desc': productsToProcess.sort((a, b) => b.basePrice - a.basePrice); break;
            case 'name-asc': productsToProcess.sort((a, b) => a.name.localeCompare(b.name)); break;
            case 'name-desc': productsToProcess.sort((a, b) => b.name.localeCompare(a.name)); break;
        }
        renderProducts(productsToProcess);
    }

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', filterAndSortProducts);
    }
    // Remove individual listeners if "Apply" button is the main trigger
    // else {
    //     if (categoryFilter) categoryFilter.addEventListener('change', filterAndSortProducts);
    //     if (metalFilter) metalFilter.addEventListener('change', filterAndSortProducts);
    //     if (sortBy) sortBy.addEventListener('change', filterAndSortProducts);
    //     if (priceMinInput) priceMinInput.addEventListener('input', filterAndSortProducts);
    //     if (priceMaxInput) priceMaxInput.addEventListener('input', filterAndSortProducts);
    // }

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            if(categoryFilter) categoryFilter.value = 'all';
            if(metalFilter) metalFilter.value = 'all';
            if(sortBy) sortBy.value = 'default';
            if(priceMinInput) priceMinInput.value = '';
            if(priceMaxInput) priceMaxInput.value = '';

            showGlobalToast('Filters cleared.', 'info'); // Toast notification

            if (searchQuery) {
                window.location.href = 'shop.html';
            } else {
                filterAndSortProducts();
            }
        });
    }

    loadProducts();
});
