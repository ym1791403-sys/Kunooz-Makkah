// =================================================================
// متجر كنوز مكة | Kunooz Makkah
// الواجهة الرئيسية لمتجر الزيوت الطبيعية لعلاج مشاكل الشعر
// متصل مباشرة بقاعدة بيانات Firebase Realtime Database في الوقت الفعلي
// =================================================================

// رقم الواتساب الخاص بالمتجر لاستقبال الطلبات
const STORE_WHATSAPP_NUMBER = "201080369841"; 

// قائمة المنتجات المخزنة / المحملة من Firebase
let liveFirebaseProducts = JSON.parse(localStorage.getItem('makkah_real_products') || '[]');

function getStoredProducts() {
    return liveFirebaseProducts;
}

// حالة المتجر
let state = {
    currentCategory: 'all',
    searchQuery: '',
    sortBy: 'default',
    cart: JSON.parse(localStorage.getItem('makkah_oils_cart') || '[]'),
    wishlist: JSON.parse(localStorage.getItem('makkah_oils_wishlist') || '[]'),
    appliedDiscountPercent: 0,
    appliedCouponCode: ''
};

// كوبونات الخصم
const VALID_COUPONS = {
    'MAKKAH20': 0.20,
    'SALE20': 0.20,
    'HAIR10': 0.10,
    'KUNOOZ50': 0.50
};

// بدء التشغيل
document.addEventListener('DOMContentLoaded', () => {
    updateCategoryCounts();
    renderProducts();
    updateCartUI();
    updateWishlistUI();
    setupFloatingWhatsapp();
    renderFrontAnnouncement();

    // الاستماع المباشر للمنتجات من Firebase
    if (typeof subscribeToProducts === 'function') {
        subscribeToProducts(
            (products) => {
                liveFirebaseProducts = products;
                renderProducts();
                updateCategoryCounts();
            },
            (error) => {
                console.warn("Using local products fallback due to Firebase error:", error);
            }
        );
    }

    // الاستماع المباشر للإعلانات والعروض الترويجية من Firebase
    if (typeof subscribeToAnnouncements === 'function') {
        subscribeToAnnouncements(
            (announcements) => {
                renderFrontAnnouncement(announcements);
            },
            (error) => {
                console.warn("Using local announcements fallback due to Firebase error:", error);
            }
        );
    }
});

