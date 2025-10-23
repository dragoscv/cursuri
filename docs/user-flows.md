# User Flows Documentation - Cursuri Platform

## Overview

This document outlines the complete user journeys through the Cursuri online course platform, covering all critical paths from discovery to completion.

---

## 🎓 Primary User Flows

### 1. New User Registration → Course Purchase → Learning Flow

#### **Phase 1: Discovery & Registration**

```
┌─────────────────────────────────────────────────────────┐
│ 1. Landing Page Visit                                   │
│    └─ Entry Points:                                     │
│       • Direct URL                                      │
│       • Search engine (SEO)                             │
│       • Social media referral                           │
│       • Email marketing campaign                        │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Browse Content (Unauthenticated)                    │
│    └─ Actions Available:                                │
│       • View hero section with statistics               │
│       • Browse recommended courses                      │
│       • Search for specific courses                     │
│       • Filter courses by category/level                │
│       • View course details (limited)                   │
│       • Read reviews and ratings                        │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Click "Get Started" or "Enroll" Button              │
│    └─ Modal Opens: Login/Registration                   │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Registration Form                                     │
│    └─ Required Fields:                                  │
│       • Email address (validation)                      │
│       • Password (min 8 chars, strength indicator)      │
│       • Confirm password                                │
│       • Accept terms and conditions                     │
│    └─ Optional:                                         │
│       • Display name                                    │
│       • Profile picture                                 │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ 5. Email Verification                                    │
│    └─ Firebase sends verification email                 │
│    └─ User clicks verification link                     │
│    └─ Redirected to platform with verified status       │
└─────────────────────────────────────────────────────────┘

**Success Criteria:**
- Account created in Firebase Auth
- User document created in Firestore
- Email verification sent
- User redirected to course page or dashboard

**Error Handling:**
- Email already exists → Show error, offer "Forgot Password"
- Weak password → Show requirements, suggest stronger password
- Network error → Show retry button, save form data
- Verification email not received → Resend option available
```

#### **Phase 2: Course Selection & Purchase**

```
┌─────────────────────────────────────────────────────────┐
│ 6. Browse Courses (Authenticated)                       │
│    └─ Enhanced Features:                                │
│       • Personalized recommendations                    │
│       • Continue where you left off                     │
│       • Saved/bookmarked courses                        │
│       • Full course details visible                     │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ 7. View Course Details                                  │
│    └─ Information Displayed:                            │
│       • Course title, description, thumbnail            │
│       • Instructor profile and credentials              │
│       • Course curriculum (lessons list)                │
│       • Duration, difficulty level, prerequisites       │
│       • Student reviews and ratings                     │
│       • Technologies/tools covered                      │
│       • Price and payment options                       │
│       • Preview video (if available)                    │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ 8. Click "Buy Now" or "Enroll"                         │
│    └─ Free Course:                                      │
│       • Instant enrollment                              │
│       • Skip payment flow                               │
│    └─ Paid Course:                                      │
│       • Proceed to payment                              │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ 9. Stripe Payment Flow (Paid Courses)                  │
│    └─ Steps:                                            │
│       • Redirect to Stripe Checkout                     │
│       • Enter payment details (card/wallet)             │
│       • Review order summary                            │
│       • Complete payment                                │
│       • Stripe webhook processes payment                │
│       • User document updated with purchase             │
│       • Redirect back to platform                       │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ 10. Payment Confirmation                                │
│     └─ User sees:                                       │
│        • Success message                                │
│        • Receipt/invoice (downloadable)                 │
│        • "Start Learning" button                        │
│     └─ System actions:                                  │
│        • Grant course access                            │
│        • Send confirmation email                        │
│        • Update user's enrolled courses                 │
│        • Initialize progress tracking                   │
└─────────────────────────────────────────────────────────┘

**Success Criteria:**
- Payment processed successfully
- User has access to all course content
- Progress tracking initialized
- Confirmation email sent

**Error Handling:**
- Payment declined → Show error, offer retry
- Payment timeout → Save cart, allow resume
- Network error → Verify payment status, prevent double charge
- Session expired → Restore cart, resume checkout
```

#### **Phase 3: Learning Experience**

```
┌─────────────────────────────────────────────────────────┐
│ 11. Course Dashboard                                    │
│     └─ Overview:                                        │
│        • Course progress percentage                     │
│        • Next recommended lesson                        │
│        • Recently watched lessons                       │
│        • Course materials/downloads                     │
│        • Discussion forum access                        │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ 12. Start First Lesson                                  │
│     └─ Lesson Page Components:                          │
│        • Video player (controls, quality, captions)     │
│        • Lesson description and objectives              │
│        • Code examples/resources                        │
│        • Note-taking area                               │
│        • Q&A section                                    │
│        • Previous/Next lesson navigation                │
│        • Mark as complete button                        │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ 13. Watch Lesson Video                                  │
│     └─ Features:                                        │
│        • Auto-play next lesson                          │
│        • Playback speed control                         │
│        • Video bookmarks                                │
│        • Resume from last position                      │
│        • Keyboard shortcuts (space, arrows, f)          │
│        • Picture-in-picture mode                        │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ 14. Complete Lesson                                     │
│     └─ Actions:                                         │
│        • Mark lesson as complete (manual/auto)          │
│        • Progress updated in Firebase                   │
│        • Certificate progress tracked                   │
│        • Next lesson suggested                          │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ 15. Continue Learning Journey                           │
│     └─ Repeat steps 12-14 for each lesson              │
│     └─ Track progress: 0% → 25% → 50% → 75% → 100%    │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ 16. Complete Course (100%)                              │
│     └─ Achievements:                                    │
│        • Certificate of completion generated            │
│        • Download certificate (PDF)                     │
│        • Share on social media                          │
│        • Write course review                            │
│        • Recommended next courses                       │
└─────────────────────────────────────────────────────────┘

**Success Criteria:**
- Video playback works smoothly
- Progress saved automatically
- Notes and bookmarks persist
- Certificate generated correctly
- User satisfied with learning experience

**Error Handling:**
- Video won't load → Show troubleshooting, try different quality
- Progress not saving → Local backup, sync when online
- Certificate generation fails → Retry button, support contact
```

