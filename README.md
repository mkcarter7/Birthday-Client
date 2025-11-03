# Birthday Party Website 🎉

A full-featured, customizable birthday party website built with Next.js, Firebase Authentication, and React. Perfect for creating a beautiful, interactive celebration experience for guests.

## ✨ Features

### 🎊 Guest Features
- **RSVP Management** - Easy RSVP system with guest count and dietary restrictions
- **Photo Gallery** - Upload and browse party photos with likes
- **Interactive Games** - Play trivia games and earn points on the leaderboard
- **Guestbook** - Leave messages and memories for the party
- **Party Information** - Date, time, location with interactive maps
- **Social Sharing** - Share via SMS, QR code, and calendar integration
- **Live Updates** - Facebook Live integration for remote guests
- **Gift Registry** - Venmo integration for gift contributions

### 👨‍💼 Admin Features
- **Admin Dashboard** - Complete overview of RSVPs, guestbook, photos, and game stats
- **Statistics** - Real-time analytics and party metrics
- **Leaderboard Management** - View game scores and player rankings
- **Data Export** - Access all party data in one place

### 🎨 Customization
- **Theme Colors** - Fully customizable color scheme
- **Party Branding** - Custom fonts, messages, and styling
- **Feature Toggles** - Enable/disable features as needed
- **Responsive Design** - Beautiful on all devices

## 🚀 Tech Stack

- **Frontend Framework:** Next.js 14 (App Router)
- **UI Library:** React 18
- **Styling:** Bootstrap 5, React Bootstrap
- **Authentication:** Firebase Auth (Google Sign-In)
- **Animation:** Canvas Confetti
- **Backend API:** Django REST Framework (separate repository)

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ installed ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Firebase account** ([Get started](https://firebase.google.com/))
- **Django backend** running (see backend repository)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Birthday-Client.git
cd Birthday-Client
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp env.example .env.local
```

Edit `.env.local` and add your configuration:

```bash
# Required: Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Required: Backend Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_PARTY_ID=your-party-uuid-here

# Party Details
NEXT_PUBLIC_PARTY_NAME=Your Party Name
NEXT_PUBLIC_PARTY_DATE=Jan 1, 2025
NEXT_PUBLIC_PARTY_TIME=7:00 PM - 11:00 PM
NEXT_PUBLIC_PARTY_LOCATION=123 Main St, City, State 12345
NEXT_PUBLIC_PARTY_THEME=Your Theme

# Admin Access (optional)
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com

# Theme Colors (optional)
NEXT_PUBLIC_PRIMARY_COLOR=#3B82F6
NEXT_PUBLIC_SECONDARY_COLOR=#8B5CF6
NEXT_PUBLIC_ACCENT_COLOR=#F59E0B
```

### 4. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable **Authentication** > **Sign-in method** > **Google**
4. Get your Firebase config from **Project Settings** > **General**
5. Add `localhost` to **Authentication** > **Settings** > **Authorized domains**

### 5. Set Up Husky (Git Hooks)

```bash
npm run prepare
```

### 6. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your site! 🎉

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add all environment variables
4. Deploy!

### Deploy to Netlify

1. Build command: `npm run build`
2. Publish directory: `.next`
3. Add environment variables in Netlify dashboard
4. Add your domain to Firebase authorized domains

### Environment Variables for Production

Make sure to add all environment variables from `.env.local` to your hosting platform's dashboard.

## 📝 License

This project is private and proprietary.

Happy celebrating! 🎊🎂🎈