function setupFloatingWhatsapp() {
    const btn = document.getElementById('floatingWhatsappBtn');
    if (btn) {
        btn.href = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent("السلام عليكم، أود استشارة بخصوص مشكلة في شعري واختيار الزيت الأنسب لي من متجر كنوز مكة")}`;
    }
}

function updateCategoryCounts() {
    const countEl = document.getElementById('count-all');
    const products = getStoredProducts();
    if (countEl) countEl.innerText = `(${products.length})`;
}

// تصفية، بحث، وترتيب المنتجات
function getFilteredProducts() {
    const products = getStoredProducts();
    return products.filter(product => {
        const matchesCategory = state.currentCategory === 'all' || product.category === state.currentCategory;
        const matchesSearch = product.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                              (product.description && product.description.toLowerCase().includes(state.searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    }).sort((a, b) => {
        if (state.sortBy === 'price-low') return a.price - b.price;
        if (state.sortBy === 'price-high') return b.price - a.price;
        if (state.sortBy === 'rating') return (b.rating || 5) - (a.rating || 5);
        return a.id - b.id;
    });
}

// عرض المنتجات في المتجر
function renderProducts() {
    const container = document.getElementById('productsGrid');
    const noResults = document.getElementById('noProductsFound');
    const noProductsTitle = document.getElementById('noProductsTitle');
    const noProductsDesc = document.getElementById('noProductsDesc');
    const showAllBtn = document.getElementById('showAllProductsBtn');
    const filtered = getFilteredProducts();
    const allStored = getStoredProducts();

    updateCategoryCounts();

    if (allStored.length === 0) {
        container.innerHTML = '';
        noResults.classList.remove('hidden');
        if (noProductsTitle) noProductsTitle.innerText = "لا توجد منتجات مسجلة في المتجر حتى الآن";
        if (noProductsDesc) noProductsDesc.innerText = "يمكنك الدخول إلى لوحة الإدارة وإضافة أول منتج حقيقي إلى قاعدة بيانات Firebase.";
        if (showAllBtn) showAllBtn.classList.add('hidden');
        return;
    }

    if (filtered.length === 0) {
        container.innerHTML = '';
        noResults.classList.remove('hidden');
        if (noProductsTitle) noProductsTitle.innerText = "لم يتم العثور على أي نتائج";
        if (noProductsDesc) noProductsDesc.innerText = "جرب البحث بكلمات أخرى أو تغيير قسم مشكلة الشعر المحدد.";
        if (showAllBtn) showAllBtn.classList.remove('hidden');
        return;
    }

    noResults.classList.add('hidden');

    container.innerHTML = filtered.map(product => {
        const isWishlisted = state.wishlist.includes(product.id);
        const isInCart = state.cart.some(item => item.id === product.id);
        const imgSrc = product.image || 'https://images.unsplash.com/photo-1608248597359-497669d0d3a9?auto=format&fit=crop&w=700&q=80';

        return `
            <div class="product-card bg-white rounded-3xl border border-gray-100 overflow-hidden flex flex-col group relative shadow-sm hover:border-emerald-200">
                <!-- Badges & Wishlist -->
                <div class="absolute top-3 right-3 left-3 flex justify-between items-center z-10 pointer-events-none">
                    ${product.badge ? `
                        <span class="${product.badgeColor || 'bg-emerald-700'} text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-md">
                            ${product.badge}
                        </span>
                    ` : '<span></span>'}
                    <button 
                        onclick="toggleWishlist('${product.id}')" 
                        class="pointer-events-auto w-9 h-9 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center text-gray-400 hover:text-red-500 hover:scale-110 active:scale-90 transition-all"
                        title="أضف إلى المفضلة"
                    >
                        <i class="${isWishlisted ? 'fas fa-heart text-red-500' : 'far fa-heart'} text-base"></i>
                    </button>
                </div>

                <!-- Product Image -->
                <div class="product-image-container relative bg-gray-50 h-56 overflow-hidden cursor-pointer" onclick="openQuickView('${product.id}')">
                    <img src="${imgSrc}" alt="${product.title}" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span class="bg-white/90 text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 backdrop-blur-sm">
                            <i class="fas fa-eye text-emerald-600"></i> تفاصيل المنتج والفوائد
                        </span>
                    </div>
                </div>

                <!-- Product Body Details -->
                <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div class="space-y-1.5">
                        <div class="flex items-center gap-1 text-amber-500 text-xs font-bold">
                            <i class="fas fa-star"></i>
                            <span>${product.rating || 5.0}</span>
                            <span class="text-gray-400 font-normal">(${product.reviewsCount || 1} تجربة حقيقية)</span>
                        </div>
                        <h3 class="font-bold text-gray-900 text-base leading-snug line-clamp-2 hover:text-emerald-700 cursor-pointer" onclick="openQuickView('${product.id}')">
                            ${product.title}
                        </h3>
                    </div>

                    <div class="pt-2 border-t border-gray-100 flex items-center justify-between">
                        <div>
                            <div class="text-lg font-black text-emerald-800">
                                ${(product.price || 0).toLocaleString()} <span class="text-xs font-bold text-gray-500">ج.م</span>
                            </div>
                            ${product.oldPrice ? `
                                <div class="text-xs text-gray-400 line-through">
                                    ${product.oldPrice.toLocaleString()} ج.م
                                </div>
                            ` : ''}
                        </div>

                        <!-- Add to Cart Button -->
                        <button 
                            onclick="addToCart('${product.id}')" 
                            class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95 ${
                                isInCart 
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                                : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20'
                            }"
                        >
                            <i class="${isInCart ? 'fas fa-check' : 'fas fa-cart-plus'}"></i>
                            <span>${isInCart ? 'في السلة' : 'إضافة'}</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Category Filter Click
function filterByCategory(cat) {
    state.currentCategory = cat;
    
    const pills = document.querySelectorAll('.category-btn');
    pills.forEach(btn => {
        if (btn.getAttribute('data-cat') === cat) {
            btn.classList.add('active');
            btn.classList.remove('bg-white', 'text-gray-700');
        } else {
            btn.classList.remove('active');
            btn.classList.add('bg-white', 'text-gray-700');
        }
    });

    renderProducts();
}

// Search Input Handler
function handleSearch(val) {
    state.searchQuery = val.trim();
    const clearBtn = document.getElementById('clearSearchBtn');
    if (clearBtn) {
        if (state.searchQuery) {
            clearBtn.classList.remove('hidden');
        } else {
            clearBtn.classList.add('hidden');
        }
    }
    renderProducts();
}

function clearSearch() {
    const input = document.getElementById('searchInput');
    if (input) input.value = '';
    state.searchQuery = '';
    const clearBtn = document.getElementById('clearSearchBtn');
    if (clearBtn) clearBtn.classList.add('hidden');
    renderProducts();
}

// Sort Selection
function handleSort(val) {
    state.sortBy = val;
    renderProducts();
}

// Cart Operations
function addToCart(productId) {
    const products = getStoredProducts();
    const product = products.find(p => p.id.toString() === productId.toString());
    if (!product) return;

    const existingIndex = state.cart.findIndex(item => item.id.toString() === productId.toString());
    if (existingIndex > -1) {
        state.cart[existingIndex].qty += 1;
    } else {
        state.cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            qty: 1
        });
    }

    saveCart();
    updateCartUI();
    renderProducts();
    showToast(`تمت إضافة "${product.title}" إلى السلة`, 'fas fa-cart-plus text-emerald-500');

    const badge = document.getElementById('cartBadge');
    if (badge) {
        badge.classList.remove('badge-pop');
        void badge.offsetWidth;
        badge.classList.add('badge-pop');
    }
}

