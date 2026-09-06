/* =========================================================
   JASA KAMPUNG
   SCRIPT.JS
   Supabase + Booking + Payment + WhatsApp
========================================================= */

"use strict";

/* =========================================================
   CONFIG
========================================================= */

const WHATSAPP_NUMBER = "6289614001997";
const APP_NAME = "JASA KAMPUNG";

/*
    Supabase client dibuat di supabase.js

    Contoh supabase.js:

    const SUPABASE_URL = "https://xxxxx.supabase.co";
    const SUPABASE_KEY = "publishable-key-anda";

    const supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

    window.JasaKampungSupabase = supabaseClient;
*/

const supabaseClient = window.JasaKampungSupabase;


/* =========================================================
   LOCAL STORAGE
========================================================= */

const STORAGE_CUSTOMER =
    "jasa_kampung_customer";

const STORAGE_ORDERS =
    "jasa_kampung_orders";

const STORAGE_NOTIFICATIONS =
    "jasa_kampung_notifications";


/* =========================================================
   STATE
========================================================= */

let selectedService = null;
let currentCategory = "Semua";
let currentCustomer = {
    name: "",
    phone: ""
};

let allServices = [];
let toastTimer = null;


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);


/* =========================================================
   INITIALIZE
========================================================= */

async function initializeApp() {

    try {

        loadCustomer();

        setupSearch();

        setupCategories();

        setupBookingButtons();

        setupBookingForm();

        setupPhotoPreview();

        setupModalControls();

        setupBottomNavigation();

        setupFooterButtons();

        setupProfile();

        setupPartnerForm();

        setupNotifications();

        setupShowAllServices();

        setMinimumDate();

        updateYear();

        setupPaymentMethods();

        /*
            Ambil jasa dari Supabase.
        */
        await loadServices();

        /*
            Render pesanan lokal sementara.
        */
        renderOrders();

        renderNotifications();

        updateNotificationBadge();

    } catch (error) {

        console.error(
            "Gagal initialize app:",
            error
        );

        showToast(
            "error",
            "Aplikasi gagal dimuat."
        );
    }
}


/* =========================================================
   SUPABASE CHECK
========================================================= */

function isSupabaseReady() {

    return (
        supabaseClient &&
        typeof supabaseClient.from === "function"
    );
}


/* =========================================================
   LOAD SERVICES
========================================================= */

async function loadServices() {

    /*
        Jika Supabase belum dikonfigurasi,
        gunakan fallback agar website tetap tampil.
    */

    if (!isSupabaseReady()) {

        console.warn(
            "Supabase belum dikonfigurasi."
        );

        allServices =
            getFallbackServices();

        renderServices();

        return;
    }


    const {
        data,
        error
    } = await supabaseClient
        .from("services")
        .select("*")
        .eq("active", true)
        .order("category")
        .order("name");


    if (error) {

        console.error(
            "Supabase services error:",
            error
        );

        /*
            Fallback agar halaman tidak kosong.
        */

        allServices =
            getFallbackServices();

        renderServices();

        return;
    }


    allServices = data || [];

    renderServices();
}


/* =========================================================
   FALLBACK SERVICES
========================================================= */

function getFallbackServices() {

    return [

        {
            id: null,
            name: "Setrika",
            category: "Rumah",
            price: 5000,
            description: "Jasa setrika pakaian per kilogram",
            active: true
        },

        {
            id: null,
            name: "Bersih Rumah",
            category: "Rumah",
            price: 50000,
            description: "Jasa membersihkan rumah",
            active: true
        },

        {
            id: null,
            name: "Cuci Sepatu",
            category: "Rumah",
            price: 25000,
            description: "Jasa cuci dan perawatan sepatu",
            active: true
        },

        {
            id: null,
            name: "Cuci Helm",
            category: "Rumah",
            price: 20000,
            description: "Jasa cuci helm",
            active: true
        },

        {
            id: null,
            name: "Perbaikan Listrik",
            category: "Teknik",
            price: 50000,
            description: "Perbaikan instalasi listrik",
            active: true
        },

        {
            id: null,
            name: "Service AC",
            category: "Teknik",
            price: 75000,
            description: "Service dan pengecekan AC",
            active: true
        },

        {
            id: null,
            name: "Service Pompa Air",
            category: "Teknik",
            price: 50000,
            description: "Perbaikan pompa air",
            active: true
        },

        {
            id: null,
            name: "Plumbing",
            category: "Teknik",
            price: 50000,
            description: "Perbaikan saluran air",
            active: true
        },

        {
            id: null,
            name: "Perbaikan Rumah",
            category: "Teknik",
            price: 75000,
            description: "Perbaikan rumah ringan",
            active: true
        },

        {
            id: null,
            name: "Antar Jemput Anak Sekolah",
            category: "Antar Jemput",
            price: 15000,
            description: "Jasa antar jemput anak sekolah",
            active: true
        },

        {
            id: null,
            name: "Antar Barang",
            category: "Antar Jemput",
            price: 10000,
            description: "Jasa pengantaran barang",
            active: true
        },

        {
            id: null,
            name: "Belanja Titipan",
            category: "Antar Jemput",
            price: 15000,
            description: "Jasa belanja titipan",
            active: true
        },

        {
            id: null,
            name: "Menjaga Orang Sakit",
            category: "Pendamping",
            price: 100000,
            description: "Pendampingan orang sakit",
            active: true
        },

        {
            id: null,
            name: "Pendamping Lansia",
            category: "Pendamping",
            price: 100000,
            description: "Pendampingan lansia",
            active: true
        },

        {
            id: null,
            name: "Temani ke Rumah Sakit",
            category: "Pendamping",
            price: 75000,
            description: "Pendamping perjalanan ke rumah sakit",
            active: true
        },

        {
            id: null,
            name: "Antri Rumah Sakit",
            category: "Antrian",
            price: 50000,
            description: "Jasa antre rumah sakit",
            active: true
        },

        {
            id: null,
            name: "Antri Administrasi",
            category: "Antrian",
            price: 30000,
            description: "Jasa antre administrasi",
            active: true
        },

        {
            id: null,
            name: "Antri Pengurusan Dokumen",
            category: "Antrian",
            price: 50000,
            description: "Jasa antre pengurusan dokumen",
            active: true
        }

    ];
}


