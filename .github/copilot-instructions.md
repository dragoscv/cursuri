# GitHub Copilot Instructions for Cursuri Project

This document provides context and guidance for GitHub Copilot when working with the Cursuri online course platform codebase.

## Project Overview

Cursuri is a Next.js application for an online course platform with the following features:

- Course marketplace with Stripe payment integration
- Firebase authentication and database integration
- Course and lesson management
- Admin functionality
- Review system

## Key Technologies

- **Frontend**: Next.js 15.2.4, React 19
- **Language**: TypeScript
- **Styling**: TailwindCSS 4.1.2, HeroUI components
- **State Management**: React Context API (AppContext)
- **Backend/Database**: Firebase (Firestore)
- **Authentication**: Firebase Authentication
- **File Storage**: Firebase Storage
- **Payments**: Stripe via firewand (wrapper around @invertase/firestore-stripe-payments)

## Code Structure and Architecture

### Main Components

1. **AppContext.tsx**

   - Central state management
   - Manages user authentication state
   - Handles theme switching
   - Controls modal display
   - Fetches courses, lessons, and user purchases
   - Admin state management

2. **Courses.tsx**

   - Main course listing component
   - Handles course purchase flow
   - Initiates Stripe checkout sessions

3. **Course Components**

   - **Course.tsx**: Individual course display
   - **Lesson.tsx**: Lesson content display
   - **AddCourse.tsx**: Admin component for adding courses
   - **AddLesson.tsx**: Admin component for adding lessons
   - **Reviews.tsx**: Course review component

4. **Authentication Components**

   - **Login.tsx**: Login/registration component
   - **Profile.tsx**: User profile management

5. **UI Components**
   - **Modal.tsx**: Reusable modal component
   - **Header.tsx**: Application header
   - **LoadingButton.tsx**: Button with loading state

### Data Flow

The application follows this general data flow:

1. AppContext fetches data from Firebase
2. Components consume data from AppContext
3. User interactions trigger context actions
4. Context actions update Firebase or local state
5. Components re-render with updated data

## Firebase Structure

The Firestore database has the following collections:

```
courses/
  {courseId}/
    lessons/
      {lessonId}
    reviews/
      {reviewId}
customers/
  {userId}/
    payments/
      {paymentId}
products/  (managed by Stripe extension)
```

## Common Code Patterns

### Modal Usage

Modals are managed through the AppContext using the openModal, closeModal, and updateModal functions. The pattern for opening a modal is:

```typescript
openModal({
  id: "uniqueId", // Required - unique identifier for the modal
  isOpen: true, // Required - controls visibility
  modalBody: "componentName", // Required - can be a string ID or a React component

  // Optional parameters with their defaults
  hideCloseIcon: false, // Hide the X icon in the top-right
  hideCloseButton: false, // Hide the Close button in the footer
  backdrop: "blur", // 'blur', 'opaque', or 'transparent'
  size: "md", // 'xs', 'sm', 'md', 'lg', 'xl', 'full'
  scrollBehavior: "inside", // 'inside' or 'outside'
  isDismissable: true, // Can click outside to dismiss
  modalHeader: "Header Text", // Text or component for the header
  headerDisabled: false, // Hide the header completely
  footerDisabled: true, // Hide the footer completely
  footerButtonText: null, // Custom text for footer button
  footerButtonClick: null, // Handler for footer button click
  modalBottomComponent: null, // Component to render at bottom of modal
  noReplaceURL: false, // Don't modify browser history
  onClose: () => closeModal("uniqueId"), // Close handler
});
```

Modals are rendered automatically by the AppContextProvider, which maps over all modals in state and renders the ModalComponent for each one.

The most common modal types include:

- `login` - User authentication modal
- `checkout` - Payment processing modal
- Custom component modals for forms and dialogs

To close a modal, use the closeModal function with the modal's ID:

```typescript
closeModal("uniqueId");
```

To update an existing modal, use the updateModal function:

```typescript
updateModal({
  id: "uniqueId",
  // Any properties to update
  modalBody: <NewComponent />,
});
```

### Firebase Data Fetching

Data is typically fetched using:

1. `getDocs` for one-time queries
2. `onSnapshot` for real-time updates

