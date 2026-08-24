(async function(){

  const id =
    new URLSearchParams(
      location.search
    ).get(
      'id'
    );


  const root =
    document.getElementById(
      'productRoot'
    );


  const products =
    await GLOVAERA.getProducts();


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


  if(!p){

    root.innerHTML =
      `
        <div class="empty-state">

          Product not found.

          <br>

          <a
            class="text-link"
            href="shop.html"
          >
            Back to shop
          </a>

        </div>
      `;

    return;

  }


  const price =
    Number(
      p.sale_price ??
      p.price
    );


  const old =
    Number(
      p.sale_price !=
      null
        ? p.price
        : 0
    );


  const comingSoon =
    p.coming_soon ===
    true;


  const inStock =
    Number(
      p.stock ||
      0
    ) > 0;


  root.innerHTML = `

    <div
      class="product-gallery"
    >

      ${
        comingSoon
          ? `
            <span
              class="
                product-status-badge
                coming-soon-badge
              "
            >
              COMING SOON
            </span>
          `
          : !inStock
          ? `
            <span
              class="
                product-status-badge
                out-stock-badge
              "
            >
              OUT OF STOCK
            </span>
          `
          : ''
      }


      <img
        src="${
          p.image_url ||
          'logo.png'
        }"
        alt="${GLOVAERA.escapeHtml(
          p.name
        )}"
      >

    </div>


    <div
      class="product-info"
    >

      <div
        class="product-cat"
      >
        ${GLOVAERA.escapeHtml(
          p.category ||
          ''
        )}
      </div>


      <h1>
        ${GLOVAERA.escapeHtml(
          p.name
        )}
      </h1>


      <div
        class="rating"
      >

        ★★★★★

        <span>
          ${
            comingSoon
              ? 'Coming soon'
              : '(New)'
          }
        </span>

      </div>


      <div
        class="detail-price"
      >

        <strong>
          ${GLOVAERA.money(
            price
          )}
        </strong>


        ${
          old > price
            ? `
              <del>
                ${GLOVAERA.money(
                  old
                )}
              </del>
            `
            : ''
        }

      </div>


      <p>
        ${GLOVAERA.escapeHtml(
          p.description ||
          'Beautiful everyday jewellery selected for the GLOVAERA edit.'
        )}
      </p>


      <dl
        class="spec-list"
      >

        <div>

          <dt>
            Material
          </dt>

          <dd>
            ${GLOVAERA.escapeHtml(
              p.material ||
              'Fashion jewellery'
            )}
          </dd>

        </div>


        <div>

          <dt>
            Colour
          </dt>

          <dd>
            ${GLOVAERA.escapeHtml(
              p.color ||
              'Gold'
            )}
          </dd>

        </div>


        <div>

          <dt>
            Stock
          </dt>

          <dd>

            ${
              comingSoon
                ? 'Coming Soon'
                : inStock
                ? 'In stock'
                : 'Out of stock'
            }

          </dd>

        </div>

      </dl>


      ${
        comingSoon

          ? `

            <div
              class="coming-soon-message"
            >

              <strong>
                🚀 Coming soon
              </strong>

              <p>
                This product will be available soon.
                Please check back later.
              </p>

            </div>

          `

          : inStock

          ? `

            <div
              class="qty-row"
            >

              <button
                id="minus"
              >
                −
              </button>


              <input
                id="qty"
                value="1"
                inputmode="numeric"
              >


              <button
                id="plus"
              >
                +
              </button>

            </div>


            <div
              class="product-actions"
            >

              <button
                class="btn btn-secondary"
                id="addBtn"
              >
                Add to cart
              </button>


              <button
                class="btn btn-primary"
                id="buyBtn"
              >
                Buy now
              </button>

            </div>

          `

          : `

            <div
              class="out-stock-message"
            >

              <strong>
                Currently unavailable
              </strong>

              <p>
                This product is currently out of stock.
              </p>

            </div>

          `
      }

    </div>

  `;


  /*
    Coming Soon and Out of Stock
    products cannot be purchased.
  */

  if(
    comingSoon ||
    !inStock
  ){

    return;

  }


  const qty =
    document.getElementById(
      'qty'
    );


  document.getElementById(
    'minus'
  ).onclick =
    () =>
      qty.value =
        Math.max(
          1,
          Number(
            qty.value
          ) - 1
        );


  document.getElementById(
    'plus'
  ).onclick =
    () =>
      qty.value =
        Math.min(
          Number(
            p.stock ||
            99
          ),
          Number(
            qty.value
          ) + 1
        );


  document.getElementById(
    'addBtn'
  ).onclick =
    () => {

      const added =
        GLOVAERA.addToCart(
          p,
          Number(
            qty.value
          ) || 1
        );


      if(
        added
      ){

        document.getElementById(
          'addBtn'
        ).textContent =
          'Added ✓';

      }

    };


  document.getElementById(
    'buyBtn'
  ).onclick =
    () => {

      const added =
        GLOVAERA.addToCart(
          p,
          Number(
            qty.value
          ) || 1
        );


      if(
        added
      ){

        location.href =
          'checkout.html';

      }

    };

})();
