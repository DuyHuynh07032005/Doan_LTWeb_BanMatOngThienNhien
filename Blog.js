// Contact.js

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contact-form');
    const messageDisplay = document.getElementById('form-message');

    // Hàm kiểm tra định dạng email
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Ngăn chặn hành vi gửi form mặc định

        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const messageInput = document.getElementById('message');

        // Reset thông báo lỗi
        messageDisplay.textContent = '';
        messageDisplay.style.color = 'red';

        // 1. Kiểm tra các trường bắt buộc
        if (nameInput.value.trim() === '' || emailInput.value.trim() === '' || messageInput.value.trim() === '') {
            messageDisplay.textContent = 'Vui lòng điền đầy đủ các trường có dấu (*).';
            return;
        }

        // 2. Kiểm tra định dạng email
        if (!isValidEmail(emailInput.value.trim())) {
            messageDisplay.textContent = 'Địa chỉ email không hợp lệ.';
            return;
        }

        // Nếu tất cả hợp lệ:
        // Giả lập gửi dữ liệu thành công
        messageDisplay.textContent = '🎉 Cảm ơn bạn! Lời nhắn của bạn đã được gửi thành công. Chúng tôi sẽ phản hồi sớm nhất.';
        messageDisplay.style.color = 'green';

        // Xóa nội dung form sau khi gửi
        form.reset();
    });
});