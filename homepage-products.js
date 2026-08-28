(function () {
  'use strict';
  const db = () => window.glovaera?.client || window.GLOVAERA?.client || null;
  const api = () => window.GLOVAERA;
  const esc = v => String(v ?? '').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

  function addStyles(){
    if(document.getElementById('homepageShowcaseStyles'))return;
    const style=document.createElement('style');style.id='homepageShowcaseStyles';style.textContent=`
      .homepage-showcase{padding:76px 0;background:var(--surface,#fff)}
      .homepage-showcase .showcase-head{display:flex;align-items:end;justify-content:space-between;gap:24px;margin-bottom:30px}
      .homepage-showcase .showcase-copy{max-width:760px}
      .homepage-showcase .showcase-copy h2{margin:7px 0 9px}
      .homepage-showcase .showcase-copy p{margin:0;color:#735f69;line-height:1.7}
      .showcase-product-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:18px}
      .showcase-product-card{min-width:0}
      .showcase-product-image{position:relative;display:block;overflow:hidden;border-radius:14px;background:#f4eee8;aspect-ratio:1/1}
      .showcase-product-image img{width:100%;height:100%;display:block;object-fit:cover;transition:transform .35s ease}
      .showcase-product-image:hover img{transform:scale(1.035)}
      .showcase-product-badge{position:absolute;left:10px;top:10px;padding:7px 9px;border-radius:8px;background:#5b1638;color:#fff;font-size:10px;font-weight:700;letter-spacing:.08em}
      .showcase-product-meta{padding:13px 2px 0}
      .showcase-product-cat{text-transform:uppercase;letter-spacing:.13em;font-size:10px;color:#8a6575;font-weight:700;margin-bottom:6px}
      .showcase-product-name{display:block;color:#171217;font-family:"Playfair Display",serif;font-size:18px;line-height:1.25;text-decoration:none}
      .showcase-product-price{margin-top:8px;font-weight:700;color:#5b1638;font-size:15px}
      .showcase-product-old{margin-left:6px;color:#9b8b92;text-decoration:line-through;font-weight:500;font-size:12px}
      .showcase-view-all{white-space:nowrap}
      @media(max-width:1000px){.showcase-product-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}
      @media(max-width:760px){.homepage-showcase{padding:54px 0}.homepage-showcase .showcase-head{display:block;margin-bottom:22px}.showcase-view-all{display:inline-block;margin-top:14px}.showcase-product-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:22px 13px}.showcase-product-image{border-radius:11px}.showcase-product-name{font-size:16px}.showcase-product-meta{padding-top:10px}}
    `;document.head.appendChild(style);
  }

  function card(p,ratio){
    const price=Number(p.sale_price??p.price??0),old=Number(p.sale_price!=null?p.price:0);
    const badge=p.coming_soon?'COMING SOON':p.featured?'BEST SELLER':p.is_new?'NEW':'';
    return `<article class="showcase-product-card">
      <a class="showcase-product-image" style="aspect-ratio:${ratio.replace(':',' / ')}" href="product.html?id=${encodeURIComponent(p.id)}" aria-label="View ${esc(p.name)}">
        <img src="${esc(p.image_url||'logo.png')}" alt="${esc(p.name||'Product')}" loading="lazy">
        ${badge?`<span class="showcase-product-badge">${badge}</span>`:''}
      </a>
      <div class="showcase-product-meta">
        <div class="showcase-product-cat">${esc(p.category||'Jewellery')}</div>
        <a class="showcase-product-name" href="product.html?id=${encodeURIComponent(p.id)}">${esc(p.name||'Unnamed product')}</a>
        <div class="showcase-product-price">৳${price.toLocaleString('en-BD')}${old>price?`<span class="showcase-product-old">৳${old.toLocaleString('en-BD')}</span>`:''}</div>
      </div>
    </article>`;
  }

  async function applyShowcase(){
    const client=db(), store=api(); if(!client||!store?.getProducts)return;
    try{
      const [{data:row},products]=await Promise.all([
        client.from('site_settings').select('settings').eq('id','global').maybeSingle(),
        store.getProducts()
      ]);
      const cfg=row?.settings?.homepageCollections?.showcase;
      if(!cfg?.enabled||!Array.isArray(cfg.ids)||!cfg.ids.length)return;
      const selected=cfg.ids.map(String).map(id=>products.find(p=>String(p.id)===id)).filter(Boolean).slice(0,5);
      if(!selected.length)return;
      addStyles();
      const old=document.getElementById('homepageShowcase'); if(old)old.remove();
      const ratio=['1:1','3:4','4:3','16:9'].includes(cfg.ratio)?cfg.ratio:'1:1';
      const section=document.createElement('section');section.id='homepageShowcase';section.className='homepage-showcase';
      section.innerHTML=`<div class="container"><div class="showcase-head"><div class="showcase-copy"><span class="eyebrow">${esc(cfg.eyebrow||'TRENDING NOW')}</span><h2>${esc(cfg.title||'Best picks for you')}</h2><p>${esc(cfg.description||'Our current favourites and best deals.')}</p></div><a class="text-link showcase-view-all" href="shop.html">View all →</a></div><div class="showcase-product-grid">${selected.map(p=>card(p,ratio)).join('')}</div></div>`;
      const categories=document.getElementById('categoryGrid')?.closest('section');
      const newSection=document.getElementById('newProducts')?.closest('section');
      if(newSection) newSection.parentNode.insertBefore(section,newSection); else if(categories) categories.parentNode.insertBefore(section,categories.nextSibling); else document.querySelector('main')?.prepend(section);
    }catch(error){console.warn('Could not load homepage showcase:',error);}
  }

  async function applyCustomHomepageProducts(){
    const client=db(),store=api(),newEl=document.getElementById('newProducts'),bestEl=document.getElementById('bestProducts');
    if(!client||!store?.getProducts||!store?.productCard||(!newEl&&!bestEl))return;
    try{
      const [{data:row},products]=await Promise.all([client.from('site_settings').select('settings').eq('id','global').maybeSingle(),store.getProducts()]);
      const cfg=row?.settings?.homepageCollections;if(!cfg)return;
      const pick=(ids,limit=8)=>{const byId=new Map(products.map(p=>[String(p.id),p]));return(Array.isArray(ids)?ids:[]).map(id=>byId.get(String(id))).filter(Boolean).slice(0,limit);};
      if(newEl&&cfg.newMode==='custom'){const selected=pick(cfg.newIds);newEl.innerHTML=selected.length?selected.map(store.productCard).join(''):'<p class="homepage-empty-selection">No products selected yet.</p>';}
      if(bestEl&&cfg.bestMode==='custom'){const selected=pick(cfg.bestIds);bestEl.innerHTML=selected.length?selected.map(store.productCard).join(''):'<p class="homepage-empty-selection">No products selected yet.</p>';}
    }catch(error){console.warn('Could not apply custom homepage products:',error);}
  }

  function start(){setTimeout(()=>{applyShowcase();applyCustomHomepageProducts();},120);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
