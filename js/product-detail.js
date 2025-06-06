document.addEventListener('DOMContentLoaded', () => {
    const mainImageElement = document.getElementById('pdp-main-image');
    const thumbnailGalleryElement = document.getElementById('pdp-thumbnail-gallery');
    const productNameElement = document.getElementById('pdp-product-name');
    const productPriceElement = document.getElementById('pdp-product-price');
    const productDescriptionElement = document.getElementById('pdp-product-description');

    const sizeSelectElement = document.getElementById('pdp-size-select');
    const metalSelectElement = document.getElementById('pdp-metal-select');
    // const stoneSelectElement = document.getElementById('pdp-stone-select'); // Example if you add it

    const quantityInput = document.getElementById('pdp-quantity');
    const addToCartButton = document.getElementById('pdp-add-to-cart-btn');

    let currentProduct = null;
    let basePrice = 0; // Will be set from currentProduct.basePrice

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        displayError('Product ID not found in URL. Please ensure you have a valid product link.');
        return;
    }

    // Ensure common.js (fetchProducts, formatCurrency, calculateItemPrice) is loaded
    if (typeof fetchProducts !== 'function' || typeof formatCurrency !== 'function' || typeof calculateItemPrice !== 'function') {
        console.error('Required functions from common.js are not available for PDP.');
        displayError('Error loading product details page. Required resources missing.');
        return;
    }
    // Ensure cart.js (addToCart) is loaded
    if (typeof addToCart !== 'function') {
        console.error('addToCart function from cart.js is not available for PDP.');
        // displayError('Cart functionality is unavailable.'); // Potentially disable add to cart button
    }


    fetchProducts()
        .then(products => {
            currentProduct = products.find(p => p.id === productId);

            if (!currentProduct) {
                displayError('Sorry, the product you are looking for does not exist.');
                return;
            }

            basePrice = currentProduct.basePrice;
            populateProductDetails(currentProduct);
            updateDisplayedPrice();
        })
        .catch(error => {
            console.error('Error fetching or processing product details:', error);
            displayError('An error occurred while loading product details. Please try again later.');
        });

    function displayError(message) {
        const container = document.querySelector('.product-detail-container');
        if (container) {
            container.innerHTML = `<p style="text-align:center; font-size:1.2rem; color:red;">${message}</p>`;
        } else if (productNameElement) {
            productNameElement.textContent = message; // Fallback
        }
    }

    function populateProductDetails(product) {
        document.title = `BlueStone - ${product.name}`;
        if (mainImageElement) {
            mainImageElement.src = product.imageUrls.main;
            mainImageElement.alt = product.name;
        }

        if (thumbnailGalleryElement && product.imageUrls.gallery && product.imageUrls.gallery.length > 0) {
            thumbnailGalleryElement.innerHTML = '';
            product.imageUrls.gallery.forEach(imgUrl => {
                const thumbImg = document.createElement('img');
                thumbImg.src = imgUrl;
                thumbImg.alt = `${product.name} thumbnail`;
                thumbImg.style.width = '80px';
                thumbImg.style.height = '80px';
                thumbImg.style.border = '1px solid #ccc';
                thumbImg.style.borderRadius = '4px';
                thumbImg.style.marginRight = '10px';
                thumbImg.style.cursor = 'pointer';
                thumbImg.addEventListener('click', () => {
                    if(mainImageElement) mainImageElement.src = imgUrl;
                });
                thumbnailGalleryElement.appendChild(thumbImg);
            });
        } else if (thumbnailGalleryElement) {
             thumbnailGalleryElement.innerHTML = '<p style="font-size:0.9rem; color:#888;">No additional views available.</p>';
        }

        if (productNameElement) productNameElement.textContent = product.name;
        if (productDescriptionElement) productDescriptionElement.textContent = product.description;

        // Populate Metal Options
        if (metalSelectElement) {
            metalSelectElement.innerHTML = '';
            const metals = product.attributes?.metals || ["Default Metal"];
            metals.forEach(metalName => {
                const option = document.createElement('option');
                option.value = metalName.toLowerCase().replace(/[()\s]/g, '_');
                option.textContent = metalName;
                metalSelectElement.appendChild(option);
            });
            metalSelectElement.addEventListener('change', updateDisplayedPrice);
        }

        // Populate Size Options
        if (sizeSelectElement) {
            sizeSelectElement.innerHTML = '';
            const sizes = product.attributes?.sizes || ["default_size"]; // Use a key that exists in sizePriceModifiers
            if (sizes.length === 0 || (sizes.length === 1 && sizes[0] === "default_size")) { // Hide if no specific sizes
                sizeSelectElement.parentElement.style.display = 'none'; // Assuming label and select are wrapped
            } else {
                 sizes.forEach(sizeValue => {
                    const option = document.createElement('option');
                    option.value = String(sizeValue); // Ensure value is string for consistency with modifiers
                    option.textContent = `Size ${sizeValue}`;
                    sizeSelectElement.appendChild(option);
                });
                sizeSelectElement.addEventListener('change', updateDisplayedPrice);
            }
        }
        // Add similar for other attributes like stone, style if they exist in HTML and product.attributes
    }

    function updateDisplayedPrice() {
        if (!currentProduct || !productPriceElement) return;

        const selectedOptions = {};
        if (metalSelectElement && metalSelectElement.value) {
            selectedOptions.metal = metalSelectElement.value; // Normalized value e.g. "gold_18k"
        }
        if (sizeSelectElement && sizeSelectElement.value && sizeSelectElement.parentElement.style.display !== 'none') {
            selectedOptions.size = sizeSelectElement.value;
        }
        // if (stoneSelectElement && stoneSelectElement.value) {
        //     selectedOptions.stone = stoneSelectElement.value;
        // }

        // Use shared calculateItemPrice from common.js
        const calculatedPrice = calculateItemPrice(basePrice, selectedOptions, currentProduct.attributes);
        productPriceElement.textContent = formatCurrency(calculatedPrice);
    }

    if (addToCartButton) {
        addToCartButton.addEventListener('click', () => {
            if (!currentProduct) {
                alert("Product details not loaded yet. Please wait.");
                return;
            }

            const selectedOptionsForCart = {};
            if (metalSelectElement && metalSelectElement.value) {
                selectedOptionsForCart.metal = metalSelectElement.options[metalSelectElement.selectedIndex].text;
            }
            if (sizeSelectElement && sizeSelectElement.value && sizeSelectElement.parentElement.style.display !== 'none') {
                selectedOptionsForCart.size = sizeSelectElement.value;
            }
            // if (stoneSelectElement && stoneSelectElement.value) {
            //    selectedOptionsForCart.stone = stoneSelectElement.options[stoneSelectElement.selectedIndex].text;
            // }

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
                addToCart(productData); // From cart.js
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
