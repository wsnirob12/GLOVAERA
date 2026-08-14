(function () {

  'use strict';


  let products = [];
  let categories = [];

  let activeCategory = '';
  let searchTerm = '';
  let currentSort = 'featured';


  const grid =
    document.getElementById(
      'shopGrid'
    );

  const empty =
    document.getElementById(
      'shopEmpty'
    );

  const search =
    document.getElementById(
      'shopSearch'
    );

  const clearSearch =
    document.getElementById(
      'clearSearch'
    );

  const categoryChips =
    document.getElementById(
      'categoryChips'
    );

  const sort =
    document.getElementById(
      'sortFilter'
    );

  const resultCount =
    document.getElementById(
      'resultCount'
    );

  const clearFilters =
    document.getElementById(
      'clearFilters'
    );

  const emptyReset =
    document.getElementById(
      'emptyReset'
    );

  const topSearch =
    document.getElementById(
      'searchTopBtn'
    );


  function escape(
    value=''
  ){
    return String(
      value
    ).replace(
      /[&<>'"]/g,
      c =>
        ({
          '&':'&amp;',
          '<':'&lt;',
          '>':'&gt;',
          "'":'&#39;',
          '"':'&quot;'
        }[c])
    );
  }


  function readUrl(){

    const params =
      new URLSearchParams(
        location.search
      );


    activeCategory =
      params.get(
        'category'
      ) || '';


    currentSort =
      params.get(
        'sort'
      ) || 'featured';


    if (
      params.get(
        'featured'
      ) === 'true'
    ){
      currentSort =
        'featured';
    }


    sort.value =
      currentSort;


    if (
      params.get(
        'combo'
      ) === 'true'
    ){
      activeCategory =
        '__COMBO__';
    }

  }


  function updateUrl(){

    const params =
      new URLSearchParams();


    if (
      activeCategory &&
      activeCategory !==
        '__COMBO__'
    ){

      params.set(
        'category',
        activeCategory
      );

    }


    if (
      activeCategory ===
      '__COMBO__'
    ){

      params.set(
        'combo',
        'true'
      );

    }


    if (
      currentSort &&
      currentSort !==
        'featured'
    ){

      params.set(
        'sort',
        currentSort
      );

    }


    const query =
      params.toString();


    history.replaceState(
      {},
      '',
      query
        ? `shop.html?${query}`
        : 'shop.html'
    );

  }


  function renderCategories(){

    const names = [
      {
        label:
          'All',
        value:
          ''
      }
    ];


    categories.forEach(
      c => {

        names.push({
          label:
            c.name,
          value:
            c.name
        });

      }
    );


    names.push({
      label:
        'Combos',
      value:
        '__COMBO__'
    });


    categoryChips.innerHTML =
      names
        .map(
          item => `
            <button
              type="button"
              class="category-chip ${
                item.value ===
                  activeCategory
                  ? 'active'
                  : ''
              }"
              data-category="${
                escape(
                  item.value
                )
              }"
            >
              ${escape(
                item.label
              )}
            </button>
          `
        )
        .join('');

  }


  function filteredProducts(){

    let list =
      [...products];


    if (
      activeCategory ===
      '__COMBO__'
    ){

      list =
        list.filter(
          p =>
            Boolean(
              p.combo
            )
        );

    }


    else if (
      activeCategory
    ){

      list =
        list.filter(
          p =>
            p.category ===
            activeCategory
        );

    }


    if (
      searchTerm
    ){

      const q =
        searchTerm
          .toLowerCase()
          .trim();


      list =
        list.filter(
          p =>
            `
              ${p.name || ''}
              ${p.category || ''}
              ${p.description || ''}
            `
            .toLowerCase()
            .includes(q)
        );

    }


    switch (
      currentSort
    ){

      case 'new':

        list.sort(
          (a,b) =>
            Number(
              b.is_new
            ) -
            Number(
              a.is_new
            )
        );

        break;


      case 'price-asc':

        list.sort(
          (a,b) =>
            Number(
              a.sale_price ??
              a.price ??
              0
            ) -
            Number(
              b.sale_price ??
              b.price ??
              0
            )
        );

        break;


      case 'price-desc':

        list.sort(
          (a,b) =>
            Number(
              b.sale_price ??
              b.price ??
              0
            ) -
            Number(
              a.sale_price ??
              a.price ??
              0
            )
        );

        break;


      default:

        list.sort(
          (a,b) =>
            Number(
              b.featured
            ) -
            Number(
              a.featured
            )
        );

    }


    return list;
  }


  function render(){

    const list =
      filteredProducts();


    grid.innerHTML =
      list
        .map(
          p =>
            GLOVAERA.productCard(
              p
            )
        )
        .join('');


    empty.hidden =
      list.length > 0;


    resultCount.textContent =
      list.length === 1
        ? '1 product'
        : `${list.length} products`;


    const hasFilter =
      Boolean(
        searchTerm ||
        activeCategory ||
        currentSort !==
          'featured'
      );


    clearFilters.hidden =
      !hasFilter;


    clearSearch.hidden =
      !searchTerm;

  }


  function reset(){

    activeCategory =
      '';

    searchTerm =
      '';

    currentSort =
      'featured';


    search.value =
      '';

    sort.value =
      'featured';


    updateUrl();
    renderCategories();
    render();

  }


  categoryChips
    .addEventListener(
      'click',
      event => {

        const button =
          event.target.closest(
            '[data-category]'
          );

        if (!button)
          return;


        activeCategory =
          button.dataset
            .category ||
          '';


        updateUrl();
        renderCategories();
        render();

      }
    );


  search
    .addEventListener(
      'input',
      () => {

        searchTerm =
          search.value;


        render();

      }
    );


  clearSearch
    .addEventListener(
      'click',
      () => {

        search.value =
          '';

        searchTerm =
          '';

        render();

      }
    );


  sort
    .addEventListener(
      'change',
      () => {

        currentSort =
          sort.value;

        updateUrl();
        render();

      }
    );


  clearFilters
    .addEventListener(
      'click',
      reset
    );


  emptyReset
    .addEventListener(
      'click',
      reset
    );


  topSearch
    ?.addEventListener(
      'click',
      () => {

        search.focus();
        window.scrollTo({
          top:
            document.querySelector(
              '.shop-controls-section'
            )
              .offsetTop -
            30,

          behavior:
            'smooth'
        });

      }
    );


  document.addEventListener(
    'click',
    event => {

      const button =
        event.target.closest(
          '[data-add]'
        );

      if (!button)
        return;


      const id =
        decodeURIComponent(
          button.dataset.add
        );


      const product =
        products.find(
          p =>
            String(
              p.id
            ) ===
            String(
              id
            )
        );


      if (!product)
        return;


      GLOVAERA.addToCart(
        product,
        1
      );


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
  );


  async function start(){

    readUrl();


    try {

      [
        products,
        categories
      ] =
      await Promise.all([
        GLOVAERA.getProducts(),
        GLOVAERA.getCategories()
      ]);


      renderCategories();
      render();

    } catch (
      error
    ){

      console.error(
        error
      );

      grid.innerHTML = '';

      empty.hidden =
        false;

      resultCount.textContent =
        'Could not load products';

    }

  }


  start();

})();
