# GroupMind - Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will help you set up and run the GroupMind application on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Expo CLI** - Install with `npm install -g @expo/cli`
- **Git** - [Download here](https://git-scm.com/)

## Quick Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd group-mind
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Agora Configuration (for video calls)
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_certificate
```

### 4. Start the Development Server

```bash
npm start
```

### 5. Run on Device/Simulator

- **iOS Simulator**: Press `i` in the terminal
- **Android Emulator**: Press `a` in the terminal
- **Physical Device**: Scan the QR code with Expo Go app

## 🔧 Firebase Setup (Required)

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Follow the setup wizard

### 2. Enable Services

In your Firebase project, enable:

- **Authentication** (Email/Password)
- **Firestore Database**
- **Storage**

### 3. Get Configuration

1. Go to Project Settings
2. Scroll to "Your apps"
3. Click the web app icon (</>)
4. Copy the configuration object

### 4. Security Rules

Update Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Group members can read/write group data
    match /groups/{groupId} {
      allow read, write: if request.auth != null &&
        (resource.data.members[request.auth.uid] != null ||
         resource.data.createdBy == request.auth.uid);
    }

    // Group messages
    match /groups/{groupId}/messages/{messageId} {
      allow read, write: if request.auth != null &&
        get(/databases/$(database)/documents/groups/$(groupId)).data.members[request.auth.uid] != null;
    }
  }
}
```

## 🎥 Agora Setup (For Video Calls)

### 1. Create Agora Account

1. Go to [Agora Console](https://console.agora.io/)
2. Sign up for a free account
3. Create a new project

### 2. Get Credentials

1. In your project dashboard, find your App ID
2. Generate a temporary token (for development)
3. Add these to your `.env` file

## 📱 Testing the App

### 1. Authentication Flow

1. Open the app
2. Tap "Sign Up"
3. Create a test account
4. Verify email (check console for verification link)
5. Sign in with your credentials

### 2. Group Creation

1. Navigate to Groups tab
2. Tap the FAB (floating action button)
3. Select "Create Group"
4. Fill in group details
5. Create the group

### 3. Video Calling

1. Join or create a group
2. Schedule a call or start one immediately
3. Test audio/video controls
4. Invite others to join

## 🐛 Common Issues & Solutions

### Issue: "Firebase not initialized"

**Solution**: Check your `.env` file and ensure all Firebase variables are set correctly.

### Issue: "Cannot connect to development server"

**Solution**:

- Ensure you're on the same network as your device
- Try using tunnel mode: `npm start --tunnel`

### Issue: "Video call not working"

**Solution**:

- Verify Agora credentials in `.env`
- Check microphone/camera permissions
- Ensure stable internet connection

### Issue: "Groups not loading"

**Solution**:

- Check Firestore security rules
- Verify user authentication
- Clear app cache and restart

## 📁 Project Structure Overview

```
group-mind/
├── app/                    # Main screens (Expo Router)
│   ├── (auth)/            # Authentication screens
│   ├── (dashboard)/       # Main app screens
│   └── (groups)/          # Group-related screens
├── components/            # Reusable UI components
├── store/                 # State management (Context)
├── services/              # External service integrations
├── constants/             # App constants and strings
└── assets/                # Images, icons, fonts
```

## 🔄 Development Workflow

### 1. Making Changes

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test thoroughly
4. Commit with descriptive messages

### 2. Testing

```bash
# Run tests (if available)
npm test

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

### 3. Building for Production

```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

## 📚 Key Files to Know

- **`App.tsx`**: Main app entry point
- **`app/_layout.tsx`**: Root layout and providers
- **`store/GroupContext.tsx`**: Group state management
- **`store/PostContext.tsx`**: Posts and messages
- **`components/VideoCall.tsx`**: Video calling interface
- **`services/firebase.ts`**: Firebase configuration

## 🎯 Next Steps

1. **Read the Documentation**: Check `DOCUMENTATION.md` for detailed information
2. **Explore Components**: Review `COMPONENT_DOCUMENTATION.md`
3. **Join the Community**: Connect with other developers
4. **Contribute**: Submit issues and pull requests

## 🆘 Need Help?

- **Documentation**: Check the main documentation files
- **Issues**: Search existing issues or create a new one
- **Discussions**: Use the project discussions for questions
- **Code Review**: Submit pull requests for code review

## 🚀 Quick Commands Reference

```bash
# Start development server
npm start

# Install dependencies
npm install

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Build for production
expo build:ios
expo build:android

# Clear cache
expo r -c

# Update Expo SDK
expo upgrade
```

---

**Happy Coding! 🎉**

If you encounter any issues, please check the troubleshooting section in the main documentation or create an issue in the repository.