/* =========================================================
   SERVICE ICON
========================================================= */

function getServiceIcon(category) {

    const icons = {

        "Rumah": "🧹",

        "Teknik": "🔧",

        "Antar Jemput": "🚗",

        "Pendamping": "🤝",

        "Antrian": "🎫"

    };

    return icons[category] || "🛠️";
}


/* =========================================================
   RENDER SERVICES
========================================================= */

function renderServices() {

    const serviceList =
        document.getElementById(
            "serviceList"
        );

    if (!serviceList) return;


    serviceList.innerHTML = "";


    const keyword =
        (
            document.getElementById(
                "serviceSearch"
            )?.value || ""
        )
        .trim()
        .toLowerCase();


    let services =
        allServices.filter(service => {

            const matchCategory =
                currentCategory === "Semua" ||
                service.category === currentCategory;

            const matchSearch =
                !keyword ||
                service.name
                    .toLowerCase()
                    .includes(keyword) ||
                (service.description || "")
                    .toLowerCase()
                    .includes(keyword);

            return (
                matchCategory &&
                matchSearch
            );
        });


    const emptyState =
        document.getElementById(
            "serviceEmptyState"
        );


    if (!services.length) {

        if (emptyState) {
            emptyState.hidden = false;
        }

        return;
    }


    if (emptyState) {
        emptyState.hidden = true;
    }


    services.forEach(service => {

        const card =
            document.createElement("article");

        card.className =
            "service-card";


        card.dataset.category =
            service.category;

        card.dataset.name =
            service.name;


        card.innerHTML = `

            <div class="service-icon">
                ${getServiceIcon(service.category)}
            </div>

            <div class="service-content">

                <span class="service-category">
                    ${escapeHTML(service.category)}
                </span>

                <h3>
                    ${escapeHTML(service.name)}
                </h3>

                <p>
                    ${escapeHTML(
                        service.description ||
                        "Layanan JASA KAMPUNG"
                    )}
                </p>

                <div class="service-bottom">

                    <strong class="service-price">
                        ${formatRupiah(service.price)}
                    </strong>

                    <button
                        type="button"
                        class="book-button"
                        data-book-service
                        data-service-id="${service.id || ""}"
                        data-service-name="${escapeAttribute(service.name)}"
                        data-service-price="${service.price}"
                    >
                        Pesan
                    </button>

                </div>

            </div>
        `;


        serviceList.appendChild(card);

    });


    /*
        Event listener untuk tombol Pesan
    */

    setupBookingButtons();

}


/* =========================================================
   SEARCH
========================================================= */

function setupSearch() {

    const search =
        document.getElementById(
            "serviceSearch"
        );

    const clear =
        document.getElementById(
            "clearSearch"
        );


    if (!search) return;


    search.addEventListener(
        "input",
        function () {

            if (clear) {

                clear.hidden =
                    !this.value.trim();

            }

            renderServices();

        }
    );


    if (clear) {

        clear.addEventListener(
            "click",
            function () {

                search.value = "";

                this.hidden = true;

                renderServices();

                search.focus();

            }
        );

    }

}


/* =========================================================
   CATEGORIES
========================================================= */

function setupCategories() {

    const buttons =
        document.querySelectorAll(
            ".category-item"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            function () {

                buttons.forEach(item => {

                    item.classList.remove(
                        "active"
                    );

                });


                this.classList.add(
                    "active"
                );


                currentCategory =
                    this.dataset.category ||
                    "Semua";


                renderServices();

            }
        );

    });

}


