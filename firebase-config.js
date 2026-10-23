// =================================================================
// إعدادات وربط Firebase لقاعدة بيانات متجر كنوز مكة
// Firebase Realtime Database & Cloud Storage
// =================================================================

const firebaseConfig = {
  apiKey: "AIzaSyDN3kUmSUchqZ9RmIhzWL7IgEgkEOX_TEA",
  authDomain: "kanoz-d901f.firebaseapp.com",
  databaseURL: "https://kanoz-d901f-default-rtdb.firebaseio.com",
  projectId: "kanoz-d901f",
  storageBucket: "kanoz-d901f.firebasestorage.app",
  messagingSenderId: "811750358420",
  appId: "1:811750358420:web:31f9256daee8acc7392381",
  measurementId: "G-M2QVXE0BEP"
};

// تهيئة تطبيق Firebase
let fbApp = null;
let fbDatabase = null;
let isFirebaseConnected = false;

try {
    if (typeof firebase !== 'undefined') {
        fbApp = firebase.initializeApp(firebaseConfig);
        fbDatabase = firebase.database();
        isFirebaseConnected = true;
        console.log("Firebase Realtime Database initialized successfully!");
    } else {
        console.warn("Firebase SDK script not loaded yet.");
    }
} catch (error) {
    console.error("Firebase Initialization Error:", error);
}

// دالة فحص اتصال Firebase
function getFirebaseDB() {
    if (!fbDatabase && typeof firebase !== 'undefined') {
        try {
            fbDatabase = firebase.database();
        } catch(e) {
            console.error("Error obtaining database instance:", e);
        }
    }
    return fbDatabase;
}

// ==========================================================
// دوال إدارة المنتجات (Products) في Firebase
// ==========================================================

// الاستماع المباشر للمنتجات في الوقت الفعلي (Real-time listener)
function subscribeToProducts(onDataReceived, onError) {
    const db = getFirebaseDB();
    if (!db) {
        if (onError) onError(new Error("Firebase Database is not initialized"));
        return;
    }

    const productsRef = db.ref('products');
    productsRef.on('value', (snapshot) => {
        const val = snapshot.val();
        let productsList = [];
        if (val) {
            // تحويل الكائن أو المصفوفة إلى مصفوفة منتجات
            if (Array.isArray(val)) {
                productsList = val.filter(item => item !== null);
            } else {
                productsList = Object.keys(val).map(key => ({
                    ...val[key],
                    firebaseKey: key,
                    id: val[key].id || key
                }));
            }
        }
        // حفظ نسخة احتياطية في localStorage
        localStorage.setItem('makkah_real_products', JSON.stringify(productsList));
        if (onDataReceived) onDataReceived(productsList);
    }, (error) => {
        console.error("Firebase Products Read Error:", error);
        if (onError) onError(error);
    });
}

// حفظ أو تحديث منتج في Firebase
async function saveProductToFirebase(product) {
    const db = getFirebaseDB();
    if (!db) {
        throw new Error("Firebase Database is not connected.");
    }

    const productId = product.id.toString();
    const productRef = db.ref('products/' + productId);
    await productRef.set(product);
    return true;
}

// حذف منتج من Firebase
async function deleteProductFromFirebase(productId) {
    const db = getFirebaseDB();
    if (!db) {
        throw new Error("Firebase Database is not connected.");
    }

    const productRef = db.ref('products/' + productId.toString());
    await productRef.remove();
    return true;
}

// ==========================================================
// دوال إدارة الطلبات (Orders) في Firebase
// ==========================================================

// إرسال طلب جديد إلى Firebase
async function saveOrderToFirebase(order) {
    const db = getFirebaseDB();
    if (!db) {
        // حفظ محلي في حالة عدم توفر الاتصال
        const localOrders = JSON.parse(localStorage.getItem('makkah_orders') || '[]');
        localOrders.unshift(order);
        localStorage.setItem('makkah_orders', JSON.stringify(localOrders));
        return order.id;
    }

    try {
        const ordersRef = db.ref('orders');
        const newOrderRef = ordersRef.push();
        const orderData = {
            ...order,
            firebaseKey: newOrderRef.key
        };
        await newOrderRef.set(orderData);
        return newOrderRef.key;
    } catch (err) {
        console.error("Error saving order to Firebase:", err);
        // حفظ محلي احتياطي
        const localOrders = JSON.parse(localStorage.getItem('makkah_orders') || '[]');
        localOrders.unshift(order);
        localStorage.setItem('makkah_orders', JSON.stringify(localOrders));
        return order.id;
    }
}

