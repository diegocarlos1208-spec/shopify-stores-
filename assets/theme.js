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

  function init() { initProductForm(); initGallery(); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
