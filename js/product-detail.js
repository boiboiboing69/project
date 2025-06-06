document.addEventListener('DOMContentLoaded', () => {
    const mainImageElement = document.getElementById('pdp-main-image');
    const zoomPreviewElement = document.getElementById('pdp-zoom-preview');
    const imageZoomContainer = document.querySelector('.pdp-image-zoom-container'); // For mouse events

    const thumbnailGalleryElement = document.getElementById('pdp-thumbnail-gallery');
    const productNameElement = document.getElementById('pdp-product-name');
    const productPriceElement = document.getElementById('pdp-product-price');
    const productDescriptionElement = document.getElementById('pdp-product-description');

    const sizeSelectElement = document.getElementById('pdp-size-select');
    const metalSelectElement = document.getElementById('pdp-metal-select');

    const quantityInput = document.getElementById('pdp-quantity');
    const addToCartButton = document.getElementById('pdp-add-to-cart-btn');
    const loadingIndicator = document.getElementById('pdp-loading-indicator');

    // Tab elements
    const tabButtons = document.querySelectorAll('.pdp-details-tabs .tab-button');
    const tabContentPanels = document.querySelectorAll('.pdp-details-tabs .tab-content-panel');

    // Specification list elements
    const specMaterialEl = document.getElementById('pdp-spec-material');
    const specWeightEl = document.getElementById('pdp-spec-weight');
    const specSkuEl = document.getElementById('pdp-spec-sku');
    // Diamond info example elements
    const diamondClarityEl = document.getElementById('pdp-diamond-clarity');


    let currentProduct = null;
    let basePrice = 0;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        displayError('Product ID not found. Please use a valid product link.');
        return;
    }

    if (typeof fetchProducts !== 'function' || typeof formatCurrency !== 'function' || typeof calculateItemPrice !== 'function' || typeof showGlobalToast !== 'function') {
        console.error('Core functions from common.js missing.');
        displayError('Error loading page. Core resources missing.');
        return;
    }
    if (typeof addToCart !== 'function') {
        console.error('addToCart from cart.js missing.');
    }

    if (loadingIndicator) loadingIndicator.style.display = 'block';
    const galleryEl = document.querySelector('.product-image-gallery');
    const infoEl = document.querySelector('.product-details-info');
    const tabsEl = document.querySelector('.pdp-details-tabs');
    const reviewsEl = document.querySelector('.pdp-customer-reviews');

    if(galleryEl) galleryEl.style.visibility = 'hidden';
    if(infoEl) infoEl.style.visibility = 'hidden';
    if(tabsEl) tabsEl.style.visibility = 'hidden';
    if(reviewsEl) reviewsEl.style.visibility = 'hidden';

    fetchProducts()
        .then(products => {
            currentProduct = products.find(p => p.id === productId);
            if (!currentProduct) {
                displayError('Product not found.');
                 if (loadingIndicator) loadingIndicator.style.display = 'none';
                return;
            }
            basePrice = currentProduct.basePrice;
            populateProductDetails(currentProduct);
            updateDisplayedPrice();
            setupImageZoom();
            setupTabs();
            if(galleryEl) galleryEl.style.visibility = 'visible';
            if(infoEl) infoEl.style.visibility = 'visible';
            if(tabsEl) tabsEl.style.visibility = 'visible';
            if(reviewsEl) reviewsEl.style.visibility = 'visible';
        })
        .catch(error => {
            console.error('Error fetching/processing product details:', error);
            displayError('Could not load product details.');
        })
        .finally(() => {
            if (loadingIndicator) loadingIndicator.style.display = 'none';
        });

    function displayError(message) {
        const container = document.querySelector('.product-detail-container');
        if (loadingIndicator) loadingIndicator.style.display = 'none'; // Hide loading on error too

        if (container) {
            // Clear out existing structure within container before showing error
            const pdpImageGallery = container.querySelector('.product-image-gallery');
            const pdpDetailsInfo = container.querySelector('.product-details-info');
            // const pdpTabs = container.querySelector('.pdp-details-tabs'); // Tabs are inside pdpDetailsInfo
            // const pdpReviews = document.querySelector('.pdp-customer-reviews'); // Reviews section is separate

            if(pdpImageGallery) pdpImageGallery.style.display = 'none';
            if(pdpDetailsInfo) pdpDetailsInfo.style.display = 'none';
            // if(pdpTabs) pdpTabs.style.display = 'none'; // Not needed if parent is hidden
            const reviewsSection = document.querySelector('.pdp-customer-reviews'); // Select it directly
            if(reviewsSection) reviewsSection.style.display = 'none';


            let errorP = container.querySelector('.error-message-pdp');
            if (!errorP) {
                errorP = document.createElement('p');
                errorP.classList.add('error-message-pdp');
                errorP.style.textAlign = 'center';
                errorP.style.fontSize = '1.2rem';
                errorP.style.color = 'red';
                errorP.style.width = '100%';
                container.insertBefore(errorP, container.firstChild);
            }
            errorP.textContent = message;

        } else if (productNameElement) {
            productNameElement.textContent = message;
            productNameElement.style.color = 'red';
        }
    }

    function populateProductDetails(product) {
        document.title = `BlueStone - ${product.name}`;
        if (mainImageElement) {
            mainImageElement.src = product.imageUrls.main;
            mainImageElement.alt = product.name; // Dynamic Alt Text
            if(zoomPreviewElement) zoomPreviewElement.style.backgroundImage = `url('${product.imageUrls.main}')`;
        }

        if (thumbnailGalleryElement && product.imageUrls.gallery && product.imageUrls.gallery.length > 0) {
            thumbnailGalleryElement.innerHTML = '';
            const allImages = [product.imageUrls.main, ...product.imageUrls.gallery.filter(url => url !== product.imageUrls.main)];
            allImages.slice(0, 4).forEach((imgUrl, index) => {
                const thumbImg = document.createElement('img');
                thumbImg.src = imgUrl;
                thumbImg.alt = `View ${product.name} - Image ${index + 1}`; // Dynamic Alt Text for thumbnails
                thumbImg.addEventListener('click', () => {
                    if(mainImageElement) mainImageElement.src = imgUrl;
                    if(zoomPreviewElement) zoomPreviewElement.style.backgroundImage = `url('${imgUrl}')`;
                });
                thumbnailGalleryElement.appendChild(thumbImg);
            });
        } else if (thumbnailGalleryElement) {
             thumbnailGalleryElement.innerHTML = ''; // Clear if no gallery
        }

        if (productNameElement) productNameElement.textContent = product.name;
        if (productDescriptionElement) productDescriptionElement.textContent = product.description;

        // Populate attributes (simplified, assuming 'material', 'weight', 'sku' might be top-level or in a 'details' object)
        if (specMaterialEl) specMaterialEl.textContent = product.attributes?.metals?.[0] || product.material || 'N/A';
        if (specWeightEl) specWeightEl.textContent = product.attributes?.weight || product.weight || 'Approx. --';
        if (specSkuEl) specSkuEl.textContent = product.id.toUpperCase(); // Use product ID as SKU
        if (diamondClarityEl && product.attributes?.stones?.includes("Diamond")) { // Example
             diamondClarityEl.textContent = product.attributes?.diamondClarity || "VVS1 (Example)";
        } else if (diamondClarityEl) {
            diamondClarityEl.closest('ul').parentElement.style.display = 'none'; // Hide diamond info if not a diamond product
        }


        if (metalSelectElement) { /* ... (as before) ... */
            metalSelectElement.innerHTML = '';
            const metals = product.attributes?.metals || [];
            if (metals.length > 0) {
                metals.forEach(metalName => {
                    const option = document.createElement('option');
                    option.value = metalName.toLowerCase().replace(/[()\s]/g, '_');
                    option.textContent = metalName;
                    metalSelectElement.appendChild(option);
                });
                metalSelectElement.addEventListener('change', updateDisplayedPrice);
                metalSelectElement.parentElement.style.display = '';
            } else {
                 metalSelectElement.parentElement.style.display = 'none';
            }
        }
        if (sizeSelectElement) {  /* ... (as before) ... */
            sizeSelectElement.innerHTML = '';
            const sizes = product.attributes?.sizes || [];
            if (sizes.length > 0) {
                 sizes.forEach(sizeValue => {
                    const option = document.createElement('option');
                    option.value = String(sizeValue);
                    option.textContent = `Size ${sizeValue}`;
                    sizeSelectElement.appendChild(option);
                });
                sizeSelectElement.addEventListener('change', updateDisplayedPrice);
                sizeSelectElement.parentElement.style.display = '';
            } else {
                 sizeSelectElement.parentElement.style.display = 'none';
            }
        }
    }

    function updateDisplayedPrice() { /* ... (as before, uses calculateItemPrice) ... */
        if (!currentProduct || !productPriceElement) return;
        const selectedOptions = {};
        if (metalSelectElement && metalSelectElement.value && metalSelectElement.parentElement.style.display !== 'none') {
            selectedOptions.metal = metalSelectElement.value;
        }
        if (sizeSelectElement && sizeSelectElement.value && sizeSelectElement.parentElement.style.display !== 'none') {
            selectedOptions.size = sizeSelectElement.value;
        }
        const calculatedPrice = calculateItemPrice(basePrice, selectedOptions, currentProduct.attributes);
        productPriceElement.textContent = formatCurrency(calculatedPrice);
    }

    function setupImageZoom() {
        if (!imageZoomContainer || !mainImageElement || !zoomPreviewElement) return;

        imageZoomContainer.addEventListener('mousemove', (e) => {
            const mainImgRect = mainImageElement.getBoundingClientRect();
            const x = e.clientX - mainImgRect.left;
            const y = e.clientY - mainImgRect.top;

            // Check if cursor is within the main image bounds
            if (x >= 0 && x <= mainImgRect.width && y >= 0 && y <= mainImgRect.height) {
                zoomPreviewElement.style.display = 'block';

                // Calculate background position for zoom preview
                // zoomLevel can be adjusted. e.g., 2 for 2x zoom.
                const zoomLevel = 2;
                const bgPosX = -(x * zoomLevel - zoomPreviewElement.offsetWidth / 2);
                const bgPosY = -(y * zoomLevel - zoomPreviewElement.offsetHeight / 2);

                zoomPreviewElement.style.backgroundPosition = `${bgPosX}px ${bgPosY}px`;
                // Set background size to make the image appear zoomed
                zoomPreviewElement.style.backgroundSize = `${mainImgRect.width * zoomLevel}px ${mainImgRect.height * zoomLevel}px`;
            } else {
                zoomPreviewElement.style.display = 'none'; // Hide if cursor moves out slightly but still over container
            }
        });

        imageZoomContainer.addEventListener('mouseleave', () => {
            zoomPreviewElement.style.display = 'none';
        });
    }

    function setupTabs() {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetPanelId = button.dataset.tabTarget;

                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                tabContentPanels.forEach(panel => {
                    panel.classList.toggle('active', panel.id === targetPanelId.substring(1));
                });
            });
        });
    }


    if (addToCartButton) { /* ... (Add to Cart logic as before, using selected options and calculated price) ... */
        addToCartButton.addEventListener('click', () => {
            if (!currentProduct) { alert("Product details not loaded."); return; }
            const selectedOptionsForCart = {};
            if (metalSelectElement && metalSelectElement.value && metalSelectElement.parentElement.style.display !== 'none') {
                selectedOptionsForCart.metal = metalSelectElement.options[metalSelectElement.selectedIndex].text;
            }
            if (sizeSelectElement && sizeSelectElement.value && sizeSelectElement.parentElement.style.display !== 'none') {
                selectedOptionsForCart.size = sizeSelectElement.value;
            }
            const currentPriceText = productPriceElement.textContent;
            const finalPrice = parseFloat(currentPriceText.replace(/[^0-9.-]+/g, ''));

            const productData = {
                id: currentProduct.id,
                name: currentProduct.name,
                price: finalPrice,
                quantity: parseInt(quantityInput.value) || 1,
                image: currentProduct.imageUrls.thumbnail || currentProduct.imageUrls.main,
                options: selectedOptionsForCart
            };

            if (typeof addToCart === "function") {
                addToCart(productData);
                showGlobalToast(`${productData.name} added to cart!`, 2000);
                // Visual feedback on button
                const originalText = addToCartButton.textContent;
                addToCartButton.textContent = 'Added!';
                addToCartButton.classList.add('btn-success-feedback');
                setTimeout(() => {
                    addToCartButton.textContent = originalText;
                    addToCartButton.classList.remove('btn-success-feedback');
                }, 2000);
            } else {
                console.error("addToCart function is not defined.");
                showGlobalToast("Error: Could not add to cart.", 3000);
            }
        });
    }
});
