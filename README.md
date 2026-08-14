# GLOVAERA e-commerce starter

This is a production-minded starter storefront + Supabase admin dashboard for GLOVAERA.

## What you get
- Premium burgundy / champagne / ivory visual system based on the provided GLOVAERA logo.
- Home, shop, product, cart and COD checkout pages.
- Supabase-backed products, categories and orders.
- Admin email/password login via Supabase Auth.
- Admin CRUD for products and categories.
- Product image uploads into a Supabase Storage bucket.
- Order status management.
- Row Level Security policies.
- Safe order submission function that uses database prices and stock.
- Mobile-responsive UI.

## Important
Do not put the Supabase `service_role` key in frontend code. Only the public anon key belongs in `config.js`.

## Connect your Supabase project
1. Open Supabase Dashboard -> your project -> SQL Editor.
2. Paste and run all of `supabase_schema.sql`.
3. Go to Authentication -> Users -> Add user. Create the email/password you will use as your GLOVAERA admin account.
4. Copy that user's UUID.
5. In SQL Editor run:

```sql
insert into public.admins(user_id) values ('PASTE-ADMIN-USER-UUID-HERE');
```

6. Go to Project Settings -> API.
7. Copy the Project URL and the `anon` public key.
8. Put them into `config.js`.

Example:

```js
window.GLOVAERA_CONFIG = {
  supabaseUrl: 'https://YOURPROJECT.supabase.co',
  supabaseAnonKey: 'YOUR_ANON_KEY',
  currency: '৳',
  deliveryCharge: 70
};
```

## Deploy on Cloudflare Pages
### Option A: GitHub integration
- Create a GitHub repository named `glovaera`.
- Upload every file in this folder.
- Cloudflare Dashboard -> Workers & Pages -> Create application -> Pages -> Connect to Git.
- Choose the GitHub repository.
- For a plain HTML/CSS/JS site, there is no framework build command. Set the output directory to `/` (or leave it as the root directory, depending on the dashboard UI).
- Deploy.

### Option B: Direct upload
Cloudflare Pages also supports direct upload of the finished files. Upload the contents of this folder as the site assets.

## Free address
Cloudflare Pages will give the project a `*.pages.dev` address.

## Admin
Open `/admin.html` on the deployed site and sign in with the Supabase Auth user you created and added to `public.admins`.

## Before launch
- Replace demo images with your actual product photography.
- Set a real delivery charge.
- Review shipping/returns/privacy/terms text.
- Test checkout and one end-to-end order.
- Turn on MFA for GitHub, Cloudflare and Supabase accounts.
- Do not advertise the store until policies and delivery information are truthful and final.