/* =========================================================
   BOOKING BUTTONS
========================================================= */

function setupBookingButtons() {

    const buttons =
        document.querySelectorAll(
            "[data-book-service]"
        );


    buttons.forEach(button => {

        /*
            Hindari listener ganda.
        */

        if (button.dataset.bound === "true") {
            return;
        }

        button.dataset.bound = "true";


        button.addEventListener(
            "click",
            function () {

                const name =
                    this.dataset.serviceName;

                const price =
                    Number(
                        this.dataset.servicePrice
                    ) || 0;

                const serviceId =
                    this.dataset.serviceId ||
                    null;


                openBookingModal(
                    name,
                    price,
                    serviceId
                );

            }
        );

    });

}


/* =========================================================
   OPEN BOOKING MODAL
========================================================= */

function openBookingModal(
    name,
    price,
    serviceId = null
) {

    selectedService = {

        id: serviceId,

        name: name,

        price: Number(price) || 0

    };


    const serviceName =
        document.getElementById(
            "selectedService"
        );

    const servicePrice =
        document.getElementById(
            "selectedServicePrice"
        );


    if (serviceName) {

        serviceName.textContent =
            name;

    }


    if (servicePrice) {

        servicePrice.textContent =
            formatRupiah(price);

    }


    loadCustomerIntoBooking();

    resetPaymentSelection();

    openModal("bookingModal");

}


/* =========================================================
   SPECIAL SERVICE INFO
========================================================= */

function showSpecialServiceInfo(
    serviceName
) {

    const name =
        String(serviceName)
            .toLowerCase();


    let message = "";


    if (name.includes("anak sekolah")) {

        message =
            "Untuk antar jemput anak sekolah, pastikan alamat sekolah, jam antar/jemput dan kontak wali ditulis dengan jelas.";

    }

    else if (
        name.includes("orang sakit") ||
        name.includes("rumah sakit")
    ) {

        message =
            "Untuk layanan pendampingan, tuliskan kondisi dan kebutuhan pendampingan secara jelas.";

    }

    else if (
        name.includes("lansia")
    ) {

        message =
            "Mohon informasikan kebutuhan khusus lansia agar mitra dapat mempersiapkan layanan.";

    }

    else if (
        name.includes("antri")
    ) {

        message =
            "Tuliskan lokasi, jenis antrean dan dokumen yang diperlukan.";

    }

    else if (
        name.includes("antar barang")
    ) {

        message =
            "Tuliskan alamat pengambilan dan tujuan barang.";

    }

    else if (
        name.includes("belanja")
    ) {

        message =
            "Tuliskan daftar barang yang ingin dibelanjakan.";

    }


    if (message) {

        showToast(
            "info",
            message
        );

    }

}


/* =========================================================
   LOAD CUSTOMER
========================================================= */

function loadCustomer() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_CUSTOMER
            );


        if (saved) {

            currentCustomer =
                JSON.parse(saved);

        }

    } catch (error) {

        console.warn(
            "Customer storage error:",
            error
        );

    }

}


/* =========================================================
   SAVE CUSTOMER
========================================================= */

function saveCustomer(
    name,
    phone
) {

    currentCustomer = {

        name:
            String(name || "").trim(),

        phone:
            String(phone || "").trim()

    };


    localStorage.setItem(
        STORAGE_CUSTOMER,
        JSON.stringify(currentCustomer)
    );

}


/* =========================================================
   LOAD CUSTOMER INTO BOOKING
========================================================= */

function loadCustomerIntoBooking() {

    const name =
        document.getElementById(
            "customerName"
        );

    const phone =
        document.getElementById(
            "customerPhone"
        );


    if (name && currentCustomer.name) {

        name.value =
            currentCustomer.name;

    }


    if (phone && currentCustomer.phone) {

        phone.value =
            currentCustomer.phone;

    }

}


/* =========================================================
   BOOKING FORM
========================================================= */

function setupBookingForm() {

    const form =
        document.getElementById(
            "bookingForm"
        );


    if (!form) return;


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            await processBooking();

        }
    );

}


/* =========================================================
   PAYMENT METHODS
========================================================= */

function setupPaymentMethods() {

    const radios =
        document.querySelectorAll(
            'input[name="paymentMethod"]'
        );


    const info =
        document.getElementById(
            "paymentInfo"
        );


    radios.forEach(radio => {

        radio.addEventListener(
            "change",
            function () {

                updatePaymentInfo(
                    this.value
                );

            }
        );

    });


    /*
        Default
    */

    if (info) {

        updatePaymentInfo("COD");

    }

}


/* =========================================================
   RESET PAYMENT
========================================================= */

function resetPaymentSelection() {

    const radios =
        document.querySelectorAll(
            'input[name="paymentMethod"]'
        );


    radios.forEach(radio => {

        radio.checked =
            radio.value === "COD";

    });


    updatePaymentInfo("COD");

}


