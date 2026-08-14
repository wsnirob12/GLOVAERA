(function () {

  'use strict';


  const CONFIG =
    window.GLOVAERA_CONFIG || {};

  const supabaseReady =
    !!(
      window.supabase &&
      CONFIG.supabaseUrl &&
      CONFIG.supabaseAnonKey &&
      !String(
        CONFIG.supabaseUrl
      ).startsWith('YOUR_') &&
      !String(
        CONFIG.supabaseAnonKey
      ).startsWith('YOUR_')
    );


  const supabase =
    supabaseReady
      ? window.supabase.createClient(
          CONFIG.supabaseUrl,
          CONFIG.supabaseAnonKey
        )
      : null;


  const DEFAULTS = {

    branding: {
      burgundy:'#6D2348',
      darkBurgundy:'#4A1730',
      gold:'#D8B56A',
      lightGold:'#E8CC8A',
      ivory:'#FBF8F2'
    },

    layout: {
      containerWidth:1160,
      sectionPadding:94,
      heroGap:60,
      socialColumns:6,
      socialGap:12,
      socialRadius:12
    },

    announcement: {
      enabled:true,
      text:'✦ COD Available · A New Era of Elegance'
    },

    hero: {
      enabled:true,
      eyebrow:'A NEW ERA OF ELEGANCE',
      title:'Everyday elegance, effortlessly yours.',
      description:
        'Thoughtfully selected jewellery and accessories made to add a little glow to every day — without the luxury price tag.',
      button1Text:'Shop Collection',
      button1Link:'shop.html',
      button2Text:'Explore Combos',
      button2Link:'shop.html?combo=true',
      image:'logo.png'
    },

    social: {
      enabled:true,
      eyebrow:'STAY IN THE GLOVAERA MOOD',
      title:'Follow the edit',
      images:[]
    },

    combo: {
      enabled:true,
      eyebrow:'THE GLOVAERA EDIT',
      title:'More beauty. Better value.',
      description:
        'Discover easy-to-style combo sets designed for everyday wear, gifting and tiny moments worth celebrating.',
      badge:'FEATURED COMBO',
      productTitle:'Soft Glow Set',
      productDescription:'Earrings + Ring + Hijab Pin',
      price:'৳349',
      buttonText:'Shop combos',
      buttonLink:'shop.html?combo=true',
      image:''
    },

    faq: {
      enabled:true,
      eyebrow:'YOU ASKED, WE ANSWER',
      title:'Frequently asked questions',
      items:[
        {
          question:'How can I place an order?',
          answer:'Add your favourite products to cart and complete the checkout form. Cash on Delivery is available.'
        },
        {
          question:'How much is delivery?',
          answer:'Delivery charges are calculated automatically during checkout based on your district.'
        },
        {
          question:'Can I request an exchange?',
          answer:'Yes. Exchanges are handled according to the published GLOVAERA exchange policy.'
        }
      ]
    }

  };


  const $ = id =>
    document.getElementById(id);


  const loading = $(
    'adminLoading'
  );

  const app = $(
    'adminApp'
  );

  const loginView = $(
    'loginView'
  );

  const dashboard = $(
    'dashboardView'
  );

  const loginMsg = $(
    'loginMsg'
  );


  let state = {
    user:null,
    products:[],
    categories:[],
    orders:[],
    settings:null
  };


  function escapeHtml(
    value=''
  ){
    return String(
      value
    ).replace(
      /[&<>'"]/g,
      c => ({
        '&':'&amp;',
        '<':'&lt;',
        '>':'&gt;',
        "'":'&#39;',
        '"':'&quot;'
      }[c])
    );
  }


  function mergeSettings(
    source
  ){

    const s =
      source || {};


    return {

      branding:{
        ...DEFAULTS.branding,
        ...(s.branding || {})
      },

      layout:{
        ...DEFAULTS.layout,
        ...(s.layout || {})
      },

      announcement:{
        ...DEFAULTS.announcement,
        ...(s.announcement || {})
      },

      hero:{
        ...DEFAULTS.hero,
        ...(s.hero || {})
      },

      social:{
        ...DEFAULTS.social,
        ...(s.social || {}),
        images:
          Array.isArray(
            s.social?.images
          )
            ? s.social.images
            : []
      },

      combo:{
        ...DEFAULTS.combo,
        ...(s.combo || {})
      },

      faq:{
        ...DEFAULTS.faq,
        ...(s.faq || {}),
        items:
          Array.isArray(
            s.faq?.items
          )
            ? s.faq.items
            : DEFAULTS.faq.items
      }

    };
  }


  function showApp(){

    loading.hidden =
      true;

    app.hidden =
      false;
  }


  function showLogin(){

    loginView.hidden =
      false;

    dashboard.hidden =
      true;
  }


  function showDashboard(){

    loginView.hidden =
      true;

    dashboard.hidden =
      false;
  }


  function message(
    text,
    error=true
  ){

    loginMsg.textContent =
      text || '';

    loginMsg.className =
      error
        ? 'form-message error'
        : 'form-message success';
  }


  async function withTimeout(
    promise,
    ms=12000
  ){

    let timer;

    const timeout =
      new Promise(
        (_, reject) => {

          timer =
            setTimeout(
              () => {
                reject(
                  new Error(
                    'Request timed out. Please refresh and try again.'
                  )
                );
              },
              ms
            );

        }
      );


    try {

      return await Promise.race([
        promise,
        timeout
      ]);

    } finally {

      clearTimeout(
        timer
      );

    }
  }


  async function verifyAdmin(){

    if (!supabase) {
      throw new Error(
        'Supabase is not configured correctly.'
      );
    }


    const result =
      await withTimeout(
        supabase.rpc(
          'is_admin'
        )
      );


    if (result.error) {
      throw result.error;
    }


    return !!result.data;
  }


  async function login(
    event
  ){

    event.preventDefault();


    if (!supabase){

      message(
        'Supabase configuration পাওয়া যায়নি। config.js check করো.'
      );

      return;
    }


    const form =
      new FormData(
        event.target
      );


    message(
      'Signing in...',
      false
    );


    try {

      const result =
        await withTimeout(
          supabase.auth.signInWithPassword({
            email:
              form.get(
                'email'
              ),
            password:
              form.get(
                'password'
              )
          })
        );


      if (result.error) {
        throw result.error;
      }


      const isAdmin =
        await verifyAdmin();


      if (!isAdmin){

        await supabase.auth.signOut();

        throw new Error(
          'এই account-এর admin permission নেই।'
        );

      }


      state.user =
        result.data.user;


      await enterDashboard();


    } catch (
      error
    ){

      console.error(
        error
      );

      message(
        error.message ||
          'Login failed.'
      );

    }

  }


  async function restoreSession(){

    if (!supabase){

      message(
        'Supabase configuration পাওয়া যায়নি।',
        true
      );

      showLogin();

      return;
    }


    /*
      Session restore NEVER blocks the page.
      Login screen is already visible.
    */

    try {

      const result =
        await withTimeout(
          supabase.auth.getSession(),
          7000
        );


      const session =
        result?.data?.session;


      if (!session){
        return;
      }


      const isAdmin =
        await verifyAdmin();


      if (!isAdmin){

        await supabase.auth.signOut();

        return;
      }


      state.user =
        session.user;


      await enterDashboard();


    } catch (
      error
    ){

      console.warn(
        'Session restore skipped:',
        error
      );

    }

  }


  async function enterDashboard(){

    showDashboard();


    /*
      Show dashboard immediately.
      Data loads afterward.
    */

    renderOverview();


    try {

      await Promise.all([
        loadStoreData(),
        loadSettings()
      ]);

    } catch (
      error
    ){

      console.error(
        error
      );

      alert(
        error.message ||
          'Could not load dashboard data.'
      );

    }

  }


  async function loadStoreData(){

    const [
      products,
      categories,
      orders
    ] =
      await Promise.all([

        withTimeout(
          supabase
            .from(
              'products'
            )
            .select('*')
            .order(
              'created_at',
              {
                ascending:false
              }
            )
        ),

        withTimeout(
          supabase
            .from(
              'categories'
            )
            .select('*')
            .order(
              'name'
            )
        ),

        withTimeout(
          supabase
            .from(
              'orders'
            )
            .select('*')
            .order(
              'created_at',
              {
                ascending:false
              }
            )
        )

      ]);


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


  function renderOverview(){

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


    $('statsGrid').innerHTML =
      [

        ['Products',
         state.products.length],

        ['Categories',
         state.categories.length],

        ['Orders',
         state.orders.length],

        ['Pending',
         pending]

      ]
      .map(
        item => `
          <div class="stat-card">
            <span>
              ${item[0]}
            </span>

            <strong>
              ${item[1]}
            </strong>
          </div>
        `
      )
      .join('');

  }


  function renderProducts(){

    $('productAdminList').innerHTML =
      state.products
        .map(
          p => `
            <div class="admin-row">

              <img
                src="${
                  p.image_url ||
                  'logo.png'
                }"
                alt=""
              >

              <div class="grow">

                <strong>
                  ${escapeHtml(
                    p.name
                  )}
                </strong>

                <span>
                  ${escapeHtml(
                    p.category || ''
                  )}
                  · ৳${Number(
                    p.sale_price ??
                    p.price ??
                    0
                  ).toLocaleString(
                    'en-BD'
                  )}
                  · Stock ${
                    p.stock ?? 0
                  }
                </span>

              </div>

              <button
                class="btn btn-secondary small"
                data-edit-product="${
                  p.id
                }"
              >
                Edit
              </button>

              <button
                class="btn btn-danger small"
                data-delete-product="${
                  p.id
                }"
              >
                Delete
              </button>

            </div>
          `
        )
        .join('')
      ||
      `
        <div class="empty-state">
          No products found.
        </div>
      `;

  }


  function renderCategories(){

    $('categoryAdminList').innerHTML =
      state.categories
        .map(
          c => `
            <div class="admin-row">

              <img
                src="${
                  c.image_url ||
                  'logo.png'
                }"
                alt=""
              >

              <div class="grow">

                <strong>
                  ${escapeHtml(
                    c.name
                  )}
                </strong>

                <span>
                  ${escapeHtml(
                    c.slug || ''
                  )}
                </span>

              </div>

              <button
                class="btn btn-secondary small"
                data-edit-category="${
                  c.id
                }"
              >
                Edit
              </button>

              <button
                class="btn btn-danger small"
                data-delete-category="${
                  c.id
                }"
              >
                Delete
              </button>

            </div>
          `
        )
        .join('')
      ||
      `
        <div class="empty-state">
          No categories found.
        </div>
      `;

  }


  function renderOrders(){

    $('orderAdminList').innerHTML =
      state.orders
        .map(
          o => `
            <div class="admin-order">

              <div class="admin-order-head">

                <strong>
                  #${String(
                    o.id
                  ).slice(
                    0,
                    8
                  )}
                </strong>

                <span class="status">
                  ${escapeHtml(
                    o.status
                  )}
                </span>

              </div>

              <p>
                ${escapeHtml(
                  o.customer_name
                )}
                ·
                ${escapeHtml(
                  o.phone
                )}
              </p>

              <p>
                ${escapeHtml(
                  o.address
                )},
                ${escapeHtml(
                  o.district
                )}
              </p>

              <strong>
                ৳${Number(
                  o.total || 0
                ).toLocaleString(
                  'en-BD'
                )}
              </strong>

              <div class="order-actions">

                <select
                  data-order-status="${
                    o.id
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
                      status => `
                        <option
                          ${
                            status ===
                            o.status
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
        .join('')
      ||
      `
        <div class="empty-state">
          No orders found.
        </div>
      `;

  }


  async function loadSettings(){

    const result =
      await withTimeout(
        supabase
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
          .maybeSingle()
      );


    if (result.error) {
      throw result.error;
    }


    state.settings =
      mergeSettings(
        result.data?.settings
      );


    fillEditor();

  }


  function fillEditor(){

    const s =
      state.settings;


    $('announcementEnabled').value =
      String(
        s.announcement.enabled
      );

    $('announcementText').value =
      s.announcement.text;


    $('burgundy').value =
      s.branding.burgundy;

    $('darkBurgundy').value =
      s.branding.darkBurgundy;

    $('gold').value =
      s.branding.gold;

    $('lightGold').value =
      s.branding.lightGold;

    $('ivory').value =
      s.branding.ivory;


    $('containerWidth').value =
      s.layout.containerWidth;


    $('heroEnabled').value =
      String(
        s.hero.enabled
      );

    $('heroEyebrow').value =
      s.hero.eyebrow;

    $('heroTitle').value =
      s.hero.title;

    $('heroDescription').value =
      s.hero.description;

    $('heroButton1Text').value =
      s.hero.button1Text;

    $('heroButton1Link').value =
      s.hero.button1Link;

    $('heroButton2Text').value =
      s.hero.button2Text;

    $('heroButton2Link').value =
      s.hero.button2Link;


    $('socialEnabled').value =
      String(
        s.social.enabled
      );

    $('socialEyebrow').value =
      s.social.eyebrow;

    $('socialTitle').value =
      s.social.title;

    $('socialColumns').value =
      s.layout.socialColumns;

    $('socialGap').value =
      s.layout.socialGap;

    $('socialRadius').value =
      s.layout.socialRadius;


    $('comboEnabled').value =
      String(
        s.combo.enabled
      );

    $('comboEyebrow').value =
      s.combo.eyebrow;

    $('comboTitle').value =
      s.combo.title;

    $('comboDescription').value =
      s.combo.description;

    $('comboBadge').value =
      s.combo.badge;

    $('comboProductTitle').value =
      s.combo.productTitle;

    $('comboProductDescription').value =
      s.combo.productDescription;

    $('comboPrice').value =
      s.combo.price;

    $('comboButtonText').value =
      s.combo.buttonText;

    $('comboButtonLink').value =
      s.combo.buttonLink;


    $('faqEnabled').value =
      String(
        s.faq.enabled
      );

    $('faqEyebrow').value =
      s.faq.eyebrow;

    $('faqTitle').value =
      s.faq.title;


    renderSocialEditor();
    renderFaqEditor();


    renderPreview(
      'heroPreview',
      s.hero.image,
      'Hero image'
    );


    renderPreview(
      'comboPreview',
      s.combo.image,
      'Combo image'
    );

  }


  function renderPreview(
    id,
    url,
    alt
  ){

    const box =
      $(id);

    if (!url){

      box.innerHTML = `
        <div class="empty-state">
          No image uploaded.
        </div>
      `;

      return;
    }


    box.innerHTML = `
      <img
        src="${escapeHtml(
          url
        )}"
        alt="${escapeHtml(
          alt
        )}"
      >
    `;

  }


  function renderSocialEditor(){

    const list =
      $('socialEditorList');

    const items =
      state.settings.social
        .images || [];


    if (!items.length){

      list.innerHTML = `
        <div class="empty-state">
          No gallery images yet.
        </div>
      `;

      return;
    }


    list.innerHTML =
      items
        .map(
          (url, i) => `
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
                >

              </div>


              <div
                class="gallery-editor-main"
              >

                <strong>
                  Image ${i+1}
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
                    class="btn btn-secondary small"
                    data-social-replace="${i}"
                    type="button"
                  >
                    Replace
                  </button>

                  <button
                    class="btn btn-secondary small"
                    data-social-up="${i}"
                    type="button"
                  >
                    ↑
                  </button>

                  <button
                    class="btn btn-secondary small"
                    data-social-down="${i}"
                    type="button"
                  >
                    ↓
                  </button>

                  <button
                    class="btn btn-danger small"
                    data-social-delete="${i}"
                    type="button"
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


  function renderFaqEditor(){

    const list =
      $('faqEditorList');

    list.innerHTML =
      state.settings.faq.items
        .map(
          (item, i) => `
            <div
              class="faq-editor-item"
            >

              <div
                class="faq-editor-number"
              >
                ${i+1}
              </div>

              <div
                class="faq-editor-fields"
              >

                <input
                  type="text"
                  data-faq-q="${i}"
                  value="${escapeHtml(
                    item.question
                  )}"
                >

                <textarea
                  rows="4"
                  data-faq-a="${i}"
                >${escapeHtml(
                  item.answer
                )}</textarea>

                <div
                  class="gallery-actions"
                >

                  <button
                    class="btn btn-secondary small"
                    data-faq-up="${i}"
                    type="button"
                  >
                    ↑
                  </button>

                  <button
                    class="btn btn-secondary small"
                    data-faq-down="${i}"
                    type="button"
                  >
                    ↓
                  </button>

                  <button
                    class="btn btn-danger small"
                    data-faq-delete="${i}"
                    type="button"
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


  async function uploadImage(
    folder
  ){

    return new Promise(
      (resolve, reject) => {

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

              const safe =
                file.name.replace(
                  /[^a-zA-Z0-9._-]/g,
                  '-'
                );

              const path =
                `${folder}/${crypto.randomUUID()}-${safe}`;


              const upload =
                await withTimeout(
                  supabase
                    .storage
                    .from(
                      'site-media'
                    )
                    .upload(
                      path,
                      file,
                      {
                        upsert:false,
                        contentType:
                          file.type
                      }
                    )
                );


              if (
                upload.error
              ){
                throw upload.error;
              }


              const url =
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


              resolve(
                url
              );

            } catch (
              error
            ){

              reject(
                error
              );

            }

          };


        input.click();

      }
    );

  }


  async function saveSettings(){

    const s =
      state.settings;


    s.announcement.enabled =
      $('announcementEnabled')
        .value === 'true';

    s.announcement.text =
      $('announcementText')
        .value.trim();


    s.branding.burgundy =
      $('burgundy').value;

    s.branding.darkBurgundy =
      $('darkBurgundy').value;

    s.branding.gold =
      $('gold').value;

    s.branding.lightGold =
      $('lightGold').value;

    s.branding.ivory =
      $('ivory').value;


    s.layout.containerWidth =
      Number(
        $('containerWidth').value
      );


    s.hero.enabled =
      $('heroEnabled').value === 'true';

    s.hero.eyebrow =
      $('heroEyebrow')
        .value.trim();

    s.hero.title =
      $('heroTitle')
        .value.trim();

    s.hero.description =
      $('heroDescription')
        .value.trim();

    s.hero.button1Text =
      $('heroButton1Text')
        .value.trim();

    s.hero.button1Link =
      $('heroButton1Link')
        .value.trim();

    s.hero.button2Text =
      $('heroButton2Text')
        .value.trim();

    s.hero.button2Link =
      $('heroButton2Link')
        .value.trim();


    s.social.enabled =
      $('socialEnabled')
        .value === 'true';

    s.social.eyebrow =
      $('socialEyebrow')
        .value.trim();

    s.social.title =
      $('socialTitle')
        .value.trim();

    s.layout.socialColumns =
      Number(
        $('socialColumns')
          .value
      );

    s.layout.socialGap =
      Number(
        $('socialGap')
          .value
      );

    s.layout.socialRadius =
      Number(
        $('socialRadius')
          .value
      );


    s.combo.enabled =
      $('comboEnabled')
        .value === 'true';

    s.combo.eyebrow =
      $('comboEyebrow')
        .value.trim();

    s.combo.title =
      $('comboTitle')
        .value.trim();

    s.combo.description =
      $('comboDescription')
        .value.trim();

    s.combo.badge =
      $('comboBadge')
        .value.trim();

    s.combo.productTitle =
      $('comboProductTitle')
        .value.trim();

    s.combo.productDescription =
      $('comboProductDescription')
        .value.trim();

    s.combo.price =
      $('comboPrice')
        .value.trim();

    s.combo.buttonText =
      $('comboButtonText')
        .value.trim();

    s.combo.buttonLink =
      $('comboButtonLink')
        .value.trim();


    s.faq.enabled =
      $('faqEnabled')
        .value === 'true';

    s.faq.eyebrow =
      $('faqEyebrow')
        .value.trim();

    s.faq.title =
      $('faqTitle')
        .value.trim();


    state.settings.faq.items =
      state.settings.faq.items
        .map(
          (item, i) => {

            const q =
              document.querySelector(
                `[data-faq-q="${i}"]`
              );

            const a =
              document.querySelector(
                `[data-faq-a="${i}"]`
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


    const button =
      $('saveSettings');

    button.disabled =
      true;

    button.textContent =
      'Saving...';


    try {

      const result =
        await withTimeout(
          supabase
            .from(
              'site_settings'
            )
            .upsert(
              {
                id:'global',
                settings:s,
                updated_at:
                  new Date()
                    .toISOString()
              },
              {
                onConflict:'id'
              }
            )
        );


      if (result.error){
        throw result.error;
      }


      alert(
        'Website settings saved successfully ✓'
      );

    } catch (
      error
    ){

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


  function productForm(
    p={}
  ){

    return `
      <form
        id="productForm"
        class="form-grid"
      >

        <input
          type="hidden"
          name="id"
          value="${p.id || ''}"
        >

        <label>
          Name

          <input
            name="name"
            required
            value="${escapeHtml(
              p.name || ''
            )}"
          >
        </label>

        <label>
          Category

          <select
            name="category"
            required
          >

            ${
              state.categories
                .map(
                  c => `
                    <option
                      ${
                        c.name ===
                        p.category
                          ? 'selected'
                          : ''
                      }
                    >
                      ${escapeHtml(
                        c.name
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
            name="price"
            type="number"
            min="0"
            required
            value="${
              p.price ??
              0
            }"
          >
        </label>

        <label>
          Sale price

          <input
            name="sale_price"
            type="number"
            min="0"
            value="${
              p.sale_price ??
              ''
            }"
          >
        </label>

        <label>
          Stock

          <input
            name="stock"
            type="number"
            min="0"
            required
            value="${
              p.stock ??
              0
            }"
          >
        </label>

        <label>
          Image URL

          <input
            name="image_url"
            value="${escapeHtml(
              p.image_url ||
                ''
            )}"
          >
        </label>

        <label>
          Upload image

          <input
            name="image_file"
            type="file"
            accept="image/*"
          >
        </label>

        <label class="full">
          Description

          <textarea
            name="description"
            rows="4"
          >${escapeHtml(
            p.description ||
              ''
          )}</textarea>
        </label>

        <label>
          <input
            name="featured"
            type="checkbox"
            ${
              p.featured
                ? 'checked'
                : ''
            }
          >
          Best seller
        </label>

        <label>
          <input
            name="is_new"
            type="checkbox"
            ${
              p.is_new
                ? 'checked'
                : ''
            }
          >
          New arrival
        </label>

        <label>
          <input
            name="combo"
            type="checkbox"
            ${
              p.combo
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
  ){

    event.preventDefault();

    const form =
      new FormData(
        event.target
      );


    try {

      let image =
        String(
          form.get(
            'image_url'
          ) ||
          ''
        );


      const file =
        form.get(
          'image_file'
        );


      if (
        file &&
        file.size
      ){

        image =
          await uploadImage(
            'products'
          );

      }


      const data = {

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
          image ||
          null,

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

        active:true

      };


      const id =
        form.get(
          'id'
        );


      const result =
        id
          ? await withTimeout(
              supabase
                .from(
                  'products'
                )
                .update(
                  data
                )
                .eq(
                  'id',
                  id
                )
            )
          : await withTimeout(
              supabase
                .from(
                  'products'
                )
                .insert(
                  data
                )
            );


      if (
        result.error
      ){
        throw result.error;
      }


      closeModal();

      await loadStoreData();

    } catch (
      error
    ){

      alert(
        `Product save failed: ${
          error.message
        }`
      );

    }

  }


  function categoryForm(
    c={}
  ){

    return `
      <form
        id="categoryForm"
        class="form-grid"
      >

        <input
          type="hidden"
          name="id"
          value="${c.id || ''}"
        >

        <label>
          Name

          <input
            name="name"
            required
            value="${escapeHtml(
              c.name || ''
            )}"
          >
        </label>

        <label>
          Slug

          <input
            name="slug"
            required
            value="${escapeHtml(
              c.slug || ''
            )}"
          >
        </label>

        <label class="full">
          Upload category photo

          <input
            name="image_file"
            type="file"
            accept="image/*"
          >
        </label>

        <label class="full">
          Image URL

          <input
            name="image_url"
            value="${escapeHtml(
              c.image_url || ''
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
  ){

    event.preventDefault();

    const form =
      new FormData(
        event.target
      );


    try {

      let image =
        String(
          form.get(
            'image_url'
          ) ||
          ''
        );


      const file =
        form.get(
          'image_file'
        );


      if (
        file &&
        file.size
      ){

        image =
          await uploadImage(
            'categories'
          );

      }


      const data = {

        name:
          form.get(
            'name'
          ),

        slug:
          form.get(
            'slug'
          ),

        image_url:
          image ||
          null

      };


      const id =
        form.get(
          'id'
        );


      const result =
        id
          ? await withTimeout(
              supabase
                .from(
                  'categories'
                )
                .update(
                  data
                )
                .eq(
                  'id',
                  id
                )
            )
          : await withTimeout(
              supabase
                .from(
                  'categories'
                )
                .insert(
                  data
                )
            );


      if (
        result.error
      ){
        throw result.error;
      }


      closeModal();

      await loadStoreData();

    } catch (
      error
    ){

      alert(
        `Category save failed: ${
          error.message
        }`
      );

    }

  }


  async function updateOrder(
    id,
    status
  ){

    const result =
      await withTimeout(
        supabase
          .from(
            'orders'
          )
          .update({
            status
          })
          .eq(
            'id',
            id
          )
      );


    if (
      result.error
    ){

      alert(
        result.error.message
      );

      return;
    }


    await loadStoreData();

  }


  async function deleteProduct(
    id
  ){

    if (
      !confirm(
        'এই product delete করতে চাও?'
      )
    ) return;


    const result =
      await withTimeout(
        supabase
          .from(
            'products'
          )
          .delete()
          .eq(
            'id',
            id
          )
      );


    if (
      result.error
    ){

      alert(
        result.error.message
      );

      return;
    }


    await loadStoreData();

  }


  async function deleteCategory(
    id
  ){

    if (
      !confirm(
        'এই category delete করতে চাও?'
      )
    ) return;


    const result =
      await withTimeout(
        supabase
          .from(
            'categories'
          )
          .delete()
          .eq(
            'id',
            id
          )
      );


    if (
      result.error
    ){

      alert(
        result.error.message
      );

      return;
    }


    await loadStoreData();

  }


  function closeModal(){

    $('modal').hidden =
      true;

  }


  function openModal(
    html
  ){

    $('modalContent')
      .innerHTML =
      html;

    $('modal').hidden =
      false;

  }


  /* EVENT HANDLERS */


  $('loginForm')
    .addEventListener(
      'submit',
      login
    );


  $('logoutBtn')
    .addEventListener(
      'click',
      async () => {

        await supabase
          .auth
          .signOut();

        location.reload();

      }
    );


  $('closeModal')
    .addEventListener(
      'click',
      closeModal
    );


  $('addProductBtn')
    .addEventListener(
      'click',
      () => {

        openModal(
          `
            <h2>
              Add product
            </h2>

            ${productForm()}
          `
        );


        $('productForm')
          .addEventListener(
            'submit',
            saveProduct
          );

      }
    );


  $('addCategoryBtn')
    .addEventListener(
      'click',
      () => {

        openModal(
          `
            <h2>
              Add category
            </h2>

            ${categoryForm()}
          `
        );


        $('categoryForm')
          .addEventListener(
            'submit',
            saveCategory
          );

      }
    );


  $('refreshOrdersBtn')
    .addEventListener(
      'click',
      loadStoreData
    );


  $('saveSettings')
    .addEventListener(
      'click',
      saveSettings
    );


  $('uploadHero')
    .addEventListener(
      'click',
      async () => {

        try {

          state.settings.hero.image =
            await uploadImage(
              'hero'
            );

          renderPreview(
            'heroPreview',
            state.settings.hero.image,
            'Hero'
          );

        } catch (
          error
        ){

          alert(
            error.message
          );

        }

      }
    );


  $('uploadCombo')
    .addEventListener(
      'click',
      async () => {

        try {

          state.settings.combo.image =
            await uploadImage(
              'combo'
            );

          renderPreview(
            'comboPreview',
            state.settings.combo.image,
            'Combo'
          );

        } catch (
          error
        ){

          alert(
            error.message
          );

        }

      }
    );


  $('addSocialImage')
    .addEventListener(
      'click',
      async () => {

        try {

          const url =
            await uploadImage(
              'homepage'
            );

          state.settings.social
            .images
            .push(
              url
            );

          renderSocialEditor();

        } catch (
          error
        ){

          alert(
            error.message
          );

        }

      }
    );


  $('addFaq')
    .addEventListener(
      'click',
      () => {

        state.settings.faq.items
          .push({
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
                x =>
                  x.classList.remove(
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
                x =>
                  x.hidden =
                    true
              );


            const panel =
              $(
                `tab-${tab.dataset.tab}`
              );


            if (panel){
              panel.hidden =
                false;
            }

          }
        );

      }
    );


  document.addEventListener(
    'click',
    event => {

      const editP =
        event.target.closest(
          '[data-edit-product]'
        );

      if (editP){

        const p =
          state.products.find(
            x =>
              String(
                x.id
              ) ===
              String(
                editP.dataset
                  .editProduct
              )
          );


        openModal(
          `
            <h2>
              Edit product
            </h2>

            ${productForm(
              p
            )}
          `
        );


        $('productForm')
          .addEventListener(
            'submit',
            saveProduct
          );

        return;
      }


      const delP =
        event.target.closest(
          '[data-delete-product]'
        );

      if (delP){

        deleteProduct(
          delP.dataset
            .deleteProduct
        );

        return;
      }


      const editC =
        event.target.closest(
          '[data-edit-category]'
        );

      if (editC){

        const c =
          state.categories.find(
            x =>
              String(
                x.id
              ) ===
              String(
                editC.dataset
                  .editCategory
              )
          );


        openModal(
          `
            <h2>
              Edit category
            </h2>

            ${categoryForm(
              c
            )}
          `
        );


        $('categoryForm')
          .addEventListener(
            'submit',
            saveCategory
          );

        return;
      }


      const delC =
        event.target.closest(
          '[data-delete-category]'
        );

      if (delC){

        deleteCategory(
          delC.dataset
            .deleteCategory
        );

        return;
      }


      const socialReplace =
        event.target.closest(
          '[data-social-replace]'
        );

      if (
        socialReplace
      ){

        (async () => {

          try {

            const index =
              Number(
                socialReplace
                  .dataset
                  .socialReplace
              );

            state.settings.social
              .images[index] =
              await uploadImage(
                'homepage'
              );

            renderSocialEditor();

          } catch (
            error
          ){

            alert(
              error.message
            );

          }

        })();

        return;
      }


      const socialUp =
        event.target.closest(
          '[data-social-up]'
        );

      if (socialUp){

        const i =
          Number(
            socialUp.dataset
              .socialUp
          );

        if (
          i > 0
        ){

          const list =
            state.settings.social
              .images;

          [
            list[i],
            list[i-1]
          ] =
          [
            list[i-1],
            list[i]
          ];

          renderSocialEditor();

        }

        return;
      }


      const socialDown =
        event.target.closest(
          '[data-social-down]'
        );

      if (socialDown){

        const i =
          Number(
            socialDown.dataset
              .socialDown
          );

        const list =
          state.settings.social
            .images;

        if (
          i <
          list.length - 1
        ){

          [
            list[i],
            list[i+1]
          ] =
          [
            list[i+1],
            list[i]
          ];

          renderSocialEditor();

        }

        return;
      }


      const socialDelete =
        event.target.closest(
          '[data-social-delete]'
        );

      if (socialDelete){

        state.settings.social
          .images.splice(
            Number(
              socialDelete.dataset
                .socialDelete
            ),
            1
          );

        renderSocialEditor();

        return;
      }


      const faqUp =
        event.target.closest(
          '[data-faq-up]'
        );

      if (faqUp){

        const i =
          Number(
            faqUp.dataset
              .faqUp
          );

        const list =
          state.settings.faq.items;

        if (i > 0){

          [
            list[i],
            list[i-1]
          ] =
          [
            list[i-1],
            list[i]
          ];

          renderFaqEditor();

        }

        return;
      }


      const faqDown =
        event.target.closest(
          '[data-faq-down]'
        );

      if (faqDown){

        const i =
          Number(
            faqDown.dataset
              .faqDown
          );

        const list =
          state.settings.faq.items;

        if (
          i <
          list.length - 1
        ){

          [
            list[i],
            list[i+1]
          ] =
          [
            list[i+1],
            list[i]
          ];

          renderFaqEditor();

        }

        return;
      }


      const faqDelete =
        event.target.closest(
          '[data-faq-delete]'
        );

      if (faqDelete){

        state.settings.faq.items
          .splice(
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


  /* START */


  document.addEventListener(
    'DOMContentLoaded',
    async () => {

      /*
        The login/admin UI becomes available immediately.
        It will never remain stuck behind a loading screen.
      */

      showApp();
      showLogin();

      await restoreSession();

    }
  );

})();