// الاستماع للطلبات في الوقت الفعلي في لوحة الأدمن
function subscribeToOrders(onDataReceived, onError) {
    const db = getFirebaseDB();
    if (!db) {
        if (onError) onError(new Error("Firebase Database is not initialized"));
        return;
    }

    const ordersRef = db.ref('orders');
    ordersRef.on('value', (snapshot) => {
        const val = snapshot.val();
        let ordersList = [];
        if (val) {
            ordersList = Object.keys(val).map(key => ({
                ...val[key],
                firebaseKey: key
            }));
            // ترتيب الطلبات من الأحدث للأقدم
            ordersList.sort((a, b) => (b.id || 0) - (a.id || 0));
        }
        localStorage.setItem('makkah_orders', JSON.stringify(ordersList));
        if (onDataReceived) onDataReceived(ordersList);
    }, (error) => {
        console.error("Firebase Orders Read Error:", error);
        if (onError) onError(error);
    });
}

// تحديث حالة الطلب في Firebase
async function updateOrderStatusInFirebase(firebaseKey, newStatus) {
    const db = getFirebaseDB();
    if (!db || !firebaseKey) return;
    return db.ref('orders/' + firebaseKey + '/status').set(newStatus);
}

// حذف طلب من Firebase
async function deleteOrderFromFirebase(firebaseKey) {
    const db = getFirebaseDB();
    if (!db || !firebaseKey) return;
    return db.ref('orders/' + firebaseKey).remove();
}

// ==========================================================
// دوال إدارة الإعلانات والعروض (Announcements & Banners) في Firebase
// ==========================================================
const DEFAULT_ANNOUNCEMENTS = [
    {
        id: "1",
        text: "🔥 خصم حصري 20% على جميع زيوت إنبات الفراغات وعلاج التساقط بمناسبة الافتتاح!",
        coupon: "MAKKAH20",
        btnText: "تسوق العرض الآن",
        btnLink: "#hair-loss",
        theme: "emerald",
        active: true,
        createdAt: Date.now()
    }
];

function subscribeToAnnouncements(onDataReceived, onError) {
    const db = getFirebaseDB();
    if (!db) {
        let local = JSON.parse(localStorage.getItem('makkah_announcements') || 'null');
        if (!local || local.length === 0) {
            local = DEFAULT_ANNOUNCEMENTS;
            localStorage.setItem('makkah_announcements', JSON.stringify(local));
        }
        if (onDataReceived) onDataReceived(local);
        return;
    }

    const annRef = db.ref('announcements');
    annRef.on('value', (snapshot) => {
        const val = snapshot.val();
        let list = [];
        if (val) {
            list = Object.keys(val).map(key => ({
                ...val[key],
                firebaseKey: key,
                id: val[key].id || key
            }));
            list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        } else {
            // تهيئة إعلان افتراضي أولي إن كانت قاعدة البيانات خالية
            list = DEFAULT_ANNOUNCEMENTS;
            try {
                db.ref('announcements/1').set(DEFAULT_ANNOUNCEMENTS[0]);
            } catch(e) {}
        }
        localStorage.setItem('makkah_announcements', JSON.stringify(list));
        if (onDataReceived) onDataReceived(list);
    }, (error) => {
        console.error("Firebase Announcements Read Error:", error);
        let fallback = JSON.parse(localStorage.getItem('makkah_announcements') || 'null');
        if (!fallback || fallback.length === 0) fallback = DEFAULT_ANNOUNCEMENTS;
        if (onDataReceived) onDataReceived(fallback);
        if (onError) onError(error);
    });
}

async function saveAnnouncementToFirebase(announcement) {
    const db = getFirebaseDB();
    const id = announcement.id ? announcement.id.toString() : Date.now().toString();
    const payload = {
        ...announcement,
        id: id,
        updatedAt: new Date().toISOString()
    };

    if (!db) {
        let local = JSON.parse(localStorage.getItem('makkah_announcements') || '[]');
        const idx = local.findIndex(a => a.id.toString() === id.toString());
        if (idx > -1) local[idx] = payload;
        else local.unshift(payload);
        localStorage.setItem('makkah_announcements', JSON.stringify(local));
        return true;
    }

    await db.ref('announcements/' + id).set(payload);
    return true;
}

