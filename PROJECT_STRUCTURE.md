# Boral Hall Management System - Project Structure

## 📁 Folder Organization

```
Boral-Hall-Management-System-main/
│
├── index.html                    # Main entry point (Login/Register page)
│
├── 📂 pages/                     # All HTML pages
│   ├── 📂 student/               # Student-facing pages
│   │   ├── StudentDashboard.html
│   │   ├── profile.html
│   │   ├── CheckPayments.html
│   │   ├── GuestRoomBooking.html
│   │   ├── MealManagement.html
│   │   ├── Notices.html
│   │   ├── About.html
│   │   └── complainbox.html
│   │
│   └── 📂 admin/                 # Admin-facing pages
│       ├── AdminDashboard.html
│       ├── room.html
│       ├── StudentInformation.html
│       ├── mealreport.html
│       ├── Attendance.html
│       ├── complaints.html
│       ├── requests.html
│       └── DocumentManagement.html
│
├── 📂 styles/                    # All CSS files
│   ├── About.css
│   ├── AdminDashboard.css
│   ├── DocumentManagement.css
│   ├── GuestRoomBooking.css
│   ├── index.css
│   ├── LoginRegister.css
│   ├── MealManagement.css
│   ├── Notices.css
│   └── StudentDashboard.css
│
├── 📂 scripts/                   # All JavaScript files
│   ├── sidebar.js                # Common sidebar component (shared)
│   ├── toast.js                  # Toast notification system
│   ├── About.js
│   ├── AdminDashboard.js
│   ├── AdminGuestRoomRequests.js
│   ├── DocumentManagement.js
│   ├── GuestRoomBooking.js
│   ├── index.js
│   ├── MealManagement.js
│   ├── Notices.js
│   └── StudentDashboard.js
│
├── 📂 assets/                    # Static assets
│   ├── bootstrap/
│   │   ├── css/
│   │   └── js/
│   ├── css/
│   ├── fonts/
│   ├── img/
│   └── js/
│
├── 📂 images/                    # Image files
│
├── 📂 .github/                   # GitHub configs
│
├── 📄 README.md                  # Project documentation
├── 📄 SECURITY.md                # Security guidelines
└── 📄 PROJECT_STRUCTURE.md       # This file

```

## 🎨 Features

### 🔥 New Features Added

1. **Animated Gradient Background** - Beautiful animated gradient background on the login page
2. **Modular File Structure** - Organized files into separate folders for better maintainability
3. **index.html** - Main entry point for the application

### 📱 Module Structure

#### Pages Module (`/pages`)
Contains all HTML pages for different features:
- User authentication and registration
- Admin dashboard
- Student dashboard
- Attendance management
- Meal management
- Document management
- Guest room booking
- Notices and announcements
- Student information
- Profile management

#### Styles Module (`/styles`)
All CSS stylesheets organized by component/page

#### Scripts Module (`/scripts`)
All JavaScript files with business logic and interactivity

#### Assets Module (`/assets`)
Static resources like Bootstrap, fonts, and common assets

## 🚀 Getting Started

1. Open `index.html` in your browser
2. Register a new account or sign in with existing credentials
3. Navigate through the dashboard based on your role (Student/Admin)

## 📝 Notes

- Main entry point is `index.html` at the root
- All page files are organized by role: `/pages/student/` and `/pages/admin/`
- All styles are in the `/styles` folder
- All scripts are in the `/scripts` folder
- `scripts/sidebar.js` provides a common sidebar component for all pages
- File references use relative paths (e.g., `../../styles/`, `../../scripts/`)

---

**Last Updated:** March 5, 2026
