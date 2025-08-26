# SocietyHub

**SocietyHub** is a mobile-first, full-stack web application designed to streamline housing society management. It empowers housing societies (e.g., apartment complexes, gated communities) to manage daily operations, member interactions, finances, maintenance, and communications efficiently. With a premium, modern UI and role-based access control, SocietyHub ensures ease of use for admins, committee members, residents, and guests.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features
SocietyHub offers a comprehensive set of tools tailored for housing society management:

- **Dashboard**: Personalized overview with role-based analytics (e.g., unpaid dues, pending complaints) and quick actions (e.g., pay dues, raise complaint). Includes charts for key metrics.
- **Members**: Manage resident profiles with CRUD operations, searchable directory, and role/permission assignment. Supports CSV import and privacy controls.
- **Finances**: Track maintenance fees, payments, and expenses. Features invoice generation, payment gateway integration, and downloadable financial reports (PDF/Excel).
- **Maintenance**: Ticket system for complaints/requests with photo uploads, status tracking, and vendor assignment. Real-time notifications for updates.
- **Announcements**: Post notices, polls, or updates with comment support. Admins can pin or schedule announcements.
- **Events**: Manage society events with a calendar view, RSVP functionality, and Google Calendar export.
- **Visitors**: Log visitor entries, generate QR code passes, and notify residents. Includes approval workflow.
- **Amenities**: Book facilities (e.g., clubhouse, gym) with a time-slot picker and availability calendar.
- **Documents**: Store and share society documents (e.g., rules, minutes) with role-based access and search.
- **Chat**: Real-time group and direct messaging with threaded conversations and media support.
- **Settings**: Customize user profiles, society details, notifications, and app theme (light/dark mode).

### Additional Features
- **Role-Based Access Control (RBAC)**: Supports Super Admin, Society Admin, Committee Member, Resident, and Guest roles. Dynamic role creation and granular permission assignment.
- **Authentication**: Secure login/signup with email/password, 2FA (email/authenticator), and password reset.
- **Mobile-First UI**: Responsive design optimized for 320px–768px screens, with a premium aesthetic (Deep Blue #1E3A8A, Vibrant Coral #FF6B6B, Soft Teal #4FD1C5).
- **Notifications**: In-app, email, and push notifications for real-time updates.
- **Offline Support**: Cached data for key components (e.g., announcements, members) with sync capability.
- **Scalability**: Multi-tenant architecture for managing multiple societies.

## Tech Stack
- **Frontend**: React Native (or Flutter) for cross-platform mobile UI, with React Native Paper for components.
- **Backend**: Node.js with Express.js for RESTful APIs, JWT for authentication.
- **Database**: PostgreSQL (or MongoDB) for structured data storage.
- **Storage**: AWS S3 (or local storage) for documents and media.
- **Notifications**: Firebase Cloud Messaging for push notifications, SendGrid for emails.
- **Animations**: React Native Reanimated (or Flutter Animations) for smooth transitions.
- **Charts**: react-native-chart-kit (or fl_chart for Flutter) for analytics.
- **Icons**: react-native-vector-icons (or Flutter Icons) for consistent iconography.
- **Deployment**: Vercel or Heroku for backend, Expo (React Native) or Flutter build for mobile apps.

## Installation
Follow these steps to set up SocietyHub locally:

### Prerequisites
- Node.js (>= 16.x)
- PostgreSQL (>= 12.x) or MongoDB (>= 4.x)
- Yarn or npm
- AWS account (for S3, optional)
- Firebase account (for push notifications)
- SendGrid account (for emails)

### Steps
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-org/societyhub.git
   cd societyhub
   ```

2. **Install Dependencies**:
   - Backend:
     ```bash
     cd backend
     yarn install
     ```
   - Frontend:
     ```bash
     cd frontend
     yarn install
     ```

3. **Configure Environment Variables**:
   - Create a `.env` file in the `backend` directory:
     ```env
     DATABASE_URL=postgres://user:password@localhost:5432/societyhub
     JWT_SECRET=your_jwt_secret
     AWS_ACCESS_KEY_ID=your_aws_key
     AWS_SECRET_ACCESS_KEY=your_aws_secret
     SENDGRID_API_KEY=your_sendgrid_key
     FIREBASE_CONFIG=your_firebase_config
     ```
   - Create a `.env` file in the `frontend` directory:
     ```env
     API_URL=http://localhost:3000/api
     ```

4. **Set Up Database**:
   - For PostgreSQL:
     ```bash
     psql -U postgres -c "CREATE DATABASE societyhub;"
     cd backend
     yarn run migrate
     ```
   - For MongoDB, ensure the MongoDB server is running.

5. **Run the Application**:
   - Backend:
     ```bash
     cd backend
     yarn start
     ```
   - Frontend (React Native):
     ```bash
     cd frontend
     yarn start
     ```
     Use Expo Go to test on mobile devices.

6. **Seed Demo Data** (optional):
   ```bash
   cd backend
   yarn run seed
   ```

## Usage
1. **Access the App**:
   - Open the app on your mobile device via Expo Go or a browser (if using web build).
   - Default URL: `http://localhost:3000` (web) or Expo QR code (mobile).

2. **Initial Setup**:
   - Sign up as a Super Admin to create a new society.
   - Use the setup wizard to configure society details (name, address, rules).
   - Invite residents via email or CSV import.

3. **Role-Based Navigation**:
   - **Admins**: Access all components, manage roles/permissions, and view analytics.
   - **Residents**: View personal dashboard, pay dues, raise complaints, and book amenities.
   - **Guests**: Read-only access to public announcements.

4. **Key Actions**:
   - Pay dues via integrated payment gateway (e.g., Stripe).
   - Raise maintenance tickets with photo uploads.
   - Book amenities using the calendar picker.
   - Post announcements or chat in group threads.

## Project Structure
```
societyhub/
├── backend/                   # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/       # API route handlers
│   │   ├── models/            # Database schemas (e.g., User, Society)
│   │   ├── routes/            # RESTful API endpoints
│   │   ├── middleware/        # Authentication, validation
│   │   └── utils/             # Helpers (e.g., notifications, file upload)
│   ├── migrations/            # Database migrations
│   └── seeds/                 # Demo data
├── frontend/                  # React Native frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components (e.g., Card, Form)
│   │   ├── screens/           # Screens for each module (Dashboard, Members, etc.)
│   │   ├── navigation/        # Bottom nav and hamburger menu
│   │   ├── assets/            # Images, icons, fonts
│   │   └── utils/             # API calls, helpers
├── docs/                      # Documentation (e.g., API specs)
└── README.md                  # Project documentation
```

## Contributing
We welcome contributions! Please follow these steps:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit changes (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request with a clear description.

### Guidelines
- Follow the coding style (ESLint for JS, Prettier for formatting).
- Write unit tests for new features (Jest for backend, React Native Testing Library for frontend).
- Ensure accessibility (WCAG 2.1 compliance).
- Update documentation for new features.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact
For support or inquiries, reach out to:
- **Email**: support@societyhub.app
- **Twitter/X**: [@SocietyHubApp](https://x.com/SocietyHubApp)
- **Issues**: [GitHub Issues](https://github.com/your-org/societyhub/issues)