async function deleteAnnouncementFromFirebase(id) {
    const db = getFirebaseDB();
    if (!db) {
        let local = JSON.parse(localStorage.getItem('makkah_announcements') || '[]');
        local = local.filter(a => a.id.toString() !== id.toString());
        localStorage.setItem('makkah_announcements', JSON.stringify(local));
        return true;
    }

    await db.ref('announcements/' + id.toString()).remove();
    return true;
}

async function toggleAnnouncementInFirebase(id, activeStatus) {
    const db = getFirebaseDB();
    if (!db) {
        let local = JSON.parse(localStorage.getItem('makkah_announcements') || '[]');
        const item = local.find(a => a.id.toString() === id.toString());
        if (item) item.active = activeStatus;
        localStorage.setItem('makkah_announcements', JSON.stringify(local));
        return true;
    }

    await db.ref('announcements/' + id.toString() + '/active').set(activeStatus);
    return true;
}

// ==========================================================
// التحقق من حساب وكلمة مرور الأدمن عبر Firebase
// الحساب المعتمد: kanouz123@gmail.com
// ==========================================================
const ADMIN_FIREBASE_EMAIL = "kanouz123@gmail.com";

async function verifyAdminPasswordWithFirebase(enteredPassword) {
    const cleanInput = enteredPassword.toString().trim();

    // 1. محاولة تسجيل الدخول عبر Firebase Authentication بحساب kanouz123@gmail.com
    if (typeof firebase !== 'undefined' && firebase.auth) {
        try {
            const auth = firebase.auth();
            const userCred = await auth.signInWithEmailAndPassword(ADMIN_FIREBASE_EMAIL, cleanInput);
            if (userCred && userCred.user) {
                localStorage.setItem('makkah_admin_password', cleanInput);
                localStorage.setItem('makkah_admin_email', ADMIN_FIREBASE_EMAIL);
                return { success: true, user: userCred.user };
            }
        } catch (authError) {
            console.warn("Firebase Auth Login Attempt:", authError.code, authError.message);

            if (authError.code === 'auth/wrong-password' || authError.code === 'auth/invalid-credential' || authError.code === 'auth/invalid-login-credentials') {
                return { success: false, message: "كلمة المرور غير صحيحة لحساب " + ADMIN_FIREBASE_EMAIL };
            }
            if (authError.code === 'auth/user-not-found') {
                return { success: false, message: "الحساب " + ADMIN_FIREBASE_EMAIL + " غير موجود في Firebase Authentication" };
            }
            if (authError.code === 'auth/too-many-requests') {
                return { success: false, message: "تم إيقاف المحاولات مؤقتاً بسبب كثرة الإدخال الخاطئ. انتظر لحظات ثم أعد المحاولة." };
            }
            // في حالة حدوث خطأ آخر نتابع لفحص قاعدة البيانات
        }
    }

    // 2. فحص بديل في Firebase Realtime Database
    const db = getFirebaseDB();
    if (!db) {
        return { success: false, message: "تعذر الاتصال بـ Firebase" };
    }

    try {
        const rootSnap = await db.ref('/').once('value');
        if (!rootSnap.exists() || rootSnap.val() === null) {
            return {
                success: false,
                message: "كلمة المرور غير صحيحة لحساب " + ADMIN_FIREBASE_EMAIL
            };
        }

        const data = rootSnap.val();

        if (typeof data === 'string' || typeof data === 'number') {
            if (data.toString().trim() === cleanInput) {
                localStorage.setItem('makkah_admin_password', cleanInput);
                return { success: true };
            }
        }

        if (typeof data === 'object' && data !== null) {
            const commonKeys = ['adminPassword', 'password', 'admin_password', 'pass', 'adminPass', 'secret', 'pin'];
            for (const k of commonKeys) {
                if (data[k] !== undefined && data[k] !== null) {
                    if (data[k].toString().trim() === cleanInput) {
                        localStorage.setItem('makkah_admin_password', cleanInput);
                        return { success: true };
                    }
                }
            }
        }

        return { success: false, message: "كلمة المرور غير صحيحة لحساب " + ADMIN_FIREBASE_EMAIL };
    } catch (err) {
        console.error("Firebase Password Verification Error:", err);
        return { success: false, error: err, message: "خطأ في الاتصال بـ Firebase: " + err.message };
    }
}
