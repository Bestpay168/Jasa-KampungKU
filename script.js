/* =========================================================
   JASA KAMPUNG
   script.js
   No Supabase
   LocalStorage + WhatsApp
========================================================= */

"use strict";


/* =========================================================
   1. CONFIGURATION
========================================================= */

const WHATSAPP_NUMBER = "6289614001997";

const APP_NAME = "JASA KAMPUNG";

const STORAGE_CUSTOMER =
    "jasa_kampung_customer";

const STORAGE_ORDERS =
    "jasa_kampung_orders";

const STORAGE_NOTIFICATIONS =
    "jasa_kampung_notifications";


/* =========================================================
   2. STATE
========================================================= */

let selectedService = null;

let currentCategory = "Semua";

let currentCustomer = {
    name: "",
    phone: ""
};

let toastTimer = null;


/* =========================================================
   3. DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeApp();

});


/* =========================================================
   4. INITIALIZE APP
========================================================= */

function initializeApp() {



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

    renderOrders();

    renderNotifications();

    updateNotificationBadge();

}




/* =========================================================
   6. CUSTOMER
========================================================= */

function loadCustomer() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_CUSTOMER
            );

        if (!saved) return;

        currentCustomer =
            JSON.parse(saved);

        const name =
            document.getElementById(
                "customerName"
            );

        const phone =
            document.getElementById(
                "customerPhone"
            );

        const profileName =
            document.getElementById(
                "profileName"
            );

        const profilePhone =
            document.getElementById(
                "profilePhone"
            );

        if (name)
            name.value =
                currentCustomer.name || "";

        if (phone)
            phone.value =
                currentCustomer.phone || "";

        if (profileName)
            profileName.value =
                currentCustomer.name || "";

        if (profilePhone)
            profilePhone.value =
                currentCustomer.phone || "";

    } catch (error) {

        console.error(
            "Gagal memuat profil:",
            error
        );

    }

}


function saveCustomer(
    name,
    phone
) {

    currentCustomer = {
        name: name.trim(),
        phone: phone.trim()
    };

    localStorage.setItem(
        STORAGE_CUSTOMER,
        JSON.stringify(
            currentCustomer
        )
    );

}


/* =========================================================
   7. SEARCH
========================================================= */

function setupSearch() {

    const input =
        document.getElementById(
            "serviceSearch"
        );

    const clear =
        document.getElementById(
            "clearSearch"
        );

    if (!input) return;


    input.addEventListener(
        "input",
        () => {

            const keyword =
                input.value.trim();

            if (clear) {

                clear.hidden =
                    keyword.length === 0;

            }

            filterServices(
                keyword,
                currentCategory
            );

        }
    );


    if (clear) {

        clear.addEventListener(
            "click",
            () => {

                input.value = "";

                clear.hidden = true;

                filterServices(
                    "",
                    currentCategory
                );

                input.focus();

            }
        );

    }

}


/* =========================================================
   8. CATEGORY FILTER
========================================================= */

function setupCategories() {

    const categories =
        document.querySelectorAll(
            ".category-item"
        );

    categories.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    categories.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );

                    button.classList.add(
                        "active"
                    );

                    currentCategory =
                        button.dataset.category ||
                        "Semua";

                    const search =
                        document.getElementById(
                            "serviceSearch"
                        );

                    filterServices(
                        search
                            ? search.value
                            : "",
                        currentCategory
                    );

                }
            );

        }
    );

}


/* =========================================================
   FILTER SERVICES
========================================================= */

function filterServices(
    keyword = "",
    category = "Semua"
) {

    const cards =
        document.querySelectorAll(
            ".service-card"
        );

    const empty =
        document.getElementById(
            "serviceEmptyState"
        );

    let visibleCount = 0;

    const normalizedKeyword =
        keyword
            .toLowerCase()
            .trim();


    cards.forEach(card => {

        const name =
            (
                card.dataset.name ||
                card.querySelector("h3")
                    ?.textContent ||
                ""
            ).toLowerCase();

        const cardCategory =
            card.dataset.category ||
            "";

        const categoryMatch =
            category === "Semua" ||
            cardCategory === category;

        const keywordMatch =
            !normalizedKeyword ||
            name.includes(
                normalizedKeyword
            ) ||
            card.textContent
                .toLowerCase()
                .includes(
                    normalizedKeyword
                );

        const visible =
            categoryMatch &&
            keywordMatch;

        card.style.display =
            visible
                ? ""
                : "none";

        if (visible)
            visibleCount++;

    });


    if (empty) {

        empty.hidden =
            visibleCount !== 0;

    }

}