/* =========================================================
   PAYMENT INFO
========================================================= */

function updatePaymentInfo(
    method
) {

    const info =
        document.getElementById(
            "paymentInfo"
        );


    if (!info) return;


    const messages = {

        "COD": {

            title:
                "💵 COD / Bayar di Tempat",

            text:
                "Pembayaran dilakukan setelah layanan diberikan atau sesuai kesepakatan dengan mitra."

        },

        "QRIS": {

            title:
                "📱 QRIS",

            text:
                "Setelah pesanan dibuat, admin akan memberikan informasi QRIS untuk pembayaran."

        },

        "DANA": {

            title:
                "💙 DANA",

            text:
                "Admin akan memberikan nomor atau informasi akun DANA setelah pesanan dikonfirmasi."

        },

        "GoPay": {

            title:
                "🟢 GoPay",

            text:
                "Admin akan memberikan informasi pembayaran GoPay setelah pesanan dikonfirmasi."

        },

        "Transfer Bank": {

            title:
                "🏦 Transfer Bank",

            text:
                "Admin akan memberikan nomor rekening tujuan setelah pesanan dikonfirmasi."

        }

    };


    const selected =
        messages[method] ||
        messages["COD"];


    info.innerHTML = `

        <strong>
            ${selected.title}
        </strong>

        <p>
            ${selected.text}
        </p>

    `;

}


/* =========================================================
   PROCESS BOOKING
========================================================= */

async function processBooking() {

    if (!selectedService) {

        showToast(
            "error",
            "Silakan pilih jasa terlebih dahulu."
        );

        return;
    }


    const name =
        getValue("customerName");

    const phone =
        getValue("customerPhone");

    const problem =
        getValue("problemDescription");

    const address =
        getValue("customerAddress");

    const schedule =
        getValue("scheduleDate");

    const agreement =
        document.getElementById(
            "customerAgreement"
        );


    const payment =
        document.querySelector(
            'input[name="paymentMethod"]:checked'
        );


    const photo =
        document.getElementById(
            "problemPhoto"
        );


    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!name) {

        showToast(
            "error",
            "Nama wajib diisi."
        );

        focusElement("customerName");

        return;
    }


    if (!isValidPhone(phone)) {

        showToast(
            "error",
            "Nomor WhatsApp tidak valid."
        );

        focusElement("customerPhone");

        return;
    }


    if (!problem) {

        showToast(
            "error",
            "Jelaskan kebutuhan atau keluhan Anda."
        );

        focusElement(
            "problemDescription"
        );

        return;
    }


    if (!address) {

        showToast(
            "error",
            "Alamat wajib diisi."
        );

        focusElement(
            "customerAddress"
        );

        return;
    }


    if (!schedule) {

        showToast(
            "error",
            "Pilih jadwal layanan."
        );

        focusElement(
            "scheduleDate"
        );

        return;
    }


    if (!payment) {

        showToast(
            "error",
            "Pilih metode pembayaran."
        );

        return;
    }


    if (
        agreement &&
        !agreement.checked
    ) {

        showToast(
            "error",
            "Anda harus menyetujui ketentuan."
        );

        return;
    }


    if (!WHATSAPP_NUMBER) {

        showToast(
            "error",
            "Nomor WhatsApp belum dikonfigurasi."
        );

        return;
    }


    /* =====================================================
       SAVE CUSTOMER
    ===================================================== */

    saveCustomer(
        name,
        phone
    );


    /* =====================================================
       CREATE ORDER
    ===================================================== */

    const orderData = {

        serviceId:
            selectedService.id,

        service:
            selectedService.name,

        price:
            selectedService.price,

        customerName:
            name,

        customerPhone:
            phone,

        problem:
            problem,

        address:
            address,

        schedule:
            schedule,

        photoName:
            photo?.files?.[0]?.name || "",

        paymentMethod:
            payment.value,

        paymentStatus:
            payment.value === "COD"
                ? "Belum Dibayar"
                : "Belum Dibayar"

    };


    try {

        showToast(
            "info",
            "Menyimpan pesanan..."
        );


        const order =
            await createOrder(
                orderData
            );


        if (!order) {

            throw new Error(
                "Pesanan gagal dibuat."
            );

        }


        /*
            Simpan cache lokal.
        */

        saveOrder(order);


        /*
            Buat notifikasi lokal.
        */

        addNotification({

            orderId:
                order.id,

            title:
                "Pesanan berhasil dibuat",

            message:
                `${order.orderCode} — ${order.service}`

        });


        renderOrders();

        renderNotifications();

        updateNotificationBadge();


        /*
            Tutup modal.
        */

        closeModal(
            "bookingModal"
        );


        /*
            Tampilkan berhasil.
        */

        showToast(
            "success",
            `Pesanan ${order.orderCode} berhasil dibuat.`
        );


        /*
            WhatsApp.
        */

        setTimeout(
            function () {

                sendOrderToWhatsApp(
                    order
                );

            },
            700
        );


    } catch (error) {

        console.error(
            "Booking error:",
            error
        );


        showToast(
            "error",
            error.message ||
            "Pesanan gagal dibuat."
        );

    }

}


