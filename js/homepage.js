// js/homepage.js
document.addEventListener('DOMContentLoaded', () => {
    // Hero Carousel
    const heroCarousel = document.getElementById('hero-carousel');
    if (heroCarousel) {
        const slides = heroCarousel.querySelectorAll('.hero-slide');
        const prevButton = document.getElementById('hero-prev');
        const nextButton = document.getElementById('hero-next');
        let currentSlide = 0;
        let slideInterval;

        function showSlide(index) {
            slides.forEach((slide, i) => {
                // For non-absolute positioned slides, toggle display
                // For absolute positioned slides for fade, toggle opacity & z-index
                slide.classList.toggle('active', i === index);
            });
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }
        function prevSlide() {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
        }

        if (slides.length > 1) {
            slideInterval = setInterval(nextSlide, 5500); // Auto-cycle
            if (prevButton) {
                prevButton.addEventListener('click', () => {
                    prevSlide();
                    clearInterval(slideInterval); // Optional: stop auto-cycle on manual nav
                    slideInterval = setInterval(nextSlide, 8000); // Restart with longer interval
                });
            }
            if (nextButton) {
                nextButton.addEventListener('click', () => {
                    nextSlide();
                    clearInterval(slideInterval); // Optional
                    slideInterval = setInterval(nextSlide, 8000);
                });
            }
            showSlide(0); // Show initial slide
        } else if (slides.length === 1) {
            showSlide(0); // Show the only slide
            if(prevButton) prevButton.style.display = 'none'; // Hide nav if only one slide
            if(nextButton) nextButton.style.display = 'none';
        }
    }

    // Populate New Arrivals
    const newArrivalsGrid = document.getElementById('new-arrivals-grid');
    const productCardTemplate = document.getElementById('product-card-template');
    const newArrivalsLoadingIndicator = document.getElementById('new-arrivals-loading-indicator');

    if (newArrivalsGrid && productCardTemplate && typeof fetchProducts === 'function' && typeof formatCurrency === 'function') {
        if(newArrivalsLoadingIndicator) newArrivalsLoadingIndicator.style.display = 'block';
        newArrivalsGrid.innerHTML = ''; // Clear before loading

        fetchProducts().then(allProducts => {
            const newProducts = allProducts.filter(p => (p.tags && p.tags.includes('new')) || p.isNew === true).slice(0, 4);

            if (newArrivalsLoadingIndicator) newArrivalsLoadingIndicator.style.display = 'none'; // Hide after fetch attempt

            if (newProducts.length > 0) {
                // newArrivalsGrid.innerHTML = ''; // Already cleared
                 newProducts.forEach(product => {
                    const cardClone = productCardTemplate.cloneNode(true);
                    cardClone.removeAttribute('id');
                    cardClone.style.display = ''; // Make it visible
                    cardClone.dataset.productId = product.id;

                    const productLink = `product-detail.html?id=${product.id}`;

                    const imageLink = cardClone.querySelector('.product-image-container a');
                    if(imageLink) imageLink.href = productLink;

                    const img = cardClone.querySelector('.product-image');
                    if(img){
                        img.src = product.imageUrls.thumbnail || product.imageUrls.main;
                        img.alt = product.name; // Dynamic Alt Text
                    }

                    const namePlaceholder = cardClone.querySelector('.product-name-placeholder');
                    if (namePlaceholder) {
                         const nameLinkElement = document.createElement('a');
                         nameLinkElement.href = productLink;
                         nameLinkElement.textContent = product.name;
                         nameLinkElement.classList.add('product-link'); // Keep consistent class if needed
                         namePlaceholder.replaceWith(nameLinkElement);
                    }

                    const priceEl = cardClone.querySelector('.product-price');
                    if(priceEl) priceEl.textContent = formatCurrency(product.basePrice);

                    const addToCartBtn = cardClone.querySelector('.add-to-cart-btn');
                    if(addToCartBtn) addToCartBtn.dataset.productId = product.id;

                    newArrivalsGrid.appendChild(cardClone);
                });
            } else {
                newArrivalsGrid.innerHTML = '<p>No new arrivals to display currently. Check back soon!</p>';
            }
        }).catch(error => {
            console.error("Error populating new arrivals:", error);
            newArrivalsGrid.innerHTML = '<p>Could not load new arrivals at this time.</p>';
        });
    } else {
        if (!newArrivalsGrid) console.warn("#new-arrivals-grid not found.");
        if (!productCardTemplate) console.warn("#product-card-template not found.");
        if (typeof fetchProducts !== 'function') console.warn("fetchProducts function not found (common.js missing or error).");
    }
});
