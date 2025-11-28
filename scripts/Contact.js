// Contact.js - Xử lý Form Liên hệ VÀ Slideshow Banner

document.addEventListener('DOMContentLoaded', function() {

    /* =======================================================
       PHẦN 1: XỬ LÝ FORM LIÊN HỆ
       ======================================================= */
    const messageDisplay = document.getElementById('form-message'); // Element để hiển thị thông báo

    // Hàm kiểm tra định dạng email bằng Regex
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    if (form) {
        form.addEventListener('submit', function(event) {


            const name = nameInput?.value.trim() || '';
            const email = emailInput?.value.trim() || '';
            const message = messageText?.value.trim() || '';

            if (messageDisplay) {
                messageDisplay.textContent = '';
                messageDisplay.style.color = 'red';
            }

                if (messageDisplay) messageDisplay.textContent = 'Vui lòng điền đầy đủ các trường bắt buộc.';
                return;
            }

            if (!isValidEmail(email)) {
                if (messageDisplay) messageDisplay.textContent = 'Địa chỉ email không hợp lệ.';
                emailInput?.focus();
                return;
            }

            if (messageDisplay) {
                messageDisplay.textContent = '✅ Cảm ơn bạn! Tin nhắn của bạn đã được gửi thành công.';
                messageDisplay.style.color = 'green';
            }
            form.reset();
        });
    }

    /* =======================================================
       PHẦN 2: LOGIC BANNER SLIDESHOW (4 ẢNH CỐ ĐỊNH)
       ======================================================= */

    function getActiveBanners() {
        return [
        ];
    }

    let slideIndex = 0;
    let slideshowInterval;

    function setupSlideshow() {
        const slideContainer = document.getElementById('slide-container');
        const dotsContainer = document.getElementById('dots-container');

        if (!slideContainer || !dotsContainer || bannerUrls.length === 0) return;

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
        clearInterval(slideshowInterval);
        slideshowInterval = setInterval(() => {
            plusSlides(1);
        }, 2000);
    }

    function resetTimer() {
        startTimer();
    }

    // Chức năng chuyển slide chính
    function showSlides(n) {
        const slides = document.querySelectorAll('.banner-slide');
        const dots = document.querySelectorAll('.dot');

        if (slides.length === 0) return;

        if (n >= slides.length) { slideIndex = 0 }
        if (n < 0) { slideIndex = slides.length - 1 }

        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

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

    setupSlideshow();
});