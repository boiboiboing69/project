document.addEventListener('DOMContentLoaded', () => {
    // Tab switching logic (assuming it's still needed from previous version)
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    tabLinks.forEach(link => {
        link.addEventListener('click', () => {
            const tabId = link.getAttribute('data-tab');

            tabLinks.forEach(item => item.classList.remove('active'));
            tabContents.forEach(item => item.classList.remove('active'));

            link.classList.add('active');
            const activeTabContent = document.getElementById(tabId);
            if (activeTabContent) {
                activeTabContent.classList.add('active');
            }
        });
    });

    // AI Design Section Elements
    const aiRequestApprovalButton = document.getElementById('ai-request-approval');
    const aiAddToCartButton = document.getElementById('ai-add-to-cart');
    const aiStatusBadge = document.querySelector('#ai-design-tab .status-badge'); // More specific selector

    if (aiRequestApprovalButton && aiStatusBadge) {
        aiRequestApprovalButton.addEventListener('click', () => {
            console.log('AI Design - Approval Requested');
            aiStatusBadge.textContent = 'Approval Requested';
            aiStatusBadge.style.backgroundColor = '#f0ad4e'; // Orange for requested
            // Potentially disable button or change its text
            aiRequestApprovalButton.textContent = 'Requested';
            aiRequestApprovalButton.disabled = true;
        });
    }

    if (aiAddToCartButton) {
        aiAddToCartButton.addEventListener('click', () => {
            // Dummy product data for AI design
            const productData = {
                id: 'ai_design_' + Date.now(), // Unique ID for AI design
                name: document.getElementById('ai-generated-name') ? document.getElementById('ai-generated-name').textContent : 'AI Generated Design',
                price: parseFloat(document.getElementById('ai-total-price')?.textContent.replace('₹', '').replace(',', '') || 0),
                image: document.getElementById('ai-preview-image')?.style.backgroundImage?.slice(5, -2) || 'https://via.placeholder.com/100x100/FDF9F5/1E1E1E?text=AI+Design', // Placeholder if no image
                quantity: 1,
                // Add any other relevant details from AI inputs if available
            };

            if (typeof addToCart === "function") {
                addToCart(productData);
                // Visual feedback
                const originalText = aiAddToCartButton.textContent;
                aiAddToCartButton.textContent = 'Added!';
                aiAddToCartButton.classList.add('btn-success-feedback'); // Add a class for styling
                setTimeout(() => {
                    aiAddToCartButton.textContent = originalText;
                    aiAddToCartButton.classList.remove('btn-success-feedback');
                }, 2000);
            } else {
                console.error("addToCart function not defined. Ensure cart.js is loaded.");
                alert("Could not add AI design to cart. Functionality missing.");
            }
        });
    }

    // Custom Design Section Elements
    const customRequestApprovalButton = document.getElementById('custom-request-approval');
    const customAddToCartButton = document.getElementById('custom-add-to-cart');
    // Note: Custom design status badge isn't in HTML, add if needed or remove this line
    // const customStatusBadge = document.querySelector('#custom-design-tab .status-badge');

    if (customRequestApprovalButton) {
        customRequestApprovalButton.addEventListener('click', () => {
            console.log('Custom Design - Approval Requested');
            // Add similar status update logic if a status badge exists for custom designs
            customRequestApprovalButton.textContent = 'Requested';
            customRequestApprovalButton.disabled = true;
        });
    }

    if (customAddToCartButton) {
        customAddToCartButton.addEventListener('click', () => {
            // Dummy product data for custom design
            const metal = document.getElementById('metal-dropdown')?.value;
            const stone = document.getElementById('stone-dropdown')?.value;
            const style = document.getElementById('style-dropdown')?.value;

            const productData = {
                id: `custom_design_${metal}_${stone}_${style}_${Date.now()}`,
                name: `Custom Design (${metal}, ${stone}, ${style})`,
                price: parseFloat(document.getElementById('custom-total-price')?.textContent.replace('₹', '').replace(',', '') || 0),
                image: 'https://via.placeholder.com/100x100/FDF9F5/1E1E1E?text=Custom+Design', // Placeholder
                quantity: 1,
                metal: metal,
                stone: stone,
                style: style,
            };

            if (typeof addToCart === "function") {
                addToCart(productData);
                // Visual feedback
                const originalText = customAddToCartButton.textContent;
                customAddToCartButton.textContent = 'Added!';
                customAddToCartButton.classList.add('btn-success-feedback');
                setTimeout(() => {
                    customAddToCartButton.textContent = originalText;
                    customAddToCartButton.classList.remove('btn-success-feedback');
                }, 2000);
            } else {
                console.error("addToCart function not defined. Ensure cart.js is loaded.");
                alert("Could not add custom design to cart. Functionality missing.");
            }
        });
    }


    // Inspiration Gallery Population (Assuming fetchProducts is available from common.js)
    const inspirationGallery = document.querySelector('.inspiration-gallery');
    if (inspirationGallery && typeof fetchProducts === "function") {
        fetchProducts()
            .then(products => {
                inspirationGallery.innerHTML = ''; // Clear static placeholders
                const itemsToShow = products.slice(0, 5); // Show first 5 products as inspiration

                itemsToShow.forEach(product => {
                    const inspirationLink = document.createElement('a');
                    inspirationLink.href = `product-detail.html?id=${product.id}`;
                    inspirationLink.classList.add('inspiration-link'); // For minimal styling

                    const productCard = document.createElement('div');
                    productCard.classList.add('product-card', 'inspiration-item');
                    // data-product-id might be useful if we add interactions directly in the gallery
                    productCard.setAttribute('data-product-id', product.id);

                    productCard.innerHTML = `
                        <div class="product-image-container">
                            <img src="${product.imageUrls.thumbnail || product.imageUrls.main}" alt="${product.name}">
                        </div>
                        <div class="product-info">
                            <h3>${product.name}</h3>
                            <p class="product-price">₹${product.basePrice.toLocaleString()}</p>
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
        // Fallback if fetchProducts is not available, or keep static content.
        // For this task, we assume fetchProducts exists. If not, the static HTML would remain.
        console.warn("fetchProducts function not found, inspiration gallery might not be populated dynamically.");
    }
});
