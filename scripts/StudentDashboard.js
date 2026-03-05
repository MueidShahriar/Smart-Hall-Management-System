document.addEventListener("DOMContentLoaded", () => {
    const complaintBtn = document.getElementById('complainButton');
    const bloodDonationBtn = document.getElementById('bloodDonationBtn');
    const attendanceCardBtn = document.getElementById('attendanceCardBtn');

    // Extract the user ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get('id');

    // Handle complaint button click
    if (complaintBtn) {
        complaintBtn.addEventListener('click', () => {
            if (studentId) {
                window.location.href = `complainbox.html?id=${studentId}`;
            } else {
                window.location.href = "complainbox.html";
            }
        });
    }

    // Handle dashboard card buttons
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const cardType = button.closest('.card')?.classList[1];
            let targetPage = '';
            
            switch (cardType) {
                case 'payment':   targetPage = 'CheckPayments.html';    break;
                case 'booking':   targetPage = 'GuestRoomBooking.html'; break;
                case 'meal':      targetPage = 'MealManagement.html';   break;
                case 'attend':    targetPage = 'Attendance.html';       break;
                case 'complaint': targetPage = 'complainbox.html';      break;
                case 'notices':   targetPage = 'Notices.html';          break;
                default: return;
            }
            
            if (studentId) {
                window.location.href = `${targetPage}?id=${studentId}`;
            } else {
                window.location.href = targetPage;
            }
        });
    });

    // Handle attendance card button - navigate to Attendance page
    if (attendanceCardBtn) {
        attendanceCardBtn.addEventListener('click', () => {
            if (studentId) {
                window.location.href = `Attendance.html?id=${studentId}`;
            } else {
                window.location.href = 'Attendance.html';
            }
        });
    }

    // Handle blood donation button
    if (bloodDonationBtn) {
        bloodDonationBtn.addEventListener('click', () => {
            window.open('https://blood-donation-community.vercel.app/', '_blank');
        });
    }

    // ── SOS Emergency Handler ──
    const sosBtn = document.querySelector('.card.sos .sos-btn');
    if (sosBtn) {
        sosBtn.addEventListener('click', async () => {
            if (!studentId) {
                if (typeof showToast === 'function') showToast("User ID not found. Please log in again.", "error");
                return;
            }

            // Confirm before sending
            sosBtn.disabled = true;
            sosBtn.textContent = 'Sending...';

            try {
                // Fetch student info from Realtime Database
                const snapshot = await firebase.database().ref(`users/${studentId}`).once('value');
                const userData = snapshot.val() || {};
                const studentName = userData.name || [userData.firstName, userData.lastName].filter(Boolean).join(' ') || "Unknown";
                const roomNumber = userData.room || "Not assigned";

                // Save SOS alert to Firestore
                const alertId = `sos_${studentId}_${Date.now()}`;
                await firebase.firestore().collection('sos_alerts').doc(alertId).set({
                    studentId: studentId,
                    studentName: studentName,
                    roomNumber: roomNumber,
                    timestamp: new Date().toISOString(),
                    status: 'pending'
                });

                if (typeof showToast === 'function')
                    showToast(`SOS alert sent! Admin has been notified. (Room: ${roomNumber})`, "success");
            } catch (error) {
                console.error("SOS error:", error);
                if (typeof showToast === 'function')
                    showToast("Failed to send SOS alert. Please try again.", "error");
            } finally {
                sosBtn.disabled = false;
                sosBtn.textContent = 'Send SOS';
            }
        });
    }
});