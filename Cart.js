// ===== CART.JS =====
(() => {
    const KEY = "hb_cart";
    const FREE_SHIP = 500000;
    const SHIP_PRICE = { standard: 30000, express: 55000 };

    // ---------- helpers ----------
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

        // 1) Tìm toolbar (đang có sẵn trong HTML)
        const toolbar = list.querySelector(".toolbar");

        // 2) Tạo vùng chứa rows riêng, đặt NGAY TRƯỚC toolbar (nếu chưa có)
        let rowsWrap = list.querySelector(".rows-wrap");
        if (!rowsWrap) {
            rowsWrap = document.createElement("div");
            rowsWrap.className = "rows-wrap";
            if (toolbar) list.insertBefore(rowsWrap, toolbar);
            else list.appendChild(rowsWrap); // fallback nếu chưa có toolbar
        }

        // 3) Render các dòng sản phẩm vào rowsWrap (KHÔNG đụng phần addon bên dưới)
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


    // ---------- tính tiền ----------
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
        if (rows[0]) rows[0].textContent = vnd(sub);   // tạm tính
        if (rows[1]) rows[1].textContent = vnd(ship);  // vận chuyển
        if (rows[3]) rows[3].textContent = vnd(total); // thành tiền (row index 3 vì có 'Giảm giá' đứng giữa)

        updateFreeShipBar(sub);
    }

    // ---------- thao tác trên từng dòng ----------
    function attachRowHandlers() {
        // +/- và nhập số lượng
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

        // Chọn tất cả & xóa đã chọn
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

    // ---------- payment panel ----------
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

    // ship radio thay đổi → tính lại
    function initShipRadios() {
        document.addEventListener("change", (e) => {
            if (e.target.matches('input[name="ship"]')) updateTotals();
        });
    }

    // Thanh toán: demo tạo payload đơn hàng
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

    // ---------- boot ----------
    document.addEventListener("DOMContentLoaded", () => {
        // Nếu trong Cart.html bạn vẫn giữ 2 item mẫu, hãy xóa chúng:
        $$(".list .row").forEach(el => el.remove());

        renderCart();
        initPaymentPanels();
        initShipRadios();
        initCheckout();
        cartBadge();
    });
})();
//====== ADDONS =====
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
// Điều hướng sang trang giỏ hàng từ topbar / header / nút giỏ
document.addEventListener('DOMContentLoaded', () => {
    const goCart = () => { window.location.href = 'Cart.html'; }; // đúng tên file (hoa/thường)

    // 1) Toàn dải topbar (trừ khi bấm vào 1 <a> bên trong topbar)
    const topbar = document.querySelector('.topbar');
    if (topbar) {
        topbar.style.cursor = 'pointer';
        topbar.addEventListener('click', (e) => {
            if (e.target.closest('a')) return;   // tôn trọng link riêng trong topbar
            goCart();
        });
    }

    // 2) (Tuỳ chọn) Click vào vùng header trắng cũng qua giỏ (trừ các link)
    const header = document.querySelector('header');
    if (header) {
        header.style.cursor = 'pointer';
        header.addEventListener('click', (e) => {
            if (e.target.closest('a')) return;
            goCart();
        });
    }

    // 3) Đảm bảo bấm vào "Giỏ hàng" luôn đi (kể cả có JS khác chặn)
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            goCart();
        });
    }
});
// -----------------------------------------------------------------
// --- LOGIC BANNER SLIDESHOW (Thêm vào cuối Blog.js) ---
// -----------------------------------------------------------------

