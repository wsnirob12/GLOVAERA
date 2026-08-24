(function(){

  'use strict';

  const SUPABASE =
    window.glovaera?.client ||
    window.GLOVAERA?.client ||
    null;


  const state = {
    user:null,
    products:[],
    categories:[],
    orders:[]
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


  function escapeHtml(
    value=''
  ){

    if(
      window.GLOVAERA?.escapeHtml
    ){

      return window.GLOVAERA.escapeHtml(
        value
      );

    }

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


  function money(
    value
  ){

    if(
      window.GLOVAERA?.money
    ){

      return window.GLOVAERA.money(
        value
      );

    }

    return `৳${Number(
      value || 0
    ).toLocaleString(
      'en-BD'
    )}`;

  }


  function showModal(
    html
  ){

    modalContent.innerHTML =
      html;

    modal.hidden =
      false;

  }


  function closeModal(){

    modal.hidden =
      true;

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

  async function signIn(
    event
  ){

    event.preventDefault();


    if(!SUPABASE){

      loginMsg.textContent =
        'Supabase connection is not available.';

      return;

    }


    const fd =
      new FormData(
        event.target
      );


    loginMsg.textContent =
      'Signing in...';


    try{

      const {
        data,
        error
      } =
      await SUPABASE
        .auth
        .signInWithPassword({

          email:
            String(
              fd.get(
                'email'
              ) || ''
            ).trim(),

          password:
            String(
              fd.get(
                'password'
              ) || ''
            )

        });


      if(error){

        console.error(
          'Login error:',
          error
        );

        loginMsg.textContent =
          error.message;

        return;

      }


      state.user =
        data.user;


      loginMsg.textContent =
        '';


      await boot();


    }catch(error){

      console.error(
        error
      );


      loginMsg.textContent =
        error.message ||
        'Login failed.';

    }

  }


  async function boot(){

    loginView.hidden =
      true;

    dashboard.hidden =
      false;


    await refreshAll();


    /*
      Website editor is loaded
      by site-editor.js.
    */

  }


  /* =========================
     DATA
     ========================= */

  async function refreshAll(){

    if(!SUPABASE)
      return;


    try{

      const [
        products,
        categories,
        orders
      ] =
      await Promise.all([

        SUPABASE
          .from('products')
          .select('*')
          .order(
            'created_at',
            {
              ascending:false
            }
          ),

        SUPABASE
          .from('categories')
          .select('*')
          .order(
            'name'
          ),

        SUPABASE
          .from('orders')
          .select('*')
          .order(
            'created_at',
            {
              ascending:false
            }
          )

      ]);


      if(
        products.error
      ){

        throw products.error;

      }


      if(
        categories.error
      ){

        throw categories.error;

      }


      if(
        orders.error
      ){

        throw orders.error;

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


    }catch(error){

      console.error(
        'Admin data error:',
        error
      );


      alert(
        error.message ||
        'Could not load admin data.'
      );

    }

  }


  /* =========================
     OVERVIEW
     ========================= */

  function renderOverview(){

    const el =
      document.getElementById(
        'statsGrid'
      );


    if(!el)
      return;


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


    el.innerHTML = [

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
      ([label,number]) =>
        `
          <div class="stat-card">

            <span>
              ${label}
            </span>

            <strong>
              ${number}
            </strong>

          </div>
        `
    )
    .join('');

  }


  /* =========================
     PRODUCTS
     ========================= */

  function renderProducts(){

    const el =
      document.getElementById(
        'productAdminList'
      );


    if(!el)
      return;


    el.innerHTML =
      state.products
        .map(
          product =>
            `

              <div
                class="admin-row"
              >

                <img
                  src="${
                    product.image_url ||
                    'logo.png'
                  }"
                  alt=""
                >


                <div
                  class="grow"
                >

                  <strong>
                    ${escapeHtml(
                      product.name
                    )}
                  </strong>


                  <span>

                    ${escapeHtml(
                      product.category ||
                      ''
                    )}

                    ·

                    ${money(
                      product.sale_price ??
                      product.price
                    )}

                    · Stock
                    ${
                      product.stock ??
                      0
                    }

                    ${
                      product.coming_soon
                        ? ' · 🚀 Coming Soon'
                        : ''
                    }

                  </span>

                </div>


                <button
                  class="btn btn-secondary small"
                  type="button"
                  data-edit-product="${
                    product.id
                  }"
                >
                  Edit
                </button>


                <button
                  class="btn btn-danger small"
                  type="button"
                  data-delete-product="${
                    product.id
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
          No products yet.
        </div>
      `;

  }


  /* =========================
     CATEGORIES
     ========================= */

  function renderCategories(){

    const el =
      document.getElementById(
        'categoryAdminList'
      );


    if(!el)
      return;


    el.innerHTML =
      state.categories
        .map(
          category =>
            `

              <div
                class="admin-row"
              >

                <div
                  class="grow"
                >

                  <strong>
                    ${escapeHtml(
                      category.name
                    )}
                  </strong>

                  <span>
                    ${escapeHtml(
                      category.slug ||
                      ''
                    )}
                  </span>

                </div>


                <button
                  class="btn btn-secondary small"
                  type="button"
                  data-edit-category="${
                    category.id
                  }"
                >
                  Edit
                </button>


                <button
                  class="btn btn-danger small"
                  type="button"
                  data-delete-category="${
                    category.id
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
          No categories yet.
        </div>
      `;

  }


  /* =========================
     ORDERS
     ========================= */

  function renderOrders(){

    const el =
      document.getElementById(
        'orderAdminList'
      );


    if(!el)
      return;


    el.innerHTML =
      state.orders
        .map(
          order =>
            `

              <div
                class="admin-order"
              >

                <div
                  class="admin-order-head"
                >

                  <strong>
                    #
                    ${escapeHtml(
                      String(
                        order.id
                      ).slice(
                        0,
                        8
                      )
                    )}
                  </strong>


                  <span
                    class="status ${escapeHtml(
                      order.status
                    )}"
                  >
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
                  ${money(
                    order.total
                  )}
                </strong>


                <div
                  class="order-actions"
                >

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
                              value="${status}"
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
        .join('')

      ||

      `
        <div class="empty-state">
          No orders yet.
        </div>
      `;

  }


  /* =========================
     PRODUCT FORM
     ========================= */

  function productForm(
    product={}
  ){

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
        >


        <label>
          Name

          <input
            required
            name="name"
            value="${escapeHtml(
              product.name ||
              ''
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
                        value="${escapeHtml(
                          category.name
                        )}"
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
              product.price ||
              0
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
              product.stock ||
              0
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


        <label>

          <input
            type="checkbox"
            name="coming_soon"
            ${
              product.coming_soon
                ? 'checked'
                : ''
            }
          >

          🚀 Coming Soon

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


  /* =========================
     CATEGORY FORM
     ========================= */

  function categoryForm(
    category={}
  ){

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
        >


        <label>

          Name

          <input
            required
            name="name"
            value="${escapeHtml(
              category.name ||
              ''
            )}"
          >

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
          >

        </label>


        <label class="full">

          Image URL

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


  /* =========================
     SAVE PRODUCT
     ========================= */

  async function saveProduct(
    event
  ){

    event.preventDefault();


    const form =
      new FormData(
        event.target
      );


    try{

      let imageUrl =
        form.get(
          'image_url'
        ) ||
        'logo.png';


      const file =
        form.get(
          'image_file'
        );


      if(
        file &&
        file.size
      ){

        const safeName =
          file.name.replace(
            /[^a-zA-Z0-9._-]/g,
            '-'
          );


        const path =
          `${crypto.randomUUID()}-${safeName}`;


        const uploaded =
          await SUPABASE
            .storage
            .from(
              'product-images'
            )
            .upload(
              path,
              file,
              {
                upsert:false,
                contentType:
                  file.type
              }
            );


        if(
          uploaded.error
        ){

          throw uploaded.error;

        }


        imageUrl =
          SUPABASE
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

        coming_soon:
          form.get(
            'coming_soon'
          ) === 'on',

        active:true

      };


      const id =
        form.get(
          'id'
        );


      const query =
        id

          ? SUPABASE
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

          : SUPABASE
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


      if(error)
        throw error;


      closeModal();

      await refreshAll();


    }catch(error){

      alert(
        error.message ||
        'Could not save product.'
      );

    }

  }


  /* =========================
     SAVE CATEGORY
     ========================= */

  async function saveCategory(
    event
  ){

    event.preventDefault();


    const form =
      new FormData(
        event.target
      );


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

        ? SUPABASE
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

        : SUPABASE
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


    if(error){

      alert(
        error.message
      );

      return;

    }


    closeModal();

    await refreshAll();

  }


  /* =========================
     BASIC EVENTS
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

        await SUPABASE
          ?.auth
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

            ${
              productForm()
            }
          `
        );


        document
          .getElementById(
            'productForm'
          )
          .addEventListener(
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

            ${
              categoryForm()
            }
          `
        );


        document
          .getElementById(
            'categoryForm'
          )
          .addEventListener(
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


  /* =========================
     TABS
     ========================= */

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


            if(target){

              target.hidden =
                false;

            }

          }
        );

      }
    );


  /* =========================
     ACTIONS
     ========================= */

  document.addEventListener(
    'click',
    async event => {

      const editProduct =
        event.target.closest(
          '[data-edit-product]'
        );


      if(editProduct){

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


        if(!product)
          return;


        showModal(
          `
            <h2>
              Edit product
            </h2>

            ${
              productForm(
                product
              )
            }
          `
        );


        document
          .getElementById(
            'productForm'
          )
          .addEventListener(
            'submit',
            saveProduct
          );


        return;

      }


      const deleteProduct =
        event.target.closest(
          '[data-delete-product]'
        );


      if(deleteProduct){

        if(
          !confirm(
            'Delete this product?'
          )
        )
          return;


        const {
          error
        } =
        await SUPABASE
          .from(
            'products'
          )
          .delete()
          .eq(
            'id',
            deleteProduct.dataset
              .deleteProduct
          );


        if(error){

          alert(
            error.message
          );

        }else{

          await refreshAll();

        }


        return;

      }


      const editCategory =
        event.target.closest(
          '[data-edit-category]'
        );


      if(editCategory){

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


        if(!category)
          return;


        showModal(
          `
            <h2>
              Edit category
            </h2>

            ${
              categoryForm(
                category
              )
            }
          `
        );


        document
          .getElementById(
            'categoryForm'
          )
          .addEventListener(
            'submit',
            saveCategory
          );


        return;

      }


      const deleteCategory =
        event.target.closest(
          '[data-delete-category]'
        );


      if(deleteCategory){

        if(
          !confirm(
            'Delete this category?'
          )
        )
          return;


        const {
          error
        } =
        await SUPABASE
          .from(
            'categories'
          )
          .delete()
          .eq(
            'id',
            deleteCategory.dataset
              .deleteCategory
          );


        if(error){

          alert(
            error.message
          );

        }else{

          await refreshAll();

        }

      }

    }
  );


  /* =========================
     ORDER STATUS
     ========================= */

  document.addEventListener(
    'change',
    async event => {

      const select =
        event.target.closest(
          '[data-order-status]'
        );


      if(!select)
        return;


      const {
        error
      } =
      await SUPABASE
        .from(
          'orders'
        )
        .update({
          status:
            select.value
        })
        .eq(
          'id',
          select.dataset
            .orderStatus
        );


      if(error){

        alert(
          error.message
        );

      }else{

        await refreshAll();

      }

    }
  );


  /* =========================
     RESTORE SESSION
     ========================= */

  if(SUPABASE){

    SUPABASE
      .auth
      .getSession()
      .then(
        ({
          data
        }) => {

          if(
            data?.session
          ){

            state.user =
              data.session.user;

            boot();

          }

        }
      )
      .catch(
        error =>
          console.warn(
            'Session restore:',
            error
          )
      );

  }

})();
