import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyBF-nMMW5lG44JfHxx4HxCbf5N81geOiRs",
    authDomain: "bauet-hms-63f5b.firebaseapp.com",
    databaseURL: "https://bauet-hms-63f5b-default-rtdb.firebaseio.com",
    projectId: "bauet-hms-63f5b",
    storageBucket: "bauet-hms-63f5b.appspot.com",
    messagingSenderId: "200038506273",
    appId: "1:200038506273:web:2e141fc9ec36de049ae860"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const firestore = getFirestore(app);

// Get student ID from URL
const urlParams = new URLSearchParams(window.location.search);
const studentId = urlParams.get('id');

document.addEventListener("DOMContentLoaded", () => {
    const guestForm = document.getElementById("guestRoomForm");
    if (!guestForm) return;

    // Set min dates for check-in/checkout
    const today = new Date().toISOString().split('T')[0];
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    if (checkinInput) checkinInput.min = today;
    if (checkoutInput) checkoutInput.min = today;

    // Update checkout min when checkin changes
    if (checkinInput && checkoutInput) {
        checkinInput.addEventListener('change', () => {
            checkoutInput.min = checkinInput.value;
            if (checkoutInput.value && checkoutInput.value < checkinInput.value) {
                checkoutInput.value = checkinInput.value;
            }
        });
    }

    guestForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const submitBtn = guestForm.querySelector('button[type="submit"]');
        if (submitBtn) { submitBtn.classList.add('btn-loading'); submitBtn.disabled = true; }

        // Validate dates
        const checkin = document.getElementById("checkin").value;
        const checkout = document.getElementById("checkout").value;
        if (checkout < checkin) {
            if (typeof showToast === 'function') showToast("Check-out date cannot be before check-in date.", "warning");
            if (submitBtn) { submitBtn.classList.remove('btn-loading'); submitBtn.disabled = false; }
            return;
        }

        const data = {
            nid: document.getElementById("nid").value.trim(),
            name: document.getElementById("name").value.trim(),
            dob: document.getElementById("dob").value,
            relationship: document.getElementById("relationship").value,
            phone: document.getElementById("phone").value.trim(),
            email: document.getElementById("email").value.trim(),
            checkin: checkin,
            checkout: checkout,
            studentId: studentId || 'unknown',
            createdAt: serverTimestamp(),
            status: "pending"
        };

        try {
            // Store in GuestRoomRequests collection (admin reads from here)
            await addDoc(collection(firestore, "GuestRoomRequests"), data);

            if (typeof showToast === 'function') showToast("Guest room booking request sent to admin!", "success");
            guestForm.reset();
            if (submitBtn) { submitBtn.classList.remove('btn-loading'); submitBtn.disabled = false; }
        } catch (error) {
            console.error('Guest room booking error:', error);
            if (typeof showToast === 'function') showToast("Failed to submit booking: " + error.message, "error");
            if (submitBtn) { submitBtn.classList.remove('btn-loading'); submitBtn.disabled = false; }
        }
    });
});