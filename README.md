# Cursuri - Online Course Platform

An interactive online course platform built with Next.js, TypeScript, Firebase, and Stripe integration. This application allows users to browse, purchase, and engage with educational courses.

## Features

- **Course Marketplace**: Browse and purchase courses with Stripe payment integration
- **User Authentication**: Firebase authentication for user management
- **Secure Content Access**: Access to course content only after purchase
- **Course Lessons**: Organized lesson structure for each course
- **Review System**: Allow users to leave reviews for courses
- **Admin Panel**: Course and lesson management for administrators
- **Responsive Design**: Mobile-friendly interface using TailwindCSS and NextUI
- **Dark/Light Mode**: Theme toggle functionality
- **Captions and Transcriptions**: Automatically generate captions and transcriptions for lesson content using Azure Speech Service

## Technology Stack

- **Frontend Framework**: Next.js 15.2.4
- **Language**: TypeScript
- **Styling**: TailwindCSS 4.1.2, NextUI
- **UI Components**: @heroui/react, framer-motion
- **Authentication & Database**: Firebase (Authentication, Firestore, Storage)
- **Payment Processing**: Stripe via @invertase/firestore-stripe-payments
- **Speech Services**: Azure Speech Service for transcription and caption generation
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Firebase account
- Stripe account
- Azure account (for Speech Service)

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Azure Speech Service Configuration
NEXT_PUBLIC_AZURE_SPEECH_API_KEY=your_azure_speech_api_key
NEXT_PUBLIC_AZURE_SPEECH_API_REGION=your_azure_region

# Stripe Configuration (on Firebase Extension)
# No environment variables needed as they're managed through the Firebase Stripe Extension
```

### Firebase Configuration

1. Create a new Firebase project
2. Enable Authentication (Email/Password)
3. Create Firestore Database
4. Set up Storage
5. Install the [Stripe Extension for Firebase](https://firebase.google.com/products/extensions/firestore-stripe-payments)

### Stripe Configuration

1. Create a Stripe account
2. Configure the Firebase Stripe Extension with your Stripe API keys
3. Create products and prices in Stripe (these will sync to Firebase)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd cursuri

# Install dependencies
npm install
# or
yarn install

# Run the development server
npm run dev
# or
yarn dev
```

### Database Structure

The application uses the following Firestore collections:

- **courses**: Course information

  - Fields: name, description, status, price, priceProduct
  - Sub-collection: **lessons**
    - Fields: name, content, status, order
  - Sub-collection: **reviews**
    - Fields: rating, comment, userId, userName

- **customers**: User specific data

  - Sub-collection: **payments**
    - Payment records from Stripe

- **products**: Stripe products (managed by Stripe Extension)
  - Product information synced from Stripe

## Key Components

- **AppContext.tsx**: Global state management
- **Courses.tsx**: Main courses display and purchasing
- **Course/Course.tsx**: Individual course display with lessons
- **Course/Lesson.tsx**: Lesson content display
- **Login.tsx**: Authentication component
- **Profile.tsx**: User profile management

## Deployment

This project is set up to be deployed on Vercel:

```bash
npm run build
# or
yarn build
```

For other deployment options, please refer to the [Next.js deployment documentation](https://nextjs.org/docs/deployment).

## Admin Access

Admin functionality is currently tied to specific email addresses. Update the AppContext.tsx file to include your admin email:

```typescript
if (user.email === "youradmin@email.com") {
  dispatch({ type: "SET_IS_ADMIN", payload: true });
}
```

## License

[Specify your license here]

## Contributors

[List contributors here]
