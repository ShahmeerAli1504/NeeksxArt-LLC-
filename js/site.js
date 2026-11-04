/* NeeksxArt — shared site behaviour */
(function () {
  const header = document.querySelector('.site-header');
  const onScroll = () => header && header.classList.toggle('scrolled', window.scrollY > 30);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // mobile menu
  const burger = document.querySelector('.burger');
  const links = document.querySelector('.nav-links');
  if (burger && links) {
    burger.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      header.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      links.classList.remove('open'); header.classList.remove('menu-open'); document.body.style.overflow = '';
    }));
  }

  // active nav link
  const here = location.pathname.replace(/\/$/, '/index').split('/').pop().replace('.html', '') || 'index';
  document.querySelectorAll('.nav-links a[data-page]').forEach(a => {
    if (a.dataset.page === here) a.classList.add('active');
  });

  // reveal on scroll
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }) : null;
  document.querySelectorAll('.reveal').forEach(el => io ? io.observe(el) : el.classList.add('in'));

  // only play videos while visible (saves battery & data)
  const vids = document.querySelectorAll('video[data-autoplay]');
  if ('IntersectionObserver' in window) {
    const vio = new IntersectionObserver(entries => {
      entries.forEach(e => {
        const v = e.target;
        if (e.isIntersecting) { v.play().catch(() => {}); } else { v.pause(); }
      });
    }, { threshold: 0.25 });
    vids.forEach(v => vio.observe(v));
  } else vids.forEach(v => v.play().catch(() => {}));

  // lightbox
  const lb = document.querySelector('.lightbox');
  if (lb) {
    const img = lb.querySelector('img');
    document.querySelectorAll('[data-lightbox]').forEach(f => f.addEventListener('click', () => {
      const src = f.querySelector('img');
      img.src = src.src; img.alt = src.alt; lb.classList.add('open');
    }));
    const close = () => lb.classList.remove('open');
    lb.addEventListener('click', e => { if (e.target === lb || e.target.closest('button')) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  // gallery filters
  const filters = document.querySelector('.filters');
  if (filters) {
    filters.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      filters.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
      const f = b.dataset.filter;
      document.querySelectorAll('.masonry figure').forEach(fig => {
        fig.classList.toggle('hide', f !== 'all' && !fig.dataset.cat.split(' ').includes(f));
      });
    });
  }

  const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
})();
