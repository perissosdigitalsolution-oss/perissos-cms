/* ========================================
   OPTICA - Main JavaScript
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --- Hero Slideshow ---
  const slides = document.querySelectorAll('.hero-slide');
  let currentSlide = 0;

  function nextSlide() {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
  }

  if (slides.length > 0) {
    setInterval(nextSlide, 5000);
  }

  // --- Mobile Menu ---
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  const mobileOverlay = document.getElementById('mobileOverlay');

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      mobileOverlay.classList.toggle('active');
      document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
    });
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', () => {
      navMenu.classList.remove('open');
      mobileOverlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  // --- Mobile Dropdown Toggle ---
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    const link = item.querySelector('a');
    link.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        item.classList.toggle('dropdown-open');
      }
    });
  });

  // --- Scroll Animations ---
  const animateElements = document.querySelectorAll('.animate-on-scroll');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  animateElements.forEach(el => observer.observe(el));

  // --- Progress Bars Animation ---
  const progressFills = document.querySelectorAll('.progress-fill');

  const progressObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const width = entry.target.getAttribute('data-width');
        entry.target.style.width = width + '%';
        progressObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  progressFills.forEach(fill => {
    fill.style.width = '0%';
    progressObserver.observe(fill);
  });

  // --- Appointment Form ---
  const appointmentForm = document.getElementById('appointmentForm');
  if (appointmentForm) {
    appointmentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Thank you! Your appointment request has been submitted. We will contact you shortly.');
      appointmentForm.reset();
    });
  }

  // --- Newsletter Form ---
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Thank you for subscribing to our newsletter!');
      newsletterForm.reset();
    });
  }

  // --- Smooth Scroll for Anchor Links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // --- Sticky Nav Shadow on Scroll ---
  const mainNav = document.querySelector('.main-nav');
  if (mainNav) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        mainNav.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
      } else {
        mainNav.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
      }
    });
  }

});
