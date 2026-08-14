(function () {
  const cfg = window.GLOVAERA_CONFIG || {};

  const hasSupabase =
    !!(
      window.supabase &&
      cfg.supabaseUrl &&
      cfg.supabaseAnonKey &&
      !String(cfg.supabaseUrl).startsWith('YOUR_') &&
      !String(cfg.supabaseAnonKey).startsWith('YOUR_')
    );

  const client = hasSupabase
    ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey)
    : null;

  /*
   * Single shared public API.
   * Every page (store, checkout, admin, product, shop) now uses
   * the same GLOVAERA object and the same Supabase client.
   */
  window.GLOVAERA = {
    ...(window.GLOVAERA || {}),
    client,
    cfg,
    hasSupabase
  };

  const demoProducts = [
    {
      id: 'demo-1',
      name: 'Pearl Drop Earrings',
      category: 'Earrings',
      price: 180,
      sale_price: 150,
      stock: 12,
      featured: true,
      is_new: true,
      combo: false,
      image_url: 'logo.png',
      description: 'Delicate pearl-inspired earrings for everyday styling.',
      material: 'Alloy + imitation pearl',
      color: 'Gold'
    },
    {
      id: 'demo-2',
      name: 'Luna Jhumka',
      category: 'Jhumka',
      price: 240,
      sale_price: 199,
      stock: 8,
      featured: true,
      is_new: true,
      combo: false,
      image_url: 'logo.png',
      description: 'Classic jhumka silhouette with a modern finish.',
      material: 'Alloy',
      color: 'Antique Gold'
    },
    {
      id: 'demo-3',
      name: 'Everyday Minimal Ring',
      category: 'Rings',
      price: 150,
      sale_price: 120,
      stock: 20,
      featured: false,
      is_new: true,
      combo: false,
      image_url: 'logo.png',
      description: 'A simple stack-friendly ring for everyday looks.',
      material: 'Alloy',
      color: 'Gold'
    },
    {
      id: 'demo-4',
      name: 'Soft Glow Set',
      category: 'Combos',
      price: 420,
      sale_price: 349,
      stock: 6,
      featured: true,
      is_new: false,
      combo: true,
      image_url: 'logo.png',
      description: 'Earrings + ring + hijab pin in one easy set.',
      material: 'Mixed fashion jewellery',
      color: 'Gold'
    }
  ];

  const demoCategories = [
    { id: 'c1', name: 'Earrings', slug: 'earrings', image_url: 'logo.png' },
    { id: 'c2', name: 'Jhumka', slug: 'jhumka', image_url: 'logo.png' },
    { id: 'c3', name: 'Rings', slug: 'rings', image_url: 'logo.png' },
    { id: 'c4', name: 'Necklaces', slug: 'necklaces', image_url: 'logo.png' },
    { id: 'c5', name: 'Hijab Pins', slug: 'hijab-pins', image_url: 'logo.png' },
    { id: 'c6', name: 'Combos', slug: 'combos', image_url: 'logo.png' }
  ];

  async function getProducts() {
    if (!client) return demoProducts;

    const { data, error } = await client
      .from('products')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('GLOVAERA products error:', error);
      return demoProducts;
    }

    return data || [];
  }

  async function getCategories() {
    if (!client) return demoCategories;

    const { data, error } = await client
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.warn('GLOVAERA categories error:', error);
      return demoCategories;
    }

    return data || [];
  }

  function money(value) {
    return `${cfg.currency || '৳'}${Number(value || 0).toLocaleString('en-BD')}`;
  }

  function cart() {
    try {
      return JSON.parse(localStorage.getItem('glovaera_cart') || '[]');
    } catch {
      return [];
    }
  }

  function saveCart(items) {
    localStorage.setItem('glovaera_cart', JSON.stringify(items));
    updateCartCount();
  }

  function addToCart(product, qty = 1) {
    const stock = Number(product.stock ?? 0);

    if (stock <= 0) {
      alert('This product is currently out of stock.');
      return false;
    }

    const quantity = Math.max(1, Number(qty || 1));
    const items = cart();
    const found = items.find((item) => item.id === product.id);

    if (found) {
      const nextQty = Math.min(found.qty + quantity, stock);
      found.qty = nextQty;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: Number(product.sale_price ?? product.price),
        image_url: product.image_url || 'logo.png',
        qty: Math.min(quantity, stock)
      });
    }

    saveCart(items);
    window.dispatchEvent(new CustomEvent('cart:updated'));
    return true;
  }

  function removeFromCart(id) {
    saveCart(cart().filter((item) => item.id !== id));
  }

  function updateCartCount() {
    const count = cart().reduce(
      (total, item) => total + Number(item.qty || 0),
      0
    );

    document
      .querySelectorAll('#cartCount')
      .forEach((element) => {
        element.textContent = count;
      });
  }

  function productCard(product) {
    const price = Number(product.sale_price ?? product.price ?? 0);
    const oldPrice = Number(
      product.sale_price != null ? product.price : 0
    );

    const badge = product.featured
      ? 'BEST SELLER'
      : product.is_new
      ? 'NEW'
      : '';

    return `
      <article class="product-card">
        <a
          href="product.html?id=${encodeURIComponent(product.id)}"
          class="product-image-wrap"
        >
          <img
            src="${product.image_url || 'logo.png'}"
            alt="${escapeHtml(product.name)}"
          >
          ${badge ? `<span class="product-badge">${badge}</span>` : ''}
        </a>

        <div class="product-meta">
          <div class="product-cat">
            ${escapeHtml(product.category || '')}
          </div>

          <h3>
            <a href="product.html?id=${encodeURIComponent(product.id)}">
              ${escapeHtml(product.name)}
            </a>
          </h3>

          <div class="price-row">
            <strong>${money(price)}</strong>
            ${
              oldPrice > price
                ? `<del>${money(oldPrice)}</del>`
                : ''
            }
          </div>

          ${
            Number(product.stock || 0) > 0
              ? `<button class="quick-add" data-add="${encodeURIComponent(
                  product.id
                )}">Add to cart</button>`
              : `<span class="quick-add" style="opacity:.55;cursor:not-allowed;">Out of stock</span>`
          }
        </div>
      </article>
    `;
  }

  function escapeHtml(value = '') {
    return String(value).replace(
      /[&<>'"]/g,
      (char) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;'
        }[char])
    );
  }

  async function wireHome() {
    const catEl = document.getElementById('categoryGrid');
    const newEl = document.getElementById('newProducts');
    const bestEl = document.getElementById('bestProducts');

    if (!catEl || !newEl || !bestEl) return;

    const [categories, products] = await Promise.all([
      getCategories(),
      getProducts()
    ]);

    catEl.innerHTML = categories
      .map(
        (category) => `
          <a
            class="category-card"
            href="shop.html?category=${encodeURIComponent(category.name)}"
          >
            <img
              src="${category.image_url || 'logo.png'}"
              alt="${escapeHtml(category.name)}"
            >
            <span>${escapeHtml(category.name)}</span>
          </a>
        `
      )
      .join('');

    newEl.innerHTML = products
      .filter((product) => product.is_new)
      .slice(0, 4)
      .map(productCard)
      .join('');

    bestEl.innerHTML = products
      .filter((product) => product.featured)
      .slice(0, 4)
      .map(productCard)
      .join('');

    document.addEventListener('click', (event) => {
      const button = event.target.closest('[data-add]');
      if (!button) return;

      const id = decodeURIComponent(button.dataset.add);
      const product = products.find((item) => item.id === id);

      if (!product) return;

      const added = addToCart(product, 1);

      if (added) {
        button.textContent = 'Added ✓';
        setTimeout(() => {
          button.textContent = 'Add to cart';
        }, 900);
      }
    });
  }

  function initCommon() {
    updateCartCount();

    document
      .getElementById('menuBtn')
      ?.addEventListener('click', () => {
        const mobileNav = document.getElementById('mobileNav');
        if (mobileNav) {
          mobileNav.hidden = !mobileNav.hidden;
        }
      });

    document
      .getElementById('searchBtn')
      ?.addEventListener('click', () => {
        window.location.href = 'shop.html';
      });

    wireHome();
  }

  window.GLOVAERA = {
    ...window.GLOVAERA,
    client,
    cfg,
    hasSupabase,
    getProducts,
    getCategories,
    money,
    cart,
    saveCart,
    addToCart,
    removeFromCart,
    productCard,
    escapeHtml,
    updateCartCount
  };

  document.addEventListener('DOMContentLoaded', initCommon);
})();
