(function () {
  const state = {
    user: null,
    products: [],
    categories: [],
    orders: []
  };

  const loginView = document.getElementById('loginView');
  const dashboard = document.getElementById('dashboardView');
  const loginMsg = document.getElementById('loginMsg');

  const modal = document.getElementById('modal');
  const modalContent = document.getElementById('modalContent');

  function setLoginMessage(message, isError = true) {
    loginMsg.textContent = message || '';
    loginMsg.className = isError
      ? 'form-message error'
      : 'form-message';
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
    ?.addEventListener('click', closeModal);

  async function signIn(event) {
    event.preventDefault();

    const client = window.GLOVAERA?.client;

    if (!client) {
      setLoginMessage(
        'Supabase connection is not available. Please check config.js.'
      );
      return;
    }

    setLoginMessage('Signing in...', false);

    const formData = new FormData(event.target);

    const { data, error } = await client.auth.signInWithPassword({
      email: formData.get('email'),
      password: formData.get('password')
    });

    if (error) {
      setLoginMessage(error.message);
      return;
    }

    if (!data?.user) {
      setLoginMessage('Login failed. No user session was returned.');
      return;
    }

    state.user = data.user;

    /*
     * Verify that this authenticated user is actually
     * registered inside public.admins.
     */
    const { data: isAdmin, error: adminError } = await client.rpc(
      'is_admin'
    );

    if (adminError) {
      await client.auth.signOut();
      setLoginMessage(
        `Admin verification failed: ${adminError.message}`
      );
      return;
    }

    if (!isAdmin) {
      await client.auth.signOut();
      setLoginMessage(
        'This account is not registered as a GLOVAERA admin.'
      );
      return;
    }

    await boot();
  }

  async function boot() {
    loginView.hidden = true;
    dashboard.hidden = false;

    await refreshAll();
  }

  async function refreshAll() {
    const client = window.GLOVAERA?.client;

    if (!client) {
      throw new Error('Supabase client is unavailable.');
    }

    const [productsResult, categoriesResult, ordersResult] =
      await Promise.all([
        client
          .from('products')
          .select('*')
          .order('created_at', { ascending: false }),

        client
          .from('categories')
          .select('*')
          .order('name'),

        client
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
      ]);

    if (productsResult.error) {
      console.error('Products error:', productsResult.error);
      alert(`Products error: ${productsResult.error.message}`);
    }

    if (categoriesResult.error) {
      console.error('Categories error:', categoriesResult.error);
      alert(`Categories error: ${categoriesResult.error.message}`);
    }

    if (ordersResult.error) {
      console.error('Orders error:', ordersResult.error);
      alert(`Orders error: ${ordersResult.error.message}`);
    }

    state.products = productsResult.data || [];
    state.categories = categoriesResult.data || [];
    state.orders = ordersResult.data || [];

    renderOverview();
    renderProducts();
    renderCategories();
    renderOrders();
  }

  function renderOverview() {
    const element = document.getElementById('statsGrid');
    if (!element) return;

    const pending = state.orders.filter((order) =>
      ['new', 'confirmed', 'processing'].includes(order.status)
    ).length;

    element.innerHTML = [
      ['Products', state.products.length],
      ['Categories', state.categories.length],
      ['Orders', state.orders.length],
      ['Pending', pending]
    ]
      .map(
        ([label, value]) => `
          <div class="stat-card">
            <span>${label}</span>
            <strong>${value}</strong>
          </div>
        `
      )
      .join('');
  }

  function renderProducts() {
    const element = document.getElementById('productAdminList');
    if (!element) return;

    element.innerHTML =
      state.products
        .map(
          (product) => `
            <div class="admin-row">
              <img
                src="${product.image_url || 'logo.png'}"
                alt="${GLOVAERA.escapeHtml(product.name)}"
              >

              <div class="grow">
                <strong>
                  ${GLOVAERA.escapeHtml(product.name)}
                </strong>

                <span>
                  ${GLOVAERA.escapeHtml(product.category || '')}
                  ·
                  ${GLOVAERA.money(
                    product.sale_price ?? product.price
                  )}
                  · Stock ${product.stock ?? 0}
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
      '<div class="empty-state">No products yet.</div>';
  }

  function renderCategories() {
    const element = document.getElementById('categoryAdminList');
    if (!element) return;

    element.innerHTML =
      state.categories
        .map(
          (category) => `
            <div class="admin-row">
              <div class="grow">
                <strong>
                  ${GLOVAERA.escapeHtml(category.name)}
                </strong>

                <span>
                  ${GLOVAERA.escapeHtml(category.slug || '')}
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
      '<div class="empty-state">No categories yet.</div>';
  }

  function renderOrders() {
    const element = document.getElementById('orderAdminList');
    if (!element) return;

    element.innerHTML =
      state.orders
        .map(
          (order) => `
            <div class="admin-order">
              <div class="admin-order-head">
                <strong>
                  #${GLOVAERA.escapeHtml(
                    String(order.id).slice(0, 8)
                  )}
                </strong>

                <span class="status ${GLOVAERA.escapeHtml(
                  order.status
                )}">
                  ${GLOVAERA.escapeHtml(order.status)}
                </span>
              </div>

              <p>
                ${GLOVAERA.escapeHtml(order.customer_name)}
                ·
                ${GLOVAERA.escapeHtml(order.phone)}
              </p>

              <p>
                ${GLOVAERA.escapeHtml(order.address)},
                ${GLOVAERA.escapeHtml(order.district)}
              </p>

              <strong>
                ${GLOVAERA.money(order.total)}
              </strong>

              <div class="order-actions">
                <select data-order-status="${order.id}">
                  ${[
                    'new',
                    'confirmed',
                    'processing',
                    'shipped',
                    'delivered',
                    'cancelled'
                  ]
                    .map(
                      (status) =>
                        `<option ${
                          status === order.status
                            ? 'selected'
                            : ''
                        }>${status}</option>`
                    )
                    .join('')}
                </select>
              </div>
            </div>
          `
        )
        .join('') ||
      '<div class="empty-state">No orders yet.</div>';
  }

  function productForm(product = {}) {
    return `
      <form id="productForm" class="form-grid">
        <input
          type="hidden"
          name="id"
          value="${product.id || ''}"
        >

        <label>
          Name
          <input
            required
            name="name"
            value="${GLOVAERA.escapeHtml(product.name || '')}"
          >
        </label>

        <label>
          Category
          <select required name="category">
            ${state.categories
              .map(
                (category) => `
                  <option
                    ${
                      category.name === product.category
                        ? 'selected'
                        : ''
                    }
                  >
                    ${GLOVAERA.escapeHtml(category.name)}
                  </option>
                `
              )
              .join('')}
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
            value="${product.price ?? 0}"
          >
        </label>

        <label>
          Sale price
          <input
            type="number"
            min="0"
            step="0.01"
            name="sale_price"
            value="${product.sale_price ?? ''}"
          >
        </label>

        <label>
          Stock
          <input
            required
            type="number"
            min="0"
            name="stock"
            value="${product.stock ?? 0}"
          >
        </label>

        <label>
          Image URL
          <input
            name="image_url"
            value="${GLOVAERA.escapeHtml(
              product.image_url || 'logo.png'
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
          >${GLOVAERA.escapeHtml(
            product.description || ''
          )}</textarea>
        </label>

        <label>
          <input
            type="checkbox"
            name="featured"
            ${product.featured ? 'checked' : ''}
          >
          Best seller
        </label>

        <label>
          <input
            type="checkbox"
            name="is_new"
            ${product.is_new ? 'checked' : ''}
          >
          New arrival
        </label>

        <label>
          <input
            type="checkbox"
            name="combo"
            ${product.combo ? 'checked' : ''}
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

  function categoryForm(category = {}) {
    return `
      <form id="categoryForm" class="form-grid">
        <input
          type="hidden"
          name="id"
          value="${category.id || ''}"
        >

        <label>
          Name
          <input
            required
            name="name"
            value="${GLOVAERA.escapeHtml(
              category.name || ''
            )}"
          >
        </label>

        <label>
          Slug
          <input
            required
            name="slug"
            value="${GLOVAERA.escapeHtml(
              category.slug || ''
            )}"
          >
        </label>

        <label class="full">
          Image URL
          <input
            name="image_url"
            value="${GLOVAERA.escapeHtml(
              category.image_url || 'logo.png'
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

  async function saveProduct(event) {
    event.preventDefault();

    const client = window.GLOVAERA.client;
    const form = new FormData(event.target);

    try {
      let imageUrl = form.get('image_url') || 'logo.png';

      const file = form.get('image_file');

      if (file && file.size) {
        const safeName = file.name.replace(
          /[^a-zA-Z0-9._-]/g,
          '-'
        );

        const path = `${crypto.randomUUID()}-${safeName}`;

        const uploadResult = await client.storage
          .from('product-images')
          .upload(path, file, {
            upsert: false,
            contentType: file.type
          });

        if (uploadResult.error) {
          throw uploadResult.error;
        }

        imageUrl = client.storage
          .from('product-images')
          .getPublicUrl(path).data.publicUrl;
      }

      const record = {
        name: form.get('name'),
        category: form.get('category'),
        price: Number(form.get('price')),
        sale_price: form.get('sale_price')
          ? Number(form.get('sale_price'))
          : null,
        stock: Number(form.get('stock')),
        image_url: imageUrl,
        description: form.get('description'),
        featured: form.get('featured') === 'on',
        is_new: form.get('is_new') === 'on',
        combo: form.get('combo') === 'on',
        active: true
      };

      const id = form.get('id');

      const query = id
        ? client.from('products').update(record).eq('id', id)
        : client.from('products').insert(record);

      const { error } = await query;

      if (error) {
        throw error;
      }

      closeModal();
      await refreshAll();

      alert('Product saved successfully.');
    } catch (error) {
      console.error(error);
      alert(`Could not save product: ${error.message}`);
    }
  }

  async function saveCategory(event) {
    event.preventDefault();

    const client = window.GLOVAERA.client;
    const form = new FormData(event.target);

    try {
      const record = {
        name: form.get('name'),
        slug: form.get('slug'),
        image_url: form.get('image_url') || 'logo.png'
      };

      const id = form.get('id');

      const query = id
        ? client.from('categories').update(record).eq('id', id)
        : client.from('categories').insert(record);

      const { error } = await query;

      if (error) {
        throw error;
      }

      closeModal();
      await refreshAll();

      alert('Category saved successfully.');
    } catch (error) {
      console.error(error);
      alert(`Could not save category: ${error.message}`);
    }
  }

  async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;

    try {
      const { error } = await window.GLOVAERA.client
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      await refreshAll();
    } catch (error) {
      console.error(error);
      alert(`Could not delete product: ${error.message}`);
    }
  }

  async function deleteCategory(id) {
    if (!confirm('Delete this category?')) return;

    try {
      const { error } = await window.GLOVAERA.client
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      await refreshAll();
    } catch (error) {
      console.error(error);
      alert(`Could not delete category: ${error.message}`);
    }
  }

  async function updateOrderStatus(id, status) {
    try {
      const { error } = await window.GLOVAERA.client
        .from('orders')
        .update({ status })
        .eq('id', id);

      if (error) {
        throw error;
      }

      await refreshAll();
    } catch (error) {
      console.error(error);
      alert(`Could not update order: ${error.message}`);
    }
  }

  document
    .getElementById('loginForm')
    ?.addEventListener('submit', signIn);

  document
    .getElementById('logoutBtn')
    ?.addEventListener('click', async () => {
      await window.GLOVAERA.client.auth.signOut();
      window.location.reload();
    });

  document
    .getElementById('addProductBtn')
    ?.addEventListener('click', () => {
      showModal(
        `<h2>Add product</h2>${productForm()}`
      );

      document
        .getElementById('productForm')
        ?.addEventListener('submit', saveProduct);
    });

  document
    .getElementById('addCategoryBtn')
    ?.addEventListener('click', () => {
      showModal(
        `<h2>Add category</h2>${categoryForm()}`
      );

      document
        .getElementById('categoryForm')
        ?.addEventListener('submit', saveCategory);
    });

  document
    .getElementById('refreshOrdersBtn')
    ?.addEventListener('click', refreshAll);

  document.querySelectorAll('.tab').forEach((button) => {
    button.addEventListener('click', () => {
      document
        .querySelectorAll('.tab')
        .forEach((item) => item.classList.remove('active'));

      button.classList.add('active');

      document
        .querySelectorAll('.tab-panel')
        .forEach((panel) => {
          panel.hidden = true;
        });

      const target = document.getElementById(
        `tab-${button.dataset.tab}`
      );

      if (target) {
        target.hidden = false;
      }
    });
  });

  document.addEventListener('click', (event) => {
    const editProduct = event.target.closest(
      '[data-edit-product]'
    );

    if (editProduct) {
      const product = state.products.find(
        (item) =>
          String(item.id) ===
          String(editProduct.dataset.editProduct)
      );

      if (!product) return;

      showModal(
        `<h2>Edit product</h2>${productForm(product)}`
      );

      document
        .getElementById('productForm')
        ?.addEventListener('submit', saveProduct);

      return;
    }

    const deleteProductButton = event.target.closest(
      '[data-delete-product]'
    );

    if (deleteProductButton) {
      deleteProduct(deleteProductButton.dataset.deleteProduct);
      return;
    }

    const editCategory = event.target.closest(
      '[data-edit-category]'
    );

    if (editCategory) {
      const category = state.categories.find(
        (item) =>
          String(item.id) ===
          String(editCategory.dataset.editCategory)
      );

      if (!category) return;

      showModal(
        `<h2>Edit category</h2>${categoryForm(category)}`
      );

      document
        .getElementById('categoryForm')
        ?.addEventListener('submit', saveCategory);

      return;
    }

    const deleteCategoryButton = event.target.closest(
      '[data-delete-category]'
    );

    if (deleteCategoryButton) {
      deleteCategory(
        deleteCategoryButton.dataset.deleteCategory
      );
    }
  });

  document.addEventListener('change', (event) => {
    const select = event.target.closest(
      '[data-order-status]'
    );

    if (!select) return;

    updateOrderStatus(
      select.dataset.orderStatus,
      select.value
    );
  });

  /*
   * Restore an existing session only after verifying admin status.
   */
  if (window.GLOVAERA?.client) {
    window.GLOVAERA.client.auth
      .getSession()
      .then(async ({ data, error }) => {
        if (error) {
          console.error('Session error:', error);
          return;
        }

        if (!data?.session) return;

        const { data: isAdmin, error: adminError } =
          await window.GLOVAERA.client.rpc('is_admin');

        if (adminError || !isAdmin) {
          await window.GLOVAERA.client.auth.signOut();
          return;
        }

        state.user = data.session.user;
        await boot();
      })
      .catch((error) => {
        console.error('Admin session restore error:', error);
      });
  }
})();
