
(() => {
    const KEY = "hb_cart";
    const FREE_SHIP = 500000;
    const SHIP_PRICE = { standard: 30000, express: 55000 };

    const safeParse = t => { try { return JSON.parse(t); } catch { return null; } };
    const getCart = () => safeParse(localStorage.getItem(KEY)) || [];
    const setCart = c => localStorage.setItem(KEY, JSON.stringify(c));
    const vnd = n => (Number(n) || 0).toLocaleString("vi-VN") + "₫";
    const deVnd = s => Number(String(s).replace(/[^\d]/g, "")) || 0;

    const $ = sel => document.querySelector(sel);
    const $$ = sel => Array.from(document.querySelectorAll(sel));

    const cartBadge = () => {
        const el = $("#cartBadge");
        if (el) {
            const totalQty = getCart().reduce((s, i) => s + (i.qty || 0), 0);
            el.textContent = String(totalQty);
        }
    };

    function renderCart() {
        const list = document.querySelector(".list");
        if (!list) return;

        const cart = getCart();


        const toolbar = list.querySelector(".toolbar");


        let rowsWrap = list.querySelector(".rows-wrap");
        if (!rowsWrap) {
            rowsWrap = document.createElement("div");
            rowsWrap.className = "rows-wrap";
            if (toolbar) list.insertBefore(rowsWrap, toolbar);
            else list.appendChild(rowsWrap);
        }

        const rows = cart.map(item => `
    <article class="row" data-id="${item.id}">
      <label class="chk"><input type="checkbox" class="row-check" /></label>
      <a class="thumb" href="#"><img src="${item.image}" alt="${item.name}"></a>
      <div class="meta">
        <h3 class="name">${item.name}</h3>
        <p class="sub">Sản phẩm Honey Bee</p>
        <div class="price-each">Đơn giá <b>${vnd(item.price)}</b></div>
      </div>
      <div class="qty" aria-label="Số lượng">
        <button class="step" data-act="dec">−</button>
        <input type="number" min="1" value="${item.qty}">
        <button class="step" data-act="inc">+</button>
      </div>
      <div class="line"><b>${vnd(item.price * item.qty)}</b></div>
      <button class="remove" aria-label="Xóa sản phẩm">✕</button>
    </article>
  `).join("");

        rowsWrap.innerHTML = rows;

        // 4) Toggle khung giỏ trống
        document.querySelector("#cartEmpty")?.toggleAttribute("hidden", cart.length > 0);

        attachRowHandlers();
        updateTotals();
        cartBadge();
    }

    function subtotal() {
        return getCart().reduce((s, i) => s + (i.price || 0) * (i.qty || 0), 0);
    }

    function currentShipFee(sub) {
        if (sub >= FREE_SHIP || sub === 0) return 0;
        const type = $('input[name="ship"]:checked')?.value || "standard";
        return SHIP_PRICE[type] || 0;
    }

    function updateFreeShipBar(sub) {
        const ratio = Math.max(0, Math.min(1, sub / FREE_SHIP));
        $(".fs-fill")?.style.setProperty("width", (ratio * 100).toFixed(1) + "%");
        const note = $(".fs-note");
        if (note) {
            if (sub >= FREE_SHIP) {
                note.innerHTML = 'Bạn đã được <b>miễn phí vận chuyển</b> 🎉';
            } else {
                note.innerHTML = `Mua thêm <b>${vnd(FREE_SHIP - sub)}</b> để được freeship.`;
            }
        }
    }

    function updateTotals() {
        const sub = subtotal();
        const ship = currentShipFee(sub);
        const total = sub + ship;

        const rows = $$(".rows .row-2 b");
        if (rows[0]) rows[0].textContent = vnd(sub);
        if (rows[1]) rows[1].textContent = vnd(ship);
        if (rows[3]) rows[3].textContent = vnd(total);

        updateFreeShipBar(sub);
    }

    function attachRowHandlers() {

        $$(".list .row").forEach(row => {
            const id = row.dataset.id;
            const input = row.querySelector('input[type="number"]');

            row.addEventListener("click", (e) => {
                const btn = e.target.closest(".step");
                if (!btn) return;

                const act = btn.dataset.act;
                let val = Number(input.value) || 1;
                val = act === "inc" ? val + 1 : Math.max(1, val - 1);
                input.value = val;

                changeQty(id, val);
            });

            input.addEventListener("change", () => {
                const val = Math.max(1, Number(input.value) || 1);
                input.value = val;
                changeQty(id, val);
            });

            // Xóa 1 dòng
            row.querySelector(".remove")?.addEventListener("click", () => {
                const cart = getCart().filter(i => i.id !== id);
                setCart(cart);
                renderCart();
            });
        });


        $("#selectAll")?.addEventListener("change", (e) => {
            $$(".row-check").forEach(chk => chk.checked = e.target.checked);
        });

        $("#bulkDelete")?.addEventListener("click", () => {
            const ids = $$(".row-check:checked").map(chk => chk.closest(".row")?.dataset.id);
            if (!ids.length) return;
            const cart = getCart().filter(i => !ids.includes(i.id));
            setCart(cart);
            renderCart();
        });
    }

    function changeQty(id, qty) {
        const cart = getCart();
        const it = cart.find(i => i.id === id);
        if (!it) return;
        it.qty = qty;
        setCart(cart);
        // cập nhật line total tại chỗ
        const row = $(`.list .row[data-id="${id}"]`);
        if (row) row.querySelector(".line b").textContent = vnd(it.price * it.qty);
        updateTotals();
        cartBadge();
    }


    function initPaymentPanels() {
        const bankDetail = $("#bankDetail");
        const walletDetail = $("#walletDetail");

        const toggle = () => {
            const v = $('input[name="pay"]:checked')?.value;
            if (bankDetail) bankDetail.hidden = v !== "bank";
            if (walletDetail) walletDetail.hidden = v !== "wallet";
        };
        document.addEventListener("change", (e) => {
            if (e.target.matches('input[name="pay"]')) toggle();
        });
        toggle();
    }


    function initShipRadios() {
        document.addEventListener("change", (e) => {
            if (e.target.matches('input[name="ship"]')) updateTotals();
        });
    }


    function initCheckout() {
        $("#btnCheckout")?.addEventListener("click", () => {
            const cart = getCart();
            if (!cart.length) { alert("Giỏ hàng trống!"); return; }

            const sub = subtotal();
            const shipType = $('input[name="ship"]:checked')?.value || "standard";
            const ship = currentShipFee(sub);
            const pay = $('input[name="pay"]:checked')?.value || "cod";

            const order = {
                id: "HB" + Date.now(),
                items: cart,
                subtotal: sub,
                shipping: { type: shipType, fee: ship },
                payment: { method: pay, bank: $('input[name="bank"]:checked')?.value || null },
                total: sub + ship
            };

            // TODO: gửi order lên backend. Tạm thời hiển thị:
            console.log(order);
            alert("Đặt hàng thành công!\nMã đơn: " + order.id + "\nTổng: " + vnd(order.total));
            // Xoá giỏ sau khi đặt
            setCart([]);
            renderCart();
        });
    }


    document.addEventListener("DOMContentLoaded", () => {

        $$(".list .row").forEach(el => el.remove());

        renderCart();
        initPaymentPanels();
        initShipRadios();
        initCheckout();
        cartBadge();
    });
})();

