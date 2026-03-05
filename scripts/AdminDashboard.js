document.addEventListener("DOMContentLoaded", () => {
    // Action button handlers for dashboard cards
    const actionButtons = document.querySelectorAll('.action-btn');

    actionButtons.forEach(button => {
        button.addEventListener('click', function () {
            const card = this.closest('.card');
            if (!card) return;

            const cardType = card.classList[1];
            let targetPage = '';

            switch (cardType) {
                case 'request':      targetPage = 'requests.html';          break;
                case 'attendance':   targetPage = 'Attendance.html';        break;
                case 'allocation':   targetPage = 'room.html';              break;
                case 'meal':         targetPage = 'mealreport.html';        break;
                case 'student_info': targetPage = 'StudentInformation.html'; break;
                case 'complaint':    targetPage = 'complaints.html';        break;
                case 'documents':    targetPage = 'DocumentManagement.html'; break;
                default: return;
            }

            window.location.href = targetPage;
        });
    });

    // ── SOS Alerts Real-time Listener ──
    const sosSection = document.getElementById('sosAlertsSection');
    const sosAlertsList = document.getElementById('sosAlertsList');
    const sosBadge = document.getElementById('sosBadge');

    if (typeof firebase !== 'undefined' && firebase.firestore) {
        const db = firebase.firestore();

        // Listen for pending SOS alerts in real-time
        db.collection('sos_alerts')
            .where('status', '==', 'pending')
            .onSnapshot((snapshot) => {
                const alerts = [];
                snapshot.forEach(doc => {
                    alerts.push({ id: doc.id, ...doc.data() });
                });

                // Sort by timestamp descending (client-side to avoid composite index)
                alerts.sort((a, b) => {
                    const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
                    const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
                    return tb - ta;
                });

                if (alerts.length > 0) {
                    sosSection.style.display = 'flex';
                    sosBadge.textContent = alerts.length;

                    sosAlertsList.innerHTML = alerts.map(alert => {
                        const time = formatTimeAgo(alert.timestamp);
                        return `
                            <div class="sos-alert-card" data-id="${alert.id}">
                                <span class="material-icons alert-icon">emergency</span>
                                <div class="sos-alert-info">
                                    <h4>${escapeHtml(alert.studentName || 'Unknown Student')}</h4>
                                    <p>ID: ${escapeHtml(alert.studentId || 'N/A')} · Room: ${escapeHtml(alert.roomNumber || 'N/A')}</p>
                                    <p class="alert-time">${time}</p>
                                </div>
                                <div class="sos-alert-actions">
                                    <button class="btn-acknowledge" onclick="acknowledgeAlert('${alert.id}')">Acknowledge</button>
                                    <button class="btn-dismiss" onclick="dismissAlert('${alert.id}')">Dismiss</button>
                                </div>
                            </div>
                        `;
                    }).join('');
                } else {
                    sosSection.style.display = 'none';
                    sosAlertsList.innerHTML = '<p style="padding:0.8rem 1.2rem;color:var(--clr-info-dark);font-size:0.8rem;">No pending alerts.</p>';
                    sosBadge.textContent = '0';
                }
            }, (error) => {
                console.error("SOS listener error:", error);
                sosSection.style.display = 'flex';
                sosAlertsList.innerHTML = '<p style="padding:0.8rem 1.2rem;color:var(--clr-info-dark);font-size:0.8rem;">Unable to load SOS alerts.</p>';
            });
    }

    // Acknowledge an SOS alert
    window.acknowledgeAlert = async function(alertId) {
        try {
            await firebase.firestore().collection('sos_alerts').doc(alertId).update({
                status: 'acknowledged',
                acknowledgedAt: new Date().toISOString()
            });
            if (typeof showToast === 'function') showToast('Alert acknowledged.', 'success');
        } catch (error) {
            console.error('Error acknowledging alert:', error);
            if (typeof showToast === 'function') showToast('Failed to acknowledge alert.', 'error');
        }
    };

    // Dismiss an SOS alert
    window.dismissAlert = async function(alertId) {
        try {
            await firebase.firestore().collection('sos_alerts').doc(alertId).update({
                status: 'dismissed',
                dismissedAt: new Date().toISOString()
            });
            if (typeof showToast === 'function') showToast('Alert dismissed.', 'info');
        } catch (error) {
            console.error('Error dismissing alert:', error);
            if (typeof showToast === 'function') showToast('Failed to dismiss alert.', 'error');
        }
    };

    // Helper: format time ago
    function formatTimeAgo(timestamp) {
        if (!timestamp) return '';
        const now = new Date();
        const then = new Date(timestamp);
        const diffMs = now - then;
        const diffMin = Math.floor(diffMs / 60000);
        const diffHr = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHr / 24);

        if (diffMin < 1) return 'Just now';
        if (diffMin < 60) return `${diffMin} min ago`;
        if (diffHr < 24) return `${diffHr} hr${diffHr > 1 ? 's' : ''} ago`;
        return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    }

    // Helper: escape HTML to prevent XSS
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
});