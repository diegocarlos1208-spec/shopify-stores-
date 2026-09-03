/* Spicy Lip Plumper — storefront JS
   - product bundle/variant selector -> updates hidden id + price + Add to Cart label
   - quantity stepper
   No dependencies. Guards on every element so it is safe on pages without a product form. */
(function () {
  'use strict';

  function money(cents, format) {
    var value = (cents / 100).toFixed(2);
    if (format && format.indexOf('{{amount}}') !== -1) return format.replace('{{amount}}', value);
    return '$' + value;
  }

  function initProductForm() {
    var form = document.getElementById('product-form');
    if (!form) return;

    var idField = form.querySelector('#variant-id');
    var priceNow = document.getElementById('priceNow');
    var priceWas = document.getElementById('priceWas');
    var addBtn = document.getElementById('addBtn');
    var addBtnPrice = document.getElementById('addBtnPrice');
    var qtyInput = document.getElementById('quantity');
    var moneyFormat = form.getAttribute('data-money-format') || '${{amount}}';

    var radios = form.querySelectorAll('input[name="variant-radio"]');
    var subRadios = form.querySelectorAll('input[name="purchase-type"]');
    var sellingPlanInput = document.getElementById('selling-plan-input');

    function currentQty() {
      var q = parseInt(qtyInput && qtyInput.value, 10);
      return isNaN(q) || q < 1 ? 1 : q;
    }

    function subscribeActive() {
      var checked = form.querySelector('input[name="purchase-type"]:checked');
      return checked ? checked.value === 'subscribe' : false;
    }

    function syncSellingPlan() {
      var checked = form.querySelector('input[name="purchase-type"]:checked');
      var plan = checked ? (checked.getAttribute('data-selling-plan') || '') : '';
      form.querySelectorAll('.subopt').forEach(function (s) { s.classList.remove('active'); });
      if (checked) {
        var lbl = checked.closest('.subopt');
        if (lbl) lbl.classList.add('active');
      }
      if (sellingPlanInput) {
        if (plan) { sellingPlanInput.value = plan; sellingPlanInput.disabled = false; }
        else { sellingPlanInput.value = ''; sellingPlanInput.disabled = true; }
      }
    }

    function apply(radio) {
      if (!radio) return;
      var price = parseInt(radio.getAttribute('data-price'), 10);
      var subPrice = parseInt(radio.getAttribute('data-sub-price'), 10);
      var compare = parseInt(radio.getAttribute('data-compare'), 10);
      var available = radio.getAttribute('data-available') === 'true';
      var isSub = subscribeActive() && !isNaN(subPrice);
      var eff = isSub ? subPrice : price;

      if (idField) idField.value = radio.value;

      form.querySelectorAll('.bundle').forEach(function (b) { b.classList.remove('active'); });
      var label = radio.closest('.bundle');
      if (label) label.classList.add('active');

      if (priceNow && !isNaN(eff)) priceNow.textContent = money(eff * currentQty(), moneyFormat);
      if (priceWas) {
        var wasVal = isSub && !isNaN(price) ? price : compare;
        if (!isNaN(wasVal) && wasVal > eff) {
          priceWas.textContent = money(wasVal * currentQty(), moneyFormat);
          priceWas.style.display = '';
        } else {
          priceWas.style.display = 'none';
        }
      }
      if (addBtnPrice && !isNaN(eff)) addBtnPrice.textContent = ' — ' + money(eff * currentQty(), moneyFormat);
      if (addBtn) {
        addBtn.disabled = !available;
        addBtn.textContent = '';
        var span = document.createElement('span');
        span.textContent = available ? (addBtn.getAttribute('data-label') || 'Add to Cart') : 'Sold out';
        addBtn.appendChild(span);
        if (available && addBtnPrice) { var p = addBtnPrice.cloneNode(true); addBtn.appendChild(p); }
      }
    }

    function currentVariantRadio() {
      return form.querySelector('input[name="variant-radio"]:checked') || radios[0];
    }

    radios.forEach(function (r) {
      r.addEventListener('change', function () { apply(r); });
    });
    subRadios.forEach(function (r) {
      r.addEventListener('change', function () { syncSellingPlan(); apply(currentVariantRadio()); });
    });
    // clicking anywhere on a .subopt label selects its radio
    form.querySelectorAll('.subopt').forEach(function (lbl) {
      lbl.addEventListener('click', function () {
        var input = lbl.querySelector('input[name="purchase-type"]');
        if (input && !input.checked) { input.checked = true; syncSellingPlan(); apply(currentVariantRadio()); }
      });
    });
    syncSellingPlan();

    // quantity stepper
    var minus = document.getElementById('qtyMinus');
    var plus = document.getElementById('qtyPlus');
    if (minus && qtyInput) minus.addEventListener('click', function () {
      qtyInput.value = Math.max(1, currentQty() - 1);
      apply(form.querySelector('input[name="variant-radio"]:checked') || radios[0]);
    });
    if (plus && qtyInput) plus.addEventListener('click', function () {
      qtyInput.value = currentQty() + 1;
      apply(form.querySelector('input[name="variant-radio"]:checked') || radios[0]);
    });
    if (qtyInput) qtyInput.addEventListener('input', function () {
      apply(form.querySelector('input[name="variant-radio"]:checked') || radios[0]);
    });

    apply(form.querySelector('input[name="variant-radio"]:checked') || radios[0]);
  }

  function initGallery() {
    var gallery = document.getElementById('pdp-gallery');
    if (!gallery) return;
    var mainImg = gallery.querySelector('.main img');
    var thumbs = gallery.querySelectorAll('.pdp-thumb');
    thumbs.forEach(function (t) {
      t.addEventListener('click', function () {
        var full = t.getAttribute('data-full');
        if (mainImg && full) {
          // Shopify's image_tag output carries a srcset/sizes, so the browser
          // ignores a plain .src change — strip them before swapping.
          mainImg.removeAttribute('srcset');
          mainImg.removeAttribute('sizes');
          mainImg.removeAttribute('data-srcset');
          mainImg.src = full.indexOf('//') === 0 ? window.location.protocol + full : full;
        }
        thumbs.forEach(function (x) { x.classList.remove('active'); });
        t.classList.add('active');
      });
    });
  }

  /* ---------------- Slide-in cart drawer ---------------- */
  function initCartDrawer() {
    var drawer = document.getElementById('cart-drawer');
    if (!drawer) return;

    var itemsEl = drawer.querySelector('[data-cd-items]');
    var emptyEl = drawer.querySelector('[data-cd-empty]');
    var footEl = drawer.querySelector('[data-cd-foot]');
    var subtotalEl = drawer.querySelector('[data-cd-subtotal]');
    var lastFocus = null;

    function fmt(cents) { return money(cents, '${{amount}}'); }

    function setCounts(n) {
      document.querySelectorAll('[data-cd-count]').forEach(function (el) {
        el.textContent = n;
        el.classList.toggle('is-zero', n === 0);
      });
    }

    function open() {
      lastFocus = document.activeElement;
      drawer.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('cd-lock');
      var closeBtn = drawer.querySelector('[data-cd-close]');
      if (closeBtn) closeBtn.focus();
    }
    function close() {
      drawer.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('cd-lock');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    function lineHTML(it) {
      var img = it.image ? it.image + (it.image.indexOf('?') > -1 ? '&' : '?') + 'width=120' : '';
      var variant = (it.variant_title && it.variant_title !== 'Default Title') ? '<div class="cd-item__meta">' + it.variant_title + '</div>' : '';
      var sub = it.selling_plan_allocation ? '<div class="cd-item__sub">&#8635; ' + it.selling_plan_allocation.selling_plan.name + '</div>' : '';
      return '' +
        '<div class="cd-item" data-key="' + it.key + '">' +
          (img ? '<img class="cd-item__img" src="' + img + '" alt="" width="60" height="60">' : '<div class="cd-item__img"></div>') +
          '<div class="cd-item__body">' +
            '<div class="cd-item__title">' + it.product_title + '</div>' +
            variant + sub +
            '<div class="cd-item__row">' +
              '<div class="cd-qty">' +
                '<button type="button" data-cd-dec aria-label="Decrease">&minus;</button>' +
                '<span>' + it.quantity + '</span>' +
                '<button type="button" data-cd-inc aria-label="Increase">+</button>' +
              '</div>' +
              '<span class="cd-item__price">' + fmt(it.final_line_price) + '</span>' +
            '</div>' +
            '<button type="button" class="cd-item__remove" data-cd-remove>Remove</button>' +
          '</div>' +
        '</div>';
    }

    function render(cart) {
      setCounts(cart.item_count);
      if (cart.item_count === 0) {
        itemsEl.innerHTML = '';
        emptyEl.hidden = false;
        footEl.hidden = true;
        return;
      }
      emptyEl.hidden = true;
      footEl.hidden = false;
      itemsEl.innerHTML = cart.items.map(lineHTML).join('');
      if (subtotalEl) subtotalEl.textContent = fmt(cart.total_price);
    }

    function getCart() {
      return fetch('/cart.js', { headers: { 'Accept': 'application/json' } }).then(function (r) { return r.json(); });
    }
    function refresh() { return getCart().then(render); }

    function changeLine(key, qty) {
      itemsEl.classList.add('is-busy');
      return fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ id: key, quantity: qty })
      }).then(function (r) { return r.json(); }).then(function (cart) {
        itemsEl.classList.remove('is-busy');
        render(cart);
      });
    }

    // open triggers
    document.querySelectorAll('[data-cd-open]').forEach(function (btn) {
      btn.addEventListener('click', function (e) { e.preventDefault(); refresh().then(open); });
    });
    // close triggers
    drawer.querySelectorAll('[data-cd-close]').forEach(function (btn) {
      btn.addEventListener('click', close);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.getAttribute('aria-hidden') === 'false') close();
    });

    // line item controls (delegated)
    itemsEl.addEventListener('click', function (e) {
      var row = e.target.closest('.cd-item');
      if (!row) return;
      var key = row.getAttribute('data-key');
      var qtyEl = row.querySelector('.cd-qty span');
      var qty = parseInt(qtyEl && qtyEl.textContent, 10) || 1;
      if (e.target.closest('[data-cd-inc]')) changeLine(key, qty + 1);
      else if (e.target.closest('[data-cd-dec]')) changeLine(key, Math.max(0, qty - 1));
      else if (e.target.closest('[data-cd-remove]')) changeLine(key, 0);
    });

    // intercept the product form -> AJAX add -> open drawer
    var form = document.getElementById('product-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        var addBtn = document.getElementById('addBtn');
        if (addBtn && addBtn.disabled) return; // sold out -> let it be
        e.preventDefault();

        var idEl = form.querySelector('#variant-id');
        var qEl = form.querySelector('#quantity');
        var spEl = form.querySelector('#selling-plan-input');
        var payload = {
          id: idEl ? idEl.value : (form.querySelector('[name="id"]') || {}).value,
          quantity: parseInt(qEl && qEl.value, 10) || 1
        };
        if (spEl && !spEl.disabled && spEl.value) payload.selling_plan = spEl.value;

        if (addBtn) addBtn.classList.add('is-loading');
        fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        }).then(function (r) {
          if (!r.ok) throw new Error('add failed');
          return getCart();
        }).then(function (cart) {
          if (addBtn) addBtn.classList.remove('is-loading');
          render(cart);
          open();
        }).catch(function () {
          if (addBtn) addBtn.classList.remove('is-loading');
          form.submit(); // fall back to the normal cart page
        });
      });
    }
  }

  function init() { initProductForm(); initGallery(); initCartDrawer(); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
