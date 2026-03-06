document.addEventListener("DOMContentLoaded", () => {

    const db = firebase.firestore();

    const documentsList = document.getElementById('documentsList');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const noDocuments = document.getElementById('noDocuments');
    const categoryFilter = document.getElementById('categoryFilter');
    const searchInput = document.getElementById('searchDocuments');
    const modal = document.getElementById('documentModal');
    const closeModal = document.querySelector('.close-modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalCategory = document.getElementById('modalCategory');
    const modalDate = document.getElementById('modalDate');
    const modalDescription = document.getElementById('modalDescription');
    const viewDocumentBtn = document.getElementById('viewDocumentBtn');
    const downloadDocumentBtn = document.getElementById('downloadDocumentBtn');
    const attendanceBtn = document.getElementById('attendanceButton');

    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get('id');

    if (studentId) {

        const sidebarLinks = document.querySelectorAll('.sidebar a');
        sidebarLinks.forEach(link => {

            if (link.id === 'sidebarLogoutBtn' || link.id === 'sidebarAttendanceBtn') return;

            const href = link.getAttribute('href');

            if (href && href !== '#') {

                if (href.includes('?')) {
                    link.setAttribute('href', `${href}&id=${studentId}`);
                } else {
                    link.setAttribute('href', `${href}?id=${studentId}`);
                }
            }
        });
    }

    if (attendanceBtn) {
        attendanceBtn.addEventListener('click', () => {
            if (typeof handleAttendance === 'function') {
                handleAttendance(studentId);
            } else {
                window.location.href = studentId ?
                    `StudentDashboard.html?id=${studentId}` :
                    'StudentDashboard.html';
            }
        });
    }

    const PAGE_SIZE = 10;
    let allFilteredDocs = [];
    let displayedCount = 0;

    function loadDocuments(category = 'all', searchTerm = '') {

        loadingIndicator.style.display = 'flex';
        documentsList.innerHTML = '';
        noDocuments.style.display = 'none';
        allFilteredDocs = [];
        displayedCount = 0;
        removeLoadMoreBtn();

        let query = db.collection('documents');

        if (category !== 'all') {
            query = query.where('category', '==', category);
        }

        query = query.orderBy('uploadDate', 'desc');

        query.get().then((snapshot) => {

            loadingIndicator.style.display = 'none';

            if (snapshot.empty) {
                noDocuments.style.display = 'block';
                return;
            }

            snapshot.forEach(doc => {
                const data = doc.data();

                const isVisible =
                    data.visibility === 'all' ||
                    (data.visibility === 'specific' &&
                     data.specificStudents &&
                     data.specificStudents.includes(studentId));

                const matchesSearch =
                    !searchTerm ||
                    data.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (data.description && data.description.toLowerCase().includes(searchTerm.toLowerCase()));

                if (isVisible && matchesSearch) {
                    allFilteredDocs.push({
                        id: doc.id,
                        ...data
                    });
                }
            });

            if (allFilteredDocs.length === 0) {
                noDocuments.style.display = 'block';
                return;
            }

            showMoreDocuments();
        }).catch(error => {
            console.error("Error getting documents: ", error);
            loadingIndicator.style.display = 'none';
            documentsList.innerHTML = `
                <div class="error-message">
                    <span class="material-icons">error</span>
                    <p>Failed to load documents. Please try again later.</p>
                </div>
            `;
        });
    }

    function showMoreDocuments() {
        const nextBatch = allFilteredDocs.slice(displayedCount, displayedCount + PAGE_SIZE);
        nextBatch.forEach(doc => renderDocument(doc));
        displayedCount += nextBatch.length;

        removeLoadMoreBtn();
        if (displayedCount < allFilteredDocs.length) {
            const btn = document.createElement('button');
            btn.id = 'loadMoreBtn';
            btn.className = 'load-more-btn';
            btn.textContent = `Load More (${allFilteredDocs.length - displayedCount} remaining)`;
            btn.addEventListener('click', showMoreDocuments);
            documentsList.parentElement.appendChild(btn);
        }
    }

    function removeLoadMoreBtn() {
        const old = document.getElementById('loadMoreBtn');
        if (old) old.remove();
    }

    function renderDocument(doc) {

        let iconName = 'description';
        if (doc.fileName) {
            const extension = doc.fileName.split('.').pop().toLowerCase();
            if (extension === 'pdf') iconName = 'picture_as_pdf';
            else if (['doc', 'docx'].includes(extension)) iconName = 'article';
            else if (['xls', 'xlsx'].includes(extension)) iconName = 'table_chart';
            else if (['ppt', 'pptx'].includes(extension)) iconName = 'slideshow';
        }

        const date = doc.uploadDate ? new Date(doc.uploadDate.seconds * 1000) : new Date();
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        const docElement = document.createElement('div');
        docElement.className = 'document-item';
        docElement.innerHTML = `
            <span class="material-icons document-icon">${iconName}</span>
            <div class="document-content">
                <h3 class="document-title">${doc.title}</h3>
                <div class="document-meta">
                    <span class="document-category ${doc.category}">${capitalizeFirstLetter(doc.category)}</span>
                    <span class="document-date">Uploaded: ${formattedDate}</span>
                </div>
                ${doc.description ? `<p class="document-description">${doc.description}</p>` : ''}
            </div>
        `;

        docElement.addEventListener('click', () => {
            openDocumentModal(doc);
        });

        documentsList.appendChild(docElement);
    }

    function openDocumentModal(doc) {

        modalTitle.textContent = doc.title;
        modalCategory.textContent = capitalizeFirstLetter(doc.category);

        const date = doc.uploadDate ? new Date(doc.uploadDate.seconds * 1000) : new Date();
        modalDate.textContent = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        modalDescription.textContent = doc.description || 'No description provided.';

        if (doc.fileUrl) {
            viewDocumentBtn.href = doc.fileUrl;
            downloadDocumentBtn.href = doc.fileUrl;

            if (doc.fileName) {
                downloadDocumentBtn.setAttribute('download', doc.fileName);
            } else {
                downloadDocumentBtn.setAttribute('download', doc.title);
            }

            viewDocumentBtn.style.display = 'flex';
            downloadDocumentBtn.style.display = 'flex';
        } else {
            viewDocumentBtn.style.display = 'none';
            downloadDocumentBtn.style.display = 'none';
        }

        modal.classList.add('active');
    }

    closeModal.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    categoryFilter.addEventListener('change', () => {
        const category = categoryFilter.value;
        const searchTerm = searchInput.value.trim();
        loadDocuments(category, searchTerm);
    });

    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const category = categoryFilter.value;
            const searchTerm = searchInput.value.trim();
            loadDocuments(category, searchTerm);
        }, 500);
    });

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    loadDocuments();
});
