# 🎫 Ticket Booking App

## Overview

The **Ticket Booking App** provides a smooth and user-friendly platform for online bus ticket booking.  
Users can search for buses, select seats, and make payments directly in the app.  
Admins can add, delete, or view buses, manage users, and handle user complaints.

Built with **React Native (Expo SDK 54)** and **Firebase**, this app ensures real-time data synchronization and fast performance.

---


## Features

### For Normal Users
-  Login / Register using Firebase Authentication  
-  Search buses by **From**, **To**, and **Date**  
-  View and select available seats  
-  Make payments securely  
-  Download and view booked tickets  
-  View ticket booking history  
-  Submit complaints  

###  For Admin Users
-  Add, edit, or delete buses  
-  View and delete users  
-  View all complaints from users  
-  Manage booking information  

---


##  Dependencies

Below are the main dependencies used in this project:

| Package | Version |
|----------|----------|
| expo | 54.0.17 |
| react | 19.1.0 |
| react-native | 0.81.5 |
| expo-router | 6.0.13 |
| expo-constants | 18.0.10 |
| expo-font | 14.0.9 |
| expo-linking | 8.0.8 |
| expo-print | 15.0.7 |
| expo-splash-screen | 31.0.10 |
| expo-status-bar | 3.0.8 |
| @expo/vector-icons | 15.0.2 |
| @react-native-community/datetimepicker | 8.4.4 |
| @react-native-picker/picker | 2.11.1 |
| react-native-gesture-handler | 2.28.0 |
| react-native-reanimated | 4.1.3 |
| react-native-safe-area-context | 5.6.1 |
| react-native-screens | 4.16.0 |
| react-native-svg | 15.12.1 |
| react-native-qrcode-svg | 6.3.15 |
| react-native-worklets | 0.5.1 |
| firebase | 12.4.0 |

---

##  Installation (Run Locally)

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/ticket-booking-app.git
cd ticket-booking-app
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the app:**
```bash
npx expo start
```

4. **Run on device:**
   - Scan the QR code with **Expo Go App** (Android/iOS), or  
   - Run on an emulator.

---


##  Firebase Setup

To connect Firebase:

1. Go to [Firebase Console](https://console.firebase.google.com/)  
2. Create a new project  
3. Add a **Web App** and copy its config  
4. Paste the configuration inside your project file:

```js
// firebaseConfig.js
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

export const app = initializeApp(firebaseConfig);
```

5. Enable **Authentication** and **Firestore Database** in Firebase.

---


##  Tech Stack

- **Frontend:** React Native (Expo)
- **Backend:** Firebase
- **Database:** Firestore
- **Authentication:** Firebase Auth
- **Build Tool:** EAS CLI

---

##  Build APK with EAS

To build a local or remote APK:
```bash
eas build -p android --profile preview
```
After build completes, Expo will give you a download link for your APK — use that in the **Download APK** section above.

---

## Author

**Masud Rana Mushfiq**  
Computer Science Student – Bangladesh  
Passionate about coding and mobile app development  
[GitHub Profile](https://github.com/MasudRanaMushfiq)

