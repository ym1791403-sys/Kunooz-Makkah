// =================================================================
// لوحة التحكم والإدارة (Admin Dashboard) | متجر كنوز مكة
// مربوطة مباشرة بقاعدة بيانات Firebase Realtime Database
// =================================================================

const STORE_WHATSAPP_NUMBER = "201080369841";

// حالة الأدمن
let adminState = {
    currentTab: 'products',
    products: JSON.parse(localStorage.getItem('makkah_real_products') || '[]'),
    orders: JSON.parse(localStorage.getItem('makkah_orders') || '[]'),
    tempUploadedImageData: ''
};

// أسماء التصنيفات
const CATEGORY_NAMES = {
    'hair-loss': 'التساقط وإنبات الفراغات',
    'frizz-repair': 'علاج الهيشان والتقصف',
    'growth-length': 'التطويل وتكثيف الشعر',
    'dandruff-scalp': 'علاج القشرة وحكة الفروة',
    'bundles': 'الكورسات وعروض التوفير'
};

// بدء التشغيل والربط بـ Firebase
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    updateDashboardStats();
    renderAdminProducts();
    renderAdminOrders();

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
    const btnProducts = document.getElementById('tabBtnProducts');
    const btnOrders = document.getElementById('tabBtnOrders');
    const productsActionsBar = document.getElementById('productsActionsBar');

    if (tab === 'products') {
        secProducts.classList.remove('hidden');
        secOrders.classList.add('hidden');
        btnProducts.className = "px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all bg-white text-emerald-800 shadow-sm flex items-center gap-2";
        btnOrders.className = "px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all text-gray-600 hover:text-gray-900 flex items-center gap-2";
        productsActionsBar.classList.remove('hidden');
    } else {
        secProducts.classList.add('hidden');
        secOrders.classList.remove('hidden');
        btnOrders.className = "px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all bg-white text-emerald-800 shadow-sm flex items-center gap-2";
        btnProducts.className = "px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all text-gray-600 hover:text-gray-900 flex items-center gap-2";
        productsActionsBar.classList.add('hidden');
    }
}

// تحديث كروت الإحصائيات
function updateDashboardStats() {
    const totalProductsEl = document.getElementById('statTotalProducts');
    const totalOrdersEl = document.getElementById('statTotalOrders');
    const totalRevenueEl = document.getElementById('statTotalRevenue');
    const statWhatsappNum = document.getElementById('statWhatsappNum');

    const totalProducts = adminState.products.length;
    const totalOrders = adminState.orders.length;
    const totalRevenue = adminState.orders.reduce((sum, order) => sum + (order.total || 0), 0);

    if (totalProductsEl) totalProductsEl.innerText = totalProducts;
    if (totalOrdersEl) totalOrdersEl.innerText = totalOrders;
    if (totalRevenueEl) totalRevenueEl.innerText = `${totalRevenue.toLocaleString()} ج.م`;
    if (statWhatsappNum) statWhatsappNum.innerText = STORE_WHATSAPP_NUMBER;

    updateTabBadges();
}

