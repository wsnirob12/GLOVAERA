(function () {
  'use strict';

  async function applyCustomHomepageProducts() {
    const db = window.glovaera?.client || window.GLOVAERA?.client;
    const api = window.GLOVAERA;
    const newEl = document.getElementById('newProducts');
    const bestEl = document.getElementById('bestProducts');
    if (!db || !api?.getProducts || !api?.productCard || (!newEl && !bestEl)) return;

    try {
      const [{ data: row }, products] = await Promise.all([
        db.from('site_settings').select('settings').eq('id', 'global').maybeSingle(),
        api.getProducts()
      ]);

      const cfg = row?.settings?.homepageCollections;
      if (!cfg) return;

      const pick = (ids, limit = 8) => {
        const byId = new Map(products.map(p => [String(p.id), p]));
        return (Array.isArray(ids) ? ids : [])
          .map(id => byId.get(String(id)))
          .filter(Boolean)
          .slice(0, limit);
      };

      if (newEl && cfg.newMode === 'custom') {
        const selected = pick(cfg.newIds);
        newEl.innerHTML = selected.length
          ? selected.map(api.productCard).join('')
          : '<p class="homepage-empty-selection">No products selected yet.</p>';
      }

      if (bestEl && cfg.bestMode === 'custom') {
        const selected = pick(cfg.bestIds);
        bestEl.innerHTML = selected.length
          ? selected.map(api.productCard).join('')
          : '<p class="homepage-empty-selection">No products selected yet.</p>';
      }
    } catch (error) {
      console.warn('Could not apply custom homepage products:', error);
    }
  }

  function start() {
    setTimeout(applyCustomHomepageProducts, 120);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