/* =========================================================
   9. BOOKING BUTTONS
========================================================= */

function setupBookingButtons() {

    const buttons =
        document.querySelectorAll(
            "[data-book-service]"
        );

    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const name =
                        button.dataset
                            .serviceName ||
                        "Jasa";

                    const price =
                        Number(
                            button.dataset
                                .servicePrice
                        ) || 0;

                    openBookingModal(
                        name,
                        price
                    );

                }
            );

        }
    );

}


/* =========================================================
   OPEN BOOKING
========================================================= */

function openBookingModal(
    name,
    price
) {

    selectedService = {
        name,
        price
    };


    const service =
        document.getElementById(
            "selectedService"
        );

    const servicePrice =
        document.getElementById(
            "selectedServicePrice"
        );

    const serviceName =
        document.getElementById(
            "selectedServiceName"
        );

    const estimated =
        document.getElementById(
            "estimatedPrice"
        );


    if (service)
        service.value = name;

    if (servicePrice)
        servicePrice.value = price;

    if (serviceName)
        serviceName.textContent = name;

    if (estimated)
        estimated.textContent =
            formatRupiah(price);


    showSpecialServiceInfo(name);

    loadCustomerIntoBooking();

    resetPhotoPreview();

    openModal("bookingModal");

}


/* =========================================================
   SPECIAL SERVICE INFO
========================================================= */

function showSpecialServiceInfo(
    serviceName
) {

    const box =
        document.getElementById(
            "specialServiceInfo"
        );

    const title =
        document.getElementById(
            "specialServiceTitle"
        );

    const description =
        document.getElementById(
            "specialServiceDescription"
        );

    if (!box) return;


    let text = "";

    const name =
        serviceName.toLowerCase();


    if (
        name.includes("anak sekolah")
    ) {

        text =
            "Untuk keamanan, tuliskan nama anak, sekolah, alamat penjemputan, alamat tujuan, serta jadwal antar/jemput.";

    }

    else if (
        name.includes("orang sakit")
    ) {

        text =
            "Layanan ini merupakan pendampingan non-medis. Tuliskan kondisi umum, kebutuhan pendampingan, dan kontak keluarga.";

    }

    else if (
        name.includes("lansia")
    ) {

        text =
            "Tuliskan kebutuhan lansia, aktivitas yang perlu dibantu, serta kontak keluarga yang dapat dihubungi.";

    }

    else if (
        name.includes("rumah sakit")
    ) {

        text =
            "Tuliskan jadwal, lokasi, kebutuhan pendampingan, dan kontak keluarga.";

    }

    else if (
        name.includes("antri")
    ) {

        text =
            "Tuliskan lokasi layanan, jenis antrian, tanggal, waktu mulai, serta dokumen yang perlu dibawa jika diperlukan.";

    }

    else if (
        name.includes("antar barang")
    ) {

        text =
            "Tuliskan lokasi pengambilan, tujuan, jenis barang, dan informasi tambahan.";

    }

    else if (
        name.includes("belanja")
    ) {

        text =
            "Tuliskan daftar barang yang ingin dibeli dan lokasi toko jika sudah ditentukan.";

    }


    if (text) {

        if (title)
            title.textContent =
                "Informasi tambahan";

        if (description)
            description.textContent =
                text;

        box.hidden = false;

    } else {

        box.hidden = true;

    }

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

    if (!name || !phone) return;


    name.value =
        currentCustomer.name || "";

    phone.value =
        currentCustomer.phone || "";

}


/* =========================================================
   10. BOOKING FORM
========================================================= */

function setupBookingForm() {

    const form =
        document.getElementById(
            "bookingForm"
        );

    if (!form) return;


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            processBooking();

        }
    );

}


/* =========================================================
   PROCESS BOOKING
========================================================= */

