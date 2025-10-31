# Firebase Analytics Implementation Plan

## ✅ COMPLETED

### 1. Core Utilities Created
- ✅ `utils/analytics.ts` - Comprehensive analytics tracking functions
- ✅ `utils/statistics.ts` - Database statistics and counters
- ✅ `components/Analytics/PageViewTracker.tsx` - Automatic page view tracking

## 🎯 IMPLEMENTATION NEEDED

### Priority 1: Global Setup (CRITICAL)

1. **Add PageViewTracker to layout.tsx**
   - Import and add `<PageViewTracker />` component
   - This will automatically track all page navigations

2. **Add user tracking to AppContext.tsx**
   - Import `setAnalyticsUserId` and `setAnalyticsUserProperties`
   - Track user login/logout
   - Set user properties when authenticated

### Priority 2: Course Components (HIGH)

3. **CourseDetail.tsx** - Add analytics when viewing courses
   - `logCourseView()` on mount
   - `incrementCourseViews()` in database
   - `logCourseShare()` on share actions
   - `logCourseEnrollment()` on enrollment

4. **CoursesList.tsx** - Track course interactions
   - `logSearch()` when filtering/searching
   - `logSearchResultClick()` when clicking courses

5. **Lesson Component** - Track lesson progress
   - `logLessonView()` on lesson load
   - `logLessonCompletion()` when completed
   - `logVideoPlay()` / `logVideoProgress()` for video tracking
   - `incrementLessonViews()` / `incrementLessonCompletions()` in database

### Priority 3: User Actions (HIGH)

6. **Login.tsx** - Track authentication
   - `logUserLogin('google')` for Google login
   - `logUserLogin('email')` for email login
   - `logUserRegistration()` for new users
   - `trackUserActivity()` in database

7. **Subscription Components** - Track subscription events
   - `logSubscriptionView()` when viewing plans
   - `logSubscriptionSelection()` when selecting plan
   - `logSubscriptionPurchase()` on successful purchase
   - `trackSubscriptionEvent()` in database

8. **Profile Components** - Track user engagement
   - `logButtonClick()` for important actions
   - `logDownload()` for certificate downloads
   - `logCertificateGeneration()` when generating certificates
   - `updateUserCourseProgress()` in database

### Priority 4: Search & Discovery (MEDIUM)

9. **SearchBar.tsx** - Track search behavior
   - `logSearch()` on search execution
   - `logSearchResultClick()` on result selection
   - `trackSearchQuery()` in database

10. **RecommendedCoursesSection.tsx** - Track recommendations
    - `logCourseView()` when viewing recommended courses
    - Track click-through rates

### Priority 5: Admin Actions (MEDIUM)

11. **Admin Course Management** - Track admin actions
    - `logAdminAction()` for all CRUD operations
    - `logContentCreation()` / `logContentUpdate()` / `logContentDeletion()`
    - Use existing `auditLog.ts` for detailed logging

### Priority 6: Payment & Revenue (HIGH)

12. **Payment Components** - Track revenue
    - `trackRevenue()` on successful payments
    - `logSubscriptionPurchase()` for subscriptions
    - `incrementCourseEnrollments()` on course purchases

### Priority 7: Error Tracking (LOW)

13. **Global Error Handling** - Track errors
    - `logError()` in error boundaries
    - `logError()` in catch blocks for critical operations

## 📊 DATABASE SCHEMA UPDATES NEEDED

Add these fields to Firestore documents:

### Course Document
```typescript
{
  viewCount: number,
  enrollmentCount: number,
  completionCount: number,
  rating: number,
  ratingCount: number,
  lastViewedAt: Timestamp,
  lastEnrolledAt: Timestamp,
  lastCompletedAt: Timestamp,
  lastRatedAt: Timestamp
}
```

### Lesson Document
```typescript
{
  viewCount: number,
  completionCount: number,
  totalWatchTime: number,
  watchCount: number,
  lastViewedAt: Timestamp,
  lastCompletedAt: Timestamp
}
```

### User Document
```typescript
{
  enrolledCoursesCount: number,
  completedCoursesCount: number,
  hasActiveSubscription: boolean,
  subscriptionPlan: string
}
```

### Analytics Collections
```typescript
// analytics/platform_stats
{
  totalCourseViews: number,
  totalEnrollments: number,
  totalCompletions: number,
  lastUpdated: Timestamp
}

// analytics/daily_active_users/dates/{date}
{
  users: { [userId]: Timestamp },
  date: string
}

// analytics/search_queries/queries/{query}
{
  query: string,
  searchCount: number,
  totalResults: number,
  lastSearched: Timestamp
}

// analytics/subscriptions/events/{eventId}
{
  userId: string,
  eventType: 'subscribe' | 'cancel' | 'renew',
  planName: string,
  amount: number,
  timestamp: Timestamp
}

// analytics/revenue/daily/{date}
{
  date: string,
  total_usd: number,
  course_revenue_usd: number,
  subscription_revenue_usd: number,
  transactionCount: number,
  lastUpdated: Timestamp
}
```

## 🔧 IMPLEMENTATION ORDER

1. **Global Setup** (30 min)
   - Add PageViewTracker to layout
   - Update AppContext with user tracking

2. **Course Components** (1 hour)
   - CourseDetail, CoursesList, Lesson components

3. **User Actions** (1 hour)
   - Login, Subscriptions, Profile

4. **Search & Admin** (30 min)
   - SearchBar, Admin components

5. **Testing** (30 min)
   - Verify events in Firebase Console
   - Check database counters

## 📝 TESTING CHECKLIST

- [ ] Page views tracked on all pages
- [ ] User login/logout tracked
- [ ] Course views increment in database
- [ ] Course enrollments tracked
- [ ] Lesson completions tracked
- [ ] Video play events tracked
- [ ] Search queries tracked
- [ ] Subscription events tracked
- [ ] Revenue tracked
- [ ] Admin actions tracked
- [ ] Errors logged
- [ ] Analytics visible in Firebase Console

## 🚀 DEPLOYMENT NOTES

1. Ensure `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` is set in environment
2. Deploy Firestore rules to allow analytics collection writes
3. Monitor Firebase Analytics dashboard for incoming events
4. Set up custom dashboards in Firebase Console
5. Configure data retention policies

## 💡 BEST PRACTICES

- Always wrap analytics calls in try-catch
- Don't let analytics failures break user experience
- Track user privacy preferences (cookie consent)
- Implement sampling for high-volume events
- Use meaningful event names and parameters
- Document all custom events
- Review analytics data weekly