/* =========================================================
   CREATE ORDER
========================================================= */

async function createOrder(data) {

    const orderCode =
        generateOrderCode();


    /*
        Jika Supabase belum aktif,
        gunakan LocalStorage sebagai fallback.
    */

    if (!isSupabaseReady()) {

        return {

            id:
                "local-" +
                Date.now(),

            orderCode:
                orderCode,

            serviceId:
                data.serviceId,

            service:
                data.service,

            price:
                data.price,

            customerName:
                data.customerName,

            customerPhone:
                data.customerPhone,

            problem:
                data.problem,

            address:
                data.address,

            schedule:
                data.schedule,

            photoName:
                data.photoName,

            paymentMethod:
                data.paymentMethod,

            paymentStatus:
                data.paymentStatus,

            status:
                "Menunggu",

            createdAt:
                new Date().toISOString()

        };

    }


    /*
        Simpan pelanggan.
    */

    let customerId = null;


    const {
        data: customerData,
        error: customerError
    } = await supabaseClient
        .from("customers")
        .upsert(
            {
                name:
                    data.customerName,

                phone:
                    data.customerPhone,

                updated_at:
                    new Date().toISOString()
            },
            {
                onConflict:
                    "phone"
            }
        )
        .select("id")
        .single();


    if (
        !customerError &&
        customerData
    ) {

        customerId =
            customerData.id;

    }


    /*
        Buat order.
    */

    const {
        data: orderData,
        error: orderError
    } = await supabaseClient
        .from("orders")
        .insert({

            order_code:
                orderCode,

            service_id:
                data.serviceId || null,

            service_name:
                data.service,

            service_price:
                Number(data.price) || 0,

            customer_name:
                data.customerName,

            customer_phone:
                data.customerPhone,

            problem:
                data.problem,

            address:
                data.address,

            schedule:
                data.schedule || null,

            photo_name:
                data.photoName || "",

            payment_method:
                data.paymentMethod,

            payment_status:
                data.paymentStatus,

            status:
                "Menunggu"

        })
        .select("*")
        .single();


    if (orderError) {

        console.error(
            "Order insert error:",
            orderError
        );

        throw new Error(
            orderError.message ||
            "Gagal menyimpan pesanan."
        );

    }


    /*
        Format kembali supaya cocok
        dengan sistem frontend.
    */

    return {

        id:
            orderData.id,

        orderCode:
            orderData.order_code,

        serviceId:
            orderData.service_id,

        service:
            orderData.service_name,

        price:
            orderData.service_price,

        customerName:
            orderData.customer_name,

        customerPhone:
            orderData.customer_phone,

        problem:
            orderData.problem,

        address:
            orderData.address,

        schedule:
            orderData.schedule,

        photoName:
            orderData.photo_name,

        paymentMethod:
            orderData.payment_method,

        paymentStatus:
            orderData.payment_status,

        status:
            orderData.status,

        createdAt:
            orderData.created_at

    };

}


/* =========================================================
   WHATSAPP
========================================================= */

function sendOrderToWhatsApp(
    order
) {

    const message =
        buildWhatsAppMessage(order);


    const url =
        "https://wa.me/" +
        WHATSAPP_NUMBER +
        "?text=" +
        encodeURIComponent(message);


    window.open(
        url,
        "_blank"
    );

}


/* =========================================================
   WHATSAPP MESSAGE
========================================================= */

function buildWhatsAppMessage(
    order
) {

    return `*${APP_NAME}*

*PESANAN BARU*

Kode Pesanan:
${order.orderCode}

Jasa:
${order.service}

Harga:
${formatRupiah(order.price)}

Nama:
${order.customerName}

WhatsApp:
${order.customerPhone}

Kebutuhan:
${order.problem}

Alamat:
${order.address}

Jadwal:
${formatDateTime(order.schedule)}

Pembayaran:
${order.paymentMethod}

Status Pembayaran:
${order.paymentStatus}

Status Pesanan:
${order.status}

Mohon konfirmasi pesanan saya.

Terima kasih.`;

}


/* =========================================================
   GET LOCAL ORDERS
========================================================= */

function getOrders() {

    try {

        const orders =
            localStorage.getItem(
                STORAGE_ORDERS
            );


        return orders
            ? JSON.parse(orders)
            : [];

    } catch (error) {

        console.error(
            "Get orders error:",
            error
        );

        return [];

    }

}


/* =========================================================
   SAVE LOCAL ORDER
========================================================= */

function saveOrder(order) {

    const orders =
        getOrders();


    orders.unshift(order);


    /*
        Simpan maksimal 50 pesanan lokal.
    */

    localStorage.setItem(
        STORAGE_ORDERS,
        JSON.stringify(
            orders.slice(0, 50)
        )
    );

}