function updateCartQty(productId, delta) {
    const itemIndex = state.cart.findIndex(i => i.id.toString() === productId.toString());
    if (itemIndex > -1) {
        state.cart[itemIndex].qty += delta;
        if (state.cart[itemIndex].qty <= 0) {
            state.cart.splice(itemIndex, 1);
        }
        saveCart();
        updateCartUI();
        renderProducts();
    }
}

function removeFromCart(productId) {
    state.cart = state.cart.filter(item => item.id.toString() !== productId.toString());
    saveCart();
    updateCartUI();
    renderProducts();
    showToast('تم حذف المنتج من السلة', 'fas fa-trash text-red-400');
}

function saveCart() {
    localStorage.setItem('makkah_oils_cart', JSON.stringify(state.cart));
}

function updateCartUI() {
    const totalCount = state.cart.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const discountAmount = Math.round(subtotal * state.appliedDiscountPercent);
    const finalTotal = Math.max(0, subtotal - discountAmount);

    const cartBadge = document.getElementById('cartBadge');
    const drawerCartCount = document.getElementById('drawerCartCount');
    if (cartBadge) cartBadge.innerText = totalCount;
    if (drawerCartCount) drawerCartCount.innerText = `${totalCount} عناصر`;

    const itemsList = document.getElementById('cartItemsList');
    const emptyView = document.getElementById('emptyCartView');
    const cartFooter = document.getElementById('cartFooter');
    const subtotalEl = document.getElementById('cartSubtotal');
    const discountRow = document.getElementById('discountRow');
    const discountEl = document.getElementById('cartDiscount');
    const totalEl = document.getElementById('cartTotal');
    const checkoutTotalVal = document.getElementById('checkoutTotalVal');

    if (state.cart.length === 0) {
        if (emptyView) emptyView.classList.remove('hidden');
        if (itemsList) itemsList.classList.add('hidden');
        if (cartFooter) cartFooter.classList.add('hidden');
    } else {
        if (emptyView) emptyView.classList.add('hidden');
        if (itemsList) {
            itemsList.classList.remove('hidden');
            itemsList.innerHTML = state.cart.map(item => `
                <div class="flex items-center gap-3 pt-3 first:pt-0">
                    <img src="${item.image || 'https://images.unsplash.com/photo-1608248597359-497669d0d3a9?auto=format&fit=crop&w=300&q=80'}" alt="${item.title}" class="w-16 h-16 rounded-xl object-cover bg-gray-100 shrink-0 border border-gray-100">
                    <div class="flex-1 min-w-0">
                        <h4 class="font-bold text-xs text-gray-800 truncate">${item.title}</h4>
                        <div class="text-emerald-700 font-black text-xs mt-1">
                            ${(item.price || 0).toLocaleString()} ج.م
                        </div>
                        <div class="flex items-center gap-2 mt-2">
                            <button onclick="updateCartQty('${item.id}', -1)" class="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-bold transition-colors">
                                -
                            </button>
                            <span class="text-xs font-bold w-5 text-center">${item.qty}</span>
                            <button onclick="updateCartQty('${item.id}', 1)" class="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-bold transition-colors">
                                +
                            </button>
                        </div>
                    </div>
                    <button onclick="removeFromCart('${item.id}')" class="text-gray-400 hover:text-red-500 p-2 transition-colors">
                        <i class="far fa-trash-alt text-sm"></i>
                    </button>
                </div>
            `).join('');
        }
        if (cartFooter) cartFooter.classList.remove('hidden');
    }

    if (subtotalEl) subtotalEl.innerText = `${subtotal.toLocaleString()} ج.م`;
    if (discountRow) {
        if (discountAmount > 0) {
            discountRow.style.display = 'flex';
            if (discountEl) discountEl.innerText = `-${discountAmount.toLocaleString()} ج.م (${Math.round(state.appliedDiscountPercent * 100)}%)`;
        } else {
            discountRow.style.display = 'none';
        }
    }
    if (totalEl) totalEl.innerText = `${finalTotal.toLocaleString()} ج.م`;
    if (checkoutTotalVal) checkoutTotalVal.innerText = `${finalTotal.toLocaleString()} ج.م`;
}

