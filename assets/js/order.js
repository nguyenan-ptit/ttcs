// assets/js/order.js

// Hàm định dạng tiền tệ VNĐ
function formatVND(amount) {
    return amount.toLocaleString('vi-VN') + ' đ';
}

// Hàm render (hiển thị) giỏ hàng ra HTML
function renderCart() {
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    const subTotalElement = document.getElementById('subTotal');
    const totalAmountElement = document.getElementById('totalAmount');

    // Lấy dữ liệu giỏ hàng từ LocalStorage
    let cart = JSON.parse(localStorage.getItem('elegance_cart')) || [];

    // Reset vùng chứa
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        emptyCartMessage.classList.remove('hidden');
        document.querySelector('.lg\\:w-1\\/3 button').disabled = true;
        document.querySelector('.lg\\:w-1\\/3 button').classList.add('opacity-50', 'cursor-not-allowed');
        subTotalElement.innerText = '0 đ';
        totalAmountElement.innerText = '0 đ';
        return;
    }

    let subTotal = 0;

    // Duyệt qua từng sản phẩm trong giỏ và tạo HTML
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subTotal += itemTotal;

        const itemHTML = `
            <div class="flex items-center py-6 gap-4">
                <img src="${item.image}" alt="${item.name}" class="w-24 h-32 object-cover rounded-lg">
                
                <div class="flex-grow">
                    <h3 class="text-lg font-bold text-gray-800">${item.name}</h3>
                    <p class="text-sm text-gray-500 mb-2">Màu: ${item.color} | Size: ${item.size}</p>
                    <p class="font-semibold text-[#a87b51]">${formatVND(item.price)}</p>
                </div>
                
                <div class="flex items-center border border-gray-300 rounded-lg h-10 w-28">
                    <button onclick="updateQuantity(${index}, -1)" class="px-3 text-gray-500 hover:text-black">-</button>
                    <input type="text" value="${item.quantity}" readonly class="w-full text-center text-sm font-semibold focus:outline-none bg-transparent">
                    <button onclick="updateQuantity(${index}, 1)" class="px-3 text-gray-500 hover:text-black">+</button>
                </div>

                <div class="text-right min-w-[100px]">
                    <p class="font-bold text-black mb-2">${formatVND(itemTotal)}</p>
                    <button onclick="removeItem(${index})" class="text-sm text-red-500 hover:text-red-700 underline">Xóa</button>
                </div>
            </div>
        `;
        cartItemsContainer.insertAdjacentHTML('beforeend', itemHTML);
    });

    // Cập nhật tổng tiền
    subTotalElement.innerText = formatVND(subTotal);
    totalAmountElement.innerText = formatVND(subTotal);
}

// Hàm thay đổi số lượng
function updateQuantity(index, change) {
    let cart = JSON.parse(localStorage.getItem('elegance_cart')) || [];
    if (cart[index]) {
        let newQty = cart[index].quantity + change;
        if (newQty > 0) {
            cart[index].quantity = newQty;
            localStorage.setItem('elegance_cart', JSON.stringify(cart));
            renderCart(); // Gọi lại để vẽ lại giỏ hàng
        }
    }
}

// Hàm xóa 1 sản phẩm khỏi giỏ
function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem('elegance_cart')) || [];
    cart.splice(index, 1); // Cắt bỏ phần tử tại vị trí index
    localStorage.setItem('elegance_cart', JSON.stringify(cart));
    renderCart();
}

// Hàm xử lý nút THANH TOÁN (Nghiệp vụ quan trọng)
function proceedToCheckout() {
    // Kiểm tra xem đã đăng nhập chưa (dữ liệu lưu từ lúc đăng nhập ở auth.js)
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser) {
        // Chưa đăng nhập: Bắt buộc sang trang Login
        alert('Bạn cần đăng nhập hoặc đăng ký tài khoản để tiến hành thanh toán!');
        window.location.href = '../auth/login.html';
    } else {
        // Đã đăng nhập: Chuyển sang form Checkout
        window.location.href = 'checkout.html';
    }
}

// Tự động chạy renderCart khi trang web load xong
document.addEventListener('DOMContentLoaded', renderCart);