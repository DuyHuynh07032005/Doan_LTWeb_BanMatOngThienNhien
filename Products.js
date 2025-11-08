
(function () {
    const KEY = "hb_cart";

    const getCart = () => JSON.parse(localStorage.getItem(KEY) || "[]");
    const setCart = (c) => localStorage.setItem(KEY, JSON.stringify(c));
    const countCart = () => getCart().reduce((s,i)=>s + (i.qty||0), 0);

    const badge = document.getElementById("cartBadge");
    const updateBadge = () => { if (badge) badge.textContent = countCart(); };

    function addToCartFrom(el) {
        const card  = el.closest(".product");
        if (!card) return;
        const item = {
            id:    card.dataset.id || crypto.randomUUID(),
            name:  card.dataset.name || "Sản phẩm",
            price: Number(card.dataset.price || 0),
            image: card.dataset.image || ""
        };

        const cart = getCart();
        const found = cart.find(x => x.id == item.id);
        if (found) found.qty += 1;
        else cart.push({ ...item, qty: 1 });
        showCartAlert(); // Gọi thông báo

        setCart(cart);
        updateBadge();


        el.animate([{transform:'scale(1)'},{transform:'scale(1.1)'},{transform:'scale(1)'}],
            {duration:180, easing:'ease-out'});
    }

    document.addEventListener("click", (e) => {
        const addBtn = e.target.closest(".btn-cart");
        const buyBtn = e.target.closest(".btn-buy");

        if (addBtn) addToCartFrom(addBtn);
        if (buyBtn) {
            addToCartFrom(buyBtn);
        }
    });


    document.addEventListener("DOMContentLoaded", updateBadge);
})();

function showCartAlert() {
    const alert = document.getElementById("cartAlert");
    if (!alert) return;
    alert.classList.add("show");
    setTimeout(() => alert.classList.remove("show"), 2000);
}
document.addEventListener("DOMContentLoaded", ()=>{
    localStorage.removeItem("hb_cart");
    updateBadge();
});
