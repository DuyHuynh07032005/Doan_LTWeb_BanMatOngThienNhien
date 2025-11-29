// KHÔNG cần cấu hình tài khoản nữa
// const ADMIN_ACCOUNT = {...}

const LOGIN_KEY = "hb_admin_logged_in";
const ADMIN_NAME_KEY = "hb_admin_name";

// (tạm thời bỏ auto-redirect cho đỡ rối)
// Nếu sau này muốn: kiểm tra đã login thì tự vào dashboard, có thể thêm lại sau

const form = document.getElementById("adminLoginForm");
const emailInput = document.getElementById("adminEmail");
const passwordInput = document.getElementById("adminPassword");
const errorEl = document.getElementById("loginError");

form.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // ——— CHỈ CHECK CÓ NHẬP EMAIL LÀ CHO ĐĂNG NHẬP ———
    if (email === "") {
        errorEl.textContent = "Vui lòng nhập email!";
        errorEl.style.display = "block";
        return;
    }

    // Cho login với bất kỳ email + mật khẩu nào
    localStorage.setItem(LOGIN_KEY, "1");
    localStorage.setItem(ADMIN_NAME_KEY, email); // hoặc đặt tên cố định "Admin Honey"

    // 🔥 SAU KHI ĐĂNG NHẬP → VÀO DASHBOARD
    window.location.href = "Admin-Dashboard.html";
});
