/**
 * AVA DISPLAY & STORAGE - Master UX/UI Cinematic Spatial Engine
 * Spatial dragging widget physics x Apple Light/Cinematic Focus Mode Transitions
 */
(function () {
    'use strict';

    /* ================================================================
       1. IMMERSIVE AMBIE CONTROL & ATMOSPHERIC INTRO SYSTEM
       ================================================================ */
    function initAtmosphere() {
        // Create Full-screen blurred intro transition overlay
        if (!document.querySelector('.ava-page-overlay')) {
            var overlay = document.createElement('div');
            overlay.className = 'ava-page-overlay';
            overlay.innerHTML = '<div class="ava-overlay-loader"></div>';
            document.body.appendChild(overlay);

            // Fade it out seamlessly once fully ready
            setTimeout(function () {
                overlay.classList.add('ava-fade-out');
                setTimeout(function () {
                    overlay.remove();
                }, 600);
            }, 300);
        }

        // Initialize Ambient particle system on parents
        var sections = document.querySelectorAll('.e-con.e-parent:not(.elementor-location-header)');
        sections.forEach(function (sec) {
            if (sec.closest('.elementor-location-header') || sec.closest('.elementor-location-footer')) return;
            if (sec.querySelector('.ava-ambient-container')) return;

            var ambient = document.createElement('div');
            ambient.className = 'ava-ambient-container';

            var grid = document.createElement('div');
            grid.className = 'ava-ambient-grid';
            ambient.appendChild(grid);

            var mesh1 = document.createElement('div');
            mesh1.className = 'ava-mesh-light ava-mesh-light-1';
            var mesh2 = document.createElement('div');
            mesh2.className = 'ava-mesh-light ava-mesh-light-2';
            ambient.appendChild(mesh1);
            ambient.appendChild(mesh2);

            var particles = document.createElement('div');
            particles.className = 'ava-particles-container';
            for (var i = 0; i < 8; i++) {
                var p = document.createElement('div');
                p.className = 'ava-particle';
                p.style.top = Math.random() * 100 + '%';
                p.style.left = Math.random() * 100 + '%';
                p.style.animationDelay = (Math.random() * -12) + 's';
                p.style.animationDuration = (8 + Math.random() * 6) + 's';
                particles.appendChild(p);
            }
            ambient.appendChild(particles);

            sec.insertBefore(ambient, sec.firstChild);
        });
    }

    /* ================================================================
       2. VISION PRO SPACE DRAGGING TELEMETRY PHYSICS ENGINE
       ================================================================ */
    function initSpatialTelemetry() {
        var hero = document.querySelector('.elementor-element-e532450');
        if (!hero && document.body.classList.contains('single-product')) {
            hero = document.querySelector('.elementor-element-e35fc5d > .e-con-inner');
        }
        if (!hero || hero.querySelector('.ava-telemetry-panel')) return;

        var panel = document.createElement('div');
        panel.className = 'ava-telemetry-panel';

        panel.innerHTML = 
            '<div class="ava-telemetry-header">' +
                '<span class="ava-telemetry-title">AVA Tech Diagnostic</span>' +
                '<div class="ava-telemetry-status"></div>' +
            '</div>' +
            '<div class="ava-telemetry-row">' +
                '<span class="ava-telemetry-label">CHAMBER TEMP:</span>' +
                '<span class="ava-telemetry-value" id="tele-temp">-18.2 °C</span>' +
            '</div>' +
            '<div class="ava-telemetry-row">' +
                '<span class="ava-telemetry-label">COMPRESSOR LOAD:</span>' +
                '<span class="ava-telemetry-value" id="tele-load">42.5 %</span>' +
            '</div>' +
            '<div class="ava-telemetry-row">' +
                '<span class="ava-telemetry-label">ENERGY DRAW:</span>' +
                '<span class="ava-telemetry-value" id="tele-energy">0.78 kW/h</span>' +
            '</div>' +
            '<div class="ava-telemetry-row">' +
                '<span class="ava-telemetry-label">FLOW SPEED:</span>' +
                '<span class="ava-telemetry-value" style="color:#00FF66; font-weight:800;">1.4 m/s</span>' +
            '</div>';

        hero.appendChild(panel);

        // Fluctuate stats
        setInterval(function () {
            var temp = (-18.0 - Math.random() * 0.5).toFixed(1);
            var load = (40.0 + Math.random() * 5).toFixed(1);
            var energy = (0.75 + Math.random() * 0.06).toFixed(2);

            var tempEl = document.getElementById('tele-temp');
            var loadEl = document.getElementById('tele-load');
            var energyEl = document.getElementById('tele-energy');

            if (tempEl) tempEl.textContent = temp + ' °C';
            if (loadEl) loadEl.textContent = load + ' %';
            if (energyEl) energyEl.textContent = energy + ' kW/h';
        }, 3000);

        // Spatial drag mechanics with SpringSnapping and Inertia
        var isDragging = false;
        var startX = 0, startY = 0;
        var vx = 0, vy = 0;
        var lastMouseX = 0, lastMouseY = 0;
        var lastTime = 0;
        var animationFrameId = null;

        panel.style.position = 'fixed';
        panel.style.bottom = '100px';
        panel.style.right = '40px';
        panel.style.left = 'auto';
        panel.style.top = 'auto';
        panel.style.cursor = 'grab';
        panel.style.touchAction = 'none';

        panel.addEventListener('pointerdown', function (e) {
            // Prevent interference with input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
            isDragging = true;
            panel.style.cursor = 'grabbing';
            panel.style.transition = 'none';
            panel.style.boxShadow = '0 32px 80px rgba(64, 162, 216, 0.35)';
            
            var rect = panel.getBoundingClientRect();
            startX = e.clientX - rect.left;
            startY = e.clientY - rect.top;
            
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            lastTime = Date.now();
            vx = 0;
            vy = 0;
            
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            
            panel.setPointerCapture(e.pointerId);
        });

        panel.addEventListener('pointermove', function (e) {
            if (!isDragging) return;
            
            var x = e.clientX - startX;
            var y = e.clientY - startY;
            
            var maxX = window.innerWidth - panel.offsetWidth;
            var maxY = window.innerHeight - panel.offsetHeight;
            x = Math.max(0, Math.min(x, maxX));
            y = Math.max(0, Math.min(y, maxY));
            
            panel.style.left = x + 'px';
            panel.style.top = y + 'px';
            panel.style.bottom = 'auto';
            panel.style.right = 'auto';
            
            var now = Date.now();
            var dt = now - lastTime;
            if (dt > 0) {
                vx = (e.clientX - lastMouseX) / dt * 16.66;
                vy = (e.clientY - lastMouseY) / dt * 16.66;
            }
            
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            lastTime = now;
        });

        panel.addEventListener('pointerup', function (e) {
            if (!isDragging) return;
            isDragging = false;
            panel.style.cursor = 'grab';
            panel.releasePointerCapture(e.pointerId);
            
            startMomentumAndSnap();
        });

        function startMomentumAndSnap() {
            var friction = 0.92;
            var snapThreshold = 180;
            
            function step() {
                if (isDragging) return;
                
                var rect = panel.getBoundingClientRect();
                var x = rect.left + vx;
                var y = rect.top + vy;
                
                vx *= friction;
                vy *= friction;
                
                var maxX = window.innerWidth - panel.offsetWidth;
                var maxY = window.innerHeight - panel.offsetHeight;
                
                var snapForce = 0.15;
                
                var distLeft = x;
                var distRight = maxX - x;
                var distTop = y;
                var distBottom = maxY - y;
                
                // Snap triggers
                if (distLeft < snapThreshold && distLeft < distRight) {
                    vx += (20 - x) * snapForce;
                } else if (distRight < snapThreshold) {
                    vx += (maxX - 20 - x) * snapForce;
                }
                
                if (distTop < snapThreshold && distTop < distBottom) {
                    vy += (20 - y) * snapForce;
                } else if (distBottom < snapThreshold) {
                    vy += (maxY - 20 - y) * snapForce;
                }
                
                x = Math.max(0, Math.min(x, maxX));
                y = Math.max(0, Math.min(y, maxY));
                
                panel.style.left = x + 'px';
                panel.style.top = y + 'px';
                
                if (Math.abs(vx) < 0.05 && Math.abs(vy) < 0.05) {
                    panel.style.boxShadow = '';
                    panel.style.transition = 'box-shadow 0.3s ease';
                    return;
                }
                
                animationFrameId = requestAnimationFrame(step);
            }
            
            animationFrameId = requestAnimationFrame(step);
        }
    }

    /* ================================================================
       3. INTERACTIVE SPOTLIGHT MOUSE-FOLLOW COORDINATES
       ================================================================ */
    function initCardSpotlight() {
        var targets = document.querySelectorAll(
            '.swiper-slide .elementor-element-cc6de85, ' +
            '.elementor-element-0b8252a .elementor-image-box-wrapper, ' +
            '.woocommerce ul.products li.product, ' +
            '.woocommerce-product-gallery'
        );

        targets.forEach(function (card) {
            card.addEventListener('mousemove', function (e) {
                var bound = card.getBoundingClientRect();
                var x = ((e.clientX - bound.left) / bound.width) * 100;
                var y = ((e.clientY - bound.top) / bound.height) * 100;

                card.style.setProperty('--mouse-x', x + '%');
                card.style.setProperty('--mouse-y', y + '%');
            });
        });
    }

    /* ================================================================
       4. SCROLL INTERSECTION REVEAL ENGINES
       ================================================================ */
    function initScrollReveal() {
        var items = document.querySelectorAll('.e-con.e-parent:not(.elementor-element-757e007)');
        items.forEach(function (it) {
            if (it.closest('.elementor-location-header') || it.closest('.elementor-location-footer')) return;
            it.classList.add('ava-reveal');
        });

        if (typeof IntersectionObserver === 'undefined') {
            forceRevealAll();
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('ava-revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.01, rootMargin: '0px 0px 100px 0px' });

        document.querySelectorAll('.ava-reveal:not(.ava-revealed)').forEach(function (el) {
            observer.observe(el);
        });
    }

    /* ================================================================
       4b. MOBILE NAV DROPDOWN TOGGLE INTERCEPTOR
       ================================================================ */
    function initMobileDropdownToggle() {
        var parentLinks = document.querySelectorAll('.elementor-location-header .menu-item-has-children > a, .elementor-location-header .elementor-item-has-children > a');
        parentLinks.forEach(function (link) {
            link.addEventListener('click', function (e) {
                var href = link.getAttribute('href');
                if (href === '#' || href === '' || href === 'javascript:void(0)') {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    var parentLi = link.parentElement;
                    var subMenu = parentLi.querySelector('.sub-menu, .elementor-nav-menu--dropdown');
                    
                    parentLi.classList.toggle('sub-menu-active');
                    if (subMenu) {
                        if (subMenu.style.display === 'block') {
                            subMenu.style.display = 'none';
                        } else {
                            subMenu.style.display = 'block';
                            subMenu.style.opacity = '1';
                            subMenu.style.visibility = 'visible';
                        }
                    }
                }
            });
        });
    }

    /* ================================================================
       5. MAGNETIC BUTTONS FOR UNPARALLELED HOVER POLISH
       ================================================================ */
    function initMagneticCTAs() {
        if (window.innerWidth < 768) return;

        var btns = document.querySelectorAll('.elementor-button, .uc_more_btn, .add-request-quote-button');
        btns.forEach(function (btn) {
            btn.addEventListener('mousemove', function (e) {
                var bound = btn.getBoundingClientRect();
                var x = e.clientX - bound.left - (bound.width / 2);
                var y = e.clientY - bound.top - (bound.height / 2);

                btn.style.transform = 'translate(' + (x * 0.18) + 'px, ' + (y * 0.18) + 'px) scale(1.03)';
                btn.style.transition = 'transform 0.1s ease-out';
            });

            btn.addEventListener('mouseleave', function () {
                btn.style.transform = '';
                btn.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
            });
        });
    }

    /* ================================================================
       6. 3D CARD PERSPECTIVE TILT MECHANICAL ENGINE
       ================================================================ */
    function initCardTilt() {
        if (window.innerWidth < 1024) return;

        var cards = document.querySelectorAll(
            '.swiper-slide .elementor-element-cc6de85, ' +
            '.elementor-element-0b8252a .elementor-image-box-wrapper, ' +
            '.woocommerce ul.products li.product, ' +
            '.woocommerce-product-gallery'
        );

        cards.forEach(function (card) {
            card.addEventListener('mousemove', function (e) {
                var bound = card.getBoundingClientRect();
                var x = e.clientX - bound.left;
                var y = e.clientY - bound.top;

                var tiltX = ((bound.height / 2) - y) / (bound.height / 2) * 3; 
                var tiltY = (x - (bound.width / 2)) / (bound.width / 2) * 3;   

                card.style.transform = 'perspective(1000px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg) translateY(-6px)';
                card.style.transition = 'transform 0.08s ease-out';
            });

            card.addEventListener('mouseleave', function () {
                card.style.transform = '';
                card.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
            });
        });
    }

    /* ================================================================
       7. GLASSMORPHIC SCROLL NAV RESPONSIVENESS
       ================================================================ */
    function initNavbarScroll() {
        var header = document.querySelector('.elementor-location-header');
        if (!header) return;

        var ticking = false;
        function update() {
            if (window.scrollY > 40) {
                header.classList.add('ava-navbar-scrolled');
            } else {
                header.classList.remove('ava-navbar-scrolled');
            }
            ticking = false;
        }

        window.addEventListener('scroll', function () {
            if (!ticking) {
                requestAnimationFrame(update);
                ticking = true;
            }
        }, { passive: true });

        update();
    }

    /* ================================================================
       8. INTERACTIVE GLASS PRODUCT CARD CLICK ROUTER
       ================================================================ */
    function initProductCardClicks() {
        var productCards = document.querySelectorAll('.elementor-element-cf8cf0e .elementor-element-cc6de85');
        productCards.forEach(function (card) {
            var link = card.querySelector('a.elementor-button');
            if (!link) return;
            var url = link.getAttribute('href');
            if (!url) return;
            
            card.style.cursor = 'pointer';
            card.addEventListener('click', function (e) {
                // Let native link clicks work directly
                if (e.target.closest('a')) return;
                
                e.preventDefault();
                window.location.href = url;
            });
        });
    }

    function forceRevealAll() {
        document.querySelectorAll('.ava-reveal:not(.ava-revealed)').forEach(function (el) {
            el.classList.add('ava-revealed');
        });
    }

    /* ================================================================
       9. PREMIUM SPATIAL QUOTE REQUEST CART & SIDE DRAWER ENGINE
       ================================================================ */
    var QUOTE_CSS = `
        /* Premium Glassmorphic Backdrop */
        .ava-quote-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(4, 8, 16, 0.4);
            backdrop-filter: blur(16px) saturate(120%);
            -webkit-backdrop-filter: blur(16px) saturate(120%);
            z-index: 999998;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .ava-quote-backdrop.ava-visible {
            opacity: 1;
            pointer-events: auto;
        }

        /* Premium Right-side Slide Panel */
        .ava-quote-drawer {
            position: fixed;
            top: 0;
            right: -450px;
            width: 450px;
            height: 100vh;
            background: rgba(8, 15, 28, 0.85);
            backdrop-filter: blur(35px) saturate(190%);
            -webkit-backdrop-filter: blur(35px) saturate(190%);
            border-left: 1px solid rgba(120, 200, 255, 0.18);
            box-shadow: -20px 0 60px rgba(0, 0, 0, 0.7);
            z-index: 999999;
            display: flex;
            flex-direction: column;
            transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            will-change: transform;
        }
        .ava-quote-drawer.ava-open {
            transform: translate3d(-450px, 0, 0);
        }

        /* Drawer Header */
        .ava-drawer-header {
            padding: 24px;
            border-bottom: 1px solid rgba(120, 200, 255, 0.12);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .ava-drawer-header h2 {
            font-size: 20px;
            font-weight: 700;
            color: #ffffff;
            letter-spacing: 0.5px;
            margin: 0;
            text-shadow: 0 0 10px rgba(64, 162, 216, 0.3);
        }
        .ava-drawer-close {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #ffffff;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            transition: all 0.25s ease;
        }
        .ava-drawer-close:hover {
            background: rgba(255, 255, 255, 0.15);
            border-color: rgba(64, 162, 216, 0.5);
            box-shadow: 0 0 8px rgba(64, 162, 216, 0.4);
            transform: scale(1.05);
        }

        /* Products List Area */
        .ava-drawer-products {
            flex: 1;
            overflow-y: auto;
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        .ava-drawer-products::-webkit-scrollbar {
            width: 6px;
        }
        .ava-drawer-products::-webkit-scrollbar-thumb {
            background: rgba(120, 200, 255, 0.15);
            border-radius: 3px;
        }

        /* Empty Cart State */
        .ava-empty-cart {
            text-align: center;
            margin: auto 0;
            padding: 20px;
        }
        .ava-empty-cart p {
            color: rgba(255, 255, 255, 0.5);
            font-size: 14px;
            margin-bottom: 24px;
        }
        .ava-browse-shop-btn {
            display: inline-block;
            padding: 12px 24px;
            background: rgba(64, 162, 216, 0.15);
            border: 1px solid rgba(64, 162, 216, 0.4);
            color: #ffffff;
            border-radius: 30px;
            font-size: 13px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s ease;
            box-shadow: 0 0 10px rgba(64, 162, 216, 0.1);
        }
        .ava-browse-shop-btn:hover {
            background: rgba(64, 162, 216, 0.35);
            border-color: rgba(64, 162, 216, 0.7);
            box-shadow: 0 0 15px rgba(64, 162, 216, 0.4);
            transform: translateY(-2px);
        }

        /* Individual Cart Item */
        .ava-cart-item {
            background: rgba(10, 18, 30, 0.4);
            border: 1px solid rgba(120, 200, 255, 0.1);
            border-radius: 16px;
            padding: 16px;
            display: flex;
            gap: 16px;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .ava-cart-item:hover {
            background: rgba(10, 18, 30, 0.55);
            border-color: rgba(120, 200, 255, 0.25);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 0 15px rgba(64, 162, 216, 0.15);
            transform: translateY(-2px);
        }
        .ava-cart-item-img {
            width: 64px;
            height: 64px;
            object-fit: contain;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 12px;
            padding: 4px;
        }
        .ava-cart-item-details {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .ava-cart-item-name {
            font-size: 15px;
            font-weight: 600;
            color: #ffffff;
            margin: 0;
            line-height: 1.3;
        }
        .ava-cart-item-model {
            font-size: 12px;
            color: rgba(64, 162, 216, 0.85);
            margin: 0;
            font-family: monospace;
            font-weight: 500;
        }
        .ava-cart-item-controls {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 6px;
        }

        /* Quantity Selector */
        .ava-qty-selector {
            display: flex;
            align-items: center;
            background: rgba(0, 0, 0, 0.35);
            border: 1px solid rgba(120, 200, 255, 0.15);
            border-radius: 8px;
            overflow: hidden;
        }
        .ava-qty-btn {
            background: transparent;
            border: none;
            color: #ffffff;
            width: 28px;
            height: 28px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s ease;
        }
        .ava-qty-btn:hover {
            background: rgba(255, 255, 255, 0.08);
            color: rgba(64, 162, 216, 1);
        }
        .ava-qty-value {
            color: #ffffff;
            font-size: 13px;
            font-weight: 700;
            padding: 0 10px;
            min-width: 16px;
            text-align: center;
        }
        .ava-remove-item {
            background: transparent;
            border: none;
            color: rgba(255, 100, 100, 0.7);
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 6px;
            transition: all 0.2s ease;
        }
        .ava-remove-item:hover {
            color: rgba(255, 100, 100, 1);
            background: rgba(255, 100, 100, 0.08);
        }

        /* Footer & Form Section */
        .ava-drawer-footer {
            padding: 24px;
            border-top: 1px solid rgba(120, 200, 255, 0.12);
            background: rgba(6, 11, 20, 0.95);
            box-shadow: 0 -10px 30px rgba(0,0,0,0.5);
        }
        .ava-drawer-total {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 20px;
        }
        #ava-total-count {
            font-size: 18px;
            font-weight: 800;
            color: #ffffff;
            text-shadow: 0 0 8px rgba(64, 162, 216, 0.5);
        }

        /* Inquiry Form */
        .ava-inquiry-form {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .ava-form-group {
            position: relative;
        }
        .ava-inquiry-form input, .ava-inquiry-form textarea {
            width: 100%;
            background: rgba(0, 0, 0, 0.35);
            border: 1px solid rgba(120, 200, 255, 0.18);
            border-radius: 10px;
            color: #ffffff;
            padding: 12px 14px;
            font-size: 13.5px;
            box-sizing: border-box;
            transition: all 0.3s ease;
        }
        .ava-inquiry-form input:focus, .ava-inquiry-form textarea:focus {
            outline: none;
            border-color: rgba(64, 162, 216, 0.85);
            background: rgba(0, 0, 0, 0.5);
            box-shadow: 0 0 12px rgba(64, 162, 216, 0.35);
        }
        .ava-inquiry-form textarea {
            resize: none;
        }
        .ava-submit-quote {
            background: linear-gradient(135deg, rgba(64, 162, 216, 0.85), rgba(64, 162, 216, 0.65));
            border: 1px solid rgba(120, 200, 255, 0.3);
            color: #ffffff;
            padding: 14px;
            border-radius: 30px;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4), 0 0 10px rgba(64, 162, 216, 0.2);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
        }
        .ava-submit-quote:hover {
            transform: translateY(-2px);
            background: linear-gradient(135deg, rgba(64, 162, 216, 1), rgba(64, 162, 216, 0.8));
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5), 0 0 18px rgba(64, 162, 216, 0.5);
        }
        .ava-submit-quote:active {
            transform: translateY(1px);
        }

        /* Floating Launcher Capsule */
        .ava-quote-launcher {
            position: fixed;
            bottom: 110px;
            right: 30px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: rgba(10, 18, 30, 0.7);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            border: 1px solid rgba(120, 200, 255, 0.22);
            box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6), 0 0 20px rgba(64, 162, 216, 0.25);
            z-index: 99999;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .ava-quote-launcher:hover {
            transform: translateY(-5px) scale(1.04);
            border-color: rgba(64, 162, 216, 0.6);
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7), 0 0 25px rgba(64, 162, 216, 0.45);
        }
        .ava-launcher-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s ease;
        }
        .ava-quote-launcher:hover .ava-launcher-icon {
            transform: rotate(-10deg) scale(1.05);
        }
        .ava-launcher-badge {
            position: absolute;
            top: -4px;
            right: -4px;
            background: linear-gradient(135deg, #00FF66, #00CC55);
            color: #000000;
            font-size: 11px;
            font-weight: 900;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 10px rgba(0, 255, 102, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.3);
        }

        /* Success add state */
        .add-request-quote-button.ava-btn-added {
            background: #00FF66 !important;
            border-color: #00FF66 !important;
            color: #000000 !important;
            box-shadow: 0 0 20px rgba(0, 255, 102, 0.7) !important;
            font-weight: 800 !important;
        }

        /* Injected button styling inside slider cards */
        .ava-featured-quote-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 10px 20px !important;
            margin-top: 12px !important;
            font-size: 13px !important;
            font-weight: 700 !important;
            color: #ffffff !important;
            background: rgba(64, 162, 216, 0.15) !important;
            border: 1px solid rgba(64, 162, 216, 0.4) !important;
            border-radius: 30px !important;
            text-decoration: none !important;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
            width: 100% !important;
            box-sizing: border-box !important;
            cursor: pointer !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
            box-shadow: 0 0 10px rgba(64, 162, 216, 0.05) !important;
        }
        .ava-featured-quote-btn:hover {
            background: rgba(64, 162, 216, 0.45) !important;
            border-color: rgba(64, 162, 216, 0.8) !important;
            box-shadow: 0 0 15px rgba(64, 162, 216, 0.5) !important;
            transform: translateY(-2px) !important;
        }
        .ava-featured-quote-btn:active {
            transform: translateY(1px) !important;
        }

        @keyframes avaPulseBadge {
            0% { transform: scale(1); box-shadow: 0 0 10px rgba(0, 255, 102, 0.6); }
            50% { transform: scale(1.15); box-shadow: 0 0 18px rgba(0, 255, 102, 0.9); }
            100% { transform: scale(1); box-shadow: 0 0 10px rgba(0, 255, 102, 0.6); }
        }
        .ava-pulse {
            animation: avaPulseBadge 2s infinite ease-in-out;
        }

        /* Mobile Responsiveness Rules */
        @media (max-width: 480px) {
            .ava-quote-drawer {
                width: 100vw;
                right: -100vw;
                border-left: none;
            }
            .ava-quote-drawer.ava-open {
                transform: translate3d(-100vw, 0, 0);
            }
            .ava-quote-launcher {
                bottom: 95px;
                right: 20px;
                width: 54px;
                height: 54px;
            }
        }
    `;

    function getCart() {
        try {
            return JSON.parse(localStorage.getItem('ava_quote_cart')) || [];
        } catch (e) {
            return [];
        }
    }

    function saveCart(cart) {
        localStorage.setItem('ava_quote_cart', JSON.stringify(cart));
        updateUI();
    }

    function openDrawer() {
        var drawer = document.getElementById('ava-quote-drawer');
        var backdrop = document.getElementById('ava-quote-backdrop');
        if (drawer && backdrop) {
            drawer.classList.add('ava-open');
            backdrop.classList.add('ava-visible');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeDrawer() {
        var drawer = document.getElementById('ava-quote-drawer');
        var backdrop = document.getElementById('ava-quote-backdrop');
        if (drawer && backdrop) {
            drawer.classList.remove('ava-open');
            backdrop.classList.remove('ava-visible');
            document.body.style.overflow = '';
        }
    }

    function toggleDrawer() {
        var drawer = document.getElementById('ava-quote-drawer');
        if (drawer) {
            if (drawer.classList.contains('ava-open')) {
                closeDrawer();
            } else {
                openDrawer();
            }
        }
    }

    window.changeQty = function(id, delta) {
        var cart = getCart();
        var item = cart.find(function (x) { return x.id === id; });
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                cart = cart.filter(function (x) { return x.id !== id; });
            }
            saveCart(cart);
        }
    };

    window.removeFromCart = function(id) {
        var cart = getCart();
        cart = cart.filter(function (x) { return x.id !== id; });
        saveCart(cart);
    };

    function updateUI() {
        var cart = getCart();
        var totalCount = cart.reduce(function (sum, item) { return sum + item.quantity; }, 0);
        
        var badge = document.getElementById('ava-launcher-badge');
        if (badge) {
            badge.textContent = totalCount;
            if (totalCount > 0) {
                badge.style.display = 'flex';
                badge.classList.add('ava-pulse');
            } else {
                badge.style.display = 'none';
                badge.classList.remove('ava-pulse');
            }
        }

        var navLinks = document.querySelectorAll('a[href*="/request-quote/"], a[href*="/request-a-quote/"]');
        navLinks.forEach(function (link) {
            var textSpan = link.querySelector('.elementor-button-text') || link;
            textSpan.innerHTML = 'Quote Request (' + totalCount + ')';
            
            if (!link.classList.contains('ava-nav-intercepted')) {
                link.classList.add('ava-nav-intercepted');
                link.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    openDrawer();
                });
            }
        });

        var totalCountEl = document.getElementById('ava-total-count');
        if (totalCountEl) {
            totalCountEl.textContent = totalCount;
        }

        var listContainer = document.getElementById('ava-drawer-products');
        if (!listContainer) return;

        if (cart.length === 0) {
            listContainer.innerHTML = 
                '<div class="ava-empty-cart">' +
                    '<p>Your Quote Request list is currently empty.</p>' +
                    '<a href="/shop/" class="ava-browse-shop-btn">Browse Shop</a>' +
                '</div>';
            var form = document.getElementById('ava-inquiry-form');
            if (form) form.style.display = 'none';
            return;
        }

        var form = document.getElementById('ava-inquiry-form');
        if (form) form.style.display = 'block';

        var html = '';
        cart.forEach(function (item) {
            html += 
                '<div class="ava-cart-item" data-id="' + item.id + '">' +
                    '<img src="' + item.image + '" alt="' + item.name + '" class="ava-cart-item-img" />' +
                    '<div class="ava-cart-item-details">' +
                        '<h4 class="ava-cart-item-name">' + item.name + '</h4>' +
                        '<p class="ava-cart-item-model">' + item.slug + '</p>' +
                        '<div class="ava-cart-item-controls">' +
                            '<div class="ava-qty-selector">' +
                                '<button class="ava-qty-btn ava-qty-minus" onclick="changeQty(\'' + item.id + '\', -1)">-</button>' +
                                '<span class="ava-qty-value">' + item.quantity + '</span>' +
                                '<button class="ava-qty-btn ava-qty-plus" onclick="changeQty(\'' + item.id + '\', 1)">+</button>' +
                            '</div>' +
                            '<button class="ava-remove-item" onclick="removeFromCart(\'' + item.id + '\')">Remove</button>' +
                        '</div>' +
                    '</div>' +
                '</div>';
        });
        listContainer.innerHTML = html;
    }

    function extractProductDetails(btn) {
        var id = btn.getAttribute('data-product_id') || '0';
        var name = '';
        var slug = '';
        var image = '';
        var category = 'Commercial Refrigeration';
        var specs = 'Standard Model';

        var isSingleProduct = document.body.classList.contains('single-product');
        var mainProductBtn = document.querySelector('.elementor-widget-yith-ywraq-button-quote .add-request-quote-button');
        
        if (isSingleProduct && mainProductBtn && mainProductBtn.getAttribute('data-product_id') === id) {
            var titleEl = document.querySelector('h1.elementor-heading-title') || document.querySelector('.product_title');
            name = titleEl ? titleEl.innerText.trim() : 'Product';
            slug = window.location.pathname.split('/').filter(Boolean).pop() || '';
            
            var imgEl = document.querySelector('.woocommerce-product-gallery__image img') || document.querySelector('.wp-post-image');
            var imgSrc = imgEl ? (imgEl.getAttribute('src') || imgEl.getAttribute('data-src')) : '';
            if (imgSrc) {
                try {
                    var urlObj = new URL(imgSrc, window.location.origin);
                    image = urlObj.pathname;
                } catch (err) {
                    image = imgSrc;
                }
            }
            
            var contentEl = document.querySelector('.elementor-widget-woocommerce-product-content') || document.querySelector('.woocommerce-product-details__short-description');
            specs = contentEl ? contentEl.innerText.trim() : '';
            
            var breadcrumbs = document.querySelector('#breadcrumbs');
            if (breadcrumbs) {
                var links = breadcrumbs.querySelectorAll('a');
                if (links.length > 2) {
                    category = links[2].innerText.trim();
                }
            }
        } else {
            var card = btn.closest('.product') || btn.closest('.elementor-element-cc6de85') || btn.closest('.e-loop-item');
            if (card) {
                var titleEl = card.querySelector('.woocommerce-loop-product__title') || card.querySelector('.elementor-heading-title') || card.querySelector('h2');
                name = titleEl ? titleEl.innerText.trim() : 'Product';
                
                var linkEl = card.querySelector('a.woocommerce-LoopProduct-link') || card.querySelector('a.elementor-button') || card.querySelector('a');
                if (linkEl) {
                    var href = linkEl.getAttribute('href') || '';
                    slug = href.split('/').filter(Boolean).pop() || '';
                }
                
                var imgEl = card.querySelector('img');
                if (imgEl) {
                    var imgSrc = imgEl.getAttribute('src') || imgEl.getAttribute('data-src') || '';
                    if (imgSrc) {
                        try {
                            var urlObj = new URL(imgSrc, window.location.origin);
                            image = urlObj.pathname;
                        } catch (err) {
                            image = imgSrc;
                        }
                    }
                } else {
                    var showcase = card.querySelector('.elementor-element-8486354');
                    if (showcase) {
                        var style = window.getComputedStyle(showcase);
                        var bg = style.backgroundImage || '';
                        var match = bg.match(/url\((['"]?)(.*?)\1\)/);
                        if (match && match[2]) {
                            try {
                                var urlObj = new URL(match[2], window.location.origin);
                                image = urlObj.pathname;
                            } catch (err) {
                                image = match[2];
                            }
                        }
                    }
                }
                specs = 'Standard Model';
            } else {
                name = 'Product ' + id;
                slug = 'product-' + id;
            }
        }

        if (!image) {
            image = '/wp-content/uploads/2025/05/ava-logo.webp';
        }

        return {
            id: id,
            slug: slug,
            name: name,
            image: image,
            category: category,
            specs: specs,
            quantity: 1
        };
    }

    function addToQuote(btn) {
        var product = extractProductDetails(btn);
        var cart = getCart();
        var existing = cart.find(function (item) { return item.id === product.id; });
        
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push(product);
        }
        
        saveCart(cart);
        
        var origHTML = btn.innerHTML;
        btn.innerHTML = '<span>Added ✓</span>';
        btn.classList.add('ava-btn-added');
        
        setTimeout(function() {
            btn.innerHTML = origHTML;
            btn.classList.remove('ava-btn-added');
        }, 2000);
        
        openDrawer();
    }

    function submitQuoteForm(e) {
        e.preventDefault();
        
        var name = document.getElementById('ava-form-name').value.trim();
        var business = document.getElementById('ava-form-business').value.trim();
        var phone = document.getElementById('ava-form-phone').value.trim();
        var email = document.getElementById('ava-form-email').value.trim();
        var notes = document.getElementById('ava-form-notes').value.trim();
        
        var cart = getCart();
        if (cart.length === 0) {
            alert('Your quote list is empty!');
            return;
        }
        
        var msg = "Hello AVA Display Storage,\n\nI would like a quotation for:\n\n";
        cart.forEach(function (item, index) {
            msg += (index + 1) + ". " + item.name + " (" + item.slug + ") — Qty: " + item.quantity + "\n";
        });
        
        msg += "\nName: " + name;
        msg += "\nBusiness: " + business;
        msg += "\nPhone: " + phone;
        msg += "\nEmail: " + email;
        if (notes) {
            msg += "\nNotes: " + notes;
        }
        
        msg += "\n\nPlease contact me.";
        
        // Show submission loading state on the button
        var submitBtn = document.getElementById('ava-submit-quote');
        var origBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Saving Quote Lead...</span>';
        submitBtn.disabled = true;

        var payload = {
            type: "quote",
            name: name,
            business: business,
            phone: phone,
            email: email,
            notes: notes,
            cart: cart
        };

        // Fire-and-forget style fetch with a fast timeout (5 seconds) as safety fallback
        var fetchTimeout = new Promise(function (resolve, reject) {
            setTimeout(resolve, 5000, { success: false, timeout: true });
        });

        var savePromise = fetch("/api/submit-form/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })
        .then(function (res) { return res.json(); })
        .catch(function (err) {
            console.error('Supabase lead save failed:', err);
            return { success: false, error: err.message };
        });

        Promise.race([savePromise, fetchTimeout])
        .then(function (result) {
            // Restore button
            submitBtn.innerHTML = origBtnText;
            submitBtn.disabled = false;

            // Trigger WhatsApp redirect immediately
            var waUrl = "https://api.whatsapp.com/send?phone=6583437864&text=" + encodeURIComponent(msg);
            window.open(waUrl, '_blank');
            
            // Clear cart
            localStorage.removeItem('ava_quote_cart');
            closeDrawer();
            updateUI();
            
            alert("Quote request successfully compiled! Opening WhatsApp to send your inquiry.");
        });
    }

    function injectQuoteButtonsIntoFeatured() {
        var cards = document.querySelectorAll('.elementor-element-cc6de85');
        cards.forEach(function (card) {
            if (card.querySelector('.ava-featured-quote-btn')) return;

            var loopItem = card.closest('.e-loop-item');
            var productId = '0';
            if (loopItem) {
                var classes = loopItem.className;
                var match = classes.match(/post-(\d+)/);
                if (match && match[1]) {
                    productId = match[1];
                }
            }

            var buttonContainer = card.querySelector('.elementor-element-2b60bf0');
            if (buttonContainer) {
                var qBtn = document.createElement('a');
                qBtn.href = '#';
                qBtn.className = 'add-request-quote-button button ava-featured-quote-btn';
                qBtn.setAttribute('data-product_id', productId);
                qBtn.innerHTML = '<span>Request Quote</span>';
                buttonContainer.appendChild(qBtn);
            }
        });
    }

    function initQuoteEngine() {
        // 1. Style Inject
        if (!document.getElementById('ava-quote-styles')) {
            var styleEl = document.createElement('style');
            styleEl.id = 'ava-quote-styles';
            styleEl.innerHTML = QUOTE_CSS;
            document.head.appendChild(styleEl);
        }

        // 2. Dynamic card injections
        injectQuoteButtonsIntoFeatured();

        // 3. Elements setup
        if (!document.getElementById('ava-quote-backdrop')) {
            var backdrop = document.createElement('div');
            backdrop.id = 'ava-quote-backdrop';
            backdrop.className = 'ava-quote-backdrop';
            document.body.appendChild(backdrop);
            backdrop.addEventListener('click', closeDrawer);
        }

        if (!document.getElementById('ava-quote-drawer')) {
            var drawer = document.createElement('div');
            drawer.id = 'ava-quote-drawer';
            drawer.className = 'ava-quote-drawer';
            drawer.innerHTML = 
                '<div class="ava-drawer-header">' +
                    '<h2>Request Quotation</h2>' +
                    '<button id="ava-drawer-close" class="ava-drawer-close">✕</button>' +
                '</div>' +
                '<div id="ava-drawer-products" class="ava-drawer-products"></div>' +
                '<div class="ava-drawer-footer">' +
                    '<div class="ava-drawer-total">' +
                        '<span>Total Selected Items:</span>' +
                        '<span id="ava-total-count">0</span>' +
                    '</div>' +
                    '<form id="ava-inquiry-form" class="ava-inquiry-form">' +
                        '<div class="ava-form-group">' +
                            '<input type="text" id="ava-form-name" placeholder="Full Name *" required />' +
                        '</div>' +
                        '<div class="ava-form-group">' +
                            '<input type="text" id="ava-form-business" placeholder="Business Name / Company *" required />' +
                        '</div>' +
                        '<div class="ava-form-group">' +
                            '<input type="tel" id="ava-form-phone" placeholder="Phone Number *" required />' +
                        '</div>' +
                        '<div class="ava-form-group">' +
                            '<input type="email" id="ava-form-email" placeholder="Email Address *" required />' +
                        '</div>' +
                        '<div class="ava-form-group">' +
                            '<textarea id="ava-form-notes" placeholder="Additional Inquiry Notes (Specs, Custom dimensions, etc.)..." rows="3"></textarea>' +
                        '</div>' +
                        '<button type="submit" id="ava-submit-quote" class="ava-submit-quote">' +
                            '<span>Send via WhatsApp</span>' +
                        '</button>' +
                    '</form>' +
                '</div>';
            document.body.appendChild(drawer);
            document.getElementById('ava-drawer-close').addEventListener('click', closeDrawer);
            document.getElementById('ava-inquiry-form').addEventListener('submit', submitQuoteForm);
        }

        if (!document.getElementById('ava-quote-launcher')) {
            var launcher = document.createElement('div');
            launcher.id = 'ava-quote-launcher';
            launcher.className = 'ava-quote-launcher';
            launcher.innerHTML = 
                '<div class="ava-launcher-icon">' +
                    '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                        '<path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM17 17H7V15H17V17ZM17 13H7V11H17V13ZM17 9H7V7H17V9Z" fill="white"/>' +
                    '</svg>' +
                '</div>' +
                '<div id="ava-launcher-badge" class="ava-launcher-badge">0</div>';
            document.body.appendChild(launcher);
            launcher.addEventListener('click', toggleDrawer);
        }

        // 4. Intercept clicks globally
        document.body.addEventListener('click', function(e) {
            var btn = e.target.closest('.add-request-quote-button');
            if (btn) {
                e.preventDefault();
                e.stopPropagation();
                addToQuote(btn);
            }
        });

        // Sync initial UI
        updateUI();
    }

    var RESPONSIVE_CSS = `
        /* Prevent horizontal scroll globally */
        html, body {
            max-width: 100vw !important;
            overflow-x: hidden !important;
            scroll-behavior: smooth;
            -webkit-font-smoothing: antialiased;
        }

        @media (max-width: 1024px) {
            /* 1. GLASSMORPHIC MOBILE MENU */
            .elementor-nav-menu--dropdown {
                position: fixed !important;
                top: 0 !important;
                right: -100vw !important;
                width: 85vw !important;
                max-width: 400px !important;
                height: 100vh !important;
                background: rgba(8, 15, 28, 0.90) !important;
                backdrop-filter: blur(35px) saturate(180%) !important;
                -webkit-backdrop-filter: blur(35px) saturate(180%) !important;
                border-left: 1px solid rgba(64, 162, 216, 0.22) !important;
                box-shadow: -20px 0 60px rgba(0, 0, 0, 0.7) !important;
                z-index: 999999 !important;
                display: flex !important;
                flex-direction: column !important;
                padding: 90px 24px 40px 24px !important;
                transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) !important;
                box-sizing: border-box !important;
                overflow-y: auto !important;
            }
            
            body.ava-menu-active {
                overflow: hidden !important; /* Disable body scroll when menu open */
            }

            body.ava-menu-active .elementor-nav-menu--dropdown {
                transform: translate3d(-100vw, 0, 0) !important;
            }
            
            /* Toggle classes */
            .elementor-menu-toggle.elementor-active .elementor-menu-toggle__icon--open {
                display: none !important;
            }
            .elementor-menu-toggle.elementor-active .elementor-menu-toggle__icon--close {
                display: block !important;
            }
            
            /* Glow Border indicator */
            .elementor-nav-menu--dropdown::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 2px;
                height: 100%;
                background: linear-gradient(to bottom, #40A2D8, #4AA485);
                box-shadow: 0 0 15px rgba(64, 162, 216, 0.6);
            }
            
            .ava-menu-backdrop {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(4, 8, 16, 0.45);
                backdrop-filter: blur(15px);
                -webkit-backdrop-filter: blur(15px);
                z-index: 999998;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.4s ease;
            }
            
            body.ava-menu-active .ava-menu-backdrop {
                opacity: 1;
                pointer-events: auto;
            }
        }

        @media (max-width: 768px) {
            /* 2. RESPONSIVE TYPOGRAPHY & CINEMATIC SCALING */
            h1 {
                font-size: clamp(2rem, 8vw, 2.8rem) !important;
                line-height: 1.25 !important;
                letter-spacing: -0.5px !important;
            }
            h2 {
                font-size: clamp(1.5rem, 6vw, 2rem) !important;
                line-height: 1.3 !important;
                letter-spacing: -0.3px !important;
            }
            h3 {
                font-size: clamp(1.25rem, 5vw, 1.5rem) !important;
            }
            
            /* Spacing fixes - reduce massive padding */
            .elementor-section, .section, section {
                padding-top: 45px !important;
                padding-bottom: 45px !important;
            }
            
            .elementor-container, .e-con-inner, .e-con {
                flex-direction: column !important;
                padding-left: 16px !important;
                padding-right: 16px !important;
                box-sizing: border-box !important;
                width: 100% !important;
            }

            /* 3. PRODUCT CARDS & LOOP GRIDS RESPONSIVENESS */
            .elementor-element-cc6de85, 
            .woocommerce ul.products li.product, 
            .e-loop-item {
                padding: 20px !important;
                margin: 0 auto 20px auto !important;
                width: 100% !important;
                max-width: 100% !important;
                float: none !important;
                box-sizing: border-box !important;
            }
            
            /* Buttons Stacking inside Cards */
            .elementor-element-cc6de85 .elementor-element-2b60bf0,
            .elementor-element-cc6de85 .elementor-widget-container,
            .woocommerce ul.products li.product .button-container,
            .e-loop-item .button-container {
                display: flex !important;
                flex-direction: column !important;
                gap: 12px !important;
                align-items: center !important;
                width: 100% !important;
                margin-top: 15px !important;
            }
            
            /* Force buttons full width & no-clip text wrap */
            .elementor-element-cc6de85 a.elementor-button,
            .elementor-element-cc6de85 .add-request-quote-button,
            .elementor-element-cc6de85 .ava-featured-quote-btn,
            .woocommerce ul.products li.product .button,
            .e-loop-item .button {
                width: 100% !important;
                max-width: 100% !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                box-sizing: border-box !important;
                margin: 4px 0 !important;
                padding: 12px 20px !important;
                font-size: 13px !important;
                white-space: normal !important;
                text-align: center !important;
                border-radius: 30px !important;
                text-overflow: clip !important;
                height: auto !important;
            }

            /* 4. CAROUSEL & SWIPER SPATIAL FIXES */
            .swiper-button-prev,
            .swiper-button-next {
                width: 38px !important;
                height: 38px !important;
                background: rgba(8, 15, 28, 0.75) !important;
                border: 1px solid rgba(64, 162, 216, 0.4) !important;
                border-radius: 50% !important;
                backdrop-filter: blur(8px) !important;
                -webkit-backdrop-filter: blur(8px) !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                z-index: 100 !important;
            }
            
            .swiper-button-prev { left: 4px !important; }
            .swiper-button-next { right: 4px !important; }
            .swiper-pagination { bottom: 6px !important; }

            /* 5. PRODUCT DETAILS PAGE MOBILE FLOW */
            .product-template-default .site-main .elementor-section,
            .single-product .product {
                display: flex !important;
                flex-direction: column !important;
                padding: 10px !important;
            }
            .single-product .woocommerce-product-gallery {
                width: 100% !important;
                max-width: 100% !important;
                margin-bottom: 20px !important;
                float: none !important;
            }
            .single-product .summary {
                width: 100% !important;
                float: none !important;
                padding: 0 10px !important;
                box-sizing: border-box !important;
            }
            .single-product .elementor-widget-yith-ywraq-button-quote,
            .single-product .yith-ywraq-add-to-quote,
            .single-product .add-request-quote-button {
                width: 100% !important;
                box-sizing: border-box !important;
            }
            .single-product .add-request-quote-button {
                padding: 14px 20px !important;
                font-size: 15px !important;
                text-align: center !important;
                justify-content: center !important;
                display: flex !important;
            }
        }
    `;

    function initResponsiveStyles() {
        if (!document.getElementById('ava-responsive-styles')) {
            var styleEl = document.createElement('style');
            styleEl.id = 'ava-responsive-styles';
            styleEl.innerHTML = RESPONSIVE_CSS;
            document.head.appendChild(styleEl);
        }
    }

    function initMobileMenuInterceptions() {
        var toggles = document.querySelectorAll('.elementor-menu-toggle');
        
        // Add a backdrop if it doesn't exist
        var backdrop = document.querySelector('.ava-menu-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.className = 'ava-menu-backdrop';
            document.body.appendChild(backdrop);
            
            // Clicking backdrop closes menu
            backdrop.addEventListener('click', closeMobileMenu);
        }

        toggles.forEach(function (toggle) {
            toggle.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                
                var isActive = document.body.classList.contains('ava-menu-active');
                if (isActive) {
                    closeMobileMenu();
                } else {
                    openMobileMenu();
                }
            });
        });

        // Close menu on link clicks
        var links = document.querySelectorAll('.elementor-nav-menu--dropdown a, .e-off-canvas a');
        links.forEach(function (link) {
            link.addEventListener('click', closeMobileMenu);
        });

        function openMobileMenu() {
            document.body.classList.add('ava-menu-active');
            toggles.forEach(function (t) {
                t.classList.add('elementor-active');
                t.setAttribute('aria-expanded', 'true');
            });
        }

        function closeMobileMenu() {
            document.body.classList.remove('ava-menu-active');
            toggles.forEach(function (t) {
                t.classList.remove('elementor-active');
                t.setAttribute('aria-expanded', 'false');
            });
        }
    }

    /* ================================================================
       BOOTUX SPA INTERFACE CHOREOGRAPHY
       ================================================================ */
    function boot() {
        try { initResponsiveStyles(); } catch (e) { console.warn('[AVA] Responsive Styles failed:', e); }
        try { initAtmosphere(); } catch (e) { console.warn('[AVA] Atmosphere failed:', e); }
        try { initSpatialTelemetry(); } catch (e) { console.warn('[AVA] Spatial Telemetry failed:', e); }
        try { initCardSpotlight(); } catch (e) { console.warn('[AVA] Spotlight failed:', e); }
        try { initNavbarScroll(); } catch (e) { console.warn('[AVA] Navbar failed:', e); }
        try { initScrollReveal(); } catch (e) { console.warn('[AVA] Reveal failed:', e); forceRevealAll(); }
        try { initMagneticCTAs(); } catch (e) { console.warn('[AVA] Magnetic failed:', e); }
        try { initCardTilt(); } catch (e) { console.warn('[AVA] Tilt failed:', e); }
        try { initMobileDropdownToggle(); } catch (e) { console.warn('[AVA] Mobile Dropdown failed:', e); }
        try { initProductCardClicks(); } catch (e) { console.warn('[AVA] Product Card Clicks failed:', e); }
        try { initQuoteEngine(); } catch (e) { console.warn('[AVA] Quote Engine failed:', e); }
        try { initMobileMenuInterceptions(); } catch (e) { console.warn('[AVA] Mobile Menu failed:', e); }

        document.body.classList.add('ava-premium-loaded');
        setTimeout(forceRevealAll, 600);
    }


    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
