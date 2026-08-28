(function () {
  'use strict';
  const client = () => window.glovaera?.client || window.GLOVAERA?.client || null;
  let products = [];
  let settings = { newMode:'auto', bestMode:'auto', newIds:[], bestIds:[], showcase:{enabled:true,eyebrow:'TRENDING NOW',title:'Best picks for you',description:'Our current favourites and best deals.',ratio:'1:1',ids:[]} };
  function esc(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  async function load(){
    const db=client(); if(!db)return;
    const [{data:row}, productResult]=await Promise.all([
      db.from('site_settings').select('settings').eq('id','global').maybeSingle(),
      db.from('products').select('*').eq('active',true).order('created_at',{ascending:false})
    ]);
    const saved=row?.settings?.homepageCollections||{}, s=saved.showcase||{};
    settings={
      newMode:saved.newMode==='custom'?'custom':'auto',bestMode:saved.bestMode==='custom'?'custom':'auto',
      newIds:Array.isArray(saved.newIds)?saved.newIds.map(String):[],bestIds:Array.isArray(saved.bestIds)?saved.bestIds.map(String):[],
      showcase:{enabled:s.enabled!==false,eyebrow:s.eyebrow||'TRENDING NOW',title:s.title||'Best picks for you',description:s.description||'Our current favourites and best deals.',ratio:['1:1','3:4','4:3','16:9'].includes(s.ratio)?s.ratio:'1:1',ids:Array.isArray(s.ids)?s.ids.map(String).slice(0,5):[]}
    };
    products=productResult?.error?[]:(productResult?.data||[]); render();
  }
  function choices(kind){
    const ids=kind==='new'?settings.newIds:settings.bestIds;
    return products.map(p=>{const id=String(p.id),price=Number(p.sale_price??p.price??0),checked=ids.includes(id)?'checked':'';return `<label class="homepage-product-choice"><input type="checkbox" data-home-${kind}="${esc(id)}" ${checked}><img src="${esc(p.image_url||'logo.png')}" alt=""><span><b>${esc(p.name||'Unnamed product')}</b><small>${esc(p.category||'')} · ৳${price.toLocaleString('en-BD')}</small></span></label>`;}).join('');
  }
  function showcaseChoices(){
    const ids=settings.showcase.ids;
    return products.map(p=>{const id=String(p.id),price=Number(p.sale_price??p.price??0),checked=ids.includes(id)?'checked':'';return `<label class="homepage-product-choice"><input type="checkbox" data-showcase-product="${esc(id)}" ${checked}><img src="${esc(p.image_url||'logo.png')}" alt=""><span><b>${esc(p.name||'Unnamed product')}</b><small>${esc(p.category||'')} · ৳${price.toLocaleString('en-BD')}</small></span></label>`;}).join('');
  }
  function render(){
    const root=document.getElementById('homepageProductEditor'); if(!root)return;
    root.innerHTML=`
      <div class="homepage-products-editor-card">
        <div class="homepage-products-editor-head"><div><span class="eyebrow">HOMEPAGE PRODUCTS</span><h3>Choose what customers see</h3><p>New Arrivals ও Best Sellers automatic বা custom রাখতে পারবে। নিচে Featured / Trending Showcase আছে—যখন চাইবে 4–5টা best deal বা trending product বসাবে।</p></div><span id="homepageProductsStatus" class="site-editor-status">Ready</span></div>
        <div class="homepage-products-mode-grid">
          <div class="homepage-products-mode-card"><strong>✨ New Arrivals</strong><label>Show products using<select id="homepageNewMode"><option value="auto" ${settings.newMode==='auto'?'selected':''}>Automatic — latest marked New</option><option value="custom" ${settings.newMode==='custom'?'selected':''}>Custom — I choose products</option></select></label></div>
          <div class="homepage-products-mode-card"><strong>🔥 Best Sellers / Trending</strong><label>Show products using<select id="homepageBestMode"><option value="auto" ${settings.bestMode==='auto'?'selected':''}>Automatic — marked Best Sellers</option><option value="custom" ${settings.bestMode==='custom'?'selected':''}>Custom — I choose products</option></select></label></div>
        </div>
        <div class="homepage-products-custom-grid"><div class="homepage-products-picker"><div class="homepage-products-picker-head"><strong>New Arrivals — custom products</strong><span>Select any products</span></div><div class="homepage-products-choice-list">${choices('new')}</div></div><div class="homepage-products-picker"><div class="homepage-products-picker-head"><strong>Best Sellers / Trending — custom products</strong><span>Select any products</span></div><div class="homepage-products-choice-list">${choices('best')}</div></div></div>
        <div class="homepage-showcase-editor">
          <div class="homepage-showcase-head"><div><span class="eyebrow">FEATURED SHOWCASE</span><h3>Best Deal / Trending Products</h3><p>Section remove না করেও hide/show করতে পারবে। 1–5টি product select করো; customer card-এ click করলে সরাসরি সেই product page-এ যাবে।</p></div><label class="homepage-showcase-toggle"><input id="showcaseEnabled" type="checkbox" ${settings.showcase.enabled?'checked':''}> Show on homepage</label></div>
          <div class="homepage-showcase-fields">
            <label>Small heading<input id="showcaseEyebrow" value="${esc(settings.showcase.eyebrow)}" placeholder="TRENDING NOW"></label>
            <label>Section title<input id="showcaseTitle" value="${esc(settings.showcase.title)}" placeholder="Best picks for you"></label>
            <label>Short description<input id="showcaseDescription" value="${esc(settings.showcase.description)}" placeholder="Our current favourites and best deals."></label>
            <label>Product image ratio<select id="showcaseRatio"><option value="1:1" ${settings.showcase.ratio==='1:1'?'selected':''}>1:1 — Square</option><option value="3:4" ${settings.showcase.ratio==='3:4'?'selected':''}>3:4 — Portrait</option><option value="4:3" ${settings.showcase.ratio==='4:3'?'selected':''}>4:3 — Landscape</option><option value="16:9" ${settings.showcase.ratio==='16:9'?'selected':''}>16:9 — Wide</option></select></label>
          </div>
          <div class="homepage-products-picker"><div class="homepage-products-picker-head"><strong>Select showcase products</strong><span id="showcaseSelectionCount">${settings.showcase.ids.length}/5 selected</span></div><div class="homepage-products-choice-list">${showcaseChoices()}</div></div>
        </div>
        <div class="homepage-products-save-row"><span>Tip: seasonal/trending products বদলাতে selection + ratio বদলে Save করলেই হবে.</span><button id="saveHomepageProducts" class="btn btn-primary" type="button">Save homepage settings</button></div>
      </div>`;
    document.getElementById('saveHomepageProducts')?.addEventListener('click',save);
    document.querySelectorAll('[data-showcase-product]').forEach(input=>input.addEventListener('change',()=>{const checked=[...document.querySelectorAll('[data-showcase-product]:checked')];if(checked.length>5){input.checked=false;alert('Maximum 5 products can be selected.');return;}document.getElementById('showcaseSelectionCount').textContent=`${checked.length}/5 selected`;}));
  }
  async function save(){
    const db=client(),button=document.getElementById('saveHomepageProducts'),status=document.getElementById('homepageProductsStatus'); if(!db)return alert('Supabase connection পাওয়া যাচ্ছে না।');
    settings.newMode=document.getElementById('homepageNewMode')?.value==='custom'?'custom':'auto'; settings.bestMode=document.getElementById('homepageBestMode')?.value==='custom'?'custom':'auto';
    settings.newIds=[...document.querySelectorAll('[data-home-new]:checked')].map(x=>x.dataset.homeNew); settings.bestIds=[...document.querySelectorAll('[data-home-best]:checked')].map(x=>x.dataset.homeBest);
    settings.showcase={enabled:!!document.getElementById('showcaseEnabled')?.checked,eyebrow:document.getElementById('showcaseEyebrow')?.value.trim()||'TRENDING NOW',title:document.getElementById('showcaseTitle')?.value.trim()||'Best picks for you',description:document.getElementById('showcaseDescription')?.value.trim()||'Our current favourites and best deals.',ratio:document.getElementById('showcaseRatio')?.value||'1:1',ids:[...document.querySelectorAll('[data-showcase-product]:checked')].map(x=>x.dataset.showcaseProduct).slice(0,5)};
    button.disabled=true;button.textContent='Saving...';status.textContent='Saving...';
    try{const {data:row,error:readError}=await db.from('site_settings').select('settings').eq('id','global').maybeSingle();if(readError)throw readError;const allSettings=row?.settings||{};allSettings.homepageCollections=settings;const {error}=await db.from('site_settings').upsert({id:'global',settings:allSettings,updated_at:new Date().toISOString()},{onConflict:'id'});if(error)throw error;status.textContent='Saved ✓';button.textContent='Save homepage settings';setTimeout(()=>status.textContent='Ready',1800);}catch(error){console.error(error);status.textContent='Failed';button.textContent='Save homepage settings';alert(`Save failed: ${error.message}`);}finally{button.disabled=false;}
  }
  function mount(){const root=document.getElementById('websiteEditorRoot');if(!root||document.getElementById('homepageProductEditor'))return;const card=document.createElement('div');card.id='homepageProductEditor';root.appendChild(card);load();}
  function watch(){mount();document.addEventListener('click',e=>{if(e.target.closest('[data-tab="website-editor"]'))setTimeout(mount,80);});const observer=new MutationObserver(()=>mount()),root=document.getElementById('websiteEditorRoot');if(root)observer.observe(root,{childList:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch);else watch();
})();
