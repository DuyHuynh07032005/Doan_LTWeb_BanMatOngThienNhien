(function () {
    const KEY = "hb_cart";

    const safeParse = (txt) => { try { const p = JSON.parse(txt); return Array.isArray(p) ? p : []; } catch { return []; } };
    const getCart   = () => safeParse(localStorage.getItem(KEY));
    const setCart   = (c) => { localStorage.setItem(KEY, JSON.stringify(c)); updateBadge(c); };
    const countCart = (cart = getCart()) => cart.reduce((s, i) => s + (i.qty || 0), 0);

    function updateBadge(cart = getCart()) {
        const badgeEl = document.getElementById("cartBadge");
        if (badgeEl) badgeEl.textContent = String(countCart(cart));
    }

    function addToCartFrom(el, { redirect = false, delay = 450 } = {}) {

        const card = el?.closest?.(".product");
        if (!card) return;


        const rawPrice = Number(card.dataset.price ?? 0);
        const price = Number.isFinite(rawPrice) && rawPrice >= 0 ? rawPrice : 0;

        const item = {
            id:    card.dataset.id || (window.crypto?.randomUUID?.() ?? String(Date.now())),
            name:  card.dataset.name || "Sản phẩm",
            price,
            image: card.dataset.image || "",
            qty:   1
        };


        el.disabled = true;


        const cart = getCart();
        const found = cart.find(x => x.id === item.id);
        if (found) found.qty += 1; else cart.push(item);
        setCart(cart);


        if (typeof window.showCartAlert === "function") window.showCartAlert();


        try {
            el.animate(
                [{ transform: "scale(1)" }, { transform: "scale(1.1)" }, { transform: "scale(1)" }],
                { duration: 180, easing: "ease-out" }
            );
        } catch {}


        setTimeout(() => { el.disabled = false; }, 300);

        // "Mua ngay" → cho 1 nhịp nhìn toast rồi mới sang giỏ
        if (redirect) {
            setTimeout(() => { location.href = "cart.html"; }, delay);
        }
    }


    document.addEventListener("click", (e) => {
        const addBtn = e.target.closest(".btn-cart");
        const buyBtn = e.target.closest(".btn-buy");
        if (addBtn) addToCartFrom(addBtn);
        if (buyBtn) addToCartFrom(buyBtn, { redirect: true, delay: 450 });
    });


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

(function(){
    const LS_CART = 'hb_cart';
    const LS_SHIP = 'hb_delivery';
    const fmt = n => (n||0).toLocaleString('vi-VN',{style:'currency',currency:'VND',maximumFractionDigits:0});


    function addQuick(it){
        const items = JSON.parse(localStorage.getItem(LS_CART)||'[]');
        const f = items.find(x=>x.id===it.id);
        if(f){ f.qty += 1; } else { items.push({...it, qty:1}); }
        localStorage.setItem(LS_CART, JSON.stringify(items));
        // nếu trang đang có badge/Cart.js sẽ tự recalc; thêm thông báo nhẹ
        const t = document.querySelector('.toast');
        if(t){ t.textContent='Đã thêm vào giỏ hàng'; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'), 2200); }
    }


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

(function () {
    const PER = 16;
    const pager = document.getElementById('pager');
    if (!pager) return;
    let current = 1;

    function makeBtn(text, cls, disabled, onClick) {
        const b = document.createElement('button');
        b.className = 'page-btn ' + (cls || '');
        b.innerHTML = (text === '<') ? '&lt;' : (text === '>') ? '&gt;' : text;
        b.disabled = !!disabled;
        b.onclick = onClick;
        return b;
    }

    function renderPager(total) {
        pager.innerHTML = '';
        pager.style.display = total > 1 ? 'flex' : 'none';
        pager.appendChild(makeBtn('<','prev', current === 1, () => showPage(current - 1)));
        for (let p = 1; p <= total; p++) {
            const b = makeBtn(String(p), '', false, () => showPage(p));
            if (p === current) b.classList.add('is-active');
            pager.appendChild(b);
        }
        pager.appendChild(makeBtn('>','next', current === total, () => showPage(current + 1)));
    }

    function showPage(page) {

        const items = Array.from(document.querySelectorAll('.product-list .product:not([hidden])'));
        const total = Math.max(1, Math.ceil(items.length / PER));
        current = Math.min(Math.max(1, page), total);

        const start = (current - 1) * PER, end = start + PER;

        document.querySelectorAll('.product-list .product').forEach(el => el.style.display = 'none');
        // Chỉ hiện phần trang hiện tại trong tập đã lọc
        items.slice(start, end).forEach(el => el.style.display = '');

        renderPager(total);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }


    window.showPage = showPage;
    showPage(1);
})();



(function () {
    const section = document.querySelector('.product-list');
    const sortSel = document.getElementById('sortSelect');
    const sortBar = document.querySelector('.top-sortbar'); // mốc để chèn lại sản phẩm
    if (!section || !sortSel || !sortBar) return;

    // Chụp thứ tự ban đầu để reset khi chọn "Mới nhất"
    const initial = Array.from(section.querySelectorAll('.product'));

    function sortProducts(mode) {
        const items = [...initial];
        if (mode === 'priceAsc')  items.sort((a, b) => (+a.dataset.price) - (+b.dataset.price));
        if (mode === 'priceDesc') items.sort((a, b) => (+b.dataset.price) - (+a.dataset.price));
        return items;
    }


    function placeProducts(nodes) {
        const frag = document.createDocumentFragment();
        nodes.forEach(n => frag.appendChild(n));
        section.insertBefore(frag, sortBar); // chèn TRƯỚC thanh sắp xếp
    }

    function fadeOutIn(cb) {
        section.style.transition = 'opacity .35s ease';
        section.style.opacity = '0';
        setTimeout(() => { cb?.(); section.style.opacity = '1'; }, 350);
    }

    sortSel.addEventListener('change', () => {
        const val = sortSel.value; // newest | priceAsc | priceDesc
        fadeOutIn(() => {
            const nodes = (val === 'newest') ? initial : sortProducts(val);
            placeProducts(nodes);
            // Sau sắp xếp quay về TRANG 1
            if (typeof window.showPage === 'function') window.showPage(1);
        });
    });
})();

(function () {
    const list = document.querySelector('.product-list');
    const catList = document.getElementById('catList');
    if (!list || !catList) return;

    catList.querySelectorAll('li').forEach(li => {
        li.addEventListener('click', () => {

            catList.querySelectorAll('li').forEach(x => x.classList.remove('is-active'));
            li.classList.add('is-active');


            const filter = li.dataset.filter || 'all';
            list.querySelectorAll('.product').forEach(card => {
                const show = (filter === 'all') || (card.dataset.cat === filter);
                card.hidden = !show;              // <-- ẨN/HIỆN bằng thuộc tính hidden
            });


            if (typeof window.showPage === 'function') window.showPage(1);


            const top = list.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });
})();

document.addEventListener('click', (e) => {
    const clickOn = e.target;
    const card = clickOn.closest('.product');
    if (!card) return;


    if (!(clickOn.matches('img') || clickOn.closest('.name'))) return;


    const current = {
        id: card.dataset.id, name: card.dataset.name, price: Number(card.dataset.price||0),
        image: card.dataset.image || card.querySelector('img')?.getAttribute('src') || '',
        cat: card.dataset.cat || 'other', discount: card.querySelector('.discount')?.textContent?.trim() || ''
    };


    const catalog = Array.from(document.querySelectorAll('.product-list .product')).map(p => ({
        id: p.dataset.id, name: p.dataset.name, price: Number(p.dataset.price||0),
        image: p.dataset.image || p.querySelector('img')?.getAttribute('src') || '',
        cat: p.dataset.cat || 'other', discount: p.querySelector('.discount')?.textContent?.trim() || ''
    }));

    localStorage.setItem('hb_current', JSON.stringify(current));
    localStorage.setItem('hb_catalog', JSON.stringify(catalog));

    // điều hướng (để reload vẫn lấy được theo id)
    location.href = `product-detail.html?id=${encodeURIComponent(current.id)}`;
});
