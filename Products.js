(function () {
    const KEY = "hb_cart";



        if (!card) return;
        const item = {
            name:  card.dataset.name || "Sản phẩm",
        };


        setCart(cart);


    }

    document.addEventListener("click", (e) => {
        const addBtn = e.target.closest(".btn-cart");
        const buyBtn = e.target.closest(".btn-buy");
        if (addBtn) addToCartFrom(addBtn);
    });

    document.addEventListener("DOMContentLoaded", updateBadge);
})();

});
