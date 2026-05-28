(function () {
    const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop';
    const AO_DAI_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=600&auto=format&fit=crop';

    let homeProducts = [];
    let homeCurrentPage = 1;
    const HOME_PRODUCTS_PER_PAGE = 12;

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
            const matchesCategory = !categoryId || String(product.categoryId) === String(categoryId);
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

    function getSwatchMarkup(product) {

        const variants = product?.variants || [];
        const colors = [...new Set(variants.map((variant) => variant.color).filter(Boolean))];

        if (!colors.length) return '';

        return colors.slice(0, 3).map((color) => {
            const colorImage = (product?.colorImages || []).find((item) => item.color === color);
            const imageUrl = colorImage?.imageUrl || product?.image || DEFAULT_PRODUCT_IMAGE;

            return `
                <div class="w-8 h-8 rounded-lg border border-gray-200 overflow-hidden bg-gray-100 shadow-sm" title="${EleganceApp.escapeHtml(color)}">
                    <img src="${EleganceApp.escapeHtml(imageUrl)}"
                         alt="${EleganceApp.escapeHtml(color)}"
                         class="w-full h-full object-cover">
                </div>
            `;
        }).join('');
    }

    function buildProductCard(product) {
        const image = resolveProductImage(product);
        const detailId = encodeURIComponent(product.id);
        const escapedName = EleganceApp.escapeHtml(product.name);
        const swatches = getSwatchMarkup(product);

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
        const pagination = document.getElementById('homeProductPagination');
        if (!grid || !emptyState || !count) return;

        const allProducts = getFilteredProducts();
        count.textContent = String(allProducts.length);

        if (!allProducts.length) {
            grid.innerHTML = '';
            emptyState.classList.remove('hidden');
            if (pagination) pagination.classList.add('hidden');
            return;
        }

        emptyState.classList.add('hidden');

        const totalPages = Math.ceil(allProducts.length / HOME_PRODUCTS_PER_PAGE);
        if (homeCurrentPage > totalPages && totalPages > 0) homeCurrentPage = totalPages;
        if (homeCurrentPage < 1) homeCurrentPage = 1;

        const startIndex = (homeCurrentPage - 1) * HOME_PRODUCTS_PER_PAGE;
        const pagedProducts = allProducts.slice(startIndex, startIndex + HOME_PRODUCTS_PER_PAGE);

        grid.innerHTML = pagedProducts.map(buildProductCard).join('');
        attachImageFallbacks();

        if (pagination) {
            if (totalPages > 1) {
                pagination.classList.remove('hidden');
                let paginationHtml = '';
                
                paginationHtml += `
                    <button type="button" onclick="setHomeProductPage(${homeCurrentPage - 1})" ${homeCurrentPage === 1 ? 'disabled' : ''} 
                        class="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:text-[#a87b51] hover:border-[#a87b51] disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                `;

                for (let i = 1; i <= totalPages; i++) {
                    const isActive = i === homeCurrentPage;
                    const activeClass = isActive ? 'bg-[#a87b51] text-white border-[#a87b51]' : 'bg-white text-gray-700 border-gray-200 hover:border-[#a87b51] hover:text-[#a87b51]';
                    paginationHtml += `
                        <button type="button" onclick="setHomeProductPage(${i})" class="w-10 h-10 flex items-center justify-center rounded-xl border font-semibold transition ${activeClass}">
                            ${i}
                        </button>
                    `;
                }

                paginationHtml += `
                    <button type="button" onclick="setHomeProductPage(${homeCurrentPage + 1})" ${homeCurrentPage === totalPages ? 'disabled' : ''} 
                        class="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:text-[#a87b51] hover:border-[#a87b51] disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                `;
                pagination.innerHTML = paginationHtml;
            } else {
                pagination.classList.add('hidden');
            }
        }
    }

    window.setHomeProductPage = function(page) {
        homeCurrentPage = page;
        renderHomeProducts();
        
        const grid = document.getElementById('homeProductGrid');
        if (grid) {
            const y = grid.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    async function renderStoreInfo() {
        let info = null;
        try {
            info = await apiGet('/store-info');
        } catch (error) {
            console.error('Không thể tải thông tin cửa hàng từ API, dùng dữ liệu mẫu:', error);
            const db = window.EleganceApp?.getDb();
            info = db?.storeInfo;
        }

        if (!info) return;

        const setTxt = (id, txt) => {
            const el = document.getElementById(id);
            if (el) el.textContent = txt || '';
        };

        setTxt('storeName', info.name?.toUpperCase() || 'ÉLÉGANCE');
        setTxt('storeDesc', info.description);
        setTxt('storeAddress', info.address);
        setTxt('storeHotline', info.hotline);
        setTxt('storePhone', info.phone);
        setTxt('storeEmail', info.email);
        setTxt('storeHours', info.openHours);
        setTxt('storeManager', info.manager);

        const fb = document.getElementById('storeFb');
        if (fb) {
            if (info.facebook) {
                fb.href = info.facebook.startsWith('http') ? info.facebook : `https://${info.facebook}`;
                fb.classList.remove('hidden');
            } else {
                fb.classList.add('hidden');
            }
        }

        const insta = document.getElementById('storeInsta');
        if (insta) {
            if (info.instagram) {
                insta.href = info.instagram.startsWith('http') ? info.instagram : `https://instagram.com/${info.instagram.replace('@', '')}`;
                insta.classList.remove('hidden');
            } else {
                insta.classList.add('hidden');
            }
        }
    }

    async function initHomeProducts() {
        renderStoreInfo();
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
            homeCurrentPage = 1;
            renderHomeProducts();
        });

        const resetAndRender = () => {
            homeCurrentPage = 1;
            renderHomeProducts();
        };

        document.getElementById('homeKeyword')?.addEventListener('input', resetAndRender);
        document.getElementById('homeCategory')?.addEventListener('change', resetAndRender);
        document.getElementById('homeSort')?.addEventListener('change', resetAndRender);
    }

    document.addEventListener('DOMContentLoaded', initHomeProducts);
})();
