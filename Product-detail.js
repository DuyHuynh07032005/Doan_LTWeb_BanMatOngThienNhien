
(function () {
    const KEY = "hb_cart";
    const safeParse = (t) => { try { return JSON.parse(t); } catch { return null; } };
    const getCart = () => safeParse(localStorage.getItem(KEY)) || [];
    const setCart = (c) => {
        localStorage.setItem(KEY, JSON.stringify(c));
        updateBadge(c);
    };
    const countCart = (cart = getCart()) =>
        cart.reduce((s, i) => s + (i.qty || 0), 0);

    function updateBadge(cart = getCart()) {
        const badgeEl = document.getElementById("cartBadge");
        if (badgeEl) badgeEl.textContent = String(countCart(cart));
    }

    window.hbCart = { getCart, setCart, updateBadge };
    document.addEventListener("DOMContentLoaded", updateBadge);
})();



document.addEventListener("DOMContentLoaded", () => {

    const fmt = n =>
        (n || 0).toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0
        });

    const qs = (s) => document.querySelector(s);
    const parsePrice = txt =>
        Number((txt || "").toString().replace(/[^\d]/g, "") || 0);


    const urlId = new URLSearchParams(location.search).get("id");
    const currentLS = JSON.parse(localStorage.getItem("hb_current") || "{}");
    const catalog = JSON.parse(localStorage.getItem("hb_catalog") || "[]");

    let product =
        catalog.find(p => p.id === urlId) ||
        currentLS;

    if (!product || !product.id) {
        console.warn("Không tìm thấy sản phẩm, quay về Products");
        location.replace("Products.html");
        return;
    }


    const imgEl = qs("#pdImage");
    if (imgEl) {
        imgEl.src = product.image || "assets/img/placeholder.jpg";
        imgEl.alt = product.name || "";
    }

    qs("#pdName") && (qs("#pdName").textContent = product.name || "");
    qs("#pdId") && (qs("#pdId").textContent = product.id || "");
    qs("#pdPrice") && (qs("#pdPrice").textContent = fmt(product.price || 0));
    qs("#pdCat") && (qs("#pdCat").textContent = product.cat || "khác");
    qs("#pdCatText") && (qs("#pdCatText").textContent = product.cat || "khác");

    // breadcrumb (nếu có thì set, không có thì bỏ qua)
    qs("#breadcrumbName") && (qs("#breadcrumbName").textContent = product.name);
    qs("#crumbName") && (qs("#crumbName").textContent = product.name);


    const disEl = qs("#pdDiscount");
    if (disEl && product.discount) {
        disEl.hidden = false;
        disEl.textContent = product.discount;
    }


    const qtyInput = qs("#qtyInput");
    qs("#qtyMinus")?.addEventListener("click", () => {
        qtyInput.value = Math.max(1, (+qtyInput.value || 1) - 1);
    });
    qs("#qtyPlus")?.addEventListener("click", () => {
        qtyInput.value = Math.max(1, (+qtyInput.value || 1) + 1);
    });


    const toast = document.getElementById("cartAlert");
    const showToast = () => {
        if (!toast) return;
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 1200);
    };


    function addToCartCore(p, qty = 1) {
        const cart = hbCart.getCart();
        const found = cart.find(x => x.id === p.id);
        if (found) {
            found.qty += qty;
        } else {
            cart.push({
                id: p.id,
                name: p.name,
                price: p.price,
                image: p.image,
                qty
            });
        }
        hbCart.setCart(cart);
        showToast();
    }

    function readProductFromDOM() {
        return {
            id: qs("#pdId")?.textContent?.trim() || product.id,
            name: qs("#pdName")?.textContent?.trim() || product.name,
            price: parsePrice(qs("#pdPrice")?.textContent) || product.price,
            image: qs("#pdImage")?.getAttribute("src") || product.image || ""
        };
    }


    qs("#btnAdd")?.addEventListener("click", () => {
        const qty = Math.max(1, Number(qtyInput?.value || 1));
        addToCartCore(readProductFromDOM(), qty);
    });

    qs("#btnBuy")?.addEventListener("click", () => {
        const qty = Math.max(1, Number(qtyInput?.value || 1));
        addToCartCore(readProductFromDOM(), qty);
        setTimeout(() => location.href = "Cart.html", 300);
    });


    const favBtn = qs(".btn-fav");
    favBtn?.addEventListener("click", () => {
        const KEY = "hb_favs";
        const favs = (() => {
            try { return JSON.parse(localStorage.getItem(KEY)) || []; }
            catch { return []; }
        })();

        const i = favs.indexOf(product.id);
        if (i > -1) {
            favs.splice(i, 1);
            favBtn.classList.remove("active");
        } else {
            favs.push(product.id);
            favBtn.classList.add("active");
        }

        localStorage.setItem(KEY, JSON.stringify(favs));
    });
});
