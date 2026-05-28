// assets/js/product.js

let currentProduct = null;
let currentVariants = [];

const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop';
const AO_DAI_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=600&auto=format&fit=crop';

function getFallbackProductImage(product) {
    const normalizedName = EleganceApp.normalizeText(product?.name || '');
    if (normalizedName.includes('ao dai')) {
        return AO_DAI_FALLBACK_IMAGE;
    }
    return DEFAULT_PRODUCT_IMAGE;
}

function resolveProductImage(product) {
    const image = String(product?.image || '').trim();
    return image || getFallbackProductImage(product);
}

function attachImageFallback(imageElement, product) {
    if (!imageElement) return;
    imageElement.addEventListener('error', () => {
        const fallback = getFallbackProductImage(product);
        if (imageElement.src !== fallback) {
            imageElement.src = fallback;
        }
    }, { once: true });
}

const PRODUCT_DESCRIPTIONS = {
    'PRD-001': 'Chất liệu cotton cao cấp, thoáng mát và thấm hút mồ hôi tốt. Dáng áo ôm vừa vặn mang lại vẻ ngoài thanh lịch, chuyên nghiệp chốn công sở.',
    'PRD-002': 'Quần jean form slim hiện đại, chất denim co giãn nhẹ giúp dễ vận động nhưng vẫn giữ phom gọn gàng cho trang phục hằng ngày.',
    'PRD-003': 'Chân váy midi chất liệu mềm, rủ nhẹ và dễ phối cùng áo sơ mi hoặc blouse cho phong cách nữ tính, thanh lịch.',
    'PRD-004': 'Áo tay dài phối nút tinh tế, phù hợp đi làm hoặc gặp gỡ cuối tuần. Chất vải nhẹ, dễ mặc và tạo điểm nhấn ở phần cổ tay.',
    'PRD-005': 'Blazer kem dáng đứng với đường cắt gọn, phù hợp phối cùng quần jean, chân váy hoặc đầm liền cho phong cách smart casual.',
    'PRD-006': 'Áo thun essential chất cotton mềm, dễ phối nhiều lớp và phù hợp sử dụng thường ngày.'
};

const COLOR_SWATCHES = {
    'Trắng': '#f8f5ec',
    'Xanh': '#2c3e50',
    'Xanh navy': '#1f3147',
    'Xanh đậm': '#243b55',
    'Be': '#d2b48c',
    'Đen': '#111827',
    'Kem': '#f4ead8',
    'Xám': '#8b8f98'
};

