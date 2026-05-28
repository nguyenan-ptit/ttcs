(function () {
    const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop';
    const AO_DAI_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=600&auto=format&fit=crop';
    const COLOR_SWATCHES = {
        'trang': '#f8f5ec',
        'xanh': '#2c3e50',
        'xanh navy': '#1f3147',
        'xanh dam': '#243b55',
        'be': '#d2b48c',
        'den': '#111827',
        'kem': '#f4ead8',
        'xam': '#8b8f98'
    };
    let homeProducts = [];

    function getVisibleProducts() {
        return homeProducts.filter((product) => product.status === 'active');
    }

    function getFallbackImage(product) {
        const normalizedName = EleganceApp.normalizeText(product?.name || '');
        if (normalizedName.includes('ao dai')) {
            return AO_DAI_FALLBACK_IMAGE;
        }
        return DEFAULT_PRODUCT_IMAGE;
    }

    function resolveProductImage(product) {
        const image = String(product?.image || '').trim();
        return image || getFallbackImage(product);
    }

    function sortNewest(products) {
        return [...products].sort((left, right) => {
            const leftNumber = Number(String(left.id || '').replace(/\D/g, '')) || 0;
            const rightNumber = Number(String(right.id || '').replace(/\D/g, '')) || 0;
            return rightNumber - leftNumber;
        });
    }

    function getFilteredProducts() {
        const keyword = document.getElementById('homeKeyword')?.value || '';
        const categoryId = document.getElementById('homeCategory')?.value || '';
        const sort = document.getElementById('homeSort')?.value || 'newest';

        let products = getVisibleProducts().filter((product) => {
            const matchesKeyword = !keyword || EleganceApp.normalizeText(product.name).includes(EleganceApp.normalizeText(keyword)) ||
                EleganceApp.normalizeText(product.sku).includes(EleganceApp.normalizeText(keyword));
            const matchesCategory = !categoryId || product.categoryId === categoryId;
            return matchesKeyword && matchesCategory;
        });

        if (sort === 'price_asc') {
            products = [...products].sort((left, right) => Number(left.price || 0) - Number(right.price || 0));
        } else if (sort === 'price_desc') {
            products = [...products].sort((left, right) => Number(right.price || 0) - Number(left.price || 0));
        } else {
            products = sortNewest(products);
        }

        return products;
    }

    function getSwatchMarkup(productId) {
        const product = homeProducts.find((item) => item.id === productId);
        const variants = product?.variants || [];
        const colors = [...new Set(variants.map((variant) => EleganceApp.normalizeText(variant.color)).filter(Boolean))];

        if (!colors.length) return '';

        return colors.slice(0, 3).map((colorKey) => `
            <div class="w-5 h-5 rounded-full border border-gray-300" style="background-color: ${COLOR_SWATCHES[colorKey] || '#e5e7eb'}"></div>
        `).join('');
    }

    function buildProductCard(product) {
        const image = resolveProductImage(product);
        const detailId = encodeURIComponent(product.id);
        const escapedName = EleganceApp.escapeHtml(product.name);
        const swatches = getSwatchMarkup(product.id);

        return `
            <article class="group text-center">
                <a href="pages/customer/product-detail.html?id=${detailId}" class="block">
                    <div class="overflow-hidden rounded-[2rem] mb-4 relative bg-gray-100">
                        <img
                            src="${image}"
                            alt="${escapedName}"
                            data-product-name="${escapedName}"
                            data-fallback-image="${getFallbackImage(product)}"
                            class="w-full h-96 object-cover transform group-hover:scale-105 transition duration-500">
                    </div>
                    <h3 class="text-gray-700 font-medium mb-1 group-hover:text-[#a87b51] transition">${escapedName}</h3>
                    <p class="font-bold text-lg mb-3 text-black">${EleganceApp.formatCurrency(product.price)}</p>
                </a>
                <div class="flex justify-center space-x-2">${swatches}</div>
            </article>
        `;
    }

    function attachImageFallbacks() {
        document.querySelectorAll('#homeProductGrid img[data-fallback-image]').forEach((image) => {
            image.addEventListener('error', () => {
                const fallback = image.dataset.fallbackImage || DEFAULT_PRODUCT_IMAGE;
                if (image.src !== fallback) {
                    image.src = fallback;
                }
            }, { once: true });
        });
    }

    function renderCategoryOptions() {
        const categorySelect = document.getElementById('homeCategory');
            if (!categorySelect) return;

            const visibleProducts = getVisibleProducts();
            const categories = [];
            const seen = new Set();

            visibleProducts.forEach((product) => {
                if (!seen.has(product.categoryId)) {
                    seen.add(product.categoryId);
                    categories.push({
                        id: product.categoryId,
                        name: product.categoryName
                    });
                }
            });

            const currentValue = categorySelect.value;

            categorySelect.innerHTML = `
                <option value="">Tất cả danh mục</option>
                ${categories
                    .map((category) => `<option value="${category.id}">${EleganceApp.escapeHtml(category.name)}</option>`)
                    .join('')}
            `;
        categorySelect.value = currentValue;
    }

    function renderHomeProducts() {
        const grid = document.getElementById('homeProductGrid');
        const emptyState = document.getElementById('homeProductEmpty');
        const count = document.getElementById('homeProductCount');
        if (!grid || !emptyState || !count) return;

        const products = getFilteredProducts();
        count.textContent = String(products.length);

        if (!products.length) {
            grid.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        grid.innerHTML = products.map(buildProductCard).join('');
        attachImageFallbacks();
    }

    async function initHomeProducts() {
        const form = document.getElementById('homeProductFilters');
        if (!form || typeof window.EleganceApp === 'undefined') return;
        try {
            homeProducts = await apiGet('/products/public');
        } catch (error) {
            document.getElementById('homeProductEmpty')?.classList.remove('hidden');
            return;
        }
        renderCategoryOptions();
        renderHomeProducts();

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            renderHomeProducts();
        });

        document.getElementById('homeKeyword')?.addEventListener('input', renderHomeProducts);
        document.getElementById('homeCategory')?.addEventListener('change', renderHomeProducts);
        document.getElementById('homeSort')?.addEventListener('change', renderHomeProducts);
    }

    document.addEventListener('DOMContentLoaded', initHomeProducts);
})();
