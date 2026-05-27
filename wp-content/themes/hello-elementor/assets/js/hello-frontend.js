! function() {
    class e {
        constructor() {
            this.initSettings(), this.initElements(), this.bindEvents()
        }
        initSettings() {
            this.settings = {
                selectors: {
                    menuToggle: ".site-header .site-navigation-toggle",
                    menuToggleHolder: ".site-header .site-navigation-toggle-holder",
                    dropdownMenu: ".site-header .site-navigation-dropdown"
                }
            }
        }
        initElements() {
            this.elements = {
                window: window,
                menuToggle: document.querySelector(this.settings.selectors.menuToggle),
                menuToggleHolder: document.querySelector(this.settings.selectors.menuToggleHolder),
                dropdownMenu: document.querySelector(this.settings.selectors.dropdownMenu)
            }
        }
        bindEvents() {
            this.elements.menuToggleHolder && !this.elements.menuToggleHolder?.classList.contains("hide") && (this.elements.menuToggle.addEventListener("click", () => this.handleMenuToggle()), this.elements.dropdownMenu.querySelectorAll(".menu-item-has-children > a").forEach(e => e.addEventListener("click", e => this.handleMenuChildren(e))))
        }
        closeMenuItems() {
            this.elements.menuToggleHolder.classList.remove("elementor-active"), this.elements.window.removeEventListener("resize", () => this.closeMenuItems())
        }
        handleMenuToggle() {
            const e = !this.elements.menuToggleHolder.classList.contains("elementor-active");
            this.elements.menuToggle.setAttribute("aria-expanded", e), this.elements.dropdownMenu.setAttribute("aria-hidden", !e), this.elements.dropdownMenu.inert = !e, this.elements.menuToggleHolder.classList.toggle("elementor-active", e), this.elements.dropdownMenu.querySelectorAll(".elementor-active").forEach(e => e.classList.remove("elementor-active")), e ? this.elements.window.addEventListener("resize", () => this.closeMenuItems()) : this.elements.window.removeEventListener("resize", () => this.closeMenuItems())
        }
        handleMenuChildren(e) {
            const t = e.currentTarget.parentElement;
            t?.classList && t.classList.toggle("elementor-active")
        }
    }
    
    function initAvaPremiumProductPage() {
        const gallery = document.querySelector('.woocommerce-product-gallery');
        if (!gallery) return;

        // Force visibility
        gallery.style.opacity = '1';
        gallery.style.visibility = 'visible';

        const imageContainer = gallery.querySelector('.woocommerce-product-gallery__image');
        if (!imageContainer) return;

        const anchor = imageContainer.querySelector('a');
        if (!anchor) return;

        const mainImg = anchor.querySelector('img.wp-post-image');
        if (!mainImg) return;

        console.log("AVA Premium Chiller System Initializing Product Image Component...");

        // Strip srcset and sizes to prevent broken viewport requests
        mainImg.removeAttribute('srcset');
        mainImg.removeAttribute('sizes');

        // Create premium wrapper element inside original hierarchy
        let wrapper = imageContainer.querySelector('.ava-premium-image-wrapper');
        if (!wrapper) {
            wrapper = document.createElement('div');
            wrapper.className = 'ava-premium-image-wrapper';
            
            // Insert wrapper before anchor, then place anchor inside it to preserve DOM listeners
            anchor.parentNode.insertBefore(wrapper, anchor);
            wrapper.appendChild(anchor);
            
            // Add custom visual elements inside wrapper
            const glow = document.createElement('div');
            glow.className = 'ava-cinematic-glow';
            
            const skeleton = document.createElement('div');
            skeleton.className = 'ava-image-skeleton';
            
            const fallback = document.createElement('div');
            fallback.className = 'ava-fallback-placeholder';
            fallback.innerHTML = `
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <rect x="25" y="10" width="50" height="80" rx="6" ry="6" stroke="#40A2D8" stroke-width="1.5" fill="none" />
                    <rect x="30" y="15" width="40" height="70" rx="3" ry="3" stroke="#40A2D8" stroke-width="1" fill="none" opacity="0.7" />
                    <line x1="30" y1="33" x2="70" y2="33" stroke="#40A2D8" stroke-width="1" opacity="0.5" />
                    <line x1="30" y1="50" x2="70" y2="50" stroke="#40A2D8" stroke-width="1" opacity="0.5" />
                    <line x1="30" y1="67" x2="70" y2="67" stroke="#40A2D8" stroke-width="1" opacity="0.5" />
                    <line x1="34" y1="20" x2="34" y2="80" stroke="#40A2D8" stroke-width="1.5" opacity="0.3" />
                </svg>
                <div class="ava-fallback-title">AVA PREMIUM</div>
                <div class="ava-fallback-subtitle">Image Coming Soon</div>
            `;
            
            wrapper.appendChild(glow);
            wrapper.appendChild(skeleton);
            wrapper.appendChild(fallback);
        }

        // Configure mainImg styles
        mainImg.style.position = 'absolute';
        mainImg.style.top = '0';
        mainImg.style.left = '0';
        mainImg.style.width = '100%';
        mainImg.style.height = '100%';
        mainImg.style.objectFit = 'contain';

        // Set up loader flags and listeners
        let hasTriedFallback = false;

        mainImg.onload = function() {
            console.log("AVA Product Image loaded successfully: " + mainImg.src);
            wrapper.classList.remove('ava-error');
            wrapper.classList.add('ava-loaded');
            wrapper.style.pointerEvents = 'auto';
            anchor.style.display = 'block';
            imageContainer.style.pointerEvents = 'auto'; // Enable standard zoom trigger
        };

        mainImg.onerror = function() {
            console.warn("AVA Product Image load failed: " + mainImg.src);
            if (!hasTriedFallback) {
                hasTriedFallback = true;
                const fallbackSrc = mainImg.src.replace(/-[0-9]+x[0-9]+(\.[a-zA-Z0-9]+)$/, '$1');
                if (fallbackSrc !== mainImg.src) {
                    console.log("Triggering dynamic high-res fallback source: " + fallbackSrc);
                    mainImg.src = fallbackSrc;
                    
                    // Keep Zoom href & data structures in sync with resolved file
                    anchor.href = fallbackSrc;
                    mainImg.setAttribute('data-src', fallbackSrc);
                    mainImg.setAttribute('data-large_image', fallbackSrc);
                    return;
                }
            }
            wrapper.classList.remove('ava-loaded');
            wrapper.classList.add('ava-error');
            wrapper.style.pointerEvents = 'none';
            anchor.style.display = 'none'; // Hide broken image element
            imageContainer.style.pointerEvents = 'none'; // Disable standard zoom trigger
        };

        // Force reload trigger
        const originalSrc = mainImg.src;
        mainImg.src = '';
        mainImg.src = originalSrc;
    }

    function initAvaCarousels() {
        if (typeof Swiper === 'undefined') {
            console.log("AVA Premium Chiller System: Swiper library not loaded yet, retrying in 100ms...");
            setTimeout(initAvaCarousels, 100);
            return;
        }

        console.log("AVA Premium Chiller System: Swiper library detected, initializing premium carousels...");

        // 1. Loop Carousels (Featured Products, Posts, etc.)
        const loopCarousels = document.querySelectorAll('.elementor-widget-loop-carousel');
        loopCarousels.forEach(carousel => {
            const swiperContainer = carousel.querySelector('.elementor-loop-container.swiper') || carousel.querySelector('.elementor-loop-container');
            if (!swiperContainer) return;

            // Prevent double initialization
            if (swiperContainer.classList.contains('swiper-initialized')) return;

            // Remove grid classes that conflict with Swiper's flex-based slide styling
            swiperContainer.classList.remove('elementor-grid');

            // Move any style tags out of the swiper-wrapper so they don't break slide calculations
            const wrapper = swiperContainer.querySelector('.swiper-wrapper');
            if (wrapper) {
                const styleTags = wrapper.querySelectorAll('style');
                styleTags.forEach(style => {
                    swiperContainer.appendChild(style);
                });

                // Failsafe image resolver for statically crawled lazy images
                const lazyImages = wrapper.querySelectorAll('img[data-src]');
                lazyImages.forEach(img => {
                    img.src = img.getAttribute('data-src');
                    img.removeAttribute('data-src');
                    img.classList.remove('swiper-lazy');
                    
                    // Also find preloader element and remove it
                    const preloader = img.parentElement.querySelector('.swiper-lazy-preloader');
                    if (preloader) {
                        preloader.remove();
                    }
                });
            }

            // Parse settings
            let slidesPerView = 3;
            let slidesPerViewTablet = 2;
            let slidesPerViewMobile = 1;
            let spaceBetween = 10;
            let loop = true;
            let autoplay = true;
            let autoplaySpeed = 5000;
            let speed = 500;

            try {
                const settingsData = carousel.getAttribute('data-settings');
                if (settingsData) {
                    const settings = JSON.parse(settingsData);
                    slidesPerView = parseInt(settings.slides_to_show) || 3;
                    slidesPerViewTablet = parseInt(settings.slides_to_show_tablet) || 2;
                    slidesPerViewMobile = parseInt(settings.slides_to_show_mobile) || 1;
                    spaceBetween = (settings.image_spacing_custom && settings.image_spacing_custom.size !== undefined) ? parseInt(settings.image_spacing_custom.size) : 10;
                    loop = settings.infinite === 'yes';
                    autoplay = settings.autoplay === 'yes';
                    autoplaySpeed = parseInt(settings.autoplay_speed) || 5000;
                    speed = parseInt(settings.speed) || 500;
                }
            } catch (err) {
                console.warn("Could not parse settings for loop carousel:", err);
            }

            // Set up Swiper elements
            const prevEl = carousel.querySelector('.elementor-swiper-button-prev');
            const nextEl = carousel.querySelector('.elementor-swiper-button-next');
            const paginationEl = carousel.querySelector('.swiper-pagination');

            const config = {
                slidesPerView: slidesPerViewMobile,
                spaceBetween: spaceBetween,
                loop: loop,
                speed: speed,
                grabCursor: true,
                breakpoints: {
                    768: {
                        slidesPerView: slidesPerViewTablet,
                    },
                    1025: {
                        slidesPerView: slidesPerView,
                    }
                }
            };

            if (autoplay) {
                config.autoplay = {
                    delay: autoplaySpeed,
                    disableOnInteraction: false,
                };
            }

            if (prevEl && nextEl) {
                config.navigation = {
                    prevEl: prevEl,
                    nextEl: nextEl,
                };
            }

            if (paginationEl) {
                config.pagination = {
                    el: paginationEl,
                    clickable: true,
                };
            }

            new Swiper(swiperContainer, config);
            console.log("AVA: Initialized loop carousel successfully:", swiperContainer);
        });

        // 2. Image Carousels (Logos, Brands, etc.)
        const imageCarousels = document.querySelectorAll('.elementor-widget-image-carousel');
        imageCarousels.forEach(carousel => {
            const swiperContainer = carousel.querySelector('.elementor-image-carousel-wrapper.swiper') || carousel.querySelector('.elementor-image-carousel-wrapper');
            if (!swiperContainer) return;

            if (swiperContainer.classList.contains('swiper-initialized')) return;

            swiperContainer.classList.remove('elementor-grid');

            const wrapper = swiperContainer.querySelector('.swiper-wrapper');
            if (wrapper) {
                const styleTags = wrapper.querySelectorAll('style');
                styleTags.forEach(style => {
                    swiperContainer.appendChild(style);
                });

                // Failsafe image resolver for statically crawled lazy images
                const lazyImages = wrapper.querySelectorAll('img[data-src]');
                lazyImages.forEach(img => {
                    img.src = img.getAttribute('data-src');
                    img.removeAttribute('data-src');
                    img.classList.remove('swiper-lazy');

                    // Also find preloader element and remove it
                    const preloader = img.parentElement.querySelector('.swiper-lazy-preloader');
                    if (preloader) {
                        preloader.remove();
                    }
                });
            }

            // Parse settings
            let slidesPerView = 10;
            let slidesPerViewTablet = 5;
            let slidesPerViewMobile = 2;
            let spaceBetween = 20;
            let loop = true;
            let autoplay = true;
            let autoplaySpeed = 5000;
            let speed = 500;

            try {
                const settingsData = carousel.getAttribute('data-settings');
                if (settingsData) {
                    const settings = JSON.parse(settingsData);
                    slidesPerView = parseInt(settings.slides_to_show) || 10;
                    slidesPerViewTablet = parseInt(settings.slides_to_show_tablet) || 5;
                    slidesPerViewMobile = parseInt(settings.slides_to_show_mobile) || 2;
                    spaceBetween = (settings.image_spacing_custom && settings.image_spacing_custom.size !== undefined) ? parseInt(settings.image_spacing_custom.size) : 20;
                    loop = settings.infinite === 'yes';
                    autoplay = settings.autoplay === 'yes';
                    autoplaySpeed = parseInt(settings.autoplay_speed) || 5000;
                    speed = parseInt(settings.speed) || 500;
                }
            } catch (err) {
                console.warn("Could not parse settings for image carousel:", err);
            }

            const prevEl = carousel.querySelector('.elementor-swiper-button-prev');
            const nextEl = carousel.querySelector('.elementor-swiper-button-next');
            const paginationEl = carousel.querySelector('.swiper-pagination');

            const config = {
                slidesPerView: slidesPerViewMobile,
                spaceBetween: spaceBetween,
                loop: loop,
                speed: speed,
                grabCursor: true,
                breakpoints: {
                    768: {
                        slidesPerView: slidesPerViewTablet,
                    },
                    1025: {
                        slidesPerView: slidesPerView,
                    }
                }
            };

            if (autoplay) {
                config.autoplay = {
                    delay: autoplaySpeed,
                    disableOnInteraction: false,
                };
            }

            if (prevEl && nextEl) {
                config.navigation = {
                    prevEl: prevEl,
                    nextEl: nextEl,
                };
            }

            if (paginationEl) {
                config.pagination = {
                    el: paginationEl,
                    clickable: true,
                };
            }

            new Swiper(swiperContainer, config);
            console.log("AVA: Initialized image carousel successfully:", swiperContainer);
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        new e;
        initAvaPremiumProductPage();
        initAvaCarousels();
    });
}();