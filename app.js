(function () {

  const cfg =
    window.GLOVAERA_CONFIG ||
    {};


  const hasSupabase =
    window.supabase &&
    cfg.supabaseUrl &&
    cfg.supabaseAnonKey &&
    !cfg.supabaseUrl.startsWith(
      'YOUR_'
    );


  window.glovaera = {

    client:
      hasSupabase
        ? window.supabase.createClient(
            cfg.supabaseUrl,
            cfg.supabaseAnonKey
          )
        : null,

    cfg,

    hasSupabase

  };


  const demoProducts = [

    {
      id:'demo-1',
      name:'Pearl Drop Earrings',
      category:'Earrings',
      price:180,
      sale_price:150,
      stock:12,
      featured:true,
      is_new:true,
      combo:false,
      coming_soon:false,
      image_url:'logo.png',
      description:
        'Delicate pearl-inspired earrings for everyday styling.',
      material:
        'Alloy + imitation pearl',
      color:
        'Gold'
    },

    {
      id:'demo-2',
      name:'Luna Jhumka',
      category:'Jhumka',
      price:240,
      sale_price:199,
      stock:8,
      featured:true,
      is_new:true,
      combo:false,
      coming_soon:false,
      image_url:'logo.png',
      description:
        'Classic jhumka silhouette with a modern finish.',
      material:
        'Alloy',
      color:
        'Antique Gold'
    },

    {
      id:'demo-3',
      name:'Everyday Minimal Ring',
      category:'Rings',
      price:150,
      sale_price:120,
      stock:20,
      featured:false,
      is_new:true,
      combo:false,
      coming_soon:false,
      image_url:'logo.png',
      description:
        'A simple stack-friendly ring for everyday looks.',
      material:
        'Alloy',
      color:
        'Gold'
    },

    {
      id:'demo-4',
      name:'Soft Glow Set',
      category:'Combos',
      price:420,
      sale_price:349,
      stock:6,
      featured:true,
      is_new:false,
      combo:true,
      coming_soon:false,
      image_url:'logo.png',
      description:
        'Earrings + ring + hijab pin in one easy set.',
      material:
        'Mixed fashion jewellery',
      color:
        'Gold'
    }

  ];


  const demoCategories = [

    {
      id:'c1',
      name:'Earrings',
      slug:'earrings',
      image_url:'logo.png'
    },

    {
      id:'c2',
      name:'Jhumka',
      slug:'jhumka',
      image_url:'logo.png'
    },

    {
      id:'c3',
      name:'Rings',
      slug:'rings',
      image_url:'logo.png'
    },

    {
      id:'c4',
      name:'Necklaces',
      slug:'necklaces',
      image_url:'logo.png'
    },

    {
      id:'c5',
      name:'Hijab Pins',
      slug:'hijab-pins',
      image_url:'logo.png'
    },

    {
      id:'c6',
      name:'Combos',
      slug:'combos',
      image_url:'logo.png'
    }

  ];


  async function getProducts(){

    if(
      !window.glovaera.client
    ){

      return demoProducts;

    }


    const {
      data,
      error
    } =
      await window.glovaera.client
        .from(
          'products'
        )
        .select('*')
        .eq(
          'active',
          true
        )
        .order(
          'created_at',
          {
            ascending:false
          }
        );


    if(error){

      console.warn(
        error
      );

      return demoProducts;

    }


    return data || [];

  }


  async function getCategories(){

    if(
      !window.glovaera.client
    ){

      return demoCategories;

    }


    const {
      data,
      error
    } =
      await window.glovaera.client
        .from(
          'categories'
        )
        .select('*')
        .order(
          'name'
        );


    if(error){

      console.warn(
        error
      );

      return demoCategories;

    }


    return data || [];

  }


  function money(
    v
  ){

    return `${
      cfg.currency ||
      '৳'
    }${
      Number(
        v || 0
      ).toLocaleString(
        'en-BD'
      )
    }`;

  }


  function cart(){

    try{

      return JSON.parse(
        localStorage.getItem(
          'glovaera_cart'
        ) ||
        '[]'
      );

    }catch{

      return [];

    }

  }


  function saveCart(
    items
  ){

    localStorage.setItem(
      'glovaera_cart',
      JSON.stringify(
        items
      )
    );


    updateCartCount();

  }


  function addToCart(
    product,
    qty=1
  ){

    /* Coming Soon cannot be added */

    if(
      product.coming_soon
    ){

      return false;

    }


    const items =
      cart();


    const found =
      items.find(
        x =>
          x.id ===
          product.id
      );


    if(found){

      found.qty +=
        qty;

    }else{

      items.push({

        id:
          product.id,

        name:
          product.name,

        price:
          Number(
            product.sale_price ??
            product.price
          ),

        image_url:
          product.image_url ||
          'logo.png',

        qty

      });

    }


    saveCart(
      items
    );


    window.dispatchEvent(
      new CustomEvent(
        'cart:updated'
      )
    );


    return true;

  }


  function removeFromCart(
    id
  ){

    saveCart(
      cart().filter(
        x =>
          x.id !==
          id
      )
    );

  }


  function updateCartCount(){

    const n =
      cart().reduce(
        (
          a,
          b
        ) =>
          a +
          Number(
            b.qty ||
            0
          ),
        0
      );


    document
      .querySelectorAll(
        '#cartCount'
      )
      .forEach(
        el =>
          el.textContent =
            n
      );

  }


  /* =========================
     PRODUCT CARD
     ========================= */

  function productCard(
    p
  ){

    const price =
      Number(
        p.sale_price ??
        p.price ??
        0
      );


    const old =
      Number(
        p.sale_price !=
        null
          ? p.price
          : 0
      );


    const badge =
      p.coming_soon
        ? 'COMING SOON'
        : p.featured
        ? 'BEST SELLER'
        : p.is_new
        ? 'NEW'
        : '';


    return `

      <article
        class="product-card"
      >

        <a
          href="product.html?id=${encodeURIComponent(
            p.id
          )}"
          class="product-image-wrap"
        >

          <img
            src="${
              p.image_url ||
              'logo.png'
            }"
            alt="${escapeHtml(
              p.name
            )}"
          >


          ${
            badge
              ? `
                <span
                  class="
                    product-badge
                    ${
                      p.coming_soon
                        ? 'coming-soon-product-badge'
                        : ''
                    }
                  "
                >
                  ${badge}
                </span>
              `
              : ''
          }

        </a>


        <div
          class="product-meta"
        >

          <div
            class="product-cat"
          >
            ${escapeHtml(
              p.category ||
              ''
            )}
          </div>


          <h3>

            <a
              href="product.html?id=${encodeURIComponent(
                p.id
              )}"
            >
              ${escapeHtml(
                p.name
              )}
            </a>

          </h3>


          <div
            class="price-row"
          >

            <strong>
              ${money(price)}
            </strong>


            ${
              old > price
                ? `
                  <del>
                    ${money(old)}
                  </del>
                `
                : ''
            }

          </div>


          ${
            p.coming_soon
              ? `
                <span
                  class="
                    quick-add
                    coming-soon-label
                  "
                >
                  Coming soon
                </span>
              `
              : Number(
                  p.stock ||
                  0
                ) > 0
              ? `
                <button
                  class="quick-add"
                  data-add="${encodeURIComponent(
                    p.id
                  )}"
                >
                  Add to cart
                </button>
              `
              : `
                <span
                  class="
                    quick-add
                    out-of-stock-label
                  "
                >
                  Out of stock
                </span>
              `
          }

        </div>

      </article>

    `;

  }


  function escapeHtml(
    s=''
  ){

    return String(
      s
    ).replace(
      /[&<>'"]/g,
      c =>
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
        }[c])
    );

  }


  async function wireHome(){

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


    if(
      !catEl ||
      !newEl ||
      !bestEl
    ){

      return;

    }


    const [
      cats,
      products
    ] =
      await Promise.all([
        getCategories(),
        getProducts()
      ]);


    catEl.innerHTML =
      cats
        .map(
          c =>
            `
              <a
                class="category-card"
                href="shop.html?category=${encodeURIComponent(
                  c.name
                )}"
              >

                <img
                  src="${
                    c.image_url ||
                    'logo.png'
                  }"
                  alt="${escapeHtml(
                    c.name
                  )}"
                >

                <span>
                  ${escapeHtml(
                    c.name
                  )}
                </span>

              </a>
            `
        )
        .join('');


    newEl.innerHTML =
      products
        .filter(
          x =>
            x.is_new
        )
        .slice(
          0,
          4
        )
        .map(
          productCard
        )
        .join('');


    bestEl.innerHTML =
      products
        .filter(
          x =>
            x.featured
        )
        .slice(
          0,
          4
        )
        .map(
          productCard
        )
        .join('');


    document.addEventListener(
      'click',
      e => {

        const b =
          e.target.closest(
            '[data-add]'
          );


        if(!b)
          return;


        const id =
          decodeURIComponent(
            b.dataset.add
          );


        const p =
          products.find(
            x =>
              String(
                x.id
              ) ===
              String(
                id
              )
          );


        if(
          p &&
          !p.coming_soon
        ){

          const added =
            addToCart(
              p
            );


          if(
            added
          ){

            b.textContent =
              'Added ✓';


            setTimeout(
              () =>
                b.textContent =
                  'Add to cart',
              900
            );

          }

        }

      }
    );

  }


  function initCommon(){

    updateCartCount();


    document
      .getElementById(
        'menuBtn'
      )
      ?.addEventListener(
        'click',
        () => {

          const n =
            document.getElementById(
              'mobileNav'
            );


          if(n){

            n.hidden =
              !n.hidden;

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

          window.location.href =
            'shop.html';

        }
      );


    wireHome();

  }


  window.GLOVAERA = {

    ...window.GLOVAERA,

    getProducts,

    getCategories,

    money,

    cart,

    saveCart,

    addToCart,

    removeFromCart,

    productCard,

    escapeHtml,

    updateCartCount,

    hasSupabase

  };


  document.addEventListener(
    'DOMContentLoaded',
    initCommon
  );

})();
