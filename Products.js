(function () {
    const KEY = "hb_cart";

    // Helpers
    const safeParse = (txt) => { try { return JSON.parse(txt); } catch { return null; } };
    const getCart   = () => safeParse(localStorage.getItem(KEY)) || [];
    const setCart   = (c) => { localStorage.setItem(KEY, JSON.stringify(c)); updateBadge(c); };

    function updateBadge(cart = getCart()) {
        const badgeEl = document.getElementById("cartBadge");
        if (badgeEl) badgeEl.textContent = String(countCart(cart));
    }

    function addToCartFrom(el, { redirect = false, delay = 450 } = {}) {
        // tìm thẻ .product gần nhất
        const card = el?.closest?.(".product");
        if (!card) return;

        // lấy dữ liệu sản phẩm
        const rawPrice = Number(card.dataset.price ?? 0);
        const price = Number.isFinite(rawPrice) && rawPrice >= 0 ? rawPrice : 0;

        const item = {
            id:    card.dataset.id || (window.crypto?.randomUUID?.() ?? String(Date.now())),
            name:  card.dataset.name || "Sản phẩm",
            price,
            image: card.dataset.image || "",
            qty:   1
        };

        // chống double-click
        el.disabled = true;

        // cập nhật giỏ
        const cart = getCart();
        const found = cart.find(x => x.id === item.id);
        if (found) found.qty += 1; else cart.push(item);
        setCart(cart);

        // thông báo (nếu có hàm)
        if (typeof window.showCartAlert === "function") window.showCartAlert();

        // hiệu ứng nút
        try {
            el.animate(
                [{ transform: "scale(1)" }, { transform: "scale(1.1)" }, { transform: "scale(1)" }],
                { duration: 180, easing: "ease-out" }
            );
        } catch {}

        // mở lại nút sau 300ms
        setTimeout(() => { el.disabled = false; }, 300);

        // "Mua ngay" → cho 1 nhịp nhìn toast rồi mới sang giỏ
        if (redirect) {
            setTimeout(() => { location.href = "cart.html"; }, delay);
        }
    }

    // Ủy quyền click cho nút thêm & mua ngay
    document.addEventListener("click", (e) => {
        const addBtn = e.target.closest(".btn-cart");
        const buyBtn = e.target.closest(".btn-buy");
        if (addBtn) addToCartFrom(addBtn);
        if (buyBtn) addToCartFrom(buyBtn, { redirect: true, delay: 450 });
    });

    // Cập nhật badge khi trang sẵn sàng
    document.addEventListener("DOMContentLoaded", updateBadge);
})();

document.addEventListener("DOMContentLoaded", () => {
    const cartIcon = document.getElementById("cartIcon");
    if (cartIcon) {
        cartIcon.addEventListener("click", () => {
            window.location.href = "Cart.html";
        });
    }
});
// ===== ADDONS =====
(function(){
    const LS_CART = 'hb_cart';
    const LS_SHIP = 'hb_delivery';
    const fmt = n => (n||0).toLocaleString('vi-VN',{style:'currency',currency:'VND',maximumFractionDigits:0});

    // Helper: thêm nhanh vào giỏ (không phụ thuộc code khác)
    function addQuick(it){
        const items = JSON.parse(localStorage.getItem(LS_CART)||'[]');
        const f = items.find(x=>x.id===it.id);
        if(f){ f.qty += 1; } else { items.push({...it, qty:1}); }
        localStorage.setItem(LS_CART, JSON.stringify(items));
        // nếu trang đang có badge/Cart.js sẽ tự recalc; thêm thông báo nhẹ
        const t = document.querySelector('.toast');
        if(t){ t.textContent='Đã thêm vào giỏ hàng'; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'), 2200); }
    }

    // --- Mua kèm giá tốt ---
    document.querySelectorAll('.bundle-add').forEach(btn=>{
        btn.addEventListener('click', ()=>{
            const card = btn.closest('.bundle-item');
            addQuick({
                id: card.dataset.id,
                name: card.dataset.name,
                price: Number(card.dataset.price||0),
                image: card.dataset.image || card.querySelector('img')?.src || ''
            });
            // render lại nếu có hàm renderList của Cart.js
            if (typeof window !== 'undefined') setTimeout(()=>location.reload(), 200);
        });
    });

    // --- Lịch giao hàng ---
    const dInput = document.getElementById('shipDate');
    const sInput = document.getElementById('shipSlot');
    const saveBtn = document.querySelector('.save-slot');
    const savedEl = document.getElementById('shipSaved');

    if(dInput){
        // min = hôm nay
        const today = new Date(); today.setHours(0,0,0,0);
        dInput.min = today.toISOString().slice(0,10);

        // load đã lưu
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

    // --- Đã xem gần đây ---
    // Kỳ vọng trang sản phẩm có lưu vào LS key 'hb_recent' dạng [{id,name,price,image}]
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


