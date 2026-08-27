(function(){
  'use strict';

  const css = `
    /* GLOVAERA product/gallery upgrade */
    .product-detail{align-items:start;}
    .product-gallery{position:relative;width:100%;max-height:520px;min-height:360px;display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:18px;background:#f6eee7;border:1px solid var(--border);}
    .product-gallery > img{width:100%;height:100%;max-height:520px;object-fit:contain;display:block;}
    .gv-gallery{width:100%;display:grid;grid-template-columns:78px minmax(0,1fr);gap:14px;align-items:stretch;}
    .gv-thumbs{display:flex;flex-direction:column;gap:9px;max-height:520px;overflow:auto;padding-right:2px;}
    .gv-thumb{width:72px;height:72px;flex:0 0 72px;padding:0;border:1px solid var(--border);border-radius:10px;background:#fff;overflow:hidden;cursor:pointer;}
    .gv-thumb.active{border:2px solid var(--burgundy);}
    .gv-thumb img{width:100%;height:100%;object-fit:cover;display:block;}
    .gv-main{position:relative;min-width:0;height:min(520px,42vw);min-height:360px;display:flex;align-items:center;justify-content:center;overflow:hidden;border:1px solid var(--border);border-radius:18px;background:#f6eee7;}
    .gv-main img{width:100%;height:100%;object-fit:contain;display:block;}
    .gv-gallery-empty{min-height:360px;display:grid;place-items:center;color:var(--muted);padding:30px;}
    .gv-variants{margin:24px 0 8px;display:grid;gap:18px;}
    .gv-option-group{display:grid;gap:9px;}
    .gv-option-title{font-size:13px;font-weight:700;color:var(--ink);}
    .gv-options{display:flex;flex-wrap:wrap;gap:8px;}
    .gv-option{min-height:40px;padding:0 14px;border:1px solid #ded2d8;border-radius:10px;background:#fff;color:#5f565b;font-size:12px;font-weight:700;cursor:pointer;}
    .gv-option.active{border-color:var(--burgundy);background:var(--burgundy);color:#fff;}
    .product-card .product-image-wrap{aspect-ratio:1/1;}
    .product-card .product-image-wrap img{object-fit:cover;}
    @media(max-width:900px){
      .gv-gallery{grid-template-columns:1fr;}
      .gv-main{height:min(430px,78vw);min-height:300px;}
      .gv-thumbs{order:2;flex-direction:row;max-height:none;overflow-x:auto;overflow-y:hidden;padding-bottom:3px;}
      .gv-thumb{width:64px;height:64px;flex-basis:64px;}
      .product-gallery{max-height:430px;min-height:300px;}
      .product-gallery > img{max-height:430px;}
    }
    @media(max-width:560px){
      .gv-main{height:78vw;min-height:260px;max-height:360px;}
      .gv-gallery{gap:10px;}
      .gv-thumb{width:58px;height:58px;flex-basis:58px;}
      .product-gallery{min-height:260px;max-height:360px;}
      .product-gallery > img{max-height:360px;}
      .gv-variants{margin-top:18px;}
    }
  `;

  const style=document.createElement('style');
  style.id='glovaera-product-enhancer-style';
  style.textContent=css;
  document.head.appendChild(style);

  function esc(v){ return GLOVAERA.escapeHtml(v ?? ''); }
  function urlsOf(p){
    const arr=Array.isArray(p.image_urls)?p.image_urls.filter(Boolean):[];
    if(!arr.length && p.image_url) arr.push(p.image_url);
    return arr.slice(0,7);
  }
  function listOf(v){
    if(Array.isArray(v)) return v.filter(Boolean).map(String);
    if(typeof v==='string') return v.split(',').map(x=>x.trim()).filter(Boolean);
    return [];
  }

  function enhanceProductPage(){
    const root=document.getElementById('productRoot');
    if(!root || !root.innerHTML || root.dataset.gvEnhanced==='1') return;
    const params=new URLSearchParams(location.search);
    const id=params.get('id');
    if(!id || !window.GLOVAERA?.getProducts) return;

    GLOVAERA.getProducts().then(products=>{
      const p=products.find(x=>String(x.id)===String(id));
      if(!p) return;
      root.dataset.gvEnhanced='1';
      const urls=urlsOf(p);
      const gallery=root.querySelector('.product-gallery');
      if(gallery && urls.length>1){
        const oldStatus=gallery.querySelector('.product-status-badge');
        const status=oldStatus ? oldStatus.outerHTML : '';
        gallery.outerHTML=`<div class="gv-gallery product-gallery">${status}<div class="gv-thumbs">${urls.map((u,i)=>`<button type="button" class="gv-thumb ${i===0?'active':''}" data-gv-thumb="${i}"><img src="${esc(u)}" alt="${esc(p.name)} photo ${i+1}"></button>`).join('')}</div><div class="gv-main"><img id="gvMainImage" src="${esc(urls[0])}" alt="${esc(p.name)}"></div></div>`;
        const main=root.querySelector('#gvMainImage');
        root.querySelectorAll('[data-gv-thumb]').forEach(btn=>btn.addEventListener('click',()=>{
          const i=Number(btn.dataset.gvThumb); if(urls[i]) main.src=urls[i];
          root.querySelectorAll('[data-gv-thumb]').forEach(x=>x.classList.remove('active')); btn.classList.add('active');
        }));
      }

      const colors=listOf(p.colors);
      const sizes=listOf(p.sizes);
      const types=listOf(p.types);
      const groups=[];
      if(p.show_color && colors.length) groups.push(['Color',colors,'color']);
      if(p.show_size && sizes.length) groups.push(['Size',sizes,'size']);
      if(p.show_type && types.length) groups.push(['Type',types,'type']);
      if(!groups.length) return;

      const info=root.querySelector('.product-info');
      if(!info) return;
      const variants=document.createElement('div');
      variants.className='gv-variants';
      variants.innerHTML=groups.map(([label,values,key])=>`<div class="gv-option-group"><div class="gv-option-title">${label}</div><div class="gv-options" data-gv-group="${key}">${values.map((v,i)=>`<button type="button" class="gv-option ${i===0?'active':''}" data-gv-option="${key}" data-value="${esc(v)}">${esc(v)}</button>`).join('')}</div></div>`).join('');
      const actions=info.querySelector('.product-actions');
      info.insertBefore(variants,actions || null);

      const selected={};
      groups.forEach(([label,values,key])=>selected[key]=values[0]);
      variants.querySelectorAll('[data-gv-option]').forEach(btn=>btn.addEventListener('click',()=>{
        const key=btn.dataset.gvOption; selected[key]=btn.dataset.value;
        variants.querySelectorAll(`[data-gv-option="${key}"]`).forEach(x=>x.classList.remove('active')); btn.classList.add('active');
      }));

      const add=document.getElementById('addBtn');
      const buy=document.getElementById('buyBtn');
      function doAdd(goCheckout){
        const qty=Math.max(1,Number(document.getElementById('qty')?.value)||1);
        const parts=Object.entries(selected).map(([k,v])=>`${k.charAt(0).toUpperCase()+k.slice(1)}: ${v}`);
        const cartProduct={...p,name:parts.length?`${p.name} — ${parts.join(' | ')}`:p.name,image_url:urls[0]||p.image_url,variant_details:selected};
        const ok=GLOVAERA.addToCart(cartProduct,qty);
        if(ok && goCheckout) location.href='checkout.html';
        if(ok && !goCheckout && add) add.textContent='Added ✓';
      }
      if(add) add.onclick=()=>doAdd(false);
      if(buy) buy.onclick=()=>doAdd(true);
    }).catch(()=>{});
  }

  function boot(){
    enhanceProductPage();
    const root=document.getElementById('productRoot');
    if(root){
      const obs=new MutationObserver(()=>enhanceProductPage());
      obs.observe(root,{childList:true,subtree:true});
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
