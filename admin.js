// =================================================================
// لوحة التحكم والإدارة (Admin Dashboard) | متجر كنوز مكة
// مربوطة مباشرة بقاعدة بيانات Firebase Realtime Database
// معززة بأنظمة الحماية ومكافحة التخمين و XSS
// =================================================================

const STORE_WHATSAPP_NUMBER = "201500689251";

// دالة التعقيم الأمني لمنع ثغرات XSS وحقن الأكواد الخبيثة
function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// حالة الأدمن
let adminState = {
    currentTab: 'products',
    products: JSON.parse(localStorage.getItem('makkah_real_products') || '[]'),
    orders: JSON.parse(localStorage.getItem('makkah_orders') || '[]'),
    announcements: JSON.parse(localStorage.getItem('makkah_announcements') || '[]'),
    tempUploadedImageData: ''
};

// أسماء التصنيفات الشاملة لجميع المنتجات
const CATEGORY_NAMES = {
    'fashion': 'أزياء وملابس (تيشيرتات، بنطلونات، شورتات)',
    'shoes': 'أحذية وكوتشيات رياضية',
    'sports': 'مكملات غذائية وكمال أجسام وكرياتين',
    'electronics': 'إلكترونيات وموبايلات وإكسسوارات',
    'beauty': 'عناية شخصية وعطور وتجميل',
    'home': 'مستلزمات المنزل والمطبخ',
    'deals': 'صفقات وعروض التوفير',
    'general': 'منتجات وبضائع عامة',
    'perfumes': 'العطور والبخور والعود',
    'skincare': 'العناية بالبشرة والشعر',
    'natural': 'منتجات طبيعية وصحية',
    'bundles': 'الباقات وعروض التوفير',
    'hair-loss': 'منتجات عامة'
};

// بدء التشغيل والربط بـ Firebase
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    updateDashboardStats();
    renderAdminProducts();
    renderAdminOrders();
    renderAdminAnnouncements();

    // الاستماع المباشر للمنتجات من Firebase
    if (typeof subscribeToProducts === 'function') {
        subscribeToProducts(
            (liveProducts) => {
                adminState.products = liveProducts;
                renderAdminProducts();
                updateDashboardStats();
                setFirebaseBadgeStatus(true);
            },
            (error) => {
                console.warn("Firebase products subscription fallback to local:", error);
                setFirebaseBadgeStatus(false, "تحذير: يلزم تفعيل قواعد القراءة والكتابة في Firebase");
            }
        );
    }

    // الاستماع المباشر للطلبات من Firebase
    if (typeof subscribeToOrders === 'function') {
        subscribeToOrders(
            (liveOrders) => {
                adminState.orders = liveOrders;
                renderAdminOrders();
                updateDashboardStats();
            },
            (error) => {
                console.warn("Firebase orders subscription fallback to local:", error);
            }
        );
    }

    // الاستماع المباشر للإعلانات والعروض الترويجية من Firebase
    if (typeof subscribeToAnnouncements === 'function') {
        subscribeToAnnouncements(
            (liveAnnouncements) => {
                adminState.announcements = liveAnnouncements;
                renderAdminAnnouncements();
                updateTabBadges();
            },
            (error) => {
                console.warn("Firebase announcements subscription fallback to local:", error);
            }
        );
    }
});

function setFirebaseBadgeStatus(isConnected, message = "") {
    const badge = document.getElementById('firebaseStatusBadge');
    if (!badge) return;
    if (isConnected) {
        badge.className = "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5";
        badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span><span>قاعدة بيانات Firebase متصلة بنجاح 🟢</span>`;
    } else {
        badge.className = "bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer";
        badge.title = message;
        badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400"></span><span>تنبيه قواعد Firebase (اضغط للمساعدة)</span>`;
        badge.onclick = () => {
            alert("تنبيه مهم لقاعدة بيانات Firebase:\nيرجى التأكد من ضبط قواعد Realtime Database في كونسول Firebase إلى:\n{\n  \"rules\": {\n    \".read\": true,\n    \".write\": true\n  }\n}\nحتى يتمكن المتجر من القراءة والكتابة دون قيود صلاحيات.");
        };
    }
}

