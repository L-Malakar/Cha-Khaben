/* =========================================================
   Cha Khaben — Modal controller
   Powers the "Brewing" and "Order Now" buttons: accessible
   dialogs with focus trapping, ESC-to-close, backdrop click,
   and a client-side order form with validation + confirmation.

   Note: there is no backend wired up in this project, so the
   order form simulates submission locally. To take real orders,
   point the fetch() call in handleOrderSubmit() at your own
   endpoint (e.g. a serverless function, Formspree, or a store
   API) — everything else (validation, UI states) already works.
   ========================================================= */
(function () {
  'use strict';

  var lastFocusedEl = null;
  var openBackdrop = null;

  function getFocusable(container) {
    return Array.prototype.slice.call(
      container.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(function (el) { return el.offsetParent !== null; });
  }

  function openModal(backdrop) {
    if (!backdrop) return;
    lastFocusedEl = document.activeElement;
    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');
    openBackdrop = backdrop;
    document.body.style.overflow = 'hidden';

    var focusables = getFocusable(backdrop);
    if (focusables.length) focusables[0].focus();

    document.addEventListener('keydown', handleKeydown);
  }

  function closeModal(backdrop) {
    if (!backdrop) return;
    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');
    openBackdrop = null;
    document.body.style.overflow = '';
    document.removeEventListener('keydown', handleKeydown);
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  function handleKeydown(e) {
    if (!openBackdrop) return;

    if (e.key === 'Escape') {
      closeModal(openBackdrop);
      return;
    }

    if (e.key === 'Tab') {
      var focusables = getFocusable(openBackdrop);
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  /* ===== Wire up every trigger / close button / backdrop ===== */
  document.querySelectorAll('[data-modal-target]').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var target = document.getElementById(trigger.getAttribute('data-modal-target'));
      openModal(target);
    });
  });

  document.querySelectorAll('.modal-backdrop').forEach(function (backdrop) {
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) closeModal(backdrop);
    });
    backdrop.querySelectorAll('[data-modal-close]').forEach(function (btn) {
      btn.addEventListener('click', function () { closeModal(backdrop); });
    });
  });

  /* ===== Order form ===== */
  var orderForm = document.getElementById('orderForm');
  var orderSuccess = document.getElementById('orderSuccess');
  var orderError = document.getElementById('orderError');
  var orderSummary = document.getElementById('orderSummary');

  if (orderForm) {
    orderForm.addEventListener('submit', handleOrderSubmit);
  }

  function handleOrderSubmit(e) {
    e.preventDefault();
    orderError.textContent = '';

    var name = orderForm.elements['name'].value.trim();
    var email = orderForm.elements['email'].value.trim();
    var blend = orderForm.elements['blend'].value;
    var quantity = orderForm.elements['quantity'].value;

    if (!name || !email || !blend || !quantity) {
      orderError.textContent = 'Please fill in your name, email, blend, and quantity.';
      return;
    }

    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      orderError.textContent = 'That email address doesn\u2019t look right — please double-check it.';
      return;
    }

    var submitBtn = orderForm.querySelector('.form-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Placing order…';

    /* -----------------------------------------------------------
       No backend is connected in this project, so we simulate the
       network round-trip and show a confirmation. Swap this
       setTimeout block for a real fetch() to your order endpoint
       when one exists, e.g.:

       fetch('/api/orders', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ name, email, blend, quantity, notes })
       }).then(...).catch(...)
       ----------------------------------------------------------- */
    setTimeout(function () {
      orderSummary.textContent =
        'Thanks, ' + name + '! We\u2019ve noted your order for ' + quantity + ' \u00d7 ' + blend +
        '. A confirmation will be sent to ' + email + '.';
      orderForm.classList.add('hidden');
      orderSuccess.classList.add('visible');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirm Order';
    }, 600);
  }

  var orderAgainBtn = document.getElementById('orderAgainBtn');
  if (orderAgainBtn) {
    orderAgainBtn.addEventListener('click', function () {
      orderForm.reset();
      orderForm.classList.remove('hidden');
      orderSuccess.classList.remove('visible');
    });
  }
})();