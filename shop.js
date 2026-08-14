(async function(){
  const products = await GLOVAERA.getProducts(); const categories = await GLOVAERA.getCategories();
  const catSel=document.getElementById('categoryFilter'); const sortSel=document.getElementById('sortFilter'); const search=document.getElementById('shopSearch'); const grid=document.getElementById('shopGrid'); const empty=document.getElementById('shopEmpty');
  categories.forEach(c=>{ const o=document.createElement('option'); o.value=c.name; o.textContent=c.name; catSel.appendChild(o); });
  const params=new URLSearchParams(location.search); if(params.get('category')) catSel.value=params.get('category'); if(params.get('sort')) sortSel.value=params.get('sort');
  if(params.get('featured')==='true') sortSel.value='featured';
  function render(){ let list=[...products]; const q=search.value.trim().toLowerCase(); if(q) list=list.filter(p=>`${p.name} ${p.category} ${p.description||''}`.toLowerCase().includes(q)); if(catSel.value) list=list.filter(p=>p.category===catSel.value); if(params.get('combo')==='true') list=list.filter(p=>p.combo); switch(sortSel.value){case'new':list.sort((a,b)=>Number(b.is_new)-Number(a.is_new));break;case'price-asc':list.sort((a,b)=>(a.sale_price??a.price)-(b.sale_price??b.price));break;case'price-desc':list.sort((a,b)=>(b.sale_price??b.price)-(a.sale_price??a.price));break;case'featured':list.sort((a,b)=>Number(b.featured)-Number(a.featured));break;} grid.innerHTML=list.map(GLOVAERA.productCard).join(''); empty.hidden=list.length>0; }
  render(); catSel.onchange=render; sortSel.onchange=render; document.getElementById('shopSearchBtn').onclick=render; search.onkeydown=e=>{if(e.key==='Enter')render();};
  document.addEventListener('click',e=>{const b=e.target.closest('[data-add]');if(!b)return;const p=products.find(x=>x.id===decodeURIComponent(b.dataset.add));if(p){GLOVAERA.addToCart(p);b.textContent='Added ✓';setTimeout(()=>b.textContent='Add to cart',900);}});
})();
