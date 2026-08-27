(async function(){
  try {
    const root = document.getElementById('productRoot');
    if (!root) return;

    const id = new URLSearchParams(location.search).get('id');
    if (!id || !window.GLOVAERA) return;

    const products = await GLOVAERA.getProducts();
    const current = products.find(x => String(x.id) === String(id));
    if (!current) return;

    const currentCategory = String(current.category || '').trim().toLowerCase();

    // Prefer products from the same category, then fill with other products.
    const related = products
      .filter(x => String(x.id) !== String(current.id))
      .sort((a, b) => {
        const aSame = String(a.category || '').trim().toLowerCase() === currentCategory ? 0 : 1;
        const bSame = String(b.category || '').trim().toLowerCase() === currentCategory ? 0 : 1;
        if (aSame !== bSame) return aSame - bSame;
        return Number(b.featured ? 1 : 0) - Number(a.featured ? 1 : 0);
      })
      .slice(0, 8);

    if (!related.length) return;

    if (!document.getElementById('relatedProductsStyle')) {
      const style = document.createElement('style');
      style.id = 'relatedProductsStyle';
      style.textContent = `
        .related-products-section {
          margin-top: 72px;
          padding-top: 48px;
          border-top: 1px solid rgba(93, 20, 53, .12);
        }
        .related-products-heading {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 28px;
        }
        .related-products-kicker {
          margin: 0 0 8px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .16em;
          text-transform: uppercase;
          color: #7b234f;
        }
        .related-products-heading h2 {
          margin: 0;
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 4vw, 42px);
          line-height: 1.08;
        }
        .related-products-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 22px;
        }
        .related-product-card {
          display: block;
          min-width: 0;
          color: inherit;
          text-decoration: none;
          transition: transform .2s ease;
        }
        .related-product-card:hover { transform: translateY(-3px); }
        .related-product-image {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          border-radius: 16px;
          background: #f3eee9;
        }
        .related-product-image img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }
        .related-product-badge {
          position: absolute;
          left: 10px;
          top: 10px;
          z-index: 1;
          padding: 7px 10px;
          border-radius: 8px;
          background: #5d1435;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .08em;
        }
        .related-product-category {
          margin-top: 14px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: #7b234f;
        }
        .related-product-name {
          margin-top: 6px;
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          line-height: 1.25;
        }
        .related-product-price {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-top: 9px;
          font-weight: 700;
        }
        .related-product-price del {
          color: #9b9590;
          font-weight: 500;
        }
        @media (max-width: 900px) {
          .related-products-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
        }
        @media (max-width: 600px) {
          .related-products-section { margin-top: 48px; padding-top: 34px; }
          .related-products-heading { margin-bottom: 20px; }
          .related-products-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px 12px;
          }
          .related-product-image { border-radius: 12px; }
          .related-product-name { font-size: 17px; }
          .related-product-category { font-size: 9px; }
          .related-product-price { font-size: 14px; }
          .related-product-badge { left: 7px; top: 7px; padding: 5px 7px; font-size: 8px; }
        }
      `;
      document.head.appendChild(style);
    }

    const esc = value => GLOVAERA.escapeHtml(String(value ?? ''));
    const money = value => GLOVAERA.money(Number(value || 0));

    const cards = related.map(product => {
      const price = Number(product.sale_price ?? product.price ?? 0);
      const old = product.sale_price != null ? Number(product.price || 0) : 0;
      const comingSoon = product.coming_soon === true;
      const inStock = Number(product.stock || 0) > 0;
      const badge = comingSoon ? 'COMING SOON' : (!inStock ? 'OUT OF STOCK' : '');

      return `
        <a class="related-product-card" href="product.html?id=${encodeURIComponent(product.id)}">
          <div class="related-product-image">
            ${badge ? `<span class="related-product-badge">${badge}</span>` : ''}
            <img src="${esc(product.image_url || 'logo.png')}" alt="${esc(product.name)}" loading="lazy">
          </div>
          <div class="related-product-category">${esc(product.category || 'GLOVAERA')}</div>
          <div class="related-product-name">${esc(product.name)}</div>
          <div class="related-product-price">
            <span>${money(price)}</span>
            ${old > price ? `<del>${money(old)}</del>` : ''}
          </div>
        </a>
      `;
    }).join('');

    const section = document.createElement('section');
    section.className = 'related-products-section';
    section.innerHTML = `
      <div class="related-products-heading">
        <div>
          <p class="related-products-kicker">You may also like</p>
          <h2>More to explore</h2>
        </div>
      </div>
      <div class="related-products-grid">${cards}</div>
    `;

    root.parentElement.appendChild(section);
  } catch (error) {
    console.error('Related products failed to load:', error);
  }
})();