---

## 🔐 Returning User Flow (Login)

```
┌─────────────────────────────────────────────────────────┐
│ 1. Click "Login" Button                                 │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Login Modal                                          │
│    └─ Fields:                                           │
│       • Email                                           │
│       • Password (with show/hide toggle)                │
│       • Remember me checkbox                            │
│       • Forgot password link                            │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Submit Credentials                                    │
│    └─ Firebase Authentication                           │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Success: Redirect to Profile Dashboard              │
│    └─ Shows:                                            │
│       • Enrolled courses                                │
│       • Continue watching                               │
│       • Progress statistics                             │
│       • Certificates                                    │
└─────────────────────────────────────────────────────────┘

**Error Handling:**
- Wrong password → Show error, suggest password reset
- Account not verified → Resend verification email
- Account disabled → Show support contact
- Too many attempts → Temporary lockout with timer
```

---

## 👨‍💼 Admin Workflows

### Admin Course Management Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. Admin Login                                          │
│    └─ Special credentials: admin@cursuri-platform.com   │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Access Admin Dashboard                               │
│    └─ Admin Menu Appears in Header                      │
│    └─ Navigate to /admin                                │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Admin Dashboard Overview                             │
│    └─ Sections:                                         │
│       • Analytics (students, revenue, engagement)       │
│       • Course management                               │
│       • User management                                 │
│       • Payment records                                 │
│       • Reviews moderation                              │
│       • System settings                                 │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Create New Course                                    │
│    └─ Step 1: Basic Information                         │
│       • Course name (i18n)                              │
│       • Description (i18n)                              │
│       • Category selection                              │
│       • Difficulty level                                │
│       • Tags/technologies                               │
│    └─ Step 2: Pricing                                   │
│       • Create Stripe product                           │
│       • Set price (or mark as free)                     │
│       • Currency selection                              │
│    └─ Step 3: Media                                     │
│       • Upload thumbnail                                │
│       • Upload preview video (optional)                 │
│    └─ Step 4: Curriculum                                │
│       • Add sections/chapters                           │
│       • Create lessons                                  │
│       • Upload lesson videos                            │
│       • Add lesson materials                            │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ 5. Publish Course                                       │
│    └─ Validation checks:                                │
│       • All required fields filled                      │
│       • At least one lesson exists                      │
│       • Thumbnail uploaded                              │
│       • Price configured (if paid)                      │
│    └─ Course goes live immediately                      │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ 6. Monitor Course Performance                           │
│    └─ Metrics:                                          │
│       • Enrollment count                                │
│       • Completion rate                                 │
│       • Average rating                                  │
│       • Revenue generated                               │
│       • Student feedback                                │
└─────────────────────────────────────────────────────────┘

**Admin Permissions:**
- Create, edit, delete courses
- Manage all users
- View all payments
- Moderate reviews
- Access analytics
- Configure system settings
```

---

## 🚨 Error Handling Flows

### Network Error Recovery

```
User Action → Network Request → Timeout/Failure
     ↓
Show Error UI
     ├─ "Network error occurred"
     ├─ [Retry Button]
     └─ Save unsaved data locally
     ↓
User Clicks Retry
     ↓
Check Network Status
     ├─ Online → Retry request
     └─ Offline → Show offline mode
```

### Payment Failure Recovery

```
Payment Initiated → Stripe Error
     ↓
Determine Error Type
     ├─ Card Declined
     │    └─ Allow user to try different card
     ├─ Insufficient Funds
     │    └─ Suggest alternative payment method
     ├─ Network Timeout
     │    └─ Verify payment status, retry if not charged
     └─ System Error
          └─ Contact support, provide transaction ID
```

---

## 📊 Success Metrics per Flow

### Registration Flow

- **Success Rate**: >90% of form submissions
- **Time to Complete**: <2 minutes
- **Email Verification**: >85% verified within 24 hours

### Purchase Flow

- **Conversion Rate**: >15% from course view to purchase
- **Payment Success**: >98% of payment attempts
- **Abandonment Recovery**: Email reminder after 24 hours

### Learning Flow

- **Lesson Completion**: >70% of started lessons completed
- **Course Completion**: >40% of enrolled students complete
- **Satisfaction**: >4.5/5 average course rating

---

## 🎯 Optimization Opportunities

1. **Reduce Registration Friction**: Social login (Google, GitHub)
2. **Improve Discovery**: AI-powered recommendations
3. **Enhance Engagement**: Gamification, badges, leaderboards
4. **Streamline Payment**: Saved payment methods, one-click buy
5. **Boost Completion**: Email reminders, progress milestones

---

**Document Version**: 1.0  
**Last Updated**: October 24, 2025  
**Next Review**: Quarterly based on analytics