// التبديل بين التبويبات
function switchAdminTab(tab) {
    adminState.currentTab = tab;
    const secProducts = document.getElementById('sectionProducts');
    const secOrders = document.getElementById('sectionOrders');
    const secAnnouncements = document.getElementById('sectionAnnouncements');
    const btnProducts = document.getElementById('tabBtnProducts');
    const btnOrders = document.getElementById('tabBtnOrders');
    const btnAnnouncements = document.getElementById('tabBtnAnnouncements');
    const productsActionsBar = document.getElementById('productsActionsBar');
    const announcementsActionsBar = document.getElementById('announcementsActionsBar');

    const activeClasses = "px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all bg-white text-emerald-800 shadow-sm flex items-center gap-2";
    const inactiveClasses = "px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all text-gray-600 hover:text-gray-900 flex items-center gap-2";

    // إخفاء كافة الأقسام افتراضياً
    if (secProducts) secProducts.classList.add('hidden');
    if (secOrders) secOrders.classList.add('hidden');
    if (secAnnouncements) secAnnouncements.classList.add('hidden');

    if (btnProducts) btnProducts.className = inactiveClasses;
    if (btnOrders) btnOrders.className = inactiveClasses;
    if (btnAnnouncements) btnAnnouncements.className = inactiveClasses;

    if (productsActionsBar) productsActionsBar.classList.add('hidden');
    if (announcementsActionsBar) announcementsActionsBar.classList.add('hidden');

    if (tab === 'products') {
        if (secProducts) secProducts.classList.remove('hidden');
        if (btnProducts) btnProducts.className = activeClasses;
        if (productsActionsBar) productsActionsBar.classList.remove('hidden');
    } else if (tab === 'orders') {
        if (secOrders) secOrders.classList.remove('hidden');
        if (btnOrders) btnOrders.className = activeClasses;
    } else if (tab === 'announcements') {
        if (secAnnouncements) secAnnouncements.classList.remove('hidden');
        if (btnAnnouncements) btnAnnouncements.className = activeClasses;
        if (announcementsActionsBar) announcementsActionsBar.classList.remove('hidden');
    }
}

// تحديث كروت الإحصائيات
function updateDashboardStats() {
    const totalProductsEl = document.getElementById('statTotalProducts');
    const totalOrdersEl = document.getElementById('statTotalOrders');
    const totalRevenueEl = document.getElementById('statTotalRevenue');
    const statWhatsappNum = document.getElementById('statWhatsappNum');

    const totalProducts = (adminState.products || []).length;
    const totalOrders = (adminState.orders || []).length;
    const totalRevenue = (adminState.orders || []).reduce((sum, order) => sum + (order.total || 0), 0);

    if (totalProductsEl) totalProductsEl.innerText = totalProducts;
    if (totalOrdersEl) totalOrdersEl.innerText = totalOrders;
    if (totalRevenueEl) totalRevenueEl.innerText = `${totalRevenue.toLocaleString()} ج.م`;
    if (statWhatsappNum) statWhatsappNum.innerText = "01500689251";

    updateTabBadges();
}

function updateTabBadges() {
    const pBadge = document.getElementById('tabBadgeProducts');
    const oBadge = document.getElementById('tabBadgeOrders');
    const aBadge = document.getElementById('tabBadgeAnnouncements');
    if (pBadge) pBadge.innerText = (adminState.products || []).length;
    if (oBadge) oBadge.innerText = (adminState.orders || []).length;
    if (aBadge) {
        const activeCount = (adminState.announcements || []).filter(a => a.active !== false).length;
        aBadge.innerText = activeCount;
        if (activeCount > 0) {
            aBadge.className = "bg-amber-100 text-amber-800 text-[11px] px-2 py-0.5 rounded-full font-bold";
        } else {
            aBadge.className = "bg-gray-300 text-gray-700 text-[11px] px-2 py-0.5 rounded-full font-bold";
        }
    }
}

// ==========================================
// إدارة المنتجات في Firebase (Products CRUD)
// ==========================================