const PRODUCT_REVIEWS = {
    'PRD-001': {
        average: 4.8,
        count: 126,
        distribution: { 5: 82, 4: 14, 3: 4 },
        items: [
            { name: 'Hoàng Văn Nam', rating: 5, variant: 'Đã mua size M, màu Trắng', content: 'Chất vải dày vừa phải, mặc đi làm rất gọn. Form slim fit đúng mô tả, cổ áo giữ dáng tốt sau khi giặt.' },
            { name: 'Trần Thị Mai', rating: 5, variant: 'Đã mua size L, màu Xanh navy', content: 'Đóng gói đẹp, màu ngoài thực tế trầm hơn ảnh một chút nhưng dễ phối. Nhân viên tư vấn size khá chuẩn.' },
            { name: 'Lê Minh Châu', rating: 4, variant: 'Đã mua size M, màu Trắng', content: 'Áo mặc thoải mái, đường may sạch. Nếu có thêm hướng dẫn bảo quản chi tiết hơn thì sẽ tốt hơn.' }
        ]
    },
    'PRD-002': {
        average: 4.6,
        count: 88,
        distribution: { 5: 70, 4: 22, 3: 8 },
        items: [
            { name: 'Nguyễn Quốc Huy', rating: 5, variant: 'Đã mua size 31, màu Xanh đậm', content: 'Quần lên form gọn, chất jean mềm hơn mình nghĩ nên mặc cả ngày vẫn thoải mái.' },
            { name: 'Đỗ Minh Anh', rating: 4, variant: 'Đã mua size 30, màu Xanh đậm', content: 'Màu quần dễ phối áo sơ mi và áo thun. Size hơi ôm nên nên xem kỹ bảng size trước khi đặt.' },
            { name: 'Phạm Hoàng Long', rating: 5, variant: 'Đã mua size 32, màu Xanh đậm', content: 'Đường may chắc, phần gấu quần đẹp. Giao hàng nhanh và đóng gói sạch sẽ.' }
        ]
    },
    'PRD-003': {
        average: 4.7,
        count: 64,
        distribution: { 5: 76, 4: 19, 3: 5 },
        items: [
            { name: 'Vũ Thanh Hằng', rating: 5, variant: 'Đã mua size S, màu Be', content: 'Váy mềm, rủ đẹp và không bị nhăn nhiều. Màu be rất dễ phối với áo trắng.' },
            { name: 'Bùi Ngọc Linh', rating: 5, variant: 'Đã mua size M, màu Be', content: 'Dáng váy thanh lịch, mặc đi làm rất hợp. Chiều dài vừa phải và lên ảnh đẹp.' },
            { name: 'Mai Phương Thảo', rating: 4, variant: 'Đã mua size S, màu Đen', content: 'Chất vải ổn, đường may sạch. Nếu có thêm màu pastel thì mình sẽ mua thêm.' }
        ]
    },
    'PRD-004': {
        average: 4.5,
        count: 47,
        distribution: { 5: 68, 4: 24, 3: 8 },
        items: [
            { name: 'Trương An Nhiên', rating: 5, variant: 'Đã mua size M, màu Kem', content: 'Áo có điểm nhấn nút đẹp, mặc với chân váy hoặc quần âu đều hợp.' },
            { name: 'Ngô Khánh Vy', rating: 4, variant: 'Đã mua size L, màu Kem', content: 'Form vừa, vải nhẹ. Mình thích phần tay áo nhưng cổ áo cần ủi kỹ hơn sau khi giặt.' },
            { name: 'Đặng Thu Hà', rating: 4, variant: 'Đã mua size M, màu Đen', content: 'Áo dễ phối và nhìn lịch sự. Giao hàng đúng hẹn.' }
        ]
    },
    'PRD-005': {
        average: 4.9,
        count: 39,
        distribution: { 5: 90, 4: 8, 3: 2 },
        items: [
            { name: 'Lê Bảo Ngọc', rating: 5, variant: 'Đã mua size M, màu Kem', content: 'Blazer đứng dáng, màu kem sang và dễ mặc đi làm. Chất vải không quá dày.' },
            { name: 'Hồ Gia Linh', rating: 5, variant: 'Đã mua size L, màu Xám', content: 'Đường cắt vai đẹp, mặc lên nhìn rất gọn. Đáng tiền so với giá.' },
            { name: 'Nguyễn Minh Khuê', rating: 5, variant: 'Đã mua size L, màu Kem', content: 'Phối với quần jean hay váy đều ổn. Shop tư vấn size chuẩn.' }
        ]
    },
    'PRD-006': {
        average: 4.4,
        count: 102,
        distribution: { 5: 62, 4: 28, 3: 10 },
        items: [
            { name: 'Phan Đức Anh', rating: 5, variant: 'Đã mua size L, màu Trắng', content: 'Áo thun basic dễ mặc, chất cotton mềm và không bị bí.' },
            { name: 'Lý Thu Trang', rating: 4, variant: 'Đã mua size M, màu Đen', content: 'Form áo đẹp, vải ổn. Sau khi giặt màu vẫn giữ tốt.' },
            { name: 'Tạ Hoàng Minh', rating: 4, variant: 'Đã mua size M, màu Trắng', content: 'Áo phù hợp mặc hằng ngày. Nếu cổ áo dày thêm một chút thì tốt hơn.' }
        ]
    }
};

async function resolveProductFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const rawId = params.get('id');
    return await apiGet(`/products/public/${rawId}`);
}

function renderStars(rating) {
    const rounded = Math.round(Number(rating || 0));
    return Array.from({ length: 5 }, (_, index) => index < rounded ? '★' : '☆').join('');
}

function getCategoryName(product) {
    return product.categoryName || 'Sản phẩm';
}

function uniqueValues(items, key) {
    return [...new Set(items.map((item) => item[key]).filter(Boolean))];
}

function getSelectedVariant() {
    const selectedColor = document.querySelector('input[name="color"]:checked')?.value || '';
    const selectedSize = document.querySelector('input[name="size"]:checked')?.value || '';
    return currentVariants.find((variant) => variant.color === selectedColor && variant.size === selectedSize) || null;
}

function updateStockHint() {
    const qtyInput = document.getElementById('qty');
    const stockHint = document.getElementById('stockHint');
    const selectedVariant = getSelectedVariant();
    const stock = selectedVariant ? Number(selectedVariant.stock || 0) : Number(currentProduct?.stock || 0);

    qtyInput.max = Math.max(1, stock);
    if (Number(qtyInput.value || 1) > stock) {
        qtyInput.value = Math.max(1, stock);
    }

    stockHint.textContent = stock > 0 ? `Còn ${stock} sản phẩm trong kho` : 'Tạm hết hàng';
    stockHint.className = stock > 0 ? 'text-xs text-green-600 mt-2' : 'text-xs text-red-600 mt-2';
}

