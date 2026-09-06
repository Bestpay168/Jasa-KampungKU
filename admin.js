/* =========================================================
   JASA KAMPUNG — ADMIN.JS
   Supabase Auth + Orders + Services + Customers
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       CONFIG
    ===================================================== */

    const supabase = window.JasaKampungSupabase;

    if (!supabase) {
        console.error("Supabase belum tersedia.");
        return;
    }


    /* =====================================================
       STATE
    ===================================================== */

    let currentUser = null;
    let currentOrder = null;
    let currentService = null;

    let allOrders = [];
    let allServices = [];
    let allCustomers = [];

    let toastTimer = null;


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const sidebar =
        document.getElementById("sidebar");

    const sidebarOverlay =
        document.getElementById("sidebarOverlay");

    const mobileMenuButton =
        document.getElementById("mobileMenuButton");

    const logoutButton =
        document.getElementById("logoutButton");

    const adminName =
        document.getElementById("adminName");

    const adminEmail =
        document.getElementById("adminEmail");

    const pageTitle =
        document.getElementById("pageTitle");

    const pageSubtitle =
        document.getElementById("pageSubtitle");

    const adminMessage =
        document.getElementById("adminMessage");

    const adminToast =
        document.getElementById("adminToast");

    const adminToastIcon =
        document.getElementById("adminToastIcon");

    const adminToastMessage =
        document.getElementById("adminToastMessage");


    /* =====================================================
       INIT
    ===================================================== */

    init();


    async function init() {

        try {

            const {
                data: {
                    session
                }
            } = await supabase.auth.getSession();


            /* ---------------------------------------------
               BELUM LOGIN
            --------------------------------------------- */

            if (!session) {

                window.location.href =
                    "admin-login.html";

                return;
            }


            /* ---------------------------------------------
               CEK ADMIN
            --------------------------------------------- */

            const isAdmin =
                await checkAdmin(
                    session.user.id
                );


            if (!isAdmin) {

                await supabase.auth.signOut();

                window.location.href =
                    "admin-login.html";

                return;
            }


            currentUser =
                session.user;


            /* ---------------------------------------------
               ADMIN INFO
            --------------------------------------------- */

            showAdminInfo(
                currentUser
            );


            /* ---------------------------------------------
               LOAD DATA
            --------------------------------------------- */

            await Promise.all([
                loadOrders(),
                loadServices(),
                loadCustomers()
            ]);


            /* ---------------------------------------------
               EVENT
            --------------------------------------------- */

            setupNavigation();
            setupMobileMenu();
            setupFilters();
            setupRefreshButtons();
            setupModals();
            setupLogout();


            /* ---------------------------------------------
               DASHBOARD
            --------------------------------------------- */

            updateDashboard();


        } catch (error) {

            console.error(
                "Admin initialization error:",
                error
            );

            showMessage(
                "error",
                "Gagal memuat dashboard admin."
            );
        }
    }


    /* =====================================================
       CHECK ADMIN
    ===================================================== */

    async function checkAdmin(userId) {

        try {

            const {
                data,
                error
            } = await supabase
                .from("admin_users")
                .select("user_id")
                .eq(
                    "user_id",
                    userId
                )
                .maybeSingle();


            if (error) {

                console.error(
                    "Admin check:",
                    error
                );

                return false;
            }


            return !!data;

        } catch (error) {

            console.error(error);

            return false;
        }
    }


    /* =====================================================
       ADMIN INFO
    ===================================================== */

    function showAdminInfo(user) {

        const email =
            user?.email || "Admin";

        adminEmail.textContent =
            email;

        adminName.textContent =
            user?.user_metadata?.name ||
            "Admin";

        const firstLetter =
            (
                user?.user_metadata?.name ||
                email ||
                "A"
            )
            .charAt(0)
            .toUpperCase();

        const avatar =
            document.querySelector(
                ".admin-avatar"
            );

        if (avatar) {
            avatar.textContent =
                firstLetter;
        }
    }


    /* =====================================================
       LOAD ORDERS
    ===================================================== */

    async function loadOrders() {

        const container =
            document.getElementById(
                "ordersList"
            );

        if (container) {

            container.innerHTML =
                `<div class="loading-state">
                    Memuat pesanan...
                </div>`;
        }


        const {
            data,
            error
        } = await supabase
            .from("orders")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            console.error(
                "Load orders:",
                error
            );

            if (container) {

                container.innerHTML =
                    `<div class="empty-state">
                        Gagal memuat pesanan.
                    </div>`;
            }

            return;
        }


        allOrders =
            data || [];


        renderOrders(
            allOrders
        );

        renderLatestOrders(
            allOrders
        );

        updateDashboard();
    }


    /* =====================================================
       LOAD SERVICES
    ===================================================== */

    async function loadServices() {

        const container =
            document.getElementById(
                "servicesList"
            );

        if (container) {

            container.innerHTML =
                `<div class="loading-state">
                    Memuat layanan...
                </div>`;
        }


        const {
            data,
            error
        } = await supabase
            .from("services")
            .select("*")
            .order(
                "category",
                {
                    ascending: true
                }
            )
            .order(
                "price",
                {
                    ascending: true
                }
            );


        if (error) {

            console.error(
                "Load services:",
                error
            );

            if (container) {

                container.innerHTML =
                    `<div class="empty-state">
                        Gagal memuat layanan.
                    </div>`;
            }

            return;
        }


        allServices =
            data || [];


        renderServices(
            allServices
        );

        updateDashboard();
    }


    /* =====================================================
       LOAD CUSTOMERS
    ===================================================== */

    async function loadCustomers() {

        const container =
            document.getElementById(
                "customersList"
            );

        if (container) {

            container.innerHTML =
                `<div class="loading-state">
                    Memuat pelanggan...
                </div>`;
        }


        const {
            data,
            error
        } = await supabase
            .from("customers")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            console.error(
                "Load customers:",
                error
            );

            if (container) {

                container.innerHTML =
                    `<div class="empty-state">
                        Gagal memuat pelanggan.
                    </div>`;
            }

            return;
        }


        allCustomers =
            data || [];


        renderCustomers(
            allCustomers
        );
    }


    /* =====================================================
       DASHBOARD
    ===================================================== */

    function updateDashboard() {

        const total =
            allOrders.length;


        const pending =
            countStatus(
                "Menunggu"
            );


        const processing =
            countStatus(
                "Diproses"
            );


        const completed =
            countStatus(
                "Selesai"
            );


        const cancelled =
            countStatus(
                "Dibatalkan"
            );


        const revenue =
            allOrders
                .filter(
                    order =>
                        order.status ===
                        "Selesai"
                )
                .reduce(
                    (
                        total,
                        order
                    ) =>
                        total +
                        Number(
                            order.service_price
                        || 0
                        ),
                    0
                );


        setText(
            "statTotalOrders",
            total
        );

        setText(
            "statPendingOrders",
            pending
        );

        setText(
            "statProcessingOrders",
            processing
        );

        setText(
            "statCompletedOrders",
            completed
        );

        setText(
            "statCancelledOrders",
            cancelled
        );

        setText(
            "statRevenue",
            formatRupiah(
                revenue
            )
        );


        /* PAYMENT */

        setText(
            "paymentUnpaid",
            countPaymentStatus(
                "Belum Dibayar"
            )
        );

        setText(
            "paymentWaiting",
            countPaymentStatus(
                "Menunggu Verifikasi"
            )
        );

        setText(
            "paymentPaid",
            countPaymentStatus(
                "Lunas"
            )
        );


        /* SIDEBAR BADGE */

        setText(
            "sidebarOrderBadge",
            pending
        );
    }


    function countStatus(status) {

        return allOrders.filter(
            order =>
                order.status === status
        ).length;
    }


    function countPaymentStatus(status) {

        return allOrders.filter(
            order =>
                order.payment_status ===
                status
        ).length;
    }


    /* =====================================================
       RENDER ORDERS
    ===================================================== */

    function renderOrders(
        orders
    ) {

        const container =
            document.getElementById(
                "ordersList"
            );

        if (!container) {
            return;
        }


        if (!orders.length) {

            container.innerHTML =
                `<div class="empty-state">
                    Belum ada pesanan.
                </div>`;

            return;
        }


        container.innerHTML =
            orders.map(
                order =>
                    createOrderCard(
                        order
                    )
            ).join("");


        container
            .querySelectorAll(
                ".order-card"
            )
            .forEach(
                card => {

                    card.addEventListener(
                        "click",
                        () => {

                            const id =
                                card.dataset.id;

                            const order =
                                allOrders.find(
                                    item =>
                                        item.id ===
                                        id
                                );

                            if (order) {
                                openOrderModal(
                                    order
                                );
                            }
                        }
                    );
                }
            );
    }


    function createOrderCard(
        order
    ) {

        const statusClass =
            getStatusClass(
                order.status
            );


        const paymentClass =
            getPaymentClass(
                order.payment_status
            );


        return `
            <article
                class="order-card"
                data-id="${escapeHtml(
                    order.id
                )}"
            >

                <div class="order-card-top">

                    <div>
                        <div class="order-code">
                            ${escapeHtml(
                                order.order_code ||
                                "-"
                            )}
                        </div>

                        <div class="order-date">
                            ${formatDate(
                                order.created_at
                            )}
                        </div>
                    </div>

                    <span
                        class="status-badge ${statusClass}"
                    >
                        ${escapeHtml(
                            order.status ||
                            "Menunggu"
                        )}
                    </span>

                </div>


                <div class="order-service">
                    ${escapeHtml(
                        order.service_name ||
                        "-"
                    )}
                </div>


                <div class="order-customer">
                    👤 ${escapeHtml(
                        order.customer_name ||
                        "-"
                    )}
                    ·
                    ${escapeHtml(
                        order.customer_phone ||
                        "-"
                    )}
                </div>


                <div class="order-meta">

                    <span
                        class="payment-badge ${paymentClass}"
                    >
                        💳
                        ${escapeHtml(
                            order.payment_status ||
                            "Belum Dibayar"
                        )}
                    </span>

                    <span class="payment-badge">
                        ${escapeHtml(
                            order.payment_method ||
                            "COD"
                        )}
                    </span>

                </div>


                <div class="order-price">
                    ${formatRupiah(
                        order.service_price
                    )}
                </div>

            </article>
        `;
    }


    /* =====================================================
       LATEST ORDERS
    ===================================================== */

    function renderLatestOrders(
        orders
    ) {

        const container =
            document.getElementById(
                "latestOrders"
            );

        if (!container) {
            return;
        }


        const latest =
            orders.slice(
                0,
                5
            );


        if (!latest.length) {

            container.innerHTML =
                `<div class="empty-state">
                    Belum ada pesanan.
                </div>`;

            return;
        }


        container.innerHTML =
            latest.map(
                order =>
                    `
                    <div
                        class="latest-order-item"
                        data-order-id="${escapeHtml(
                            order.id
                        )}"
                    >

                        <div class="latest-order-top">

                            <span class="latest-order-code">
                                ${escapeHtml(
                                    order.order_code ||
                                    "-"
                                )}
                            </span>

                            <span
                                class="status-badge ${getStatusClass(
                                    order.status
                                )}"
                            >
                                ${escapeHtml(
                                    order.status ||
                                    "Menunggu"
                                )}
                            </span>

                        </div>

                        <div class="latest-order-name">
                            ${escapeHtml(
                                order.customer_name ||
                                "-"
                            )}
                        </div>

                        <div class="latest-order-service">
                            ${escapeHtml(
                                order.service_name ||
                                "-"
                            )}
                        </div>

                    </div>
                    `
            ).join("");


        container
            .querySelectorAll(
                ".latest-order-item"
            )
            .forEach(
                item => {

                    item.addEventListener(
                        "click",
                        () => {

                            const order =
                                allOrders.find(
                                    order =>
                                        order.id ===
                                        item.dataset.orderId
                                );

                            if (order) {

                                openOrderModal(
                                    order
                                );
                            }
                        }
                    );
                }
            );
    }


    /* =====================================================
       RENDER SERVICES
    ===================================================== */

    function renderServices(
        services
    ) {

        const container =
            document.getElementById(
                "servicesList"
            );

        if (!container) {
            return;
        }


        if (!services.length) {

            container.innerHTML =
                `<div class="empty-state">
                    Belum ada layanan.
                </div>`;

            return;
        }


        container.innerHTML =
            services.map(
                service =>
                    `
                    <article
                        class="service-admin-card"
                    >

                        <div class="service-admin-top">

                            <div>

                                <div class="service-admin-name">
                                    ${escapeHtml(
                                        service.name
                                    )}
                                </div>

                                <div class="service-admin-category">
                                    ${escapeHtml(
                                        service.category
                                    )}
                                </div>

                            </div>


                            ${
                                service.active
                                    ? `
                                    <span class="service-active">
                                        ● Aktif
                                    </span>
                                    `
                                    : `
                                    <span class="service-inactive">
                                        ● Nonaktif
                                    </span>
                                    `
                            }

                        </div>


                        <div class="service-admin-price">
                            ${formatRupiah(
                                service.price
                            )}
                        </div>


                        <div class="service-admin-actions">

                            <button
                                class="edit-service-button"
                                data-service-id="${escapeHtml(
                                    service.id
                                )}"
                            >
                                ✏️ Edit
                            </button>

                        </div>

                    </article>
                    `
            ).join("");


        container
            .querySelectorAll(
                ".edit-service-button"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        event => {

                            event.stopPropagation();

                            const service =
                                allServices.find(
                                    item =>
                                        item.id ===
                                        button.dataset.serviceId
                                );

                            if (service) {

                                openServiceModal(
                                    service
                                );
                            }
                        }
                    );
                }
            );
    }


    /* =====================================================
       RENDER CUSTOMERS
    ===================================================== */

    function renderCustomers(
        customers
    ) {

        const container =
            document.getElementById(
                "customersList"
            );

        if (!container) {
            return;
        }


        if (!customers.length) {

            container.innerHTML =
                `<div class="empty-state">
                    Belum ada data pelanggan.
                </div>`;

            return;
        }


        container.innerHTML =
            customers.map(
                customer =>
                    `
                    <article class="customer-card">

                        <div class="customer-avatar">
                            ${escapeHtml(
                                (
                                    customer.name ||
                                    "P"
                                )
                                .charAt(0)
                                .toUpperCase()
                            )}
                        </div>

                        <div class="customer-info">

                            <strong>
                                ${escapeHtml(
                                    customer.name ||
                                    "-"
                                )}
                            </strong>

                            <span>
                                📱
                                ${escapeHtml(
                                    customer.phone ||
                                    "-"
                                )}
                            </span>

                            <small>
                                Terdaftar:
                                ${formatDate(
                                    customer.created_at
                                )}
                            </small>

                        </div>

                    </article>
                    `
            ).join("");
    }


    /* =====================================================
       NAVIGATION
    ===================================================== */

    function setupNavigation() {

        document
            .querySelectorAll(
                "[data-section]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const section =
                                button.dataset.section;

                            if (!section) {
                                return;
                            }

                            switchSection(
                                section
                            );
                        }
                    );
                }
            );
    }


    function switchSection(
        section
    ) {

        document
            .querySelectorAll(
                ".admin-section"
            )
            .forEach(
                element => {

                    element.classList.remove(
                        "active"
                    );
                }
            );


        const target =
            document.getElementById(
                `section-${section}`
            );


        if (target) {

            target.classList.add(
                "active"
            );
        }


        document
            .querySelectorAll(
                ".menu-item"
            )
            .forEach(
                item => {

                    item.classList.toggle(
                        "active",
                        item.dataset.section ===
                        section
                    );
                }
            );


        const titles = {

            dashboard: [
                "Dashboard",
                "Ringkasan JASA KAMPUNG hari ini"
            ],

            orders: [
                "Pesanan",
                "Kelola pesanan pelanggan"
            ],

            services: [
                "Layanan",
                "Atur harga dan status layanan"
            ],

            customers: [
                "Pelanggan",
                "Data pelanggan JASA KAMPUNG"
            ]
        };


        if (titles[section]) {

            pageTitle.textContent =
                titles[section][0];

            pageSubtitle.textContent =
                titles[section][1];
        }


        closeSidebar();
    }


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    function setupMobileMenu() {

        if (mobileMenuButton) {

            mobileMenuButton.addEventListener(
                "click",
                openSidebar
            );
        }


        if (sidebarOverlay) {

            sidebarOverlay.addEventListener(
                "click",
                closeSidebar
            );
        }
    }


    function openSidebar() {

        sidebar.classList.add(
            "open"
        );

        sidebarOverlay.classList.add(
            "show"
        );
    }


    function closeSidebar() {

        sidebar.classList.remove(
            "open"
        );

        sidebarOverlay.classList.remove(
            "show"
        );
    }


    /* =====================================================
       FILTERS
    ===================================================== */

    function setupFilters() {

        const search =
            document.getElementById(
                "orderSearch"
            );

        const status =
            document.getElementById(
                "orderStatusFilter"
            );

        const payment =
            document.getElementById(
                "paymentStatusFilter"
            );


        if (search) {

            search.addEventListener(
                "input",
                filterOrders
            );
        }


        if (status) {

            status.addEventListener(
                "change",
                filterOrders
            );
        }


        if (payment) {

            payment.addEventListener(
                "change",
                filterOrders
            );
        }


        const customerSearch =
            document.getElementById(
                "customerSearch"
            );


        if (customerSearch) {

            customerSearch.addEventListener(
                "input",
                filterCustomers
            );
        }
    }


    function filterOrders() {

        const search =
            (
                document.getElementById(
                    "orderSearch"
                )?.value ||
                ""
            )
            .trim()
            .toLowerCase();


        const status =
            document.getElementById(
                "orderStatusFilter"
            )?.value ||
            "Semua";


        const payment =
            document.getElementById(
                "paymentStatusFilter"
            )?.value ||
            "Semua";


        const filtered =
            allOrders.filter(
                order => {

                    const searchable = [
                        order.order_code,
                        order.customer_name,
                        order.customer_phone,
                        order.service_name
                    ]
                    .join(" ")
                    .toLowerCase();


                    const matchSearch =
                        !search ||
                        searchable.includes(
                            search
                        );


                    const matchStatus =
                        status === "Semua" ||
                        order.status ===
                        status;


                    const matchPayment =
                        payment === "Semua" ||
                        order.payment_status ===
                        payment;


                    return (
                        matchSearch &&
                        matchStatus &&
                        matchPayment
                    );
                }
            );


        renderOrders(
            filtered
        );
    }


    function filterCustomers() {

        const search =
            (
                document.getElementById(
                    "customerSearch"
                )?.value ||
                ""
            )
            .trim()
            .toLowerCase();


        const filtered =
            allCustomers.filter(
                customer => {

                    const searchable = [
                        customer.name,
                        customer.phone
                    ]
                    .join(" ")
                    .toLowerCase();


                    return (
                        !search ||
                        searchable.includes(
                            search
                        )
                    );
                }
            );


        renderCustomers(
            filtered
        );
    }


    /* =====================================================
       REFRESH
    ===================================================== */

    function setupRefreshButtons() {

        document
            .getElementById(
                "refreshDashboard"
            )
            ?.addEventListener(
                "click",
                refreshAll
            );


        document
            .getElementById(
                "refreshOrders"
            )
            ?.addEventListener(
                "click",
                async () => {

                    await loadOrders();

                    showToast(
                        "Pesanan diperbarui."
                    );
                }
            );


        document
            .getElementById(
                "refreshServices"
            )
            ?.addEventListener(
                "click",
                async () => {

                    await loadServices();

                    showToast(
                        "Layanan diperbarui."
                    );
                }
            );


        document
            .getElementById(
                "refreshCustomers"
            )
            ?.addEventListener(
                "click",
                async () => {

                    await loadCustomers();

                    showToast(
                        "Pelanggan diperbarui."
                    );
                }
            );
    }


    async function refreshAll() {

        await Promise.all([
            loadOrders(),
            loadServices(),
            loadCustomers()
        ]);

        updateDashboard();

        showToast(
            "Dashboard diperbarui."
        );
    }


    /* =====================================================
       ORDER MODAL
    ===================================================== */

    function openOrderModal(
        order
    ) {

        currentOrder =
            order;


        setText(
            "detailOrderCode",
            order.order_code || "-"
        );

        setText(
            "detailService",
            order.service_name || "-"
        );

        setText(
            "detailPrice",
            formatRupiah(
                order.service_price
            )
        );

        setText(
            "detailPaymentMethod",
            order.payment_method ||
            "COD"
        );

        setText(
            "detailCustomerName",
            order.customer_name ||
            "-"
        );

        setText(
            "detailCustomerPhone",
            order.customer_phone ||
            "-"
        );

        setText(
            "detailAddress",
            order.address ||
            "-"
        );

        setText(
            "detailProblem",
            order.problem ||
            "-"
        );

        setText(
            "detailSchedule",
            order.schedule
                ? formatDate(
                    order.schedule
                )
                : "-"
        );

        setText(
            "detailPhoto",
            order.photo_name ||
            "Tidak ada"
        );


        const status =
            document.getElementById(
                "detailOrderStatus"
            );

        const payment =
            document.getElementById(
                "detailPaymentStatus"
            );


        if (status) {

            status.value =
                order.status ||
                "Menunggu";
        }


        if (payment) {

            payment.value =
                order.payment_status ||
                "Belum Dibayar";
        }


        openModal(
            "orderDetailModal"
        );
    }


    /* =====================================================
       SAVE ORDER
    ===================================================== */

    async function saveOrder() {

        if (!currentOrder) {
            return;
        }


        const newStatus =
            document.getElementById(
                "detailOrderStatus"
            )?.value;


        const newPaymentStatus =
            document.getElementById(
                "detailPaymentStatus"
            )?.value;


        if (!newStatus ||
            !newPaymentStatus) {

            showToast(
                "Status belum lengkap.",
                "error"
            );

            return;
        }


        const button =
            document.getElementById(
                "saveOrderButton"
            );


        setButtonLoading(
            button,
            true,
            "Menyimpan..."
        );


        try {

            const {
                data,
                error
            } = await supabase
                .from("orders")
                .update({
                    status:
                        newStatus,

                    payment_status:
                        newPaymentStatus,

                    updated_at:
                        new Date().toISOString()
                })
                .eq(
                    "id",
                    currentOrder.id
                )
                .select("*")
                .single();


            if (error) {
                throw error;
            }


            /* UPDATE LOCAL */

            const index =
                allOrders.findIndex(
                    order =>
                        order.id ===
                        currentOrder.id
                );


            if (index !== -1) {

                allOrders[index] =
                    data;
            }


            currentOrder =
                data;


            renderOrders(
                allOrders
            );

            renderLatestOrders(
                allOrders
            );

            updateDashboard();


            closeModal(
                "orderDetailModal"
            );


            showToast(
                "Pesanan berhasil diperbarui."
            );


        } catch (error) {

            console.error(
                "Save order:",
                error
            );

            showToast(
                "Gagal menyimpan pesanan.",
                "error"
            );

        } finally {

            setButtonLoading(
                button,
                false,
                "💾 Simpan Perubahan"
            );
        }
    }


    /* =====================================================
       SERVICE MODAL
    ===================================================== */

    function openServiceModal(
        service
    ) {

        currentService =
            service;


        setValue(
            "editServiceId",
            service.id
        );

        setValue(
            "editServiceName",
            service.name
        );

        setValue(
            "editServiceCategory",
            service.category
        );

        setValue(
            "editServicePrice",
            service.price
        );


        const active =
            document.getElementById(
                "editServiceActive"
            );


        if (active) {

            active.checked =
                !!service.active;
        }


        openModal(
            "serviceModal"
        );
    }


    /* =====================================================
       SAVE SERVICE
    ===================================================== */

    async function saveService() {

        if (!currentService) {
            return;
        }


        const priceInput =
            document.getElementById(
                "editServicePrice"
            );

        const activeInput =
            document.getElementById(
                "editServiceActive"
            );


        const price =
            Number(
                priceInput?.value
            );


        const active =
            !!activeInput?.checked;


        if (
            !Number.isFinite(price) ||
            price < 0
        ) {

            showToast(
                "Harga tidak valid.",
                "error"
            );

            return;
        }


        const button =
            document.getElementById(
                "saveServiceButton"
            );


        setButtonLoading(
            button,
            true,
            "Menyimpan..."
        );


        try {

            const {
                data,
                error
            } = await supabase
                .from("services")
                .update({
                    price:
                        Math.round(
                            price
                        ),

                    active:
                        active,

                    updated_at:
                        new Date().toISOString()
                })
                .eq(
                    "id",
                    currentService.id
                )
                .select("*")
                .single();


            if (error) {
                throw error;
            }


            const index =
                allServices.findIndex(
                    service =>
                        service.id ===
                        currentService.id
                );


            if (index !== -1) {

                allServices[index] =
                    data;
            }


            renderServices(
                allServices
            );


            closeModal(
                "serviceModal"
            );


            showToast(
                "Layanan berhasil diperbarui."
            );


        } catch (error) {

            console.error(
                "Save service:",
                error
            );

            showToast(
                "Gagal menyimpan layanan.",
                "error"
            );

        } finally {

            setButtonLoading(
                button,
                false,
                "💾 Simpan"
            );
        }
    }


    /* =====================================================
       MODALS
    ===================================================== */

    function setupModals() {

        document
            .querySelectorAll(
                "[data-close-modal]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            closeModal(
                                button.dataset.closeModal
                            );
                        }
                    );
                }
            );


        document
            .querySelectorAll(
                ".modal-overlay"
            )
            .forEach(
                overlay => {

                    overlay.addEventListener(
                        "click",
                        () => {

                            const modal =
                                overlay.closest(
                                    ".modal"
                                );

                            if (modal) {

                                closeModal(
                                    modal.id
                                );
                            }
                        }
                    );
                }
            );


        document
            .getElementById(
                "saveOrderButton"
            )
            ?.addEventListener(
                "click",
                saveOrder
            );


        document
            .getElementById(
                "saveServiceButton"
            )
            ?.addEventListener(
                "click",
                saveService
            );


        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Escape"
                ) {

                    document
                        .querySelectorAll(
                            ".modal.show"
                        )
                        .forEach(
                            modal => {

                                closeModal(
                                    modal.id
                                );
                            }
                        );
                }
            }
        );
    }


    function openModal(
        id
    ) {

        const modal =
            document.getElementById(
                id
            );


        if (!modal) {
            return;
        }


        modal.classList.add(
            "show"
        );

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.style.overflow =
            "hidden";
    }


    function closeModal(
        id
    ) {

        const modal =
            document.getElementById(
                id
            );


        if (!modal) {
            return;
        }


        modal.classList.remove(
            "show"
        );

        modal.setAttribute(
            "aria-hidden",
            "true"
        );


        if (
            !document.querySelector(
                ".modal.show"
            )
        ) {

            document.body.style.overflow =
                "";
        }
    }


    /* =====================================================
       LOGOUT
    ===================================================== */

    function setupLogout() {

        if (!logoutButton) {
            return;
        }


        logoutButton.addEventListener(
            "click",
            async () => {

                const confirmed =
                    window.confirm(
                        "Yakin ingin keluar dari dashboard admin?"
                    );


                if (!confirmed) {
                    return;
                }


                const {
                    error
                } =
                    await supabase.auth.signOut();


                if (error) {

                    console.error(
                        "Logout:",
                        error
                    );

                    showToast(
                        "Gagal keluar.",
                        "error"
                    );

                    return;
                }


                window.location.href =
                    "admin-login.html";
            }
        );
    }


    /* =====================================================
       AUTH STATE
    ===================================================== */

    supabase.auth.onAuthStateChange(
        async (
            event,
            session
        ) => {

            if (
                event ===
                "SIGNED_OUT"
            ) {

                window.location.href =
                    "admin-login.html";

                return;
            }


            if (
                event ===
                "TOKEN_REFRESHED" &&
                !session
            ) {

                window.location.href =
                    "admin-login.html";
            }
        }
    );


    /* =====================================================
       MESSAGE
    ===================================================== */

    function showMessage(
        type,
        text
    ) {

        if (!adminMessage) {
            return;
        }


        adminMessage.className =
            `admin-message show ${type}`;

        adminMessage.textContent =
            text;
    }


    /* =====================================================
       TOAST
    ===================================================== */

    function showToast(
        text,
        type = "success"
    ) {

        if (!adminToast) {
            return;
        }


        clearTimeout(
            toastTimer
        );


        adminToastMessage.textContent =
            text;


        if (type === "error") {

            adminToastIcon.textContent =
                "×";

            adminToastIcon.style.background =
                "var(--danger)";

        } else {

            adminToastIcon.textContent =
                "✓";

            adminToastIcon.style.background =
                "var(--success)";
        }


        adminToast.classList.add(
            "show"
        );


        toastTimer =
            setTimeout(
                () => {

                    adminToast.classList.remove(
                        "show"
                    );

                },
                3000
            );
    }


    /* =====================================================
       HELPERS
    ===================================================== */

    function setText(
        id,
        value
    ) {

        const element =
            document.getElementById(
                id
            );


        if (element) {

            element.textContent =
                value ?? "-";
        }
    }


    function setValue(
        id,
        value
    ) {

        const element =
            document.getElementById(
                id
            );


        if (element) {

            element.value =
                value ?? "";
        }
    }


    function setButtonLoading(
        button,
        loading,
        loadingText
    ) {

        if (!button) {
            return;
        }


        if (loading) {

            button.disabled =
                true;

            button.dataset.originalText =
                button.innerHTML;

            button.innerHTML =
                loadingText;

        } else {

            button.disabled =
                false;

            button.innerHTML =
                button.dataset.originalText ||
                loadingText;
        }
    }


    function formatRupiah(
        number
    ) {

        return new Intl.NumberFormat(
            "id-ID",
            {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0
            }
        ).format(
            Number(number) || 0
        );
    }


    function formatDate(
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

            return "-";
        }


        return new Intl.DateTimeFormat(
            "id-ID",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",

                hour: "2-digit",
                minute: "2-digit"
            }
        ).format(
            date
        );
    }


    function getStatusClass(
        status
    ) {

        switch (status) {

            case "Menunggu":
                return "status-menunggu";

            case "Diproses":
                return "status-diproses";

            case "Selesai":
                return "status-selesai";

            case "Dibatalkan":
                return "status-dibatalkan";

            default:
                return "status-menunggu";
        }
    }


    function getPaymentClass(
        status
    ) {

        switch (status) {

            case "Lunas":
                return "payment-lunas";

            case "Menunggu Verifikasi":
                return "payment-verifikasi";

            case "Dibatalkan":
                return "payment-belum";

            case "Belum Dibayar":
            default:
                return "payment-belum";
        }
    }


    function escapeHtml(
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

});