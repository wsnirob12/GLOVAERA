// GLOVAERA configuration
// Never put your Supabase service_role or secret key in this file or in frontend code.
window.GLOVAERA_CONFIG = {
  supabaseUrl: 'https://pabyiyggcwkpekjymhtx.supabase.co',
  supabaseAnonKey: 'sb_publishable_UXW0Rgop5YeKd4jpXI7YKw_rvyUZEhs',
  currency: '৳',
  deliveryDhaka: 60,
  deliveryOutsideDhaka: 120
};

/*
  Load the website editor on every page.
  The admin page already includes site-editor.js directly,
  so the guard prevents it from being loaded twice there.

  A short timeout lets app.js initialise the Supabase client
  first, so site-editor.js can use the same client on storefront pages.
*/
window.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    if (document.querySelector('script[src="site-editor.js"]')) {
      return;
    }

    var script = document.createElement('script');
    script.src = 'site-editor.js';
    script.async = false;
    document.body.appendChild(script);
  }, 0);
});
