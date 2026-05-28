// assets/js/product.js

let currentProduct = null;
let currentVariants = [];
let currentReviews = [];
let currentGalleryImages = [];
let currentGalleryIndex = 0;
let currentReviewPage = 1;
let currentReviewFilter = 'all';
const REVIEWS_PER_PAGE = 3;

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







async function resolveProductFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const rawId = params.get('id');
    return await apiGet(`/products/public/${rawId}`);
}

function renderStars(rating) {
    const rounded = Math.round(Number(rating || 0));
    return Array.from({ length: 5 }, (_, index) => index < rounded ? '★' : '☆').join('');
}

function escapeText(value) {
    return EleganceApp.escapeHtml(String(value || ''));
}

function getCategoryName(product) {
    return product.categoryName || 'Sản phẩm';
}

function uniqueValues(items, key) {
    return [...new Set(items.map((item) => item[key]).filter(Boolean))];
}
function getSelectedColor() {
    return document.querySelector('input[name="color"]:checked')?.value || '';
}

function getSelectedSize() {
    return document.querySelector('input[name="size"]:checked')?.value || '';
}

function getSelectedVariant() {
    const selectedColor = getSelectedColor();
    const selectedSize = getSelectedSize();
    return currentVariants.find((variant) => variant.color === selectedColor && variant.size === selectedSize) || null;
}

function getFirstAvailableVariant(variants) {
    return variants.find((variant) => Number(variant.stock || 0) > 0) || variants[0] || null;
}
function getColorImage(color) {
    const colorImage = currentProduct?.colorImages?.find((item) => item.color === color);
    return colorImage?.imageUrl || resolveProductImage(currentProduct);
}
function getProductGalleryImages(product) {
    const images = [];
    const seen = new Set();

    function addImage(imageUrl, label) {
        const url = String(imageUrl || '').trim();
        if (!url || seen.has(url)) return;

        seen.add(url);
        images.push({
            imageUrl: url,
            label: label || product.name
        });
    }

    addImage(resolveProductImage(product), product.name);

    (product.colorImages || []).forEach((item) => {
        addImage(item.imageUrl, item.color || product.name);
    });

    return images;
}

function updateGalleryControls() {
    const shouldShowControls = currentGalleryImages.length > 1;

    ['productImagePrev', 'productImageNext'].forEach((id) => {
        const button = document.getElementById(id);
        if (!button) return;

        button.classList.toggle('hidden', !shouldShowControls);
    });
}

function setSelectedGalleryImage(index) {
    if (!currentGalleryImages.length) return;

    const mainImage = document.getElementById('productMainImage');
    const normalizedIndex = (index + currentGalleryImages.length) % currentGalleryImages.length;
    const selectedImage = currentGalleryImages[normalizedIndex];

    currentGalleryIndex = normalizedIndex;

    if (mainImage) {
        mainImage.src = selectedImage.imageUrl;
        mainImage.alt = selectedImage.label;
        mainImage.classList.remove('opacity-0');
    }

    document.querySelectorAll('.product-thumb').forEach((thumb) => {
        const isActive = Number(thumb.dataset.galleryIndex) === normalizedIndex;
        thumb.classList.toggle('border-[#a87b51]', isActive);
        thumb.classList.toggle('border-gray-200', !isActive);
        thumb.classList.toggle('opacity-100', isActive);
        thumb.classList.toggle('opacity-80', !isActive);
    });

    updateGalleryControls();
}

function moveProductGallery(direction) {
    setSelectedGalleryImage(currentGalleryIndex + direction);
}

