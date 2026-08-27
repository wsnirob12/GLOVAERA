// GLOVAERA configuration
// Never put your Supabase service_role or secret key in this file or in frontend code.
window.GLOVAERA_CONFIG = {
  supabaseUrl: 'https://pabyiyggcwkpekjymhtx.supabase.co',
  supabaseAnonKey: 'sb_publishable_UXW0Rgop5YeKd4jpXI7YKw_rvyUZEhs',
  currency: '৳',
  deliveryDhaka: 60,
  deliveryOutsideDhaka: 120
};

/* Load the website editor on storefront pages. */
window.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    if (document.querySelector('script[src="site-editor.js"]')) return;
    var script = document.createElement('script');
    script.src = 'site-editor.js';
    script.async = false;
    document.body.appendChild(script);
  }, 0);
});

/* Product gallery + optional Color / Size / Type controls. */
window.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    if (location.pathname.endsWith('/product.html') || location.pathname.endsWith('/product')) {
      var productScript = document.createElement('script');
      productScript.src = 'product-enhancer.js';
      productScript.async = false;
      document.body.appendChild(productScript);
    }
    if (location.pathname.endsWith('/admin.html') || location.pathname.endsWith('/admin')) {
      var adminProductScript = document.createElement('script');
      adminProductScript.src = 'admin-product-enhancer.js';
      adminProductScript.async = false;
      document.body.appendChild(adminProductScript);
    }
  }, 250);
});
