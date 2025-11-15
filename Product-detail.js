// ========== CART UTILS (duy nhất) ==========
(function () {
    const KEY = "hb_cart";
    const safeParse = (t) => { try { return JSON.parse(t); } catch { return null; } };
    const getCart = () => safeParse(localStorage.getItem(KEY)) || [];
    const setCart = (c) => { localStorage.setItem(KEY, JSON.stringify(c)); updateBadge(c); };
    const countCart = (cart = getCart()) => cart.reduce((s, i) => s + (i.qty || 0), 0);

    function updateBadge(cart = getCart()) {
        const badgeEl = document.getElementById("cartBadge");
        if (badgeEl) badgeEl.textContent = String(countCart(cart));
    }
    window.hbCart = { getCart, setCart, updateBadge };
    document.addEventListener('DOMContentLoaded', updateBadge);
})();

// ========== PRODUCT DETAIL ==========
document.addEventListener('DOMContentLoaded', () => {
    const fmt = n => (n||0).toLocaleString('vi-VN',{style:'currency',currency:'VND',maximumFractionDigits:0});
    const qs  = (s) => document.querySelector(s);
    const parsePrice = txt => Number((txt||'').toString().replace(/[^\d]/g,'')||0);

    const urlId = new URLSearchParams(location.search).get('id');
    const currentLS = JSON.parse(localStorage.getItem('hb_current') || '{}');
    const catalog   = JSON.parse(localStorage.getItem('hb_catalog') || '[]');

    // Ưu tiên id trên URL
    let product = catalog.find(p => p.id === urlId) || currentLS;
    if (!product || !product.id) {
        location.replace('Products.html');
        return;
    }

    // ---- Render detail
    qs('#pdImage').src = product.image || 'assets/img/placeholder.jpg';
    qs('#pdImage').alt = product.name;
    qs('#pdName').textContent = product.name;
    qs('#pdId').textContent = product.id;
    qs('#pdPrice').textContent = fmt(product.price);
    qs('#pdCat').textContent = product.cat || 'khác';
    qs('#pdCatText').textContent = product.cat || 'khác';
    qs('#breadcrumbName').textContent = product.name;
    qs('#crumbName').textContent = product.name;

    const dis = (product.discount||'').trim();
    const disEl = qs('#pdDiscount');
    if (dis) { disEl.hidden = false; disEl.textContent = dis; }

    // ---- Qty
    const qtyInput = qs('#qtyInput');
    qs('#qtyMinus')?.addEventListener('click', () => {
        qtyInput.value = Math.max(1, (+qtyInput.value||1) - 1);
    });
    qs('#qtyPlus')?.addEventListener('click', () => {
        qtyInput.value = Math.max(1, (+qtyInput.value||1) + 1);
    });

    // ---- Toast
    const toast = document.getElementById('cartAlert');
    const showToast = () => {
        if (!toast) return;
        toast.classList.add('show');
        setTimeout(()=>toast.classList.remove('show'), 1200);
    };

    // ---- Add to cart (duy nhất)
    function addToCartCore(p, qty=1){
        const cart = hbCart.getCart();
        const f = cart.find(x=>x.id===p.id);
        if (f) f.qty += qty; else cart.push({ id:p.id, name:p.name, price:p.price, image:p.image, qty });
        hbCart.setCart(cart);
        showToast();
    }

    function readProductFromDOM(){
        const id = (qs('#pdId')?.textContent||'').trim() || product.id;
        const name = (qs('#pdName')?.textContent||'').trim() || product.name;
        const price = parsePrice(qs('#pdPrice')?.textContent) || product.price;
        const image = qs('#pdImage')?.getAttribute('src') || product.image || '';
        return { id, name, price, image };
    }

    // ---- Buttons
    qs('#btnAdd')?.addEventListener('click', () => {
        const qty = Math.max(1, Number(qtyInput?.value||1));
        addToCartCore(readProductFromDOM(), qty);
    });

    qs('#btnBuy')?.addEventListener('click', () => {
        const qty = Math.max(1, Number(qtyInput?.value||1));
        addToCartCore(readProductFromDOM(), qty);
        // chuyển tới giỏ
        setTimeout(()=> location.href='Cart.html', 300);
    });

    // ---- Yêu thích (đơn giản: lưu id)
    const favBtn = document.querySelector('.btn-fav');
    favBtn?.addEventListener('click', ()=>{
        const KEY='hb_favs';
        const favs = (()=>{ try{return JSON.parse(localStorage.getItem(KEY))||[]}catch{return[]} })();
        const id = product.id;
        const i = favs.indexOf(id);
        if (i>-1){ favs.splice(i,1); favBtn.classList.remove('active'); }
        else { favs.push(id); favBtn.classList.add('active'); }
        localStorage.setItem(KEY, JSON.stringify(favs));
    });
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