function renderAdminProducts(searchQuery = '') {
    const tbody = document.getElementById('adminProductsTableBody');
    const emptyView = document.getElementById('adminEmptyProducts');
    const countEl = document.getElementById('filteredProductsCount');

    let filtered = adminState.products;
    if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(p => 
            p.title.toLowerCase().includes(q) || 
            (CATEGORY_NAMES[p.category] && CATEGORY_NAMES[p.category].toLowerCase().includes(q)) ||
            (p.price && p.price.toString().includes(q))
        );
    }

    if (countEl) countEl.innerText = filtered.length;

    if (adminState.products.length === 0) {
        tbody.innerHTML = '';
        emptyView.classList.remove('hidden');
        return;
    }

    emptyView.classList.add('hidden');

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-10 text-gray-400 text-xs font-semibold">
                    لا توجد منتجات تطابق البحث الحالي
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map(product => {
        const catName = CATEGORY_NAMES[product.category] || product.category;
        const fallbackImg = 'https://images.unsplash.com/photo-1608248597359-497669d0d3a9?auto=format&fit=crop&w=300&q=80';
        const imgSrc = product.image || fallbackImg;
        const cleanTitle = escapeHTML(product.title);
        const cleanDesc = escapeHTML(product.description || '');
        const cleanBadge = escapeHTML(product.badge || '');
        const cleanCat = escapeHTML(catName);

        return `
            <tr class="hover:bg-gray-50/80 transition-colors">
                <td class="p-4">
                    <img src="${escapeHTML(imgSrc)}" alt="${cleanTitle}" class="w-14 h-14 rounded-xl object-cover bg-gray-100 border border-gray-200">
                </td>
                <td class="p-4">
                    <h4 class="font-bold text-gray-900 text-sm max-w-xs">${cleanTitle}</h4>
                    <p class="text-xs text-gray-400 line-clamp-1 mt-0.5">${cleanDesc}</p>
                </td>
                <td class="p-4">
                    <span class="inline-block bg-emerald-50 text-emerald-800 text-xs px-2.5 py-1 rounded-lg font-bold border border-emerald-100">
                        ${cleanCat}
                    </span>
                </td>
                <td class="p-4 font-black text-emerald-700 text-sm">
                    ${(product.price || 0).toLocaleString()} ج.م
                </td>
                <td class="p-4 text-xs text-gray-400 line-through">
                    ${product.oldPrice ? `${product.oldPrice.toLocaleString()} ج.م` : '—'}
                </td>
                <td class="p-4">
                    ${cleanBadge ? `
                        <span class="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            ${cleanBadge}
                        </span>
                    ` : '<span class="text-gray-300 text-xs">—</span>'}
                </td>
                <td class="p-4 text-center">
                    <div class="flex items-center justify-center gap-2">
                        <button onclick="openProductModal('${product.id}')" class="p-2 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors text-xs font-bold" title="تعديل المنتج">
                            <i class="fas fa-edit"></i> تعديل
                        </button>
                        <button onclick="deleteProduct('${product.id}')" class="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors text-xs font-bold" title="حذف المنتج">
                            <i class="fas fa-trash-alt"></i> حذف
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// فتح نافذة الإضافة أو التعديل
function openProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    const modalTitle = document.getElementById('modalTitle');
    const editIdInput = document.getElementById('editProductId');
    const previewContainer = document.getElementById('imagePreviewContainer');
    const previewImg = document.getElementById('imagePreviewImg');

    form.reset();
    adminState.tempUploadedImageData = '';
    previewContainer.classList.add('hidden');

    if (productId) {
        modalTitle.innerText = "تعديل المنتج في Firebase";
        const product = adminState.products.find(p => p.id.toString() === productId.toString());
        if (product) {
            editIdInput.value = product.id;
            document.getElementById('productTitle').value = product.title;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productBadge').value = product.badge || '';
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productOldPrice').value = product.oldPrice || '';
            document.getElementById('productImageUrl').value = product.image || '';
            document.getElementById('productDescription').value = product.description || '';

            if (product.image) {
                previewImg.src = product.image;
                previewContainer.classList.remove('hidden');
                adminState.tempUploadedImageData = product.image;
            }
        }
    } else {
        modalTitle.innerText = "إضافة منتج حقيقي جديد إلى Firebase";
        editIdInput.value = '';
    }

    modal.classList.remove('hidden');
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) modal.classList.add('hidden');
}

// قراءة ملف الصورة محلياً وتحويله إلى Base64
function handleImageFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // فحص حجم الملف (يفضل أقل من 1 ميجابايت)
    if (file.size > 2 * 1024 * 1024) {
        alert("يرجى اختيار صورة بحجم أقل من 2 ميجابايت لضمان سرعة الرفع والعرض.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        adminState.tempUploadedImageData = event.target.result;
        const previewContainer = document.getElementById('imagePreviewContainer');
        const previewImg = document.getElementById('imagePreviewImg');
        previewImg.src = adminState.tempUploadedImageData;
        previewContainer.classList.remove('hidden');
        document.getElementById('productImageUrl').value = '';
    };
    reader.readAsDataURL(file);
}

function updateImagePreview(url) {
    const previewContainer = document.getElementById('imagePreviewContainer');
    const previewImg = document.getElementById('imagePreviewImg');
    if (url.trim()) {
        previewImg.src = url.trim();
        previewContainer.classList.remove('hidden');
        adminState.tempUploadedImageData = url.trim();
    } else {
        previewContainer.classList.add('hidden');
    }
}

// حفظ المنتج في قاعدة بيانات Firebase
async function handleProductFormSubmit(e) {
    e.preventDefault();
    const editId = document.getElementById('editProductId').value;
    const title = document.getElementById('productTitle').value.trim();
    const category = document.getElementById('productCategory').value;
    const badge = document.getElementById('productBadge').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value) || 0;
    const oldPriceVal = document.getElementById('productOldPrice').value;
    const oldPrice = oldPriceVal ? parseFloat(oldPriceVal) : null;
    const urlInput = document.getElementById('productImageUrl').value.trim();
    const description = document.getElementById('productDescription').value.trim();

    const imageFinal = adminState.tempUploadedImageData || urlInput || 'https://images.unsplash.com/photo-1608248597359-497669d0d3a9?auto=format&fit=crop&w=700&q=80';

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin ml-1"></i> جاري الحفظ في Firebase...';

    const productPayload = {
        id: editId ? editId : Date.now().toString(),
        title,
        category,
        badge: badge || 'طبيعي 100%',
        badgeColor: badge ? 'bg-emerald-700' : '',
        price,
        oldPrice,
        rating: 5.0,
        reviewsCount: 1,
        image: imageFinal,
        description,
        updatedAt: new Date().toISOString()
    };

    try {
        if (typeof saveProductToFirebase === 'function') {
            await saveProductToFirebase(productPayload);
        }

        // حفظ وتحديث فوري للمنتجات والإحصائيات
        const idx = adminState.products.findIndex(p => p.id.toString() === productPayload.id.toString());
        if (idx > -1) adminState.products[idx] = productPayload;
        else adminState.products.unshift(productPayload);
        localStorage.setItem('makkah_real_products', JSON.stringify(adminState.products));
        renderAdminProducts();
        updateDashboardStats();

        closeProductModal();
        alert('تم حفظ وتحديث المنتج بنجاح في قاعدة بيانات Firebase والمتجر ✓');
    } catch (err) {
        console.error("Save product error:", err);
        // حفظ محلي لضمان عدم ضياع عمل المستخدم
        const idx = adminState.products.findIndex(p => p.id.toString() === productPayload.id.toString());
        if (idx > -1) adminState.products[idx] = productPayload;
        else adminState.products.unshift(productPayload);
        localStorage.setItem('makkah_real_products', JSON.stringify(adminState.products));
        renderAdminProducts();
        updateDashboardStats();
        closeProductModal();
        alert('تم حفظ المنتج محلياً، وحدث تنبيه من Firebase: ' + err.message + '\nيرجى التأكد من ضبط قواعد Realtime Database إلى true للقراءة والكتابة.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}

// حذف منتج من Firebase
async function deleteProduct(productId) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج نهائياً من قاعدة بيانات Firebase؟')) return;

    try {
        if (typeof deleteProductFromFirebase === 'function') {
            await deleteProductFromFirebase(productId);
        }
        adminState.products = adminState.products.filter(p => p.id.toString() !== productId.toString());
        localStorage.setItem('makkah_real_products', JSON.stringify(adminState.products));
        renderAdminProducts();
        updateDashboardStats();
    } catch (err) {
        console.error("Delete product error:", err);
        alert('حدث خطأ أثناء الحذف من Firebase: ' + err.message);
    }
}

// ==========================================
// إدارة الطلبات في Firebase (Orders Management)
// ==========================================

function renderAdminOrders() {
    const tbody = document.getElementById('adminOrdersTableBody');
    const emptyView = document.getElementById('adminEmptyOrders');

    if (adminState.orders.length === 0) {
        tbody.innerHTML = '';
        emptyView.classList.remove('hidden');
        return;
    }

    emptyView.classList.add('hidden');

    tbody.innerHTML = adminState.orders.map(order => {
        const customerPhoneDigits = (order.phone || '').replace(/[^0-9]/g, '');
        const itemsSummary = (order.items || []).map(i => `• ${escapeHTML(i.title)} (${parseInt(i.qty, 10) || 1} عبوة)`).join('<br>');
        const orderKey = order.firebaseKey || order.id;
        const cleanName = escapeHTML(order.name || '');
        const cleanPhone = escapeHTML(order.phone || '');
        const cleanCity = escapeHTML(order.city || '');
        const cleanAddress = escapeHTML(order.address || '');
        const cleanDate = escapeHTML(order.date || 'اليوم');
        const cleanOrderNumber = escapeHTML(order.orderNumber || order.id);

        return `
            <tr class="hover:bg-gray-50/80 transition-colors">
                <td class="p-4 font-mono font-bold text-emerald-700">
                    #${cleanOrderNumber}
                </td>
                <td class="p-4 text-xs text-gray-500 whitespace-nowrap">
                    ${cleanDate}
                </td>
                <td class="p-4">
                    <p class="font-bold text-gray-900 text-sm">${cleanName}</p>
                    <a href="tel:${encodeURIComponent(order.phone || '')}" class="text-xs text-blue-600 font-mono hover:underline inline-flex items-center gap-1 mt-0.5">
                        <i class="fas fa-phone text-[10px]"></i> ${cleanPhone}
                    </a>
                </td>
                <td class="p-4 text-xs text-gray-600 max-w-xs">
                    <span class="font-bold text-gray-800">${cleanCity}</span><br>
                    <span>${cleanAddress}</span>
                </td>
                <td class="p-4 text-xs text-gray-700 leading-relaxed max-w-sm">
                    ${itemsSummary || '—'}
                </td>
                <td class="p-4 font-black text-emerald-700 text-sm whitespace-nowrap">
                    ${(order.total || 0).toLocaleString()} ج.م
                </td>
                <td class="p-4">
                    <select onchange="updateOrderStatus('${escapeHTML(orderKey)}', this.value)" class="bg-gray-50 border border-gray-200 text-xs font-bold rounded-lg p-1.5 focus:outline-none">
                        <option value="جديد" ${order.status === 'جديد' ? 'selected' : ''}>جديد 🟡</option>
                        <option value="تم التأكيد" ${order.status === 'تم التأكيد' ? 'selected' : ''}>تم التأكيد 🟢</option>
                        <option value="تم الشحن" ${order.status === 'تم الشحن' ? 'selected' : ''}>تم الشحن 🚚</option>
                        <option value="مكتمل" ${order.status === 'مكتمل' ? 'selected' : ''}>مكتمل ✓</option>
                    </select>
                </td>
                <td class="p-4 text-center whitespace-nowrap">
                    <div class="flex items-center justify-center gap-2">
                        <a 
                            href="https://wa.me/${customerPhoneDigits.startsWith('2') ? customerPhoneDigits : '2' + customerPhoneDigits}?text=${encodeURIComponent(`السلام عليكم أستاذ ${order.name || ''}، بخصوص طلبك من كنوز مكة رقم #${order.orderNumber || ''}`)}" 
                            target="_blank" 
                            class="px-2.5 py-1.5 rounded-xl bg-green-100 hover:bg-green-200 text-green-800 text-xs font-bold transition-colors inline-flex items-center gap-1"
                            title="محادثة العميل عبر الواتساب"
                        >
                            <i class="fab fa-whatsapp"></i> واتساب
                        </a>
                        <button onclick="deleteOrder('${escapeHTML(orderKey)}')" class="p-1.5 rounded-lg text-gray-400 hover:text-red-500 transition-colors" title="حذف الطلب">
                            <i class="fas fa-trash-alt text-xs"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

async function updateOrderStatus(orderKey, status) {
    try {
        if (typeof updateOrderStatusInFirebase === 'function') {
            await updateOrderStatusInFirebase(orderKey, status);
        }
        const order = adminState.orders.find(o => (o.firebaseKey || o.id).toString() === orderKey.toString());
        if (order) {
            order.status = status;
            localStorage.setItem('makkah_orders', JSON.stringify(adminState.orders));
        }
    } catch(err) {
        console.error("Update order status error:", err);
    }
}

async function deleteOrder(orderKey) {
    if (!confirm('هل تريد حذف هذا الطلب من قاعدة البيانات؟')) return;
    try {
        if (typeof deleteOrderFromFirebase === 'function') {
            await deleteOrderFromFirebase(orderKey);
        }
        adminState.orders = adminState.orders.filter(o => (o.firebaseKey || o.id).toString() !== orderKey.toString());
        localStorage.setItem('makkah_orders', JSON.stringify(adminState.orders));
        updateDashboardStats();
        renderAdminOrders();
    } catch(err) {
        console.error("Delete order error:", err);
    }
}

// ==========================================
// Admin Password & Authentication Protection (مع نظام كبح القوة الغاشمة)
// ==========================================
let directLoginLimiter = {
    failedAttempts: parseInt(sessionStorage.getItem('makkah_admin_fails') || '0', 10),
    lockoutUntil: parseInt(sessionStorage.getItem('makkah_admin_lockout') || '0', 10)
};

function checkAdminAuth() {
    const overlay = document.getElementById('adminAuthLockOverlay');
    const isAuth = sessionStorage.getItem('makkah_admin_auth') === 'authenticated';
    if (!overlay) return;

    if (!isAuth) {
        overlay.classList.remove('hidden');
        const input = document.getElementById('directAdminPassInput');
        if (input) setTimeout(() => input.focus(), 200);
    } else {
        overlay.classList.add('hidden');
    }
}

async function handleDirectAdminLogin(e) {
    e.preventDefault();
    const input = document.getElementById('directAdminPassInput');
    const err = document.getElementById('directLoginError');
    const overlay = document.getElementById('adminAuthLockOverlay');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (!input) return;

    // 1. فحص القفل المؤقت ضد هجمات القوة الغاشمة (Brute-force protection)
    const now = Date.now();
    if (now < directLoginLimiter.lockoutUntil) {
        const remainingSeconds = Math.ceil((directLoginLimiter.lockoutUntil - now) / 1000);
        if (err) {
            err.innerText = `تم قفل محاولات الدخول مؤقتاً لحماية اللوحة من التخمين. انتظر (${remainingSeconds}) ثانية.`;
            err.classList.remove('hidden');
        }
        return;
    }

    const enteredPass = input.value.trim();
    if (!enteredPass) return;

    // 2. فحص أقصى طول لكلمة المرور لمنع هجمات Buffer Flooding
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
            // تصفير عداد المحاولات الفاشلة عند النجاح
            directLoginLimiter.failedAttempts = 0;
            directLoginLimiter.lockoutUntil = 0;
            sessionStorage.removeItem('makkah_admin_fails');
            sessionStorage.removeItem('makkah_admin_lockout');

            sessionStorage.setItem('makkah_admin_auth', 'authenticated');
            if (overlay) overlay.classList.add('hidden');
        } else {
            directLoginLimiter.failedAttempts++;
            sessionStorage.setItem('makkah_admin_fails', directLoginLimiter.failedAttempts);

            if (directLoginLimiter.failedAttempts >= 5) {
                // قفل لمدة 60 ثانية بعد 5 محاولات خاطئة
                directLoginLimiter.lockoutUntil = Date.now() + 60000;
                sessionStorage.setItem('makkah_admin_lockout', directLoginLimiter.lockoutUntil);
                directLoginLimiter.failedAttempts = 0;
                sessionStorage.removeItem('makkah_admin_fails');

                if (err) {
                    err.innerText = "تم إيقاف محاولات الدخول لمدة 60 ثانية لحماية حسابك من محاولات التخمين.";
                    err.classList.remove('hidden');
                }
            } else {
                const left = 5 - directLoginLimiter.failedAttempts;
                if (err) {
                    const msg = (result && result.message) ? result.message : "كلمة المرور غير صحيحة";
                    err.innerText = `${msg} (متبقي ${left} محاولات قبل القفل المؤقت)`;
                    err.classList.remove('hidden');
                }
            }
            input.classList.add('border-red-500');
            input.select();
        }
    } catch (error) {
        console.error("Direct login verification error:", error);
        if (err) {
            err.innerText = "حدث خطأ أثناء الاتصال بقاعدة البيانات";
            err.classList.remove('hidden');
        }
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
        }
    }
}