function renderColorOptions() {
    const colorOptions = document.getElementById('colorOptions');
    const colors = uniqueValues(currentVariants, 'color');

    colorOptions.innerHTML = colors.map((color, index) => `
        <label class="relative cursor-pointer" title="${color}">
            <input type="radio" name="color" value="${color}" class="peer sr-only" ${index === 0 ? 'checked' : ''}>
            <span class="w-8 h-8 rounded-full border-2 border-gray-300 peer-checked:border-[#a87b51] peer-checked:ring-2 peer-checked:ring-[#a87b51] peer-checked:ring-offset-2 transition block"
                style="background-color: ${COLOR_SWATCHES[color] || '#e5e7eb'}"></span>
        </label>
    `).join('');

    document.querySelectorAll('input[name="color"]').forEach((input) => {
        input.addEventListener('change', updateStockHint);
    });
}

function renderSizeOptions() {
    const sizeOptions = document.getElementById('sizeOptions');
    const sizes = uniqueValues(currentVariants, 'size');

    sizeOptions.innerHTML = sizes.map((size, index) => `
        <label class="relative cursor-pointer">
            <input type="radio" name="size" value="${size}" class="peer sr-only" ${index === 0 ? 'checked' : ''}>
            <span class="min-w-12 h-10 px-4 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 font-medium peer-checked:border-[#a87b51] peer-checked:bg-[#a87b51] peer-checked:text-white transition hover:border-[#a87b51]">
                ${size}
            </span>
        </label>
    `).join('');

    document.querySelectorAll('input[name="size"]').forEach((input) => {
        input.addEventListener('change', updateStockHint);
    });
}

async function renderProductDetail() {
    try {
        currentProduct = await resolveProductFromUrl();
        currentVariants = currentProduct.variants || [];
    } catch (error) {
        alert('Không tải được thông tin sản phẩm từ API.');
        return;
    }
    const categoryName = getCategoryName(currentProduct);

    document.title = `${currentProduct.name} - Élégance`;
    document.getElementById('breadcrumbCategory').textContent = categoryName;
    document.getElementById('breadcrumbProduct').textContent = currentProduct.name;
    document.getElementById('productName').textContent = currentProduct.name;
    document.getElementById('productSku').textContent = `Mã SP: #${currentProduct.id} | SKU: ${currentProduct.sku}`;
    document.getElementById('productPrice').textContent = EleganceApp.formatCurrency(currentProduct.price);
    document.getElementById('productDescription').textContent =
        PRODUCT_DESCRIPTIONS[currentProduct.id] || 'Sản phẩm được chọn lọc cho phong cách thanh lịch, dễ phối và phù hợp sử dụng hằng ngày.';

    const imageUrl = resolveProductImage(currentProduct);
    const mainImage = document.getElementById('productMainImage');
    mainImage.src = imageUrl;
    mainImage.alt = currentProduct.name;
    attachImageFallback(mainImage, currentProduct);
    document.getElementById('productThumbs').innerHTML = `
        <img src="${imageUrl}" alt="${currentProduct.name}"
            class="rounded-xl border-2 border-[#a87b51] cursor-pointer">
    `;
    attachImageFallback(document.querySelector('#productThumbs img'), currentProduct);

    if (currentVariants.length) {
        renderColorOptions();
        renderSizeOptions();
    }

    renderProductReviews();
    updateStockHint();
}

function renderProductReviews() {
    const reviewData = PRODUCT_REVIEWS[currentProduct.id] || PRODUCT_REVIEWS['PRD-001'];
    document.getElementById('feedbackHeading').textContent = `Phản hồi về ${currentProduct.name}`;
    document.getElementById('feedbackIntro').textContent =
        `Những nhận xét đã được ghi nhận sau khi khách hàng mua và trải nghiệm ${currentProduct.name}.`;
    document.getElementById('ratingAverage').textContent = reviewData.average.toFixed(1);
    document.getElementById('ratingStars').innerHTML = renderStars(reviewData.average).split('').map((star) => `<span>${star}</span>`).join('');
    document.getElementById('ratingStars').setAttribute('aria-label', `${reviewData.average.toFixed(1)} trên 5 sao`);
    document.getElementById('ratingCount').textContent = `Dựa trên ${reviewData.count} lượt đánh giá`;

    document.getElementById('ratingDistribution').innerHTML = Object.entries(reviewData.distribution)
        .sort((a, b) => Number(b[0]) - Number(a[0]))
        .map(([star, percent]) => `
            <div class="grid grid-cols-[56px_1fr_36px] items-center gap-3 text-sm">
                <span>${star} sao</span>
                <div class="h-2 bg-white rounded-full overflow-hidden">
                    <div class="h-full bg-[#a87b51] rounded-full" style="width: ${percent}%"></div>
                </div>
                <span class="text-gray-500">${percent}%</span>
            </div>
        `).join('');

    document.getElementById('reviewList').innerHTML = reviewData.items.map((review) => `
        ${createReviewCard(review)}
    `).join('');
}