// Drawer Toggle
function toggleCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const panel = document.getElementById('cartPanel');
    const backdrop = document.getElementById('cartBackdrop');

    if (!drawer || !panel || !backdrop) return;

    if (drawer.classList.contains('hidden')) {
        drawer.classList.remove('hidden');
        setTimeout(() => {
            backdrop.classList.remove('opacity-0');
            backdrop.classList.add('opacity-100');
            panel.classList.remove('-translate-x-full');
            panel.classList.add('translate-x-0');
        }, 10);
    } else {
        backdrop.classList.remove('opacity-100');
        backdrop.classList.add('opacity-0');
        panel.classList.remove('translate-x-0');
        panel.classList.add('-translate-x-full');
        setTimeout(() => {
            drawer.classList.add('hidden');
        }, 300);
    }
}

// Coupon Logic
function applyCoupon(codeToApply = null) {
    const input = document.getElementById('couponInput');
    const msg = document.getElementById('couponMsg');

    const code = (codeToApply || (input ? input.value : '')).trim().toUpperCase();
    if (!code) return;

    if (input) input.value = code;

    // تسجيل الكوبون تلقائياً إذا لم يكن مضافاً مسبقاً
    if (!VALID_COUPONS[code]) {
        const match = code.match(/\d+/);
        const percent = match ? parseInt(match[0], 10) / 100 : 0.15;
        VALID_COUPONS[code] = Math.min(Math.max(percent, 0.05), 0.70); // ما بين 5% إلى 70%
    }

    if (VALID_COUPONS[code]) {
        state.appliedDiscountPercent = VALID_COUPONS[code];
        state.appliedCouponCode = code;
        if (msg) {
            msg.innerText = `تم تطبيق كود الخصم بنجاح! (${Math.round(state.appliedDiscountPercent * 100)}% خصم)`;
            msg.className = "text-xs text-green-600 font-semibold block";
        }
        updateCartUI();
        showToast(`تم تفعيل كود الخصم (${code}) بنجاح!`, 'fas fa-percent text-emerald-500');
    } else {
        if (msg) {
            msg.innerText = "كود الخصم غير صالح أو منتهي الصلاحية";
            msg.className = "text-xs text-red-500 font-semibold block";
        }
    }
}

