# PresenSense - Smart Face Recognition Attendance System

A modern, responsive web application that combines both admin and client interfaces for a face recognition attendance system. Built with React, Vite, and Tailwind CSS for an attractive and professional user experience.

## Features

### 🎯 Separate Page Design
- **Public Page** (`/`): Dedicated page for quick attendance verification
- **Admin Page** (`/admin`): Separate administrative dashboard with secure login
- **Routing**: Clean URL structure with React Router navigation
- **Session Management**: Persistent admin authentication with logout

### 📸 Advanced Camera Features
- **Mirror Image Support**: Configurable mirror preview for better user experience
- **Multi-Camera Support**: Switch between front and rear cameras
- **Live Verification**: Real-time face scanning every 2 seconds
- **High-Quality Capture**: Optimized image capture for better recognition

### 🎨 Modern UI/UX
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile
- **Gradient Backgrounds**: Beautiful purple-to-blue gradient themes
- **Glass Morphism**: Modern backdrop blur effects
- **Smooth Animations**: Fluid transitions and hover effects
- **Professional Icons**: Comprehensive SVG icon set

### ⚡ Core Functionality
- **User Registration**: Upload photos or capture via camera
- **Face Recognition**: Real-time attendance verification
- **Attendance Tracking**: Comprehensive records management
- **Search & Filter**: Advanced attendance record filtering
- **Bulk Operations**: Mass delete operations with confirmation

## Technology Stack

- **Frontend**: React 19 + Vite
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS 4
- **Build Tool**: Vite with HMR
- **Linting**: ESLint with React hooks plugin
- **Icons**: Custom SVG icons
- **Responsive**: Mobile-first design approach

## Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- Modern web browser with camera access
- Backend API server running on port 8000

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PresenSense
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   Create a `.env.local` file:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Public Interface: `http://localhost:5175`
   - Admin Panel: `http://localhost:5175/admin`

### Production Build

```bash
npm run build
npm run preview
```

## Configuration

### API Endpoints
The application connects to these backend endpoints:
- `POST /admin/upload` - User registration
- `GET/DELETE /admin/attendance` - Attendance management
- `POST /match/` - Single face verification
- `POST /match/stream` - Live face verification

### Admin Access
**Demo Credentials:**
- Username: `admin`
- Password: `admin123`

## Usage Guide

### Public Page (`/`)
1. Navigate to the homepage for public access
2. Start camera and position face in frame
3. Use "Capture & Verify" for single check
4. Use "Start Live Verification" for continuous scanning
5. Click "Admin Portal" to access administrative features

### Admin Page (`/admin`)
1. Navigate to `/admin` URL or click "Admin Portal"
2. Login with credentials (admin/admin123)
3. **Upload Tab**: Register users by uploading photos
4. **Capture Tab**: Register users via camera capture
5. **Attendance Tab**: View and manage all records
6. Use "Logout" button to end admin session

## Features Breakdown

### Camera Controls
- **Start Camera**: Initialize video feed
- **Switch Camera**: Toggle front/rear cameras
- **Mirror Toggle**: Flip preview horizontally
- **Next Device**: Cycle through available cameras

### Attendance Management
- **Real-time Updates**: Live attendance feed
- **Search Function**: Filter by name, ID, or timestamp
- **Delete Options**: Remove individual or bulk records
- **Statistics**: User count and latest activity

### Responsive Design
- **Mobile Optimized**: Touch-friendly interface
- **Tablet Support**: Medium screen adaptations
- **Desktop Enhanced**: Full-featured experience
- **Cross-browser**: Chrome, Firefox, Safari, Edge

## Browser Compatibility

- **Chrome 80+**: Full support
- **Firefox 78+**: Full support
- **Safari 14+**: Full support
- **Edge 80+**: Full support

**Requirements:**
- Camera access permission
- Modern JavaScript support
- WebRTC capabilities

## Security Features

- **Admin Authentication**: Login protection for admin features
- **Camera Permissions**: Secure media device access
- **Input Validation**: Frontend form validation
- **Error Handling**: Comprehensive error management

## Development

### Project Structure
```
src/
├── components/          # Reusable React components
│   ├── AdminPanel.jsx   # Admin interface
│   ├── ClientVerify.jsx # Public verification
│   ├── LoginModal.jsx   # Authentication modal
│   ├── UploadForm.jsx   # Photo upload form
│   ├── CaptureForm.jsx  # Camera capture form
│   └── Attendance.jsx   # Records management
├── pages/              # Page components
│   ├── PublicPage.jsx   # Public attendance page
│   ├── AdminPage.jsx    # Admin dashboard page
│   └── NotFoundPage.jsx # 404 error page
├── layouts/            # Layout components
│   └── BaseLayout.jsx   # Shared layout template
├── config.js           # API configuration
├── App.jsx             # Router configuration
├── main.jsx           # Application entry point
└── index.css          # Tailwind CSS imports
```

### Key Components

**App.jsx**: React Router configuration with route definitions

**PublicPage.jsx**: Standalone public page for attendance verification

**AdminPage.jsx**: Complete admin dashboard with authentication

**LoginModal.jsx**: Secure admin authentication with session management

**ClientVerify.jsx**: Public face verification with live mode

**AdminPanel.jsx**: Tabbed admin interface with statistics

**BaseLayout.jsx**: Shared layout component for consistent design

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the browser console for errors

---

**PresenSense** - Making attendance management smart, secure, and stylish! 🚀+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
