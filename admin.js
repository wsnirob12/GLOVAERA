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

  const loginView =
    document.getElementById('loginView');

  const dashboard =
    document.getElementById('dashboardView');

  const loginMsg =
    document.getElementById('loginMsg');

  const modal =
    document.getElementById('modal');

  const modalContent =
    document.getElementById('modalContent');

  const client =
    () => window.GLOVAERA?.client || null;


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
        images:
          Array.isArray(
            source.social?.images
          )
            ? source.social.images
            : defaultSettings.social.images
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
      }
    };
  }


  function showModal(html) {
    modalContent.innerHTML = html;
    modal.hidden = false;
  }


  function closeModal() {
    modal.hidden = true;
  }


  function escapeHtml(value = '') {
    return String(value).replace(
      /[&<>'"]/g,
      char =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;'
        }[char])
    );
  }


  document
    .getElementById(
      'closeModal'
    )
    ?.addEventListener(
      'click',
      closeModal
    );


  /* =========================
     LOGIN
     ========================= */

  async function signIn(event) {

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
      await supabase.auth.signInWithPassword({
        email:
          form.get('email'),
        password:
          form.get('password')
      });

    if (error) {

      loginMsg.textContent =
        error.message;

      return;
    }

    state.user =
      data.user;

    const {
      data: admin,
      error: adminError
    } =
      await supabase.rpc(
        'is_admin'
      );

    if (
      adminError ||
      !admin
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


  /* =========================
     DATA
     ========================= */

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
          .from('products')
          .select('*')
          .order(
            'created_at',
            {
              ascending:
                false
            }
          ),

        supabase
          .from('categories')
          .select('*')
          .order('name'),

        supabase
          .from('orders')
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
        `Products error: ${products.error.message}`
      );
    }

    if (categories.error) {
      alert(
        `Categories error: ${categories.error.message}`
      );
    }

    if (orders.error) {
      alert(
        `Orders error: ${orders.error.message}`
      );
    }

    state.products =
      products.data || [];

    state.categories =
      categories.data || [];

    state.orders =
      orders.data || [];

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
        ([name, value]) => `
          <div class="stat-card">
            <span>${name}</span>
            <strong>${value}</strong>
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
          product => `
            <div class="admin-row">

              <img
                src="${
                  product.image_url ||
                  'logo.png'
                }"
                alt=""
              >

              <div class="grow">

                <strong>
                  ${GLOVAERA.escapeHtml(
                    product.name
                  )}
                </strong>

                <span>
                  ${GLOVAERA.escapeHtml(
                    product.category || ''
                  )}
                  ·
                  ${GLOVAERA.money(
                    product.sale_price ??
                      product.price
                  )}
                  · Stock
                  ${product.stock ?? 0}
                </span>

              </div>

              <button
                class="btn btn-secondary small"
                data-edit-product="${product.id}"
              >
                Edit
              </button>

              <button
                class="btn btn-danger small"
                data-delete-product="${product.id}"
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
          category => `
            <div class="admin-row">

              <img
                src="${
                  category.image_url ||
                  'logo.png'
                }"
                alt=""
              >

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
                data-edit-category="${category.id}"
              >
                Edit
              </button>

              <button
                class="btn btn-danger small"
                data-delete-category="${category.id}"
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
          order => `
            <div class="admin-order">

              <div
                class="admin-order-head"
              >

                <strong>
                  #
                  ${GLOVAERA.escapeHtml(
                    String(
                      order.id
                    ).slice(
                      0,
                      8
                    )
                  )}
                </strong>

                <span class="status">
                  ${GLOVAERA.escapeHtml(
                    order.status
                  )}
                </span>

              </div>

              <p>
                ${GLOVAERA.escapeHtml(
                  order.customer_name
                )}
                ·
                ${GLOVAERA.escapeHtml(
                  order.phone
                )}
              </p>

              <p>
                ${GLOVAERA.escapeHtml(
                  order.address
                )}
                ,
                ${GLOVAERA.escapeHtml(
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
                  data-order-status="${order.id}"
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


  /* =========================
     CATEGORY FORM
     ========================= */

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
            category.id || ''
          }"
        >

        <label>
          Name

          <input
            required
            name="name"
            value="${escapeHtml(
              category.name || ''
            )}"
          >
        </label>


        <label>
          Slug

          <input
            required
            name="slug"
            value="${escapeHtml(
              category.slug || ''
            )}"
          >
        </label>


        <label class="full">

          Category photo

          <input
            type="file"
            name="category_image"
            accept="image/*"
          >

        </label>


        <div
          class="category-upload-preview full"
        >

          <img
            src="${
              category.image_url ||
              'logo.png'
            }"
            alt=""
          >

          <span>
            Existing image
          </span>

        </div>


        <label class="full">

          Or image URL

          <input
            name="image_url"
            value="${escapeHtml(
              category.image_url ||
                'logo.png'
            )}"
          >

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
        form.get(
          'image_url'
        ) ||
        'logo.png';

      const file =
        form.get(
          'category_image'
        );

      if (
        file &&
        file.size
      ) {

        const safeName =
          file.name.replace(
            /[^a-zA-Z0-9._-]/g,
            '-'
          );

        const path =
          `categories/${crypto.randomUUID()}-${safeName}`;

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

        imageUrl =
          supabase
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
          imageUrl
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

    } catch (error) {

      alert(
        `Category save failed: ${
          error.message
        }`
      );
    }
  }


  /* =========================
     PRODUCT FORM
     ========================= */

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
            product.id || ''
          }"
        >

        <label>
          Name
          <input
            required
            name="name"
            value="${escapeHtml(
              product.name || ''
            )}"
          >
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
            name="price"
            value="${
              product.price ?? 0
            }"
          >
        </label>

        <label>
          Sale price

          <input
            type="number"
            min="0"
            name="sale_price"
            value="${
              product.sale_price ??
              ''
            }"
          >
        </label>

        <label>
          Stock

          <input
            required
            type="number"
            min="0"
            name="stock"
            value="${
              product.stock ?? 0
            }"
          >
        </label>

        <label>
          Image URL

          <input
            name="image_url"
            value="${escapeHtml(
              product.image_url ||
                'logo.png'
            )}"
          >
        </label>

        <label>
          Upload image

          <input
            type="file"
            accept="image/*"
            name="image_file"
          >
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
          >
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
          >
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
          >
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
        ) || 'logo.png';

      const file =
        form.get(
          'image_file'
        );

      if (
        file &&
        file.size
      ) {

        const safeName =
          file.name.replace(
            /[^a-zA-Z0-9._-]/g,
            '-'
          );

        const path =
          `${crypto.randomUUID()}-${safeName}`;

        const upload =
          await supabase
            .storage
            .from(
              'product-images'
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

        imageUrl =
          supabase
            .storage
            .from(
              'product-images'
            )
            .getPublicUrl(
              path
            )
            .data
            .publicUrl;
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

    } catch (error) {

      alert(
        `Product save failed: ${
          error.message
        }`
      );
    }
  }


  /* =========================
     SITE SETTINGS
     ========================= */

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

    document.getElementById(
      'settingBurgundyText'
    ).value =
      s.branding.burgundy;

    document.getElementById(
      'settingDarkBurgundyText'
    ).value =
      s.branding.darkBurgundy;

    document.getElementById(
      'settingGoldText'
    ).value =
      s.branding.gold;

    document.getElementById(
      'settingLightGoldText'
    ).value =
      s.branding.lightGold;

    document.getElementById(
      'settingIvoryText'
    ).value =
      s.branding.ivory;


    document.getElementById(
      'categoryFitInput'
    ).value =
      s.layout.categoryImageFit ||
      'cover';

    document.getElementById(
      'categoryGapInput'
    ).value =
      s.layout.categoryGap ||
      14;


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
  }


  function renderGalleryEditor() {

    const box =
      document.getElementById(
        'galleryEditorList'
      );

    const images =
      state.settings.social.images ||
      [];

    box.innerHTML =
      images
        .map(
          (url, index) => `
            <div class="gallery-editor-row">

              <div class="gallery-preview">

                <img
                  src="${escapeHtml(
                    url
                  )}"
                  alt=""
                />

              </div>

              <div class="gallery-editor-main">

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


  async function uploadGallery(
    index
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

          const url =
            await uploadSiteImage(
              file,
              'homepage'
            );

          state.settings.social.images[
            index
          ] =
            url;

          renderGalleryEditor();

        } catch (error) {

          alert(
            error.message
          );
        }
      };

    input.click();
  }


  async function addGallery() {

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

          const url =
            await uploadSiteImage(
              file,
              'homepage'
            );

          state.settings.social.images.push(
            url
          );

          renderGalleryEditor();

        } catch (error) {

          alert(
            error.message
          );
        }
      };

    input.click();
  }


  function deleteGallery(
    index
  ) {

    if (
      !confirm(
        'এই ছবি remove করবে?'
      )
    ) return;

    state.settings.social.images.splice(
      index,
      1
    );

    renderGalleryEditor();
  }


  function moveGallery(
    index,
    amount
  ) {

    const target =
      index + amount;

    const items =
      state.settings.social.images;

    if (
      target < 0 ||
      target >= items.length
    ) return;

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


  /* =========================
     FAQ EDITOR
     ========================= */

  function renderFaqEditor() {

    const box =
      document.getElementById(
        'faqEditorList'
      );

    const items =
      state.settings.faq.items ||
      [];

    box.innerHTML =
      items
        .map(
          (item, index) => `
            <div
              class="faq-editor-item"
            >

              <div
                class="faq-editor-number"
              >
                ${index + 1}
              </div>

              <div
                class="faq-editor-fields"
              >

                <input
                  type="text"
                  data-faq-question="${index}"
                  value="${escapeHtml(
                    item.question || ''
                  )}"
                  placeholder="Question"
                />

                <textarea
                  rows="3"
                  data-faq-answer="${index}"
                  placeholder="Answer"
                >${escapeHtml(
                  item.answer || ''
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


  function addFaq() {

    state.settings.faq.items.push({
      question:
        'New question',
      answer:
        'Write the answer here.'
    });

    renderFaqEditor();
  }


  function collectFaqFields() {

    state.settings.faq.items =
      state.settings.faq.items.map(
        (item, index) => {

          const question =
            document.querySelector(
              `[data-faq-question="${index}"]`
            );

          const answer =
            document.querySelector(
              `[data-faq-answer="${index}"]`
            );

          return {
            question:
              question?.value.trim() ||
              '',
            answer:
              answer?.value.trim() ||
              ''
          };
        }
      );
  }


  /* =========================
     SAVE
     ========================= */

  async function saveSiteSettings() {

    const button =
      document.getElementById(
        'saveSiteSettingsBtn'
      );

    collectFaqFields();

    state.settings.layout.categoryImageFit =
      document.getElementById(
        'categoryFitInput'
      ).value;

    state.settings.layout.categoryGap =
      Number(
        document.getElementById(
          'categoryGapInput'
        ).value
      );

    state.settings.social.eyebrow =
      document.getElementById(
        'socialEyebrowInput'
      ).value.trim();

    state.settings.social.title =
      document.getElementById(
        'socialTitleInput'
      ).value.trim();

    state.settings.social.imageFit =
      document.getElementById(
        'socialFitInput'
      ).value;

    state.settings.layout.socialColumns =
      Number(
        document.getElementById(
          'socialColumnsInput'
        ).value
      );

    state.settings.layout.socialGap =
      Number(
        document.getElementById(
          'socialGapInput'
        ).value
      );

    state.settings.layout.socialRadius =
      Number(
        document.getElementById(
          'socialRadiusInput'
        ).value
      );

    state.settings.faq.eyebrow =
      document.getElementById(
        'faqEyebrowInput'
      ).value.trim();

    state.settings.faq.title =
      document.getElementById(
        'faqTitleInput'
      ).value.trim();


    state.settings.branding.burgundy =
      document.getElementById(
        'settingBurgundyText'
      ).value.trim();

    state.settings.branding.darkBurgundy =
      document.getElementById(
        'settingDarkBurgundyText'
      ).value.trim();

    state.settings.branding.gold =
      document.getElementById(
        'settingGoldText'
      ).value.trim();

    state.settings.branding.lightGold =
      document.getElementById(
        'settingLightGoldText'
      ).value.trim();

    state.settings.branding.ivory =
      document.getElementById(
        'settingIvoryText'
      ).value.trim();


    button.disabled =
      true;

    button.textContent =
      'Saving...';


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
              state.settings,

            updated_at:
              new Date().toISOString()
          },
          {
            onConflict:
              'id'
          }
        );


    button.disabled =
      false;

    button.textContent =
      'Save website settings';


    if (error) {

      alert(
        `Save failed: ${
          error.message
        }`
      );

      return;
    }


    if (
      window.GLOVAERA
        ?.applySiteSettings
    ) {

      window.GLOVAERA
        .settings =
        state.settings;

      window.GLOVAERA
        .applySiteSettings();
    }


    alert(
      'Website settings saved successfully ✓'
    );
  }


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


  /* =========================
     DELETE / UPDATE
     ========================= */

  async function deleteProduct(id) {

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
      alert(error.message);
      return;
    }

    await refreshAll();
  }


  async function deleteCategory(id) {

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
      alert(error.message);
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
      alert(error.message);
      return;
    }

    await refreshAll();
  }


  /* =========================
     EVENT LISTENERS
     ========================= */

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
      addGallery
    );


  document
    .getElementById(
      'addFaqBtn'
    )
    ?.addEventListener(
      'click',
      addFaq
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


      const deleteCat =
        event.target.closest(
          '[data-delete-category]'
        );

      if (deleteCat) {

        deleteCategory(
          deleteCat.dataset
            .deleteCategory
        );

        return;
      }


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


      const deleteProd =
        event.target.closest(
          '[data-delete-product]'
        );

      if (deleteProd) {

        deleteProduct(
          deleteProd.dataset
            .deleteProduct
        );

        return;
      }


      const replaceGallery =
        event.target.closest(
          '[data-gallery-replace]'
        );

      if (replaceGallery) {

        uploadGallery(
          Number(
            replaceGallery.dataset
              .galleryReplace
          )
        );

        return;
      }


      const up =
        event.target.closest(
          '[data-gallery-up]'
        );

      if (up) {

        moveGallery(
          Number(
            up.dataset.galleryUp
          ),
          -1
        );

        return;
      }


      const down =
        event.target.closest(
          '[data-gallery-down]'
        );

      if (down) {

        moveGallery(
          Number(
            down.dataset.galleryDown
          ),
          1
        );

        return;
      }


      const deleteGalleryButton =
        event.target.closest(
          '[data-gallery-delete]'
        );

      if (
        deleteGalleryButton
      ) {

        deleteGallery(
          Number(
            deleteGalleryButton
              .dataset
              .galleryDelete
          )
        );

        return;
      }


      const faqUp =
        event.target.closest(
          '[data-faq-up]'
        );

      if (faqUp) {

        moveFaq(
          Number(
            faqUp.dataset
              .faqUp
          ),
          -1
        );

        return;
      }


      const faqDown =
        event.target.closest(
          '[data-faq-down]'
        );

      if (faqDown) {

        moveFaq(
          Number(
            faqDown.dataset
              .faqDown
          ),
          1
        );

        return;
      }


      const faqDelete =
        event.target.closest(
          '[data-faq-delete]'
        );

      if (faqDelete) {

        state.settings.faq.items.splice(
          Number(
            faqDelete.dataset
              .faqDelete
          ),
          1
        );

        renderFaqEditor();

      }

    }
  );


  function moveFaq(
    index,
    amount
  ) {

    const target =
      index + amount;

    const items =
      state.settings.faq.items;

    if (
      target < 0 ||
      target >= items.length
    ) return;

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


  document.addEventListener(
    'change',
    event => {

      const select =
        event.target.closest(
          '[data-order-status]'
        );

      if (!select) return;

      updateOrder(
        select.dataset
          .orderStatus,
        select.value
      );
    }
  );


  if (
    window.GLOVAERA
      ?.client
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
            data: admin
          } =
            await client().rpc(
              'is_admin'
            );

          if (!admin) {

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
