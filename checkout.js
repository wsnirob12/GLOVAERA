(async function(){
  'use strict';

  /*
    IMPORTANT:
    app.js exposes the cart helpers on window.GLOVAERA, while
    window.glovaera only contains the Supabase client/config.
    The old code preferred window.glovaera, so checkout could see
    the cart count but then read an empty cart. Use GLOVAERA first.
  */
  const api=window.GLOVAERA || window.glovaera || {};
  const root=document.getElementById('orderSummary');
  const form=document.getElementById('checkoutForm');
  const msg=document.getElementById('checkoutMessage');
  const submitButton=form?.querySelector('.checkout-submit');

  if(!root || !form) return;

  function injectCheckoutStyles(){
    if(document.getElementById('glovaera-checkout-fix')) return;
    const style=document.createElement('style');
    style.id='glovaera-checkout-fix';
    style.textContent=`
      .checkout-layout{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(320px,.75fr);gap:28px;align-items:start}
      .checkout-summary{position:sticky;top:105px;padding:24px;border:1px solid var(--border);border-radius:18px;background:#fff;box-shadow:var(--shadow)}
      .checkout-summary h2{margin:6px 0 20px;font-size:30px}
      .checkout-summary .summary-products{display:grid;gap:12px;margin-bottom:18px}
      .checkout-summary .summary-product{display:grid;grid-template-columns:58px minmax(0,1fr) auto;gap:12px;align-items:center;padding-bottom:12px;border-bottom:1px solid var(--border)}
      .checkout-summary .summary-product img{width:58px;height:58px;border-radius:10px;object-fit:cover;background:#f6eee7}
      .checkout-summary .summary-product-name{font-weight:700;font-size:13px;line-height:1.35}
      .checkout-summary .summary-product-meta{margin-top:3px;color:var(--muted);font-size:11px}
      .checkout-summary .summary-product-price{font-weight:700;font-size:13px;white-space:nowrap}
      .checkout-summary .summary-line{display:flex;justify-content:space-between;gap:20px;padding:8px 0;color:var(--muted);font-size:13px}
      .checkout-summary .summary-line strong{color:var(--ink)}
      .checkout-summary .total-row{display:flex;justify-content:space-between;gap:20px;margin-top:8px;padding-top:16px;border-top:1px solid var(--border);font-size:16px;font-weight:700}
      .checkout-summary .total-row strong{font-size:21px;color:var(--burgundy)}
      .checkout-summary .summary-note{margin:14px 0 0;padding:10px 12px;border-radius:10px;background:#faf4ef;color:var(--muted);font-size:11px;line-height:1.5}
      .form-message.error{margin-top:14px;padding:11px 13px;border:1px solid #efc5ca;border-radius:10px;background:#fff5f5;color:#9b3947;font-size:13px}
      .form-message.success{margin-top:14px;padding:11px 13px;border:1px solid #cfe4d5;border-radius:10px;background:#f3faf5;color:#2e6b3c;font-size:13px}
      .checkout-submit:disabled{opacity:.65;cursor:wait}
      @media(max-width:850px){.checkout-layout{grid-template-columns:1fr}.checkout-summary{position:static;order:-1}}
    `;
    document.head.appendChild(style);
  }

  injectCheckoutStyles();

  const items=typeof api.cart==='function' ? api.cart() : [];

  if(!items.length){
    root.innerHTML='<div class="empty-state"><h2>Your cart is empty.</h2><p>Add a product before checkout.</p><a class="btn btn-primary" href="shop.html">Return to shop</a></div>';
    form.style.display='none';
    return;
  }

  const money=api.money || (v=>`৳${Number(v||0).toLocaleString('en-BD')}`);
  const escapeHtml=api.escapeHtml || (s=>String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])));

  const subtotal=items.reduce((a,b)=>a+Number(b.price)*Number(b.qty),0);
  const districtEl=form.querySelector('[name="district"]');

  function getDelivery(){
    const d=String(districtEl?.value||'').trim().toLowerCase();
    const dhaka=['dhaka','ঢাকা'];
    const cfg=window.GLOVAERA_CONFIG || api.cfg || {};
    return dhaka.includes(d) ? Number(cfg.deliveryDhaka ?? 60) : Number(cfg.deliveryOutsideDhaka ?? 120);
  }

  function renderSummary(){
    const delivery=getDelivery();
    const total=subtotal+delivery;
    root.innerHTML=`
      <div class="eyebrow">YOUR ORDER</div>
      <h2>Order summary</h2>
      <div class="summary-products">
        ${items.map(x=>`
          <div class="summary-product">
            <img src="${x.image_url||'logo.png'}" alt="${escapeHtml(x.name)}">
            <div>
              <div class="summary-product-name">${escapeHtml(x.name)}</div>
              <div class="summary-product-meta">Qty ${Number(x.qty)} · ${money(x.price)} each</div>
            </div>
            <div class="summary-product-price">${money(Number(x.price)*Number(x.qty))}</div>
          </div>
        `).join('')}
      </div>
      <div class="summary-line"><span>Subtotal</span><strong>${money(subtotal)}</strong></div>
      <div class="summary-line"><span>Delivery</span><strong>${money(delivery)}</strong></div>
      <div class="total-row"><span>Total</span><strong>${money(total)}</strong></div>
      <div class="summary-note">Cash on Delivery · Delivery fee updates automatically when you enter the district.</div>
    `;
  }

  renderSummary();
  districtEl?.addEventListener('input',renderSummary);
  districtEl?.addEventListener('change',renderSummary);

  form.addEventListener('submit',async e=>{
    e.preventDefault();
    if(!form.reportValidity()) return;

    const client=api.client || window.glovaera?.client || window.GLOVAERA?.client;
    if(!client){
      msg.textContent='Checkout connection is not ready. Please refresh the page and try again.';
      msg.className='form-message error';
      return;
    }

    const fd=new FormData(form);
    const delivery=getDelivery();
    const total=subtotal+delivery;
    const payload={
      customer_name:String(fd.get('customer_name')||'').trim(),
      phone:String(fd.get('phone')||'').trim(),
      district:String(fd.get('district')||'').trim(),
      area:String(fd.get('area')||'').trim(),
      address:String(fd.get('address')||'').trim(),
      note:String(fd.get('note')||'').trim(),
      payment_method:'COD',
      subtotal,
      delivery_fee:delivery,
      total,
      items
    };

    submitButton.disabled=true;
    submitButton.textContent='Placing order…';
    msg.textContent='';
    msg.className='form-message';

    try{
      const {data,error}=await client.rpc('submit_order',{
        p_customer_name:payload.customer_name,
        p_phone:payload.phone,
        p_district:payload.district,
        p_area:payload.area,
        p_address:payload.address,
        p_note:payload.note,
        p_subtotal:payload.subtotal,
        p_delivery_fee:payload.delivery_fee,
        p_total:payload.total,
        p_payment_method:payload.payment_method,
        p_items:payload.items
      });

      if(error) throw error;
      if(!data) throw new Error('Order was not created. Please try again.');

      localStorage.removeItem('glovaera_cart');
      if(typeof api.updateCartCount==='function') api.updateCartCount();
      window.location.href=`order-success.html?id=${encodeURIComponent(data)}`;
    }catch(err){
      console.error('GLOVAERA order error:',err);
      msg.textContent=err?.message || 'Could not place the order. Please try again.';
      msg.className='form-message error';
      submitButton.disabled=false;
      submitButton.textContent='Place order';
    }
  });
})();
