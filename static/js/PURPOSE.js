// static/js/script.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('AITS Landing Page Loaded');
    
    // Add click tracking (optional)
    const cards = document.querySelectorAll('.purpose-card');
    cards.forEach(card => {
        card.addEventListener('click', function(e) {
            const role = this.querySelector('h2').textContent;
            console.log(`User selected: ${role}`);
            // You can add analytics here if needed
        });
    });
    
    // Add smooth scrolling for footer links
    const footerLinks = document.querySelectorAll('.footer a');
    footerLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
    
    // Add animation on scroll (optional)
    function checkVisibility() {
        const cards = document.querySelectorAll('.purpose-card');
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight - 100;
            if (isVisible) {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }
        });
    }
    
    // Initial check
    checkVisibility();
    
    // Check on scroll
    window.addEventListener('scroll', checkVisibility);
});