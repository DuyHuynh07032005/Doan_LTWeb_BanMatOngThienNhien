// Xử lý đăng nhập
function loginUser(e) {
  e.preventDefault();

  const email = document.getElementById("email").value;

  // Lưu trạng thái đăng nhập
  localStorage.setItem("loggedIn", "true");
  localStorage.setItem("username", email);

  // Chuyển về trang chủ
  window.location.href = "index.html";
}

// Xử lý hiển thị giao diện sau khi login
document.addEventListener("DOMContentLoaded", function () {
  const loggedIn = localStorage.getItem("loggedIn") === "true";
  const username = localStorage.getItem("username");
  const topbarLinks = document.querySelector(".topbar-links");

  if (loggedIn && topbarLinks) {
    topbarLinks.innerHTML = `
      <span style="margin-right: 8px;">Xin chào, ${username}</span>
      <a href="#" onclick="logout()">Đăng xuất</a>
    `;
  }
});

// Hàm logout phải ở ngoài để có thể gọi từ onclick
function logout() {
  // Xóa trạng thái đăng nhập
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("username");

  // Chuyển về trang login
  window.location.href = "index.html";
}

// Xử lý đăng ký
function signupUser(event) {
  event.preventDefault();

  const password = document.getElementById("signup-password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  if (password !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
  }

  alert("Đăng ký thành công!");
  window.location.href = "login.html"; 
}