function processBooking() {

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


    if (!name) {

        showToast(
            "Nama wajib diisi.",
            "!"
        );

        focusElement(
            "customerName"
        );

        return;

    }


    if (!isValidPhone(phone)) {

        showToast(
            "Nomor WhatsApp tidak valid.",
            "!"
        );

        focusElement(
            "customerPhone"
        );

        return;

    }


    if (!problem) {

        showToast(
            "Jelaskan kebutuhan Anda.",
            "!"
        );

        focusElement(
            "problemDescription"
        );

        return;

    }


    if (!address) {

        showToast(
            "Alamat wajib diisi.",
            "!"
        );

        focusElement(
            "customerAddress"
        );

        return;

    }


    if (!schedule) {

        showToast(
            "Pilih tanggal dan waktu.",
            "!"
        );

        focusElement(
            "scheduleDate"
        );

        return;

    }


    if (
        new Date(schedule) <
        new Date()
    ) {

        showToast(
            "Tanggal dan waktu tidak boleh lewat.",
            "!"
        );

        return;

    }


    if (
        !agreement ||
        !agreement.checked
    ) {

        showToast(
            "Mohon setujui informasi pesanan.",
            "!"
        );

        return;

    }


    if (
        WHATSAPP_NUMBER.includes(
            "xxxxxxxxxx"
        )
    ) {

        showToast(
            "Nomor WhatsApp admin belum diatur.",
            "!"
        );

        return;

    }


    saveCustomer(
        name,
        phone
    );


    const order = createOrder({
        name,
        phone,
        problem,
        address,
        schedule
    });


    saveOrder(order);

    addNotification(
        `Pesanan ${order.orderCode} berhasil dibuat.`
    );

    renderOrders();

    renderNotifications();

    updateNotificationBadge();

    closeModal(
        "bookingModal"
    );

    showToast(
        "Pesanan berhasil dibuat.",
        "✓"
    );


    setTimeout(() => {

        sendOrderToWhatsApp(
            order
        );

    }, 500);

}


/* =========================================================
   CREATE ORDER
========================================================= */

function createOrder(data) {

    const photo =
        document.getElementById(
            "problemPhoto"
        );


    const orderCode =
        generateOrderCode();


    return {

        id:
            Date.now(),

        orderCode,

        service:
            selectedService
                ?.name || "Jasa",

        price:
            selectedService
                ?.price || 0,

        customerName:
            data.name,

        customerPhone:
            data.phone,

        problem:
            data.problem,

        address:
            data.address,

        schedule:
            data.schedule,

        photoName:
            photo?.files?.[0]
                ?.name || "",

        status:
            "Menunggu",

        createdAt:
            new Date().toISOString()

    };

}


/* =========================================================
   11. SAVE ORDER
========================================================= */

function getOrders() {

    try {

        const data =
            localStorage.getItem(
                STORAGE_ORDERS
            );

        return data
            ? JSON.parse(data)
            : [];

    } catch (error) {

        console.error(
            "Gagal membaca pesanan:",
            error
        );

        return [];

    }

}


function saveOrder(order) {

    const orders =
        getOrders();

    orders.unshift(order);

    localStorage.setItem(
        STORAGE_ORDERS,
        JSON.stringify(orders)
    );

}


/* =========================================================
   12. WHATSAPP
========================================================= */

function sendOrderToWhatsApp(
    order
) {

    const message = buildWhatsAppMessage(
        order
    );

    const url =
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

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

    const photoText =
        order.photoName
            ? `\n📷 Foto: ${order.photoName}`
            : "";


    return `
*${APP_NAME} — PESANAN BARU*

🧾 *Kode Pesanan*
${order.orderCode}

🛠️ *Jasa*
${order.service}

💰 *Estimasi Mulai*
${formatRupiah(order.price)}

👤 *Nama*
${order.customerName}

📱 *WhatsApp*
${order.customerPhone}

📝 *Kebutuhan*
${order.problem}

📍 *Alamat*
${order.address}

📅 *Jadwal*
${formatDateTime(order.schedule)}
${photoText}

📌 *Status*
${order.status}

Mohon konfirmasi pesanan saya.

Terima kasih.
`.trim();

}


/* =========================================================
   13. ORDER LIST
========================================================= */

