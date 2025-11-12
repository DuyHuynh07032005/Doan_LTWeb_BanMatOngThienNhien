// Contact.js - Xử lý Form Liên hệ VÀ Slideshow Banner

document.addEventListener('DOMContentLoaded', function() {

    /* =======================================================
       PHẦN 1: XỬ LÝ FORM LIÊN HỆ
       ======================================================= */
    const form = document.getElementById('contact-form'); // Đảm bảo ID form là 'contact-form'
    const messageDisplay = document.getElementById('form-message'); // Element để hiển thị thông báo

    // Hàm kiểm tra định dạng email bằng Regex
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault(); // Ngăn chặn hành vi gửi form mặc định

            const nameInput = document.getElementById('contact-name');
            const emailInput = document.getElementById('contact-email');
            const subjectInput = document.getElementById('contact-subject');
            const messageText = document.getElementById('contact-message-text');

            // Lấy giá trị sau khi loại bỏ khoảng trắng dư thừa
            const name = nameInput?.value.trim() || '';
            const email = emailInput?.value.trim() || '';
            const subject = subjectInput?.value.trim() || '';
            const message = messageText?.value.trim() || '';

            // Khởi tạo thông báo
            if (messageDisplay) {
                messageDisplay.textContent = '';
                messageDisplay.style.color = 'red';
            }

            // --- XÁC THỰC BƯỚC 1: Kiểm tra trường bắt buộc ---
            if (!name || !email || !subject || !message) {
                if (messageDisplay) messageDisplay.textContent = 'Vui lòng điền đầy đủ các trường bắt buộc.';
                return;
            }

            // --- XÁC THỰC BƯỚC 2: Định dạng Email không hợp lệ ---
            if (!isValidEmail(email)) {
                if (messageDisplay) messageDisplay.textContent = 'Địa chỉ email không hợp lệ.';
                emailInput?.focus();
                return;
            }

            // --- GIẢ LẬP GỬI THÀNH CÔNG ---
            if (messageDisplay) {
                messageDisplay.textContent = '✅ Cảm ơn bạn! Tin nhắn của bạn đã được gửi thành công.';
                messageDisplay.style.color = 'green';
            }
            // Xóa nội dung form sau khi gửi
            form.reset();
        });
    }

    /* =======================================================
       PHẦN 2: LOGIC BANNER SLIDESHOW (4 ẢNH CỐ ĐỊNH)
       ======================================================= */

    // Hàm lấy danh sách 4 ảnh cố định
    function getActiveBanners() {
        // ⚠️ THAY THẾ CÁC ĐƯỜNG DẪN ẢNH NÀY BẰNG ẢNH THỰC TẾ CỦA BẠN ⚠️
        const fixedBanners = [
            "../assets/banner1.jpg", // Ảnh Cố định 1 (24/24)
            "../assets/banner2.jpg"  // Ảnh Cố định 2 (24/24)
        ];

        // Khung giờ VÀNG (10:00 - 14:00)
        const bannerForSlotA = "../assets/banner3.jpg"; // Khuyến mãi trưa

        // Khung giờ CÒN LẠI (Ngoài 10:00 - 14:00)
        const bannerForSlotB = "../assets/banner4.jpg"; // Khuyến mãi tối

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

});