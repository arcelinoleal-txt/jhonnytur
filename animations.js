/* ==========================================================================
   Jhonnytur — camada de interação
   Menu • revelações • contadores • filtros • favoritos • modal de roteiro •
   depoimentos • FAQ • formulários • estrada animada • cortina entre páginas
   ========================================================================== */
(() => {
  'use strict';

  const doc = document;
  const ready = fn => (doc.readyState === 'loading' ? doc.addEventListener('DOMContentLoaded', fn) : fn());
  doc.documentElement.classList.add('js');

  ready(() => {
    /* ------------------------------------------------------------ helpers */
    const $  = (sel, ctx = doc) => ctx.querySelector(sel);
    const $$ = (sel, ctx = doc) => Array.prototype.slice.call(ctx.querySelectorAll(sel));
    const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const WHATSAPP = '5500000000000';
    const waLink = text => 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text);
    const norm = str => String(str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    /* ---------------------------------------------------------------- toast */
    let toastTimer;
    const toast = message => {
      let box = $('.toast');
      if (!box) {
        box = doc.createElement('div');
        box.className = 'toast';
        box.setAttribute('role', 'status');
        box.setAttribute('aria-live', 'polite');
        doc.body.appendChild(box);
      }
      box.textContent = message;
      box.classList.add('is-show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => box.classList.remove('is-show'), 3600);
    };

    /* --------------------------------------------- quebra o título do herói */
    if (!reduced) {
      $$('.split-words').forEach(el => {
        let index = 0;
        const walk = node => {
          Array.prototype.slice.call(node.childNodes).forEach(child => {
            if (child.nodeType === 3) {
              if (!child.textContent.trim()) return;
              const frag = doc.createDocumentFragment();
              child.textContent.split(/(\s+)/).forEach(part => {
                if (!part) return;
                if (!part.trim()) { frag.appendChild(doc.createTextNode(part)); return; }
                const word = doc.createElement('span');
                word.className = 'word';
                const inner = doc.createElement('i');
                inner.textContent = part;
                inner.style.setProperty('--i', index++);
                word.appendChild(inner);
                frag.appendChild(word);
              });
              child.replaceWith(frag);
            } else if (child.nodeType === 1 && child.tagName !== 'BR') {
              walk(child);
            }
          });
        };
        walk(el);
      });
    }

    /* --------------------------------------------------- header + progresso */
    const header = $('.site-header');
    const progressBar = $('.progress');
    const toTop = $('.to-top');
    const heroMedia = $('.hero-media');
    let ticking = false;

    const onScroll = () => {
      const y = window.scrollY;
      if (header) header.classList.toggle('is-scrolled', y > 30);
      if (toTop) toTop.classList.toggle('is-visible', y > 500);
      if (progressBar) {
        const total = doc.documentElement.scrollHeight - window.innerHeight;
        progressBar.style.width = (total > 80 ? clamp(y / total, 0, 1) * 100 : 0).toFixed(2) + '%';
      }
      if (heroMedia && !reduced && y < window.innerHeight * 1.4) {
        const shift = Math.min(y * 0.2, 95);
        heroMedia.style.transform = 'translate3d(0,' + shift.toFixed(1) + 'px,0)';
      }
      updateRoad();
      ticking = false;
    };
    const requestScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } };
    window.addEventListener('scroll', requestScroll, { passive: true });
    window.addEventListener('resize', requestScroll);

    if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));

    /* --------------------------------------------------- link da página atual */
    const here = (window.location.pathname.split('/').pop() || '').toLowerCase();
    const isHome = !here || here === 'index.html' || here === 'jhonny.html';
    $$('.nav-links a').forEach(link => {
      const href = (link.getAttribute('href') || '').toLowerCase();
      const own = href.split('#')[0];
      if (own === here || (isHome && (own === 'jhonny.html' || href === '#inicio'))) link.classList.add('is-active');
    });

    /* -------------------------------------------------------- menu mobile */
    const navLinks = $('.nav-links');
    const toggle = $('.nav-toggle');
    const backdrop = $('.nav-backdrop');
    const setMenu = open => {
      if (!navLinks || !toggle) return;
      navLinks.classList.toggle('is-open', open);
      toggle.classList.toggle('is-open', open);
      if (backdrop) backdrop.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      doc.body.style.overflow = open ? 'hidden' : '';
    };
    if (toggle) toggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('is-open')));
    if (backdrop) backdrop.addEventListener('click', () => setMenu(false));
    if (navLinks) navLinks.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
    /* o header fica acima do backdrop: clicar no espaço vazio dele também fecha */
    const headerBar = $('.site-header');
    if (headerBar && navLinks) headerBar.addEventListener('click', e => {
      if (navLinks.classList.contains('is-open') && !e.target.closest('.nav-toggle, .nav-links')) setMenu(false);
    });

    /* ------------------------------------------------------- revelar ao rolar */
    const revealTargets = $$('.reveal, .reveal-group, .reveal-x, .reveal-scale');
    if ('IntersectionObserver' in window && !reduced) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        });
      }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
      revealTargets.forEach(el => io.observe(el));
    } else {
      revealTargets.forEach(el => el.classList.add('is-in'));
    }

    /* ------------------------------------------------------------ contadores */
    const counters = $$('[data-count]');
    const runCount = el => {
      if (el.dataset.ran) return;
      el.dataset.ran = '1';
      const target = Number(el.dataset.count) || 0;
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const paint = value => { el.textContent = prefix + Math.round(value).toLocaleString('pt-BR') + suffix; };
      if (reduced) { paint(target); return; }
      let done = false;
      const start = performance.now();
      const duration = 1900;
      const step = now => {
        if (done) return;
        const p = clamp((now - start) / duration, 0, 1);
        paint(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
        else { done = true; paint(target); }
      };
      requestAnimationFrame(step);
      /* rede de segurança: se o rAF parar (aba em segundo plano), o número
         final é pintado assim que o tempo da animação passa */
      setTimeout(() => { done = true; paint(target); }, duration + 200);
    };
    if ('IntersectionObserver' in window) {
      const co = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          runCount(entry.target);
          co.unobserve(entry.target);
        });
      }, { threshold: .4 });
      counters.forEach(el => co.observe(el));
    } else {
      counters.forEach(runCount);
    }

    /* ------------------------------------- rede de segurança (fallback de rolagem)
       Se o IntersectionObserver não entregar o cruzamento (rolagem muito rápida,
       aba em segundo plano, iframe, navegador antigo), nada pode ficar escondido:
       a cada rolagem revelamos o que já passou do alto da tela e disparamos o que
       entrou na área de visão.                                                     */
    let sweepTimer = null;
    const sweep = () => {
      sweepTimer = null;
      const h = window.innerHeight;
      revealTargets.forEach(el => {
        if (!el.classList.contains('is-in') && el.getBoundingClientRect().top < h * 0.94) {
          el.classList.add('is-in');
        }
      });
      counters.forEach(el => {
        if (!el.dataset.ran && el.getBoundingClientRect().top < h * 0.9) runCount(el);
      });
    };
    const queueSweep = () => { if (sweepTimer === null) sweepTimer = setTimeout(sweep, 120); };
    window.addEventListener('scroll', queueSweep, { passive: true });
    window.addEventListener('resize', queueSweep);
    sweep();

    /* -------------------------------------------------------- toast helper */
    /* (declarado acima; usado por filtros, favoritos e formulários) */

    /* ------------------------------------------------------ filtros de viagens */
    $$('.chips').forEach(group => {
      const scope = group.closest('section') || doc;
      const cards = $$('.trip-card[data-cat]', scope);
      const chips = $$('.chip', group);
      chips.forEach(chip => chip.addEventListener('click', () => {
        const filter = chip.dataset.filter || 'todos';
        chips.forEach(c => {
          const active = c === chip;
          c.classList.toggle('is-active', active);
          c.setAttribute('aria-pressed', String(active));
        });
        let visible = 0;
        cards.forEach(card => {
          const show = filter === 'todos' || card.dataset.cat === filter;
          card.classList.toggle('is-hidden', !show);
          if (show) { visible++; card.classList.add('is-in'); }
        });
        toast(filter === 'todos'
          ? 'Mostrando todas as viagens (' + visible + ')'
          : 'Filtro “' + chip.textContent.trim() + '”: ' + visible + (visible === 1 ? ' viagem encontrada' : ' viagens encontradas'));
      }));
    });

    /* --------------------------------------------------------- favoritos ♥ */
    const FAV_KEY = 'jhonnytur:favoritos';
    const readFavs = () => { try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch (e) { return []; } };
    let favs = readFavs();
    const saveFavs = () => { try { localStorage.setItem(FAV_KEY, JSON.stringify(favs)); } catch (e) { /* modo privado */ } };

    const favButtons = $$('.fav');
    const paintFavs = () => favButtons.forEach(btn => {
      const on = favs.indexOf(btn.dataset.fav) > -1;
      btn.classList.toggle('is-fav', on);
      btn.setAttribute('aria-pressed', String(on));
      btn.setAttribute('title', on ? 'Remover dos favoritos' : 'Salvar nos favoritos');
    });
    favButtons.forEach(btn => btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const id = btn.dataset.fav;
      const name = btn.dataset.name || 'destino';
      const pos = favs.indexOf(id);
      if (pos > -1) {
        favs.splice(pos, 1);
        toast('Removido dos favoritos: ' + name);
      } else {
        favs.push(id);
        btn.classList.remove('is-pop');
        void btn.offsetWidth;
        btn.classList.add('is-pop');
        toast('♥ ' + name + ' salvo nos favoritos');
      }
      saveFavs();
      paintFavs();
    }));
    paintFavs();

    /* ------------------------------------------------------------- modal */
    const modal = doc.createElement('div');
    modal.className = 'modal';
    modal.setAttribute('aria-hidden', 'true');
    doc.body.appendChild(modal);
    let lastFocused = null;

    const openModal = ({ img, eyebrow, title, body, actions }) => {
      lastFocused = doc.activeElement;
      modal.innerHTML =
        '<div class="modal-card" role="dialog" aria-modal="true" aria-label="' + title.replace(/"/g, '&quot;') + '">' +
          '<button class="modal-close" type="button" aria-label="Fechar">✕</button>' +
          '<div class="modal-media">' +
            (img ? '<img src="' + img + '" alt="">' : '') +
            '<div class="m-title"><small>' + eyebrow + '</small><h3>' + title + '</h3></div>' +
          '</div>' +
          '<div class="modal-body">' + body +
            '<div class="modal-actions">' + actions + '</div>' +
          '</div>' +
        '</div>';
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      doc.body.style.overflow = 'hidden';
      const closeBtn = $('.modal-close', modal);
      if (closeBtn) closeBtn.focus({ preventScroll: true });
      $$('.modal-close, .js-close-modal', modal).forEach(b => b.addEventListener('click', closeModal));
    };

    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      doc.body.style.overflow = '';
      if (lastFocused && lastFocused.focus) lastFocused.focus({ preventScroll: true });
    }
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

    doc.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        if (modal.classList.contains('is-open')) closeModal();
        if (navLinks && navLinks.classList.contains('is-open')) setMenu(false);
      }
    });

    /* --------------------------------------------- modal de roteiro (viagem) */
    $$('.btn-detail').forEach(btn => btn.addEventListener('click', e => {
      e.preventDefault();
      const card = btn.closest('.trip-card, .offer-card');
      if (!card) return;
      const title = card.dataset.title || ($('h3', card) ? $('h3', card).textContent.trim() : 'Viagem');
      const img = card.dataset.img || ($('img', card) ? $('img', card).src : '');
      const eyebrow = card.dataset.meta || 'Viagem de ônibus em grupo';
      const desc = card.dataset.desc || '';
      const price = card.dataset.price || 'Consulte';
      const itin = (card.dataset.itin || '').split('||').filter(Boolean);
      const incl = (card.dataset.incl || '').split('||').filter(Boolean);

      const body =
        (desc ? '<p style="color:var(--muted);font-size:.94rem;margin-bottom:22px">' + desc + '</p>' : '') +
        '<div class="modal-grid">' +
          '<div><h4>Roteiro</h4><ul class="itin">' +
            (itin.length ? itin.map(step => '<li>' + step + '</li>').join('') : '<li>Roteiro completo disponível com a equipe.</li>') +
          '</ul></div>' +
          '<div><h4>Inclui</h4><ul class="incl">' +
            (incl.length ? incl.map(item => '<li>' + item + '</li>').join('') : '<li>Transporte de ônibus</li><li>Monitoria a bordo</li>') +
          '</ul>' +
          '<div class="modal-box" style="margin-top:18px"><div class="price"><small>A partir de</small><strong>' + price + '</strong></div>' +
          '<p style="font-size:.76rem;color:var(--muted);margin-top:6px">por pessoa • parcelável em 12x</p></div></div>' +
        '</div>';

      const msg = 'Olá! Tenho interesse na viagem: ' + title + '. Pode me passar as datas e condições?';
      const actions =
        '<a class="btn" href="' + waLink(msg) + '" target="_blank" rel="noopener">Reservar pelo WhatsApp <span class="arr">→</span></a>' +
        '<button class="btn btn--line js-close-modal" type="button">Continuar explorando</button>';

      openModal({ img, eyebrow, title, body, actions });
    }));

    /* --------------------------------------------------- modal de vídeos */
    $$('.video-card').forEach(card => card.addEventListener('click', () => {
      const title = card.dataset.title || ($('h3', card) ? $('h3', card).textContent.trim() : 'Vídeo');
      const img = card.dataset.img || ($('img', card) ? $('img', card).src : '');
      const body =
        '<p style="color:var(--muted);font-size:.95rem">A galeria de vídeos da Jhonnytur está sendo preparada. ' +
        'Enquanto isso, fale com a gente e venha vivê-la ao vivo — de ônibus, com conforto e acompanhamento do começo ao fim.</p>';
      const actions =
        '<a class="btn" href="contato.html">Quero minha viagem <span class="arr">→</span></a>' +
        '<button class="btn btn--line js-close-modal" type="button">Fechar</button>';
      openModal({ img, eyebrow: 'Bastidores da Jhonnytur', title, body, actions });
    }));

    /* ------------------------------------------------------- depoimentos */
    const slider = $('[data-slider]');
    if (slider) {
      const track = $('.quote-track', slider);
      const slides = $$('.quote-slide', slider);
      const dotsWrap = $('.qdots', slider);
      let index = 0;
      let timer = null;

      slides.forEach((_, i) => {
        const dot = doc.createElement('button');
        dot.type = 'button';
        dot.className = 'qdot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', 'Depoimento ' + (i + 1));
        dot.addEventListener('click', () => { go(i); restart(); });
        dotsWrap.appendChild(dot);
      });
      const dots = $$('.qdot', dotsWrap);

      function go(i) {
        index = (i + slides.length) % slides.length;
        track.style.transform = 'translateX(' + (-index * 100) + '%)';
        dots.forEach((d, di) => d.classList.toggle('is-active', di === index));
      }
      const next = () => go(index + 1);
      const prev = () => go(index - 1);
      const start = () => { if (!reduced) timer = setInterval(next, 6500); };
      const stop = () => { clearInterval(timer); timer = null; };
      const restart = () => { stop(); start(); };

      const nextBtn = $('[data-next]', slider);
      const prevBtn = $('[data-prev]', slider);
      if (nextBtn) nextBtn.addEventListener('click', () => { next(); restart(); });
      if (prevBtn) prevBtn.addEventListener('click', () => { prev(); restart(); });
      slider.addEventListener('mouseenter', stop);
      slider.addEventListener('mouseleave', start);
      slider.addEventListener('focusin', stop);
      slider.addEventListener('focusout', start);

      let startX = null;
      slider.addEventListener('touchstart', e => { startX = e.touches[0].clientX; stop(); }, { passive: true });
      slider.addEventListener('touchend', e => {
        if (startX === null) return;
        const delta = e.changedTouches[0].clientX - startX;
        if (Math.abs(delta) > 45) { delta < 0 ? next() : prev(); }
        startX = null;
        start();
      });
      start();
    }

    /* --------------------------------------------------------------- FAQ */
    $$('.faq-item').forEach(item => {
      const btn = $('.faq-q', item);
      if (!btn) return;
      btn.addEventListener('click', () => {
        const open = item.classList.contains('is-open');
        $$('.faq-item').forEach(other => {
          other.classList.remove('is-open');
          const b = $('.faq-q', other);
          if (b) b.setAttribute('aria-expanded', 'false');
        });
        if (!open) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });

    /* ------------------------------------------------ newsletter (CTA) */
    const newsletter = $('.cta-form');
    if (newsletter) {
      newsletter.addEventListener('submit', e => {
        e.preventDefault();
        const input = $('input', newsletter);
        const button = $('button', newsletter);
        const email = (input.value || '').trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          input.focus();
          toast('Confira o e-mail informado para receber as ofertas.');
          return;
        }
        button.disabled = true;
        button.textContent = 'Inscrito ✓';
        toast('Inscrição confirmada! Em breve você recebe nossas ofertas.');
        newsletter.reset();
        setTimeout(() => { button.disabled = false; button.textContent = 'Inscrever-se'; }, 3000);
      });
    }

    /* ------------------------------------------------- formulário de contato */
    const contactForm = $('.contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', e => {
        e.preventDefault();
        const val = name => { const f = contactForm.querySelector('[name="' + name + '"]'); return f ? f.value.trim() : ''; };
        const nome = val('nome');
        if (!nome) { contactForm.querySelector('[name="nome"]').focus(); toast('Digite seu nome para continuarmos.'); return; }
        let msg = 'Olá! Aqui é ' + nome + '.';
        if (val('destino')) msg += ' Tenho interesse em: ' + val('destino') + '.';
        if (val('pessoas')) msg += ' Serão ' + val('pessoas') + ' pessoa(s).';
        if (val('mensagem')) msg += ' ' + val('mensagem');
        window.open(waLink(msg), '_blank', 'noopener');
        toast('Tudo certo! Abrindo o WhatsApp com sua mensagem…');
      });
    }

    /* ------------------------------------- destino vindo da busca (?destino=) */
    const params = new URLSearchParams(window.location.search);
    const wanted = params.get('destino');
    if (wanted) {
      const cards = $$('.trip-card[data-title]');
      const match = cards.find(card => norm(card.dataset.title).indexOf(norm(wanted)) > -1);
      const target = match || null;
      setTimeout(() => {
        if (target) {
          const grid = target.closest('.trip-grid');
          if (grid) grid.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
          setTimeout(() => {
            target.classList.add('is-flash');
            setTimeout(() => target.classList.remove('is-flash'), 1600);
          }, reduced ? 0 : 600);
          toast('Encontramos uma viagem para “' + target.dataset.title + '” 🚌');
        } else {
          toast('Ainda não temos "' + wanted + '" no catálogo — fale com a equipe!');
        }
      }, 400);
    }

    /* ------------------------------------------------ estrada animada (passo a passo) */
    const road = $('.route-road');
    function updateRoad() {
      if (!road) return;
      const section = road.closest('.route') || road;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = clamp((vh * 0.82 - rect.top) / Math.max(rect.height * 0.7, 1), 0, 1);
      road.style.setProperty('--p', p.toFixed(4));
    }
    updateRoad();
    onScroll();

    /* ------------------------------------------------------- tilt nos cards */
    if (finePointer && !reduced) {
      $$('.trip-card, .feature, .offer-card').forEach(card => {
        card.addEventListener('mousemove', e => {
          const r = card.getBoundingClientRect();
          const rx = ((e.clientY - r.top) / r.height - .5) * -6;
          const ry = ((e.clientX - r.left) / r.width - .5) * 8;
          card.classList.add('is-tilt');
          const lift = card.classList.contains('trip-card') || card.classList.contains('offer-card') ? -10 : -8;
          card.style.transform = 'translateY(' + lift + 'px) perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
        });
        card.addEventListener('mouseleave', () => {
          card.classList.remove('is-tilt');
          card.style.transform = '';
        });
      });
    }

    /* --------------------------------------------- cortina entre páginas */
    let curtain = $('.page-wipe');
    if (!curtain) {
      curtain = doc.createElement('div');
      curtain.className = 'page-wipe';
      curtain.setAttribute('aria-hidden', 'true');
      doc.body.appendChild(curtain);
    }
    setTimeout(() => curtain.classList.add('is-out'), 60);

    if (!reduced) {
      $$('a[href]').forEach(link => {
        const href = (link.getAttribute('href') || '').trim();
        const external = /^(https?:|mailto:|tel:|\/\/)/i.test(href) || link.target === '_blank' || link.hasAttribute('download');
        if (external || href.charAt(0) === '#' || !/\.html/i.test(href)) return;
        if (href.split('#')[0].split('/').pop().toLowerCase() === here) return;
        link.addEventListener('click', e => {
          if (e.defaultPrevented) return;
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
          e.preventDefault();
          doc.body.classList.add('is-leaving');
          curtain.classList.remove('is-out');
          void curtain.offsetWidth;
          curtain.classList.add('is-in');
          setTimeout(() => { window.location.href = href; }, 380);
        });
      });
    }

    /* ---------------------------------------------------- marca no console */
    console.log('%c🚌 Jhonnytur', 'font-size:22px;font-weight:800;color:#0b2447;');
    console.log('%c“Viagens de ônibus que viram histórias para contar.”', 'font-size:13px;color:#61748d;');
  });
})();
