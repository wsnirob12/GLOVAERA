<!doctype html>
<html lang="en">

<head>

  <meta charset="UTF-8"/>

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>
    GLOVAERA Admin
  </title>

  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap"
    rel="stylesheet"
  />

  <link
    rel="stylesheet"
    href="styles.css"
  />

</head>

<body class="admin-body">

<main class="admin-shell">

  <!-- LOGIN -->
  <section
    id="loginView"
    class="admin-card"
  >

    <img
      src="logo.png"
      class="admin-logo"
      alt="GLOVAERA"
    />

    <h1>
      Admin login
    </h1>

    <p>
      Manage products, categories,
      orders and website content
      without editing code.
    </p>

    <form id="loginForm">

      <label>
        Email

        <input
          required
          type="email"
          name="email"
          autocomplete="email"
        />
      </label>

      <label>
        Password

        <input
          required
          type="password"
          name="password"
          autocomplete="current-password"
        />
      </label>

      <button
        class="btn btn-primary"
        type="submit"
      >
        Sign in
      </button>

      <div
        id="loginMsg"
        class="form-message"
      ></div>

    </form>

  </section>


  <!-- DASHBOARD -->
  <section
    id="dashboardView"
    hidden
  >

    <div class="admin-topbar">

      <div>

        <span class="eyebrow">
          GLOVAERA CONTROL CENTRE
        </span>

        <h1>
          Admin dashboard
        </h1>

      </div>

      <div class="admin-actions">

        <a
          class="btn btn-secondary"
          href="index.html"
        >
          View store
        </a>

        <button
          class="btn btn-dark"
          id="logoutBtn"
          type="button"
        >
          Sign out
        </button>

      </div>

    </div>


    <div class="admin-tabs">

      <button
        class="tab active"
        data-tab="overview"
        type="button"
      >
        Overview
      </button>

      <button
        class="tab"
        data-tab="products"
        type="button"
      >
        Products
      </button>

      <button
        class="tab"
        data-tab="categories"
        type="button"
      >
        Categories
      </button>

      <button
        class="tab"
        data-tab="orders"
        type="button"
      >
        Orders
      </button>

      <button
        class="tab"
        data-tab="editor"
        type="button"
      >
        Site Editor
      </button>

    </div>


    <!-- OVERVIEW -->
    <div
      id="tab-overview"
      class="tab-panel"
    >

      <div
        id="statsGrid"
        class="stats-grid"
      ></div>

    </div>


    <!-- PRODUCTS -->
    <div
      id="tab-products"
      class="tab-panel"
      hidden
    >

      <div class="admin-section-head">

        <h2>
          Products
        </h2>

        <button
          class="btn btn-primary"
          id="addProductBtn"
          type="button"
        >
          + Add product
        </button>

      </div>

      <div
        id="productAdminList"
        class="admin-list"
      ></div>

    </div>


    <!-- CATEGORIES -->
    <div
      id="tab-categories"
      class="tab-panel"
      hidden
    >

      <div class="admin-section-head">

        <h2>
          Categories
        </h2>

        <button
          class="btn btn-primary"
          id="addCategoryBtn"
          type="button"
        >
          + Add category
        </button>

      </div>

      <div
        id="categoryAdminList"
        class="admin-list"
      ></div>

    </div>


    <!-- ORDERS -->
    <div
      id="tab-orders"
      class="tab-panel"
      hidden
    >

      <div class="admin-section-head">

        <h2>
          Orders
        </h2>

        <button
          class="btn btn-secondary"
          id="refreshOrdersBtn"
          type="button"
        >
          Refresh
        </button>

      </div>

      <div
        id="orderAdminList"
        class="admin-list"
      ></div>

    </div>


    <!-- SITE EDITOR -->
    <div
      id="tab-editor"
      class="tab-panel"
      hidden
    >

      <div class="editor-intro">

        <span class="eyebrow">
          WEBSITE CUSTOMIZER
        </span>

        <h2>
          Site Editor
        </h2>

        <p>
          এখান থেকে coding ছাড়াই
          GLOVAERA website-এর
          content, image, color,
          layout এবং FAQ পরিবর্তন করতে পারবে।
        </p>

      </div>


      <!-- GENERAL -->
      <section class="editor-section">

        <div class="editor-section-head">

          <h3>
            📢 Announcement bar
          </h3>

        </div>

        <div class="editor-grid">

          <label class="editor-field">

            <span>
              Show announcement
            </span>

            <select
              id="announcementEnabledInput"
            >

              <option value="true">
                Show
              </option>

              <option value="false">
                Hide
              </option>

            </select>

          </label>

          <label class="editor-field">

            <span>
              Announcement text
            </span>

            <input
              id="announcementTextInput"
              type="text"
            />

          </label>

        </div>

      </section>


      <!-- BRAND -->
      <section class="editor-section">

        <div class="editor-section-head">

          <h3>
            🎨 Brand & layout
          </h3>

        </div>

        <div class="editor-grid">

          <label class="editor-field">
            <span>
              Burgundy
            </span>

            <input
              id="settingBurgundy"
              type="color"
            />
          </label>

          <label class="editor-field">
            <span>
              Dark Burgundy
            </span>

            <input
              id="settingDarkBurgundy"
              type="color"
            />
          </label>

          <label class="editor-field">
            <span>
              Gold
            </span>

            <input
              id="settingGold"
              type="color"
            />
          </label>

          <label class="editor-field">
            <span>
              Light Gold
            </span>

            <input
              id="settingLightGold"
              type="color"
            />
          </label>

          <label class="editor-field">
            <span>
              Background
            </span>

            <input
              id="settingIvory"
              type="color"
            />
          </label>

          <label class="editor-field">
            <span>
              Container width
            </span>

            <input
              id="settingContainerWidth"
              type="number"
              min="900"
              max="1400"
              step="10"
            />
          </label>

          <label class="editor-field">
            <span>
              Section spacing
            </span>

            <input
              id="settingSectionPadding"
              type="number"
              min="40"
              max="160"
            />
          </label>

          <label class="editor-field">
            <span>
              Hero gap
            </span>

            <input
              id="settingHeroGap"
              type="number"
              min="20"
              max="120"
            />
          </label>

        </div>

      </section>


      <!-- HERO -->
      <section class="editor-section">

        <div class="editor-section-head">

          <h3>
            ✨ Homepage Hero
          </h3>

        </div>

        <div class="editor-grid">

          <label class="editor-field">

            <span>
              Show Hero
            </span>

            <select
              id="heroEnabledInput"
            >

              <option value="true">
                Show
              </option>

              <option value="false">
                Hide
              </option>

            </select>

          </label>

          <label class="editor-field">
            <span>
              Small heading
            </span>

            <input
              id="heroEyebrowInput"
              type="text"
            />
          </label>

          <label class="editor-field">
            <span>
              Main title
            </span>

            <textarea
              id="heroTitleInput"
              rows="2"
            ></textarea>
          </label>

          <label class="editor-field">
            <span>
              Description
            </span>

            <textarea
              id="heroDescriptionInput"
              rows="4"
            ></textarea>
          </label>

          <label class="editor-field">
            <span>
              Button 1 text
            </span>

            <input
              id="heroButton1TextInput"
              type="text"
            />
          </label>

          <label class="editor-field">
            <span>
              Button 1 link
            </span>

            <input
              id="heroButton1LinkInput"
              type="text"
            />
          </label>

          <label class="editor-field">
            <span>
              Button 2 text
            </span>

            <input
              id="heroButton2TextInput"
              type="text"
            />
          </label>

          <label class="editor-field">
            <span>
              Button 2 link
            </span>

            <input
              id="heroButton2LinkInput"
              type="text"
            />
          </label>

          <label class="editor-field">
            <span>
              Hero image fit
            </span>

            <select
              id="heroImageFitInput"
            >

              <option value="contain">
                Contain
              </option>

              <option value="cover">
                Cover
              </option>

            </select>
          </label>

        </div>

        <div class="editor-media-list">

          <div class="editor-media-head">

            <strong>
              Hero image
            </strong>

            <button
              type="button"
              class="btn btn-primary small"
              id="uploadHeroImageBtn"
            >
              Upload image
            </button>

          </div>

          <div
            id="heroImagePreview"
            class="admin-image-preview"
          ></div>

        </div>

      </section>


      <!-- CATEGORY -->
      <section class="editor-section">

        <div class="editor-section-head">

          <h3>
            🗂 Category design
          </h3>

          <p>
            Category photo যেন card-এর মধ্যে
            বড় ও professional দেখায়।
          </p>

        </div>

        <div class="editor-grid">

          <label class="editor-field">

            <span>
              Image style
            </span>

            <select
              id="categoryFitInput"
            >

              <option value="cover">
                Fill card
              </option>

              <option value="contain">
                Show full image
              </option>

            </select>

          </label>

          <label class="editor-field">

            <span>
              Card gap
            </span>

            <input
              id="categoryGapInput"
              type="number"
              min="0"
              max="40"
            />

          </label>

        </div>

      </section>


      <!-- FOLLOW -->
      <section class="editor-section">

        <div class="editor-section-head">

          <h3>
            🖼 Follow the edit
          </h3>

        </div>

        <div class="editor-grid">

          <label class="editor-field">

            <span>
              Show section
            </span>

            <select
              id="socialEnabledInput"
            >

              <option value="true">
                Show
              </option>

              <option value="false">
                Hide
              </option>

            </select>

          </label>

          <label class="editor-field">

            <span>
              Small heading
            </span>

            <input
              id="socialEyebrowInput"
              type="text"
            />

          </label>

          <label class="editor-field">

            <span>
              Main title
            </span>

            <input
              id="socialTitleInput"
              type="text"
            />

          </label>

          <label class="editor-field">

            <span>
              Columns
            </span>

            <select
              id="socialColumnsInput"
            >

              <option value="2">
                2
              </option>

              <option value="3">
                3
              </option>

              <option value="4">
                4
              </option>

              <option value="5">
                5
              </option>

              <option value="6">
                6
              </option>

            </select>

          </label>

          <label class="editor-field">

            <span>
              Image gap
            </span>

            <input
              id="socialGapInput"
              type="number"
              min="0"
              max="40"
            />

          </label>

          <label class="editor-field">

            <span>
              Image radius
            </span>

            <input
              id="socialRadiusInput"
              type="number"
              min="0"
              max="40"
            />

          </label>

          <label class="editor-field">

            <span>
              Image fit
            </span>

            <select
              id="socialFitInput"
            >

              <option value="cover">
                Cover
              </option>

              <option value="contain">
                Contain
              </option>

            </select>

          </label>

        </div>


        <div
          class="editor-media-list"
        >

          <div
            class="editor-media-head"
          >

            <strong>
              Homepage gallery
            </strong>

            <button
              type="button"
              class="btn btn-primary small"
              id="addGalleryImageBtn"
            >
              + Add image
            </button>

          </div>

          <div
            id="galleryEditorList"
            class="gallery-editor-list"
          ></div>

        </div>

      </section>


      <!-- COMBO -->
      <section class="editor-section">

        <div class="editor-section-head">

          <h3>
            ✨ Featured Combo
          </h3>

          <p>
            Screenshot-এ যেটা burgundy section,
            সেটা এখান থেকেই সম্পূর্ণ edit করবে।
          </p>

        </div>

        <div class="editor-grid">

          <label class="editor-field">
            <span>
              Show section
            </span>

            <select
              id="comboEnabledInput"
            >

              <option value="true">
                Show
              </option>

              <option value="false">
                Hide
              </option>

            </select>
          </label>

          <label class="editor-field">

            <span>
              Eyebrow
            </span>

            <input
              id="comboEyebrowInput"
              type="text"
            />

          </label>

          <label class="editor-field">

            <span>
              Main heading
            </span>

            <textarea
              id="comboTitleInput"
              rows="2"
            ></textarea>

          </label>

          <label class="editor-field">

            <span>
              Description
            </span>

            <textarea
              id="comboDescriptionInput"
              rows="4"
            ></textarea>

          </label>

          <label class="editor-field">

            <span>
              Badge
            </span>

            <input
              id="comboBadgeInput"
              type="text"
            />

          </label>

          <label class="editor-field">

            <span>
              Combo name
            </span>

            <input
              id="comboProductTitleInput"
              type="text"
            />

          </label>

          <label class="editor-field">

            <span>
              Combo details
            </span>

            <input
              id="comboProductDescriptionInput"
              type="text"
            />

          </label>

          <label class="editor-field">

            <span>
              Price
            </span>

            <input
              id="comboPriceInput"
              type="text"
            />

          </label>

          <label class="editor-field">

            <span>
              Button text
            </span>

            <input
              id="comboButtonTextInput"
              type="text"
            />

          </label>

          <label class="editor-field">

            <span>
              Button link
            </span>

            <input
              id="comboButtonLinkInput"
              type="text"
            />

          </label>

          <label class="editor-field">

            <span>
              Image fit
            </span>

            <select
              id="comboImageFitInput"
            >

              <option value="cover">
                Cover
              </option>

              <option value="contain">
                Contain
              </option>

            </select>

          </label>

        </div>


        <div
          class="editor-media-list"
        >

          <div
            class="editor-media-head"
          >

            <strong>
              Featured Combo Image
            </strong>

            <button
              type="button"
              class="btn btn-primary small"
              id="uploadComboImageBtn"
            >
              Upload image
            </button>

          </div>

          <div
            id="comboImagePreview"
            class="admin-image-preview"
          ></div>

        </div>

      </section>


      <!-- ABOUT -->
      <section class="editor-section">

        <div class="editor-section-head">

          <h3>
            💎 About GLOVAERA
          </h3>

        </div>

        <div class="editor-grid">

          <label class="editor-field">
            <span>
              Small heading
            </span>

            <input
              id="aboutEyebrowInput"
              type="text"
            />
          </label>

          <label class="editor-field">
            <span>
              Title
            </span>

            <textarea
              id="aboutTitleInput"
              rows="2"
            ></textarea>
          </label>

          <label class="editor-field">
            <span>
              Description
            </span>

            <textarea
              id="aboutDescriptionInput"
              rows="5"
            ></textarea>
          </label>

          <label class="editor-field">
            <span>
              Feature 1
            </span>

            <input
              id="aboutFeature1Input"
              type="text"
            />
          </label>

          <label class="editor-field">
            <span>
              Feature 2
            </span>

            <input
              id="aboutFeature2Input"
              type="text"
            />
          </label>

          <label class="editor-field">
            <span>
              Feature 3
            </span>

            <input
              id="aboutFeature3Input"
              type="text"
            />
          </label>

        </div>

      </section>


      <!-- FAQ -->
      <section class="editor-section">

        <div class="editor-section-head">

          <h3>
            ❓ Frequently Asked Questions
          </h3>

        </div>

        <div class="editor-grid">

          <label class="editor-field">
            <span>
              FAQ small heading
            </span>

            <input
              id="faqEyebrowInput"
              type="text"
            />
          </label>

          <label class="editor-field">
            <span>
              FAQ title
            </span>

            <input
              id="faqTitleInput"
              type="text"
            />
          </label>

          <label class="editor-field">
            <span>
              Show FAQ
            </span>

            <select
              id="faqEnabledInput"
            >

              <option value="true">
                Show
              </option>

              <option value="false">
                Hide
              </option>

            </select>

          </label>

        </div>


        <div
          class="faq-editor-list"
          id="faqEditorList"
        ></div>


        <button
          class="btn btn-secondary"
          type="button"
          id="addFaqBtn"
        >
          + Add FAQ
        </button>

      </section>


      <div class="editor-save-bar">

        <div>

          <strong>
            Publish changes
          </strong>

          <span>
            সবকিছু একসাথে save করো।
          </span>

        </div>

        <button
          class="btn btn-primary"
          id="saveSiteSettingsBtn"
          type="button"
        >
          Save website settings
        </button>

      </div>


      <div
        id="editorMessage"
        class="form-message"
      ></div>

    </div>

  </section>

</main>


<div
  id="modal"
  class="modal"
  hidden
>

  <div class="modal-card">

    <button
      class="modal-close"
      id="closeModal"
      type="button"
    >
      ×
    </button>

    <div
      id="modalContent"
    ></div>

  </div>

</div>


<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="config.js"></script>
<script src="app.js"></script>
<script src="admin.js"></script>

</body>
</html>