function renderProductThumbs(product) {
    const thumbs = document.getElementById('productThumbs');
    currentGalleryImages = getProductGalleryImages(product);
    currentGalleryIndex = 0;

    if (!thumbs || !currentGalleryImages.length) return;

    thumbs.innerHTML = currentGalleryImages.map((image, index) => `
        <button
            type="button"
            class="product-thumb rounded-xl border ${index === 0 ? 'border-[#a87b51] opacity-100' : 'border-gray-200 opacity-80'} overflow-hidden hover:opacity-100 transition"
            data-gallery-index="${index}"
            data-image-url="${escapeText(image.imageUrl)}"
            data-image-label="${escapeText(image.label)}"
        >
            <img
                src="${escapeText(image.imageUrl)}"
                alt="${escapeText(image.label)}"
                class="w-full aspect-square object-cover"
            >
        </button>
    `).join('');

    document.querySelectorAll('.product-thumb').forEach((button) => {
        button.addEventListener('click', () => {
            setSelectedGalleryImage(Number(button.dataset.galleryIndex || 0));
        });
    });

    setSelectedGalleryImage(0);
}
function previewColor(color) {
    const selectedColorName = document.getElementById('selectedColorName');

    if (selectedColorName) {
        selectedColorName.textContent = color || '';
    }

    if (color) {
        const imageUrl = getColorImage(color);
        const imageIndex = currentGalleryImages.findIndex((image) => image.imageUrl === imageUrl);

        if (imageIndex >= 0) {
            setSelectedGalleryImage(imageIndex);
        } else {
            const mainImage = document.getElementById('productMainImage');

            if (mainImage) {
                mainImage.src = imageUrl;
                mainImage.alt = `${currentProduct.name} - ${color}`;
                mainImage.classList.remove('opacity-0');
            }
        }
    }
}
function updateStockHint() {
    const qtyInput = document.getElementById('qty');
    const stockHint = document.getElementById('stockHint');
    const selectedVariant = getSelectedVariant();

    if (!selectedVariant) {
        qtyInput.max = 1;
        qtyInput.value = 1;
        stockHint.textContent = 'Vui lòng chọn màu và size còn hàng';
        stockHint.className = 'text-xs text-red-600 mt-2';
        return;
    }

    const stock = Number(selectedVariant.stock || 0);

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
    const currentColor = getSelectedColor();
    const firstAvailableVariant = getFirstAvailableVariant(currentVariants);
    const selectedColor = colors.includes(currentColor) ? currentColor : (firstAvailableVariant?.color || colors[0]);

    if (!colors.length) {
        colorOptions.innerHTML = '<span class="text-sm text-red-600">Sản phẩm chưa có màu khả dụng</span>';
        return;
    }

    colorOptions.innerHTML = colors.map((color, index) => {
        const variantsByColor = currentVariants.filter((variant) => variant.color === color);
        const colorStock = variantsByColor.reduce((sum, variant) => sum + Number(variant.stock || 0), 0);
        const isOutOfStock = colorStock <= 0;

        const imageUrl = getColorImage(color);

        return `
        <label class="relative cursor-pointer" title="${escapeText(color)}" data-color-option="${escapeText(color)}">
            <input type="radio" name="color" value="${escapeText(color)}" class="peer sr-only" ${color === selectedColor || (!selectedColor && index === 0) ? 'checked' : ''}>
            <span class="relative block w-14 h-14 rounded-xl border overflow-hidden ${isOutOfStock ? 'border-gray-200 opacity-50' : 'border-gray-300 peer-checked:border-[#a87b51] peer-checked:ring-2 peer-checked:ring-[#a87b51]/30 hover:border-[#a87b51]'} transition">
                <img src="${escapeText(imageUrl)}" alt="${escapeText(color)}" class="w-full h-full object-cover">
                <span class="absolute inset-x-0 bottom-0 bg-black/65 text-white text-[10px] text-center px-1 truncate">
                    ${escapeText(color)}
                </span>
            </span>
        </label>
        `;
    }).join('');

    previewColor(selectedColor);

    document.querySelectorAll('[data-color-option]').forEach((label) => {
        const color = label.dataset.colorOption;

        label.addEventListener('mouseenter', () => previewColor(color));
        label.addEventListener('mouseleave', () => previewColor(getSelectedColor()));
    });

    document.querySelectorAll('input[name="color"]').forEach((input) => {
        input.addEventListener('change', () => {
            previewColor(input.value);
            renderSizeOptions();
            updateStockHint();
        });
    });
}