// Announcements Bar Logic
function renderFrontAnnouncement(announcements) {
    const bar = document.getElementById('dynamicAnnouncementBar');
    if (!bar) return;

    const list = announcements || JSON.parse(localStorage.getItem('makkah_announcements') || '[]');
    const activeItems = list.filter(a => a.active !== false);

    if (activeItems.length === 0) {
        bar.innerHTML = '';
        bar.classList.add('hidden');
        return;
    }

    // عرض الإعلان النشط الأول الذي لم يقم الزائر بإغلاقه في جلسته
    const activeAnn = activeItems.find(a => !sessionStorage.getItem('makkah_ann_dismissed_' + a.id)) || activeItems[0];

    if (!activeAnn || sessionStorage.getItem('makkah_ann_dismissed_' + activeAnn.id)) {
        bar.innerHTML = '';
        bar.classList.add('hidden');
        return;
    }

    const themeStyles = {
        'emerald': 'bg-gradient-to-r from-emerald-950 via-emerald-800 to-emerald-950 text-emerald-50 border-b border-emerald-700/40',
        'amber': 'bg-gradient-to-r from-amber-900 via-amber-700 to-amber-900 text-amber-50 border-b border-amber-600/40',
        'rose': 'bg-gradient-to-r from-rose-950 via-red-800 to-rose-950 text-rose-50 border-b border-red-700/40',
        'indigo': 'bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-indigo-50 border-b border-indigo-800/40'
    };

    const currentStyle = themeStyles[activeAnn.theme] || themeStyles['emerald'];

    bar.className = `${currentStyle} py-2.5 px-4 text-xs font-medium shadow-sm transition-all duration-300 relative z-50`;
    bar.innerHTML = `
        <div class="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
            <div class="flex items-center gap-2.5 mx-auto text-center flex-wrap justify-center">
                <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20 text-white shrink-0 text-[11px] animate-pulse">
                    <i class="fas fa-bullhorn"></i>
                </span>
                <span class="font-bold tracking-wide">${activeAnn.text || ''}</span>
                ${activeAnn.coupon ? `
                    <button onclick="copyAnnouncementCoupon('${activeAnn.coupon}')" title="اضغط لنسخ وتطبيق كود الخصم في سلتك" class="bg-white/20 hover:bg-white/30 text-white font-mono font-bold px-2.5 py-0.5 rounded-lg text-[11px] border border-white/30 transition-all flex items-center gap-1 active:scale-95 shadow-sm">
                        <i class="fas fa-tag text-[10px]"></i>
                        <span>كود: ${activeAnn.coupon}</span>
                        <i class="far fa-copy text-[10px] opacity-75"></i>
                    </button>
                ` : ''}
                ${activeAnn.btnText ? `
                    <a href="${activeAnn.btnLink || '#products'}" class="bg-white hover:bg-gray-100 text-gray-900 font-bold px-3 py-1 rounded-lg text-[11px] shadow-sm transition-all active:scale-95 flex items-center gap-1">
                        <span>${activeAnn.btnText}</span>
                        <i class="fas fa-arrow-left text-[9px]"></i>
                    </a>
                ` : ''}
            </div>
            <button onclick="dismissAnnouncement('${activeAnn.id}')" title="إغلاق الإعلان" class="text-white/60 hover:text-white transition-colors p-1 rounded-full text-xs shrink-0">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    bar.classList.remove('hidden');
}

function copyAnnouncementCoupon(coupon) {
    if (!coupon) return;
    try {
        navigator.clipboard.writeText(coupon);
    } catch(e) {}
    applyCoupon(coupon);
    showToast(`تم نسخ وتفعيل كود الخصم (${coupon}) في سلتك ✓`, 'fas fa-check-circle text-emerald-500');
}

function dismissAnnouncement(id) {
    const bar = document.getElementById('dynamicAnnouncementBar');
    if (bar) bar.classList.add('hidden');
    if (id) {
        sessionStorage.setItem('makkah_ann_dismissed_' + id, 'true');
    }
}

// Wishlist Logic
function toggleWishlist(productId) {
    const index = state.wishlist.findIndex(id => id.toString() === productId.toString());
    if (index > -1) {
        state.wishlist.splice(index, 1);
        showToast('تمت الإزالة من قائمة المفضلة', 'far fa-heart text-gray-300');
    } else {
        state.wishlist.push(productId);
        showToast('تمت الإضافة إلى قائمة المفضلة ♥', 'fas fa-heart text-red-400');
    }
    localStorage.setItem('makkah_oils_wishlist', JSON.stringify(state.wishlist));
    updateWishlistUI();
    renderProducts();
}

function updateWishlistUI() {
    const badge = document.getElementById('wishlistBadge');
    if (badge) {
        badge.innerText = state.wishlist.length;
        if (state.wishlist.length > 0) {
            badge.classList.remove('scale-0');
            badge.classList.add('scale-100');
        } else {
            badge.classList.remove('scale-100');
            badge.classList.add('scale-0');
        }
    }
}

function toggleWishlistModal() {
    const modal = document.getElementById('wishlistModal');
    const container = document.getElementById('wishlistItems');
    if (!modal || !container) return;

    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        const products = getStoredProducts();
        const items = products.filter(p => state.wishlist.some(wid => wid.toString() === p.id.toString()));
        if (items.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="far fa-heart text-4xl mb-2 text-gray-300"></i>
                    <p class="text-sm font-semibold">قائمتك المفضلة فارغة حالياً</p>
                </div>
            `;
        } else {
            container.innerHTML = items.map(item => `
                <div class="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-2xl">
                    <div class="flex items-center gap-3">
                        <img src="${item.image || 'https://images.unsplash.com/photo-1608248597359-497669d0d3a9?auto=format&fit=crop&w=300&q=80'}" alt="${item.title}" class="w-12 h-12 rounded-xl object-cover">
                        <div>
                            <h4 class="text-xs font-bold text-gray-900 line-clamp-1">${item.title}</h4>
                            <span class="text-emerald-700 font-black text-xs">${(item.price || 0).toLocaleString()} ج.م</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="addToCart('${item.id}'); toggleWishlistModal();" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold">
                            إضافة للسلة
                        </button>
                        <button onclick="toggleWishlist('${item.id}'); toggleWishlistModal(); toggleWishlistModal();" class="p-1.5 text-gray-400 hover:text-red-500">
                            <i class="fas fa-trash-alt text-xs"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
    } else {
        modal.classList.add('hidden');
    }
}

// Quick View Modal
function openQuickView(productId) {
    const products = getStoredProducts();
    const product = products.find(p => p.id.toString() === productId.toString());
    if (!product) return;

    const modal = document.getElementById('quickViewModal');
    const content = document.getElementById('quickViewContent');
    const isInCart = state.cart.some(item => item.id.toString() === product.id.toString());

    content.innerHTML = `
        <div class="rounded-2xl overflow-hidden bg-gray-100 aspect-square">
            <img src="${product.image || 'https://images.unsplash.com/photo-1608248597359-497669d0d3a9?auto=format&fit=crop&w=700&q=80'}" alt="${product.title}" class="w-full h-full object-cover">
        </div>
        <div class="space-y-4">
            <div>
                ${product.badge ? `
                    <span class="${product.badgeColor || 'bg-emerald-700'} text-white text-xs font-black px-2.5 py-1 rounded-full inline-block mb-2">
                        ${product.badge}
                    </span>
                ` : ''}
                <h2 class="text-xl sm:text-2xl font-black text-gray-900 leading-snug">${product.title}</h2>
                <div class="flex items-center gap-2 mt-2 text-amber-500 text-sm">
                    <i class="fas fa-star"></i>
                    <span class="font-bold">${product.rating || 5.0}</span>
                    <span class="text-gray-400 text-xs">(${product.reviewsCount || 1} تجربة وتقييم عملاء)</span>
                </div>
            </div>

            <p class="text-sm text-gray-600 leading-relaxed">
                ${product.description || 'خلاصات وزيوت طبيعية 100% معصورة على البارد لعلاج مشاكل الشعر.'}
            </p>

            <div class="pt-2 border-t border-gray-100">
                <div class="flex items-baseline gap-2">
                    <span class="text-3xl font-black text-emerald-800">${(product.price || 0).toLocaleString()}</span>
                    <span class="text-sm font-bold text-gray-600">جنيه مصري</span>
                    ${product.oldPrice ? `<span class="text-sm text-gray-400 line-through mr-2">${product.oldPrice.toLocaleString()} ج.م</span>` : ''}
                </div>
            </div>

            <div class="flex gap-3 pt-2">
                <button 
                    onclick="addToCart('${product.id}'); closeQuickView();" 
                    class="flex-1 py-3 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <i class="${isInCart ? 'fas fa-check' : 'fas fa-cart-plus'}"></i>
                    <span>${isInCart ? 'إضافة عبوة أخرى للسلة' : 'إضافة إلى السلة'}</span>
                </button>
                <button 
                    onclick="toggleWishlist('${product.id}')" 
                    class="p-3 border border-gray-200 hover:bg-gray-50 rounded-xl text-gray-600 hover:text-red-500 transition-colors"
                >
                    <i class="${state.wishlist.some(wid => wid.toString() === product.id.toString()) ? 'fas fa-heart text-red-500' : 'far fa-heart'} text-lg"></i>
                </button>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
}

function closeQuickView() {
    const modal = document.getElementById('quickViewModal');
    if (modal) modal.classList.add('hidden');
}

// Checkout & Direct WhatsApp Integration + Log Order to Firebase Realtime Database
function openCheckoutModal() {
    if (state.cart.length === 0) {
        showToast('سلتك فارغة! أضف منتجات أولاً', 'fas fa-exclamation-circle text-amber-500');
        return;
    }
    toggleCartDrawer();
    const modal = document.getElementById('checkoutModal');
    if (modal) modal.classList.remove('hidden');
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (modal) modal.classList.add('hidden');
}

async function handleCheckoutSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const city = document.getElementById('custCity').value.trim();
    const address = document.getElementById('custAddress').value.trim();

    if (!name || !phone || !city || !address) {
        showToast('يرجى استكمال جميع البيانات المطلوبة', 'fas fa-exclamation-triangle text-amber-500');
        return;
    }

    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const discountAmount = Math.round(subtotal * state.appliedDiscountPercent);
    const finalTotal = Math.max(0, subtotal - discountAmount);
    const randomOrderNum = Math.floor(10000 + Math.random() * 90000);

    // تجهيز كائن الطلب لقاعدة بيانات Firebase
    const newOrder = {
        id: Date.now(),
        orderNumber: randomOrderNum,
        date: new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        name,
        phone,
        city,
        address,
        items: state.cart.map(i => ({ title: i.title, qty: i.qty, price: i.price })),
        subtotal,
        discount: discountAmount,
        total: finalTotal,
        status: 'جديد'
    };

    // حفظ الطلب في Firebase Realtime Database
    try {
        if (typeof saveOrderToFirebase === 'function') {
            await saveOrderToFirebase(newOrder);
        }
    } catch(err) {
        console.error("Error pushing order to Firebase:", err);
    }

    // Format products list for WhatsApp
    const itemsLines = state.cart.map((item, idx) => 
        `🌿 ${idx + 1}. *${item.title}* \n   الكمية: (${item.qty}) عبوة | السعر: ${(item.price * item.qty).toLocaleString()} ج.م`
    ).join('\n');

    // Build WhatsApp message
    const waMessage = 
`السلام عليكم ورحمة الله وبركاته،
أود تأكيد طلبي من متجر *كنوز مكة للزيوت الطبيعية وعلاج مشاكل الشعر* 🌿

📋 *بيانات العميل والشحن:*
👤 الاسم: ${name}
📱 رقم الهاتف: ${phone}
📍 المحافظة / المدينة: ${city}
🏠 العنوان بالتفصيل: ${address}

🧴 *الزيوت والكورسات المطلوبة:*
${itemsLines}

💰 *ملخص الحساب:*
• المجموع الفرعي: ${subtotal.toLocaleString()} ج.م
${discountAmount > 0 ? `• الخصم المطبق (${state.appliedCouponCode}): -${discountAmount.toLocaleString()} ج.م\n` : ''}• تكلفة الشحن: مجاني لكافة المحافظات
💵 *الإجمالي المطلوب سداده عند الاستلام:* *${finalTotal.toLocaleString()} ج.م*
🚚 طريقة الدفع: نقدياً عند الاستلام (معاينة قبل الدفع)

🔖 رقم الطلب: #${randomOrderNum}
برجاء تأكيد استلام الطلب وإرسال إرشادات الاستخدام الصحيحة، شكراً لكم!`;

    const waUrl = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;

    const orderNumberEl = document.getElementById('orderNumber');
    if (orderNumberEl) orderNumberEl.innerText = `#${randomOrderNum}`;

    const waBtn = document.getElementById('whatsappOrderBtn');
    if (waBtn) waBtn.href = waUrl;

    // Reset Cart
    state.cart = [];
    state.appliedDiscountPercent = 0;
    state.appliedCouponCode = '';
    saveCart();
    updateCartUI();
    renderProducts();

    closeCheckoutModal();

    // Open WhatsApp in new tab
    window.open(waUrl, '_blank');

    // Show Success Modal
    const successModal = document.getElementById('orderSuccessModal');
    if (successModal) successModal.classList.remove('hidden');
}

