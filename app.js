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
    ? window.supabase.createClient(
        cfg.supabaseUrl,
        cfg.supabaseAnonKey
      )
    : null;

  const defaultSettings = {
    branding: {
      burgundy: '#6D2348',
      darkBurgundy: '#4A1730',
      gold: '#D8B56A',
      lightGold: '#E8CC8A',
      ivory: '#FBF8F2'
    },

    layout: {
      containerWidth: 1160,
      sectionPadding: 94,
      heroGap: 60,
      socialGap: 12,
      socialColumns: 6,
      socialRadius: 12,
      categoryGap: 14,
      categoryImageFit: 'cover'
    },

    social: {
      eyebrow: 'STAY IN THE GLOVAERA MOOD',
      title: 'Follow the edit',
      imageFit: 'cover',
      images: [
        'logo.png',
        'logo.png',
        'logo.png',
        'logo.png',
        'logo.png',
        'logo.png'
      ]
    },

    faq: {
      eyebrow: 'YOU ASKED, WE ANSWER',
      title: 'Frequently asked questions',
      items: [
        {
          question: 'How can I place an order?',
          answer:
            'Add your favourite products to cart and complete the checkout form. Cash on Delivery is available.'
        },
        {
          question: 'How much is delivery?',
          answer:
            'Delivery charges are calculated automatically during checkout based on your district.'
        },
        {
          question: 'Can I request an exchange?',
          answer:
            'Yes. Exchanges are handled according to the published GLOVAERA exchange policy.'
        }
      ]
    }
  };

  window.GLOVAERA = {
    ...(window.GLOVAERA || {}),
    client,
    cfg,
    hasSupabase,
    settings: defaultSettings
  };

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

  function mergeSettings(data) {
    const source = data || {};

    return {
      branding: {
        ...defaultSettings.branding,
        ...(source.branding || {})
      },

      layout: {
        ...defaultSettings.layout,
        ...(source.layout || {})
      },

      social: {
        ...defaultSettings.social,
        ...(source.social || {}),
        images: Array.isArray(source.social?.images)
          ? source.social.images
          : defaultSettings.social.images
      },

      faq: {
        ...defaultSettings.faq,
        ...(source.faq || {}),
        items: Array.isArray(source.faq?.items)
          ? source.faq.items
          : defaultSettings.faq.items
      }
    };
  }

  async function loadSiteSettings() {
    if (!client) {
      window.GLOVAERA.settings =
        mergeSettings(defaultSettings);

      applySiteSettings();
      return window.GLOVAERA.settings;
    }

    const { data, error } = await client
      .from('site_settings')
      .select('settings')
      .eq('id', 'global')
      .maybeSingle();

    if (error) {
      console.warn(
        'Site settings could not be loaded:',
        error
      );

      window.GLOVAERA.settings =
        mergeSettings(defaultSettings);
    } else {
      window.GLOVAERA.settings =
        mergeSettings(data?.settings);
    }

    applySiteSettings();

    return window.GLOVAERA.settings;
  }

  function applySiteSettings() {
    const settings =
      window.GLOVAERA.settings ||
      defaultSettings;

    const root = document.documentElement;

    root.style.setProperty(
      '--burgundy',
      settings.branding.burgundy
    );

    root.style.setProperty(
      '--dark-burgundy',
      settings.branding.darkBurgundy
    );

    root.style.setProperty(
      '--gold',
      settings.branding.gold
    );

    root.style.setProperty(
      '--light-gold',
      settings.branding.lightGold
    );

    root.style.setProperty(
      '--ivory',
      settings.branding.ivory
    );

    root.style.setProperty(
      '--container-width',
      `${Number(settings.layout.containerWidth) || 1160}px`
    );

    root.style.setProperty(
      '--section-padding',
      `${Number(settings.layout.sectionPadding) || 94}px`
    );

    root.style.setProperty(
      '--hero-gap',
      `${Number(settings.layout.heroGap) || 60}px`
    );

    root.style.setProperty(
      '--social-gap',
      `${Number(settings.layout.socialGap) || 12}px`
    );

    root.style.setProperty(
      '--social-columns',
      `${Number(settings.layout.socialColumns) || 6}`
    );

    root.style.setProperty(
      '--social-radius',
      `${Number(settings.layout.socialRadius) || 12}px`
    );

    root.style.setProperty(
      '--category-gap',
      `${Number(settings.layout.categoryGap) || 14}px`
    );

    renderSocialGallery();
    renderFaq();
  }

  function renderSocialGallery() {
    const gallery =
      document.getElementById(
        'socialGallery'
      );

    if (!gallery) return;

    const settings =
      window.GLOVAERA.settings ||
      defaultSettings;

    const social =
      settings.social ||
      defaultSettings.social;

    const eyebrow =
      document.getElementById(
        'socialEyebrow'
      );

    const title =
      document.getElementById(
        'socialTitle'
      );

    if (eyebrow) {
      eyebrow.textContent =
        social.eyebrow;
    }

    if (title) {
      title.textContent =
        social.title;
    }

    const images =
      Array.isArray(social.images)
        ? social.images.filter(Boolean)
        : [];

    gallery.innerHTML =
      images
        .map(
          (url, index) => `
            <div class="social-gallery-item">
              <img
                src="${escapeHtml(url)}"
                alt="GLOVAERA edit ${index + 1}"
                style="object-fit:${escapeHtml(
                  social.imageFit || 'cover'
                )};"
              >
            </div>
          `
        )
        .join('');
  }

  function renderFaq() {
    const list =
      document.getElementById(
        'faqList'
      );

    if (!list) return;

    const settings =
      window.GLOVAERA.settings ||
      defaultSettings;

    const faq =
      settings.faq ||
      defaultSettings.faq;

    const eyebrow =
      document.getElementById(
        'faqEyebrow'
      );

    const title =
      document.getElementById(
        'faqTitle'
      );

    if (eyebrow) {
      eyebrow.textContent =
        faq.eyebrow;
    }

    if (title) {
      title.textContent =
        faq.title;
    }

    list.innerHTML =
      (faq.items || [])
        .map(
          (item, index) => `
            <details ${
              index === 0
                ? 'open'
                : ''
            }>
              <summary>
                <span>
                  ${escapeHtml(
                    item.question || ''
                  )}
                </span>
                <b>+</b>
              </summary>

              <div class="faq-answer">
                ${escapeHtml(
                  item.answer || ''
                )}
              </div>
            </details>
          `
        )
        .join('');
  }

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
      description:
        'Delicate pearl-inspired earrings for everyday styling.',
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
      description:
        'Classic jhumka silhouette with a modern finish.',
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
      description:
        'A simple stack-friendly ring for everyday looks.',
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
      description:
        'Earrings + ring + hijab pin in one easy set.',
      material: 'Mixed fashion jewellery',
      color: 'Gold'
    }
  ];

  const demoCategories = [
    {
      id: 'c1',
      name: 'Earrings',
      slug: 'earrings',
      image_url: 'logo.png'
    },
    {
      id: 'c2',
      name: 'Jhumka',
      slug: 'jhumka',
      image_url: 'logo.png'
    },
    {
      id: 'c3',
      name: 'Rings',
      slug: 'rings',
      image_url: 'logo.png'
    },
    {
      id: 'c4',
      name: 'Necklaces',
      slug: 'necklaces',
      image_url: 'logo.png'
    },
    {
      id: 'c5',
      name: 'Hijab Pins',
      slug: 'hijab-pins',
      image_url: 'logo.png'
    },
    {
      id: 'c6',
      name: 'Combos',
      slug: 'combos',
      image_url: 'logo.png'
    }
  ];

  async function getProducts() {
    if (!client) {
      return demoProducts;
    }

    const { data, error } =
      await client
        .from('products')
        .select('*')
        .eq('active', true)
        .order('created_at', {
          ascending: false
        });

    if (error) {
      console.warn(
        'Products:',
        error
      );

      return demoProducts;
    }

    return data || [];
  }

  async function getCategories() {
    if (!client) {
      return demoCategories;
    }

    const { data, error } =
      await client
        .from('categories')
        .select('*')
        .order('name');

    if (error) {
      console.warn(
        'Categories:',
        error
      );

      return demoCategories;
    }

    return data || [];
  }

  function money(value) {
    return `${
      cfg.currency || '৳'
    }${Number(value || 0).toLocaleString(
      'en-BD'
    )}`;
  }

  function cart() {
    try {
      return JSON.parse(
        localStorage.getItem(
          'glovaera_cart'
        ) || '[]'
      );
    } catch {
      return [];
    }
  }

  function saveCart(items) {
    localStorage.setItem(
      'glovaera_cart',
      JSON.stringify(items)
    );

    updateCartCount();
  }

  function addToCart(
    product,
    qty = 1
  ) {
    const stock =
      Number(
        product.stock ?? 0
      );

    if (stock <= 0) {
      alert(
        'This product is currently out of stock.'
      );

      return false;
    }

    const items = cart();

    const found =
      items.find(
        item =>
          item.id ===
          product.id
      );

    const quantity =
      Math.max(
        1,
        Number(qty || 1)
      );

    if (found) {
      found.qty =
        Math.min(
          found.qty +
            quantity,
          stock
        );
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: Number(
          product.sale_price ??
            product.price
        ),
        image_url:
          product.image_url ||
          'logo.png',
        qty: Math.min(
          quantity,
          stock
        )
      });
    }

    saveCart(items);

    window.dispatchEvent(
      new CustomEvent(
        'cart:updated'
      )
    );

    return true;
  }

  function removeFromCart(
    id
  ) {
    saveCart(
      cart().filter(
        item =>
          item.id !== id
      )
    );
  }

  function updateCartCount() {
    const count =
      cart().reduce(
        (total, item) =>
          total +
          Number(
            item.qty || 0
          ),
        0
      );

    document
      .querySelectorAll(
        '#cartCount'
      )
      .forEach(
        element => {
          element.textContent =
            count;
        }
      );
  }

  function productCard(
    product
  ) {
    const price =
      Number(
        product.sale_price ??
          product.price ??
          0
      );

    const oldPrice =
      Number(
        product.sale_price !=
          null
          ? product.price
          : 0
      );

    const badge =
      product.featured
        ? 'BEST SELLER'
        : product.is_new
        ? 'NEW'
        : '';

    return `
      <article class="product-card">

        <a
          href="product.html?id=${encodeURIComponent(
            product.id
          )}"
          class="product-image-wrap"
        >

          <img
            src="${
              product.image_url ||
              'logo.png'
            }"
            alt="${escapeHtml(
              product.name
            )}"
          >

          ${
            badge
              ? `
                <span class="product-badge">
                  ${badge}
                </span>
              `
              : ''
          }

        </a>

        <div class="product-meta">

          <div class="product-cat">
            ${escapeHtml(
              product.category ||
                ''
            )}
          </div>

          <h3>
            <a
              href="product.html?id=${encodeURIComponent(
                product.id
              )}"
            >
              ${escapeHtml(
                product.name
              )}
            </a>
          </h3>

          <div class="price-row">

            <strong>
              ${money(price)}
            </strong>

            ${
              oldPrice > price
                ? `
                  <del>
                    ${money(
                      oldPrice
                    )}
                  </del>
                `
                : ''
            }

          </div>

          ${
            Number(
              product.stock || 0
            ) > 0
              ? `
                <button
                  class="quick-add"
                  data-add="${encodeURIComponent(
                    product.id
                  )}"
                >
                  Add to cart
                </button>
              `
              : `
                <span
                  class="quick-add"
                  style="opacity:.5"
                >
                  Out of stock
                </span>
              `
          }

        </div>

      </article>
    `;
  }

  async function wireHome() {
    const catEl =
      document.getElementById(
        'categoryGrid'
      );

    const newEl =
      document.getElementById(
        'newProducts'
      );

    const bestEl =
      document.getElementById(
        'bestProducts'
      );

    if (
      !catEl ||
      !newEl ||
      !bestEl
    ) {
      return;
    }

    const [
      categories,
      products
    ] = await Promise.all([
      getCategories(),
      getProducts()
    ]);

    catEl.innerHTML =
      categories
        .map(
          category => `
            <a
              class="category-card"
              href="shop.html?category=${encodeURIComponent(
                category.name
              )}"
            >
              <div class="category-image">
                <img
                  src="${
                    category.image_url ||
                    'logo.png'
                  }"
                  alt="${escapeHtml(
                    category.name
                  )}"
                >
              </div>

              <span>
                ${escapeHtml(
                  category.name
                )}
              </span>
            </a>
          `
        )
        .join('');

    newEl.innerHTML =
      products
        .filter(
          product =>
            product.is_new
        )
        .slice(0, 4)
        .map(productCard)
        .join('');

    bestEl.innerHTML =
      products
        .filter(
          product =>
            product.featured
        )
        .slice(0, 4)
        .map(productCard)
        .join('');
  }

  function initCommon() {
    updateCartCount();

    document
      .getElementById(
        'menuBtn'
      )
      ?.addEventListener(
        'click',
        () => {
          const menu =
            document.getElementById(
              'mobileNav'
            );

          if (menu) {
            menu.hidden =
              !menu.hidden;
          }
        }
      );

    document
      .getElementById(
        'searchBtn'
      )
      ?.addEventListener(
        'click',
        () => {
          location.href =
            'shop.html';
        }
      );

    loadSiteSettings();
    wireHome();
  }

  window.GLOVAERA = {
    ...window.GLOVAERA,
    client,
    cfg,
    hasSupabase,
    settings: defaultSettings,
    loadSiteSettings,
    applySiteSettings,
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

  document.addEventListener(
    'DOMContentLoaded',
    initCommon
  );
})();