/* =========================================================
   RENDER ORDERS
========================================================= */

function renderOrders() {

    const container =
        document.getElementById(
            "ordersList"
        );


    if (!container) return;


    const orders =
        getOrders();


    if (!orders.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    🧾
                </div>

                <h3>
                    Belum Ada Pesanan
                </h3>

                <p>
                    Pesanan Anda akan muncul di sini.
                </p>

            </div>

        `;

        return;
    }


    container.innerHTML =
        orders.map(order => `

            <div class="order-card">

                <div class="order-header">

                    <strong>
                        ${escapeHTML(
                            order.orderCode
                        )}
                    </strong>

                    <span class="order-status">
                        ${escapeHTML(
                            order.status ||
                            "Menunggu"
                        )}
                    </span>

                </div>


                <div class="order-body">

                    <h3>
                        ${escapeHTML(
                            order.service
                        )}
                    </h3>

                    <p>
                        ${formatRupiah(
                            order.price
                        )}
                    </p>

                    <p>
                        💳
                        ${escapeHTML(
                            order.paymentMethod ||
                            "COD"
                        )}
                    </p>

                    <p>
                        Status pembayaran:
                        <strong>
                            ${escapeHTML(
                                order.paymentStatus ||
                                "Belum Dibayar"
                            )}
                        </strong>
                    </p>

                    <small>
                        ${formatDateTime(
                            order.createdAt
                        )}
                    </small>

                </div>

            </div>

        `).join("");

}


/* =========================================================
   PHOTO PREVIEW
========================================================= */

function setupPhotoPreview() {

    const input =
        document.getElementById(
            "problemPhoto"
        );

    const preview =
        document.getElementById(
            "photoPreview"
        );


    if (!input || !preview) return;


    input.addEventListener(
        "change",
        function () {

            preview.innerHTML = "";


            const file =
                this.files?.[0];


            if (!file) {

                preview.hidden = true;

                return;
            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                preview.hidden = true;

                showToast(
                    "error",
                    "File harus berupa gambar."
                );

                this.value = "";

                return;
            }


            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    preview.innerHTML = `

                        <img
                            src="${event.target.result}"
                            alt="Preview foto masalah"
                        >

                    `;

                    preview.hidden = false;

                };


            reader.readAsDataURL(file);

        }
    );

}


/* =========================================================
   RESET PHOTO
========================================================= */

function resetPhotoPreview() {

    const input =
        document.getElementById(
            "problemPhoto"
        );

    const preview =
        document.getElementById(
            "photoPreview"
        );


    if (input) {

        input.value = "";

    }


    if (preview) {

        preview.innerHTML = "";

        preview.hidden = true;

    }

}


/* =========================================================
   MODALS
========================================================= */

function setupModalControls() {

    document.addEventListener(
        "click",
        function (event) {

            const closeButton =
                event.target.closest(
                    "[data-close-modal]"
                );


            if (
                closeButton
            ) {

                const modal =
                    closeButton.closest(
                        ".modal"
                    );


                if (modal) {

                    closeModal(
                        modal.id
                    );

                }

            }

        }
    );


    /*
        Escape
    */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape"
            ) {

                document
                    .querySelectorAll(
                        ".modal:not([hidden])"
                    )
                    .forEach(modal => {

                        closeModal(
                            modal.id
                        );

                    });

            }

        }
    );

}


/* =========================================================
   OPEN MODAL
========================================================= */

function openModal(id) {

    const modal =
        document.getElementById(id);


    if (!modal) return;


    modal.hidden = false;

    document.body.classList.add(
        "modal-open"
    );

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeModal(id) {

    const modal =
        document.getElementById(id);


    if (!modal) return;


    modal.hidden = true;


    /*
        Jika semua modal tertutup,
        buka scroll kembali.
    */

    const openModalExists =
        document.querySelector(
            ".modal:not([hidden])"
        );


    if (!openModalExists) {

        document.body.classList.remove(
            "modal-open"
        );

    }


    if (
        id === "bookingModal"
    ) {

        resetPhotoPreview();

    }

}


/* =========================================================
   BOTTOM NAVIGATION
========================================================= */

function setupBottomNavigation() {

    const buttons =
        document.querySelectorAll(
            ".bottom-nav-item"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            function () {

                const nav =
                    this.dataset.nav;


                buttons.forEach(item => {

                    item.classList.remove(
                        "active"
                    );

                });


                this.classList.add(
                    "active"
                );


                if (nav === "home") {

                    scrollToSection(
                        "home"
                    );

                }

                else if (
                    nav === "services"
                ) {

                    scrollToSection(
                        "services"
                    );

                }

                else if (
                    nav === "orders"
                ) {

                    renderOrders();

                    openModal(
                        "ordersModal"
                    );

                }

                else if (
                    nav === "profile"
                ) {

                    setupProfileData();

                    openModal(
                        "profileModal"
                    );

                }

            }
        );

    });

}


/* =========================================================
   SCROLL
========================================================= */

function scrollToSection(id) {

    const element =
        document.getElementById(id);


    if (!element) return;


    element.scrollIntoView({

        behavior: "smooth",

        block: "start"

    });

}


/* =========================================================
   FOOTER
========================================================= */

function setupFooterButtons() {

    const categoryButtons =
        document.querySelectorAll(
            "[data-footer-category]"
        );


    categoryButtons.forEach(button => {

        button.addEventListener(
            "click",
            function () {

                currentCategory =
                    this.dataset.footerCategory ||
                    "Semua";


                document
                    .querySelectorAll(
                        ".category-item"
                    )
                    .forEach(item => {

                        item.classList.toggle(
                            "active",
                            item.dataset.category ===
                            currentCategory
                        );

                    });


                renderServices();

                scrollToSection(
                    "services"
                );

            }
        );

    });


    const orders =
        document.getElementById(
            "footerOrders"
        );


    if (orders) {

        orders.addEventListener(
            "click",
            function () {

                renderOrders();

                openModal(
                    "ordersModal"
                );

            }
        );

    }


    const profile =
        document.getElementById(
            "footerProfile"
        );


    if (profile) {

        profile.addEventListener(
            "click",
            function () {

                setupProfileData();

                openModal(
                    "profileModal"
                );

            }
        );

    }


    const partner =
        document.getElementById(
            "footerPartner"
        );


    if (partner) {

        partner.addEventListener(
            "click",
            function () {

                openModal(
                    "technicianModal"
                );

            }
        );

    }


    const partnerButton =
        document.getElementById(
            "partnerButton"
        );


    if (partnerButton) {

        partnerButton.addEventListener(
            "click",
            function () {

                openModal(
                    "technicianModal"
                );

            }
        );

    }

}


/* =========================================================
   PROFILE
========================================================= */

function setupProfile() {

    setupProfileData();

}


/* =========================================================
   PROFILE DATA
========================================================= */

function setupProfileData() {

    const name =
        document.getElementById(
            "profileName"
        );

    const phone =
        document.getElementById(
            "profilePhone"
        );


    if (name) {

        name.textContent =
            currentCustomer.name ||
            "Pelanggan";

    }


    if (phone) {

        phone.textContent =
            currentCustomer.phone ||
            "-";

    }

}


/* =========================================================
   PARTNER FORM
========================================================= */

function setupPartnerForm() {

    const form =
        document.getElementById(
            "partnerForm"
        );


    if (!form) return;


    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const name =
                getValue("partnerName");

            const phone =
                getValue("partnerPhone");

            const service =
                getValue("partnerService");

            const address =
                getValue("partnerAddress");


            if (!name || !phone || !service || !address) {

                showToast(
                    "error",
                    "Lengkapi data mitra."
                );

                return;
            }


            const message =
                `*PENDAFTARAN MITRA ${APP_NAME}*

Nama:
${name}

WhatsApp:
${phone}

Keahlian:
${service}

Area Layanan:
${address}`;


            const url =
                "https://wa.me/" +
                WHATSAPP_NUMBER +
                "?text=" +
                encodeURIComponent(message);


            window.open(
                url,
                "_blank"
            );


            form.reset();

            closeModal(
                "technicianModal"
            );

        }
    );

}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function getNotifications() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_NOTIFICATIONS
            );


        return saved
            ? JSON.parse(saved)
            : [];

    } catch (error) {

        return [];

    }

}


/* =========================================================
   ADD NOTIFICATION
========================================================= */

function addNotification(
    notification
) {

    const notifications =
        getNotifications();


    notifications.unshift({

        id:
            Date.now(),

        orderId:
            notification.orderId ||
            null,

        title:
            notification.title,

        message:
            notification.message,

        read:
            false,

        createdAt:
            new Date().toISOString()

    });


    localStorage.setItem(
        STORAGE_NOTIFICATIONS,
        JSON.stringify(
            notifications.slice(0, 50)
        )
    );

}


/* =========================================================
   RENDER NOTIFICATIONS
========================================================= */

function renderNotifications() {

    const container =
        document.getElementById(
            "notificationsList"
        );


    if (!container) return;


    const notifications =
        getNotifications();


    if (!notifications.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    🔔
                </div>

                <h3>
                    Belum Ada Notifikasi
                </h3>

            </div>

        `;

        return;
    }


    container.innerHTML =
        notifications.map(item => `

            <div class="notification-item">

                <strong>
                    ${escapeHTML(
                        item.title
                    )}
                </strong>

                <p>
                    ${escapeHTML(
                        item.message
                    )}
                </p>

                <small>
                    ${formatDateTime(
                        item.createdAt
                    )}
                </small>

            </div>

        `).join("");

}