function renderOrders() {

    const list =
        document.getElementById(
            "ordersList"
        );

    const empty =
        document.getElementById(
            "emptyOrders"
        );

    if (!list) return;


    const orders =
        getOrders();


    list.innerHTML = "";


    if (!orders.length) {

        if (empty)
            empty.hidden = false;

        return;

    }


    if (empty)
        empty.hidden = true;


    orders.forEach(
        order => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "order-card";


            card.innerHTML = `

                <div class="order-card-top">

                    <div>

                        <h3>
                            ${escapeHTML(
                                order.service
                            )}
                        </h3>

                        <div class="order-code">
                            ${escapeHTML(
                                order.orderCode
                            )}
                        </div>

                    </div>

                    <span class="order-status">
                        ${escapeHTML(
                            order.status
                        )}
                    </span>

                </div>

                <p>
                    📅 ${escapeHTML(
                        formatDateTime(
                            order.schedule
                        )
                    )}
                </p>

                <p>
                    📍 ${escapeHTML(
                        order.address
                    )}
                </p>

                <p>
                    💰 ${formatRupiah(
                        order.price
                    )}
                </p>

            `;


            list.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   14. PHOTO PREVIEW
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

    const image =
        document.getElementById(
            "photoPreviewImage"
        );


    if (
        !input ||
        !preview ||
        !image
    ) return;


    input.addEventListener(
        "change",
        () => {

            const file =
                input.files?.[0];

            if (!file) {

                resetPhotoPreview();

                return;

            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                showToast(
                    "File harus berupa gambar.",
                    "!"
                );

                input.value = "";

                resetPhotoPreview();

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                event => {

                    image.src =
                        event.target.result;

                    preview.hidden =
                        false;

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


function resetPhotoPreview() {

    const input =
        document.getElementById(
            "problemPhoto"
        );

    const preview =
        document.getElementById(
            "photoPreview"
        );

    const image =
        document.getElementById(
            "photoPreviewImage"
        );


    if (input)
        input.value = "";

    if (preview)
        preview.hidden = true;

    if (image)
        image.src = "";

}


/* =========================================================
   15. MODALS
========================================================= */

function setupModalControls() {

    document.querySelectorAll(
        "[data-close-modal]"
    ).forEach(
        element => {

            element.addEventListener(
                "click",
                () => {

                    const modal =
                        element.closest(
                            ".modal"
                        );

                    if (!modal) return;

                    closeModal(
                        modal.id
                    );

                }
            );

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !== "Escape"
            ) return;


            document
                .querySelectorAll(
                    ".modal.active"
                )
                .forEach(
                    modal => {

                        closeModal(
                            modal.id
                        );

                    }
                );

        }
    );

}


function openModal(id) {

    const modal =
        document.getElementById(id);

    if (!modal) return;


    modal.classList.add(
        "active"
    );

    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";

}


function closeModal(id) {

    const modal =
        document.getElementById(id);

    if (!modal) return;


    modal.classList.remove(
        "active"
    );

    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    if (
        !document.querySelector(
            ".modal.active"
        )
    ) {

        document.body.style.overflow =
            "";

    }

}


/* =========================================================
   16. BOTTOM NAV
========================================================= */

function setupBottomNavigation() {

    const buttons =
        document.querySelectorAll(
            ".bottom-nav-item"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const target =
                        button.dataset.nav;


                    buttons.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );

                    button.classList.add(
                        "active"
                    );


                    if (
                        target === "home"
                    ) {

                        scrollToSection(
                            "home"
                        );

                    }

                    else if (
                        target === "services"
                    ) {

                        scrollToSection(
                            "services"
                        );

                    }

                    else if (
                        target === "orders"
                    ) {

                        openModal(
                            "ordersModal"
                        );

                    }

                    else if (
                        target === "profile"
                    ) {

                        openModal(
                            "profileModal"
                        );

                    }

                }
            );

        }
    );

}


/* =========================================================
   SCROLL
========================================================= */

function scrollToSection(
    id
) {

    const element =
        document.getElementById(id);

    if (!element) return;

    element.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   17. FOOTER BUTTONS
========================================================= */

function setupFooterButtons() {

    const orderButton =
        document.getElementById(
            "footerOrderBtn"
        );

    const profileButton =
        document.getElementById(
            "footerProfileBtn"
        );


    if (orderButton) {

        orderButton.addEventListener(
            "click",
            () => {

                openModal(
                    "ordersModal"
                );

            }
        );

    }


    if (profileButton) {

        profileButton.addEventListener(
            "click",
            () => {

                openModal(
                    "profileModal"
                );

            }
        );

    }

}


/* =========================================================
   18. PROFILE
========================================================= */

function setupProfile() {

    const form =
        document.getElementById(
            "profileForm"
        );

    if (!form) return;


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const name =
                getValue(
                    "profileName"
                );

            const phone =
                getValue(
                    "profilePhone"
                );


            if (!name) {

                showToast(
                    "Nama belum diisi.",
                    "!"
                );

                return;

            }


            if (!isValidPhone(phone)) {

                showToast(
                    "Nomor WhatsApp tidak valid.",
                    "!"
                );

                return;

            }


            saveCustomer(
                name,
                phone
            );


            const customerName =
                document.getElementById(
                    "customerName"
                );

            const customerPhone =
                document.getElementById(
                    "customerPhone"
                );


            if (customerName)
                customerName.value =
                    name;

            if (customerPhone)
                customerPhone.value =
                    phone;


            showToast(
                "Profil berhasil disimpan.",
                "✓"
            );


            closeModal(
                "profileModal"
            );

        }
    );

}


