document.addEventListener('DOMContentLoaded', () => {
    const mainImageElement = document.getElementById('pdp-main-image');
    const thumbnailGalleryElement = document.getElementById('pdp-thumbnail-gallery');
    const productNameElement = document.getElementById('pdp-product-name');
    const productPriceElement = document.getElementById('pdp-product-price');
    const productDescriptionElement = document.getElementById('pdp-product-description');
    const sizeSelectElement = document.getElementById('pdp-size-select');
    const metalSelectElement = document.getElementById('pdp-metal-select');
    const quantityInput = document.getElementById('pdp-quantity');
    const addToCartButton = document.getElementById('pdp-add-to-cart-btn');

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        productNameElement.textContent = 'Product ID not found in URL.';
        // Hide other elements or show a clear error message
        document.querySelector('.product-detail-container').innerHTML = '<p style="text-align:center; font-size:1.2rem; color:red;">Sorry, product information is unavailable. Please ensure you have a valid product link.</p>';
        return;
    }

    fetchProducts()
        .then(products => {
            const product = products.find(p => p.id === productId);

            if (!product) {
                productNameElement.textContent = 'Product not found.';
                 document.querySelector('.product-detail-container').innerHTML = '<p style="text-align:center; font-size:1.2rem; color:red;">Sorry, the product you are looking for does not exist.</p>';
                return;
            }

            // Populate HTML elements
            document.title = `BlueStone - ${product.name}`; // Update page title
            if (mainImageElement) {
                mainImageElement.src = product.imageUrls.main;
                mainImageElement.alt = product.name;
            }

            if (thumbnailGalleryElement && product.imageUrls.gallery && product.imageUrls.gallery.length > 0) {
                thumbnailGalleryElement.innerHTML = ''; // Clear any placeholders
                product.imageUrls.gallery.forEach(imgUrl => {
                    const thumbImg = document.createElement('img');
                    thumbImg.src = imgUrl;
                    thumbImg.alt = `${product.name} thumbnail`;
                    thumbImg.style.width = '80px'; // Consistent styling
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
            if (productPriceElement) productPriceElement.textContent = `₹${product.basePrice.toLocaleString()}`;
            if (productDescriptionElement) productDescriptionElement.textContent = product.description;

            // Populate dropdowns (example for metals, extend for others like size, style if in JSON)
            if (sizeSelectElement) { // Generic sizes for now
                const sizes = product.attributes?.sizes || ["6", "7", "8", "9"]; // Example default sizes
                sizes.forEach(size => {
                    const option = document.createElement('option');
                    option.value = size;
                    option.textContent = `Size ${size}`;
                    sizeSelectElement.appendChild(option);
                });
            }

            if (metalSelectElement && product.attributes?.metals && product.attributes.metals.length > 0) {
                product.attributes.metals.forEach(metal => {
                    const option = document.createElement('option');
                    option.value = metal.toLowerCase().replace(/\s/g, '_');
                    option.textContent = metal;
                    metalSelectElement.appendChild(option);
                });
            } else if (metalSelectElement) {
                 const option = document.createElement('option');
                 option.value = "default";
                 option.textContent = "Standard Metal";
                 metalSelectElement.appendChild(option);
            }

            // Add to Cart functionality
            if (addToCartButton) {
                addToCartButton.addEventListener('click', () => {
                    const selectedSize = sizeSelectElement ? sizeSelectElement.value : null;
                    const selectedMetal = metalSelectElement ? metalSelectElement.value : null;
                    const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

                    const productData = {
                        id: product.id,
                        name: product.name,
                        price: product.basePrice, // Actual price might vary based on options
                        image: product.imageUrls.thumbnail || product.imageUrls.main,
                        quantity: quantity,
                        size: selectedSize,
                        metal: selectedMetal,
                        // Add other selected options here
                    };

                    // Assuming cart.js and its functions are globally available or imported
                    if (typeof addToCart === "function") {
                        addToCart(productData);
                        // Visual feedback
                        const originalText = addToCartButton.textContent;
                        addToCartButton.textContent = 'Added!';
                        addToCartButton.style.backgroundColor = '#4CAF50'; // Green for success
                        setTimeout(() => {
                            addToCartButton.textContent = originalText;
                            addToCartButton.style.backgroundColor = ''; // Revert to original style
                        }, 2000);
                    } else {
                        console.error("addToCart function is not defined. Ensure cart.js is loaded.");
                        alert("Could not add to cart. Functionality missing.");
                    }
                });
            }

        })
        .catch(error => {
            console.error('Error fetching or processing product details:', error);
            if (productNameElement) productNameElement.textContent = 'Error loading product details.';
             document.querySelector('.product-detail-container').innerHTML = '<p style="text-align:center; font-size:1.2rem; color:red;">An error occurred while loading product details. Please try again later.</p>';
        });
});