/* =========================================================
   NOTIFICATION SETUP
========================================================= */

function setupNotifications() {

    const button =
        document.getElementById(
            "notificationBtn"
        );


    if (!button) return;


    button.addEventListener(
        "click",
        function () {

            renderNotifications();

            markNotificationsRead();

            updateNotificationBadge();

            openModal(
                "notificationModal"
            );

        }
    );

}


/* =========================================================
   MARK NOTIFICATIONS READ
========================================================= */

function markNotificationsRead() {

    const notifications =
        getNotifications();


    notifications.forEach(item => {

        item.read = true;

    });


    localStorage.setItem(
        STORAGE_NOTIFICATIONS,
        JSON.stringify(notifications)
    );

}


/* =========================================================
   NOTIFICATION BADGE
========================================================= */

function updateNotificationBadge() {

    const badge =
        document.getElementById(
            "notificationBadge"
        );


    if (!badge) return;


    const unread =
        getNotifications()
            .filter(
                item => !item.read
            )
            .length;


    badge.textContent =
        unread > 99
            ? "99+"
            : String(unread);


    badge.hidden =
        unread === 0;

}


/* =========================================================
   SHOW ALL SERVICES
========================================================= */

function setupShowAllServices() {

    const button =
        document.getElementById(
            "showAllServices"
        );


    if (!button) return;


    button.addEventListener(
        "click",
        function () {

            currentCategory =
                "Semua";


            document
                .querySelectorAll(
                    ".category-item"
                )
                .forEach(item => {

                    item.classList.toggle(
                        "active",
                        item.dataset.category ===
                        "Semua"
                    );

                });


            const search =
                document.getElementById(
                    "serviceSearch"
                );


            if (search) {

                search.value = "";

            }


            const clear =
                document.getElementById(
                    "clearSearch"
                );


            if (clear) {

                clear.hidden = true;

            }


            renderServices();

            scrollToSection(
                "services"
            );

        }
    );

}


