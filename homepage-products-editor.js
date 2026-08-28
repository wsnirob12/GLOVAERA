(function () {
  'use strict';

  const client = () => window.glovaera?.client || window.GLOVAERA?.client || null;
  let products = [];
  let settings = { newMode: 'auto', bestMode: 'auto', newIds: [], bestIds: [] };

  function esc(value = '') {
    return String(value).replace(/[&<>'"]/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[c]));
  }

  async function load() {
    const db = client();
    if (!db) return;
    const [{ data: settingRow }, productResult] = await Promise.all([
      db.from('site_settings').select('settings').eq('id', 'global').maybeSingle(),
      db.from('products').select('*').eq('active', true).order('created_at', { ascending: false })
    ]);

    const saved = settingRow?.settings?.homepageCollections || {};
    settings = {
      newMode: saved.newMode === 'custom' ? 'custom' : 'auto',
      bestMode: saved.bestMode === 'custom' ? 'custom' : 'auto',
      newIds: Array.isArray(saved.newIds) ? saved.newIds.map(String) : [],
      bestIds: Array.isArray(saved.bestIds) ? saved.bestIds.map(String) : []
    };
    products = productResult?.error ? [] : (productResult?.data || []);
    render();
  }

  function productChoices(kind) {
    const ids = kind === 'new' ? settings.newIds : settings.bestIds;
    return products.map(p => {
      const id = String(p.id);
      const checked = ids.includes(id) ? 'checked' : '';
      const price = Number(p.sale_price ?? p.price ?? 0);
      return `<label class="homepage-product-choice">
        <input type="checkbox" data-home-${kind}="${esc(id)}" ${checked}>
        <img src="${esc(p.image_url || 'logo.png')}" alt="">
        <span><b>${esc(p.name || 'Unnamed product')}</b><small>${esc(p.category || '')} · ৳${price.toLocaleString('en-BD')}</small></span>
      </label>`;
    }).join('');
  }

  function render() {
    const root = document.getElementById('homepageProductEditor');
    if (!root) return;
    root.innerHTML = `
      <div class="homepage-products-editor-card">
        <div class="homepage-products-editor-head">
          <div>
            <span class="eyebrow">HOMEPAGE PRODUCTS</span>
            <h3>Choose what customers see</h3>
            <p>Defaultভাবে New Arrivals ও Best Sellers automatic থাকবে। যখন চাইবে, Custom করে নিজের পছন্দের/trending products বসাতে পারবে। Section remove হবে না.</p>
          </div>
          <span id="homepageProductsStatus" class="site-editor-status">Ready</span>
        </div>

        <div class="homepage-products-mode-grid">
          <div class="homepage-products-mode-card">
            <strong>✨ New Arrivals</strong>
            <label>Show products using
              <select id="homepageNewMode">
                <option value="auto" ${settings.newMode === 'auto' ? 'selected' : ''}>Automatic — latest marked New</option>
                <option value="custom" ${settings.newMode === 'custom' ? 'selected' : ''}>Custom — I choose products</option>
              </select>
            </label>
          </div>
          <div class="homepage-products-mode-card">
            <strong>🔥 Best Sellers / Trending</strong>
            <label>Show products using
              <select id="homepageBestMode">
                <option value="auto" ${settings.bestMode === 'auto' ? 'selected' : ''}>Automatic — marked Best Sellers</option>
                <option value="custom" ${settings.bestMode === 'custom' ? 'selected' : ''}>Custom — I choose products</option>
              </select>
            </label>
          </div>
        </div>

        <div class="homepage-products-custom-grid">
          <div class="homepage-products-picker">
            <div class="homepage-products-picker-head"><strong>New Arrivals — custom products</strong><span>Select any products</span></div>
            <div class="homepage-products-choice-list" id="homepageNewChoices">${productChoices('new')}</div>
          </div>
          <div class="homepage-products-picker">
            <div class="homepage-products-picker-head"><strong>Best Sellers / Trending — custom products</strong><span>Select any products</span></div>
            <div class="homepage-products-choice-list" id="homepageBestChoices">${productChoices('best')}</div>
          </div>
        </div>

        <div class="homepage-products-save-row">
          <span>Tip: trending product বদলাতে শুধু Custom selection বদলে Save করলেই হবে.</span>
          <button id="saveHomepageProducts" class="btn btn-primary" type="button">Save homepage products</button>
        </div>
      </div>
    `;

    document.getElementById('saveHomepageProducts')?.addEventListener('click', save);
    document.getElementById('homepageNewMode')?.addEventListener('change', e => {
      settings.newMode = e.target.value;
    });
    document.getElementById('homepageBestMode')?.addEventListener('change', e => {
      settings.bestMode = e.target.value;
    });
  }

  async function save() {
    const db = client();
    const button = document.getElementById('saveHomepageProducts');
    const status = document.getElementById('homepageProductsStatus');
    if (!db) return alert('Supabase connection পাওয়া যাচ্ছে না।');

    settings.newMode = document.getElementById('homepageNewMode')?.value === 'custom' ? 'custom' : 'auto';
    settings.bestMode = document.getElementById('homepageBestMode')?.value === 'custom' ? 'custom' : 'auto';
    settings.newIds = [...document.querySelectorAll('[data-home-new]:checked')].map(x => x.dataset.homeNew);
    settings.bestIds = [...document.querySelectorAll('[data-home-best]:checked')].map(x => x.dataset.homeBest);

    button.disabled = true;
    button.textContent = 'Saving...';
    status.textContent = 'Saving...';

    try {
      const { data: row, error: readError } = await db.from('site_settings').select('settings').eq('id', 'global').maybeSingle();
      if (readError) throw readError;
      const allSettings = row?.settings || {};
      allSettings.homepageCollections = settings;

      const { error } = await db.from('site_settings').upsert({
        id: 'global', settings: allSettings, updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
      if (error) throw error;

      status.textContent = 'Saved ✓';
      button.textContent = 'Save homepage products';
      setTimeout(() => { status.textContent = 'Ready'; }, 1800);
    } catch (error) {
      console.error(error);
      status.textContent = 'Failed';
      button.textContent = 'Save homepage products';
      alert(`Save failed: ${error.message}`);
    } finally {
      button.disabled = false;
    }
  }

  function mount() {
    const root = document.getElementById('websiteEditorRoot');
    if (!root || document.getElementById('homepageProductEditor')) return;
    const card = document.createElement('div');
    card.id = 'homepageProductEditor';
    root.appendChild(card);
    load();
  }

  function watch() {
    mount();
    document.addEventListener('click', e => {
      if (e.target.closest('[data-tab="website-editor"]')) setTimeout(mount, 80);
    });
    const observer = new MutationObserver(() => mount());
    const root = document.getElementById('websiteEditorRoot');
    if (root) observer.observe(root, { childList: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch);
  else watch();
})();
