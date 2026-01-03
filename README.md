# Uni-Ride

A cross-platform mobile application for university ride-sharing. Connect students for carpooling to save money and reduce environmental impact.

## Features

- **User Authentication**: Secure signup/login with university email verification
- **Ride Posting**: Drivers can post available rides with route, time, and seats
- **Ride Search & Booking**: Riders can search and book available rides
- **Real-time Messaging**: In-app chat between drivers and riders
- **Rating System**: Rate and review after each ride
- **Push Notifications**: Get notified about bookings and messages
- **Payment Integration**: Secure in-app payments

## Tech Stack

- **Mobile App**: React Native + Expo
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Real-time**: Socket.io
- **Authentication**: JWT

## Project Structure

```
uni-ride/
├── mobile/              # React Native Expo app
│   ├── src/
│   │   ├── screens/     # App screens
│   │   ├── components/  # Reusable components
│   │   ├── navigation/  # Navigation setup
│   │   ├── services/    # API services
│   │   ├── context/     # React Context
│   │   └── utils/       # Utility functions
│   └── App.js
├── server/              # Node.js backend
│   ├── config/          # Configuration
│   ├── controllers/     # Route controllers
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   └── index.js
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your phone

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd server && npm install
   ```
3. Install mobile app dependencies:
   ```bash
   cd mobile && npm install
   ```
4. Set up environment variables (see `.env.example`)
5. Start MongoDB
6. Run the backend: `cd server && npm start`
7. Run the mobile app: `cd mobile && npx expo start`

## License

MIT
