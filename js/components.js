// Owner: Bimala
(function () {
  function initCta() {
    const btn = document.getElementById('cta-btn');
    const cta = document.getElementById('cta');

    btn?.addEventListener('click', () => {
      const moodSection = document.getElementById('mood-picker');
      if (moodSection) {
        moodSection.scrollIntoView({ behavior: 'smooth' });
        cta?.classList.add('highlight');
        setTimeout(() => cta?.classList.remove('highlight'), 600);
      }
    });
  }

  function initScrollReveal() {
    const steps = document.querySelectorAll('.step');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      },
      { threshold: 0.2 }
    );

    steps.forEach((step) => {
      step.style.opacity = '0';
      step.style.transform = 'translateY(16px)';
      step.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      observer.observe(step);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initCta();
    initScrollReveal();
  });
})();