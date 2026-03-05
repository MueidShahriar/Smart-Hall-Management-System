/**
 * Common Sidebar Component
 * Shared by all student and admin pages
 * Usage: <script src="../../scripts/sidebar.js"></script>
 *        <script>initSidebar('student', 'dashboard');</script>
 */
(function () {
    'use strict';

    /* ── Navigation Links ───────────────────────── */
    const STUDENT_LINKS = [
        { icon: 'dashboard',      label: 'Dashboard',            href: 'StudentDashboard.html', key: 'dashboard' },
        { icon: 'person',         label: 'Profile',              href: 'profile.html',          key: 'profile' },
        { icon: 'payments',       label: 'Check Payments',       href: 'CheckPayments.html',    key: 'payments' },
        { icon: 'hotel',          label: 'Guest Room Booking',   href: 'GuestRoomBooking.html', key: 'booking' },
        { icon: 'restaurant_menu',label: 'Meal Management',      href: 'MealManagement.html',   key: 'meal' },
        { icon: 'touch_app',      label: 'Give Attendance',      href: 'Attendance.html',       key: 'attendance', id: 'sidebarAttendanceBtn' },
        { icon: 'report',         label: 'Complaints',           href: 'complainbox.html',      key: 'complaints' },
        { icon: 'description',    label: 'Notices & Documents',  href: 'Notices.html',          key: 'notices' },
        { icon: 'info',           label: 'About',                href: 'About.html',            key: 'about' },
    ];

    const ADMIN_LINKS = [
        { icon: 'dashboard',      label: 'Dashboard',       href: 'AdminDashboard.html',    key: 'dashboard' },
        { icon: 'meeting_room',   label: 'Room Allocation', href: 'room.html',              key: 'room' },
        { icon: 'school',         label: 'Student Info',    href: 'StudentInformation.html', key: 'student_info' },
        { icon: 'restaurant',     label: 'Meal Report',     href: 'mealreport.html',        key: 'meal_report' },
        { icon: 'co_present',     label: 'Attendance',      href: 'Attendance.html',        key: 'attendance' },
        { icon: 'report_problem', label: 'Complaints',      href: 'complaints.html',        key: 'complaints' },
        { icon: 'inbox',          label: 'Requests',        href: 'requests.html',          key: 'requests' },
        { icon: 'description',    label: 'Documents',       href: 'DocumentManagement.html', key: 'documents' },
    ];

    /* ── Helpers ─────────────────────────────────── */
    function getStudentId() {
        return new URLSearchParams(window.location.search).get('id');
    }

    function toast(msg, type) {
        if (typeof showToast === 'function') showToast(msg, type);
        else console.warn('[Sidebar]', msg);
    }

    /* ── Build HTML ──────────────────────────────── */
    function buildLinks(links, activePage, role) {
        const sid = getStudentId();
        return links.map(link => {
            let href = link.href;
            if (role === 'student' && sid && href !== '#') {
                href += (href.includes('?') ? '&' : '?') + 'id=' + sid;
            }
            const cls = link.key === activePage ? ' class="active"' : '';
            const id  = link.id ? ` id="${link.id}"` : '';
            return `<a href="${href}"${id}${cls}>
                <span class="material-icons">${link.icon}</span>
                <h3>${link.label}</h3>
            </a>`;
        }).join('');
    }

    function sidebarHTML(role, activePage) {
        const links = role === 'admin' ? ADMIN_LINKS : STUDENT_LINKS;
        return `
            <div class="top">
                <div class="logo">
                    <img src="../../images/RSM_Logo.png" alt="Smart Hall" />
                    <h2>Smart Hall</h2>
                </div>
                <div class="close" title="Close Sidebar">
                    <span class="material-icons">close</span>
                </div>
            </div>
            <div class="sidebar-label">MENU</div>
            <div class="sidebar">
                ${buildLinks(links, activePage, role)}
                <div class="sidebar-divider"></div>
                <a href="#" id="sidebarLogoutBtn" class="sidebar-logout">
                    <span class="material-icons">logout</span>
                    <h3>Logout</h3>
                </a>
                <p class="rsm">2025 ©️ RSM</p>
            </div>`;
    }

    /* ── Event Handlers ──────────────────────────── */
    function setupHandlers(role) {
        const menuBtn  = document.getElementById('menu_bar');
        const aside    = document.querySelector('.aside');
        const closeBtn = document.querySelector('.aside .close span');

        // Toggle sidebar (mobile)
        if (menuBtn && aside) {
            menuBtn.addEventListener('click', () => aside.classList.add('show'));
        }
        if (closeBtn && aside) {
            closeBtn.addEventListener('click', () => aside.classList.remove('show'));
        }

        // Close on outside click (mobile)
        document.addEventListener('click', e => {
            if (aside && aside.classList.contains('show') &&
                !aside.contains(e.target) &&
                e.target !== menuBtn && !menuBtn?.contains(e.target)) {
                aside.classList.remove('show');
            }
        });

        // Sidebar logout
        const logoutBtn = document.getElementById('sidebarLogoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', e => { e.preventDefault(); doLogout(); });
        }

        // Student: attendance button (no longer needed - navigates to page)
        // Keep compatibility - if on attendance page, don't intercept clicks

        // Admin: session guard
        if (role === 'admin' && !sessionStorage.getItem('userId')) {
            window.location.replace('../../index.html');
        }
    }

    function doLogout() {
        sessionStorage.clear();
        localStorage.clear();
        window.location.replace('../../index.html');
    }

    /* ── Attendance (Student) ────────────────────── */
    function handleAttendance() {
        const sid = getStudentId();
        if (!sid) { toast('User ID not found. Please log in again.', 'error'); return; }

        const h = new Date().getHours();
        if (h < 8 || h >= 20) { toast('Attendance can only be recorded between 8 AM – 8 PM.', 'warning'); return; }

        if (!navigator.geolocation) { toast('Geolocation not supported by this browser.', 'error'); return; }

        // Loading overlay
        const ov = document.createElement('div');
        ov.id = 'attendance-overlay';
        ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:9999;display:flex;align-items:center;justify-content:center';
        ov.innerHTML = `<div style="background:#fff;padding:2rem 2.5rem;border-radius:1rem;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,.2)">
            <span class="material-icons" style="font-size:2.5rem;color:#4f46e5;animation:spin 1.5s linear infinite">location_searching</span>
            <p style="margin-top:.8rem;font-weight:500">Verifying your location…</p></div>`;
        document.body.appendChild(ov);

        navigator.geolocation.getCurrentPosition(
            pos => {
                const dist = haversine(24.289440, 89.008940, pos.coords.latitude, pos.coords.longitude);
                ov.remove();
                if (dist <= 0.1) {
                    const d  = new Date();
                    const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                    saveAttendance(sid, ds, { latitude: pos.coords.latitude, longitude: pos.coords.longitude, timestamp: d.toISOString(), date: ds });
                } else {
                    toast(`You are ~${(dist * 1000).toFixed(0)} m away. Must be within 100 m of the hall.`, 'warning');
                }
            },
            err => {
                ov.remove();
                const m = { 1:'Location permission denied.', 2:'Location unavailable.', 3:'Location request timed out.' };
                toast(m[err.code] || 'Unknown location error.', 'error');
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }

    function haversine(lat1, lon1, lat2, lon2) {
        const R = 6371, r = Math.PI / 180;
        const dLat = (lat2 - lat1) * r, dLon = (lon2 - lon1) * r;
        const a = Math.sin(dLat/2)**2 + Math.cos(lat1*r) * Math.cos(lat2*r) * Math.sin(dLon/2)**2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    function saveAttendance(sid, dateStr, data) {
        const doSave = () => {
            firebase.firestore()
                .collection('attendance').doc(sid)
                .collection('attendance_by_date').doc(dateStr)
                .set(data)
                .then(() => toast('Attendance recorded successfully!', 'success'))
                .catch(e => { console.error('Attendance save:', e); toast('Failed to save attendance.', 'error'); });
        };

        if (window.firebase && typeof firebase.firestore === 'function') { doSave(); return; }

        // Dynamically load Firebase compat if needed
        const s1 = document.createElement('script');
        s1.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js';
        s1.onload = () => {
            const s2 = document.createElement('script');
            s2.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js';
            s2.onload = () => {
                if (!firebase.apps.length) {
                    firebase.initializeApp({
                        apiKey: "AIzaSyBF-nMMW5lG44JfHxx4HxCbf5N81geOiRs",
                        authDomain: "bauet-hms-63f5b.firebaseapp.com",
                        databaseURL: "https://bauet-hms-63f5b-default-rtdb.firebaseio.com",
                        projectId: "bauet-hms-63f5b",
                        storageBucket: "bauet-hms-63f5b.appspot.com",
                        messagingSenderId: "200038506273",
                        appId: "1:200038506273:web:2e141fc9ec36de049ae860"
                    });
                }
                doSave();
            };
            document.head.appendChild(s2);
        };
        document.head.appendChild(s1);
    }

    /* ── Right Panel HTML ───────────────────────── */
    function rightPanelHTML(activePage) {
        const showProfile = activePage !== 'profile';
        return `
            <div class="top">
                <button id="menu_bar" type="button" title="Menu">
                    <span class="material-icons">menu</span>
                </button>
                <div class="topbar-actions">
                    <button class="notification-btn topbar-btn" title="Notifications" type="button">
                        <span class="material-icons">notifications</span>
                        <span class="notif-badge" style="display:none">0</span>
                    </button>
                    ${showProfile ? `
                    <button class="profile-btn topbar-btn" title="Profile" type="button">
                        <img class="profile-btn-img" src="../../assets/img/profile-user.png" alt="Profile" />
                    </button>` : ''}
                </div>
            </div>
            <!-- Notification dropdown (hidden by default) -->
            <div class="notif-dropdown" style="display:none">
                <div class="notif-dropdown-header">
                    <h4>Notifications</h4>
                    <button class="notif-close-btn" type="button" title="Close">
                        <span class="material-icons">close</span>
                    </button>
                </div>
                <div class="notif-dropdown-body">
                    <p class="notif-empty">No notifications</p>
                </div>
            </div>`;
    }

    /* ── Firebase Compat Loader ──────────────────── */
    function ensureFirebaseCompat(modules, cb) {
        // modules = ['firestore','database'] etc.
        if (window.firebase && firebase.apps && firebase.apps.length) {
            // Check if requested modules are loaded
            const needs = modules.filter(m => typeof firebase[m] !== 'function');
            if (!needs.length) { cb(); return; }
            let loaded = 0;
            needs.forEach(m => {
                const s = document.createElement('script');
                s.src = `https://www.gstatic.com/firebasejs/8.10.1/firebase-${m}.js`;
                s.onload = () => { if (++loaded === needs.length) cb(); };
                document.head.appendChild(s);
            });
            return;
        }
        // Full bootstrap
        const s1 = document.createElement('script');
        s1.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js';
        s1.onload = () => {
            let loaded = 0;
            const total = modules.length;
            modules.forEach(m => {
                const s = document.createElement('script');
                s.src = `https://www.gstatic.com/firebasejs/8.10.1/firebase-${m}.js`;
                s.onload = () => {
                    if (++loaded === total) {
                        if (!firebase.apps.length) {
                            firebase.initializeApp({
                                apiKey: "AIzaSyBF-nMMW5lG44JfHxx4HxCbf5N81geOiRs",
                                authDomain: "bauet-hms-63f5b.firebaseapp.com",
                                databaseURL: "https://bauet-hms-63f5b-default-rtdb.firebaseio.com",
                                projectId: "bauet-hms-63f5b",
                                storageBucket: "bauet-hms-63f5b.appspot.com",
                                messagingSenderId: "200038506273",
                                appId: "1:200038506273:web:2e141fc9ec36de049ae860"
                            });
                        }
                        cb();
                    }
                };
                document.head.appendChild(s);
            });
        };
        document.head.appendChild(s1);
    }

    /* ── Notification System ─────────────────────── */
    let notifUnsubs = []; // store snapshot listeners to avoid duplicates

    function initNotifications(role) {
        const badge = document.querySelector('.notif-badge');
        const body  = document.querySelector('.notif-dropdown-body');
        const btn   = document.querySelector('.notification-btn');
        const dropdown = document.querySelector('.notif-dropdown');
        const closeBtn = document.querySelector('.notif-close-btn');
        if (!badge || !body || !btn || !dropdown) return;

        // Toggle dropdown on bell click
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const open = dropdown.style.display !== 'none';
            dropdown.style.display = open ? 'none' : 'block';
        });

        // Close button
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.style.display = 'none';
            });
        }

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });

        // Start listeners after Firebase loads
        const mods = ['firestore'];
        ensureFirebaseCompat(mods, () => {
            const db = firebase.firestore();
            if (role === 'admin') {
                startAdminNotifs(db, badge, body);
            } else {
                startStudentNotifs(db, badge, body);
            }
        });
    }

    function startAdminNotifs(db, badge, body) {
        const allNotifs = { sos: [], complaints: [], requests: [] };

        function render() {
            const items = [
                ...allNotifs.sos.map(n => ({ ...n, type: 'sos' })),
                ...allNotifs.complaints.map(n => ({ ...n, type: 'complaint' })),
                ...allNotifs.requests.map(n => ({ ...n, type: 'request' }))
            ];
            items.sort((a, b) => (b.time || 0) - (a.time || 0));

            badge.textContent = items.length;
            badge.style.display = items.length > 0 ? 'flex' : 'none';

            if (!items.length) {
                body.innerHTML = '<p class="notif-empty">No new notifications</p>';
                return;
            }
            body.innerHTML = items.slice(0, 30).map(n => {
                const icon = n.type === 'sos' ? 'emergency' : n.type === 'complaint' ? 'report_problem' : 'meeting_room';
                const cls  = n.type === 'sos' ? 'notif-sos' : n.type === 'complaint' ? 'notif-complaint' : 'notif-request';
                return `<div class="notif-item ${cls}">
                    <span class="material-icons notif-icon">${icon}</span>
                    <div class="notif-text">
                        <p class="notif-title">${escapeHTMLStr(n.title)}</p>
                        <p class="notif-sub">${escapeHTMLStr(n.sub)}</p>
                    </div>
                </div>`;
            }).join('');
        }

        // SOS alerts (pending)
        notifUnsubs.push(
            db.collection('sos_alerts').where('status', '==', 'pending')
              .onSnapshot(snap => {
                allNotifs.sos = [];
                snap.forEach(doc => {
                    const d = doc.data();
                    allNotifs.sos.push({
                        title: `SOS: ${d.studentName || 'Unknown'}`,
                        sub: `Room ${d.roomNumber || 'N/A'} · ${timeAgo(d.timestamp)}`,
                        time: d.timestamp ? new Date(d.timestamp).getTime() : 0
                    });
                });
                render();
            }, () => {})
        );

        // New complaints (last 24h)
        const yesterday = new Date(Date.now() - 86400000).toISOString();
        notifUnsubs.push(
            db.collection('Complaints').where('timestamp', '>=', yesterday)
              .onSnapshot(snap => {
                allNotifs.complaints = [];
                snap.forEach(doc => {
                    const d = doc.data();
                    allNotifs.complaints.push({
                        title: `Complaint: ${d.subject || 'No subject'}`,
                        sub: `${d.sector || ''} · ${timeAgo(d.timestamp)}`,
                        time: d.timestamp ? new Date(d.timestamp).getTime() : 0
                    });
                });
                render();
            }, () => {})
        );

        // Pending guest room requests
        notifUnsubs.push(
            db.collection('GuestRoomRequests').where('status', '==', 'pending')
              .onSnapshot(snap => {
                allNotifs.requests = [];
                snap.forEach(doc => {
                    const d = doc.data();
                    allNotifs.requests.push({
                        title: `Room Request: ${d.name || 'Guest'}`,
                        sub: `Check-in ${d.checkin || 'N/A'} · ${timeAgo(d.createdAt)}`,
                        time: d.createdAt ? new Date(d.createdAt).getTime() : 0
                    });
                });
                render();
            }, () => {})
        );
    }

    function startStudentNotifs(db, badge, body) {
        const sid = getStudentId();
        const allNotifs = { docs: [] };

        function render() {
            const items = allNotifs.docs.map(n => ({ ...n, type: 'doc' }));
            items.sort((a, b) => (b.time || 0) - (a.time || 0));

            badge.textContent = items.length;
            badge.style.display = items.length > 0 ? 'flex' : 'none';

            if (!items.length) {
                body.innerHTML = '<p class="notif-empty">No new notifications</p>';
                return;
            }
            body.innerHTML = items.slice(0, 20).map(n => {
                const icon = 'description';
                const cls  = 'notif-doc';
                return `<div class="notif-item ${cls}">
                    <span class="material-icons notif-icon">${icon}</span>
                    <div class="notif-text">
                        <p class="notif-title">${escapeHTMLStr(n.title)}</p>
                        <p class="notif-sub">${escapeHTMLStr(n.sub)}</p>
                    </div>
                </div>`;
            }).join('');
        }

        // Recent documents/notices (last 7 days)
        const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
        notifUnsubs.push(
            db.collection('documents').where('uploadDate', '>=', weekAgo)
              .onSnapshot(snap => {
                allNotifs.docs = [];
                snap.forEach(doc => {
                    const d = doc.data();
                    // Only show if visible to all or this student
                    if (d.visibility === 'all' || (d.visibility === 'specific' && d.specificStudents && d.specificStudents.includes(sid))) {
                        allNotifs.docs.push({
                            title: d.title || 'New Document',
                            sub: `${d.category || 'Notice'} · ${timeAgo(d.uploadDate)}`,
                            time: d.uploadDate ? new Date(d.uploadDate).getTime() : 0
                        });
                    }
                });
                render();
            }, () => {})
        );
    }

    /* ── Profile Photo Loader ────────────────────── */
    function initProfilePhoto(role) {
        const imgEl = document.querySelector('.profile-btn-img');
        if (!imgEl) return;

        // Click → navigate to profile page
        const profileBtn = document.querySelector('.profile-btn');
        if (profileBtn) {
            profileBtn.addEventListener('click', () => {
                const sid = getStudentId();
                if (role === 'student') {
                    window.location.href = sid ? `profile.html?id=${sid}` : 'profile.html';
                }
                // Admin: no profile page yet, do nothing
            });
        }

        // Load photo from RTDB
        const uid = role === 'student' ? getStudentId() : sessionStorage.getItem('userId');
        if (!uid) return;

        ensureFirebaseCompat(['database'], () => {
            firebase.database().ref(`users/${uid}/profile_image_url`).once('value')
                .then(snap => {
                    const url = snap.val();
                    if (url) imgEl.src = url;
                })
                .catch(() => {}); // silently fail, keep fallback
        });
    }

    /* ── Utility helpers ─────────────────────────── */
    function timeAgo(ts) {
        if (!ts) return '';
        const diff = Date.now() - new Date(ts).getTime();
        const min = Math.floor(diff / 60000);
        if (min < 1) return 'Just now';
        if (min < 60) return `${min}m ago`;
        const hr = Math.floor(min / 60);
        if (hr < 24) return `${hr}h ago`;
        const d = Math.floor(hr / 24);
        return `${d}d ago`;
    }

    function escapeHTMLStr(str) {
        if (!str) return '';
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    /* ── Public API ──────────────────────────────── */
    window.initSidebar = function (role, activePage) {
        const container = document.querySelector('.container');
        if (!container) return;

        // Remove any hardcoded sidebar
        const old = container.querySelector('.aside');
        if (old) old.remove();

        // Create & inject sidebar
        const aside = document.createElement('aside');
        aside.className = 'aside';
        aside.innerHTML = sidebarHTML(role, activePage);
        container.prepend(aside);

        // Remove any hardcoded right panel and inject standardized one
        const oldRight = container.querySelector('.right');
        if (oldRight) oldRight.remove();

        const right = document.createElement('div');
        right.className = 'right';
        right.innerHTML = rightPanelHTML(activePage);
        container.appendChild(right);

        setupHandlers(role);

        // Initialize notification system & profile photo
        initNotifications(role);
        initProfilePhoto(role);
    };

})();