function closeOrderSuccessModal() {
    const successModal = document.getElementById('orderSuccessModal');
    if (successModal) successModal.classList.add('hidden');
}

// Toast Alert
let toastTimer = null;
function showToast(message, iconClass = 'fas fa-check-circle text-emerald-500') {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    const toastIcon = document.getElementById('toastIcon');

    if (!toast || !toastMsg || !toastIcon) return;

    toastMsg.innerText = message;
    toastIcon.innerHTML = `<i class="${iconClass}"></i>`;

    toast.classList.add('toast-show');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove('toast-show');
    }, 3200);
}

// ==========================================
// Secret Admin Login via Lock Icon
// ==========================================
function openAdminLoginModal() {
    const modal = document.getElementById('adminLoginModal');
    const input = document.getElementById('adminPassInput');
    const err = document.getElementById('adminLoginError');
    if (!modal) return;
    if (input) input.value = '';
    if (err) err.classList.add('hidden');
    modal.classList.remove('hidden');
    setTimeout(() => { if (input) input.focus(); }, 150);
}

function closeAdminLoginModal() {
    const modal = document.getElementById('adminLoginModal');
    if (modal) modal.classList.add('hidden');
}

function togglePasswordVisibility() {
    const input = document.getElementById('adminPassInput');
    const icon = document.getElementById('passVisibilityIcon');
    if (!input || !icon) return;
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

async function handleAdminLogin(e) {
    e.preventDefault();
    const input = document.getElementById('adminPassInput');
    const err = document.getElementById('adminLoginError');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (!input) return;

    const enteredPass = input.value.trim();
    if (!enteredPass) return;

    if (err) err.classList.add('hidden');
    input.classList.remove('border-red-500');

    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحقق...';
    }

    try {
        let result = { success: false };
        if (typeof verifyAdminPasswordWithFirebase === 'function') {
            result = await verifyAdminPasswordWithFirebase(enteredPass);
        } else {
            const localPass = localStorage.getItem('makkah_admin_password');
            result = { success: !!(localPass && enteredPass === localPass) };
        }

        if (result && result.success) {
            sessionStorage.setItem('makkah_admin_auth', 'authenticated');
            closeAdminLoginModal();
            window.location.href = 'admin.html';
        } else {
            if (err) {
                err.innerText = (result && result.message) ? result.message : "كلمة المرور غير صحيحة، حاول مجدداً";
                err.classList.remove('hidden');
            }
            input.classList.add('border-red-500');
            input.select();
        }
    } catch (error) {
        console.error("Login verification error:", error);
        if (err) {
            err.innerText = "حدث خطأ أثناء التحقق، يرجى المحاولة لاحقاً";
            err.classList.remove('hidden');
        }
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
        }
    }
}
