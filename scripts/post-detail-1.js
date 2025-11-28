
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('comment-form');
    const messageDisplay = document.getElementById('comment-message');

    // Hàm kiểm tra định dạng email
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    if (form) {
        form.addEventListener('submit', function(event) {
            let allFieldsFilled = true;

            // Kiểm tra các trường bắt buộc
            inputs.forEach(input => {
                    allFieldsFilled = false;
                }
            });

            // Reset thông báo lỗi
            messageDisplay.textContent = '';
            messageDisplay.style.color = 'red';

            if (!allFieldsFilled) {
                messageDisplay.textContent = 'Vui lòng điền đầy đủ các trường có dấu (*).';
                return;
            }

            // Kiểm tra định dạng email
            if (emailInput && !isValidEmail(emailInput.value.trim())) {
                messageDisplay.textContent = 'Địa chỉ email không hợp lệ.';
                emailInput.focus();
                return;
            }

            messageDisplay.textContent = '✅ Bình luận của bạn đang chờ phê duyệt.';
            messageDisplay.style.color = 'green';

            // Xóa nội dung form sau khi gửi
            form.reset();
        });
    }
});