(function(){

  'use strict';


  /* =====================================================
     SUPABASE CLIENT
     app.js already creates window.glovaera.client
     ===================================================== */

  const client =
    window.glovaera?.client || null;


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

  const dashboardView =
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


  /* =====================================================
     HELPERS
     ===================================================== */

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

    return `৳${
      Number(
        value || 0
      ).toLocaleString(
        'en-BD'
      )
    }`;

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


  /* =====================================================
     LOGIN
     ===================================================== */

  async function signIn(
    event
  ){

    event.preventDefault();


    if(!client){

      loginMsg.textContent =
        'Supabase connection was not initialized. Please refresh the page.';

      return;

    }


    const form =
      new FormData(
        event.target
      );


    loginMsg.textContent =
      'Signing in...';


    try{

      const result =
        await client.auth.signInWithPassword({

          email:
            form.get(
              'email'
            ),

          password:
            form.get(
              'password'
            )

        });


      if(
        result.error
      ){

        loginMsg.textContent =
          result.error.message;

        return;

      }


      state.user =
        result.data.user;


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

    dashboardView.hidden =
      false;


    await refreshAll();

  }


  /* =====================================================
     LOAD ALL DATA
     ===================================================== */

  async function refreshAll(){

    if(!client){

      return;

    }


    try{

      const [
        products,
        categories,
        orders
      ] =
      await Promise.all([

        client
          .from(
            'products'
          )
          .select('*')
          .order(
            'created_at',
            {
              ascending:false
            }
          ),

        client
          .from(
            'categories'
          )
          .select('*')
          .order(
            'name'
          ),

        client
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
        error
      );

      alert(
        'Could not load admin data: ' +
        (
          error.message ||
          'Unknown error'
        )
      );

    }

  }


  /* =====================================================
     OVERVIEW
     ===================================================== */

  function renderOverview(){

    const stats =
      document.getElementById(
        'statsGrid'
      );


    if(!stats)
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


    stats.innerHTML = [

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


  /* =====================================================
     PRODUCTS
     ===================================================== */

  function renderProducts(){

    const list =
      document.getElementById(
        'productAdminList'
      );


    if(!list)
      return;


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
                data-edit-product="${
                  product.id
                }"
                type="button"
              >
                Edit
              </button>


              <button
                class="btn btn-danger small"
                data-delete-product="${
                  product.id
                }"
                type="button"
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


  /* =====================================================
     CATEGORIES
     ===================================================== */

  function renderCategories(){

    const list =
      document.getElementById(
        'categoryAdminList'
      );


    if(!list)
      return;


    list.innerHTML =
      state.categories
        .map(
          category => `

            <div class="admin-row">

              <div class="grow">

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
                data-edit-category="${
                  category.id
                }"
                type="button"
              >
                Edit
              </button>


              <button
                class="btn btn-danger small"
                data-delete-category="${
                  category.id
                }"
                type="button"
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


  /* =====================================================
     ORDERS
     ===================================================== */

  function renderOrders(){

    const list =
      document.getElementById(
        'orderAdminList'
      );


    if(!list)
      return;


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
                  class="status"
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
                      status => `

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
        .join('')

      ||

      `
        <div class="empty-state">
          No orders yet.
        </div>
      `;

  }


  /* =====================================================
     PRODUCT FORM
     ===================================================== */

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
                  category => `

                    <option
                      ${
                        category.name ===
                        product.category
                          ? 'selected'
                          : ''
                      }
                      value="${escapeHtml(
                        category.name
                      )}"
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


        <!-- COMING SOON -->

        <label
          class="coming-soon-option"
        >

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


  /* =====================================================
     CATEGORY FORM
     ===================================================== */

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


  /* =====================================================
     SAVE PRODUCT
     ===================================================== */

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


        const upload =
          await client
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
          upload.error
        ){

          alert(
            upload.error.message
          );

          return;

        }


        imageUrl =
          client
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

        /* NEW */

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

          ? client
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

          : client
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


      if(error){

        alert(
          error.message
        );

        return;

      }


      closeModal();

      await refreshAll();


    }catch(error){

      console.error(
        error
      );

      alert(
        error.message ||
        'Could not save product.'
      );

    }

  }


  /* =====================================================
     SAVE CATEGORY
     ===================================================== */

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

        ? client
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

        : client
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


  /* =====================================================
     EVENT LISTENERS
     ===================================================== */

  document
    .getElementById(
      'loginForm'
    )
    .addEventListener(
      'submit',
      signIn
    );


  document
    .getElementById(
      'closeModal'
    )
    .addEventListener(
      'click',
      closeModal
    );


  document
    .getElementById(
      'logoutBtn'
    )
    .addEventListener(
      'click',
      async () => {

        if(client){

          await client
            .auth
            .signOut();

        }

        location.reload();

      }
    );


  /* ADD PRODUCT */

  document
    .getElementById(
      'addProductBtn'
    )
    .addEventListener(
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


  /* ADD CATEGORY */

  document
    .getElementById(
      'addCategoryBtn'
    )
    .addEventListener(
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


  /* REFRESH ORDERS */

  document
    .getElementById(
      'refreshOrdersBtn'
    )
    .addEventListener(
      'click',
      refreshAll
    );


  /* =====================================================
     TABS
     ===================================================== */

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
                tab =>
                  tab.classList.remove(
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


            if(target){

              target.hidden =
                false;

            }

          }
        );

      }
    );


  /* =====================================================
     PRODUCT / CATEGORY ACTIONS
     ===================================================== */

  document.addEventListener(
    'click',
    async event => {

      /* EDIT PRODUCT */

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


      /* DELETE PRODUCT */

      const deleteProduct =
        event.target.closest(
          '[data-delete-product]'
        );


      if(deleteProduct){

        const id =
          deleteProduct.dataset
            .deleteProduct;


        if(
          !confirm(
            'Delete this product?'
          )
        ){

          return;

        }


        const {
          error
        } =
        await client
          .from(
            'products'
          )
          .delete()
          .eq(
            'id',
            id
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


      /* EDIT CATEGORY */

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


      /* DELETE CATEGORY */

      const deleteCategory =
        event.target.closest(
          '[data-delete-category]'
        );


      if(deleteCategory){

        const id =
          deleteCategory.dataset
            .deleteCategory;


        if(
          !confirm(
            'Delete this category?'
          )
        ){

          return;

        }


        const {
          error
        } =
        await client
          .from(
            'categories'
          )
          .delete()
          .eq(
            'id',
            id
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


  /* =====================================================
     ORDER STATUS
     ===================================================== */

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
      await client
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


  /* =====================================================
     RESTORE EXISTING SESSION
     ===================================================== */

  if(client){

    client
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
        error => {

          console.warn(
            'Session restore failed:',
            error
          );

        }
      );

  }

})();
