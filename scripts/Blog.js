
document.addEventListener('DOMContentLoaded', function() {


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

    setupSlideshow();
});