function createReviewCard(review) {
    return `
        <article class="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                    <h3 class="font-semibold text-gray-900">${review.name}</h3>
                    <p class="text-xs text-gray-400 mt-1">${review.variant}</p>
                </div>
                <div class="text-[#a87b51] text-sm">${renderStars(review.rating)}</div>
            </div>
            <p class="text-gray-600 leading-relaxed">${review.content}</p>
        </article>
    `;
}

function addSubmittedReview({ name, rating, content }) {
    const selectedColor = document.querySelector('input[name="color"]:checked')?.value || 'màu đã chọn';
    const selectedSize = document.querySelector('input[name="size"]:checked')?.value || 'size đã chọn';
    const reviewList = document.getElementById('reviewList');

    reviewList.insertAdjacentHTML('afterbegin', createReviewCard({
        name,
        rating,
        variant: `Vừa đánh giá ${currentProduct?.name || 'sản phẩm'} - size ${selectedSize}, màu ${selectedColor}`,
        content
    }));
}

// Hàm tăng số lượng
function incrementQty() {
    const qtyInput = document.getElementById('qty');
    if (parseInt(qtyInput.value, 10) < parseInt(qtyInput.max, 10)) {
        qtyInput.value = parseInt(qtyInput.value, 10) + 1;
    } else {
        alert('Số lượng vượt quá sản phẩm có sẵn trong kho!');
    }
}

// Hàm giảm số lượng
function decrementQty() {
    const qtyInput = document.getElementById('qty');
    if (parseInt(qtyInput.value, 10) > parseInt(qtyInput.min, 10)) {
        qtyInput.value = parseInt(qtyInput.value, 10) - 1;
    }
}

function showToast(productName, color, size, qty) {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-3';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = 'bg-[#1a1a1a] text-white px-5 py-4 rounded-xl shadow-2xl transform transition-all duration-300 translate-y-10 opacity-0 flex items-center gap-4 min-w-[300px] border border-gray-700';
    toast.innerHTML = `
        <div class="bg-[#a87b51] rounded-full p-1 flex-shrink-0">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <div>
            <p class="font-bold text-sm">Thêm thành công</p>
            <p class="text-xs text-gray-300 mt-1">${productName} (${color}, ${size}) x ${qty}</p>
        </div>
    `;

    toastContainer.appendChild(toast);
    setTimeout(() => toast.classList.remove('translate-y-10', 'opacity-0'), 10);
    setTimeout(() => {
        toast.classList.add('translate-y-10', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function addToCart() {
    const selectedColor = document.querySelector('input[name="color"]:checked')?.value;
    const selectedSize = document.querySelector('input[name="size"]:checked')?.value;
    const quantity = parseInt(document.getElementById('qty').value, 10);
    const selectedVariant = getSelectedVariant();

    if (!currentProduct || !selectedColor || !selectedSize) {
        alert('Vui lòng chọn đầy đủ màu sắc và kích cỡ!');
        return;
    }
    if (!selectedVariant || Number(selectedVariant.stock || 0) <= 0) {
        alert('Biến thể sản phẩm đã chọn đang hết hàng. Vui lòng chọn màu hoặc size khác.');
        return;
    }
    if (quantity > Number(selectedVariant.stock || 0)) {
        alert('Số lượng vượt quá sản phẩm có sẵn trong kho!');
        return;
    }

    const productItem = {
        id: currentProduct.id,
        productId: currentProduct.id,
        variantId: selectedVariant.id,
        name: currentProduct.name,
        price: currentProduct.price,
        color: selectedColor,
        size: selectedSize,
        quantity,
        image: resolveProductImage(currentProduct)
    };

    const cart = JSON.parse(localStorage.getItem('elegance_cart')) || [];
    const existingItemIndex = cart.findIndex((item) =>
        item.id === productItem.id &&
        item.color === productItem.color &&
        item.size === productItem.size
    );
    const existingQuantity = existingItemIndex > -1 ? Number(cart[existingItemIndex].quantity || 0) : 0;

    if (existingQuantity + quantity > Number(selectedVariant.stock || 0)) {
        alert('Tổng số lượng trong giỏ đã vượt quá tồn kho hiện tại.');
        return;
    }

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += productItem.quantity;
    } else {
        cart.push(productItem);
    }

    localStorage.setItem('elegance_cart', JSON.stringify(cart));
    showToast(productItem.name, productItem.color, productItem.size, productItem.quantity);
}

document.addEventListener('DOMContentLoaded', renderProductDetail);
