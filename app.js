// =================================================================
// متجر كنوز مكة | Kunooz Makkah - نمط أمازون (Amazon E-Commerce Experience)
// متجر احترافي للزيوت الطبيعية المعصورة على البارد لعلاج مشاكل الشعر
// متصل مباشرة بقاعدة بيانات Firebase Realtime Database
// =================================================================

// رقم الواتساب الخاص بالمتجر لاستقبال الطلبات وتأكيد الشحن
const STORE_WHATSAPP_NUMBER = "201080369841"; 

// تنظيف النصوص لمنع ثغرات XSS وحقن الأكواد
function escapeHTML(str) {
    if (!str) return '';
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
} 

// كتالوج المنتجات الافتراضي الشامل لكافة البضائع والأقسام (أزياء، كوتشيات، مكملات، إلكترونيات، وكل المنتجات)
const BACKUP_CATALOG = [
    {
        id: "km-1",
        title: "كوتشي رياضي فانتوم إير كاجوال خفيف ومريح للجري والمشي اليومي",
        category: "shoes",
        badge: "الأكثر مبيعاً #1",
        badgeColor: "bestseller-badge",
        price: 420,
        oldPrice: 580,
        rating: 4.9,
        reviewsCount: 340,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80",
        description: "حذاء رياضي عصري مريح جداً بنعل طبي ممتص للصدمات وخامات مسامية للتهوية ممتازة للجري والتمارين والاستخدام اليومي."
    },
    {
        id: "km-2",
        title: "مكمل كرياتين مونوهيدرات نقي 100% ميكرونايزد لكمال الأجسام وزيادة القوة (300 جم)",
        category: "sports",
        badge: "الأعلى طلباً في الجيم",
        badgeColor: "deal-badge-red",
        price: 390,
        oldPrice: 520,
        rating: 5.0,
        reviewsCount: 295,
        image: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=700&q=80",
        description: "كرياتين نقي غير منكه سريع الامتصاص لزيادة الكتلة العضلية ورفع كفاءة التمارين وطاقة التحمل، أصلي 100%."
    },
    {
        id: "km-3",
        title: "تيشيرت أوفر سايز قطن مصري 100% كاجوال بطباعة عصرية فاخرة",
        category: "fashion",
        badge: "وصل حديثاً",
        badgeColor: "bg-indigo-700 text-white font-bold text-[11px] px-2 py-0.5 rounded",
        price: 270,
        oldPrice: 380,
        rating: 4.8,
        reviewsCount: 182,
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80",
        description: "تيشيرت قطن ممشط فائق النعومة ومريح للغاية مناسب لجميع الأوقات والخروجات مع ثبات عالي للألوان بعد الغسيل."
    },
    {
        id: "km-4",
        title: "سماعة بلوتوث برو لاسلكية بعزل الضوضاء وشاشة ديجيتال لعرض الشحن",
        category: "electronics",
        badge: "توفير 35%",
        badgeColor: "deal-badge-red",
        price: 310,
        oldPrice: 480,
        rating: 4.9,
        reviewsCount: 420,
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=700&q=80",
        description: "سماعات أيربودز لاسلكية بصوت نقي ونظام بيز قوي مع مايك مدمج للمكالمات وبطارية تدوم حتى 30 ساعة مع علبة الشحن."
    },
    {
        id: "km-5",
        title: "بنطلون سويت بانتس قطن ميلتون رياضي مريح للجيم والشارع",
        category: "fashion",
        badge: "خامة قطن تقيلة",
        badgeColor: "bestseller-badge",
        price: 340,
        oldPrice: 460,
        rating: 4.9,
        reviewsCount: 215,
        image: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=700&q=80",
        description: "بنطلون رياضي عملي بجيوب بسوستة واستك مريح وخامات قطنية ممتازة تناسب التمارين والخروجات الكاجوال."
    },
    {
        id: "km-6",
        title: "شورت رياضي مبطن للجيم والتمارين مع جيوب سرية بسوستة",
        category: "fashion",
        badge: "الأفضل للتمارين",
        badgeColor: "bg-teal-700 text-white font-bold text-[11px] px-2 py-0.5 rounded",
        price: 230,
        oldPrice: 320,
        rating: 4.8,
        reviewsCount: 167,
        image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=700&q=80",
        description: "شورت 2 في 1 بتصميم مرن ومقاوم للتعرق مع بطانة داخلية ضاغطة ومريحة جداً أثناء ممارسة الرياضة والجري."
    },
    {
        id: "km-7",
        title: "ساعة يد ذكية سمارت ووتش ألترا تدعم المكالمات ومتابعة اللياقة ومقاومة للماء",
        category: "electronics",
        badge: "صفقة اليوم",
        badgeColor: "deal-badge-red",
        price: 490,
        oldPrice: 750,
        rating: 4.9,
        reviewsCount: 310,
        image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=700&q=80",
        description: "شاشة لمس عالية الدقة تدعم إشعارات الموبايل، قياس نبضات القلب ونسبة الأكسجين، وبطارية قوية مع أساور متعددة."
    },
    {
        id: "km-8",
        title: "عطر رجالي/حريمي فاخر بتركيز أو دو بارفان ثبات وفوحان يدوم 48 ساعة",
        category: "beauty",
        badge: "عطر فخم",
        badgeColor: "bestseller-badge",
        price: 320,
        oldPrice: 480,
        rating: 5.0,
        reviewsCount: 198,
        image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=700&q=80",
        description: "توليفة مميزة تجمع بين روائح العنبر والأخشاب والزهور برائحة تأسر الحواس وثبات طويل على الملابس."
    },
    {
        id: "km-9",
        title: "باور بانك 20,000 مللي أمبير شحن فائق السرعة 22.5W بشاشة ديجيتال ومنافذ متعددة",
        category: "electronics",
        badge: "تريند عالي",
        badgeColor: "deal-badge-red",
        price: 430,
        oldPrice: 620,
        rating: 4.9,
        reviewsCount: 380,
        image: "https://images.unsplash.com/photo-1609592424367-e9a8f2fca217?auto=format&fit=crop&w=700&q=80",
        description: "شاحن متنقل بسعة عملاقة يدعم الشحن السريع PD لموبايلات الآيفون والأندرويد مع شاشة رقمية لعرض نسبة الشحن بدقة."
    },
    {
        id: "km-10",
        title: "ماكينة حلاقة VGR بروفيشنال الأصلية لتحديد الذقن والشعر برؤوس دقيقة ومقاومة للماء",
        category: "electronics",
        badge: "الأكثر مبيعاً للرجال",
        badgeColor: "bestseller-badge",
        price: 360,
        oldPrice: 510,
        rating: 4.9,
        reviewsCount: 412,
        image: "https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=700&q=80",
        description: "ماكينة حلاقة معدنية احترافية بموتور توربو فائق الهدوء وبطارية ليثيوم تدوم 180 دقيقة مع شفرات حادة من التيتانيوم."
    },
    {
        id: "km-11",
        title: "عرض دستة شرابات رياضية (12 زوج) قطن مصري 100% مانعة للتعرق والانزلاق للجيم والعمل",
        category: "fashion",
        badge: "عرض توفير دستة",
        badgeColor: "bg-emerald-700 text-white font-bold text-[11px] px-2 py-0.5 rounded",
        price: 195,
        oldPrice: 300,
        rating: 5.0,
        reviewsCount: 520,
        image: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=700&q=80",
        description: "باكدج 12 زوج شرابات قطنية عالية النعومة مع نعل مبطن لامتصاص الصدمات وتقنية مقاومة للبكتيريا والروائح."
    },
    {
        id: "km-12",
        title: "مج حراري ستانلس ستيل حافظ للحرارة والبرودة 12 ساعة بغطاء ذكي مانع للتسريب",
        category: "home",
        badge: "اختيار يومي",
        badgeColor: "bg-blue-700 text-white font-bold text-[11px] px-2 py-0.5 rounded",
        price: 240,
        oldPrice: 350,
        rating: 4.8,
        reviewsCount: 230,
        image: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=700&q=80",
        description: "كوب حراري فاخر مزدوج الجدار مصنوع من الستانلس ستيل 304 الآمن، مثالي للقهوة والمشروبات الباردة والساخنة بالسيارة والعمل."
    },
    {
        id: "km-13",
        title: "مضخة ومنفاخ إطارات سيارات ذكي رقمي لاسلكي قابل للشحن مع كشاف طوارئ LED",
        category: "home",
        badge: "ضروري لكل سيارة",
        badgeColor: "deal-badge-red",
        price: 490,
        oldPrice: 720,
        rating: 4.9,
        reviewsCount: 275,
        image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=700&q=80",
        description: "كمبروسر هواء محمول دقيق يضبط ضغط الإطارات تلقائياً ويتوقف عند الوصول للمستوى المطلوب، مناسب للسيارات والموتوسيكلات والكرات."
    },
    {
        id: "km-14",
        title: "شيكر رياضي بروتين سعة 700 مل مع كرة خفق ستانلس وغطاء محكم الإغلاق ضد التسريب",
        category: "sports",
        badge: "ملحقات الجيم",
        badgeColor: "bg-teal-700 text-white font-bold text-[11px] px-2 py-0.5 rounded",
        price: 130,
        oldPrice: 200,
        rating: 4.9,
        reviewsCount: 190,
        image: "https://images.unsplash.com/photo-1594882645126-14020914d58d?auto=format&fit=crop&w=700&q=80",
        description: "شيكر عالي المتانة وخالي من مادة BPA لخلط مكملات الكرياتين ومساحيق البروتين بسلاسة وبدون أي تكتلات."
    }
];

