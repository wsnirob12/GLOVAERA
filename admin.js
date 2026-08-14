(function () {

  const state = {
    user: null,
    products: [],
    categories: [],
    orders: [],
    settings: null
  };

  const client = () =>
    window.GLOVAERA?.client || null;


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
      socialRadius: 0
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


  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }


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

      social: {
        ...defaultSettings.social,
        ...(data.social || {})
      }
    };
  }


  function setLoginMessage(
    message,
    error = true
  ) {

    if (!loginMsg) return;

    loginMsg.textContent = message || '';

    loginMsg.className = error
      ? 'form-message error'
      : 'form-message';
  }


  function setEditorMessage(
    message,
    error = false
  ) {

    const element =
      document.getElementById(
        'editorMessage'
      );

    if (!element) return;

    element.textContent =
      message || '';

    element.className = error
      ? 'form-message error'
      : 'form-message success';
  }


  function showModal(html) {

    modalContent.innerHTML = html;
    modal.hidden = false;

  }


  function closeModal() {

    modal.hidden = true;

  }


  document
    .getElementById('closeModal')
    ?.addEventListener(
      'click',
      closeModal
    );


  /*
   * =========================================================
   * LOGIN
   * =========================================================
   */

  async function signIn(event) {

    event.preventDefault();

    const supabase = client();

    if (!supabase) {

      setLoginMessage(
        'Supabase connection পাওয়া যাচ্ছে না। config.js check করো।'
      );

      return;
    }


    setLoginMessage(
      'Signing in...',
      false
    );


    const formData =
      new FormData(event.target);


    const {
      data,
      error
    } =
      await supabase.auth.signInWithPassword({

        email:
          formData.get('email'),

        password:
          formData.get('password')

      });


    if (error) {

      setLoginMessage(
        error.message
      );

      return;
    }


    if (!data?.user) {

      setLoginMessage(
        'Login failed.'
      );

      return;
    }


    state.user =
      data.user;


    const {
      data: isAdmin,
      error: adminError
    } =
      await supabase.rpc(
        'is_admin'
      );


    if (
      adminError ||
      !isAdmin
    ) {

      await supabase.auth.signOut();

      setLoginMessage(
        adminError
          ? `Admin verification failed: ${adminError.message}`
          : 'এই account-টি GLOVAERA admin নয়।'
      );

      return;
    }


    await boot();

  }


  async function boot() {

    loginView.hidden = true;
    dashboard.hidden = false;

    await refreshAll();
    await loadEditorSettings();

  }


  /*
   * =========================================================
   * LOAD DATA
   * =========================================================
   */

  async function refreshAll() {

    const supabase =
      client();

    if (!supabase) return;


    const [
      productsResult,
      categoriesResult,
      ordersResult
    ] =
      await Promise.all([

        supabase
          .from('products')
          .select('*')
          .order(
            'created_at',
            {
              ascending: false
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
              ascending: false
            }
          )

      ]);


    if (productsResult.error) {
      alert(
        `Products error: ${productsResult.error.message}`
      );
    }


    if (categoriesResult.error) {
      alert(
        `Categories error: ${categoriesResult.error.message}`
      );
    }


    if (ordersResult.error) {
      alert(
        `Orders error: ${ordersResult.error.message}`
      );
    }


    state.products =
      productsResult.data || [];

    state.categories =
      categoriesResult.data || [];

    state.orders =
      ordersResult.data || [];


    renderOverview();
    renderProducts();
    renderCategories();
    renderOrders();

  }


  /*
   * =========================================================
   * OVERVIEW
   * =========================================================
   */

  function renderOverview() {

    const element =
      document.getElementById(
        'statsGrid'
      );

    if (!element) return;


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


    element.innerHTML = [

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
        ([label, value]) => `

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


  /*
   * =========================================================
   * PRODUCTS
   * =========================================================
   */

  function renderProducts() {

    const element =
      document.getElementById(
        'productAdminList'
      );

    if (!element) return;


    element.innerHTML =
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


  /*
   * =========================================================
   * CATEGORIES
   * =========================================================
   */

  function renderCategories() {

    const element =
      document.getElementById(
        'categoryAdminList'
      );

    if (!element) return;


    element.innerHTML =
      state.categories
        .map(
          category => `

            <div class="admin-row">

              <div class="grow">

                <strong>
                  ${GLOVAERA.escapeHtml(
                    category.name
                  )}
                </strong>

                <span>
                  ${GLOVAERA.escapeHtml(
                    category.slug || ''
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


  /*
   * =========================================================
   * ORDERS
   * =========================================================
   */

  function renderOrders() {

    const element =
      document.getElementById(
        'orderAdminList'
      );

    if (!element) return;


    element.innerHTML =
      state.orders
        .map(
          order => `

            <div class="admin-order">

              <div
                class="admin-order-head"
              >

                <strong>
                  #${GLOVAERA.escapeHtml(
                    String(
                      order.id
                    ).slice(0, 8)
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
                )},
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


  /*
   * =========================================================
   * PRODUCT FORM
   * =========================================================
   */

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
            value="${
              GLOVAERA.escapeHtml(
                product.name || ''
              )
            }"
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
                        ${GLOVAERA.escapeHtml(
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
              product.price ?? 0
            }"
          >
        </label>

        <label>
          Sale price
          <input
            type="number"
            min="0"
            step="0.01"
            name="sale_price"
            value="${
              product.sale_price ?? ''
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
            value="${
              GLOVAERA.escapeHtml(
                product.image_url ||
                'logo.png'
              )
            }"
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
          >${
            GLOVAERA.escapeHtml(
              product.description ||
              ''
            )
          }</textarea>
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
          form.get('name'),

        category:
          form.get('category'),

        price:
          Number(
            form.get('price')
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
            form.get('stock')
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
              .from('products')
              .update(record)
              .eq(
                'id',
                id
              )
          : supabase
              .from('products')
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

      console.error(
        error
      );

      alert(
        `Could not save product: ${
          error.message
        }`
      );

    }

  }


  /*
   * =========================================================
   * CATEGORY FORM
   * =========================================================
   */

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
            value="${
              GLOVAERA.escapeHtml(
                category.name ||
                ''
              )
            }"
          >

        </label>

        <label>
          Slug

          <input
            required
            name="slug"
            value="${
              GLOVAERA.escapeHtml(
                category.slug ||
                ''
              )
            }"
          >

        </label>

        <label class="full">

          Image URL

          <input
            name="image_url"
            value="${
              GLOVAERA.escapeHtml(
                category.image_url ||
                'logo.png'
              )
            }"
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
          form.get(
            'image_url'
          ) ||
          'logo.png'

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
        `Could not save category: ${
          error.message
        }`
      );

    }

  }


  /*
   * =========================================================
   * SITE EDITOR - LOAD
   * =========================================================
   */

  async function loadEditorSettings() {

    const supabase =
      client();

    if (!supabase) return;


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

      console.error(
        error
      );

      setEditorMessage(
        `Could not load editor settings: ${
          error.message
        }`,
        true
      );

      state.settings =
        deepClone(
          defaultSettings
        );

    } else {

      state.settings =
        mergeSettings(
          data?.settings
        );

    }


    fillEditorFields();

  }


  /*
   * =========================================================
   * SITE EDITOR - FILL FORM
   * =========================================================
   */

  function fillEditorFields() {

    const settings =
      state.settings ||
      deepClone(
        defaultSettings
      );


    const brand =
      settings.branding;

    const layout =
      settings.layout;

    const social =
      settings.social;


    setColor(
      'settingBurgundy',
      'settingBurgundyText',
      brand.burgundy
    );

    setColor(
      'settingDarkBurgundy',
      'settingDarkBurgundyText',
      brand.darkBurgundy
    );

    setColor(
      'settingGold',
      'settingGoldText',
      brand.gold
    );

    setColor(
      'settingLightGold',
      'settingLightGoldText',
      brand.lightGold
    );

    setColor(
      'settingIvory',
      'settingIvoryText',
      brand.ivory
    );


    const containerWidth =
      document.getElementById(
        'settingContainerWidth'
      );

    const containerValue =
      document.getElementById(
        'settingContainerWidthValue'
      );

    containerWidth.value =
      Number(
        layout.containerWidth
      );

    containerValue.textContent =
      `${layout.containerWidth}px`;


    const sectionPadding =
      document.getElementById(
        'settingSectionPadding'
      );

    const sectionValue =
      document.getElementById(
        'settingSectionPaddingValue'
      );

    sectionPadding.value =
      Number(
        layout.sectionPadding
      );

    sectionValue.textContent =
      `${layout.sectionPadding}px`;


    const heroGap =
      document.getElementById(
        'settingHeroGap'
      );

    const heroValue =
      document.getElementById(
        'settingHeroGapValue'
      );

    heroGap.value =
      Number(
        layout.heroGap
      );

    heroValue.textContent =
      `${layout.heroGap}px`;


    document.getElementById(
      'socialEyebrowInput'
    ).value =
      social.eyebrow || '';


    document.getElementById(
      'socialTitleInput'
    ).value =
      social.title || '';


    document.getElementById(
      'socialColumnsInput'
    ).value =
      Number(
        layout.socialColumns ||
        6
      );


    const socialGap =
      document.getElementById(
        'socialGapInput'
      );

    socialGap.value =
      Number(
        layout.socialGap ||
        12
      );

    document.getElementById(
      'socialGapValue'
    ).textContent =
      `${socialGap.value}px`;


    const socialRadius =
      document.getElementById(
        'socialRadiusInput'
      );

    socialRadius.value =
      Number(
        layout.socialRadius ||
        0
      );

    document.getElementById(
      'socialRadiusValue'
    ).textContent =
      `${socialRadius.value}px`;


    document.getElementById(
      'socialFitInput'
    ).value =
      social.imageFit ||
      'cover';


    renderGalleryEditor();

  }


  function setColor(
    colorId,
    textId,
    value
  ) {

    const color =
      document.getElementById(
        colorId
      );

    const text =
      document.getElementById(
        textId
      );


    if (!color || !text) return;


    color.value =
      normalizeColor(
        value
      );

    text.value =
      normalizeColor(
        value
      );


    color.oninput =
      () => {
        text.value =
          color.value;
      };


    text.onchange =
      () => {

        const fixed =
          normalizeColor(
            text.value
          );

        if (!fixed) return;

        text.value =
          fixed;

        color.value =
          fixed;

      };

  }


  function normalizeColor(
    value
  ) {

    const text =
      String(
        value || ''
      ).trim();


    if (
      /^#[0-9a-fA-F]{6}$/.test(
        text
      )
    ) {

      return text;

    }


    return '#000000';

  }


  /*
   * =========================================================
   * GALLERY EDITOR
   * =========================================================
   */

  function renderGalleryEditor() {

    const list =
      document.getElementById(
        'galleryEditorList'
      );

    if (!list) return;


    const images =
      state.settings.social
        .images || [];


    if (!images.length) {

      list.innerHTML = `
        <div class="empty-state">
          No gallery images.
        </div>
      `;

      return;

    }


    list.innerHTML =
      images
        .map(
          (url, index) => `

            <div
              class="gallery-editor-row"
              data-gallery-index="${index}"
            >

              <div class="gallery-preview">

                <img
                  src="${escapeAttr(
                    url
                  )}"
                  alt=""
                >

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


                <div class="gallery-actions">

                  <button
                    type="button"
                    class="btn btn-secondary small"
                    data-upload-gallery="${index}"
                  >
                    Replace
                  </button>


                  <button
                    type="button"
                    class="btn btn-secondary small"
                    data-move-gallery-up="${index}"
                    ${
                      index === 0
                        ? 'disabled'
                        : ''
                    }
                  >
                    ↑
                  </button>


                  <button
                    type="button"
                    class="btn btn-secondary small"
                    data-move-gallery-down="${index}"
                    ${
                      index === images.length - 1
                        ? 'disabled'
                        : ''
                    }
                  >
                    ↓
                  </button>


                  <button
                    type="button"
                    class="btn btn-danger small"
                    data-delete-gallery="${index}"
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


  async function uploadGalleryImage(
    index
  ) {

    const supabase =
      client();

    if (!supabase) return;


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

          const safeName =
            file.name.replace(
              /[^a-zA-Z0-9._-]/g,
              '-'
            );


          const path =
            `homepage/${crypto.randomUUID()}-${safeName}`;


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


          const publicUrl =
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


          state.settings.social.images[
            index
          ] =
            publicUrl;


          renderGalleryEditor();


          setEditorMessage(
            'Image uploaded. Save website settings চাপো।',
            false
          );


        } catch (error) {

          console.error(
            error
          );

          alert(
            `Image upload failed: ${
              error.message
            }`
          );

        }

      };


    input.click();

  }


  async function addGalleryImage() {

    const supabase =
      client();

    if (!supabase) return;


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

          const safeName =
            file.name.replace(
              /[^a-zA-Z0-9._-]/g,
              '-'
            );


          const path =
            `homepage/${crypto.randomUUID()}-${safeName}`;


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


          const publicUrl =
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


          state.settings.social.images.push(
            publicUrl
          );


          renderGalleryEditor();


          setEditorMessage(
            'New image added. Save website settings চাপো।',
            false
          );


        } catch (error) {

          console.error(
            error
          );

          alert(
            `Image upload failed: ${
              error.message
            }`
          );

        }

      };


    input.click();

  }


  function moveGalleryImage(
    index,
    direction
  ) {

    const images =
      state.settings.social.images;


    const target =
      index + direction;


    if (
      target < 0 ||
      target >= images.length
    ) {
      return;
    }


    [
      images[index],
      images[target]
    ] =
    [
      images[target],
      images[index]
    ];


    renderGalleryEditor();

  }


  function deleteGalleryImage(
    index
  ) {

    if (
      !confirm(
        'এই image-টি remove করতে চাও?'
      )
    ) {
      return;
    }


    state.settings.social.images.splice(
      index,
      1
    );


    renderGalleryEditor();

  }


  /*
   * =========================================================
   * SITE EDITOR - COLLECT VALUES
   * =========================================================
   */

  function collectEditorSettings() {

    const current =
      mergeSettings(
        state.settings
      );


    current.branding.burgundy =
      document.getElementById(
        'settingBurgundyText'
      ).value;


    current.branding.darkBurgundy =
      document.getElementById(
        'settingDarkBurgundyText'
      ).value;


    current.branding.gold =
      document.getElementById(
        'settingGoldText'
      ).value;


    current.branding.lightGold =
      document.getElementById(
        'settingLightGoldText'
      ).value;


    current.branding.ivory =
      document.getElementById(
        'settingIvoryText'
      ).value;


    current.layout.containerWidth =
      Number(
        document.getElementById(
          'settingContainerWidth'
        ).value
      );


    current.layout.sectionPadding =
      Number(
        document.getElementById(
          'settingSectionPadding'
        ).value
      );


    current.layout.heroGap =
      Number(
        document.getElementById(
          'settingHeroGap'
        ).value
      );


    current.layout.socialColumns =
      Number(
        document.getElementById(
          'socialColumnsInput'
        ).value
      );


    current.layout.socialGap =
      Number(
        document.getElementById(
          'socialGapInput'
        ).value
      );


    current.layout.socialRadius =
      Number(
        document.getElementById(
          'socialRadiusInput'
        ).value
      );


    current.social.eyebrow =
      document.getElementById(
        'socialEyebrowInput'
      ).value.trim();


    current.social.title =
      document.getElementById(
        'socialTitleInput'
      ).value.trim();


    current.social.imageFit =
      document.getElementById(
        'socialFitInput'
      ).value;


    current.social.images =
      [
        ...(state.settings.social.images || [])
      ];


    return mergeSettings(
      current
    );

  }


  /*
   * =========================================================
   * SAVE SITE SETTINGS
   * =========================================================
   */

  async function saveSiteSettings() {

    const supabase =
      client();

    if (!supabase) return;


    const button =
      document.getElementById(
        'saveSiteSettingsBtn'
      );


    try {

      button.disabled =
        true;

      button.textContent =
        'Saving...';


      const settings =
        collectEditorSettings();


      const {
        error
      } =
      await supabase
        .from(
          'site_settings'
        )
        .upsert(
          {
            id:
              'global',

            settings,

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


      state.settings =
        settings;


      if (
        window.GLOVAERA
          ?.applySiteSettings
      ) {

        window.GLOVAERA.applySiteSettings();

      }


      setEditorMessage(
        'Website settings successfully saved ✓',
        false
      );


    } catch (error) {

      console.error(
        error
      );

      setEditorMessage(
        `Save failed: ${
          error.message
        }`,
        true
      );

    } finally {

      button.disabled =
        false;

      button.textContent =
        'Save website settings';

    }

  }


  /*
   * =========================================================
   * DELETE / UPDATE
   * =========================================================
   */

  async function deleteProduct(
    id
  ) {

    if (
      !confirm(
        'Delete this product?'
      )
    ) {
      return;
    }


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
    ) {
      return;
    }


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


  async function updateOrderStatus(
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


  /*
   * =========================================================
   * EVENTS
   * =========================================================
   */

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
          `<h2>Add product</h2>${productForm()}`
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
          `<h2>Add category</h2>${categoryForm()}`
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
      addGalleryImage
    );


  document
    .getElementById(
      'settingContainerWidth'
    )
    ?.addEventListener(
      'input',
      event => {

        document.getElementById(
          'settingContainerWidthValue'
        ).textContent =
          `${event.target.value}px`;

      }
    );


  document
    .getElementById(
      'settingSectionPadding'
    )
    ?.addEventListener(
      'input',
      event => {

        document.getElementById(
          'settingSectionPaddingValue'
        ).textContent =
          `${event.target.value}px`;

      }
    );


  document
    .getElementById(
      'settingHeroGap'
    )
    ?.addEventListener(
      'input',
      event => {

        document.getElementById(
          'settingHeroGapValue'
        ).textContent =
          `${event.target.value}px`;

      }
    );


  document
    .getElementById(
      'socialGapInput'
    )
    ?.addEventListener(
      'input',
      event => {

        document.getElementById(
          'socialGapValue'
        ).textContent =
          `${event.target.value}px`;

      }
    );


  document
    .getElementById(
      'socialRadiusInput'
    )
    ?.addEventListener(
      'input',
      event => {

        document.getElementById(
          'socialRadiusValue'
        ).textContent =
          `${event.target.value}px`;

      }
    );


  document
    .querySelectorAll(
      '.tab'
    )
    .forEach(
      button => {

        button.addEventListener(
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


            button.classList.add(
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
                `tab-${button.dataset.tab}`
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
          `<h2>Edit product</h2>${productForm(
            product
          )}`
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
          `<h2>Edit category</h2>${categoryForm(
            category
          )}`
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


      const uploadGallery =
        event.target.closest(
          '[data-upload-gallery]'
        );


      if (uploadGallery) {

        uploadGalleryImage(
          Number(
            uploadGallery.dataset
              .uploadGallery
          )
        );

        return;

      }


      const moveUp =
        event.target.closest(
          '[data-move-gallery-up]'
        );


      if (moveUp) {

        moveGalleryImage(
          Number(
            moveUp.dataset
              .moveGalleryUp
          ),
          -1
        );

        return;

      }


      const moveDown =
        event.target.closest(
          '[data-move-gallery-down]'
        );


      if (moveDown) {

        moveGalleryImage(
          Number(
            moveDown.dataset
              .moveGalleryDown
          ),
          1
        );

        return;

      }


      const deleteGallery =
        event.target.closest(
          '[data-delete-gallery]'
        );


      if (deleteGallery) {

        deleteGalleryImage(
          Number(
            deleteGallery.dataset
              .deleteGallery
          )
        );

      }

    }
  );


  document.addEventListener(
    'change',
    event => {

      const select =
        event.target.closest(
          '[data-order-status]'
        );


      if (!select) return;


      updateOrderStatus(
        select.dataset
          .orderStatus,
        select.value
      );

    }
  );


  /*
   * =========================================================
   * SESSION RESTORE
   * =========================================================
   */

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

          if (error) {

            console.error(
              error
            );

            return;

          }


          if (
            !data?.session
          ) {
            return;
          }


          const {
            data: isAdmin,
            error: adminError
          } =
            await client().rpc(
              'is_admin'
            );


          if (
            adminError ||
            !isAdmin
          ) {

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


  function escapeAttr(
    value = ''
  ) {

    return String(
      value
    ).replace(
      /[&<>"']/g,
      char =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[char])
    );

  }


  function escapeHtml(
    value = ''
  ) {

    return escapeAttr(
      value
    );

  }


})();
