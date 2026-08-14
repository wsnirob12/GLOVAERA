(async function(){
  const items=GLOVAERA.cart(); const summary=document.getElementById('orderSummary'); const form=document.getElementById('checkoutForm'); const msg=document.getElementById('checkoutMessage');
  if(!items.length){summary.innerHTML='<div class="empty-state">Your cart is empty.<br><a class="text-link" href="shop.html">Return to shop</a></div>';form.style.display='none';return;}
  const subtotal=items.reduce((a,b)=>a+Number(b.price)*Number(b.qty),0); const delivery=Number(GLOVAERA.cfg.deliveryCharge||0); const total=subtotal+delivery; summary.innerHTML=`<h2>Order summary</h2>${items.map(x=>`<div class="summary-line"><span>${GLOVAERA.escapeHtml(x.name)} × ${x.qty}</span><strong>${GLOVAERA.money(Number(x.price)*Number(x.qty))}</strong></div>`).join('')}<div class="summary-line"><span>Subtotal</span><strong>${GLOVAERA.money(subtotal)}</strong></div><div class="summary-line"><span>Delivery</span><strong>${GLOVAERA.money(delivery)}</strong></div><div class="total-row"><span>Total</span><strong>${GLOVAERA.money(total)}</strong></div>`;
  form.addEventListener('submit',async e=>{e.preventDefault(); const fd=new FormData(form); const payload={customer_name:fd.get('customer_name'),phone:fd.get('phone'),district:fd.get('district'),area:fd.get('area'),address:fd.get('address'),note:fd.get('note'),payment_method:'COD',subtotal,delivery_fee:delivery,total,items};
    try{ if(!GLOVAERA.client) throw new Error('Supabase is not connected yet. Add your Supabase URL and anon key to config.js first.');
      const {data,error}=await GLOVAERA.client.rpc('submit_order',{p_customer_name:payload.customer_name,p_phone:payload.phone,p_district:payload.district,p_area:payload.area,p_address:payload.address,p_note:payload.note,p_subtotal:payload.subtotal,p_delivery_fee:payload.delivery_fee,p_total:payload.total,p_payment_method:payload.payment_method,p_items:payload.items});
      if(error)throw error; localStorage.removeItem('glovaera_cart'); GLOVAERA.updateCartCount(); location.href=`order-success.html?id=${encodeURIComponent(data)}`;
    }catch(err){msg.textContent=err.message||'Could not place the order.';msg.className='form-message error';}
  });
})();
