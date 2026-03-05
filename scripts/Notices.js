document.addEventListener("DOMContentLoaded", () => {
    // Initialize Firebase references
    const db = firebase.firestore();
    
    // DOM Elements
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

    // Extract the user ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get('id');
    
    // Add the ID parameter to all navigation links
    if (studentId) {
        // Update sidebar links
        const sidebarLinks = document.querySelectorAll('.sidebar a');
        sidebarLinks.forEach(link => {
            // Skip if it's the logout button or attendance button (handled separately)
            if (link.id === 'sidebarLogoutBtn' || link.id === 'sidebarAttendanceBtn') return;
            
            const href = link.getAttribute('href');
            // Only update links that point to actual pages (not #)
            if (href && href !== '#') {
                // Check if the URL already has parameters
                if (href.includes('?')) {
                    link.setAttribute('href', `${href}&id=${studentId}`);
                } else {
                    link.setAttribute('href', `${href}?id=${studentId}`);
                }
            }
        });
    }

    // Handle attendance button
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

    // Pagination state
    const PAGE_SIZE = 10;
    let allFilteredDocs = [];
    let displayedCount = 0;

    // Function to load documents
    function loadDocuments(category = 'all', searchTerm = '') {
        // Show loading indicator
        loadingIndicator.style.display = 'flex';
        documentsList.innerHTML = '';
        noDocuments.style.display = 'none';
        allFilteredDocs = [];
        displayedCount = 0;
        removeLoadMoreBtn();
        
        // Create query based on filters
        let query = db.collection('documents');
        
        // Add category filter if not "all"
        if (category !== 'all') {
            query = query.where('category', '==', category);
        }
        
        // Order by upload date (newest first)
        query = query.orderBy('uploadDate', 'desc');
        
        // Execute query
        query.get().then((snapshot) => {
            // Hide loading indicator
            loadingIndicator.style.display = 'none';
            
            if (snapshot.empty) {
                noDocuments.style.display = 'block';
                return;
            }
            
            // Filter documents by visibility and search term
            snapshot.forEach(doc => {
                const data = doc.data();
                
                // Check if document is visible to this student
                const isVisible = 
                    data.visibility === 'all' || 
                    (data.visibility === 'specific' && 
                     data.specificStudents && 
                     data.specificStudents.includes(studentId));
                
                // Check if document matches search term
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
            
            // Render first page
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
    
    // Function to render a document
    function renderDocument(doc) {
        // Determine icon based on file type
        let iconName = 'description';
        if (doc.fileName) {
            const extension = doc.fileName.split('.').pop().toLowerCase();
            if (extension === 'pdf') iconName = 'picture_as_pdf';
            else if (['doc', 'docx'].includes(extension)) iconName = 'article';
            else if (['xls', 'xlsx'].includes(extension)) iconName = 'table_chart';
            else if (['ppt', 'pptx'].includes(extension)) iconName = 'slideshow';
        }
        
        // Format date
        const date = doc.uploadDate ? new Date(doc.uploadDate.seconds * 1000) : new Date();
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        // Create document element
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
        
        // Add click event to open modal
        docElement.addEventListener('click', () => {
            openDocumentModal(doc);
        });
        
        // Add to documents list
        documentsList.appendChild(docElement);
    }
    
    // Function to open document modal
    function openDocumentModal(doc) {
        // Set modal content
        modalTitle.textContent = doc.title;
        modalCategory.textContent = capitalizeFirstLetter(doc.category);
        
        const date = doc.uploadDate ? new Date(doc.uploadDate.seconds * 1000) : new Date();
        modalDate.textContent = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        modalDescription.textContent = doc.description || 'No description provided.';
        
        // Set document links
        if (doc.fileUrl) {
            viewDocumentBtn.href = doc.fileUrl;
            downloadDocumentBtn.href = doc.fileUrl;
            
            // Set filename for download
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
        
        // Show modal
        modal.classList.add('active');
    }
    
    // Close modal event
    closeModal.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    // Filter by category
    categoryFilter.addEventListener('change', () => {
        const category = categoryFilter.value;
        const searchTerm = searchInput.value.trim();
        loadDocuments(category, searchTerm);
    });
    
    // Search documents
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const category = categoryFilter.value;
            const searchTerm = searchInput.value.trim();
            loadDocuments(category, searchTerm);
        }, 500);
    });
    
    // Helper function to capitalize first letter
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Load documents when page loads
    loadDocuments();
});