```typescript
// One-time query example
const q = query(
  collection(firestoreDB, "courses"),
  where("status", "==", "active")
);
const querySnapshot = await getDocs(q);
querySnapshot.forEach((doc) => {
  // Process document
});

// Real-time updates example
const unsubscribe = onSnapshot(q, (querySnapshot) => {
  querySnapshot.forEach((doc) => {
    // Process document
  });
});
```

### Payment Processing

Payments use the Stripe integration with this pattern:

```typescript
const payments = stripePayments(firebaseApp);
const session = await createCheckoutSession(payments, {
  price: priceId,
  allow_promotion_codes: true,
  mode: "payment",
  metadata: {
    courseId: courseId,
  },
});
window.location.assign(session.url);
```

## Payment Processing with Firewand

The application uses the firewand library (version 0.5.15) as a wrapper around the @invertase/firestore-stripe-payments package to handle Stripe integration with Firebase. Here's how it's implemented:

### Firewand Implementation

Firewand is imported in `utils/firebase/stripe.ts` and provides the following functionality:

```typescript
import {
  getStripePayments,
  getCurrentUserSubscription,
  getCurrentUserSubscriptions,
  StripePayments,
  getProducts,
  createCheckoutSession,
} from "firewand";
```

### Key Firewand Functions

1. **getStripePayments**: Initializes the Stripe payments configuration with Firebase

   ```typescript
   export const stripePayments = (firebaseApp: FirebaseApp): StripePayments =>
     getStripePayments(firebaseApp, {
       productsCollection: "products",
       customersCollection: "/customers",
     });
   ```

2. **createCheckoutSession**: Creates a Stripe checkout session

   ```typescript
   const session = await createCheckoutSession(payments, {
     price: priceId,
     allow_promotion_codes: true,
     success_url: `${window.location.href}?paymentStatus=success`,
     cancel_url: `${window.location.href}?paymentStatus=cancel`,
   });
   ```

3. **getCurrentUserSubscription/getCurrentUserSubscriptions**: Retrieves user subscription data

4. **getProducts**: Retrieves product data from Firestore

The integration follows this pattern:

1. Initialize the Stripe payments with Firebase app
2. Create checkout sessions with product/price information
3. Redirect users to Stripe checkout page
4. Process successful payments in the Firebase database

When implementing payment-related features, always use the firewand library instead of directly using the @invertase/firestore-stripe-payments package.

## Development Guidelines

### Adding New Features

When adding new features:

1. Update types in `/types/index.d.ts` if needed
2. Consider impact on AppContext state
3. Follow existing modal and component patterns
4. Consider admin vs. regular user access control

### State Management

- Use AppContext for global state
- Use local state (useState) for component-specific state
- Use Firebase for persistent data storage

### Authentication

The app uses Firebase Authentication with email/password. The login flow is:

1. User enters credentials
2. Firebase auth is called
3. On success, user data is stored in AppContext
4. Admin status is set based on email address

### Admin Functionality

Admin functionality is determined by the user's email address:

```typescript
if (user.email === "adminEmail@example.com") {
  dispatch({ type: "SET_IS_ADMIN", payload: true });
}
```

### Styling Guide

- The app uses TailwindCSS for styling
- HeroUI components are used for UI elements
- Dark/light mode is supported through the theme context

## Common Tasks

### Adding a New Course Component

1. Create the component in `/components/Course/`
2. Import and use AppContext
3. Add to the appropriate parent component
4. Update types if needed

### Adding a New API Route

1. Create the route in `/app/api/`
2. Handle authentication if needed
3. Connect to Firebase as required

### Troubleshooting

- **Authentication Issues**: Check Firebase configuration
- **Payment Issues**: Verify Stripe extension setup
- **Data Fetching Issues**: Check Firebase security rules and query structure
- **UI Issues**: Check component props and TailwindCSS classes

## Environment Setup

The application requires the following environment variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
```

## Testing

When implementing new features, test:

1. Authentication flows
2. Course purchase flows
3. Lesson access control
4. Admin functionality
5. Responsive design (mobile, tablet, desktop)

## Future Improvements

Consider suggesting improvements in these areas:

1. Enhanced authentication options (social login)
2. Subscription-based course access
3. Video content integration
4. Progress tracking for users
5. Certificate generation
6. Improved admin dashboard