function renderSizeOptions() {
    const sizeOptions = document.getElementById('sizeOptions');
    const selectedColor = getSelectedColor();
    const variantsByColor = currentVariants.filter((variant) => variant.color === selectedColor);
    const selectedVariant = getFirstAvailableVariant(variantsByColor);

    if (!variantsByColor.length) {
        sizeOptions.innerHTML = '<span class="text-sm text-red-600">Màu này chưa có size khả dụng</span>';
        updateStockHint();
        return;
    }

    sizeOptions.innerHTML = variantsByColor.map((variant) => {
        const isOutOfStock = Number(variant.stock || 0) <= 0;

        return `
        <label class="relative cursor-pointer">
            <input type="radio" name="size" value="${variant.size}" class="peer sr-only" ${variant.id === selectedVariant?.id ? 'checked' : ''} ${isOutOfStock ? 'disabled' : ''}>
            <span class="min-w-20 min-h-12 px-4 py-2 flex flex-col items-center justify-center rounded-xl border ${isOutOfStock ? 'border-gray-100 bg-gray-50 text-gray-300 line-through cursor-not-allowed' : 'border-gray-300 text-gray-700 peer-checked:border-[#a87b51] peer-checked:bg-[#a87b51] peer-checked:text-white hover:border-[#a87b51]'} font-semibold transition">
                <span>${escapeText(variant.size)}</span>
                <span class="text-[11px] font-medium ${isOutOfStock ? '' : 'opacity-75'}">${isOutOfStock ? 'Hết hàng' : `Còn ${Number(variant.stock || 0)}`}</span>
            </span>
        </label>
        `;
    }).join('');

    document.querySelectorAll('input[name="size"]').forEach((input) => {
        input.addEventListener('change', updateStockHint);
    });

    updateStockHint();
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
        currentProduct.description || 'Sản phẩm được chọn lọc cho phong cách thanh lịch, dễ phối và phù hợp sử dụng hằng ngày.';

    const imageUrl = resolveProductImage(currentProduct);
    const mainImage = document.getElementById('productMainImage');
    mainImage.src = imageUrl;
    mainImage.alt = currentProduct.name;
    mainImage.classList.remove('opacity-0');
    attachImageFallback(mainImage, currentProduct);
    renderProductThumbs(currentProduct);

    if (currentVariants.length) {
        renderColorOptions();
        renderSizeOptions();
    }

    await renderProductReviews();
    updateStockHint();

    const currentUser = EleganceApp.getCurrentUser();
    const nameInput = document.getElementById('feedbackName');

    if (nameInput && currentUser?.role === 'CUSTOMER') {
        nameInput.value = currentUser.name || '';
        nameInput.readOnly = true;
    }
}





// Hàm tăng số lượng
async function renderProductReviews() {
    try {
        currentReviews = await apiGet(`/reviews/product/${currentProduct.id}`);
    } catch (error) {
        currentReviews = [];
    }

    currentReviewPage = 1;
    currentReviewFilter = 'all';

    const reviewCount = currentReviews.length;
    const totalRating = currentReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
    const average = reviewCount ? totalRating / reviewCount : 0;
    const distribution = [5, 4, 3, 2, 1].map((star) => {
        const count = currentReviews.filter((review) => Number(review.rating) === star).length;
        return {
            star,
            percent: reviewCount ? Math.round((count / reviewCount) * 100) : 0
        };
    });

    document.getElementById('feedbackHeading').textContent = `Phản hồi về ${currentProduct.name}`;
    document.getElementById('feedbackIntro').textContent =
        `Những nhận xét đã được ghi nhận sau khi khách hàng mua và trải nghiệm ${currentProduct.name}.`;
    document.getElementById('ratingAverage').textContent = average.toFixed(1);
    document.getElementById('ratingStars').innerHTML = renderStars(average).split('').map((star) => `<span>${star}</span>`).join('');
    document.getElementById('ratingStars').setAttribute('aria-label', `${average.toFixed(1)} trên 5 sao`);
    document.getElementById('ratingCount').textContent = `Dựa trên ${reviewCount} lượt đánh giá`;

    document.getElementById('ratingDistribution').innerHTML = distribution.map(({ star, percent }) => `
        <div class="grid grid-cols-[56px_1fr_36px] items-center gap-3 text-sm">
            <span>${star} sao</span>
            <div class="h-2 bg-white rounded-full overflow-hidden">
                <div class="h-full bg-[#a87b51] rounded-full" style="width: ${percent}%"></div>
            </div>
            <span class="text-gray-500">${percent}%</span>
        </div>
    `).join('');

    renderReviewListAndControls();
}

