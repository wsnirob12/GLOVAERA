(function () {

  const state = {
    user: null,
    products: [],
    categories: [],
    orders: [],
    settings: null
  };

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

  const loginView =
    document.getElementById(
      'loginView'
    );

  const dashboard =
    document.getElementById(
      'dashboardView'
    );

  const loginMsg =
    document.getElementById(
      'loginMsg'
    );

  const modal =
    document.getElementById(
      'modal'
    );

  const modalContent =
    document.getElementById(
      'modalContent'
    );

  const client =
    () => window.GLOVAERA?.client || null;


  function mergeSettings(data) {

    const source =
      data || {};

    return {

      branding: {
        ...defaultSettings.branding,
        ...(source.branding || {})
      },

      layout: {
        ...defaultSettings.layout,
        ...(source.layout || {})
      },

      announcement: {
        ...defaultSettings.announcement,
        ...(source.announcement || {})
      },

      hero: {
        ...defaultSettings.hero,
        ...(source.hero || {})
      },

      social: {
        ...defaultSettings.social,
        ...(source.social || {}),
        images:
          Array.isArray(
            source.social?.images
          )
            ? source.social.images
            : defaultSettings.social.images
      },

      combo: {
        ...defaultSettings.combo,
        ...(source.combo || {})
      },

      faq: {
        ...defaultSettings.faq,
        ...(source.faq || {}),
        items:
          Array.isArray(
            source.faq?.items
          )
            ? source.faq.items
            : defaultSettings.faq.items
      },

      about: {
        ...defaultSettings.about,
        ...(source.about || {})
      }
    };
  }


  function showModal(
    html
  ) {
    modalContent.innerHTML =
      html;

    modal.hidden =
      false;
  }


  function closeModal() {
    modal.hidden =
      true;
  }


  function escapeHtml(
    value = ''
  ) {
    return String(
      value
    ).replace(
      /[&<>'"]/g,
      char =>
        ({
          '&':
            '&amp;',
          '<':
            '&lt;',
          '>':
            '&gt;',
          "'":
            '&#39;',
          '"':
            '&quot;'
        }[char])
    );
  }


  function setColor(
    id,
    value
  ) {
    const el =
      document.getElementById(
        id
      );

    if (el) {
      el.value =
        value;
    }
  }


  /* LOGIN */

  async function signIn(
    event
  ) {

    event.preventDefault();

    const supabase =
      client();

    if (!supabase) {

      loginMsg.textContent =
        'Supabase connection পাওয়া যাচ্ছে না।';

      return;
    }

    const form =
      new FormData(
        event.target
      );

    const {
      data,
      error
    } =
      await supabase
        .auth
        .signInWithPassword({
          email:
            form.get(
              'email'
            ),
          password:
            form.get(
              'password'
            )
        });

    if (error) {

      loginMsg.textContent =
        error.message;

      return;
    }

    state.user =
      data.user;

    const {
      data: isAdmin,
      error: adminError
    } =
      await supabase
        .rpc(
          'is_admin'
        );

    if (
      adminError ||
      !isAdmin
    ) {

      await supabase
        .auth
        .signOut();

      loginMsg.textContent =
        adminError
          ? adminError.message
          : 'এই account admin নয়।';

      return;
    }

    await boot();
  }


  async function boot() {

    loginView.hidden =
      true;

    dashboard.hidden =
      false;

    await refreshAll();
    await loadSiteSettings();
  }


  /* DATABASE */

  async function refreshAll() {

    const supabase =
      client();

    if (!supabase) return;

    const [
      products,
      categories,
      orders
    ] =
      await Promise.all([
        supabase
          .from(
            'products'
          )
          .select('*')
          .order(
            'created_at',
            {
              ascending:
                false
            }
          ),

        supabase
          .from(
            'categories'
          )
          .select('*')
          .order(
            'name'
          ),

        supabase
          .from(
            'orders'
          )
          .select('*')
          .order(
            'created_at',
            {
              ascending:
                false
            }
          )
      ]);

    if (products.error) {
      alert(
        products.error.message
      );
    }

    if (categories.error) {
      alert(
        categories.error.message
      );
    }

    if (orders.error) {
      alert(
        orders.error.message
      );
    }

    state.products =
      products.data ||
      [];

    state.categories =
      categories.data ||
      [];

    state.orders =
      orders.data ||
      [];

    renderOverview();
    renderProducts();
    renderCategories();
    renderOrders();
  }


  function renderOverview() {

    const grid =
      document.getElementById(
        'statsGrid'
      );

    if (!grid) return;

    const pending =
      state.orders.filter(
        order =>
          [
            'new',
            'confirmed',
            'processing'
          ].includes(
            order.status
          )
      ).length;

    grid.innerHTML = [
      [
        'Products',
        state.products.length
      ],
      [
        'Categories',
        state.categories.length
      ],
      [
        'Orders',
        state.orders.length
      ],
      [
        'Pending',
        pending
      ]
    ]
      .map(
        ([label, value]) =>
          `
            <div class="stat-card">
              <span>
                ${label}
              </span>

              <strong>
                ${value}
              </strong>
            </div>
          `
      )
      .join('');
  }


  function renderProducts() {

    const list =
      document.getElementById(
        'productAdminList'
      );

    if (!list) return;

    list.innerHTML =
      state.products
        .map(
          product =>
            `
              <div class="admin-row">

                <img
                  src="${
                    product.image_url ||
                    'logo.png'
                  }"
                  alt=""
                />

                <div class="grow">

                  <strong>
                    ${GLOVAERA.escapeHtml(
                      product.name
                    )}
                  </strong>

                  <span>
                    ${GLOVAERA.escapeHtml(
                      product.category ||
                        ''
                    )}

                    ·

                    ${GLOVAERA.money(
                      product.sale_price ??
                        product.price
                    )}

                    · Stock
                    ${product.stock ??
                      0}
                  </span>

                </div>

                <button
                  class="btn btn-secondary small"
                  data-edit-product="${
                    product.id
                  }"
                >
                  Edit
                </button>

                <button
                  class="btn btn-danger small"
                  data-delete-product="${
                    product.id
                  }"
                >
                  Delete
                </button>

              </div>
            `
        )
        .join('') ||
      `
        <div class="empty-state">
          No products yet.
        </div>
      `;
  }


  function renderCategories() {

    const list =
      document.getElementById(
        'categoryAdminList'
      );

    if (!list) return;

    list.innerHTML =
      state.categories
        .map(
          category =>
            `
              <div class="admin-row">

                <img
                  src="${
                    category.image_url ||
                    'logo.png'
                  }"
                  alt=""
                />

                <div class="grow">

                  <strong>
                    ${GLOVAERA.escapeHtml(
                      category.name
                    )}
                  </strong>

                  <span>
                    ${GLOVAERA.escapeHtml(
                      category.slug ||
                        ''
                    )}
                  </span>

                </div>

                <button
                  class="btn btn-secondary small"
                  data-edit-category="${
                    category.id
                  }"
                >
                  Edit
                </button>

                <button
                  class="btn btn-danger small"
                  data-delete-category="${
                    category.id
                  }"
                >
                  Delete
                </button>

              </div>
            `
        )
        .join('') ||
      `
        <div class="empty-state">
          No categories yet.
        </div>
      `;
  }


  function renderOrders() {

    const list =
      document.getElementById(
        'orderAdminList'
      );

    if (!list) return;

    list.innerHTML =
      state.orders
        .map(
          order =>
            `
              <div class="admin-order">

                <div
                  class="admin-order-head"
                >

                  <strong>
                    #
                    ${String(
                      order.id
                    ).slice(
                      0,
                      8
                    )}
                  </strong>

                  <span class="status">
                    ${escapeHtml(
                      order.status
                    )}
                  </span>

                </div>

                <p>
                  ${escapeHtml(
                    order.customer_name
                  )}

                  ·

                  ${escapeHtml(
                    order.phone
                  )}
                </p>

                <p>
                  ${escapeHtml(
                    order.address
                  )}

                  ,

                  ${escapeHtml(
                    order.district
                  )}
                </p>

                <strong>
                  ${GLOVAERA.money(
                    order.total
                  )}
                </strong>

                <div class="order-actions">

                  <select
                    data-order-status="${
                      order.id
                    }"
                  >

                    ${
                      [
                        'new',
                        'confirmed',
                        'processing',
                        'shipped',
                        'delivered',
                        'cancelled'
                      ]
                        .map(
                          status =>
                            `
                              <option
                                ${
                                  status ===
                                  order.status
                                    ? 'selected'
                                    : ''
                                }
                              >
                                ${status}
                              </option>
                            `
                        )
                        .join('')
                    }

                  </select>

                </div>

              </div>
            `
        )
        .join('') ||
      `
        <div class="empty-state">
          No orders yet.
        </div>
      `;
  }


  /* PRODUCT */

  function productForm(
    product = {}
  ) {
    return `
      <form
        id="productForm"
        class="form-grid"
      >

        <input
          type="hidden"
          name="id"
          value="${
            product.id ||
            ''
          }"
        />

        <label>
          Name

          <input
            required
            name="name"
            value="${escapeHtml(
              product.name ||
                ''
            )}"
          />
        </label>

        <label>
          Category

          <select
            required
            name="category"
          >

            ${
              state.categories
                .map(
                  category =>
                    `
                      <option
                        ${
                          category.name ===
                          product.category
                            ? 'selected'
                            : ''
                        }
                      >
                        ${escapeHtml(
                          category.name
                        )}
                      </option>
                    `
                )
                .join('')
            }

          </select>

        </label>

        <label>
          Price

          <input
            required
            type="number"
            min="0"
            step="0.01"
            name="price"
            value="${
              product.price ??
              0
            }"
          />
        </label>

        <label>
          Sale price

          <input
            type="number"
            min="0"
            step="0.01"
            name="sale_price"
            value="${
              product.sale_price ??
              ''
            }"
          />
        </label>

        <label>
          Stock

          <input
            required
            type="number"
            min="0"
            name="stock"
            value="${
              product.stock ??
              0
            }"
          />
        </label>

        <label>
          Image URL

          <input
            name="image_url"
            value="${escapeHtml(
              product.image_url ||
                'logo.png'
            )}"
          />
        </label>

        <label>
          Upload image

          <input
            type="file"
            name="image_file"
            accept="image/*"
          />
        </label>

        <label class="full">
          Description

          <textarea
            name="description"
            rows="4"
          >${escapeHtml(
            product.description ||
              ''
          )}</textarea>
        </label>

        <label>
          <input
            type="checkbox"
            name="featured"
            ${
              product.featured
                ? 'checked'
                : ''
            }
          />

          Best seller
        </label>

        <label>
          <input
            type="checkbox"
            name="is_new"
            ${
              product.is_new
                ? 'checked'
                : ''
            }
          />

          New arrival
        </label>

        <label>
          <input
            type="checkbox"
            name="combo"
            ${
              product.combo
                ? 'checked'
                : ''
            }
          />

          Combo
        </label>

        <button
          class="btn btn-primary full"
          type="submit"
        >
          Save product
        </button>

      </form>
    `;
  }


  async function saveProduct(
    event
  ) {

    event.preventDefault();

    const supabase =
      client();

    const form =
      new FormData(
        event.target
      );

    try {

      let imageUrl =
        form.get(
          'image_url'
        ) ||
        'logo.png';

      const file =
        form.get(
          'image_file'
        );

      if (
        file &&
        file.size
      ) {

        imageUrl =
          await uploadSiteImage(
            file,
            'products'
          );
      }

      const record = {
        name:
          form.get(
            'name'
          ),

        category:
          form.get(
            'category'
          ),

        price:
          Number(
            form.get(
              'price'
            )
          ),

        sale_price:
          form.get(
            'sale_price'
          )
            ? Number(
                form.get(
                  'sale_price'
                )
              )
            : null,

        stock:
          Number(
            form.get(
              'stock'
            )
          ),

        image_url:
          imageUrl,

        description:
          form.get(
            'description'
          ),

        featured:
          form.get(
            'featured'
          ) === 'on',

        is_new:
          form.get(
            'is_new'
          ) === 'on',

        combo:
          form.get(
            'combo'
          ) === 'on',

        active:
          true
      };

      const id =
        form.get(
          'id'
        );

      const query =
        id
          ? supabase
              .from(
                'products'
              )
              .update(
                record
              )
              .eq(
                'id',
                id
              )
          : supabase
              .from(
                'products'
              )
              .insert(
                record
              );

      const {
        error
      } =
        await query;

      if (error) {
        throw error;
      }

      closeModal();
      await refreshAll();

    } catch (
      error
    ) {

      alert(
        `Product save failed: ${
          error.message
        }`
      );
    }
  }


  /* CATEGORY */

  function categoryForm(
    category = {}
  ) {

    return `
      <form
        id="categoryForm"
        class="form-grid"
      >

        <input
          type="hidden"
          name="id"
          value="${
            category.id ||
            ''
          }"
        />

        <label>
          Name

          <input
            required
            name="name"
            value="${escapeHtml(
              category.name ||
                ''
            )}"
          />
        </label>

        <label>
          Slug

          <input
            required
            name="slug"
            value="${escapeHtml(
              category.slug ||
                ''
            )}"
          />
        </label>

        <label class="full">

          Upload category image

          <input
            type="file"
            name="category_image"
            accept="image/*"
          />

        </label>

        <div
          class="category-upload-preview full"
        >

          <img
            src="${
              category.image_url ||
              ''
            }"
            alt=""
          />

          <span>
            Current category photo
          </span>

        </div>

        <label class="full">

          Image URL

          <input
            name="image_url"
            value="${escapeHtml(
              category.image_url ||
                ''
            )}"
            placeholder="Optional"
          />

        </label>

        <button
          class="btn btn-primary full"
          type="submit"
        >
          Save category
        </button>

      </form>
    `;
  }


  async function saveCategory(
    event
  ) {

    event.preventDefault();

    const supabase =
      client();

    const form =
      new FormData(
        event.target
      );

    try {

      let imageUrl =
        String(
          form.get(
            'image_url'
          ) ||
            ''
        ).trim();

      const file =
        form.get(
          'category_image'
        );

      if (
        file &&
        file.size
      ) {

        imageUrl =
          await uploadSiteImage(
            file,
            'categories'
          );
      }

      const record = {

        name:
          form.get(
            'name'
          ),

        slug:
          form.get(
            'slug'
          ),

        image_url:
          imageUrl || null

      };

      const id =
        form.get(
          'id'
        );

      const query =
        id
          ? supabase
              .from(
                'categories'
              )
              .update(
                record
              )
              .eq(
                'id',
                id
              )
          : supabase
              .from(
                'categories'
              )
              .insert(
                record
              );

      const {
        error
      } =
        await query;

      if (error) {
        throw error;
      }

      closeModal();
      await refreshAll();

    } catch (
      error
    ) {

      alert(
        `Category save failed: ${
          error.message
        }`
      );
    }
  }


  /* SITE SETTINGS */

  async function loadSiteSettings() {

    const supabase =
      client();

    const {
      data,
      error
    } =
      await supabase
        .from(
          'site_settings'
        )
        .select(
          'settings'
        )
        .eq(
          'id',
          'global'
        )
        .maybeSingle();

    if (error) {

      alert(
        `Site settings error: ${
          error.message
        }`
      );

      state.settings =
        mergeSettings(
          defaultSettings
        );

    } else {

      state.settings =
        mergeSettings(
          data?.settings
        );
    }

    fillEditor();
  }


  function fillEditor() {

    const s =
      state.settings;


    /* Announcement */

    document.getElementById(
      'announcementEnabledInput'
    ).value =
      String(
        s.announcement.enabled
      );

    document.getElementById(
      'announcementTextInput'
    ).value =
      s.announcement.text;


    /* Colors */

    setColor(
      'settingBurgundy',
      s.branding.burgundy
    );

    setColor(
      'settingDarkBurgundy',
      s.branding.darkBurgundy
    );

    setColor(
      'settingGold',
      s.branding.gold
    );

    setColor(
      'settingLightGold',
      s.branding.lightGold
    );

    setColor(
      'settingIvory',
      s.branding.ivory
    );


    /* Layout */

    document.getElementById(
      'settingContainerWidth'
    ).value =
      s.layout.containerWidth;

    document.getElementById(
      'settingSectionPadding'
    ).value =
      s.layout.sectionPadding;

    document.getElementById(
      'settingHeroGap'
    ).value =
      s.layout.heroGap;


    /* Hero */

    document.getElementById(
      'heroEnabledInput'
    ).value =
      String(
        s.hero.enabled
      );

    document.getElementById(
      'heroEyebrowInput'
    ).value =
      s.hero.eyebrow;

    document.getElementById(
      'heroTitleInput'
    ).value =
      s.hero.title;

    document.getElementById(
      'heroDescriptionInput'
    ).value =
      s.hero.description;

    document.getElementById(
      'heroButton1TextInput'
    ).value =
      s.hero.button1Text;

    document.getElementById(
      'heroButton1LinkInput'
    ).value =
      s.hero.button1Link;

    document.getElementById(
      'heroButton2TextInput'
    ).value =
      s.hero.button2Text;

    document.getElementById(
      'heroButton2LinkInput'
    ).value =
      s.hero.button2Link;

    document.getElementById(
      'heroImageFitInput'
    ).value =
      s.hero.imageFit;


    /* Category */

    document.getElementById(
      'categoryFitInput'
    ).value =
      s.layout.categoryImageFit;

    document.getElementById(
      'categoryGapInput'
    ).value =
      s.layout.categoryGap;


    /* Social */

    document.getElementById(
      'socialEnabledInput'
    ).value =
      String(
        s.social.enabled
      );

    document.getElementById(
      'socialEyebrowInput'
    ).value =
      s.social.eyebrow;

    document.getElementById(
      'socialTitleInput'
    ).value =
      s.social.title;

    document.getElementById(
      'socialColumnsInput'
    ).value =
      s.layout.socialColumns;

    document.getElementById(
      'socialGapInput'
    ).value =
      s.layout.socialGap;

    document.getElementById(
      'socialRadiusInput'
    ).value =
      s.layout.socialRadius;

    document.getElementById(
      'socialFitInput'
    ).value =
      s.social.imageFit;


    /* Combo */

    document.getElementById(
      'comboEnabledInput'
    ).value =
      String(
        s.combo.enabled
      );

    document.getElementById(
      'comboEyebrowInput'
    ).value =
      s.combo.eyebrow;

    document.getElementById(
      'comboTitleInput'
    ).value =
      s.combo.title;

    document.getElementById(
      'comboDescriptionInput'
    ).value =
      s.combo.description;

    document.getElementById(
      'comboBadgeInput'
    ).value =
      s.combo.badge;

    document.getElementById(
      'comboProductTitleInput'
    ).value =
      s.combo.productTitle;

    document.getElementById(
      'comboProductDescriptionInput'
    ).value =
      s.combo.productDescription;

    document.getElementById(
      'comboPriceInput'
    ).value =
      s.combo.price;

    document.getElementById(
      'comboButtonTextInput'
    ).value =
      s.combo.buttonText;

    document.getElementById(
      'comboButtonLinkInput'
    ).value =
      s.combo.buttonLink;

    document.getElementById(
      'comboImageFitInput'
    ).value =
      s.combo.imageFit;


    /* About */

    document.getElementById(
      'aboutEyebrowInput'
    ).value =
      s.about.eyebrow;

    document.getElementById(
      'aboutTitleInput'
    ).value =
      s.about.title;

    document.getElementById(
      'aboutDescriptionInput'
    ).value =
      s.about.description;

    document.getElementById(
      'aboutFeature1Input'
    ).value =
      s.about.feature1;

    document.getElementById(
      'aboutFeature2Input'
    ).value =
      s.about.feature2;

    document.getElementById(
      'aboutFeature3Input'
    ).value =
      s.about.feature3;


    /* FAQ */

    document.getElementById(
      'faqEnabledInput'
    ).value =
      String(
        s.faq.enabled
      );

    document.getElementById(
      'faqEyebrowInput'
    ).value =
      s.faq.eyebrow;

    document.getElementById(
      'faqTitleInput'
    ).value =
      s.faq.title;


    renderGalleryEditor();
    renderFaqEditor();
    renderImagePreview(
      'heroImagePreview',
      s.hero.image,
      'Hero image'
    );

    renderImagePreview(
      'comboImagePreview',
      s.combo.image,
      'Combo image'
    );
  }


  function setColor(
    id,
    value
  ) {
    const input =
      document.getElementById(
        id
      );

    if (input) {
      input.value =
        value;
    }
  }


  function renderImagePreview(
    id,
    url,
    label
  ) {

    const box =
      document.getElementById(
        id
      );

    if (!box) return;

    if (url) {

      box.innerHTML = `
        <img
          src="${escapeHtml(
            url
          )}"
          alt="${escapeHtml(
            label
          )}"
        />
      `;

    } else {

      box.innerHTML = `
        <div class="empty-state">
          No image uploaded.
        </div>
      `;
    }
  }


  /* IMAGE UPLOAD */

  async function uploadSiteImage(
    file,
    folder
  ) {

    const supabase =
      client();

    const safeName =
      file.name.replace(
        /[^a-zA-Z0-9._-]/g,
        '-'
      );

    const path =
      `${folder}/${crypto.randomUUID()}-${safeName}`;

    const upload =
      await supabase
        .storage
        .from(
          'site-media'
        )
        .upload(
          path,
          file,
          {
            upsert:
              false,
            contentType:
              file.type
          }
        );

    if (upload.error) {
      throw upload.error;
    }

    return supabase
      .storage
      .from(
        'site-media'
      )
      .getPublicUrl(
        path
      )
      .data
      .publicUrl;
  }


  function createFilePicker(
    callback
  ) {

    const input =
      document.createElement(
        'input'
      );

    input.type =
      'file';

    input.accept =
      'image/*';

    input.onchange =
      async () => {

        const file =
          input.files?.[0];

        if (!file) return;

        try {
          await callback(
            file
          );
        } catch (
          error
        ) {
          alert(
            error.message
          );
        }
      };

    input.click();
  }


  /* SOCIAL */

  function renderGalleryEditor() {

    const box =
      document.getElementById(
        'galleryEditorList'
      );

    if (!box) return;

    const images =
      state.settings.social
        .images || [];

    if (!images.length) {

      box.innerHTML = `
        <div class="empty-state">
          এখনো কোনো image যোগ করা হয়নি।
        </div>
      `;

      return;
    }

    box.innerHTML =
      images
        .map(
          (url, index) =>
            `
              <div
                class="gallery-editor-row"
              >

                <div
                  class="gallery-preview"
                >

                  <img
                    src="${escapeHtml(
                      url
                    )}"
                    alt=""
                  />

                </div>

                <div
                  class="gallery-editor-main"
                >

                  <strong>
                    Image ${
                      index + 1
                    }
                  </strong>

                  <span
                    class="gallery-url"
                  >
                    ${escapeHtml(
                      url
                    )}
                  </span>

                  <div
                    class="gallery-actions"
                  >

                    <button
                      type="button"
                      class="btn btn-secondary small"
                      data-gallery-replace="${index}"
                    >
                      Replace
                    </button>

                    <button
                      type="button"
                      class="btn btn-secondary small"
                      data-gallery-up="${index}"
                    >
                      ↑
                    </button>

                    <button
                      type="button"
                      class="btn btn-secondary small"
                      data-gallery-down="${index}"
                    >
                      ↓
                    </button>

                    <button
                      type="button"
                      class="btn btn-danger small"
                      data-gallery-delete="${index}"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </div>
            `
        )
        .join('');
  }


  /* FAQ */

  function renderFaqEditor() {

    const box =
      document.getElementById(
        'faqEditorList'
      );

    if (!box) return;

    const items =
      state.settings.faq.items ||
      [];

    box.innerHTML =
      items
        .map(
          (item, index) =>
            `
              <div
                class="faq-editor-item"
              >

                <div
                  class="faq-editor-number"
                >
                  ${
                    index + 1
                  }
                </div>

                <div
                  class="faq-editor-fields"
                >

                  <input
                    type="text"
                    data-faq-question="${index}"
                    value="${escapeHtml(
                      item.question ||
                        ''
                    )}"
                    placeholder="Question"
                  />

                  <textarea
                    rows="4"
                    data-faq-answer="${index}"
                    placeholder="Answer"
                  >${escapeHtml(
                    item.answer ||
                      ''
                  )}</textarea>

                  <div
                    class="gallery-actions"
                  >

                    <button
                      type="button"
                      class="btn btn-secondary small"
                      data-faq-up="${index}"
                    >
                      ↑
                    </button>

                    <button
                      type="button"
                      class="btn btn-secondary small"
                      data-faq-down="${index}"
                    >
                      ↓
                    </button>

                    <button
                      type="button"
                      class="btn btn-danger small"
                      data-faq-delete="${index}"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </div>
            `
        )
        .join('');
  }


  function collectFaq() {

    state.settings.faq.items =
      state.settings.faq.items
        .map(
          (
            item,
            index
          ) => {

            const q =
              document.querySelector(
                `[data-faq-question="${index}"]`
              );

            const a =
              document.querySelector(
                `[data-faq-answer="${index}"]`
              );

            return {
              question:
                q?.value.trim() ||
                '',
              answer:
                a?.value.trim() ||
                ''
            };
          }
        );
  }


  /* SAVE */

  async function saveSiteSettings() {

    collectFaq();

    const s =
      state.settings;


    /* Announcement */

    s.announcement.enabled =
      document.getElementById(
        'announcementEnabledInput'
      ).value ===
      'true';

    s.announcement.text =
      document.getElementById(
        'announcementTextInput'
      ).value.trim();


    /* Colors */

    s.branding.burgundy =
      document.getElementById(
        'settingBurgundy'
      ).value;

    s.branding.darkBurgundy =
      document.getElementById(
        'settingDarkBurgundy'
      ).value;

    s.branding.gold =
      document.getElementById(
        'settingGold'
      ).value;

    s.branding.lightGold =
      document.getElementById(
        'settingLightGold'
      ).value;

    s.branding.ivory =
      document.getElementById(
        'settingIvory'
      ).value;


    /* Layout */

    s.layout.containerWidth =
      Number(
        document.getElementById(
          'settingContainerWidth'
        ).value
      );

    s.layout.sectionPadding =
      Number(
        document.getElementById(
          'settingSectionPadding'
        ).value
      );

    s.layout.heroGap =
      Number(
        document.getElementById(
          'settingHeroGap'
        ).value
      );


    /* Hero */

    s.hero.enabled =
      document.getElementById(
        'heroEnabledInput'
      ).value ===
      'true';

    s.hero.eyebrow =
      document.getElementById(
        'heroEyebrowInput'
      ).value.trim();

    s.hero.title =
      document.getElementById(
        'heroTitleInput'
      ).value.trim();

    s.hero.description =
      document.getElementById(
        'heroDescriptionInput'
      ).value.trim();

    s.hero.button1Text =
      document.getElementById(
        'heroButton1TextInput'
      ).value.trim();

    s.hero.button1Link =
      document.getElementById(
        'heroButton1LinkInput'
      ).value.trim();

    s.hero.button2Text =
      document.getElementById(
        'heroButton2TextInput'
      ).value.trim();

    s.hero.button2Link =
      document.getElementById(
        'heroButton2LinkInput'
      ).value.trim();

    s.hero.imageFit =
      document.getElementById(
        'heroImageFitInput'
      ).value;


    /* Category */

    s.layout.categoryImageFit =
      document.getElementById(
        'categoryFitInput'
      ).value;

    s.layout.categoryGap =
      Number(
        document.getElementById(
          'categoryGapInput'
        ).value
      );


    /* Social */

    s.social.enabled =
      document.getElementById(
        'socialEnabledInput'
      ).value ===
      'true';

    s.social.eyebrow =
      document.getElementById(
        'socialEyebrowInput'
      ).value.trim();

    s.social.title =
      document.getElementById(
        'socialTitleInput'
      ).value.trim();

    s.layout.socialColumns =
      Number(
        document.getElementById(
          'socialColumnsInput'
        ).value
      );

    s.layout.socialGap =
      Number(
        document.getElementById(
          'socialGapInput'
        ).value
      );

    s.layout.socialRadius =
      Number(
        document.getElementById(
          'socialRadiusInput'
        ).value
      );

    s.social.imageFit =
      document.getElementById(
        'socialFitInput'
      ).value;


    /* Combo */

    s.combo.enabled =
      document.getElementById(
        'comboEnabledInput'
      ).value ===
      'true';

    s.combo.eyebrow =
      document.getElementById(
        'comboEyebrowInput'
      ).value.trim();

    s.combo.title =
      document.getElementById(
        'comboTitleInput'
      ).value.trim();

    s.combo.description =
      document.getElementById(
        'comboDescriptionInput'
      ).value.trim();

    s.combo.badge =
      document.getElementById(
        'comboBadgeInput'
      ).value.trim();

    s.combo.productTitle =
      document.getElementById(
        'comboProductTitleInput'
      ).value.trim();

    s.combo.productDescription =
      document.getElementById(
        'comboProductDescriptionInput'
      ).value.trim();

    s.combo.price =
      document.getElementById(
        'comboPriceInput'
      ).value.trim();

    s.combo.buttonText =
      document.getElementById(
        'comboButtonTextInput'
      ).value.trim();

    s.combo.buttonLink =
      document.getElementById(
        'comboButtonLinkInput'
      ).value.trim();

    s.combo.imageFit =
      document.getElementById(
        'comboImageFitInput'
      ).value;


    /* About */

    s.about.eyebrow =
      document.getElementById(
        'aboutEyebrowInput'
      ).value.trim();

    s.about.title =
      document.getElementById(
        'aboutTitleInput'
      ).value.trim();

    s.about.description =
      document.getElementById(
        'aboutDescriptionInput'
      ).value.trim();

    s.about.feature1 =
      document.getElementById(
        'aboutFeature1Input'
      ).value.trim();

    s.about.feature2 =
      document.getElementById(
        'aboutFeature2Input'
      ).value.trim();

    s.about.feature3 =
      document.getElementById(
        'aboutFeature3Input'
      ).value.trim();


    /* FAQ */

    s.faq.enabled =
      document.getElementById(
        'faqEnabledInput'
      ).value ===
      'true';

    s.faq.eyebrow =
      document.getElementById(
        'faqEyebrowInput'
      ).value.trim();

    s.faq.title =
      document.getElementById(
        'faqTitleInput'
      ).value.trim();


    const button =
      document.getElementById(
        'saveSiteSettingsBtn'
      );

    button.disabled =
      true;

    button.textContent =
      'Saving...';


    try {

      const {
        error
      } =
        await client()
          .from(
            'site_settings'
          )
          .upsert(
            {
              id:
                'global',
              settings:
                s,
              updated_at:
                new Date().toISOString()
            },
            {
              onConflict:
                'id'
            }
          );

      if (error) {
        throw error;
      }

      window.GLOVAERA.settings =
        s;

      window.GLOVAERA
        .applySiteSettings();

      alert(
        'Website settings saved successfully ✓'
      );

    } catch (
      error
    ) {

      alert(
        `Save failed: ${
          error.message
        }`
      );

    } finally {

      button.disabled =
        false;

      button.textContent =
        'Save website settings';
    }
  }


  /* DELETE */

  async function deleteProduct(
    id
  ) {

    if (
      !confirm(
        'Delete this product?'
      )
    ) return;

    const {
      error
    } =
      await client()
        .from(
          'products'
        )
        .delete()
        .eq(
          'id',
          id
        );

    if (error) {
      alert(
        error.message
      );

      return;
    }

    await refreshAll();
  }


  async function deleteCategory(
    id
  ) {

    if (
      !confirm(
        'Delete this category?'
      )
    ) return;

    const {
      error
    } =
      await client()
        .from(
          'categories'
        )
        .delete()
        .eq(
          'id',
          id
        );

    if (error) {
      alert(
        error.message
      );

      return;
    }

    await refreshAll();
  }


  async function updateOrder(
    id,
    status
  ) {

    const {
      error
    } =
      await client()
        .from(
          'orders'
        )
        .update({
          status
        })
        .eq(
          'id',
          id
        );

    if (error) {
      alert(
        error.message
      );

      return;
    }

    await refreshAll();
  }


  /* EVENTS */

  document
    .getElementById(
      'loginForm'
    )
    ?.addEventListener(
      'submit',
      signIn
    );


  document
    .getElementById(
      'logoutBtn'
    )
    ?.addEventListener(
      'click',
      async () => {

        await client()
          .auth
          .signOut();

        location.reload();
      }
    );


  document
    .getElementById(
      'addProductBtn'
    )
    ?.addEventListener(
      'click',
      () => {

        showModal(
          `
            <h2>
              Add product
            </h2>

            ${productForm()}
          `
        );

        document
          .getElementById(
            'productForm'
          )
          ?.addEventListener(
            'submit',
            saveProduct
          );
      }
    );


  document
    .getElementById(
      'addCategoryBtn'
    )
    ?.addEventListener(
      'click',
      () => {

        showModal(
          `
            <h2>
              Add category
            </h2>

            ${categoryForm()}
          `
        );

        document
          .getElementById(
            'categoryForm'
          )
          ?.addEventListener(
            'submit',
            saveCategory
          );
      }
    );


  document
    .getElementById(
      'refreshOrdersBtn'
    )
    ?.addEventListener(
      'click',
      refreshAll
    );


  document
    .getElementById(
      'saveSiteSettingsBtn'
    )
    ?.addEventListener(
      'click',
      saveSiteSettings
    );


  document
    .getElementById(
      'addGalleryImageBtn'
    )
    ?.addEventListener(
      'click',
      () => {

        createFilePicker(
          async file => {

            const url =
              await uploadSiteImage(
                file,
                'homepage'
              );

            state.settings.social.images.push(
              url
            );

            renderGalleryEditor();
          }
        );
      }
    );


  document
    .getElementById(
      'uploadHeroImageBtn'
    )
    ?.addEventListener(
      'click',
      () => {

        createFilePicker(
          async file => {

            state.settings.hero.image =
              await uploadSiteImage(
                file,
                'hero'
              );

            renderImagePreview(
              'heroImagePreview',
              state.settings.hero.image,
              'Hero'
            );
          }
        );
      }
    );


  document
    .getElementById(
      'uploadComboImageBtn'
    )
    ?.addEventListener(
      'click',
      () => {

        createFilePicker(
          async file => {

            state.settings.combo.image =
              await uploadSiteImage(
                file,
                'combo'
              );

            renderImagePreview(
              'comboImagePreview',
              state.settings.combo.image,
              'Combo'
            );
          }
        );
      }
    );


  document
    .getElementById(
      'addFaqBtn'
    )
    ?.addEventListener(
      'click',
      () => {

        state.settings.faq.items.push({
          question:
            'New question',
          answer:
            'Write the answer here.'
        });

        renderFaqEditor();
      }
    );


  document
    .querySelectorAll(
      '.tab'
    )
    .forEach(
      tab => {

        tab.addEventListener(
          'click',
          () => {

            document
              .querySelectorAll(
                '.tab'
              )
              .forEach(
                item =>
                  item.classList.remove(
                    'active'
                  )
              );

            tab.classList.add(
              'active'
            );

            document
              .querySelectorAll(
                '.tab-panel'
              )
              .forEach(
                panel =>
                  panel.hidden =
                    true
              );

            const target =
              document.getElementById(
                `tab-${tab.dataset.tab}`
              );

            if (target) {
              target.hidden =
                false;
            }
          }
        );
      }
    );


  document.addEventListener(
    'click',
    event => {

      const editProduct =
        event.target.closest(
          '[data-edit-product]'
        );

      if (editProduct) {

        const product =
          state.products.find(
            item =>
              String(
                item.id
              ) ===
              String(
                editProduct.dataset
                  .editProduct
              )
          );

        if (!product) return;

        showModal(
          `
            <h2>
              Edit product
            </h2>

            ${productForm(
              product
            )}
          `
        );

        document
          .getElementById(
            'productForm'
          )
          ?.addEventListener(
            'submit',
            saveProduct
          );

        return;
      }


      const deleteProductButton =
        event.target.closest(
          '[data-delete-product]'
        );

      if (
        deleteProductButton
      ) {

        deleteProduct(
          deleteProductButton
            .dataset
            .deleteProduct
        );

        return;
      }


      const editCategory =
        event.target.closest(
          '[data-edit-category]'
        );

      if (editCategory) {

        const category =
          state.categories.find(
            item =>
              String(
                item.id
              ) ===
              String(
                editCategory.dataset
                  .editCategory
              )
          );

        if (!category) return;

        showModal(
          `
            <h2>
              Edit category
            </h2>

            ${categoryForm(
              category
            )}
          `
        );

        document
          .getElementById(
            'categoryForm'
          )
          ?.addEventListener(
            'submit',
            saveCategory
          );

        return;
      }


      const deleteCategoryButton =
        event.target.closest(
          '[data-delete-category]'
        );

      if (
        deleteCategoryButton
      ) {

        deleteCategory(
          deleteCategoryButton
            .dataset
            .deleteCategory
        );

        return;
      }


      const replaceGallery =
        event.target.closest(
          '[data-gallery-replace]'
        );

      if (replaceGallery) {

        createFilePicker(
          async file => {

            const url =
              await uploadSiteImage(
                file,
                'homepage'
              );

            state.settings.social.images[
              Number(
                replaceGallery.dataset
                  .galleryReplace
              )
            ] =
              url;

            renderGalleryEditor();
          }
        );

        return;
      }


      const galleryUp =
        event.target.closest(
          '[data-gallery-up]'
        );

      if (galleryUp) {

        const index =
          Number(
            galleryUp.dataset
              .galleryUp
          );

        const target =
          index - 1;

        const items =
          state.settings.social
            .images;

        if (
          target >= 0
        ) {
          [
            items[index],
            items[target]
          ] =
          [
            items[target],
            items[index]
          ];

          renderGalleryEditor();
        }

        return;
      }


      const galleryDown =
        event.target.closest(
          '[data-gallery-down]'
        );

      if (galleryDown) {

        const index =
          Number(
            galleryDown.dataset
              .galleryDown
          );

        const target =
          index + 1;

        const items =
          state.settings.social
            .images;

        if (
          target <
          items.length
        ) {

          [
            items[index],
            items[target]
          ] =
          [
            items[target],
            items[index]
          ];

          renderGalleryEditor();
        }

        return;
      }


      const galleryDelete =
        event.target.closest(
          '[data-gallery-delete]'
        );

      if (
        galleryDelete
      ) {

        const index =
          Number(
            galleryDelete.dataset
              .galleryDelete
          );

        state.settings.social.images.splice(
          index,
          1
        );

        renderGalleryEditor();

        return;
      }


      const faqUp =
        event.target.closest(
          '[data-faq-up]'
        );

      if (faqUp) {

        const index =
          Number(
            faqUp.dataset
              .faqUp
          );

        const target =
          index - 1;

        const items =
          state.settings.faq.items;

        if (
          target >= 0
        ) {

          [
            items[index],
            items[target]
          ] =
          [
            items[target],
            items[index]
          ];

          renderFaqEditor();
        }

        return;
      }


      const faqDown =
        event.target.closest(
          '[data-faq-down]'
        );

      if (faqDown) {

        const index =
          Number(
            faqDown.dataset
              .faqDown
          );

        const target =
          index + 1;

        const items =
          state.settings.faq.items;

        if (
          target <
          items.length
        ) {

          [
            items[index],
            items[target]
          ] =
          [
            items[target],
            items[index]
          ];

          renderFaqEditor();
        }

        return;
      }


      const faqDelete =
        event.target.closest(
          '[data-faq-delete]'
        );

      if (
        faqDelete
      ) {

        const index =
          Number(
            faqDelete.dataset
              .faqDelete
          );

        state.settings.faq.items.splice(
          index,
          1
        );

        renderFaqEditor();
      }
    }
  );


  document.addEventListener(
    'change',
    event => {

      const orderSelect =
        event.target.closest(
          '[data-order-status]'
        );

      if (
        orderSelect
      ) {

        updateOrder(
          orderSelect.dataset
            .orderStatus,
          orderSelect.value
        );
      }
    }
  );


  if (
    window.GLOVAERA?.client
  ) {

    client()
      .auth
      .getSession()
      .then(
        async ({
          data,
          error
        }) => {

          if (
            error ||
            !data?.session
          ) {
            return;
          }

          const {
            data: isAdmin
          } =
            await client()
              .rpc(
                'is_admin'
              );

          if (!isAdmin) {

            await client()
              .auth
              .signOut();

            return;
          }

          state.user =
            data.session.user;

          await boot();
        }
      );
  }

})();