// قائمة المنتجات المخزنة / المحملة من Firebase
let liveFirebaseProducts = JSON.parse(localStorage.getItem('makkah_real_products') || '[]');

function getStoredProducts() {
    if (liveFirebaseProducts && liveFirebaseProducts.length > 0) {
        return liveFirebaseProducts;
    }
    return BACKUP_CATALOG;
}

// حالة المتجر (State Management)
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

// بدء التشغيل عند اكتمال تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    updateCategoryCounts();
    renderProducts();
    renderDealsSlider();
    updateCartUI();
    updateWishlistUI();
    setupFloatingWhatsapp();
    renderFrontAnnouncement();
    initDealCountdown();

    // الاستماع المباشر للمنتجات من Firebase Realtime Database
    if (typeof subscribeToProducts === 'function') {
        subscribeToProducts(
            (products) => {
                if (products && products.length > 0) {
                    liveFirebaseProducts = products;
                }
                renderProducts();
                renderDealsSlider();
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

// إعداد زر الواتساب العائم
function setupFloatingWhatsapp() {
    const btn = document.getElementById('floatingWhatsappBtn');
    if (btn) {
        btn.href = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent("السلام عليكم، أريد الاستفسار عن منتجات وعروض متجر كنوز مكة")}`;
    }
}

// عداد المنتجات في الأقسام
function updateCategoryCounts() {
    const countEl = document.getElementById('count-all');
    const products = getStoredProducts();
    if (countEl) countEl.innerText = `(${products.length})`;
}

// تصفية وبحث وترتيب المنتجات لجميع الأقسام (أزياء، كوتشيات، مكملات، إلكترونيات، وكل المنتجات)
function getFilteredProducts() {
    const products = getStoredProducts();
    return products.filter(product => {
        let matchesCategory = false;
        const cat = state.currentCategory || 'all';

        if (cat === 'all') {
            matchesCategory = true;
        } else if (cat === 'fashion') {
            matchesCategory = product.category === 'fashion';
        } else if (cat === 'shoes') {
            matchesCategory = product.category === 'shoes';
        } else if (cat === 'sports') {
            matchesCategory = product.category === 'sports';
        } else if (cat === 'electronics') {
            matchesCategory = product.category === 'electronics';
        } else if (cat === 'beauty') {
            matchesCategory = product.category === 'beauty' || product.category === 'perfumes' || product.category === 'skincare' || product.category === 'natural' || product.category === 'hair-loss';
        } else if (cat === 'home') {
            matchesCategory = product.category === 'home' || product.category === 'general';
        } else if (cat === 'deals') {
            matchesCategory = product.category === 'deals' || product.category === 'bundles' || (product.oldPrice && product.oldPrice > product.price);
        } else {
            matchesCategory = product.category === cat;
        }

        const q = state.searchQuery.toLowerCase();
        const matchesSearch = !q || 
                              product.title.toLowerCase().includes(q) ||
                              (product.description && product.description.toLowerCase().includes(q));
        return matchesCategory && matchesSearch;
    }).sort((a, b) => {
        if (state.sortBy === 'price-low') return a.price - b.price;
        if (state.sortBy === 'price-high') return b.price - a.price;
        if (state.sortBy === 'rating') return (b.rating || 5) - (a.rating || 5);
        return a.id - b.id;
    });
}

// عرض المنتجات بنمط بطاقات أمازون الاحترافية
function renderProducts() {
    const container = document.getElementById('productsGrid');
    const noResults = document.getElementById('noProductsFound');
    const catalogCount = document.getElementById('catalogResultsCount');
    const filtered = getFilteredProducts();
    const allStored = getStoredProducts();

    updateCategoryCounts();

    if (catalogCount) {
        catalogCount.innerText = `(${filtered.length} منتج)`;
    }

    // تحديث حالة الأزرار في القائمة الجانبية والأزرار المحمولة
    updateCategoryActiveUI();

    if (allStored.length === 0) {
        if (container) container.innerHTML = '';
        if (noResults) noResults.classList.remove('hidden');
        return;
    }

    if (filtered.length === 0) {
        if (container) container.innerHTML = '';
        if (noResults) noResults.classList.remove('hidden');
        return;
    }

    if (noResults) noResults.classList.add('hidden');

    if (!container) return;

    container.innerHTML = filtered.map(product => {
        const isWishlisted = state.wishlist.some(wid => wid.toString() === product.id.toString());
        const isInCart = state.cart.some(item => item.id.toString() === product.id.toString());
        const imgSrc = product.image || 'https://images.unsplash.com/photo-1608248597359-497669d0d3a9?auto=format&fit=crop&w=700&q=80';
        
        let discountPercent = 0;
        if (product.oldPrice && product.oldPrice > product.price) {
            discountPercent = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
        }

        let badgeHtml = '';
        if (product.badge) {
            const badgeClass = product.badgeColor || 'bestseller-badge';
            badgeHtml = `<span class="${badgeClass}">${escapeHTML(product.badge)}</span>`;
        } else if (discountPercent > 0) {
            badgeHtml = `<span class="deal-badge-red">خصم ${discountPercent}%</span>`;
        }

        return `
            <div class="amazon-card flex flex-col justify-between overflow-hidden group relative p-4 bg-white">
                <!-- Top Badges & Wishlist -->
                <div class="flex justify-between items-start mb-2">
                    <div>
                        ${badgeHtml}
                    </div>
                    <button 
                        onclick="toggleWishlist('${product.id}')" 
                        class="w-8 h-8 rounded-full bg-gray-50 hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                        title="أضف للمفضلة"
                    >
                        <i class="${isWishlisted ? 'fas fa-heart text-red-500' : 'far fa-heart'} text-sm"></i>
                    </button>
                </div>

                <!-- Product Image with Zoom -->
                <div class="product-image-container relative bg-gray-50 h-52 sm:h-56 rounded-lg overflow-hidden cursor-pointer flex items-center justify-center mb-3" onclick="openQuickView('${product.id}')">
                    <img src="${imgSrc}" alt="${escapeHTML(product.title)}" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span class="bg-white/95 text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                            <i class="fas fa-eye text-amber-600"></i> تفاصيل المنتج
                        </span>
                    </div>
                </div>

                <!-- Title & Reviews -->
                <div class="space-y-1.5 flex-1">
                    <div class="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        <div class="flex items-center text-[11px] text-amber-500">
                            <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                        </div>
                        <span class="text-gray-900 font-bold mr-1">${product.rating || 4.9}</span>
                        <span class="text-gray-400 font-normal">(${product.reviewsCount || 48})</span>
                    </div>
                    <h3 class="font-bold text-gray-900 text-sm leading-snug line-clamp-2 hover:text-[#c7511f] cursor-pointer" onclick="openQuickView('${product.id}')">
                        ${escapeHTML(product.title)}
                    </h3>
                    <p class="text-[11px] text-gray-500 line-clamp-1">${escapeHTML(product.description || 'منتج أصلي عالي الجودة بأفضل سعر مع شحن سريع ومعاينة قبل الاستلام')}</p>
                </div>

                <!-- Price Section (Amazon Style) -->
                <div class="pt-3 border-t border-gray-100 space-y-1 mt-2">
                    <div class="flex items-baseline gap-2">
                        ${discountPercent > 0 ? `<span class="deal-badge-red text-[10px] py-0.5 px-1.5">خصم ${discountPercent}%</span>` : ''}
                        <div class="text-xl font-black text-gray-900">
                            ${(product.price || 0).toLocaleString()} <span class="text-xs font-bold text-gray-600">ج.م</span>
                        </div>
                    </div>
                    ${product.oldPrice ? `
                        <div class="text-xs text-gray-400">
                            السعر السابق: <span class="line-through">${product.oldPrice.toLocaleString()} ج.م</span>
                        </div>
                    ` : ''}

                    <div class="text-[11px] text-emerald-700 font-bold flex items-center gap-1 pt-1">
                        <i class="fas fa-truck-fast"></i>
                        <span>توصيل سريع متاح غداً • معاينة مجانية</span>
                    </div>
                </div>

                <!-- Amazon Dual Action Buttons -->
                <div class="pt-3 space-y-2 mt-2">
                    <button 
                        onclick="addToCart('${product.id}')" 
                        class="w-full py-2.5 rounded-lg text-xs font-bold btn-amazon-yellow flex items-center justify-center gap-2"
                    >
                        <i class="${isInCart ? 'fas fa-check text-green-700' : 'fas fa-cart-plus'}"></i>
                        <span>${isInCart ? 'في السلة (إضافة عبوة أخرى)' : 'أضف إلى العربة'}</span>
                    </button>
                    <button 
                        onclick="buyNow('${product.id}')" 
                        class="w-full py-2.5 rounded-lg text-xs font-bold btn-amazon-orange flex items-center justify-center gap-2"
                    >
                        <i class="fas fa-bolt"></i>
                        <span>اشتري الآن (دفع عند الاستلام)</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// عرض سلايدر العروض والصفقات الخاطفة (Amazon Horizontal Carousel)
function renderDealsSlider() {
    const container = document.getElementById('dealsSliderContainer');
    if (!container) return;
    const products = getStoredProducts();
    if (!products || products.length === 0) return;

    container.innerHTML = products.map(product => {
        const discountPercent = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 25;
        const imgSrc = product.image || 'https://images.unsplash.com/photo-1608248597359-497669d0d3a9?auto=format&fit=crop&w=400&q=80';
        return `
            <div class="amazon-card p-3 min-w-[210px] sm:min-w-[240px] max-w-[240px] flex flex-col justify-between shrink-0 bg-white">
                <div>
                    <div class="relative bg-gray-50 h-36 rounded-lg overflow-hidden mb-2 cursor-pointer" onclick="openQuickView('${product.id}')">
                        <img src="${imgSrc}" alt="${escapeHTML(product.title)}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300">
                        <span class="deal-badge-red absolute top-2 right-2 text-[10px]">خصم ${discountPercent}%</span>
                    </div>
                    <div class="flex items-center gap-1 text-amber-500 text-[11px] mb-1 font-bold">
                        <i class="fas fa-star"></i>
                        <span>${product.rating || 4.9}</span>
                        <span class="text-gray-400 font-normal">(${product.reviewsCount || 50})</span>
                    </div>
                    <h4 class="font-bold text-xs text-gray-900 line-clamp-2 hover:text-[#c7511f] cursor-pointer" onclick="openQuickView('${product.id}')">
                        ${escapeHTML(product.title)}
                    </h4>
                </div>
                <div class="pt-2 border-t border-gray-100 mt-2 space-y-2">
                    <div class="flex items-baseline gap-1.5">
                        <span class="text-base font-black text-gray-900">${(product.price || 0).toLocaleString()} <span class="text-[10px]">ج.م</span></span>
                        ${product.oldPrice ? `<span class="text-[11px] text-gray-400 line-through">${product.oldPrice.toLocaleString()} ج.م</span>` : ''}
                    </div>
                    <button onclick="addToCart('${product.id}')" class="w-full py-1.5 btn-amazon-yellow rounded-md text-xs font-bold flex items-center justify-center gap-1.5">
                        <i class="fas fa-cart-plus text-xs"></i>
                        <span>أضف للعربة</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// تمرير سلايدر العروض يميناً ويساراً
function scrollDealsSlider(offset) {
    const container = document.getElementById('dealsSliderContainer');
    if (container) {
        container.scrollBy({ left: offset, behavior: 'smooth' });
    }
}

// مؤقت العد التنازلي لصفقة اليوم
function initDealCountdown() {
    function tick() {
        const now = new Date();
        const midnight = new Date();
        midnight.setHours(23, 59, 59, 999);
        const diff = Math.max(0, midnight - now);

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const pad = (n) => n.toString().padStart(2, '0');
        const timerEl = document.getElementById('dealCountdown');
        if (timerEl) {
            timerEl.innerText = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
        }
    }
    tick();
    setInterval(tick, 1000);
}

// تصفية حسب القسم
function filterByCategory(cat) {
    state.currentCategory = cat;
    
    // تحديث محدد قسم البحث في الشريط العلوي إذا وجد
    const searchCatSelect = document.getElementById('searchCategorySelect');
    if (searchCatSelect) {
        searchCatSelect.value = cat;
    }

    renderProducts();
}

function updateCategoryActiveUI() {
    // الأزرار المحمولة (Chips)
    const pills = document.querySelectorAll('.category-btn');
    pills.forEach(btn => {
        if (btn.getAttribute('data-cat') === state.currentCategory) {
            btn.className = 'category-btn active px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 bg-[#ffd814] text-gray-900 border border-[#fcd200] shadow-sm';
        } else {
            btn.className = 'category-btn px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50';
        }
    });

    // الروابط الجانبية للديسكتوب
    const sideLinks = document.querySelectorAll('.category-filter-link');
    sideLinks.forEach(link => {
        if (link.getAttribute('data-cat') === state.currentCategory) {
            link.classList.add('bg-amber-50', 'text-amber-900', 'font-black');
            link.classList.remove('text-gray-700');
        } else {
            link.classList.remove('bg-amber-50', 'text-amber-900', 'font-black');
            link.classList.add('text-gray-700');
        }
    });
}

// البحث
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

function handleSort(val) {
    state.sortBy = val;
    renderProducts();
}

function handleSearchCategoryChange(cat) {
    filterByCategory(cat);
    scrollToProducts();
}

function executeSearchClick() {
    const input = document.getElementById('searchInput');
    if (input) {
        handleSearch(input.value);
        scrollToProducts();
    }
}

function scrollToProducts() {
    const el = document.getElementById('catalogSection');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// إضافة منتج إلى السلة
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
    showToast(`تمت إضافة "${product.title}" إلى عربة التسوق`, 'fas fa-cart-plus text-amber-400');

    const badge = document.getElementById('cartBadge');
    if (badge) {
        badge.classList.remove('badge-pop');
        void badge.offsetWidth;
        badge.classList.add('badge-pop');
    }
}

// الشراء الفوري بنمط أمازون (Buy Now)
function buyNow(productId) {
    const products = getStoredProducts();
    const product = products.find(p => p.id.toString() === productId.toString());
    if (!product) return;

    const existingIndex = state.cart.findIndex(item => item.id.toString() === productId.toString());
    if (existingIndex === -1) {
        state.cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            qty: 1
        });
        saveCart();
        updateCartUI();
    }
    openCheckoutModal();
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
    showToast('تم حذف المنتج من العربة', 'fas fa-trash text-red-400');
}

function saveCart() {
    localStorage.setItem('makkah_oils_cart', JSON.stringify(state.cart));
}

// تحديث واجهة عربة التسوق
function updateCartUI() {
    const totalCount = state.cart.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const discountAmount = Math.round(subtotal * state.appliedDiscountPercent);
    const finalTotal = Math.max(0, subtotal - discountAmount);

    const cartBadge = document.getElementById('cartBadge');
    const drawerCartCount = document.getElementById('drawerCartCount');
    const headerCartTotal = document.getElementById('headerCartTotal');

    if (cartBadge) cartBadge.innerText = totalCount;
    if (drawerCartCount) drawerCartCount.innerText = `${totalCount} عناصر`;
    if (headerCartTotal) headerCartTotal.innerText = `${finalTotal.toLocaleString()} ج.م`;

    const itemsList = document.getElementById('cartItemsList');
    const emptyView = document.getElementById('emptyCartView');
    const cartFooter = document.getElementById('cartFooter');
    const subtotalEl = document.getElementById('cartSubtotal');
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
                    <img src="${item.image || 'https://images.unsplash.com/photo-1608248597359-497669d0d3a9?auto=format&fit=crop&w=300&q=80'}" alt="${item.title}" class="w-16 h-16 rounded-lg object-cover bg-gray-100 shrink-0 border border-gray-200">
                    <div class="flex-1 min-w-0">
                        <h4 class="font-bold text-xs text-gray-800 truncate">${item.title}</h4>
                        <div class="text-gray-900 font-black text-xs mt-0.5">
                            ${(item.price || 0).toLocaleString()} ج.م
                        </div>
                        <div class="flex items-center gap-2 mt-2">
                            <button onclick="updateCartQty('${item.id}', -1)" class="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 flex items-center justify-center text-xs font-bold transition-colors">
                                -
                            </button>
                            <span class="text-xs font-bold w-5 text-center">${item.qty}</span>
                            <button onclick="updateCartQty('${item.id}', 1)" class="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 flex items-center justify-center text-xs font-bold transition-colors">
                                +
                            </button>
                            <button onclick="removeFromCart('${item.id}')" class="text-xs text-[#007185] hover:underline mr-2">
                                حذف
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        if (cartFooter) cartFooter.classList.remove('hidden');
    }

    if (subtotalEl) subtotalEl.innerText = `${subtotal.toLocaleString()} ج.م`;
    if (totalEl) totalEl.innerText = `${finalTotal.toLocaleString()} ج.م`;
    if (checkoutTotalVal) checkoutTotalVal.innerText = `${finalTotal.toLocaleString()} ج.م`;
}

// فتح وإغلاق درج عربة التسوق
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

// فتح وإغلاق القائمة الجانبية لأمازون (Side Menu Drawer)
function toggleAmazonSideMenu() {
    const drawer = document.getElementById('amazonSideMenu');
    const backdrop = document.getElementById('amazonSideMenuBackdrop');
    if (!drawer || !backdrop) return;

    if (backdrop.classList.contains('hidden')) {
        backdrop.classList.remove('hidden');
        setTimeout(() => {
            backdrop.classList.remove('opacity-0');
            backdrop.classList.add('opacity-100');
            drawer.classList.remove('translate-x-full');
            drawer.classList.add('translate-x-0');
        }, 10);
    } else {
        backdrop.classList.remove('opacity-100');
        backdrop.classList.add('opacity-0');
        drawer.classList.remove('translate-x-0');
        drawer.classList.add('translate-x-full');
        setTimeout(() => {
            backdrop.classList.add('hidden');
        }, 300);
    }
}

// مركز السياسات والخصوصية (Request A)
function openPolicyModal(tabKey = 'privacy') {
    const modal = document.getElementById('policyModal');
    if (modal) {
        modal.classList.remove('hidden');
        switchPolicyTab(tabKey);
    }
}

function closePolicyModal() {
    const modal = document.getElementById('policyModal');
    if (modal) modal.classList.add('hidden');
}

function switchPolicyTab(tabKey) {
    const tabs = ['privacy', 'returns', 'shipping', 'terms', 'guarantee'];
    tabs.forEach(t => {
        const btn = document.getElementById(`tabBtn-${t}`);
        const content = document.getElementById(`policyTab-${t}`);
        if (btn) {
            if (t === tabKey) {
                btn.className = "policy-tab-btn active px-3.5 py-2 rounded-lg bg-[#232f3e] text-white shrink-0";
            } else {
                btn.className = "policy-tab-btn px-3.5 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 shrink-0";
            }
        }
        if (content) {
            if (t === tabKey) {
                content.classList.remove('hidden');
            } else {
                content.classList.add('hidden');
            }
        }
    });
}

// عرض الإعلانات والعروض في شريط أعلى الصفحة
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

    const activeAnn = activeItems.find(a => !sessionStorage.getItem('makkah_ann_dismissed_' + a.id)) || activeItems[0];

    if (!activeAnn || sessionStorage.getItem('makkah_ann_dismissed_' + activeAnn.id)) {
        bar.innerHTML = '';
        bar.classList.add('hidden');
        return;
    }

    const cleanText = escapeHTML(activeAnn.text || '');
    const cleanBtnText = escapeHTML(activeAnn.btnText || '');
    const cleanBtnLink = escapeHTML(activeAnn.btnLink || '#catalogSection');
    const cleanId = escapeHTML(activeAnn.id);

    bar.className = `bg-[#232f3e] text-amber-300 py-2 px-4 text-xs font-bold border-b border-gray-700 shadow-sm transition-all duration-300 relative z-50`;
    bar.innerHTML = `
        <div class="max-w-[1500px] mx-auto flex items-center justify-between gap-3 flex-wrap">
            <div class="flex items-center gap-2.5 mx-auto text-center flex-wrap justify-center">
                <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 shrink-0 text-[10px] animate-pulse">
                    <i class="fas fa-bullhorn"></i>
                </span>
                <span class="tracking-wide">${cleanText}</span>
                ${cleanBtnText ? `
                    <a href="${cleanBtnLink}" class="bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold px-3 py-0.5 rounded text-[11px] transition-all shadow-sm">
                        <span>${cleanBtnText}</span>
                        <i class="fas fa-arrow-left text-[9px] mr-1"></i>
                    </a>
                ` : ''}
            </div>
            <button onclick="dismissAnnouncement('${cleanId}')" title="إغلاق الإعلان" class="text-gray-400 hover:text-white transition-colors p-1 text-xs shrink-0">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    bar.classList.remove('hidden');
}

function dismissAnnouncement(id) {
    const bar = document.getElementById('dynamicAnnouncementBar');
    if (bar) bar.classList.add('hidden');
    if (id) {
        sessionStorage.setItem('makkah_ann_dismissed_' + id, 'true');
    }
}

// قائمة المفضلة
function toggleWishlist(productId) {
    const index = state.wishlist.findIndex(id => id.toString() === productId.toString());
    if (index > -1) {
        state.wishlist.splice(index, 1);
        showToast('تمت الإزالة من المفضلة', 'far fa-heart text-gray-300');
    } else {
        state.wishlist.push(productId);
        showToast('تمت الإضافة إلى المفضلة ♥', 'fas fa-heart text-red-500');
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
                <div class="text-center py-8 text-gray-400">
                    <i class="far fa-heart text-3xl mb-2"></i>
                    <p class="text-xs">قائمة المفضلة فارغة حالياً</p>
                </div>
            `;
        } else {
            container.innerHTML = items.map(p => `
                <div class="flex items-center justify-between gap-3 p-2 bg-gray-50 rounded-lg">
                    <div class="flex items-center gap-2">
                        <img src="${p.image}" class="w-12 h-12 object-cover rounded">
                        <div>
                            <h5 class="text-xs font-bold text-gray-900 line-clamp-1">${p.title}</h5>
                            <span class="text-xs font-black text-gray-900">${(p.price || 0).toLocaleString()} ج.م</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <button onclick="addToCart('${p.id}')" class="btn-amazon-yellow text-xs px-2.5 py-1 rounded font-bold">
                            أضف للعربة
                        </button>
                        <button onclick="toggleWishlist('${p.id}'); toggleWishlistModal();" class="text-gray-400 hover:text-red-500 p-1">
                            <i class="fas fa-trash text-xs"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
    } else {
        modal.classList.add('hidden');
    }
}

// نافذة التفاصيل السريعة (Amazon Buy Box Style)
function openQuickView(productId) {
    const products = getStoredProducts();
    const product = products.find(p => p.id.toString() === productId.toString());
    if (!product) return;

    const modal = document.getElementById('quickViewModal');
    const content = document.getElementById('quickViewContent');
    const isInCart = state.cart.some(item => item.id.toString() === product.id.toString());

    content.innerHTML = `
        <div class="rounded-xl overflow-hidden bg-gray-100 aspect-square border border-gray-200">
            <img src="${product.image || 'https://images.unsplash.com/photo-1608248597359-497669d0d3a9?auto=format&fit=crop&w=700&q=80'}" alt="${escapeHTML(product.title)}" class="w-full h-full object-cover">
        </div>
        <div class="space-y-3">
            <div>
                ${product.badge ? `
                    <span class="${product.badgeColor || 'bestseller-badge'} mb-2 inline-block">
                        ${escapeHTML(product.badge)}
                    </span>
                ` : ''}
                <h2 class="text-lg sm:text-xl font-black text-gray-900 leading-snug">${escapeHTML(product.title)}</h2>
                <div class="flex items-center gap-2 mt-1.5 text-amber-500 text-xs font-bold">
                    <div class="flex items-center text-amber-500 text-[11px]">
                        <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                    </div>
                    <span class="text-gray-900 font-bold">${product.rating || 4.9}</span>
                    <span class="text-gray-400 text-[11px]">(${product.reviewsCount || 48} تقييم مشترين)</span>
                </div>
            </div>

            <p class="text-xs text-gray-600 leading-relaxed">
                ${escapeHTML(product.description || 'منتج أصلي عالي الجودة مضمون 100% مع شحن سريع ومعاينة وفحص كامل قبل الدفع والاستلام.')}
            </p>

            <!-- Price & Delivery Perks -->
            <div class="pt-2 border-t border-gray-100 space-y-1">
                <div class="flex items-baseline gap-2">
                    <span class="text-2xl font-black text-gray-900">${(product.price || 0).toLocaleString()}</span>
                    <span class="text-xs font-bold text-gray-600">جنيه مصري</span>
                    ${product.oldPrice ? `<span class="text-xs text-gray-400 line-through mr-1">${product.oldPrice.toLocaleString()} ج.م</span>` : ''}
                </div>
                <div class="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                    <i class="fas fa-check-circle"></i>
                    <span>متوفر في المخزن - شحن سريع متاح غداً</span>
                </div>
                <div class="text-[11px] text-gray-600 flex items-center gap-1.5">
                    <i class="fas fa-box-open text-amber-600"></i>
                    <span>يحق لك فتح الطرد ومعاينته قبل دفع أي جنيه للمندوب</span>
                </div>
            </div>

            <!-- Amazon Dual Buttons -->
            <div class="space-y-2 pt-2">
                <button 
                    onclick="addToCart('${product.id}'); closeQuickView();" 
                    class="w-full py-2.5 rounded-lg text-xs font-bold btn-amazon-yellow flex items-center justify-center gap-2"
                >
                    <i class="${isInCart ? 'fas fa-check' : 'fas fa-cart-plus'}"></i>
                    <span>${isInCart ? 'إضافة عبوة أخرى للسلة' : 'أضف إلى العربة'}</span>
                </button>
                <button 
                    onclick="closeQuickView(); buyNow('${product.id}');" 
                    class="w-full py-2.5 rounded-lg text-xs font-bold btn-amazon-orange flex items-center justify-center gap-2"
                >
                    <i class="fas fa-bolt"></i>
                    <span>اشتري الآن مباشرة (الدفع عند الاستلام)</span>
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

// فتح نافذة الدفع
function openCheckoutModal() {
    if (state.cart.length === 0) {
        showToast('عربة التسوق فارغة، يرجى إضافة منتج أولاً', 'fas fa-exclamation-circle text-amber-400');
        return;
    }
    const modal = document.getElementById('checkoutModal');
    if (modal) modal.classList.remove('hidden');
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (modal) modal.classList.add('hidden');
}

// تأكيد الطلب وحفظه في Firebase + التحويل للواتساب
async function handleCheckoutSubmit(e) {
    e.preventDefault();

    // فحص مصيدة البوتات (Honeypot)
    const honeypot = document.getElementById('custHoneypot');
    if (honeypot && honeypot.value.trim() !== "") {
        console.warn("Bot detected via honeypot trap.");
        showToast("حدث خطأ أثناء معالجة الطلب، يرجى المحاولة لاحقاً.", "fas fa-shield-alt text-red-500");
        return;
    }

    // فحص حد تكرار إرسال الطلبات (Rate Limiting) لمنع الإغراق
    const lastOrderTs = parseInt(sessionStorage.getItem('makkah_last_order_ts') || '0', 10);
    const now = Date.now();
    if (now - lastOrderTs < 15000) { // 15 ثانية بين كل طلب
        const waitLeft = Math.ceil((15000 - (now - lastOrderTs)) / 1000);
        alert(`تم استلام طلبك مؤخراً. يرجى الانتظار (${waitLeft}) ثانية قبل تأكيد طلب آخر.`);
        return;
    }

    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const city = document.getElementById('custCity').value.trim();
    const address = document.getElementById('custAddress').value.trim();

    if (!name || !phone || !city || !address) {
        alert("يرجى ملء جميع الحقول المطلوبة للمتابعة.");
        return;
    }

    if (phone.length < 9 || phone.length > 25) {
        alert("يرجى إدخال رقم هاتف صحيح (من 9 إلى 25 رقماً).");
        return;
    }

    sessionStorage.setItem('makkah_last_order_ts', now.toString());

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

    // تجهيز رسالة الواتساب
    const itemsLines = state.cart.map((item, idx) => 
        `▫️ ${idx + 1}. *${item.title}* \n   الكمية: (${item.qty}) عبوة | السعر: ${(item.price * item.qty).toLocaleString()} ج.م`
    ).join('\n');

    const waMessage = 
`مرحباً، أريد تأكيد طلب جديد من متجر *كنوز مكة للزيوت الطبيعية* 🌿

📋 *بيانات العميل للشحن:*
👤 الاسم: ${name}
📱 رقم الهاتف: ${phone}
📍 المحافظة / المدينة: ${city}
🏠 العنوان بالتفصيل: ${address}

📦 *المنتجات المطلوبة:*
${itemsLines}

💰 *إجمالي الفاتورة المطلوب سداده عند الاستلام:*
*${finalTotal.toLocaleString()} جنيه مصري* (معاينة مجانية قبل الدفع)

🔖 *رقم الطلب:* #${randomOrderNum}

أرجو تأكيد الشحن وإرسال جدول الاستخدام المناسب لشعري. شكراً لكم!`;

    const waUrl = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;

    closeCheckoutModal();

    // تفريغ السلة بعد الطلب
    state.cart = [];
    saveCart();
    updateCartUI();
    renderProducts();

    // عرض نافذة نجاح الطلب
    const successModal = document.getElementById('orderSuccessModal');
    const orderNumSpan = document.getElementById('orderNumber');
    const waBtn = document.getElementById('whatsappOrderBtn');

    if (orderNumSpan) orderNumSpan.innerText = `#${randomOrderNum}`;
    if (waBtn) waBtn.href = waUrl;
    if (successModal) successModal.classList.remove('hidden');

    // فتح نافذة الواتساب تلقائياً
    setTimeout(() => {
        window.open(waUrl, '_blank');
    }, 600);
}

function closeOrderSuccessModal() {
    const successModal = document.getElementById('orderSuccessModal');
    if (successModal) successModal.classList.add('hidden');
}

// التنبيهات المنبثقة (Toast)
let toastTimer = null;
function showToast(message, iconClass = 'fas fa-check-circle text-amber-400') {
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

// لوحة الإدارة السرية
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

let secretLoginLimiter = {
    failedAttempts: parseInt(sessionStorage.getItem('makkah_front_fails') || '0', 10),
    lockoutUntil: parseInt(sessionStorage.getItem('makkah_front_lockout') || '0', 10)
};

async function handleAdminLogin(e) {
    e.preventDefault();
    const input = document.getElementById('adminPassInput');
    const err = document.getElementById('adminLoginError');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (!input) return;

    // 1. فحص القفل المؤقت ضد هجمات القوة الغاشمة
    const now = Date.now();
    if (now < secretLoginLimiter.lockoutUntil) {
        const remainingSeconds = Math.ceil((secretLoginLimiter.lockoutUntil - now) / 1000);
        if (err) {
            err.innerText = `تم إيقاف المحاولات مؤقتاً لحماية الحساب. يرجى الانتظار (${remainingSeconds}) ثانية.`;
            err.classList.remove('hidden');
        }
        return;
    }

    const enteredPass = input.value.trim();
    if (!enteredPass) return;

    if (enteredPass.length > 64) {
        if (err) {
            err.innerText = "كلمة المرور تتجاوز الحد المسموح (64 حرفاً).";
            err.classList.remove('hidden');
        }
        return;
    }

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
            secretLoginLimiter.failedAttempts = 0;
            secretLoginLimiter.lockoutUntil = 0;
            sessionStorage.removeItem('makkah_front_fails');
            sessionStorage.removeItem('makkah_front_lockout');

            sessionStorage.setItem('makkah_admin_auth', 'authenticated');
            closeAdminLoginModal();
            window.location.href = 'admin.html';
        } else {
            secretLoginLimiter.failedAttempts++;
            sessionStorage.setItem('makkah_front_fails', secretLoginLimiter.failedAttempts);

            if (secretLoginLimiter.failedAttempts >= 5) {
                secretLoginLimiter.lockoutUntil = Date.now() + 60000; // 60 ثانية
                sessionStorage.setItem('makkah_front_lockout', secretLoginLimiter.lockoutUntil);
                secretLoginLimiter.failedAttempts = 0;
                sessionStorage.removeItem('makkah_front_fails');

                if (err) {
                    err.innerText = "تم إيقاف محاولات الدخول لمدة 60 ثانية لحماية لوحة الإدارة من التخمين.";
                    err.classList.remove('hidden');
                }
            } else {
                const remaining = 5 - secretLoginLimiter.failedAttempts;
                if (err) {
                    const msg = (result && result.message) ? result.message : "كلمة المرور غير صحيحة، حاول مجدداً";
                    err.innerText = `${msg} (متبقي ${remaining} محاولات قبل القفل المؤقت)`;
                    err.classList.remove('hidden');
                }
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
