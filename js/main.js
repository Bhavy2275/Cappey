/**
 * CAPPEY INDIA PRIVATE LIMITED - CORE JAVASCRIPT
 * Responsive Navigation, Interactive Configurators, Tabs & Modals
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Header Scroll Effect
  const header = document.querySelector('.cappey-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  // 2. Mobile Drawer Navigation
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerClose = document.getElementById('drawerClose');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const drawerLinks = mobileDrawer?.querySelectorAll('a[href]') || [];

  function setBodyLocked(locked) {
    document.body.style.overflow = locked ? 'hidden' : '';
  }

  function openDrawer() {
    mobileDrawer?.classList.add('open');
    drawerBackdrop?.classList.add('active');
    mobileDrawer?.removeAttribute('inert');
    mobileDrawer?.setAttribute('aria-hidden', 'false');
    mobileToggle?.setAttribute('aria-expanded', 'true');
    setBodyLocked(true);
    drawerClose?.focus();
  }

  function closeDrawer() {
    mobileDrawer?.classList.remove('open');
    drawerBackdrop?.classList.remove('active');
    mobileDrawer?.setAttribute('inert', '');
    mobileDrawer?.setAttribute('aria-hidden', 'true');
    mobileToggle?.setAttribute('aria-expanded', 'false');
    setBodyLocked(Boolean(quoteModal?.classList.contains('active')));
    mobileToggle?.focus();
  }

  mobileToggle?.addEventListener('click', openDrawer);
  drawerClose?.addEventListener('click', closeDrawer);
  drawerBackdrop?.addEventListener('click', closeDrawer);
  drawerLinks.forEach(link => link.addEventListener('click', closeDrawer));

  // 3. Modal Manager (Request Quote / Inquiry)
  const quoteModal = document.getElementById('quoteModal');
  const quoteTriggers = document.querySelectorAll('.open-quote-modal');
  const modalClose = document.getElementById('modalClose');
  let modalReturnFocus = null;

  function openModal(defaultService = '') {
    modalReturnFocus = document.activeElement;
    const serviceSelect = document.getElementById('modalServiceSelect');
    if (serviceSelect && defaultService) {
      const normalizedService = /elevator|lift/i.test(defaultService)
        ? 'Elevators'
        : /audio|visual|\bav\b/i.test(defaultService) ? 'Audio Visual' : defaultService;
      if ([...serviceSelect.options].some(option => option.value === normalizedService)) {
        serviceSelect.value = normalizedService;
      }
    }
    quoteModal?.classList.add('active');
    quoteModal?.setAttribute('aria-hidden', 'false');
    quoteModal?.removeAttribute('inert');
    setBodyLocked(true);
    quoteModal?.querySelector('input, select, textarea, button')?.focus();
  }

  function closeModal() {
    quoteModal?.classList.remove('active');
    quoteModal?.setAttribute('aria-hidden', 'true');
    quoteModal?.setAttribute('inert', '');
    setBodyLocked(Boolean(mobileDrawer?.classList.contains('open')));
    modalReturnFocus?.focus();
  }

  quoteTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const service = btn.getAttribute('data-service') || '';
      openModal(service);
    });
  });

  modalClose?.addEventListener('click', closeModal);
  quoteModal?.addEventListener('click', (e) => {
    if (e.target === quoteModal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (quoteModal?.classList.contains('active')) closeModal();
      else if (mobileDrawer?.classList.contains('open')) closeDrawer();
      return;
    }

    const activeDialog = quoteModal?.classList.contains('active')
      ? quoteModal
      : mobileDrawer?.classList.contains('open') ? mobileDrawer : null;
    if (e.key !== 'Tab' || !activeDialog) return;

    const focusable = [...activeDialog.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  let fieldCount = 0;
  document.querySelectorAll('.form-group').forEach(group => {
    const label = group.querySelector('label');
    const control = group.querySelector('input, select, textarea');
    if (!label || !control) return;
    if (!control.id) control.id = `field-${++fieldCount}`;
    label.htmlFor = control.id;
  });

  document.querySelectorAll('.drawer-link.active, .nav-link.active').forEach(link => {
    link.setAttribute('aria-current', 'page');
  });

  // 4. Toast Notification
  function showToast(message) {
    let toast = document.getElementById('toastNotice');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toastNotice';
      toast.className = 'toast-notice';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      toast.innerHTML = `
        <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <circle cx="12" cy="12" r="9" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 11v5m0-8h.01" />
        </svg>
        <span id="toastMsg"></span>
      `;
      document.body.appendChild(toast);
    }
    const msgElem = toast.querySelector('#toastMsg');
    if (msgElem) msgElem.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4500);
  }

  // 5. Configurator and Form Handlers
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('This request form is a preview and has not been sent. Call +91 8400000054 to reach our team.');
    });
  });

  // 6. Interactive Elevator Configurator Realtime Calculation
  const stopsInput = document.getElementById('elevStops');
  const speedOutput = document.getElementById('calcSpeed');
  const driveOutput = document.getElementById('calcDrive');

  function updateElevatorSpecs() {
    if (!stopsInput || !speedOutput) return;
    const stops = parseInt(stopsInput.value, 10) || 2;
    if (stops <= 4) {
      speedOutput.textContent = '0.65 m/s';
      if (driveOutput) driveOutput.textContent = 'Pneumatic / Traction VVVF';
    } else if (stops <= 10) {
      speedOutput.textContent = '1.0 - 1.5 m/s';
      if (driveOutput) driveOutput.textContent = 'Gearless PMSM Synchronous';
    } else {
      speedOutput.textContent = '1.75 - 2.5 m/s';
      if (driveOutput) driveOutput.textContent = 'High-Speed PMSM with Regenerative Drive';
    }
  }

  stopsInput?.addEventListener('input', updateElevatorSpecs);
  updateElevatorSpecs();

  // 7. Filter Tabs for AV Market Segments
  const filterBtns = document.querySelectorAll('.filter-tab-btn');
  const filterCards = document.querySelectorAll('.filterable-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      const targetCategory = btn.getAttribute('data-filter') || 'all';
      filterCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (targetCategory === 'all' || cat === targetCategory) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
});
