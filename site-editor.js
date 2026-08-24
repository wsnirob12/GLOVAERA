(function () {

  'use strict';


  const DEFAULTS = {

    branding: {

      brandName:
        'GLOVAERA',

      tagline:
        'IMITATION JEWELRY & ACCESSORIES',

      logo:
        'logo.png',

      favicon:
        'favicon.png'

    },


    announcement: {

      enabled:
        true,

      text:
        '✦ COD Available · A New Era of Elegance'

    },


    header: {

      logoWidth:
        160,

      headerHeight:
        82

    },


    hero: {

      enabled:
        true,

      eyebrow:
        'A NEW ERA OF ELEGANCE',

      title:
        'Everyday elegance, effortlessly yours.',

      description:
        'Thoughtfully selected jewellery and accessories made to add a little glow to every day — without the luxury price tag.',

      button1Text:
        'Shop Collection',

      button1Link:
        'shop.html',

      button2Text:
        'Explore Combos',

      button2Link:
        'shop.html?combo=true',

      image:
        'logo.png',

      imageFit:
        'contain',

      imageRadius:
        20

    },


    categories: {

      eyebrow:
        'CURATED FOR YOU',

      title:
        'Shop by category',

      columns:
        6,

      gap:
        14,

      imageFit:
        'cover',

      radius:
        14

    },


    products: {

      newEyebrow:
        'JUST IN',

      newTitle:
        'New arrivals',

      newCount:
        4,

      bestEyebrow:
        'LOVED BY HER',

      bestTitle:
        'Best sellers',

      bestCount:
        4,

      enabled:
        true

    },


    gallery: {

      enabled:
        true,

      eyebrow:
        'STAY IN THE GLOVAERA MOOD',

      title:
        'Follow the edit',

      columns:
        6,

      gap:
        12,

      radius:
        12,

      imageFit:
        'cover',

      images:
        [
          'logo.png',
          'logo.png',
          'logo.png',
          'logo.png',
          'logo.png',
          'logo.png'
        ]

    },


    combo: {

      enabled:
        true,

      eyebrow:
        'THE GLOVAERA EDIT',

      title:
        'More beauty. Better value.',

      description:
        'Discover easy-to-style combo sets designed for everyday wear, gifting and tiny moments worth celebrating.',

      badge:
        'FEATURED COMBO',

      productTitle:
        'Soft Glow Set',

      productDescription:
        'Earrings + Ring + Hijab Pin',

      price:
        '৳349',

      buttonText:
        'Shop combos',

      buttonLink:
        'shop.html?combo=true',

      image:
        '',

      imageFit:
        'cover'

    },


    about: {

      eyebrow:
        'WHY GLOVAERA',

      title:
        'Affordable luxury, made for everyday life.',

      description:
        'We believe elegance should feel beautiful, wearable and accessible. GLOVAERA curates modern jewellery and accessories for students, young women and anyone who loves a refined everyday look.',

      feature1:
        'Elegant',

      feature2:
        'Accessible',

      feature3:
        'Everyday'

    },


    faq: {

      enabled:
        true,

      eyebrow:
        'YOU ASKED, WE ANSWER',

      title:
        'Frequently asked questions',

      items:
        [
          {
            question:
              'How can I place an order?',

            answer:
              'Add your favourite products to cart and complete the checkout form. Cash on Delivery is supported.'
          },

          {
            question:
              'How much is delivery?',

            answer:
              'Delivery charges are calculated automatically during checkout based on your district.'
          },

          {
            question:
              'Can I request an exchange?',

            answer:
              'Yes, according to the published GLOVAERA exchange policy.'
          }
        ]

    },


    footer: {

      tagline:
        'A New Era of Elegance.',

      shopTitle:
        'Shop',

      helpTitle:
        'Help',

      manageTitle:
        'Manage'

    },


    design: {

      burgundy:
        '#6D2348',

      darkBurgundy:
        '#4A1730',

      gold:
        '#D8B56A',

      lightGold:
        '#E8CC8A',

      ivory:
        '#FBF8F2',

      containerWidth:
        1160,

      sectionPadding:
        94,

      productColumns:
        4,

      bodySize:
        16,

      headingScale:
        1,

      buttonRadius:
        9,

      cardRadius:
        14

    }

  };


  function deepMerge(
    base,
    incoming
  ) {

    const result = {
      ...base
    };


    Object.keys(
      incoming || {}
    ).forEach(
      key => {

        if (
          incoming[key] &&
          typeof incoming[key] ===
            'object' &&
          !Array.isArray(
            incoming[key]
          )
        ) {

          result[key] =
            deepMerge(
              base[key] || {},
              incoming[key]
            );

        } else {

          result[key] =
            incoming[key];

        }

      }
    );


    return result;

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


  const client =
    window.glovaera?.client ||
    window.GLOVAERA?.client ||
    null;


  let settings =
    deepMerge(
      DEFAULTS,
      {}
    );


  let activeEditor =
    'homepage';


  function applySettings(
    value
  ) {

    settings =
      deepMerge(
        DEFAULTS,
        value || {}
      );


    const root =
      document.documentElement;


    const d =
      settings.design;


    root.style.setProperty(
      '--burgundy',
      d.burgundy
    );

    root.style.setProperty(
      '--dark-burgundy',
      d.darkBurgundy
    );

    root.style.setProperty(
      '--gold',
      d.gold
    );

    root.style.setProperty(
      '--light-gold',
      d.lightGold
    );

    root.style.setProperty(
      '--ivory',
      d.ivory
    );

    root.style.setProperty(
      '--container-width',
      `${Number(
        d.containerWidth
      ) || 1160}px`
    );

    root.style.setProperty(
      '--section-padding',
      `${Number(
        d.sectionPadding
      ) || 94}px`
    );

    root.style.setProperty(
      '--product-columns',
      `${Number(
        d.productColumns
      ) || 4}`
    );

    root.style.setProperty(
      '--body-size',
      `${Number(
        d.bodySize
      ) || 16}px`
    );

    root.style.setProperty(
      '--button-radius',
      `${Number(
        d.buttonRadius
      ) || 9}px`
    );

    root.style.setProperty(
      '--card-radius',
      `${Number(
        d.cardRadius
      ) || 14}px`
    );


    updateFavicon(
      settings.branding.favicon
    );


    const announcement =
      document.querySelector(
        '.announcement'
      );


    if (announcement) {

      announcement.hidden =
        settings.announcement.enabled ===
        false;

      announcement.textContent =
        settings.announcement.text;

    }


    updateLogos();


    updateHeader();


    applyHomepage();


    applyGlobalDesign();


    document.title =
      settings.branding.brandName ||
      document.title;

  }


  function updateFavicon(
    url
  ) {

    if (!url)
      return;


    let icon =
      document.querySelector(
        'link[data-glovaera-favicon]'
      );


    if (!icon) {

      icon =
        document.createElement(
          'link'
        );

      icon.rel =
        'icon';

      icon.dataset
        .glovaeraFavicon =
        'true';

      document.head.appendChild(
        icon
      );

    }


    icon.href =
      url;

  }


  function updateLogos() {

    const url =
      settings.branding.logo;


    if (!url)
      return;


    document
      .querySelectorAll(
        '.brand img, .footer-logo, .footer-brand img, .admin-logo'
      )
      .forEach(
        image => {

          image.src =
            url;

        }
      );

  }


  function updateHeader() {

    const root =
      document.documentElement;


    root.style.setProperty(
      '--site-header-height',
      `${Number(
        settings.header.headerHeight
      ) || 82}px`
    );

    root.style.setProperty(
      '--site-logo-width',
      `${Number(
        settings.header.logoWidth
      ) || 160}px`
    );


    document
      .querySelectorAll(
        '.brand img'
      )
      .forEach(
        image => {

          image.style.width =
            `${
              Number(
                settings.header.logoWidth
              ) || 160
            }px`;

        }
      );


    document
      .querySelectorAll(
        '.site-header'
      )
      .forEach(
        header => {

          header.style.minHeight =
            `${
              Number(
                settings.header.headerHeight
              ) || 82
            }px`;

        }
      );

  }


  function applyHomepage() {

    const main =
      document.querySelector(
        'main'
      );


    if (!main)
      return;


    /* HERO */

    const hero =
      main.querySelector(
        '.hero'
      );


    if (hero) {

      hero.hidden =
        settings.hero.enabled ===
        false;


      const copy =
        hero.querySelector(
          '.hero-copy'
        );


      if (copy) {

        const eyebrow =
          copy.querySelector(
            '.eyebrow'
          );

        const title =
          copy.querySelector(
            'h1'
          );

        const desc =
          copy.querySelector(
            'p'
          );

        const buttons =
          copy.querySelectorAll(
            '.hero-actions a'
          );


        if (eyebrow)
          eyebrow.textContent =
            settings.hero.eyebrow;


        if (title)
          title.textContent =
            settings.hero.title;


        if (desc)
          desc.textContent =
            settings.hero.description;


        if (buttons[0]) {

          buttons[0].textContent =
            settings.hero.button1Text;

          buttons[0].href =
            settings.hero.button1Link;

        }


        if (buttons[1]) {

          buttons[1].textContent =
            settings.hero.button2Text;

          buttons[1].href =
            settings.hero.button2Link;

        }

      }


      const image =
        hero.querySelector(
          '.hero-frame img'
        );


      if (image) {

        image.src =
          settings.hero.image ||
          image.src;

        image.style.objectFit =
          settings.hero.imageFit;

        image.style.borderRadius =
          `${
            Number(
              settings.hero.imageRadius
            ) || 0
          }px`;

      }

    }


    /* CATEGORY */

    const categorySection =
      document
        .querySelectorAll(
          'main > section'
        )[1];


    if (categorySection) {

      const heads =
        categorySection
          .querySelectorAll(
            '.section-head'
          );


      if (heads[0]) {

        const eyebrow =
          heads[0].querySelector(
            '.eyebrow'
          );

        const title =
          heads[0].querySelector(
            'h2'
          );


        if (eyebrow)
          eyebrow.textContent =
            settings.categories.eyebrow;


        if (title)
          title.textContent =
            settings.categories.title;

      }


      categorySection.style
        .setProperty(
          '--category-columns',
          settings.categories.columns
        );

    }


    /* NEW + BEST */

    const productSections =
      main.querySelectorAll(
        '.product-grid'
      );


    if (
      productSections.length >=
      2
    ) {

      const newSection =
        productSections[0]
          .closest(
            'section'
          );

      const bestSection =
        productSections[1]
          .closest(
            'section'
          );


      if (newSection) {

        const h =
          newSection.querySelector(
            '.section-head'
          );


        if (h) {

          const eyebrow =
            h.querySelector(
              '.eyebrow'
            );

          const title =
            h.querySelector(
              'h2'
            );


          if (eyebrow)
            eyebrow.textContent =
              settings.products.newEyebrow;


          if (title)
            title.textContent =
              settings.products.newTitle;

        }

      }


      if (bestSection) {

        const h =
          bestSection.querySelector(
            '.section-head'
          );


        if (h) {

          const eyebrow =
            h.querySelector(
              '.eyebrow'
            );

          const title =
            h.querySelector(
              'h2'
            );


          if (eyebrow)
            eyebrow.textContent =
              settings.products.bestEyebrow;


          if (title)
            title.textContent =
              settings.products.bestTitle;

        }

      }

    }


    /* COMBO */

    const comboSection =
      main.querySelector(
        '.burgundy-section'
      );


    if (comboSection) {

      comboSection.hidden =
        settings.combo.enabled ===
        false;


      const copy =
        comboSection
          .querySelector(
            '.edit-grid > div:first-child'
          );


      const card =
        comboSection
          .querySelector(
            '.combo-card'
          );


      if (copy) {

        const eyebrow =
          copy.querySelector(
            '.eyebrow'
          );

        const title =
          copy.querySelector(
            'h2'
          );

        const desc =
          copy.querySelector(
            'p'
          );

        const button =
          copy.querySelector(
            'a'
          );


        if (eyebrow)
          eyebrow.textContent =
            settings.combo.eyebrow;


        if (title)
          title.textContent =
            settings.combo.title;


        if (desc)
          desc.textContent =
            settings.combo.description;


        if (button) {

          button.textContent =
            settings.combo.buttonText;

          button.href =
            settings.combo.buttonLink;

        }

      }


      if (card) {

        const badge =
          card.querySelector(
            'span'
          );

        const title =
          card.querySelector(
            'h3'
          );

        const desc =
          card.querySelector(
            'p'
          );

        const price =
          card.querySelector(
            'strong'
          );


        if (badge)
          badge.textContent =
            settings.combo.badge;


        if (title)
          title.textContent =
            settings.combo.productTitle;


        if (desc)
          desc.textContent =
            settings.combo.productDescription;


        if (price)
          price.textContent =
            settings.combo.price;


        if (
          settings.combo.image
        ) {

          card.style.backgroundImage =
            `url("${settings.combo.image}")`;

          card.style.backgroundSize =
            'cover';

          card.style.backgroundPosition =
            'center';

        }

      }

    }


    /* ABOUT */

    const about =
      document.getElementById(
        'about'
      );


    if (about) {

      const eyebrow =
        about.querySelector(
          '.eyebrow'
        );

      const title =
        about.querySelector(
          'h2'
        );

      const desc =
        about.querySelector(
          '.story-copy p'
        );

      const features =
        about.querySelectorAll(
          '.feature-row span'
        );


      if (eyebrow)
        eyebrow.textContent =
          settings.about.eyebrow;


      if (title)
        title.textContent =
          settings.about.title;


      if (desc)
        desc.textContent =
          settings.about.description;


      if (features[0])
        features[0].textContent =
          settings.about.feature1;


      if (features[1])
        features[1].textContent =
          settings.about.feature2;


      if (features[2])
        features[2].textContent =
          settings.about.feature3;

    }


    /* GALLERY */

    const socialSection =
      [...main.querySelectorAll(
        'section'
      )].find(
        section =>
          section.querySelector(
            '.social-grid'
          )
      );


    if (socialSection) {

      socialSection.hidden =
        settings.gallery.enabled ===
        false;


      const eyebrow =
        socialSection.querySelector(
          '.eyebrow'
        );

      const title =
        socialSection.querySelector(
          'h2'
        );

      const grid =
        socialSection.querySelector(
          '.social-grid'
        );


      if (eyebrow)
        eyebrow.textContent =
          settings.gallery.eyebrow;


      if (title)
        title.textContent =
          settings.gallery.title;


      if (grid) {

        grid.innerHTML =
          settings.gallery.images
            .map(
              (
                image,
                index
              ) => `

                <div
                  class="social-gallery-item"
                >

                  <img
                    src="${escapeHtml(
                      image
                    )}"
                    alt="GLOVAERA visual ${
                      index + 1
                    }"
                    style="
                      object-fit:${
                        settings.gallery.imageFit
                      };
                    "
                  >

                </div>

              `
            )
            .join('');

      }

    }


    /* FAQ */

    const faqSection =
      [...main.querySelectorAll(
        'section'
      )].find(
        section =>
          section.querySelector(
            '.faq-list'
          )
      );


    if (faqSection) {

      faqSection.hidden =
        settings.faq.enabled ===
        false;


      const eyebrow =
        faqSection.querySelector(
          '.eyebrow'
        );

      const title =
        faqSection.querySelector(
          'h2'
        );

      const list =
        faqSection.querySelector(
          '.faq-list'
        );


      if (eyebrow)
        eyebrow.textContent =
          settings.faq.eyebrow;


      if (title)
        title.textContent =
          settings.faq.title;


      if (list) {

        list.innerHTML =
          settings.faq.items
            .map(
              (
                item,
                index
              ) => `

                <details
                  ${
                    index ===
                    0
                      ? 'open'
                      : ''
                  }
                >

                  <summary>

                    <span>
                      ${escapeHtml(
                        item.question
                      )}
                    </span>

                    <b>
                      +
                    </b>

                  </summary>

                  <div
                    class="faq-answer"
                  >
                    ${escapeHtml(
                      item.answer
                    )}
                  </div>

                </details>

              `
            )
            .join('');

      }

    }

  }


  function applyGlobalDesign() {

    document.body.style.fontSize =
      `${Number(
        settings.design.bodySize
      ) || 16}px`;


    document
      .querySelectorAll(
        '.btn'
      )
      .forEach(
        button => {

          button.style.borderRadius =
            `${Number(
              settings.design.buttonRadius
            ) || 9}px`;

        }
      );


    document
      .querySelectorAll(
        '.category-card, .product-image-wrap, .combo-card, .faq-list details'
      )
      .forEach(
        element => {

          element.style.borderRadius =
            `${Number(
              settings.design.cardRadius
            ) || 14}px`;

        }
      );


    document
      .querySelectorAll(
        '.product-grid'
      )
      .forEach(
        grid => {

          grid.style.gridTemplateColumns =
            `repeat(
              ${
                Number(
                  settings.design.productColumns
                ) || 4
              },
              minmax(0,1fr)
            )`;

        }
      );

  }


  async function loadSettings() {

    if (!client)
      return;


    const {
      data,
      error
    } =
      await client
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

      console.warn(
        'Site settings:',
        error
      );

      return;

    }


    if (data?.settings) {

      applySettings(
        data.settings
      );

    }

  }


  async function uploadImage(
    folder
  ) {

    if (!client) {

      throw new Error(
        'Supabase is not connected.'
      );

    }


    return new Promise(
      (
        resolve,
        reject
      ) => {

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


            if (!file)
              return;


            try {

              const safe =
                file.name.replace(
                  /[^a-zA-Z0-9._-]/g,
                  '-'
                );


              const path =
                `${folder}/${crypto.randomUUID()}-${safe}`;


              const result =
                await client
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
                  );


              if (
                result.error
              ) {

                throw result.error;

              }


              const url =
                client
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
            ) {

              reject(
                error
              );

            }

          };


        input.click();

      }
    );

  }


  /* =====================================================
     ADMIN EDITOR
     ===================================================== */


  function buildAdminEditor() {

    const root =
      document.getElementById(
        'websiteEditorRoot'
      );


    if (!root)
      return;


    root.innerHTML = `

      <div class="site-editor-shell">


        <div class="site-editor-head">

          <div>

            <span class="eyebrow">
              WEBSITE CUSTOMIZER
            </span>

            <h2>
              Edit GLOVAERA
            </h2>

            <p>
              Current design থাকবে default।
              তুমি চাইলে যেকোনো অংশ পরে change করতে পারবে।
            </p>

          </div>


          <div class="site-editor-save-wrap">

            <span
              id="siteEditorStatus"
              class="site-editor-status"
            >
              Ready
            </span>

            <button
              id="saveSiteEditor"
              class="btn btn-primary"
              type="button"
            >
              Save website
            </button>

          </div>

        </div>


        <div class="site-editor-layout">


          <!-- LEFT MENU -->

          <aside
            class="site-editor-sidebar"
          >

            <button
              class="editor-nav active"
              data-editor-page="homepage"
              type="button"
            >
              🏠 Homepage
            </button>


            <button
              class="editor-nav"
              data-editor-page="fullsite"
              type="button"
            >
              🌐 Full Website
            </button>


            <div
              class="editor-sidebar-divider"
            ></div>


            <button
              class="editor-nav"
              data-editor-page="brand"
              type="button"
            >
              ✦ Brand
            </button>


            <button
              class="editor-nav"
              data-editor-page="header"
              type="button"
            >
              🧭 Header
            </button>


            <button
              class="editor-nav"
              data-editor-page="hero"
              type="button"
            >
              ✨ Hero
            </button>


            <button
              class="editor-nav"
              data-editor-page="categories"
              type="button"
            >
              🗂 Categories
            </button>


            <button
              class="editor-nav"
              data-editor-page="gallery"
              type="button"
            >
              🖼 Follow the Edit
            </button>


            <button
              class="editor-nav"
              data-editor-page="combo"
              type="button"
            >
              💎 Featured Combo
            </button>


            <button
              class="editor-nav"
              data-editor-page="faq"
              type="button"
            >
              ❓ FAQ
            </button>


            <button
              class="editor-nav"
              data-editor-page="about"
              type="button"
            >
              💖 About
            </button>


            <button
              class="editor-nav"
              data-editor-page="design"
              type="button"
            >
              🎨 Design
            </button>


          </aside>


          <!-- RIGHT -->

          <div
            id="siteEditorPanel"
            class="site-editor-panel"
          ></div>


        </div>

      </div>

    `;


    document
      .querySelectorAll(
        '.editor-nav'
      )
      .forEach(
        button => {

          button.addEventListener(
            'click',
            () => {

              document
                .querySelectorAll(
                  '.editor-nav'
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


              activeEditor =
                button.dataset
                  .editorPage;


              renderEditorPanel();

            }
          );

        }
      );


    document
      .getElementById(
        'saveSiteEditor'
      )
      .addEventListener(
        'click',
        saveSettings
      );


    renderEditorPanel();

  }


  function field(
    label,
    html
  ) {

    return `

      <label
        class="editor-field"
      >

        <span>
          ${label}
        </span>

        ${html}

      </label>

    `;

  }


  function textInput(
    id,
    value
  ) {

    return `
      <input
        id="${id}"
        type="text"
        value="${escapeHtml(
          value || ''
        )}"
      >
    `;

  }


  function numberInput(
    id,
    value,
    min=0,
    max=9999
  ) {

    return `
      <input
        id="${id}"
        type="number"
        min="${min}"
        max="${max}"
        value="${
          Number(
            value || 0
          )
        }"
      >
    `;

  }


  function textarea(
    id,
    value,
    rows=4
  ) {

    return `
      <textarea
        id="${id}"
        rows="${rows}"
      >${escapeHtml(
        value || ''
      )}</textarea>
    `;

  }


  function select(
    id,
    value,
    options
  ) {

    return `
      <select id="${id}">

        ${
          options
            .map(
              option => `

                <option
                  value="${escapeHtml(
                    option
                  )}"
                  ${
                    option ===
                    value
                      ? 'selected'
                      : ''
                  }
                >
                  ${escapeHtml(
                    option
                  )}
                </option>

              `
            )
            .join('')
        }

      </select>
    `;

  }


  function toggle(
    id,
    value
  ) {

    return `
      <select id="${id}">

        <option
          value="true"
          ${
            value === true
              ? 'selected'
              : ''
          }
        >
          Show
        </option>

        <option
          value="false"
          ${
            value === false
              ? 'selected'
              : ''
          }
        >
          Hide
        </option>

      </select>
    `;

  }


  function sectionCard(
    title,
    description,
    content
  ) {

    return `

      <section
        class="editor-card"
      >

        <div
          class="editor-card-head"
        >

          <div>

            <h3>
              ${title}
            </h3>

            ${
              description
                ? `
                  <p>
                    ${description}
                  </p>
                `
                : ''
            }

          </div>

        </div>


        ${content}

      </section>

    `;

  }


  function renderEditorPanel() {

    const panel =
      document.getElementById(
        'siteEditorPanel'
      );


    if (!panel)
      return;


    if (
      activeEditor ===
      'homepage'
    ) {

      panel.innerHTML =
        sectionCard(
          '🏠 Homepage Editor',
          'Homepage-এর content ও major sections এখানে manage করো.',
          `

            <div
              class="editor-quick-grid"
            >

              <button
                class="editor-jump"
                data-jump="hero"
                type="button"
              >
                ✨ Hero
              </button>

              <button
                class="editor-jump"
                data-jump="categories"
                type="button"
              >
                🗂 Categories
              </button>

              <button
                class="editor-jump"
                data-jump="gallery"
                type="button"
              >
                🖼 Gallery
              </button>

              <button
                class="editor-jump"
                data-jump="combo"
                type="button"
              >
                💎 Combo
              </button>

              <button
                class="editor-jump"
                data-jump="faq"
                type="button"
              >
                ❓ FAQ
              </button>

              <button
                class="editor-jump"
                data-jump="about"
                type="button"
              >
                💖 About
              </button>

            </div>

          `
        ) +

        sectionCard(
          '📢 Announcement',
          'Top notification bar.',
          `
            <div
              class="editor-grid"
            >

              ${field(
                'Show announcement',
                toggle(
                  'announcementEnabled',
                  settings.announcement.enabled
                )
              )}

              ${field(
                'Announcement text',
                textInput(
                  'announcementText',
                  settings.announcement.text
                )
              )}

            </div>
          `
        );

    }


    if (
      activeEditor ===
      'fullsite'
    ) {

      panel.innerHTML =
        sectionCard(
          '🌐 Full Website',
          'Brand, header এবং পুরো website-এর global controls.',
          `

            <div
              class="editor-feature-grid"
            >

              <button
                class="editor-feature"
                data-jump="brand"
                type="button"
              >
                <b>✦ Brand</b>
                <span>
                  Logo, name, favicon
                </span>
              </button>


              <button
                class="editor-feature"
                data-jump="header"
                type="button"
              >
                <b>🧭 Header</b>
                <span>
                  Logo size, header height
                </span>
              </button>


              <button
                class="editor-feature"
                data-jump="design"
                type="button"
              >
                <b>🎨 Design</b>
                <span>
                  Color, size, spacing
                </span>
              </button>


              <button
                class="editor-feature"
                data-jump="faq"
                type="button"
              >
                <b>❓ FAQ</b>
                <span>
                  Questions & answers
                </span>
              </button>

            </div>

            <div
              class="editor-info-box"
            >
              Current design values are used
              as the default, so nothing changes
              until you save a customization.
            </div>

          `
        );

    }


    if (
      activeEditor ===
      'brand'
    ) {

      panel.innerHTML =
        sectionCard(
          '✦ Brand',
          'Website-এর identity.',
          `

            <div
              class="editor-grid"
            >

              ${field(
                'Brand name',
                textInput(
                  'brandName',
                  settings.branding.brandName
                )
              )}

              ${field(
                'Tagline',
                textInput(
                  'brandTagline',
                  settings.branding.tagline
                )
              )}

              ${field(
                'Logo URL',
                textInput(
                  'brandLogo',
                  settings.branding.logo
                )
              )}

              ${field(
                'Favicon URL',
                textInput(
                  'brandFavicon',
                  settings.branding.favicon
                )
              )}

            </div>


            <div
              class="editor-upload-row"
            >

              <button
                id="uploadBrandLogo"
                class="btn btn-secondary small"
                type="button"
              >
                Upload logo
              </button>


              <button
                id="uploadFavicon"
                class="btn btn-secondary small"
                type="button"
              >
                Upload favicon
              </button>

            </div>

          `
        );

    }


    if (
      activeEditor ===
      'header'
    ) {

      panel.innerHTML =
        sectionCard(
          '🧭 Header',
          'Header-এর size ও visual settings.',
          `

            <div
              class="editor-grid"
            >

              ${field(
                'Logo width',
                numberInput(
                  'logoWidth',
                  settings.header.logoWidth,
                  80,
                  300
                )
              )}

              ${field(
                'Header height',
                numberInput(
                  'headerHeight',
                  settings.header.headerHeight,
                  60,
                  130
                )
              )}

            </div>

          `
        );

    }


    if (
      activeEditor ===
      'hero'
    ) {

      panel.innerHTML =
        sectionCard(
          '✨ Hero',
          'Homepage-এর প্রথম বড় section.',
          `

            <div
              class="editor-grid"
            >

              ${field(
                'Show Hero',
                toggle(
                  'heroEnabled',
                  settings.hero.enabled
                )
              )}

              ${field(
                'Small heading',
                textInput(
                  'heroEyebrow',
                  settings.hero.eyebrow
                )
              )}

              ${field(
                'Main title',
                textarea(
                  'heroTitle',
                  settings.hero.title,
                  3
                )
              )}

              ${field(
                'Description',
                textarea(
                  'heroDescription',
                  settings.hero.description,
                  5
                )
              )}

              ${field(
                'Button 1 text',
                textInput(
                  'heroButton1Text',
                  settings.hero.button1Text
                )
              )}

              ${field(
                'Button 1 link',
                textInput(
                  'heroButton1Link',
                  settings.hero.button1Link
                )
              )}

              ${field(
                'Button 2 text',
                textInput(
                  'heroButton2Text',
                  settings.hero.button2Text
                )
              )}

              ${field(
                'Button 2 link',
                textInput(
                  'heroButton2Link',
                  settings.hero.button2Link
                )
              )}

              ${field(
                'Image fit',
                select(
                  'heroImageFit',
                  settings.hero.imageFit,
                  [
                    'contain',
                    'cover'
                  ]
                )
              )}

              ${field(
                'Image radius',
                numberInput(
                  'heroImageRadius',
                  settings.hero.imageRadius,
                  0,
                  60
                )
              )}

            </div>


            <div
              class="editor-upload-row"
            >

              <button
                id="uploadHeroImage"
                class="btn btn-secondary small"
                type="button"
              >
                Upload hero image
              </button>

              <span
                class="editor-url"
              >
                ${escapeHtml(
                  settings.hero.image
                )}
              </span>

            </div>

          `
        );

    }


    if (
      activeEditor ===
      'categories'
    ) {

      panel.innerHTML =
        sectionCard(
          '🗂 Categories',
          'Category section-এর layout controls.',
          `

            <div
              class="editor-grid"
            >

              ${field(
                'Small heading',
                textInput(
                  'categoryEyebrow',
                  settings.categories.eyebrow
                )
              )}

              ${field(
                'Title',
                textInput(
                  'categoryTitle',
                  settings.categories.title
                )
              )}

              ${field(
                'Columns',
                numberInput(
                  'categoryColumns',
                  settings.categories.columns,
                  2,
                  8
                )
              )}

              ${field(
                'Gap',
                numberInput(
                  'categoryGap',
                  settings.categories.gap,
                  0,
                  40
                )
              )}

              ${field(
                'Image fit',
                select(
                  'categoryFit',
                  settings.categories.imageFit,
                  [
                    'cover',
                    'contain'
                  ]
                )
              )}

              ${field(
                'Image/card radius',
                numberInput(
                  'categoryRadius',
                  settings.categories.radius,
                  0,
                  40
                )
              )}

            </div>

          `
        );

    }


    if (
      activeEditor ===
      'gallery'
    ) {

      panel.innerHTML =
        sectionCard(
          '🖼 Follow the Edit',
          'Homepage-এর ছবি add, replace, reorder বা delete করো.',
          `

            <div
              class="editor-grid"
            >

              ${field(
                'Show section',
                toggle(
                  'galleryEnabled',
                  settings.gallery.enabled
                )
              )}

              ${field(
                'Small heading',
                textInput(
                  'galleryEyebrow',
                  settings.gallery.eyebrow
                )
              )}

              ${field(
                'Title',
                textInput(
                  'galleryTitle',
                  settings.gallery.title
                )
              )}

              ${field(
                'Columns',
                numberInput(
                  'galleryColumns',
                  settings.gallery.columns,
                  2,
                  6
                )
              )}

              ${field(
                'Image gap',
                numberInput(
                  'galleryGap',
                  settings.gallery.gap,
                  0,
                  40
                )
              )}

              ${field(
                'Image radius',
                numberInput(
                  'galleryRadius',
                  settings.gallery.radius,
                  0,
                  40
                )
              )}

              ${field(
                'Image fit',
                select(
                  'galleryFit',
                  settings.gallery.imageFit,
                  [
                    'cover',
                    'contain'
                  ]
                )
              )}

            </div>


            <div
              class="editor-media-head"
            >

              <strong>
                Homepage gallery
              </strong>

              <button
                id="addGalleryImage"
                class="btn btn-primary small"
                type="button"
              >
                + Add image
              </button>

            </div>


            <div
              id="galleryEditorItems"
              class="gallery-editor-list"
            ></div>

          `
        );


      renderGalleryItems();

    }


    if (
      activeEditor ===
      'combo'
    ) {

      panel.innerHTML =
        sectionCard(
          '💎 Featured Combo',
          'Homepage-এর burgundy combo section.',
          `

            <div
              class="editor-grid"
            >

              ${field(
                'Show section',
                toggle(
                  'comboEnabled',
                  settings.combo.enabled
                )
              )}

              ${field(
                'Eyebrow',
                textInput(
                  'comboEyebrow',
                  settings.combo.eyebrow
                )
              )}

              ${field(
                'Title',
                textarea(
                  'comboTitle',
                  settings.combo.title,
                  3
                )
              )}

              ${field(
                'Description',
                textarea(
                  'comboDescription',
                  settings.combo.description,
                  5
                )
              )}

              ${field(
                'Badge',
                textInput(
                  'comboBadge',
                  settings.combo.badge
                )
              )}

              ${field(
                'Product name',
                textInput(
                  'comboProductTitle',
                  settings.combo.productTitle
                )
              )}

              ${field(
                'Product details',
                textInput(
                  'comboProductDescription',
                  settings.combo.productDescription
                )
              )}

              ${field(
                'Price',
                textInput(
                  'comboPrice',
                  settings.combo.price
                )
              )}

              ${field(
                'Button text',
                textInput(
                  'comboButtonText',
                  settings.combo.buttonText
                )
              )}

              ${field(
                'Button link',
                textInput(
                  'comboButtonLink',
                  settings.combo.buttonLink
                )
              )}

            </div>


            <div
              class="editor-upload-row"
            >

              <button
                id="uploadComboImage"
                class="btn btn-secondary small"
                type="button"
              >
                Upload combo image
              </button>

              <span
                class="editor-url"
              >
                ${escapeHtml(
                  settings.combo.image ||
                  'No image'
                )}
              </span>

            </div>

          `
        );

    }


    if (
      activeEditor ===
      'faq'
    ) {

      panel.innerHTML =
        sectionCard(
          '❓ FAQ',
          'Question/answer add, edit, delete এবং reorder.',
          `

            <div
              class="editor-grid"
            >

              ${field(
                'Show FAQ',
                toggle(
                  'faqEnabled',
                  settings.faq.enabled
                )
              )}

              ${field(
                'Small heading',
                textInput(
                  'faqEyebrow',
                  settings.faq.eyebrow
                )
              )}

              ${field(
                'Title',
                textInput(
                  'faqTitle',
                  settings.faq.title
                )
              )}

            </div>


            <div
              class="editor-media-head"
            >

              <strong>
                FAQ items
              </strong>

              <button
                id="addFaqItem"
                class="btn btn-primary small"
                type="button"
              >
                + Add FAQ
              </button>

            </div>


            <div
              id="faqEditorItems"
              class="faq-editor-list"
            ></div>

          `
        );


      renderFaqItems();

    }


    if (
      activeEditor ===
      'about'
    ) {

      panel.innerHTML =
        sectionCard(
          '💖 About',
          'Brand story and three feature labels.',
          `

            <div
              class="editor-grid"
            >

              ${field(
                'Small heading',
                textInput(
                  'aboutEyebrow',
                  settings.about.eyebrow
                )
              )}

              ${field(
                'Title',
                textarea(
                  'aboutTitle',
                  settings.about.title,
                  3
                )
              )}

              ${field(
                'Description',
                textarea(
                  'aboutDescription',
                  settings.about.description,
                  6
                )
              )}

              ${field(
                'Feature 1',
                textInput(
                  'aboutFeature1',
                  settings.about.feature1
                )
              )}

              ${field(
                'Feature 2',
                textInput(
                  'aboutFeature2',
                  settings.about.feature2
                )
              )}

              ${field(
                'Feature 3',
                textInput(
                  'aboutFeature3',
                  settings.about.feature3
                )
              )}

            </div>

          `
        );

    }


    if (
      activeEditor ===
      'design'
    ) {

      panel.innerHTML =
        sectionCard(
          '🎨 Design',
          'Advanced controls. Current values are the default.',
          `

            <div
              class="editor-grid"
            >

              ${field(
                'Burgundy',
                `<input id="designBurgundy" type="color" value="${settings.design.burgundy}">`
              )}

              ${field(
                'Dark Burgundy',
                `<input id="designDarkBurgundy" type="color" value="${settings.design.darkBurgundy}">`
              )}

              ${field(
                'Gold',
                `<input id="designGold" type="color" value="${settings.design.gold}">`
              )}

              ${field(
                'Light Gold',
                `<input id="designLightGold" type="color" value="${settings.design.lightGold}">`
              )}

              ${field(
                'Background',
                `<input id="designIvory" type="color" value="${settings.design.ivory}">`
              )}

              ${field(
                'Container width',
                numberInput(
                  'designContainerWidth',
                  settings.design.containerWidth,
                  900,
                  1400
                )
              )}

              ${field(
                'Section spacing',
                numberInput(
                  'designSectionPadding',
                  settings.design.sectionPadding,
                  40,
                  160
                )
              )}

              ${field(
                'Product columns',
                numberInput(
                  'designProductColumns',
                  settings.design.productColumns,
                  2,
                  6
                )
              )}

              ${field(
                'Body text size',
                numberInput(
                  'designBodySize',
                  settings.design.bodySize,
                  13,
                  22
                )
              )}

              ${field(
                'Button radius',
                numberInput(
                  'designButtonRadius',
                  settings.design.buttonRadius,
                  0,
                  30
                )
              )}

              ${field(
                'Card radius',
                numberInput(
                  'designCardRadius',
                  settings.design.cardRadius,
                  0,
                  30
                )
              )}

            </div>

          `
        );

    }


    wireEditorButtons();

  }


  function wireEditorButtons() {

    document
      .querySelectorAll(
        '[data-jump]'
      )
      .forEach(
        button => {

          button.onclick =
            () => {

              const target =
                button.dataset
                  .jump;


              activeEditor =
                target;


              document
                .querySelectorAll(
                  '.editor-nav'
                )
                .forEach(
                  nav => {

                    nav.classList.toggle(
                      'active',
                      nav.dataset
                        .editorPage ===
                        target
                    );

                  }
                );


              renderEditorPanel();

            };

        }
      );


    document
      .getElementById(
        'addGalleryImage'
      )
      ?.addEventListener(
        'click',
        async () => {

          try {

            const url =
              await uploadImage(
                'homepage'
              );


            settings.gallery.images
              .push(
                url
              );


            renderGalleryItems();

          } catch (
            error
          ) {

            alert(
              error.message
            );

          }

        }
      );


    document
      .getElementById(
        'uploadBrandLogo'
      )
      ?.addEventListener(
        'click',
        async () => {

          try {

            settings.branding.logo =
              await uploadImage(
                'branding'
              );

            renderEditorPanel();

          } catch (
            error
          ) {

            alert(
              error.message
            );

          }

        }
      );


    document
      .getElementById(
        'uploadFavicon'
      )
      ?.addEventListener(
        'click',
        async () => {

          try {

            settings.branding.favicon =
              await uploadImage(
                'branding'
              );

            renderEditorPanel();

          } catch (
            error
          ) {

            alert(
              error.message
            );

          }

        }
      );


    document
      .getElementById(
        'uploadHeroImage'
      )
      ?.addEventListener(
        'click',
        async () => {

          try {

            settings.hero.image =
              await uploadImage(
                'hero'
              );

            renderEditorPanel();

          } catch (
            error
          ) {

            alert(
              error.message
            );

          }

        }
      );


    document
      .getElementById(
        'uploadComboImage'
      )
      ?.addEventListener(
        'click',
        async () => {

          try {

            settings.combo.image =
              await uploadImage(
                'combo'
              );

            renderEditorPanel();

          } catch (
            error
          ) {

            alert(
              error.message
            );

          }

        }
      );


    document
      .getElementById(
        'addFaqItem'
      )
      ?.addEventListener(
        'click',
        () => {

          settings.faq.items.push({
            question:
              'New question',
            answer:
              'Write the answer here.'
          });


          renderFaqItems();

        }
      );

  }


  function renderGalleryItems() {

    const box =
      document.getElementById(
        'galleryEditorItems'
      );


    if (!box)
      return;


    box.innerHTML =
      settings.gallery.images
        .map(
          (
            url,
            index
          ) => `

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


    box
      .querySelectorAll(
        '[data-gallery-replace]'
      )
      .forEach(
        button => {

          button.onclick =
            async () => {

              try {

                const url =
                  await uploadImage(
                    'homepage'
                  );


                const index =
                  Number(
                    button.dataset
                      .galleryReplace
                  );


                settings.gallery
                  .images[index] =
                  url;


                renderGalleryItems();

              } catch (
                error
              ) {

                alert(
                  error.message
                );

              }

            };

        }
      );


    box
      .querySelectorAll(
        '[data-gallery-up]'
      )
      .forEach(
        button => {

          button.onclick =
            () => {

              const index =
                Number(
                  button.dataset
                    .galleryUp
                );


              if (
                index >
                0
              ) {

                const list =
                  settings.gallery
                    .images;


                [
                  list[index],
                  list[index - 1]
                ] =
                [
                  list[index - 1],
                  list[index]
                ];


                renderGalleryItems();

              }

            };

        }
      );


    box
      .querySelectorAll(
        '[data-gallery-down]'
      )
      .forEach(
        button => {

          button.onclick =
            () => {

              const index =
                Number(
                  button.dataset
                    .galleryDown
                );


              const list =
                settings.gallery
                  .images;


              if (
                index <
                list.length - 1
              ) {

                [
                  list[index],
                  list[index + 1]
                ] =
                [
                  list[index + 1],
                  list[index]
                ];


                renderGalleryItems();

              }

            };

        }
      );


    box
      .querySelectorAll(
        '[data-gallery-delete]'
      )
      .forEach(
        button => {

          button.onclick =
            () => {

              const index =
                Number(
                  button.dataset
                    .galleryDelete
                );


              settings.gallery
                .images.splice(
                  index,
                  1
                );


              renderGalleryItems();

            };

        }
      );

  }


  function renderFaqItems() {

    const box =
      document.getElementById(
        'faqEditorItems'
      );


    if (!box)
      return;


    box.innerHTML =
      settings.faq.items
        .map(
          (
            item,
            index
          ) => `

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
                  data-faq-question="${index}"
                  value="${escapeHtml(
                    item.question
                  )}"
                >


                <textarea
                  rows="4"
                  data-faq-answer="${index}"
                >${escapeHtml(
                  item.answer
                )}</textarea>


                <div
                  class="gallery-actions"
                >

                  <button
                    class="btn btn-secondary small"
                    data-faq-up="${index}"
                    type="button"
                  >
                    ↑
                  </button>


                  <button
                    class="btn btn-secondary small"
                    data-faq-down="${index}"
                    type="button"
                  >
                    ↓
                  </button>


                  <button
                    class="btn btn-danger small"
                    data-faq-delete="${index}"
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


    box
      .querySelectorAll(
        '[data-faq-delete]'
      )
      .forEach(
        button => {

          button.onclick =
            () => {

              const index =
                Number(
                  button.dataset
                    .faqDelete
                );


              settings.faq.items
                .splice(
                  index,
                  1
                );


              renderFaqItems();

            };

        }
      );


    box
      .querySelectorAll(
        '[data-faq-up]'
      )
      .forEach(
        button => {

          button.onclick =
            () => {

              const index =
                Number(
                  button.dataset
                    .faqUp
                );


              if (
                index >
                0
              ) {

                const list =
                  settings.faq.items;


                [
                  list[index],
                  list[index - 1]
                ] =
                [
                  list[index - 1],
                  list[index]
                ];


                renderFaqItems();

              }

            };

        }
      );


    box
      .querySelectorAll(
        '[data-faq-down]'
      )
      .forEach(
        button => {

          button.onclick =
            () => {

              const index =
                Number(
                  button.dataset
                    .faqDown
                );


              const list =
                settings.faq.items;


              if (
                index <
                list.length - 1
              ) {

                [
                  list[index],
                  list[index + 1]
                ] =
                [
                  list[index + 1],
                  list[index]
                ];


                renderFaqItems();

              }

            };

        }
      );

  }


  function readEditorValues() {

    function value(
      id
    ) {

      return document.getElementById(
        id
      )?.value;

    }


    if (
      activeEditor ===
      'homepage'
    ) {

      settings.announcement.enabled =
        value(
          'announcementEnabled'
        ) ===
        'true';

      settings.announcement.text =
        value(
          'announcementText'
        ) ||
        '';

    }


    if (
      activeEditor ===
      'brand'
    ) {

      settings.branding.brandName =
        value(
          'brandName'
        ) || '';

      settings.branding.tagline =
        value(
          'brandTagline'
        ) || '';

      settings.branding.logo =
        value(
          'brandLogo'
        ) || 'logo.png';

      settings.branding.favicon =
        value(
          'brandFavicon'
        ) || 'favicon.png';

    }


    if (
      activeEditor ===
      'header'
    ) {

      settings.header.logoWidth =
        Number(
          value(
            'logoWidth'
          )
        );

      settings.header.headerHeight =
        Number(
          value(
            'headerHeight'
          )
        );

    }


    if (
      activeEditor ===
      'hero'
    ) {

      settings.hero.enabled =
        value(
          'heroEnabled'
        ) === 'true';

      settings.hero.eyebrow =
        value(
          'heroEyebrow'
        );

      settings.hero.title =
        value(
          'heroTitle'
        );

      settings.hero.description =
        value(
          'heroDescription'
        );

      settings.hero.button1Text =
        value(
          'heroButton1Text'
        );

      settings.hero.button1Link =
        value(
          'heroButton1Link'
        );

      settings.hero.button2Text =
        value(
          'heroButton2Text'
        );

      settings.hero.button2Link =
        value(
          'heroButton2Link'
        );

      settings.hero.imageFit =
        value(
          'heroImageFit'
        );

      settings.hero.imageRadius =
        Number(
          value(
            'heroImageRadius'
          )
        );

    }


    if (
      activeEditor ===
      'categories'
    ) {

      settings.categories.eyebrow =
        value(
          'categoryEyebrow'
        );

      settings.categories.title =
        value(
          'categoryTitle'
        );

      settings.categories.columns =
        Number(
          value(
            'categoryColumns'
          )
        );

      settings.categories.gap =
        Number(
          value(
            'categoryGap'
          )
        );

      settings.categories.imageFit =
        value(
          'categoryFit'
        );

      settings.categories.radius =
        Number(
          value(
            'categoryRadius'
          )
        );

    }


    if (
      activeEditor ===
      'gallery'
    ) {

      settings.gallery.enabled =
        value(
          'galleryEnabled'
        ) === 'true';

      settings.gallery.eyebrow =
        value(
          'galleryEyebrow'
        );

      settings.gallery.title =
        value(
          'galleryTitle'
        );

      settings.gallery.columns =
        Number(
          value(
            'galleryColumns'
          )
        );

      settings.gallery.gap =
        Number(
          value(
            'galleryGap'
          )
        );

      settings.gallery.radius =
        Number(
          value(
            'galleryRadius'
          )
        );

      settings.gallery.imageFit =
        value(
          'galleryFit'
        );

    }


    if (
      activeEditor ===
      'combo'
    ) {

      settings.combo.enabled =
        value(
          'comboEnabled'
        ) === 'true';

      settings.combo.eyebrow =
        value(
          'comboEyebrow'
        );

      settings.combo.title =
        value(
          'comboTitle'
        );

      settings.combo.description =
        value(
          'comboDescription'
        );

      settings.combo.badge =
        value(
          'comboBadge'
        );

      settings.combo.productTitle =
        value(
          'comboProductTitle'
        );

      settings.combo.productDescription =
        value(
          'comboProductDescription'
        );

      settings.combo.price =
        value(
          'comboPrice'
        );

      settings.combo.buttonText =
        value(
          'comboButtonText'
        );

      settings.combo.buttonLink =
        value(
          'comboButtonLink'
        );

    }


    if (
      activeEditor ===
      'faq'
    ) {

      settings.faq.enabled =
        value(
          'faqEnabled'
        ) === 'true';

      settings.faq.eyebrow =
        value(
          'faqEyebrow'
        );

      settings.faq.title =
        value(
          'faqTitle'
        );


      settings.faq.items =
        settings.faq.items.map(
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
                q?.value ||
                '',

              answer:
                a?.value ||
                ''

            };

          }
        );

    }


    if (
      activeEditor ===
      'about'
    ) {

      settings.about.eyebrow =
        value(
          'aboutEyebrow'
        );

      settings.about.title =
        value(
          'aboutTitle'
        );

      settings.about.description =
        value(
          'aboutDescription'
        );

      settings.about.feature1 =
        value(
          'aboutFeature1'
        );

      settings.about.feature2 =
        value(
          'aboutFeature2'
        );

      settings.about.feature3 =
        value(
          'aboutFeature3'
        );

    }


    if (
      activeEditor ===
      'design'
    ) {

      settings.design.burgundy =
        value(
          'designBurgundy'
        );

      settings.design.darkBurgundy =
        value(
          'designDarkBurgundy'
        );

      settings.design.gold =
        value(
          'designGold'
        );

      settings.design.lightGold =
        value(
          'designLightGold'
        );

      settings.design.ivory =
        value(
          'designIvory'
        );

      settings.design.containerWidth =
        Number(
          value(
            'designContainerWidth'
          )
        );

      settings.design.sectionPadding =
        Number(
          value(
            'designSectionPadding'
          )
        );

      settings.design.productColumns =
        Number(
          value(
            'designProductColumns'
          )
        );

      settings.design.bodySize =
        Number(
          value(
            'designBodySize'
          )
        );

      settings.design.buttonRadius =
        Number(
          value(
            'designButtonRadius'
          )
        );

      settings.design.cardRadius =
        Number(
          value(
            'designCardRadius'
          )
        );

    }

  }


  async function saveSettings() {

    readEditorValues();


    if (!client) {

      alert(
        'Supabase connection পাওয়া যাচ্ছে না।'
      );

      return;

    }


    const button =
      document.getElementById(
        'saveSiteEditor'
      );

    const status =
      document.getElementById(
        'siteEditorStatus'
      );


    button.disabled =
      true;

    button.textContent =
      'Saving...';

    status.textContent =
      'Saving...';


    try {

      const {
        error
      } =
      await client
        .from(
          'site_settings'
        )
        .upsert(
          {
            id:
              'global',

            settings:
              settings,

            updated_at:
              new Date()
                .toISOString()
          },
          {
            onConflict:
              'id'
          }
        );


      if (error)
        throw error;


      applySettings(
        settings
      );


      status.textContent =
        'Saved ✓';

      button.textContent =
        'Save website';


      setTimeout(
        () => {

          status.textContent =
            'Ready';

        },
        1800
      );


      /*
        Homepage section-specific
        values that are currently
        controlled by existing app.js
        are refreshed on reload.
      */


    } catch (
      error
    ) {

      console.error(
        error
      );


      status.textContent =
        'Failed';


      button.textContent =
        'Save website';


      alert(
        `Save failed: ${
          error.message
        }`
      );

    } finally {

      button.disabled =
        false;

    }

  }


  function waitForAdmin() {

    const root =
      document.getElementById(
        'websiteEditorRoot'
      );


    if (root) {

      if (
        !root.dataset
          .initialized
      ) {

        root.dataset
          .initialized =
          'true';

        buildAdminEditor();

      }

    }

  }


  function init() {

    loadSettings();


    if (
      document.body
        .classList
        .contains(
          'admin-body'
        )
    ) {

      waitForAdmin();


      document
        .addEventListener(
          'click',
          event => {

            const tab =
              event.target.closest(
                '[data-tab="website-editor"]'
              );


            if (tab) {

              waitForAdmin();

            }

          }
        );

    }

  }


  if (
    document.readyState ===
    'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      init
    );

  } else {

    init();

  }


  window.GLOVAERA_SITE_EDITOR = {

    getSettings:
      () =>
        deepMerge(
          DEFAULTS,
          settings
        ),

    applySettings

  };

})();
