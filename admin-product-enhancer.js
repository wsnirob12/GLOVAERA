(function(){
  'use strict';

  const css=document.createElement('style');
  css.id='gv-admin-product-enhancer-style';
  css.textContent=`
    .gv-admin-box{grid-column:1/-1;padding:16px;border:1px solid var(--border);border-radius:14px;background:#fbf7f2;display:grid;gap:12px;}
    .gv-admin-box h3{margin:0;font-family:"Playfair Display",Georgia,serif;font-size:22px;}
    .gv-admin-note{margin:0;color:var(--muted);font-size:12px;}
    .gv-admin-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;}
    .gv-admin-grid label{display:grid;gap:6px;}
    .gv-admin-checks{display:flex;flex-wrap:wrap;gap:14px;align-items:center;}
    .gv-admin-checks label{display:flex;align-items:center;gap:7px;}
    @media(max-width:700px){.gv-admin-grid{grid-template-columns:1fr;}}
  `;
  document.head.appendChild(css);

  const S=()=>window.GLOVAERA?.client||window.glovaera?.client||null;
  const esc=v=>window.GLOVAERA?.escapeHtml?GLOVAERA.escapeHtml(v??''):String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const arr=v=>Array.isArray(v)?v.filter(Boolean):typeof v==='string'?v.split(',').map(x=>x.trim()).filter(Boolean):[];

  function addFields(){
    const form=document.getElementById('productForm');
    if(!form || form.dataset.gvEnhanced==='1') return;
    form.dataset.gvEnhanced='1';
    const productId=form.querySelector('[name="id"]')?.value||'';
    let current=null;
    if(productId && window.__gvAdminProducts) current=window.__gvAdminProducts.find(p=>String(p.id)===String(productId));
    current=current||{};
    const imgs=arr(current.image_urls); if(!imgs.length && current.image_url) imgs.push(current.image_url);
    while(imgs.length<7) imgs.push('');
    const box=document.createElement('div');
    box.className='gv-admin-box';
    box.innerHTML=`
      <h3>Product gallery & options</h3>
      <p class="gv-admin-note">7 ta photo slot ache. Jeita lagbe na blank rekho. Photo URL use koro.</p>
      <div class="gv-admin-grid">
        ${imgs.map((u,i)=>`<label>Photo ${i+1} URL${i===0?' (main)':''}<input name="gv_image_${i+1}" value="${esc(u)}" placeholder="https://..."></label>`).join('')}
      </div>
      <div class="gv-admin-grid">
        <label>Colors <input name="gv_colors" value="${esc(arr(current.colors).join(', '))}" placeholder="Gold, Silver, Black"></label>
        <label>Sizes <input name="gv_sizes" value="${esc(arr(current.sizes).join(', '))}" placeholder="S, M, L, XL"></label>
        <label>Types <input name="gv_types" value="${esc(arr(current.types).join(', '))}" placeholder="Regular, Premium"></label>
      </div>
      <div class="gv-admin-checks">
        <label><input type="checkbox" name="gv_show_color" ${current.show_color?'checked':''}> Show Color selection</label>
        <label><input type="checkbox" name="gv_show_size" ${current.show_size?'checked':''}> Show Size selection</label>
        <label><input type="checkbox" name="gv_show_type" ${current.show_type?'checked':''}> Show Type selection</label>
      </div>`;
    const submit=form.querySelector('button[type="submit"]');
    form.insertBefore(box,submit||null);
  }

  async function saveEnhanced(event){
    const form=event.target;
    if(form.id!=='productForm' || form.dataset.gvEnhanced!=='1') return;
    event.preventDefault(); event.stopImmediatePropagation();
    const client=S();
    if(!client){alert('Supabase connection is not available.');return;}
    const fd=new FormData(form);
    const id=String(fd.get('id')||'').trim();
    const imageUrls=[];
    for(let i=1;i<=7;i++){const v=String(fd.get(`gv_image_${i}`)||'').trim();if(v) imageUrls.push(v);}
    const payload={
      name:String(fd.get('name')||'').trim(),
      category:String(fd.get('category')||'').trim(),
      price:Number(fd.get('price')||0),
      sale_price:fd.get('sale_price')===''?null:Number(fd.get('sale_price')),
      stock:Number(fd.get('stock')||0),
      image_url:imageUrls[0]||String(fd.get('image_url')||'logo.png').trim()||'logo.png',
      image_urls:imageUrls,
      description:String(fd.get('description')||''),
      material:String(fd.get('material')||'Fashion jewellery'),
      color:arr(fd.get('gv_colors'))[0]||String(fd.get('color')||''),
      colors:arr(fd.get('gv_colors')),
      sizes:arr(fd.get('gv_sizes')),
      types:arr(fd.get('gv_types')),
      show_color:form.querySelector('[name="gv_show_color"]')?.checked||false,
      show_size:form.querySelector('[name="gv_show_size"]')?.checked||false,
      show_type:form.querySelector('[name="gv_show_type"]')?.checked||false,
      featured:form.querySelector('[name="featured"]')?.checked||false,
      is_new:form.querySelector('[name="is_new"]')?.checked||false,
      combo:form.querySelector('[name="combo"]')?.checked||false,
      coming_soon:form.querySelector('[name="coming_soon"]')?.checked||false,
      active:true
    };
    try{
      const result=id
        ? await client.from('products').update(payload).eq('id',id).select().single()
        : await client.from('products').insert(payload).select().single();
      if(result.error) throw result.error;
      alert('Product saved successfully ✓');
      document.getElementById('modal')?.setAttribute('hidden','');
      if(typeof window.__gvAdminRefresh==='function') await window.__gvAdminRefresh();
      else location.reload();
    }catch(error){console.error(error);alert(error.message||'Could not save product.');}
  }

  function captureSubmit(event){
    if(event.target?.id==='productForm' && event.target.dataset.gvEnhanced==='1') saveEnhanced(event);
  }

  function watch(){
    const list=document.getElementById('productAdminList');
    if(list){
      new MutationObserver(()=>{document.querySelectorAll('#modal #productForm').forEach(addFields);}).observe(list,{childList:true,subtree:true});
    }
    const modal=document.getElementById('modal');
    if(modal) new MutationObserver(()=>addFields()).observe(modal,{childList:true,subtree:true,attributes:true});
    document.addEventListener('submit',captureSubmit,true);
  }

  // Keep a copy of admin product data for editing existing records.
  async function loadProducts(){
    try{
      const c=S(); if(!c) return;
      const r=await c.from('products').select('*');
      if(!r.error) window.__gvAdminProducts=r.data||[];
    }catch(e){}
  }
  window.__gvAdminRefresh=async function(){
    try{await loadProducts();if(typeof window.refreshAll==='function') await window.refreshAll(); else location.reload();}catch(e){location.reload();}
  };

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>{watch();loadProducts();}); else {watch();loadProducts();}
})();
