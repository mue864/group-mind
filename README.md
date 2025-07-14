# GroupMind 📚

A comprehensive study group management application built with React Native and Expo, enabling students to create, join, and participate in study groups with real-time messaging, video calling, and collaborative learning tools.

## ✨ Features

- **🔐 User Authentication** - Secure sign up, sign in, and profile management
- **👥 Group Management** - Create, join, leave, and manage study groups
- **💬 Real-time Messaging** - Text messages, questions, and threaded responses
- **📹 Video Calling** - Audio and video calls with screen sharing
- **📁 Resource Sharing** - File uploads and downloads
- **📅 Scheduled Sessions** - Plan and join study sessions
- **🔍 Group Discovery** - Explore and find relevant study groups
- **👍 Reply System** - Threaded conversations with helpful responses
- **🛡️ Moderation Tools** - Admin and moderator controls
- **📱 Offline Support** - Cached data for offline access

## 🚀 Quick Start

Get up and running in 5 minutes! Check out our [Quick Start Guide](QUICK_START.md) for detailed setup instructions.

```bash
# Clone the repository
git clone <repository-url>
cd group-mind

# Install dependencies
npm install

# Start the development server
npm start
```

## 📚 Documentation

📁 **[Documentation Folder](documentation/)** - All documentation organized in one place

### Key Documentation

- **[📖 Comprehensive Documentation](documentation/DOCUMENTATION.md)** - Complete guide to the application
- **[🧩 Component Documentation](documentation/COMPONENT_DOCUMENTATION.md)** - Detailed component reference
- **[🏠 Home Screen Documentation](documentation/HOME_SCREEN_DOCUMENTATION.md)** - Detailed guide to the main dashboard
- **[⚡ Quick Start Guide](documentation/QUICK_START.md)** - Get started in 5 minutes
- **[🔧 Setup Instructions](documentation/QUICK_START.md#firebase-setup-required)** - Firebase and Agora setup

## 🏗️ Architecture

GroupMind is built with modern technologies and follows best practices:

- **Frontend**: React Native with Expo
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Video Calling**: Agora SDK
- **State Management**: React Context API
- **Styling**: Tailwind CSS (NativeWind)
- **Navigation**: Expo Router

## 🎯 Key Features

### Group Management

- Create and manage study groups
- Join existing groups
- Group discovery and suggestions
- Member management and roles

### Real-time Communication

- Instant messaging with message types
- Threaded conversations for Q&A
- File and image sharing
- Message reactions and helpful responses

### Video Calling

- High-quality audio and video calls
- Screen sharing capabilities
- Call controls (mute, camera, switch)
- Participant management

### User Experience

- Intuitive and modern UI
- Responsive design
- Accessibility support
- Offline functionality

## 📱 Screenshots

_[Screenshots will be added here]_

## 🛠️ Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Firebase account
- Agora account (for video calling)

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables (see [Quick Start Guide](QUICK_START.md))
4. Start development server: `npm start`

### Project Structure

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

## 🔧 Configuration

### Environment Variables

Create a `.env` file with your credentials:

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

## 🧪 Testing

```bash
# Run tests
npm test

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

## 📦 Building

```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](documentation/DOCUMENTATION.md#contributing) for details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🐛 Troubleshooting

Common issues and solutions are documented in our [Troubleshooting Guide](documentation/DOCUMENTATION.md#troubleshooting).

### Common Issues

- **Firebase not initialized**: Check your `.env` file
- **Video call not working**: Verify Agora credentials
- **Groups not loading**: Check Firestore security rules
- **Performance issues**: Clear app cache and restart

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) for the amazing development platform
- [Firebase](https://firebase.google.com/) for backend services
- [Agora](https://www.agora.io/) for video calling capabilities
- [React Native](https://reactnative.dev/) for the mobile framework
- [Tailwind CSS](https://tailwindcss.com/) for styling

## 📞 Support

- **Documentation**: Check our comprehensive [documentation](documentation/DOCUMENTATION.md)
- **Issues**: Create an issue in the repository
- **Discussions**: Use GitHub discussions for questions
- **Email**: [support@groupmind.app](mailto:support@groupmind.app)

## 🗺️ Roadmap

### Upcoming Features

- [ ] Advanced search and filtering
- [ ] Group analytics and insights
- [ ] Integration with learning management systems
- [ ] Web dashboard for administrators
- [ ] Push notifications
- [ ] Advanced moderation tools

### Version History

- **v1.0.0** - Initial release with core features
- **v1.1.0** - Enhanced suggested groups system
- **v1.2.0** - Improved UI/UX and performance

---

**Made with ❤️ by the GroupMind Team**

For more information, visit our [documentation](documentation/DOCUMENTATION.md) or [quick start guide](documentation/QUICK_START.md).
