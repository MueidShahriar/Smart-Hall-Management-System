# Smart Hall Management System

A browser-based hall management system with separate student and admin workflows. It includes authentication, dashboards, attendance, room allocation, complaints, notices, documents, meal management, and guest room booking using Firebase services.

## Highlights

- Animated gradient login background
- Separate student and admin dashboards
- Centralized sidebar and toast system
- Firebase Authentication, Realtime Database, and Firestore
- Location-validated attendance
- Room allocation with seat tracking
- Guest room booking requests
- Complaint submission and resolution updates
- Notices and documents distribution

## Tech Stack

- HTML5, CSS3, JavaScript (vanilla)
- Firebase (Auth, Realtime Database, Firestore)
- Bootstrap assets (local)
- Font Awesome icons

## Getting Started

1. Open `index.html` in your browser.
2. Ensure Firebase configuration in `scripts/index.js` and `scripts/sidebar.js` matches your project.
3. Register a new account or sign in, then navigate based on your role.

## Project Structure (Quick View)

- `index.html` - login and registration entry point
- `pages/student/` - student-facing pages
- `pages/admin/` - admin-facing pages
- `scripts/` - page logic and shared components
- `styles/` - page-specific and shared stylesheets
- `assets/` - Bootstrap, fonts, and common assets
- `images/` - project images and icons

## Key Pages

### Student

- StudentDashboard.html
- profile.html
- CheckPayments.html
- GuestRoomBooking.html
- MealManagement.html
- Notices.html
- About.html
- complainbox.html

### Admin

- AdminDashboard.html
- room.html
- StudentInformation.html
- mealreport.html
- Attendance.html
- complaints.html
- requests.html
- DocumentManagement.html

## Notes

- `scripts/sidebar.js` builds the shared sidebar and top bar on dashboard pages.
- `scripts/toast.js` provides a consistent toast notification UI.
- Relative paths are used everywhere; keep folder structure unchanged when deploying.

## Documentation

- See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for the full folder map.
- See [SECURITY.md](SECURITY.md) for security guidance.