(function(){
    const LS_CART = 'hb_cart';
    const LS_SHIP = 'hb_delivery';
    const fmt = n => (n||0).toLocaleString('vi-VN',{style:'currency',currency:'VND',maximumFractionDigits:0});


    function addQuick(it){
        const items = JSON.parse(localStorage.getItem(LS_CART)||'[]');
        const f = items.find(x=>x.id===it.id);
        if(f){ f.qty += 1; } else { items.push({...it, qty:1}); }
        localStorage.setItem(LS_CART, JSON.stringify(items));

        const t = document.querySelector('.toast');
        if(t){ t.textContent='Đã thêm vào giỏ hàng'; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'), 2200); }
    }


    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.bundle-add').forEach(btn=>{
            btn.addEventListener('click', ()=>{
                const card = btn.closest('.bundle-item');
                if (!card) return;

                addQuick({
                    id: card.dataset.id,
                    name: card.dataset.name,
                    price: Number(card.dataset.price || 0),
                    image: card.dataset.image || card.querySelector('img')?.src || ''
                });


                setTimeout(() => location.reload(), 150);
            });
        });
    });



    const dInput = document.getElementById('shipDate');
    const sInput = document.getElementById('shipSlot');
    const saveBtn = document.querySelector('.save-slot');
    const savedEl = document.getElementById('shipSaved');

    if(dInput){

        const today = new Date(); today.setHours(0,0,0,0);
        dInput.min = today.toISOString().slice(0,10);


        try{
            const keep = JSON.parse(localStorage.getItem(LS_SHIP)||'{}');
            if(keep.date) dInput.value = keep.date;
            if(keep.slot && sInput) sInput.value = keep.slot;
            if(keep.date && keep.slot){ savedEl.hidden=false; savedEl.innerHTML = `Đã lưu: <b>${keep.date}</b> • <b>${keep.slot}</b>`; }
        }catch{}

        if(saveBtn){
            saveBtn.addEventListener('click', ()=>{
                const data = {date: dInput.value, slot: sInput?.value||''};
                if(!data.date){ savedEl.hidden=false; savedEl.textContent='Vui lòng chọn ngày giao'; return; }
                localStorage.setItem(LS_SHIP, JSON.stringify(data));
                savedEl.hidden=false; savedEl.innerHTML = `Đã lưu: <b>${data.date}</b> • <b>${data.slot||'—'}</b>`;
            });
        }
    }


    const recentWrap = document.getElementById('recentList');
    const recentEmpty = document.getElementById('recentEmpty');
    if(recentWrap){
        let rec = [];
        try{ rec = JSON.parse(localStorage.getItem('hb_recent')||'[]'); }catch{}
        if(rec.length){
            recentEmpty?.remove();
            rec.slice(-6).reverse().forEach(p=>{
                const el = document.createElement('article');
                el.className = 'recent-item';
                el.innerHTML = `
          <img src="${p.image||'assets/img/placeholder.jpg'}" alt="${p.name}">
          <div>
            <p class="ri-name">${p.name}</p>
            <p class="ri-price">${fmt(p.price)}</p>
          </div>
          <div class="ri-actions">
            <button class="mini-add" type="button">Thêm</button>
          </div>`;
                recentWrap.appendChild(el);
                el.querySelector('.mini-add').onclick = ()=>{
                    addQuick({id:p.id,name:p.name,price:Number(p.price||0),image:p.image||''});
                    setTimeout(()=>location.reload(),200);
                };
            });
        }
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    const goCart = () => { window.location.href = 'Cart.html'; };


    const topbar = document.querySelector('.topbar');
    if (topbar) {
        topbar.style.cursor = 'pointer';
        topbar.addEventListener('click', (e) => {
            if (e.target.closest('a')) return;
            goCart();
        });
    }


    const header = document.querySelector('header');
    if (header) {
        header.style.cursor = 'pointer';
        header.addEventListener('click', (e) => {
            if (e.target.closest('a')) return;
            goCart();
        });
    }

    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            goCart();
        });
    }
});