/* =========================================================
   MINIMUM DATE
========================================================= */

function setMinimumDate() {

    const input =
        document.getElementById(
            "scheduleDate"
        );


    if (!input) return;


    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            now.getDate()
        ).padStart(2, "0");


    const hours =
        String(
            now.getHours()
        ).padStart(2, "0");


    const minutes =
        String(
            now.getMinutes()
        ).padStart(2, "0");


    input.min =
        `${year}-${month}-${day}T${hours}:${minutes}`;

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDateTime(
    value
) {

    if (!value) {
        return "-";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;

    }


    return date.toLocaleString(
        "id-ID",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );

}


/* =========================================================
   ORDER CODE
========================================================= */

function generateOrderCode() {

    const now =
        new Date();


    const date =
        now
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, "");


    const random =
        Math.floor(
            1000 +
            Math.random() * 9000
        );


    return `JK-${date}-${random}`;

}


/* =========================================================
   RUPIAH
========================================================= */

function formatRupiah(
    value
) {

    const number =
        Number(value) || 0;


    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0
        }
    ).format(number);

}


/* =========================================================
   PHONE VALIDATION
========================================================= */

function isValidPhone(
    phone
) {

    const value =
        String(phone || "")
            .replace(/\s+/g, "")
            .replace(/-/g, "");


    return /^(08|62|8)\d{8,13}$/.test(
        value
    );

}


/* =========================================================
   GET VALUE
========================================================= */

function getValue(id) {

    const element =
        document.getElementById(id);


    return element
        ? element.value.trim()
        : "";

}


/* =========================================================
   FOCUS
========================================================= */

function focusElement(id) {

    const element =
        document.getElementById(id);


    if (!element) return;


    setTimeout(
        () => element.focus(),
        50
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   ESCAPE ATTRIBUTE
========================================================= */

function escapeAttribute(
    value
) {

    return escapeHTML(value);

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    type,
    message
) {

    const toast =
        document.getElementById(
            "toast"
        );

    const icon =
        document.getElementById(
            "toastIcon"
        );

    const text =
        document.getElementById(
            "toastMessage"
        );


    if (!toast || !text) {

        console.log(message);

        return;

    }


    const icons = {

        success: "✓",

        error: "✕",

        info: "ℹ",

        warning: "!"

    };


    if (icon) {

        icon.textContent =
            icons[type] ||
            "ℹ";

    }


    text.textContent =
        message;


    toast.hidden = false;


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            function () {

                toast.hidden = true;

            },
            3500
        );

}


/* =========================================================
   UPDATE YEAR
========================================================= */

function updateYear() {

    const year =
        document.getElementById(
            "currentYear"
        );


    if (year) {

        year.textContent =
            new Date().getFullYear();

    }

}


/* =========================================================
   PUBLIC API
========================================================= */

window.JasaKampung = {

    openBooking:
        openBookingModal,

    openOrders:
        () => openModal("ordersModal"),

    openProfile:
        () => openModal("profileModal"),

    getOrders:
        getOrders,

    getCustomer:
        () => currentCustomer,

    getServices:
        () => allServices

};