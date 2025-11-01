/**
 * Auto Post Sheet To WordPress - Documentation Scripts
 * Version: 2.0.0
 * Author: DUC QUY
 */

(function() {
    'use strict';

    // ============================================
    // VARIABLES
    // ============================================
    const sidebar = document.querySelector('.docs-sidebar');
    const navLinks = document.querySelectorAll('.docs-nav a');
    const searchInput = document.getElementById('search-input');
    const backToTopBtn = document.getElementById('back-to-top');
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    const sections = document.querySelectorAll('.doc-section');

    // ============================================
    // SMOOTH SCROLLING FOR NAVIGATION LINKS
    // ============================================
    function initSmoothScroll() {
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                // Check if it's an internal anchor link
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    
                    const targetId = href.substring(1);
                    const targetSection = document.getElementById(targetId);
                    
                    if (targetSection) {
                        // Remove active class from all links
                        navLinks.forEach(l => l.classList.remove('active'));
                        
                        // Add active class to clicked link
                        this.classList.add('active');
                        
                        // Smooth scroll to section
                        const headerOffset = 90; // Account for fixed header
                        const elementPosition = targetSection.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                        
                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                        
                        // Close mobile sidebar if open
                        if (window.innerWidth <= 768) {
                            sidebar.classList.remove('active');
                        }
                    }
                }
            });
        });
    }

    // ============================================
    // ACTIVE SECTION HIGHLIGHTING ON SCROLL
    // ============================================
    function updateActiveSection() {
        let current = '';
        const scrollPosition = window.pageYOffset + 120;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        // Update navigation active state
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            
            if (href === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    // ============================================
    // SEARCH FUNCTIONALITY
    // ============================================
    function initSearch() {
        if (!searchInput) return;

        let searchTimeout;

        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            
            searchTimeout = setTimeout(() => {
                const searchTerm = this.value.toLowerCase().trim();
                
                if (searchTerm === '') {
                    // Show all sections
                    sections.forEach(section => {
                        section.style.display = 'block';
                        highlightSearchResults(section, '');
                    });
                    return;
                }

                // Search and highlight
                sections.forEach(section => {
                    const sectionText = section.textContent.toLowerCase();
                    
                    if (sectionText.includes(searchTerm)) {
                        section.style.display = 'block';
                        highlightSearchResults(section, searchTerm);
                    } else {
                        section.style.display = 'none';
                    }
                });
            }, 300); // Debounce delay
        });

        // Clear search on Escape key
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                this.value = '';
                this.dispatchEvent(new Event('input'));
            }
        });
    }

    // ============================================
    // HIGHLIGHT SEARCH RESULTS
    // ============================================
    function highlightSearchResults(element, searchTerm) {
        // Remove existing highlights
        const highlighted = element.querySelectorAll('.highlight');
        highlighted.forEach(span => {
            const parent = span.parentNode;
            parent.replaceChild(document.createTextNode(span.textContent), span);
            parent.normalize();
        });

        if (!searchTerm) return;

        // Add new highlights
        highlightText(element, searchTerm);
    }

    function highlightText(node, searchTerm) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent;
            const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
            
            if (regex.test(text)) {
                const fragment = document.createDocumentFragment();
                let lastIndex = 0;
                
                text.replace(regex, (match, p1, offset) => {
                    // Add text before match
                    if (offset > lastIndex) {
                        fragment.appendChild(
                            document.createTextNode(text.slice(lastIndex, offset))
                        );
                    }
                    
                    // Add highlighted match
                    const span = document.createElement('span');
                    span.className = 'highlight';
                    span.textContent = match;
                    span.style.backgroundColor = '#ffeb3b';
                    span.style.padding = '2px 4px';
                    span.style.borderRadius = '3px';
                    fragment.appendChild(span);
                    
                    lastIndex = offset + match.length;
                });
                
                // Add remaining text
                if (lastIndex < text.length) {
                    fragment.appendChild(
                        document.createTextNode(text.slice(lastIndex))
                    );
                }
                
                node.parentNode.replaceChild(fragment, node);
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Skip script, style, and code elements
            if (!['SCRIPT', 'STYLE', 'CODE', 'PRE'].includes(node.tagName)) {
                Array.from(node.childNodes).forEach(child => {
                    highlightText(child, searchTerm);
                });
            }
        }
    }

    function escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // ============================================
    // ACCORDION FUNCTIONALITY
    // ============================================
    function initAccordion() {
        accordionHeaders.forEach(header => {
            header.addEventListener('click', function() {
                const accordionItem = this.parentElement;
                const isActive = accordionItem.classList.contains('active');
                
                // Close all accordion items
                document.querySelectorAll('.accordion-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                // Toggle current item
                if (!isActive) {
                    accordionItem.classList.add('active');
                }
            });
        });
    }

    // ============================================
    // BACK TO TOP BUTTON
    // ============================================
    function initBackToTop() {
        if (!backToTopBtn) return;

        // Show/hide button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        // Scroll to top on click
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ============================================
    // MOBILE SIDEBAR TOGGLE
    // ============================================
    function initMobileSidebar() {
        // Create mobile menu toggle button
        const mobileToggle = document.createElement('button');
        mobileToggle.className = 'mobile-sidebar-toggle';
        mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
        mobileToggle.setAttribute('aria-label', 'Toggle navigation menu');
        
        // Add styles for mobile toggle
        mobileToggle.style.cssText = `
            display: none;
            position: fixed;
            bottom: 80px;
            left: 20px;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #2271b1 0%, #135e96 100%);
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 1.25rem;
            cursor: pointer;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 998;
            transition: all 0.3s ease;
        `;

        document.body.appendChild(mobileToggle);

        // Show toggle button on mobile
        function checkMobile() {
            if (window.innerWidth <= 768) {
                mobileToggle.style.display = 'flex';
                mobileToggle.style.alignItems = 'center';
                mobileToggle.style.justifyContent = 'center';
            } else {
                mobileToggle.style.display = 'none';
                sidebar.classList.remove('active');
            }
        }

        checkMobile();
        window.addEventListener('resize', checkMobile);

        // Toggle sidebar on mobile
        mobileToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            this.innerHTML = sidebar.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });

        // Close sidebar when clicking outside
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 768 && 
                sidebar.classList.contains('active') &&
                !sidebar.contains(e.target) &&
                !mobileToggle.contains(e.target)) {
                sidebar.classList.remove('active');
                mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }

    // ============================================
    // COPY CODE BUTTON
    // ============================================
    function initCopyCodeButtons() {
        const codeBlocks = document.querySelectorAll('.code-block pre');

        codeBlocks.forEach(block => {
            const wrapper = block.parentElement;
            
            // Create copy button
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-code-btn';
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
            copyBtn.setAttribute('aria-label', 'Copy code to clipboard');
            
            // Add styles
            copyBtn.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                padding: 8px 15px;
                background-color: rgba(255, 255, 255, 0.9);
                color: #2c3338;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.875rem;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 5px;
                transition: all 0.2s ease;
                z-index: 10;
            `;

            wrapper.style.position = 'relative';
            wrapper.appendChild(copyBtn);

            // Copy functionality
            copyBtn.addEventListener('click', function() {
                const code = block.querySelector('code');
                const text = code ? code.textContent : block.textContent;

                // Copy to clipboard
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text).then(() => {
                        // Success feedback
                        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                        copyBtn.style.backgroundColor = '#00a32a';
                        copyBtn.style.color = 'white';

                        setTimeout(() => {
                            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
                            copyBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                            copyBtn.style.color = '#2c3338';
                        }, 2000);
                    }).catch(() => {
                        // Fallback for older browsers
                        fallbackCopyToClipboard(text, copyBtn);
                    });
                } else {
                    // Fallback for older browsers
                    fallbackCopyToClipboard(text, copyBtn);
                }
            });

            // Hover effect
            copyBtn.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#2271b1';
                this.style.color = 'white';
            });

            copyBtn.addEventListener('mouseleave', function() {
                if (this.innerHTML.includes('Copy')) {
                    this.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                    this.style.color = '#2c3338';
                }
            });
        });
    }

    function fallbackCopyToClipboard(text, button) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.top = '-9999px';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();

        try {
            document.execCommand('copy');
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            button.style.backgroundColor = '#00a32a';
            button.style.color = 'white';

            setTimeout(() => {
                button.innerHTML = '<i class="fas fa-copy"></i> Copy';
                button.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                button.style.color = '#2c3338';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            button.innerHTML = '<i class="fas fa-times"></i> Failed';
            button.style.backgroundColor = '#d63638';
            button.style.color = 'white';

            setTimeout(() => {
                button.innerHTML = '<i class="fas fa-copy"></i> Copy';
                button.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                button.style.color = '#2c3338';
            }, 2000);
        }

        document.body.removeChild(textArea);
    }

    // ============================================
    // TABLE OF CONTENTS (Auto-generated)
    // ============================================
    function generateTableOfContents() {
        const tocContainer = document.querySelector('.table-of-contents');
        if (!tocContainer) return;

        const headings = document.querySelectorAll('.doc-section h3');
        if (headings.length === 0) return;

        const tocList = document.createElement('ul');
        tocList.className = 'toc-list';

        headings.forEach((heading, index) => {
            // Add ID to heading if it doesn't have one
            if (!heading.id) {
                heading.id = `heading-${index}`;
            }

            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = `#${heading.id}`;
            link.textContent = heading.textContent;
            listItem.appendChild(link);
            tocList.appendChild(listItem);
        });

        tocContainer.appendChild(tocList);
    }

    // ============================================
    // LAZY LOAD IMAGES
    // ============================================
    function initLazyLoad() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    // ============================================
    // KEYBOARD NAVIGATION
    // ============================================
    function initKeyboardNavigation() {
        document.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + K to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (searchInput) {
                    searchInput.focus();
                }
            }

            // Escape to blur search
            if (e.key === 'Escape' && document.activeElement === searchInput) {
                searchInput.blur();
            }
        });
    }

    // ============================================
    // SCROLL PROGRESS INDICATOR
    // ============================================
    function initScrollProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 4px;
            background: linear-gradient(90deg, #2271b1 0%, #135e96 100%);
            z-index: 10000;
            transition: width 0.1s ease;
        `;
        document.body.appendChild(progressBar);

        window.addEventListener('scroll', function() {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progressBar.style.width = scrolled + '%';
        });
    }

    // ============================================
    // EXTERNAL LINKS - OPEN IN NEW TAB
    // ============================================
    function initExternalLinks() {
        const links = document.querySelectorAll('a[href^="http"]');
        
        links.forEach(link => {
            // Skip if already has target
            if (!link.hasAttribute('target')) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            }

            // Add external link icon
            if (!link.querySelector('.external-icon')) {
                const icon = document.createElement('i');
                icon.className = 'fas fa-external-link-alt external-icon';
                icon.style.cssText = `
                    font-size: 0.75em;
                    margin-left: 4px;
                    opacity: 0.6;
                `;
                link.appendChild(icon);
            }
        });
    }

    // ============================================
    // PRINT DOCUMENTATION
    // ============================================
    function initPrintButton() {
        const printBtn = document.createElement('button');
        printBtn.className = 'print-btn';
        printBtn.innerHTML = '<i class="fas fa-print"></i> Print';
        printBtn.setAttribute('aria-label', 'Print documentation');
        printBtn.style.cssText = `
            position: fixed;
            bottom: 90px;
            right: 30px;
            padding: 12px 20px;
            background-color: white;
            color: #2271b1;
            border: 2px solid #2271b1;
            border-radius: 25px;
            cursor: pointer;
            font-size: 0.875rem;
            font-weight: 600;
            display: none;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transition: all 0.3s ease;
            z-index: 998;
        `;

        document.body.appendChild(printBtn);

        // Show on larger screens
        if (window.innerWidth > 768) {
            printBtn.style.display = 'flex';
        }

        window.addEventListener('resize', function() {
            printBtn.style.display = window.innerWidth > 768 ? 'flex' : 'none';
        });

        printBtn.addEventListener('click', function() {
            window.print();
        });

        printBtn.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#2271b1';
            this.style.color = 'white';
        });

        printBtn.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'white';
            this.style.color = '#2271b1';
        });
    }

    // ============================================
    // ANIMATE ON SCROLL
    // ============================================
    function initAnimateOnScroll() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Elements to animate
        const animateElements = document.querySelectorAll(`
            .feature-card,
            .provider-card,
            .service-card,
            .support-card,
            .faq-item,
            .step
        `);

        animateElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = `all 0.6s ease ${index * 0.1}s`;
            observer.observe(el);
        });
    }

    // ============================================
    // DARK MODE TOGGLE (Optional)
    // ============================================
    function initDarkMode() {
        const darkModeToggle = document.createElement('button');
        darkModeToggle.className = 'dark-mode-toggle';
        darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        darkModeToggle.setAttribute('aria-label', 'Toggle dark mode');
        darkModeToggle.style.cssText = `
            position: fixed;
            bottom: 150px;
            right: 30px;
            width: 50px;
            height: 50px;
            background-color: #2c3338;
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1.25rem;
            display: none;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
            z-index: 998;
        `;

        document.body.appendChild(darkModeToggle);

        // Show on larger screens
        if (window.innerWidth > 768) {
            darkModeToggle.style.display = 'flex';
        }

        window.addEventListener('resize', function() {
            darkModeToggle.style.display = window.innerWidth > 768 ? 'flex' : 'none';
        });

        // Check for saved preference
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }

        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDark);
            this.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        });

        darkModeToggle.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
        });

        darkModeToggle.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    }

    // ============================================
    // INITIALIZE ALL FUNCTIONS
    // ============================================
    function init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        console.log('📚 Documentation initialized');

        // Core features
        initSmoothScroll();
        initSearch();
        initAccordion();
        initBackToTop();
        initMobileSidebar();
        initCopyCodeButtons();
        initKeyboardNavigation();
        initScrollProgress();
        initExternalLinks();
        initPrintButton();
        initAnimateOnScroll();
        initDarkMode();

        // Optional features
        // generateTableOfContents(); // Uncomment if you have .table-of-contents element
        // initLazyLoad(); // Uncomment if using data-src for images

        // Update active section on scroll
        window.addEventListener('scroll', function() {
            updateActiveSection();
        });

        // Initial active section update
        updateActiveSection();

        // Performance monitoring
        if (window.performance && window.performance.timing) {
            const loadTime = window.performance.timing.domContentLoadedEventEnd - 
                           window.performance.timing.navigationStart;
            console.log(`⚡ Documentation loaded in ${loadTime}ms`);
        }
    }

    // Start initialization
    init();

    // ============================================
    // PUBLIC API (Optional)
    // ============================================
    window.DocsApp = {
        scrollToSection: function(sectionId) {
            const section = document.getElementById(sectionId);
            if (section) {
                const headerOffset = 90;
                const elementPosition = section.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        },
        
        search: function(term) {
            if (searchInput) {
                searchInput.value = term;
                searchInput.dispatchEvent(new Event('input'));
            }
        },
        
        toggleDarkMode: function() {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDark);
        }
    };

})();