function renderReviewListAndControls() {
    const filterContainer = document.getElementById('reviewFilterContainer');
    const paginationContainer = document.getElementById('reviewPaginationContainer');
    const reviewList = document.getElementById('reviewList');

    if (!currentReviews.length) {
        reviewList.innerHTML = '<div class="bg-white border border-gray-100 rounded-3xl p-6 text-sm text-gray-500">Chưa có đánh giá nào cho sản phẩm này.</div>';
        if (filterContainer) filterContainer.classList.add('hidden');
        if (paginationContainer) paginationContainer.classList.add('hidden');
        return;
    }

    if (currentReviews.length <= REVIEWS_PER_PAGE) {
        reviewList.innerHTML = currentReviews.map(createReviewCard).join('');
        if (filterContainer) filterContainer.classList.add('hidden');
        if (paginationContainer) paginationContainer.classList.add('hidden');
        return;
    }

    let filteredReviews = currentReviews;
    if (currentReviewFilter !== 'all') {
        filteredReviews = currentReviews.filter(r => Number(r.rating) === Number(currentReviewFilter));
    }

    const totalPages = Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE);
    if (currentReviewPage > totalPages && totalPages > 0) currentReviewPage = totalPages;
    if (currentReviewPage < 1) currentReviewPage = 1;

    const startIndex = (currentReviewPage - 1) * REVIEWS_PER_PAGE;
    const paginatedReviews = filteredReviews.slice(startIndex, startIndex + REVIEWS_PER_PAGE);

    if (paginatedReviews.length) {
        reviewList.innerHTML = paginatedReviews.map(createReviewCard).join('');
    } else {
        reviewList.innerHTML = '<div class="bg-white border border-gray-100 rounded-3xl p-6 text-sm text-gray-500">Không có đánh giá nào phù hợp với bộ lọc.</div>';
    }

    if (filterContainer) {
        filterContainer.classList.remove('hidden');
        const filters = [
            { id: 'all', label: 'Tất cả' },
            { id: 5, label: '5 sao' },
            { id: 4, label: '4 sao' },
            { id: 3, label: '3 sao' },
            { id: 2, label: '2 sao' },
            { id: 1, label: '1 sao' }
        ];

        filterContainer.innerHTML = filters.map(f => {
            const isActive = String(currentReviewFilter) === String(f.id);
            const activeClass = isActive ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'bg-white text-gray-700 border-gray-200 hover:border-[#a87b51] hover:text-[#a87b51]';
            return `<button type="button" onclick="setReviewFilter('${f.id}')" class="px-4 py-2 text-sm font-semibold border rounded-full transition ${activeClass}">${f.label}</button>`;
        }).join('');
    }

    if (paginationContainer) {
        if (totalPages > 1) {
            paginationContainer.classList.remove('hidden');
            let paginationHtml = '';
            
            paginationHtml += `
                <button type="button" onclick="setReviewPage(${currentReviewPage - 1})" ${currentReviewPage === 1 ? 'disabled' : ''} 
                    class="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:text-[#a87b51] hover:border-[#a87b51] disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
            `;

            for (let i = 1; i <= totalPages; i++) {
                const isActive = i === currentReviewPage;
                const activeClass = isActive ? 'bg-[#a87b51] text-white border-[#a87b51]' : 'bg-white text-gray-700 border-gray-200 hover:border-[#a87b51] hover:text-[#a87b51]';
                paginationHtml += `
                    <button type="button" onclick="setReviewPage(${i})" class="w-10 h-10 flex items-center justify-center rounded-xl border font-semibold transition ${activeClass}">
                        ${i}
                    </button>
                `;
            }

            paginationHtml += `
                <button type="button" onclick="setReviewPage(${currentReviewPage + 1})" ${currentReviewPage === totalPages ? 'disabled' : ''} 
                    class="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:text-[#a87b51] hover:border-[#a87b51] disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
            `;
            paginationContainer.innerHTML = paginationHtml;
        } else {
            paginationContainer.classList.add('hidden');
        }
    }
}

function setReviewFilter(filter) {
    currentReviewFilter = filter;
    currentReviewPage = 1;
    renderReviewListAndControls();
}

function setReviewPage(page) {
    currentReviewPage = page;
    renderReviewListAndControls();
}

function createReviewCard(review) {
    const customerName = review.customerName || review.name || 'Khách hàng';
    const content = review.content || review.comment || '';
    const dateLabel = review.date ? EleganceApp.formatDate(review.date) : 'Vừa đánh giá';
    const replyContent = review.replyContent || '';

    return `
        <article class="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                    <h3 class="font-semibold text-gray-900">${escapeText(customerName)}</h3>
                    <p class="text-xs text-gray-400 mt-1">${escapeText(dateLabel)}</p>
                </div>
                <div class="text-[#a87b51] text-sm">${renderStars(review.rating)}</div>
            </div>
            <p class="text-gray-600 leading-relaxed">${escapeText(content)}</p>
            ${replyContent ? `
                <div class="mt-4 rounded-2xl border border-[#ead8c2] bg-[#fffaf4] px-4 py-3">
                    <p class="text-xs uppercase font-semibold text-[#a87b51]">Phản hồi từ: ${escapeText(review.replyStaff || 'Cửa hàng')}</p>
                    <p class="text-sm text-gray-700 mt-2">${escapeText(replyContent)}</p>
                </div>
            ` : ''}
        </article>
    `;
}

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
        image: getColorImage(selectedColor)
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