/* =========================================================
   19. PARTNER REGISTRATION
========================================================= */

function setupPartnerForm() {

    const button =
        document.getElementById(
            "joinTechnicianBtn"
        );

    const form =
        document.getElementById(
            "technicianForm"
        );


    if (button) {

        button.addEventListener(
            "click",
            () => {

                openModal(
                    "technicianModal"
                );

            }
        );

    }


    if (!form) return;


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const name =
                getValue(
                    "technicianName"
                );

            const phone =
                getValue(
                    "technicianPhone"
                );

            const category =
                getValue(
                    "technicianCategory"
                );

            const address =
                getValue(
                    "technicianAddress"
                );


            if (!name) {

                showToast(
                    "Nama wajib diisi.",
                    "!"
                );

                return;

            }


            if (!isValidPhone(phone)) {

                showToast(
                    "Nomor WhatsApp tidak valid.",
                    "!"
                );

                return;

            }


            if (!category) {

                showToast(
                    "Pilih keahlian.",
                    "!"
                );

                return;

            }


            if (!address) {

                showToast(
                    "Area layanan wajib diisi.",
                    "!"
                );

                return;

            }


            if (
                WHATSAPP_NUMBER.includes(
                    "xxxxxxxxxx"
                )
            ) {

                showToast(
                    "Nomor WhatsApp admin belum diatur.",
                    "!"
                );

                return;

            }


            const message = `

*${APP_NAME} — PENDAFTARAN MITRA*

🤝 *Pendaftaran Mitra Baru*

👤 Nama:
${name}

📱 WhatsApp:
${phone}

🛠️ Keahlian:
${category}

📍 Area Layanan:
${address}

Saya ingin bergabung sebagai mitra ${APP_NAME}.

`.trim();


            const url =
                `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;


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
   20. NOTIFICATIONS
========================================================= */

function getNotifications() {

    try {

        const data =
            localStorage.getItem(
                STORAGE_NOTIFICATIONS
            );

        return data
            ? JSON.parse(data)
            : [];

    } catch {

        return [];

    }

}


function addNotification(
    message
) {

    const notifications =
        getNotifications();


    notifications.unshift({

        id: Date.now(),

        message,

        createdAt:
            new Date().toISOString(),

        read: false

    });


    localStorage.setItem(
        STORAGE_NOTIFICATIONS,
        JSON.stringify(
            notifications.slice(
                0,
                20
            )
        )
    );

}


/* =========================================================
   RENDER NOTIFICATIONS
========================================================= */

function renderNotifications() {

    const list =
        document.getElementById(
            "notificationList"
        );

    if (!list) return;


    const notifications =
        getNotifications();


    if (!notifications.length) {

        list.innerHTML = `

            <div class="notification-empty">

                <div>🔔</div>

                <h3>
                    Belum ada notifikasi
                </h3>

                <p>
                    Informasi pesanan akan
                    muncul di sini.
                </p>

            </div>

        `;

        return;

    }


    list.innerHTML = "";


    notifications.forEach(
        notification => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "notification-item";


            item.innerHTML = `

                <strong>
                    JASA KAMPUNG
                </strong>

                <p>
                    ${escapeHTML(
                        notification.message
                    )}
                </p>

                <small>
                    ${escapeHTML(
                        formatDateTime(
                            notification.createdAt
                        )
                    )}
                </small>

            `;


            list.appendChild(
                item
            );

        }
    );

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
        () => {

            openModal(
                "notificationModal"
            );


            markNotificationsRead();

        }
    );

}


function markNotificationsRead() {

    const notifications =
        getNotifications();


    notifications.forEach(
        item => {
            item.read = true;
        }
    );


    localStorage.setItem(
        STORAGE_NOTIFICATIONS,
        JSON.stringify(
            notifications
        )
    );


    updateNotificationBadge();

}


/* =========================================================
   BADGE
========================================================= */

function updateNotificationBadge() {

    const badge =
        document.getElementById(
            "notificationBadge"
        );

    if (!badge) return;


    const notifications =
        getNotifications();


    const unread =
        notifications.filter(
            item => !item.read
        ).length;


    badge.textContent =
        unread > 99
            ? "99+"
            : String(unread);


    badge.hidden =
        unread === 0;

}


/* =========================================================
   21. SHOW ALL SERVICES
========================================================= */

function setupShowAllServices() {

    const button =
        document.getElementById(
            "showAllServices"
        );

    if (!button) return;


    button.addEventListener(
        "click",
        () => {

            currentCategory =
                "Semua";


            document
                .querySelectorAll(
                    ".category-item"
                )
                .forEach(
                    item => {

                        item.classList.toggle(
                            "active",
                            item.dataset.category ===
                                "Semua"
                        );

                    }
                );


            const search =
                document.getElementById(
                    "serviceSearch"
                );


            if (search) {

                search.value = "";

                const clear =
                    document.getElementById(
                        "clearSearch"
                    );

                if (clear)
                    clear.hidden = true;

            }


            filterServices(
                "",
                "Semua"
            );


            scrollToSection(
                "services"
            );

        }
    );

}


/* =========================================================
   22. DATE
========================================================= */

function setMinimumDate() {

    const input =
        document.getElementById(
            "scheduleDate"
        );

    if (!input) return;


    const now =
        new Date();


    const offset =
        now.getTimezoneOffset();


    const local =
        new Date(
            now.getTime() -
            offset * 60000
        );


    input.min =
        local
            .toISOString()
            .slice(
                0,
                16
            );

}


function formatDateTime(
    value
) {

    if (!value)
        return "-";


    const date =
        new Date(value);


    if (Number.isNaN(
        date.getTime()
    )) {

        return value;

    }


    return date.toLocaleString(
        "id-ID",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =========================================================
   23. ORDER CODE
========================================================= */

function generateOrderCode() {

    const now =
        new Date();


    const date =
        now
            .toISOString()
            .slice(
                0,
                10
            )
            .replace(
                /-/g,
                ""
            );


    const random =
        Math.floor(
            1000 +
            Math.random() *
            9000
        );


    return `JK-${date}-${random}`;

}


/* =========================================================
   24. RUPIAH
========================================================= */

function formatRupiah(
    number
) {

    const value =
        Number(number) || 0;


    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }
    ).format(value);

}


/* =========================================================
   25. PHONE VALIDATION
========================================================= */

function isValidPhone(
    phone
) {

    const cleaned =
        phone.replace(
            /\D/g,
            ""
        );


    if (
        cleaned.length < 10 ||
        cleaned.length > 15
    ) {

        return false;

    }


    return (
        cleaned.startsWith("08") ||
        cleaned.startsWith("62") ||
        cleaned.startsWith("8")
    );

}


/* =========================================================
   26. GET VALUE
========================================================= */

function getValue(id) {

    const element =
        document.getElementById(id);

    if (!element)
        return "";

    return element.value.trim();

}


/* =========================================================
   27. FOCUS
========================================================= */

function focusElement(id) {

    const element =
        document.getElementById(id);

    if (!element) return;

    element.focus();

}


/* =========================================================
   28. ESCAPE HTML
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
   29. TOAST
========================================================= */

function showToast(
    message,
    icon = "✓"
) {

    const toast =
        document.getElementById(
            "toast"
        );

    const toastMessage =
        document.getElementById(
            "toastMessage"
        );

    const toastIcon =
        document.getElementById(
            "toastIcon"
        );


    if (!toast) return;


    if (toastMessage)
        toastMessage.textContent =
            message;


    if (toastIcon)
        toastIcon.textContent =
            icon;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );

}


/* =========================================================
   30. YEAR
========================================================= */

function updateYear() {

    const year =
        document.getElementById(
            "currentYear"
        );

    if (year) {

        year.textContent =
            new Date()
                .getFullYear();

    }

}


/* =========================================================
   31. PUBLIC API
========================================================= */

window.JasaKampung = {

    openBooking:
        openBookingModal,

    openOrders:
        () =>
            openModal(
                "ordersModal"
            ),

    openProfile:
        () =>
            openModal(
                "profileModal"
            ),

    getOrders,

    getCustomer:
        () =>
            currentCustomer

};