function handleAdminLogout() {
    if (confirm('هل تريد تسجيل الخروج وقفل لوحة الإدارة؟')) {
        sessionStorage.removeItem('makkah_admin_auth');
        if (typeof firebase !== 'undefined' && firebase.auth) {
            try { firebase.auth().signOut(); } catch(e) {}
        }
        window.location.href = 'index.html';
    }
}

// =================================================================
// إدارة شريط الإعلانات والخصومات (Announcements CRUD)
// =================================================================

const THEME_LABELS = {
    'emerald': { name: 'أخضر زمردي فاخر', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    'amber': { name: 'ذهبي ترويجي دافئ', bg: 'bg-amber-100 text-amber-800 border-amber-200' },
    'rose': { name: 'أحمر خصومات نارية', bg: 'bg-rose-100 text-rose-800 border-rose-200' },
    'indigo': { name: 'كحلي ملكي فخم', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' }
};

function renderAdminAnnouncements() {
    const tbody = document.getElementById('adminAnnouncementsTableBody');
    const emptyView = document.getElementById('adminEmptyAnnouncements');
    if (!tbody) return;

    const list = adminState.announcements || [];
    if (list.length === 0) {
        tbody.innerHTML = '';
        if (emptyView) emptyView.classList.remove('hidden');
        return;
    }

    if (emptyView) emptyView.classList.add('hidden');

    tbody.innerHTML = list.map(ann => {
        const isActive = ann.active !== false;
        const themeInfo = THEME_LABELS[ann.theme] || THEME_LABELS['emerald'];
        const dateStr = ann.createdAt ? new Date(ann.createdAt).toLocaleDateString('ar-EG') : 'الآن';

        const cleanText = escapeHTML(ann.text || '');
        const cleanBtnText = escapeHTML(ann.btnText || '');
        const cleanBtnLink = escapeHTML(ann.btnLink || '#');

        return `
            <tr class="hover:bg-gray-50/80 transition-colors">
                <td class="p-4">
                    <button onclick="toggleAnnouncementActive('${escapeHTML(ann.id)}', ${isActive})" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${isActive ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}">
                        <span class="w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}"></span>
                        <span>${isActive ? 'نشط في المتجر 🟢' : 'معطّل مؤقتاً ⏸️'}</span>
                    </button>
                </td>
                <td class="p-4">
                    <p class="font-bold text-gray-900 text-sm max-w-sm line-clamp-2">${cleanText}</p>
                </td>
                <td class="p-4">
                    <span class="inline-block text-xs px-2.5 py-1 rounded-lg font-bold border ${themeInfo.bg}">
                        ${themeInfo.name}
                    </span>
                </td>
                <td class="p-4 text-xs font-semibold text-gray-600">
                    ${cleanBtnText ? `${cleanBtnText} (${cleanBtnLink})` : '<span class="text-gray-300">—</span>'}
                </td>
                <td class="p-4 text-xs text-gray-400 font-mono">
                    ${dateStr}
                </td>
                <td class="p-4 text-center">
                    <div class="flex items-center justify-center gap-2">
                        <button onclick="openAnnouncementModal('${escapeHTML(ann.id)}')" title="تعديل الإعلان" class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center transition-colors">
                            <i class="fas fa-edit text-xs"></i>
                        </button>
                        <button onclick="deleteAnnouncement('${escapeHTML(ann.id)}')" title="حذف الإعلان" class="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors">
                            <i class="fas fa-trash-alt text-xs"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function openAnnouncementModal(id = null) {
    const modal = document.getElementById('announcementModal');
    const titleEl = document.getElementById('announcementModalTitle');
    const form = document.getElementById('announcementForm');
    const editIdInput = document.getElementById('editAnnouncementId');
    const textInput = document.getElementById('announcementText');
    const btnTextInput = document.getElementById('announcementBtnText');
    const btnLinkInput = document.getElementById('announcementBtnLink');
    const themeSelect = document.getElementById('announcementTheme');
    const activeCheck = document.getElementById('announcementActive');

    if (form) form.reset();
    if (editIdInput) editIdInput.value = '';

    if (id) {
        const item = (adminState.announcements || []).find(a => a.id.toString() === id.toString());
        if (item) {
            if (titleEl) titleEl.innerText = "تعديل الإعلان أو الخصم الترويجي";
            if (editIdInput) editIdInput.value = item.id;
            if (textInput) textInput.value = item.text || '';
            if (btnTextInput) btnTextInput.value = item.btnText || '';
            if (btnLinkInput) btnLinkInput.value = item.btnLink || '';
            if (themeSelect) themeSelect.value = item.theme || 'emerald';
            if (activeCheck) activeCheck.checked = item.active !== false;
        }
    } else {
        if (titleEl) titleEl.innerText = "إضافة إعلان أو عرض ترويجي جديد";
        if (editIdInput) editIdInput.value = '';
        if (activeCheck) activeCheck.checked = true;
        if (themeSelect) themeSelect.value = 'emerald';
    }

    updateAnnouncementPreview();
    if (modal) modal.classList.remove('hidden');
}

function closeAnnouncementModal() {
    const modal = document.getElementById('announcementModal');
    if (modal) modal.classList.add('hidden');
}

function updateAnnouncementPreview() {
    const textInput = document.getElementById('announcementText');
    const btnTextInput = document.getElementById('announcementBtnText');
    const themeSelect = document.getElementById('announcementTheme');

    const text = (textInput && textInput.value.trim()) || 'خصم خاص 20% على جميع كورسات علاج التساقط وإنبات الفراغات لفترة محدودة!';
    const btnText = btnTextInput ? btnTextInput.value.trim() : '';
    const theme = themeSelect ? themeSelect.value : 'emerald';

    const previewBox = document.getElementById('announcementLivePreview');
    const textEl = document.getElementById('previewTextContent');
    const btnEl = document.getElementById('previewBtnBadge');

    if (!previewBox) return;

    const themeClasses = {
        'emerald': 'bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 text-white',
        'amber': 'bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 text-white',
        'rose': 'bg-gradient-to-r from-rose-700 via-red-600 to-rose-800 text-white',
        'indigo': 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white'
    };

    previewBox.className = `p-3 rounded-xl ${themeClasses[theme] || themeClasses['emerald']} text-xs font-medium text-center shadow-inner flex flex-wrap items-center justify-center gap-2 transition-all`;

    if (textEl) textEl.innerText = text;

    if (btnEl) {
        if (btnText) {
            btnEl.innerText = btnText;
            btnEl.classList.remove('hidden');
        } else {
            btnEl.classList.add('hidden');
        }
    }
}

async function handleAnnouncementFormSubmit(e) {
    e.preventDefault();
    const editId = document.getElementById('editAnnouncementId').value;
    const text = document.getElementById('announcementText').value.trim();
    const btnText = document.getElementById('announcementBtnText').value.trim();
    const btnLink = document.getElementById('announcementBtnLink').value.trim();
    const theme = document.getElementById('announcementTheme').value;
    const active = document.getElementById('announcementActive').checked;

    if (!text) {
        alert("يرجى كتابة نص الإعلان أو العرض");
        return;
    }

    const existingAnn = (adminState.announcements || []).find(a => a.id.toString() === (editId || '').toString());
    const payload = {
        id: editId ? editId.toString() : Date.now().toString(),
        text: text,
        btnText: btnText,
        btnLink: btnLink || '#products',
        theme: theme,
        active: active,
        createdAt: (existingAnn && existingAnn.createdAt) ? existingAnn.createdAt : Date.now(),
        updatedAt: Date.now()
    };

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtn = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin ml-1"></i> جاري الحفظ في Firebase...';
    }

    try {
        if (typeof saveAnnouncementToFirebase === 'function') {
            await saveAnnouncementToFirebase(payload);
        }

        // تحديث محلي فوري لضمان ظهور الإعلان مباشرة دون انتظار
        let list = adminState.announcements || [];
        const idx = list.findIndex(a => a.id.toString() === payload.id.toString());
        if (idx > -1) list[idx] = { ...list[idx], ...payload };
        else list.unshift(payload);
        adminState.announcements = list;
        localStorage.setItem('makkah_announcements', JSON.stringify(list));
        renderAdminAnnouncements();
        updateTabBadges();

        closeAnnouncementModal();
        alert('تم حفظ ونشر الإعلان بنجاح في قاعدة بيانات Firebase والمتجر ✓');
    } catch (err) {
        console.error("Save announcement error:", err);
        // حفظ محلي احتياطي
        let list = adminState.announcements || [];
        const idx = list.findIndex(a => a.id.toString() === payload.id.toString());
        if (idx > -1) list[idx] = { ...list[idx], ...payload };
        else list.unshift(payload);
        adminState.announcements = list;
        localStorage.setItem('makkah_announcements', JSON.stringify(list));
        renderAdminAnnouncements();
        updateTabBadges();
        closeAnnouncementModal();
        alert('تم حفظ الإعلان محلياً، وحدث تنبيه من Firebase: ' + err.message + '\nيرجى التأكد من ضبط قواعد Realtime Database إلى true للقراءة والكتابة.');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtn;
        }
    }
}

async function toggleAnnouncementActive(id, currentActive) {
    try {
        const newStatus = !currentActive;
        if (typeof toggleAnnouncementInFirebase === 'function') {
            await toggleAnnouncementInFirebase(id, newStatus);
        } else {
            let list = adminState.announcements || [];
            const item = list.find(a => a.id.toString() === id.toString());
            if (item) item.active = newStatus;
            adminState.announcements = list;
            localStorage.setItem('makkah_announcements', JSON.stringify(list));
            renderAdminAnnouncements();
            updateTabBadges();
        }
    } catch (err) {
        console.error("Toggle active error:", err);
        alert("حدث خطأ أثناء تغيير حالة الإعلان");
    }
}

async function deleteAnnouncement(id) {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان نهائياً من المتجر؟')) return;

    try {
        if (typeof deleteAnnouncementFromFirebase === 'function') {
            await deleteAnnouncementFromFirebase(id);
        } else {
            let list = adminState.announcements || [];
            list = list.filter(a => a.id.toString() !== id.toString());
            adminState.announcements = list;
            localStorage.setItem('makkah_announcements', JSON.stringify(list));
            renderAdminAnnouncements();
            updateTabBadges();
        }
    } catch (err) {
        console.error("Delete announcement error:", err);
        alert("حدث خطأ أثناء حذف الإعلان");
    }
}