// Hàm lấy danh sách 3 ảnh (2 cố định + 1 động theo giờ)
function getActiveBanners() {
    // ⚠️ THAY THẾ CÁC ĐƯỜNG DẪN ẢNH NÀY BẰNG ẢNH THỰC TẾ CỦA BẠN ⚠️
    const fixedBanners = [
        "../assets/img/banner1.webp", // Ảnh Cố định 1 (24/24)
        "../assets/img/banner2.png"  // Ảnh Cố định 2 (24/24)
    ];

    // Khung giờ VÀNG (10:00 - 14:00)
    const bannerForSlotA = "../assets/img/banner3.jpg"; // Khuyến mãi trưa

    // Khung giờ CÒN LẠI (Ngoài 10:00 - 14:00)
    const bannerForSlotB = "../assets/img/banner4.jpg"; // Khuyến mãi tối

    const now = new Date();
    const currentHour = now.getHours(); // Lấy giờ hiện tại (0-23)

    let activeDynamicBanner;

    // KIỂM TRA KHUNG GIỜ VÀ CHỌN 1 ẢNH ĐỘNG
    // Hiện tại: 21h (21/11/2025). Khung giờ vàng 10-14h đã qua, nên chọn Slot B.
    if (currentHour >= 10 && currentHour < 14) {
        activeDynamicBanner = bannerForSlotA;
    } else {
        activeDynamicBanner = bannerForSlotB;
    }

    // KẾT HỢP: 2 Cố định + 1 Động đã chọn (Tổng cộng 3 ảnh)
    // Code đã tối ưu, loại bỏ cảnh báo 'redundant'
    return [
        ...fixedBanners,
        activeDynamicBanner
    ];
}

let slideIndex = 0;
let slideshowInterval;
const bannerUrls = getActiveBanners(); // Danh sách 3 ảnh cuối cùng

function setupSlideshow() {
    const slideContainer = document.getElementById('slide-container');
    const dotsContainer = document.getElementById('dots-container');

    if (!slideContainer || !dotsContainer || bannerUrls.length === 0) return;

    // 1. TẠO CÁC SLIDE VÀ NÚT ĐIỀU HƯỚNG DỰA TRÊN DANH SÁCH 3 ẢNH
    slideContainer.innerHTML = '';
    dotsContainer.innerHTML = '';

    bannerUrls.forEach((url, index) => {
        // Tạo Slide
        const slide = document.createElement('div');
        slide.classList.add('banner-slide');
        slide.style.backgroundImage = `url('${url}')`;
        slideContainer.appendChild(slide);

        // Tạo Dot
        const dot = document.createElement('span');
        dot.classList.add('dot');
        dot.setAttribute('data-index', index);
        dot.addEventListener('click', () => {
            currentSlide(index);
            resetTimer();
        });
        dotsContainer.appendChild(dot);
    });

    // 2. KHỞI TẠO HIỂN THỊ
    showSlides(slideIndex);

    // 3. THIẾT LẬP CHUYỂN ĐỘNG TỰ ĐỘNG (2 GIÂY)
    startTimer();
}

function startTimer() {
    // Thiết lập timer mới 2000ms (2 giây)
    clearInterval(slideshowInterval);
    slideshowInterval = setInterval(() => {
        plusSlides(1);
    }, 2000);
}

function resetTimer() {
    // Reset timer khi người dùng nhấp vào dot
    startTimer();
}

// Chức năng chuyển slide chính
function showSlides(n) {
    const slides = document.querySelectorAll('.banner-slide');
    const dots = document.querySelectorAll('.dot');

    if (slides.length === 0) return;

    // Logic vòng lặp
    if (n >= slides.length) { slideIndex = 0 }
    if (n < 0) { slideIndex = slides.length - 1 }

    // Ẩn tất cả và bỏ trạng thái active
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    // Hiển thị slide và dot hiện tại
    slides[slideIndex].classList.add('active');
    dots[slideIndex].classList.add('active');
}

// Hàm hỗ trợ chuyển tiếp/lùi slide
function plusSlides(n) {
    showSlides(slideIndex += n);
}

// Hàm hỗ trợ nhấp vào dot
function currentSlide(n) {
    slideIndex = n;
    showSlides(slideIndex);
}

// CHẠY SETUP SLIDESHOW SAU CÙNG
setupSlideshow();
