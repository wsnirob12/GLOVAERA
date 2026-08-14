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
      categoryGap: 14,
      categoryImageFit: 'cover',
      socialGap: 12,
      socialColumns: 6,
      socialRadius: 12
    },

    announcement: {
      enabled: true,
      text: '✦ COD Available · A New Era of Elegance'
    },

    hero: {
      enabled: true,
      eyebrow: 'A NEW ERA OF ELEGANCE',
      title: 'Everyday elegance, effortlessly yours.',
      description:
        'Thoughtfully selected jewellery and accessories made to add a little glow to every day — without the luxury price tag.',
      button1Text: 'Shop Collection',
      button1Link: 'shop.html',
      button2Text: 'Explore Combos',
      button2Link: 'shop.html?combo=true',
      image: 'logo.png',
      imageFit: 'contain'
    },

    social: {
      enabled: true,
      eyebrow: 'STAY IN THE GLOVAERA MOOD',
      title: 'Follow the edit',
      imageFit: 'cover',
      images: []
    },

    combo: {
      enabled: true,
      eyebrow: 'THE GLOVAERA EDIT',
      title: 'More beauty. Better value.',
      description:
        'Discover easy-to-style combo sets designed for everyday wear, gifting and tiny moments worth celebrating.',
      buttonText: 'Shop combos',
      buttonLink: 'shop.html?combo=true',
      badge: 'FEATURED COMBO',
      productTitle: 'Soft Glow Set',
      productDescription: 'Earrings + Ring + Hijab Pin',
      price: '৳349',
      image: '',
      imageFit: 'cover'
    },

    faq: {
      enabled: true,
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
    },

    about: {
      eyebrow: 'WHY GLOVAERA',
      title: 'Affordable luxury, made for everyday life.',
      description:
        'We believe elegance should feel beautiful, wearable and accessible. GLOVAERA curates modern jewellery and accessories for students, young women and anyone who loves a refined everyday look.',
      feature1: 'Elegant',
      feature2: 'Accessible',
      feature3: 'Everyday'
    }
  };

  function mergeSettings(source) {
    const data = source || {};

    return {
      branding: {
        ...defaultSettings.branding,
        ...(data.branding || {})
      },

      layout: {
        ...defaultSettings.layout,
        ...(data.layout || {})
      },

      announcement: {
        ...defaultSettings.announcement,
        ...(data.announcement || {})
      },

      hero: {
        ...defaultSettings.hero,
        ...(data.hero || {})
      },

      social: {
        ...defaultSettings.social,
        ...(data.social || {}),
        images: Array.isArray(data.social?.images)
          ? data.social.images
          : defaultSettings.social.images
      },

      combo: {
        ...defaultSettings.combo,
        ...(data.combo || {})
      },

      faq: {
        ...defaultSettings.faq,
        ...(data.faq || {}),
        items: Array.isArray(data.faq?.items)
          ? data.faq.items
          : defaultSettings.faq.items
      },

      about: {
        ...defaultSettings.about,
        ...(data.about || {})
      }
    };
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

  async function loadSiteSettings() {
    if (!client) {
      window.GLOVAERA.settings =
        mergeSettings(defaultSettings);

      applySiteSettings();
      return;
    }

    const { data, error } = await client
      .from('site_settings')
      .select('settings')
      .eq('id', 'global')
      .maybeSingle();

    if (error) {
      console.warn(
        'Could not load site settings:',
        error
      );

      window.GLOVAERA.settings =
        mergeSettings(defaultSettings);
    } else {
      window.GLOVAERA.settings =
        mergeSettings(data?.settings);
    }

    applySiteSettings();
  }

  function applySiteSettings() {
    const settings =
      window.GLOVAERA.settings ||
      defaultSettings;

    const root =
      document.documentElement;

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
      `${Number(
        settings.layout.containerWidth
      ) || 1160}px`
    );

    root.style.setProperty(
      '--section-padding',
      `${Number(
        settings.layout.sectionPadding
      ) || 94}px`
    );

    root.style.setProperty(
      '--hero-gap',
      `${Number(
        settings.layout.heroGap
      ) || 60}px`
    );

    root.style.setProperty(
      '--category-gap',
      `${Number(
        settings.layout.categoryGap
      ) || 14}px`
    );

    root.style.setProperty(
      '--social-gap',
      `${Number(
        settings.layout.socialGap
      ) || 12}px`
    );

    root.style.setProperty(
      '--social-columns',
      `${Number(
        settings.layout.socialColumns
      ) || 6}`
    );

    root.style.setProperty(
      '--social-radius',
      `${Number(
        settings.layout.socialRadius
      ) || 0}px`
    );

    renderAnnouncement();
    renderHero();
    renderSocialGallery();
    renderCombo();
    renderFaq();
    renderAbout();
  }

  function renderAnnouncement() {
    const bar =
      document.getElementById(
        'announcementBar'
      );

    if (!bar) return;

    const announcement =
      window.GLOVAERA.settings.announcement;

    bar.hidden =
      announcement.enabled === false;

    bar.textContent =
      announcement.text || '';
  }

  function renderHero() {
    const section =
      document.getElementById(
        'heroSection'
      );

    if (!section) return;

    const hero =
      window.GLOVAERA.settings.hero;

    section.hidden =
      hero.enabled === false;

    const eyebrow =
      document.getElementById(
        'heroEyebrow'
      );

    const title =
      document.getElementById(
        'heroTitle'
      );

    const description =
      document.getElementById(
        'heroDescription'
      );

    const button1 =
      document.getElementById(
        'heroButton1'
      );

    const button2 =
      document.getElementById(
        'heroButton2'
      );

    const image =
      document.getElementById(
        'heroImage'
      );

    if (eyebrow) {
      eyebrow.textContent =
        hero.eyebrow;
    }

    if (title) {
      title.textContent =
        hero.title;
    }

    if (description) {
      description.textContent =
        hero.description;
    }

    if (button1) {
      button1.textContent =
        hero.button1Text;
      button1.href =
        hero.button1Link;
    }

    if (button2) {
      button2.textContent =
        hero.button2Text;
      button2.href =
        hero.button2Link;
    }

    if (image) {
      image.src =
        hero.image || 'logo.png';

      image.style.objectFit =
        hero.imageFit || 'contain';
    }
  }

  function renderSocialGallery() {
    const section =
      document.getElementById(
        'socialSection'
      );

    const gallery =
      document.getElementById(
        'socialGallery'
      );

    if (!section || !gallery) return;

    const social =
      window.GLOVAERA.settings.social;

    const images =
      Array.isArray(social.images)
        ? social.images.filter(Boolean)
        : [];

    section.hidden =
      social.enabled === false ||
      images.length === 0;

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

    gallery.innerHTML =
      images
        .map(
          (url, index) => `
            <div class="social-gallery-item">
              <img
                src="${escapeHtml(url)}"
                alt="GLOVAERA edit ${
                  index + 1
                }"
                style="object-fit:${escapeHtml(
                  social.imageFit || 'cover'
                )};"
              >
            </div>
          `
        )
        .join('');
  }

  function renderCombo() {
    const section =
      document.getElementById(
        'comboSection'
      );

    if (!section) return;

    const combo =
      window.GLOVAERA.settings.combo;

    section.hidden =
      combo.enabled === false;

    const eyebrow =
      document.getElementById(
        'comboEyebrow'
      );

    const title =
      document.getElementById(
        'comboTitle'
      );

    const description =
      document.getElementById(
        'comboDescription'
      );

    const button =
      document.getElementById(
        'comboButton'
      );

    const badge =
      document.getElementById(
        'comboBadge'
      );

    const productTitle =
      document.getElementById(
        'comboProductTitle'
      );

    const productDescription =
      document.getElementById(
        'comboProductDescription'
      );

    const price =
      document.getElementById(
        'comboPrice'
      );

    const imageWrap =
      document.getElementById(
        'comboImageWrap'
      );

    const image =
      document.getElementById(
        'comboImage'
      );

    if (eyebrow) {
      eyebrow.textContent =
        combo.eyebrow;
    }

    if (title) {
      title.textContent =
        combo.title;
    }

    if (description) {
      description.textContent =
        combo.description;
    }

    if (button) {
      button.textContent =
        combo.buttonText;
      button.href =
        combo.buttonLink;
    }

    if (badge) {
      badge.textContent =
        combo.badge;
    }

    if (productTitle) {
      productTitle.textContent =
        combo.productTitle;
    }

    if (productDescription) {
      productDescription.textContent =
        combo.productDescription;
    }

    if (price) {
      price.textContent =
        combo.price;
    }

    if (image && imageWrap) {
      if (combo.image) {
        image.src =
          combo.image;

        image.style.objectFit =
          combo.imageFit || 'cover';

        imageWrap.hidden = false;
      } else {
        imageWrap.hidden = true;
      }
    }
  }

  function renderFaq() {
    const section =
      document.getElementById(
        'faqSection'
      );

    const list =
      document.getElementById(
        'faqList'
      );

    if (!section || !list) return;

    const faq =
      window.GLOVAERA.settings.faq;

    section.hidden =
      faq.enabled === false;

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

  function renderAbout() {
    const about =
      window.GLOVAERA.settings.about;

    const eyebrow =
      document.getElementById(
        'aboutEyebrow'
      );

    const title =
      document.getElementById(
        'aboutTitle'
      );

    const description =
      document.getElementById(
        'aboutDescription'
      );

    const f1 =
      document.getElementById(
        'aboutFeature1'
      );

    const f2 =
      document.getElementById(
        'aboutFeature2'
      );

    const f3 =
      document.getElementById(
        'aboutFeature3'
      );

    if (eyebrow) {
      eyebrow.textContent =
        about.eyebrow;
    }

    if (title) {
      title.textContent =
        about.title;
    }

    if (description) {
      description.textContent =
        about.description;
    }

    if (f1) {
      f1.textContent =
        about.feature1;
    }

    if (f2) {
      f2.textContent =
        about.feature2;
    }

    if (f3) {
      f3.textContent =
        about.feature3;
    }
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
        'Delicate pearl-inspired earrings for everyday styling.'
    }
  ];

  const demoCategories = [
    {
      id: 'demo-cat-1',
      name: 'Earrings',
      slug: 'earrings',
      image_url: ''
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
    }${Number(
      value || 0
    ).toLocaleString('en-BD')}`;
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
        (item) =>
          item.id === product.id
      );

    if (found) {
      found.qty =
        Math.min(
          found.qty +
            Number(qty || 1),
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
          Number(qty || 1),
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

  function removeFromCart(id) {
    saveCart(
      cart().filter(
        (item) =>
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
        (element) => {
          element.textContent =
            count;
        }
      );
  }

  function productCard(product) {
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
              product.category || ''
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
                <span class="quick-add">
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
          (category) => {
            const image =
              category.image_url ||
              '';

            return `
              <a
                class="category-card"
                href="shop.html?category=${encodeURIComponent(
                  category.name
                )}"
              >

                <div class="category-image">

                  ${
                    image
                      ? `
                        <img
                          src="${escapeHtml(
                            image
                          )}"
                          alt="${escapeHtml(
                            category.name
                          )}"
                        >
                      `
                      : `
                        <div class="category-placeholder">
                          ${escapeHtml(
                            category.name
                          )}
                        </div>
                      `
                  }

                </div>

                <span>
                  ${escapeHtml(
                    category.name
                  )}
                </span>

              </a>
            `;
          }
        )
        .join('');

    newEl.innerHTML =
      products
        .filter(
          (product) =>
            product.is_new
        )
        .slice(0, 4)
        .map(productCard)
        .join('');

    bestEl.innerHTML =
      products
        .filter(
          (product) =>
            product.featured
        )
        .slice(0, 4)
        .map(productCard)
        .join('');

    document.addEventListener(
      'click',
      (event) => {
        const button =
          event.target.closest(
            '[data-add]'
          );

        if (!button) return;

        const id =
          decodeURIComponent(
            button.dataset.add
          );

        const product =
          products.find(
            (item) =>
              item.id === id
          );

        if (!product) return;

        if (
          addToCart(
            product,
            1
          )
        ) {
          button.textContent =
            'Added ✓';

          setTimeout(
            () => {
              button.textContent =
                'Add to cart';
            },
            900
          );
        }
      }
    );
  }

  function initCommon() {
    updateCartCount();

    const menuButton =
      document.getElementById(
        'menuBtn'
      );

    menuButton?.addEventListener(
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

    const searchButton =
      document.getElementById(
        'searchBtn'
      );

    searchButton?.addEventListener(
      'click',
      () => {
        location.href =
          'shop.html';
      }
    );

    const hasHomepageEditor =
      document.getElementById(
        'heroSection'
      ) ||
      document.getElementById(
        'socialSection'
      ) ||
      document.getElementById(
        'comboSection'
      ) ||
      document.getElementById(
        'faqSection'
      );

    if (hasHomepageEditor) {
      loadSiteSettings();
    }

    wireHome();
  }

  window.glovaera = {
    ...(window.glovaera || {}),
    client,
    cfg,
    hasSupabase
  };

  window.GLOVAERA = {
    ...(window.GLOVAERA || {}),
    client,
    cfg,
    hasSupabase,
    settings:
      mergeSettings(
        defaultSettings
      ),
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
