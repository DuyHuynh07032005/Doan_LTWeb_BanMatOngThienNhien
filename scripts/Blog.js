// Blog.js

document.addEventListener('DOMContentLoaded', function() {
    // --- Khai báo hằng số và Chọn phần tử ---
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const articlesArea = document.getElementById('articles-list');
    const categoryLinks = document.querySelectorAll('.categories-widget a');
    const paginationContainer = document.querySelector('.pagination');
    const postsPerPage = 3; // Số bài viết cố định trên mỗi trang

    // Lấy tất cả bài viết gốc
    const allPosts = Array.from(articlesArea.querySelectorAll('.blog-post'));
    let currentFilterCategory = '';

    // Tạo phần tử thông báo không có kết quả
    const noResultsMessage = document.createElement('p');
    noResultsMessage.textContent = 'Không tìm thấy bài viết nào phù hợp với tiêu chí tìm kiếm của bạn.';
    noResultsMessage.style.cssText = 'color: #777; font-style: italic; margin-top: 20px; text-align: center; display: none;';
    articlesArea.appendChild(noResultsMessage);

    // --- LOGIC SẮP XẾP VÀ PHÂN TÍCH NGÀY ---

    // Hàm đã sửa lỗi Parse Date
    function parseVietnameseDate(dateStr) {
        const parts = dateStr.split('/');
        if (parts.length !== 3) return new Date('1970-01-01');
        const isoDateString = `${parts[2]}-${parts[1]}-${parts[0]}`;
        const dateValue = new Date(isoDateString);
        if (isNaN(dateValue.getTime())) {
            return new Date('1970-01-01');
        }
        return dateValue;
    }

    // 1. Thu thập dữ liệu, ngày đăng, và danh mục (dạng Object)
    const postsWithDate = allPosts.map(post => {
        const metaText = post.querySelector('.post-meta')?.textContent || '';
        const dateMatch = metaText.match(/(\d{2}\/\d{2}\/\d{4})/);
        const dateString = dateMatch ? dateMatch[0] : '01/01/1970';
        const category = (post.querySelector('.post-category')?.textContent || '').toLowerCase().trim();

        return {
            element: post,
            keywords: post.getAttribute('data-keywords').toLowerCase(),
            category: category,
            date: parseVietnameseDate(dateString)
        };
    });

    // 2. Sắp xếp: Mới nhất lên đầu (Giảm dần: b.date - a.date)
    postsWithDate.sort((a, b) => b.date - a.date);

    // Lưu trữ mảng bài viết đã sắp xếp
    const sortedPostObjects = postsWithDate;


    // -----------------------------------------------------------------
    // --- CẬP NHẬT SỐ ĐẾM DANH MỤC TRONG SIDEBAR ---
    // -----------------------------------------------------------------
    function updateCategoryCounts() {
        const counts = {};

        sortedPostObjects.forEach(post => {
            const cat = post.category;
            counts[cat] = (counts[cat] || 0) + 1;
        });

        categoryLinks.forEach(link => {
            const categoryName = link.getAttribute('data-category').toLowerCase().trim();
            const count = counts[categoryName] || 0;
            const countSpan = link.querySelector('.category-count');
            if (countSpan) {
                countSpan.textContent = `(${count})`;
            }
        });
    }


    // -----------------------------------------------------------------
    // --- HÀM 1: TẠO VÀ CẬP NHẬT NÚT PHÂN TRANG ---
    // -----------------------------------------------------------------
    function renderPagination(total, currentPage) {
        if (!paginationContainer) return;

        if (total <= 1) {
            paginationContainer.style.display = 'none';
            return;
        }
        paginationContainer.style.display = 'flex';

        const forwardLink = paginationContainer.querySelector('a:last-child');

        // Xóa tất cả các nút số cũ
        paginationContainer.querySelectorAll('a[data-page]').forEach(link => {
            if (link.textContent !== '→' && link.textContent !== '←') link.remove();
        });

        // Tạo các nút số mới
        for (let i = 1; i <= total; i++) {
            const newLink = document.createElement('a');
            newLink.href = '#';

            newLink.textContent = i.toString();
            newLink.setAttribute('data-page', i.toString());

            if (i === currentPage) {
                newLink.classList.add('active');
            }

            newLink.addEventListener('click', function(e) {
                e.preventDefault();
                const page = parseInt(this.getAttribute('data-page'));
                showPage(page);
            });

            paginationContainer.insertBefore(newLink, forwardLink);
        }
    }


    // -----------------------------------------------------------------
    // --- HÀM 2: LỌC & PHÂN TRANG CHÍNH ---
    // -----------------------------------------------------------------
    function filterPosts(searchTerm, filterCategory, currentPage) {
        const lowerSearchTerm = searchTerm.toLowerCase().trim();

        const filteredResults = sortedPostObjects.filter(post => {
            const matchesSearch = !lowerSearchTerm || post.keywords.includes(lowerSearchTerm);
            const matchesCategory = !filterCategory || post.category === filterCategory.toLowerCase().trim();

            return matchesSearch && matchesCategory;
        });

        // TÍNH TOÁN PHÂN TRANG DỰA TRÊN KẾT QUẢ LỌC MỚI
        const currentTotalPosts = filteredResults.length;
        const currentTotalPages = Math.ceil(currentTotalPosts / postsPerPage);

        // Đảm bảo trang hiện tại hợp lệ sau khi lọc
        if (currentPage > currentTotalPages && currentTotalPages > 0) currentPage = currentTotalPages;
        if (currentPage < 1 && currentTotalPages > 0) currentPage = 1;

        const startIndex = (currentPage - 1) * postsPerPage;
        const endIndex = startIndex + postsPerPage;

        let visiblePostCount = 0;

        // ẨN TẤT CẢ BÀI VIẾT GỐC (reset hiển thị)
        allPosts.forEach(post => post.style.display = 'none');

        // HIỂN THỊ CÁC BÀI VIẾT TỪ DANH SÁCH LỌC (CÓ PHÂN TRANG)
        for (let i = startIndex; i < endIndex && i < currentTotalPosts; i++) {
            const postObject = filteredResults[i];
            postObject.element.style.display = 'flex'; // Hiển thị element DOM
            visiblePostCount++;
        }

        // Cập nhật thông báo và RENDER PHÂN TRANG MỚI
        if (visiblePostCount === 0) {
            noResultsMessage.style.display = 'block';
        } else {
            noResultsMessage.style.display = 'none';
        }

        renderPagination(currentTotalPages, currentPage);
    }

    // -----------------------------------------------------------------
    // --- HÀM 3: XỬ LÝ CHUYỂN TRANG ---
    // -----------------------------------------------------------------
    function showPage(pageNumber) {
        // Áp dụng lại bộ lọc và phân trang cho Trang mới
        filterPosts(searchInput.value, currentFilterCategory, pageNumber);
    }


    // -----------------------------------------------------------------
    // --- GÁN SỰ KIỆN VÀ KHỞI TẠO (BLOG) ---
    // -----------------------------------------------------------------

    // Xử lý sự kiện Tìm kiếm
    const handleSearch = () => showPage(1);
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // Xử lý sự kiện Lọc theo Danh mục
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const category = this.getAttribute('data-category');

            // Logic chuyển đổi trạng thái lọc và highlight
            if (currentFilterCategory === category) {
                currentFilterCategory = '';
                this.style.fontWeight = 'normal';
            } else {
                categoryLinks.forEach(l => l.style.fontWeight = 'normal');
                currentFilterCategory = category;
                this.style.fontWeight = 'bold';
            }

            // Đưa về trang 1 và lọc lại bài viết
            showPage(1);
        });
    });

    // --- KHỞI TẠO BAN ĐẦU (BLOG) ---
    updateCategoryCounts();
    showPage(1);


});