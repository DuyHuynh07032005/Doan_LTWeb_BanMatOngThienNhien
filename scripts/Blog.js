// Blog.js

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const articlesArea = document.getElementById('articles-list');
    const categoryLinks = document.querySelectorAll('.categories-widget a');

    let currentFilterCategory = '';

    const noResultsMessage = document.createElement('p');
    noResultsMessage.textContent = 'Không tìm thấy bài viết nào phù hợp với tiêu chí tìm kiếm của bạn.';
    noResultsMessage.style.cssText = 'color: #777; font-style: italic; margin-top: 20px; text-align: center; display: none;';
    articlesArea.appendChild(noResultsMessage);






            }
        });

        if (visiblePostCount === 0) {
            noResultsMessage.style.display = 'block';
        } else {
            noResultsMessage.style.display = 'none';
        }
    }

    }


    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const category = this.getAttribute('data-category');

            if (currentFilterCategory === category) {
                currentFilterCategory = '';
            } else {
                currentFilterCategory = category;
            }

        });
    });

});