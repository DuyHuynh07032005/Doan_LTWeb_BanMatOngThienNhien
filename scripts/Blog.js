// Blog.js

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const articlesArea = document.getElementById('articles-list');
    const allPosts = articlesArea.querySelectorAll('.blog-post');
    const categoryLinks = document.querySelectorAll('.categories-widget a');

    // Biến lưu trạng thái lọc danh mục hiện tại
    let currentFilterCategory = '';

    // Tạo phần tử để hiển thị thông báo không có kết quả
    const noResultsMessage = document.createElement('p');
    noResultsMessage.textContent = 'Không tìm thấy bài viết nào phù hợp với tiêu chí tìm kiếm của bạn.';
    noResultsMessage.style.cssText = 'color: #777; font-style: italic; margin-top: 20px; text-align: center; display: none;';
    articlesArea.appendChild(noResultsMessage);


    // --- Hàm Tìm kiếm & Lọc chính ---
    function filterPosts(searchTerm, filterCategory) {
        const lowerSearchTerm = searchTerm.toLowerCase().trim();
        let visiblePostCount = 0;

        allPosts.forEach(post => {
            // Lấy từ khóa và danh mục của bài viết
            const keywords = post.getAttribute('data-keywords').toLowerCase();
            const categoryElement = post.querySelector('.post-category');
            const postCategory = categoryElement ? categoryElement.textContent.toLowerCase().trim() : '';

            // 1. Kiểm tra điều kiện tìm kiếm: từ khóa có trong bài viết không?
            const matchesSearch = !lowerSearchTerm || keywords.includes(lowerSearchTerm);

            // 2. Kiểm tra điều kiện lọc theo danh mục: danh mục có khớp không?
            const matchesCategory = !filterCategory || postCategory === filterCategory.toLowerCase().trim();

            // Hiển thị bài viết nếu thỏa mãn cả hai điều kiện
            if (matchesSearch && matchesCategory) {
                post.style.display = 'flex';
                visiblePostCount++;
            } else {
                post.style.display = 'none';
            }
        });

        // Hiển thị/Ẩn thông báo không có kết quả
        if (visiblePostCount === 0) {
            noResultsMessage.style.display = 'block';
        } else {
            noResultsMessage.style.display = 'none';
        }
    }

    // --- Xử lý Tìm kiếm ---
    function handleSearch() {
        // Áp dụng tìm kiếm trên danh mục đang được chọn (currentFilterCategory)
        filterPosts(searchInput.value, currentFilterCategory);
    }

    searchButton.addEventListener('click', handleSearch);

    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // --- Xử lý Lọc theo Danh mục ---
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const category = this.getAttribute('data-category');

            // Nếu click lại danh mục đang active, reset bộ lọc
            if (currentFilterCategory === category) {
                currentFilterCategory = '';
                // Thêm/Xóa class 'active-filter' vào link tại đây nếu cần hiển thị trạng thái
            } else {
                currentFilterCategory = category;
            }

            // Lọc: Giữ nguyên ô tìm kiếm (searchInput.value) và áp dụng danh mục mới
            filterPosts(searchInput.value, currentFilterCategory);
        });
    });

    // Chạy bộ lọc lần đầu để đảm bảo hiển thị đúng (nếu có tham số URL)
    // filterPosts(searchInput.value, currentFilterCategory);
});