function updateTabBadges() {
    const pBadge = document.getElementById('tabBadgeProducts');
    const oBadge = document.getElementById('tabBadgeOrders');
    if (pBadge) pBadge.innerText = adminState.products.length;
    if (oBadge) oBadge.innerText = adminState.orders.length;
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

        return `
            <tr class="hover:bg-gray-50/80 transition-colors">
                <td class="p-4">
                    <img src="${imgSrc}" alt="${product.title}" class="w-14 h-14 rounded-xl object-cover bg-gray-100 border border-gray-200">
                </td>
                <td class="p-4">
                    <h4 class="font-bold text-gray-900 text-sm max-w-xs">${product.title}</h4>
                    <p class="text-xs text-gray-400 line-clamp-1 mt-0.5">${product.description || ''}</p>
                </td>
                <td class="p-4">
                    <span class="inline-block bg-emerald-50 text-emerald-800 text-xs px-2.5 py-1 rounded-lg font-bold border border-emerald-100">
                        ${catName}
                    </span>
                </td>
                <td class="p-4 font-black text-emerald-700 text-sm">
                    ${(product.price || 0).toLocaleString()} ج.م
                </td>
                <td class="p-4 text-xs text-gray-400 line-through">
                    ${product.oldPrice ? `${product.oldPrice.toLocaleString()} ج.م` : '—'}
                </td>
                <td class="p-4">
                    ${product.badge ? `
                        <span class="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            ${product.badge}
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
        } else {
            // حفظ محلي احتياطي
            const idx = adminState.products.findIndex(p => p.id.toString() === productPayload.id.toString());
            if (idx > -1) adminState.products[idx] = productPayload;
            else adminState.products.unshift(productPayload);
            localStorage.setItem('makkah_real_products', JSON.stringify(adminState.products));
        }

        closeProductModal();
        alert('تم حفظ وتحديث المنتج بنجاح في قاعدة بيانات Firebase!');
    } catch (err) {
        console.error("Save product error:", err);
        alert('تم حفظ المنتج محلياً، وحدث تنبيه من Firebase: ' + err.message + '\nتأكد من تفعيل قواعد القراءة والكتابة في Firebase console.');
        // حفظ محلي لضمان عدم ضياع عمل المستخدم
        const idx = adminState.products.findIndex(p => p.id.toString() === productPayload.id.toString());
        if (idx > -1) adminState.products[idx] = productPayload;
        else adminState.products.unshift(productPayload);
        localStorage.setItem('makkah_real_products', JSON.stringify(adminState.products));
        renderAdminProducts();
        closeProductModal();
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
        const itemsSummary = (order.items || []).map(i => `• ${i.title} (${i.qty} عبوة)`).join('<br>');
        const orderKey = order.firebaseKey || order.id;

        return `
            <tr class="hover:bg-gray-50/80 transition-colors">
                <td class="p-4 font-mono font-bold text-emerald-700">
                    #${order.orderNumber || order.id}
                </td>
                <td class="p-4 text-xs text-gray-500 whitespace-nowrap">
                    ${order.date || 'اليوم'}
                </td>
                <td class="p-4">
                    <p class="font-bold text-gray-900 text-sm">${order.name}</p>
                    <a href="tel:${order.phone}" class="text-xs text-blue-600 font-mono hover:underline inline-flex items-center gap-1 mt-0.5">
                        <i class="fas fa-phone text-[10px]"></i> ${order.phone}
                    </a>
                </td>
                <td class="p-4 text-xs text-gray-600 max-w-xs">
                    <span class="font-bold text-gray-800">${order.city}</span><br>
                    <span>${order.address}</span>
                </td>
                <td class="p-4 text-xs text-gray-700 leading-relaxed max-w-sm">
                    ${itemsSummary || '—'}
                </td>
                <td class="p-4 font-black text-emerald-700 text-sm whitespace-nowrap">
                    ${(order.total || 0).toLocaleString()} ج.م
                </td>
                <td class="p-4">
                    <select onchange="updateOrderStatus('${orderKey}', this.value)" class="bg-gray-50 border border-gray-200 text-xs font-bold rounded-lg p-1.5 focus:outline-none">
                        <option value="جديد" ${order.status === 'جديد' ? 'selected' : ''}>جديد 🟡</option>
                        <option value="تم التأكيد" ${order.status === 'تم التأكيد' ? 'selected' : ''}>تم التأكيد 🟢</option>
                        <option value="تم الشحن" ${order.status === 'تم الشحن' ? 'selected' : ''}>تم الشحن 🚚</option>
                        <option value="مكتمل" ${order.status === 'مكتمل' ? 'selected' : ''}>مكتمل ✓</option>
                    </select>
                </td>
                <td class="p-4 text-center whitespace-nowrap">
                    <div class="flex items-center justify-center gap-2">
                        <a 
                            href="https://wa.me/${customerPhoneDigits.startsWith('2') ? customerPhoneDigits : '2' + customerPhoneDigits}?text=${encodeURIComponent(`السلام عليكم أستاذ ${order.name}، بخصوص طلبك من كنوز مكة رقم #${order.orderNumber}`)}" 
                            target="_blank" 
                            class="px-2.5 py-1.5 rounded-xl bg-green-100 hover:bg-green-200 text-green-800 text-xs font-bold transition-colors inline-flex items-center gap-1"
                            title="محادثة العميل عبر الواتساب"
                        >
                            <i class="fab fa-whatsapp"></i> واتساب
                        </a>
                        <button onclick="deleteOrder('${orderKey}')" class="p-1.5 rounded-lg text-gray-400 hover:text-red-500 transition-colors" title="حذف الطلب">
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
// Admin Password & Authentication Protection
// ==========================================
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
        let isValid = false;
        if (typeof verifyAdminPasswordWithFirebase === 'function') {
            isValid = await verifyAdminPasswordWithFirebase(enteredPass);
        } else {
            const localPass = localStorage.getItem('makkah_admin_password');
            isValid = !!(localPass && enteredPass === localPass);
        }

        if (isValid) {
            sessionStorage.setItem('makkah_admin_auth', 'authenticated');
            if (overlay) overlay.classList.add('hidden');
        } else {
            if (err) {
                err.innerText = "كلمة المرور غير صحيحة، حاول مجدداً";
                err.classList.remove('hidden');
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
        window.location.href = 'index.html';
    }
}

// Change Password Modal
function openChangePasswordModal() {
    const modal = document.getElementById('changePasswordModal');
    const err = document.getElementById('changePassError');
    if (err) err.classList.add('hidden');
    document.getElementById('currentPassInput').value = '';
    document.getElementById('newPassInput').value = '';
    if (modal) modal.classList.remove('hidden');
}

function closeChangePasswordModal() {
    const modal = document.getElementById('changePasswordModal');
    if (modal) modal.classList.add('hidden');
}

async function handleChangePasswordSubmit(e) {
    e.preventDefault();
    const currentPass = document.getElementById('currentPassInput').value.trim();
    const newPass = document.getElementById('newPassInput').value.trim();
    const err = document.getElementById('changePassError');

    let isCurrentValid = false;
    if (typeof verifyAdminPasswordWithFirebase === 'function') {
        isCurrentValid = await verifyAdminPasswordWithFirebase(currentPass);
    } else {
        const localPass = localStorage.getItem('makkah_admin_password');
        isCurrentValid = !!(localPass && currentPass === localPass);
    }

    if (!isCurrentValid) {
        if (err) {
            err.innerText = 'كلمة المرور الحالية غير صحيحة!';
            err.classList.remove('hidden');
        }
        return;
    }

    if (newPass.length < 4) {
        if (err) {
            err.innerText = 'يجب أن تتكون كلمة المرور الجديدة من 4 خانات على الأقل.';
            err.classList.remove('hidden');
        }
        return;
    }

    // حفظ في Firebase Realtime Database
    try {
        const db = getFirebaseDB();
        if (db) {
            await db.ref('adminPassword').set(newPass);
        }
    } catch(errDb) {
        console.warn("Could not sync new password to Firebase:", errDb);
    }

    localStorage.setItem('makkah_admin_password', newPass);
    closeChangePasswordModal();
    alert('تم تحديث كلمة المرور بنجاح في Firebase والمتجر!');
}
