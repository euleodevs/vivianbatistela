/**
 * Vivian Batistela Advogada - main.js
 * Funcionalidades essenciais do site, incluindo o menu mobile.
 */

(() => {
  // 1. Controle do header no scroll
  const header = document.querySelector('.site-header');
  if (header) {
    let headerTicking = false;
    const handleScroll = () => {
      if (!headerTicking) {
        window.requestAnimationFrame(() => {
          header.classList.toggle('scrolled', window.scrollY > 40);
          headerTicking = false;
        });
        headerTicking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // 2. Menu mobile: inicializado imediatamente, sem esperar as bibliotecas de animação
  const btnToggle = document.querySelector('.btn-mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');
  let navOverlay = document.querySelector('.nav-overlay');
  let lastFocusedElement = null;

  if (!navOverlay && header) {
    navOverlay = document.createElement('div');
    navOverlay.className = 'nav-overlay';
    navOverlay.setAttribute('aria-hidden', 'true');
    header.parentNode.insertBefore(navOverlay, header.nextSibling);
  }

  if (btnToggle && navMenu) {
    const isMobileNav = () => window.innerWidth <= 1024;
    const hasCriticalMenu = window.__menuCritical === true;

    navMenu.id = navMenu.id || 'main-menu';
    btnToggle.type = 'button';
    btnToggle.setAttribute('aria-controls', navMenu.id);

    // Cria o controle do submenu sem duplicar a marcação em todas as páginas estáticas.
    navMenu.querySelectorAll('.nav-item-has-submenu').forEach((item, index) => {
      const submenu = item.querySelector('.nav-submenu');
      const link = item.querySelector('.nav-link');
      if (!submenu || !link || item.querySelector('.submenu-toggle')) return;

      submenu.id = submenu.id || `submenu-${index + 1}`;
      const label = link.textContent.replace('expand_more', '').trim();
      const submenuToggle = document.createElement('button');
      submenuToggle.type = 'button';
      submenuToggle.className = 'submenu-toggle';
      submenuToggle.setAttribute('aria-expanded', 'false');
      submenuToggle.setAttribute('aria-controls', submenu.id);
      submenuToggle.setAttribute('aria-label', `Expandir submenu ${label}`);
      submenuToggle.innerHTML = '<svg class="submenu-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>';
      item.insertBefore(submenuToggle, submenu);
    });

    const updateSubmenuState = (item, isOpen) => {
      const toggle = item.querySelector('.submenu-toggle');
      item.classList.toggle('submenu-aberto', isOpen);
      if (toggle) {
        toggle.setAttribute('aria-expanded', String(isOpen));
        toggle.setAttribute(
          'aria-label',
          isOpen ? 'Recolher submenu Áreas de Atuação' : 'Expandir submenu Áreas de Atuação'
        );
      }
    };

    const closeMenu = (restoreFocus = false) => {
      btnToggle.setAttribute('aria-expanded', 'false');
      btnToggle.setAttribute('aria-label', 'Abrir menu de navegação');
      btnToggle.classList.remove('ativo');
      navMenu.classList.remove('aberto');

      if (navOverlay) {
        navOverlay.classList.remove('ativo');
        navOverlay.setAttribute('aria-hidden', 'true');
      }

      navMenu.querySelectorAll('.nav-item-has-submenu').forEach(item => {
        updateSubmenuState(item, false);
      });

      // Mantém o drawer rolável e bloqueia apenas o fundo da página.
      document.documentElement.classList.remove('menu-travado');

      if (restoreFocus && lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
      }
      lastFocusedElement = null;
    };

    const openMenu = () => {
      lastFocusedElement = document.activeElement;
      btnToggle.setAttribute('aria-expanded', 'true');
      btnToggle.setAttribute('aria-label', 'Fechar menu de navegação');
      btnToggle.classList.add('ativo');
      navMenu.classList.add('aberto');

      if (navOverlay) {
        navOverlay.classList.add('ativo');
        navOverlay.setAttribute('aria-hidden', 'false');
      }

      document.documentElement.classList.add('menu-travado');
    };

    const activateMenu = (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (navMenu.classList.contains('aberto')) {
        closeMenu();
      } else {
        openMenu();
      }
    };

    // pointerup evita a espera do click sintético em alguns navegadores móveis.
    if (!hasCriticalMenu) {
      let lastTouchActivation = 0;
      btnToggle.addEventListener('pointerup', (event) => {
        if (event.pointerType === 'touch' || event.pointerType === 'pen') {
          lastTouchActivation = performance.now();
          activateMenu(event);
        }
      }, { passive: false });
      btnToggle.addEventListener('click', (event) => {
        if (performance.now() - lastTouchActivation < 500) return;
        activateMenu(event);
      });
    }

    if (navOverlay) {
      if (!hasCriticalMenu) {
        navOverlay.addEventListener('click', () => closeMenu());
      }
      navOverlay.addEventListener('touchmove', (event) => {
        event.preventDefault();
      }, { passive: false });
    }

    // Tanto no desktop quanto no mobile, o texto e a setinha controlam o submenu.
    navMenu.querySelectorAll('.nav-item-has-submenu').forEach(item => {
      const submenuToggle = item.querySelector('.submenu-toggle');
      const submenuLink = item.querySelector('.nav-link');
      const toggleSubmenu = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const willOpen = !item.classList.contains('submenu-aberto');
        navMenu.querySelectorAll('.nav-item-has-submenu').forEach(otherItem => {
          if (otherItem !== item) updateSubmenuState(otherItem, false);
        });
        updateSubmenuState(item, willOpen);
        if (!willOpen && !isMobileNav() && submenuLink) submenuLink.blur();
      };

      if (submenuToggle) {
        submenuToggle.addEventListener('click', toggleSubmenu);
      }
      if (submenuLink) {
        const hasLocalAreasSection = submenuLink.getAttribute('href') === '#areas'
          && document.getElementById('areas');

        if (hasLocalAreasSection) {
          submenuLink.addEventListener('click', () => {
            updateSubmenuState(item, false);
            if (isMobileNav()) closeMenu();
          });
        } else {
          submenuLink.addEventListener('click', toggleSubmenu);
        }
      }
    });

    navMenu.querySelectorAll('.nav-submenu-link, .nav-menu > li > .nav-link').forEach(link => {
      if (link.classList.contains('nav-link') && link.closest('.nav-item-has-submenu')) return;
      link.addEventListener('click', () => closeMenu());
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && navMenu.classList.contains('aberto')) {
        closeMenu(true);
      } else if (event.key === 'Escape') {
        navMenu.querySelectorAll('.nav-item-has-submenu').forEach(item => {
          updateSubmenuState(item, false);
        });
      }
    });

    document.addEventListener('click', (event) => {
      if (!event.target.closest('.nav-item-has-submenu')) {
        navMenu.querySelectorAll('.nav-item-has-submenu').forEach(item => {
          updateSubmenuState(item, false);
        });
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024 && navMenu.classList.contains('aberto')) {
        closeMenu();
      }
    }, { passive: true });
  }

  // 3. Cards de serviços: expansão suave e apenas um aberto por vez
  const serviceCards = [...document.querySelectorAll('.card-servico-expandivel')];
  const serviceAnimationTokens = new WeakMap();

  const servicePrefersReducedMotion = () => (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const setServiceCardOpen = (card, isOpen) => {
    const summary = card.querySelector('.card-servico-summary');
    if (!summary) return;

    const token = (serviceAnimationTokens.get(card) || 0) + 1;
    serviceAnimationTokens.set(card, token);
    card.classList.remove('is-entering');
    card.open = isOpen;
    summary.setAttribute('aria-expanded', String(isOpen));

    if (!isOpen || !card.querySelector('.card-servico-details') || servicePrefersReducedMotion()) return;

    card.classList.add('is-entering');
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (serviceAnimationTokens.get(card) === token && card.open) {
          card.classList.remove('is-entering');
        }
      });
    });
  };

  const toggleServiceCard = card => {
    if (card.open) {
      setServiceCardOpen(card, false);
      return;
    }

    serviceCards.forEach(otherCard => {
      if (otherCard.open) setServiceCardOpen(otherCard, false);
    });

    setServiceCardOpen(card, true);
  };

  serviceCards.forEach(card => {
    const summary = card.querySelector('.card-servico-summary');
    if (!summary) return;

    summary.setAttribute('aria-expanded', card.open ? 'true' : 'false');
    summary.addEventListener('click', event => {
      event.preventDefault();
      toggleServiceCard(card);
    });
  });

  // 4. Suporte acessível a detalhes de FAQ
  const faqs = [...document.querySelectorAll('.faq-item')];
  const faqAnimationDuration = 300;
  const faqAnimationEasing = 'cubic-bezier(0.25, 1, 0.5, 1)';
  let faqTransitioning = false;

  const faqPrefersReducedMotion = () => (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const clearFaqAnimationStyles = (answer) => {
    answer.style.removeProperty('height');
    answer.style.removeProperty('overflow');
    answer.style.removeProperty('opacity');
    answer.style.removeProperty('padding-top');
    answer.style.removeProperty('padding-bottom');
    answer.style.removeProperty('transition');
  };

  const waitForFaqTransition = (answer, duration) => new Promise(resolve => {
    if (!duration) {
      resolve();
      return;
    }

    let finished = false;
    let timeoutId;
    const finish = () => {
      if (finished) return;
      finished = true;
      answer.removeEventListener('transitionend', handleTransitionEnd);
      window.clearTimeout(timeoutId);
      resolve();
    };
    const handleTransitionEnd = event => {
      if (event.target === answer && event.propertyName === 'height') finish();
    };

    answer.addEventListener('transitionend', handleTransitionEnd);
    timeoutId = window.setTimeout(finish, duration + 80);
  });

  const animateFaqOpen = faq => {
    const answer = faq.querySelector('.faq-resposta');
    const summary = faq.querySelector('.faq-pergunta');
    if (!answer || !summary) return Promise.resolve();

    const duration = faqPrefersReducedMotion() ? 0 : faqAnimationDuration;
    const computedStyle = window.getComputedStyle(answer);
    const paddingTop = computedStyle.paddingTop;
    const paddingBottom = computedStyle.paddingBottom;

    faq.open = true;
    summary.setAttribute('aria-expanded', 'true');
    const targetHeight = answer.scrollHeight;

    answer.style.overflow = 'hidden';
    answer.style.height = '0px';
    answer.style.opacity = '0';
    answer.style.paddingTop = '0px';
    answer.style.paddingBottom = '0px';
    answer.style.transition = duration
      ? `height ${duration}ms ${faqAnimationEasing}, opacity ${duration}ms ease, padding-top ${duration}ms ${faqAnimationEasing}, padding-bottom ${duration}ms ${faqAnimationEasing}`
      : 'none';

    void answer.offsetHeight;

    if (!duration) {
      answer.style.height = 'auto';
      answer.style.opacity = '1';
      answer.style.paddingTop = paddingTop;
      answer.style.paddingBottom = paddingBottom;
      clearFaqAnimationStyles(answer);
      return Promise.resolve();
    }

    window.requestAnimationFrame(() => {
      answer.style.height = `${targetHeight}px`;
      answer.style.opacity = '1';
      answer.style.paddingTop = paddingTop;
      answer.style.paddingBottom = paddingBottom;
    });

    return waitForFaqTransition(answer, duration).then(() => {
      clearFaqAnimationStyles(answer);
    });
  };

  const animateFaqClose = faq => {
    const answer = faq.querySelector('.faq-resposta');
    const summary = faq.querySelector('.faq-pergunta');
    if (!answer || !summary) return Promise.resolve();

    const duration = faqPrefersReducedMotion() ? 0 : faqAnimationDuration;
    const computedStyle = window.getComputedStyle(answer);
    const paddingTop = computedStyle.paddingTop;
    const paddingBottom = computedStyle.paddingBottom;
    const currentHeight = answer.scrollHeight;

    answer.style.overflow = 'hidden';
    answer.style.height = `${currentHeight}px`;
    answer.style.opacity = '1';
    answer.style.paddingTop = paddingTop;
    answer.style.paddingBottom = paddingBottom;
    answer.style.transition = duration
      ? `height ${duration}ms ${faqAnimationEasing}, opacity ${duration}ms ease, padding-top ${duration}ms ${faqAnimationEasing}, padding-bottom ${duration}ms ${faqAnimationEasing}`
      : 'none';

    void answer.offsetHeight;

    if (!duration) {
      faq.open = false;
      summary.setAttribute('aria-expanded', 'false');
      clearFaqAnimationStyles(answer);
      return Promise.resolve();
    }

    window.requestAnimationFrame(() => {
      answer.style.height = '0px';
      answer.style.opacity = '0';
      answer.style.paddingTop = '0px';
      answer.style.paddingBottom = '0px';
    });

    return waitForFaqTransition(answer, duration).then(() => {
      faq.open = false;
      summary.setAttribute('aria-expanded', 'false');
      clearFaqAnimationStyles(answer);
    });
  };

  const toggleFaq = async faq => {
    if (faqTransitioning) return;
    faqTransitioning = true;

    try {
      if (faq.open) {
        await animateFaqClose(faq);
      } else {
        for (const otherFaq of faqs) {
          if (otherFaq !== faq && otherFaq.open) await animateFaqClose(otherFaq);
        }
        await animateFaqOpen(faq);
      }
    } finally {
      faqTransitioning = false;
    }
  };

  faqs.forEach(faq => {
    const summary = faq.querySelector('.faq-pergunta');
    if (!summary) return;

    summary.setAttribute('aria-expanded', faq.open ? 'true' : 'false');
    summary.addEventListener('click', event => {
      event.preventDefault();
      toggleFaq(faq);
    });
  });

  // 5. Controle de visibilidade do WhatsApp flutuante
  const wppFloat = document.querySelector('.whatsapp-float');
  const heroSection = document.querySelector('.hero-home') || document.querySelector('.servico-hero');
  if (wppFloat) {
    let heroThreshold = 300;
    const updateThreshold = () => {
      if (heroSection) heroThreshold = heroSection.offsetTop + heroSection.offsetHeight - 120;
    };
    updateThreshold();
    window.addEventListener('resize', updateThreshold, { passive: true });

    let wppTicking = false;
    const handleWppVisibility = () => {
      if (!wppTicking) {
        window.requestAnimationFrame(() => {
          wppFloat.classList.toggle('visivel', window.scrollY > heroThreshold);
          wppTicking = false;
        });
        wppTicking = true;
      }
    };
    window.addEventListener('scroll', handleWppVisibility, { passive: true });
    handleWppVisibility();
  }

  // 6. Popup de Comunicado Importante / Alerta de Golpe (exibe após 3s ao acessar ou atualizar)
  const isNotFoundPage = document.title.includes('Página Não Encontrada') || window.location.pathname.endsWith('/404.html');

  if (!isNotFoundPage) {
    const showAlertaModal = () => {
      const overlay = document.createElement('div');
      overlay.className = 'modal-alerta-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-labelledby', 'modal-alerta-titulo');
      overlay.setAttribute('aria-describedby', 'modal-alerta-descricao');

      overlay.innerHTML = `
      <div class="modal-alerta" tabindex="-1">
        <div class="modal-alerta-header">
          <button type="button" class="modal-alerta-close" data-close-alerta aria-label="Fechar alerta de golpe">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <h2 class="modal-alerta-title" id="modal-alerta-titulo">
            <img src="/assets/images/simbolo-vb.webp" alt="" class="modal-alerta-simbolo" width="44" height="31" decoding="async" aria-hidden="true">
            <span>ALERTA DE GOLPE!</span>
          </h2>
        </div>
        <div class="modal-alerta-body" id="modal-alerta-descricao">
          <p class="modal-alerta-intro">
            <strong>Proteja suas informações!</strong> Pessoas mal-intencionadas estão utilizando indevidamente nomes, imagens de advogados e dados de processos judiciais para aplicar fraudes.
          </p>
          <ul class="modal-alerta-lista">
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
              <span>Não faça PIX, pague boletos ou realize depósitos e transferências sem confirmar com o escritório.</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              <span>Nunca compartilhe senhas ou códigos recebidos por SMS ou e-mail.</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
              <span>Não clique em links suspeitos nem forneça dados pessoais a contatos não confirmados.</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><path d="M12 18V6"></path></svg>
              <span>Desconfie de cobranças antecipadas para liberação de valores judiciais.</span>
            </li>
          </ul>
          <p class="modal-alerta-duvida">Na dúvida, entre em contato diretamente com sua advogada!</p>
          <div class="modal-alerta-contato">
            <span class="modal-alerta-contato-label">TELEFONE OFICIAL DO ESCRITÓRIO:</span>
            <span class="modal-alerta-telefone">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3 4.18 2 2 0 0 1 5 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.7 2.61a2 2 0 0 1-.45 2.11L9 9.71a16 16 0 0 0 5.29 5.29l1.27-1.27a2 2 0 0 1 2.11-.45c.83.37 1.71.58 2.61.7A2 2 0 0 1 22 16.92Z"></path></svg>
              <span>(15) 99694-9597</span>
            </span>
          </div>
        </div>
      </div>
    `;

      const previousFocus = document.activeElement;
      let isClosing = false;

      const closeAlertaModal = () => {
        if (isClosing) return;
        isClosing = true;
        overlay.classList.remove('visivel');
        document.documentElement.classList.remove('modal-travado');
        document.removeEventListener('keydown', handleKeydown);
        window.setTimeout(() => {
          overlay.remove();
          if (previousFocus && typeof previousFocus.focus === 'function') {
            previousFocus.focus();
          }
        }, 260);
      };

      const handleKeydown = (event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          closeAlertaModal();
        }
      };

      overlay.addEventListener('click', (event) => {
        if (event.target === overlay || event.target.closest('[data-close-alerta]')) {
          closeAlertaModal();
        }
      });

      document.body.appendChild(overlay);
      document.documentElement.classList.add('modal-travado');
      document.addEventListener('keydown', handleKeydown);

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          overlay.classList.add('visivel');
          const closeBtn = overlay.querySelector('.modal-alerta-close');
          if (closeBtn) closeBtn.focus();
        });
      });
    };

    window.setTimeout(showAlertaModal, 3000);
  }

  document.documentElement.classList.add('js-loaded');
})();
