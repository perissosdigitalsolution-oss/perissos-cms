document.addEventListener('DOMContentLoaded', () => {

    // ========== MOBILE MENU ==========
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeMenu = document.getElementById('closeMenu');
    const mobileOverlay = document.getElementById('mobileOverlay');

    function openMobileMenu() {
        mobileMenu.classList.add('active');
        mobileOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        mobileMenu.classList.remove('active');
        mobileOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', openMobileMenu);
    closeMenu.addEventListener('click', closeMobileMenu);
    mobileOverlay.addEventListener('click', closeMobileMenu);

    // Mobile dropdown toggle
    document.querySelectorAll('.mobile-dropdown > a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            link.parentElement.classList.toggle('active');
        });
    });

    // Close mobile menu on link click
    document.querySelectorAll('.mobile-nav a').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // ========== ACCORDION ==========
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const isActive = item.classList.contains('active');

            // Close all items
            document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));

            // Toggle current
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // ========== GALLERY CAROUSEL ==========
    const galleryTrack = document.querySelector('.gallery-track');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const prevBtn = document.querySelector('.gallery-prev');
    const nextBtn = document.querySelector('.gallery-next');
    let galleryIndex = 0;
    let itemsPerView = getItemsPerView();

    function getItemsPerView() {
        if (window.innerWidth <= 480) return 1;
        if (window.innerWidth <= 768) return 2;
        return 4;
    }

    function updateGallery() {
        itemsPerView = getItemsPerView();
        const maxIndex = Math.max(0, galleryItems.length - itemsPerView);
        if (galleryIndex > maxIndex) galleryIndex = maxIndex;

        const itemWidth = galleryItems[0].offsetWidth + 20; // gap
        galleryTrack.style.transform = `translateX(-${galleryIndex * itemWidth}px)`;
    }

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            if (galleryIndex > 0) {
                galleryIndex--;
                updateGallery();
            }
        });

        nextBtn.addEventListener('click', () => {
            const maxIndex = Math.max(0, galleryItems.length - itemsPerView);
            if (galleryIndex < maxIndex) {
                galleryIndex++;
                updateGallery();
            }
        });
    }

    window.addEventListener('resize', updateGallery);

    // Auto-play gallery
    setInterval(() => {
        const maxIndex = Math.max(0, galleryItems.length - itemsPerView);
        galleryIndex = galleryIndex >= maxIndex ? 0 : galleryIndex + 1;
        updateGallery();
    }, 4000);

    // ========== TESTIMONIAL CAROUSEL ==========
    const testimonialSlides = document.querySelectorAll('.testimonial-slide');
    let testimonialIndex = 0;

    function showTestimonial(index) {
        testimonialSlides.forEach(s => s.classList.remove('active'));
        testimonialSlides[index].classList.add('active');
    }

    if (testimonialSlides.length > 1) {
        setInterval(() => {
            testimonialIndex = (testimonialIndex + 1) % testimonialSlides.length;
            showTestimonial(testimonialIndex);
        }, 5000);
    }

    // ========== COUNTER ANIMATION ==========
    const counterNumbers = document.querySelectorAll('.counter-number');

    function animateCounter(el) {
        const target = parseInt(el.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const update = () => {
            current += increment;
            if (current < target) {
                el.textContent = Math.floor(current);
                requestAnimationFrame(update);
            } else {
                el.textContent = target;
            }
        };

        update();
    }

    // ========== SCROLL ANIMATIONS ==========
    const animateElements = document.querySelectorAll('.animate');

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;

                // Handle animation delay from inline style
                const delay = el.style.animationDelay;
                if (delay) {
                    el.style.animationDelay = delay;
                }

                el.style.animationPlayState = 'running';

                // Trigger counter animation
                if (el.querySelector('.counter-number')) {
                    animateCounter(el.querySelector('.counter-number'));
                }

                observer.unobserve(el);
            }
        });
    }, observerOptions);

    animateElements.forEach(el => {
        el.style.animationPlayState = 'paused';
        observer.observe(el);
    });

    // ========== SCROLL TO TOP ==========
    const scrollTopBtn = document.getElementById('scrollTop');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ========== HEADER SCROLL EFFECT ==========
    const header = document.getElementById('masthead');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;

        if (currentScroll > 100) {
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
        } else {
            header.style.boxShadow = 'none';
        }

        lastScroll = currentScroll;
    });

    // ========== SMOOTH SCROLL FOR ANCHOR LINKS ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const headerHeight = header.offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ========== FORM HANDLING ==========
    const reservationForm = document.getElementById('reservationForm');
    if (reservationForm) {
        reservationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Reservation confirmed! We will contact you shortly.');
            reservationForm.reset();
        });
    }

    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Thank you for subscribing!');
            newsletterForm.reset();
        });
    }

});
