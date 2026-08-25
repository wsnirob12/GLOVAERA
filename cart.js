(function(){
  const root=document.getElementById('cartRoot');

  function injectCartStyles(){
    if(document.getElementById('glovaera-cart-fix')) return;
    const style=document.createElement('style');
    style.id='glovaera-cart-fix';
    style.textContent=`
      .cart-layout{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(300px,.75fr);gap:28px;align-items:start}
      .cart-list{display:grid;gap:14px}
      .cart-item{display:grid;grid-template-columns:96px minmax(0,1fr);gap:18px;align-items:center;padding:16px;border:1px solid var(--border);border-radius:16px;background:#fff;box-shadow:0 8px 28px rgba(74,23,48,.05)}
      .cart-item>img{width:96px;height:96px;display:block;object-fit:cover;border-radius:12px;background:#f6eee7}
      .cart-item-main{min-width:0}
      .cart-item-main h3{margin:0 0 6px;font-size:18px;line-height:1.25}
      .cart-item-main>strong{display:block;margin-bottom:12px;font-size:15px;color:var(--burgundy)}
      .cart-controls{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
      .cart-controls button{min-width:36px;height:36px;padding:0 10px;border:1px solid var(--border);border-radius:8px;background:#fff;color:var(--dark-burgundy);cursor:pointer}
      .cart-controls button:hover{border-color:var(--gold)}
      .cart-controls span{min-width:28px;text-align:center;font-weight:700}
      .cart-controls .remove-btn{min-width:auto;margin-left:4px;color:#9b3947;background:#fff5f5}
      .cart-summary{position:sticky;top:105px;padding:24px;border:1px solid var(--border);border-radius:18px;background:#fff;box-shadow:var(--shadow)}
      .cart-summary h2{margin:0 0 22px;font-size:28px}
      .cart-summary>div{display:flex;justify-content:space-between;gap:20px;padding:10px 0;color:var(--muted);font-size:14px}
      .cart-summary>div strong{color:var(--ink)}
      .cart-summary .total-row{margin-top:8px;padding-top:16px;border-top:1px solid var(--border);font-size:16px;color:var(--ink)}
      .cart-summary .total-row strong{font-size:20px;color:var(--burgundy)}
      .cart-summary .btn{width:100%;margin-top:16px}
      @media(max-width:850px){.cart-layout{grid-template-columns:1fr}.cart-summary{position:static}.cart-item{grid-template-columns:82px minmax(0,1fr);padding:13px}.cart-item>img{width:82px;height:82px}}
      @media(max-width:480px){.cart-item-main h3{font-size:16px}.cart-controls{gap:6px}.cart-controls button{height:34px;min-width:34px}}
    `;
    document.head.appendChild(style);
  }

  function render(){
    injectCartStyles();
    const items=GLOVAERA.cart();
    if(!items.length){
      root.innerHTML='<div class="empty-state"><h2>Your cart is empty.</h2><p>Find something beautiful for every day.</p><a class="btn btn-primary" href="shop.html">Shop now</a></div>';
      return;
    }

    const subtotal=items.reduce((a,b)=>a+Number(b.price)*Number(b.qty),0);
    root.innerHTML=`
      <div class="cart-layout">
        <div class="cart-list">
          ${items.map((x,i)=>`
            <div class="cart-item">
              <img src="${x.image_url||'logo.png'}" alt="${GLOVAERA.escapeHtml(x.name)}">
              <div class="cart-item-main">
                <h3>${GLOVAERA.escapeHtml(x.name)}</h3>
                <strong>${GLOVAERA.money(x.price)}</strong>
                <div class="cart-controls">
                  <button type="button" aria-label="Decrease quantity" data-dec="${i}">−</button>
                  <span>${x.qty}</span>
                  <button type="button" aria-label="Increase quantity" data-inc="${i}">+</button>
                  <button type="button" class="remove-btn" data-remove="${i}">Remove</button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        <aside class="panel cart-summary">
          <h2>Summary</h2>
          <div><span>Subtotal</span><strong>${GLOVAERA.money(subtotal)}</strong></div>
          <div><span>Delivery</span><strong>Calculated at checkout</strong></div>
          <div class="total-row"><span>Estimated total</span><strong>${GLOVAERA.money(subtotal)}</strong></div>
          <a class="btn btn-primary" href="checkout.html">Proceed to checkout</a>
        </aside>
      </div>`;
  }

  root.onclick=e=>{
    const i=e.target.dataset.inc??e.target.dataset.dec??e.target.dataset.remove;
    if(i===undefined)return;
    const items=GLOVAERA.cart();
    if(e.target.dataset.inc!==undefined)items[i].qty++;
    if(e.target.dataset.dec!==undefined)items[i].qty=Math.max(1,items[i].qty-1);
    if(e.target.dataset.remove!==undefined)items.splice(i,1);
    GLOVAERA.saveCart(items);
    render();
  };

  render();
  window.addEventListener('storage',render);
  window.addEventListener('cart:updated',render);
})();
