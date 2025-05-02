# Certificate System Documentation

This document outlines the implementation of the certificate generation and management system in the Cursuri platform.

## Overview

The certificate system allows users to receive professionally designed certificates upon completion of courses. These certificates serve as proof of course completion and can be downloaded by users at any time.

## Features

1. **Automatic Certificate Generation**

   - PDF certificates generated using pdf-lib
   - Elegant design with decorative elements
   - Unique certificate ID for verification
   - Stores certificate records in user's profile

2. **Certificate Management**

   - Dedicated certificates page in user profile
   - Historical record of all earned certificates
   - Ability to re-download certificates at any time

3. **Course Completion Recognition**
   - Prominent certificate download option upon course completion
   - Visual celebration of course completion achievement

## Technical Implementation

### Certificate Generation

The certificate generation is handled by the API route at `/api/certificate/route.ts`. It uses the pdf-lib library to create professional PDF certificates with:

- Decorative borders
- Professional typography
- Course and user information
- Unique certificate ID
- Completion date

```typescript
// Certificate generation with pdf-lib
const pdfDoc = await PDFDocument.create();
const page = pdfDoc.addPage([841.89, 595.28]); // A4 landscape

// Get fonts
const titleFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
const bodyFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

// Draw decorative elements and text
// ...

// Generate unique certificate ID
const certificateId = `${courseId.substring(0, 6)}-${userId.substring(
  0,
  6
)}-${Date.now().toString().substring(6, 12)}`;

// Store certificate in user's profile
await db
  .collection("users")
  .doc(userId)
  .collection("certificates")
  .doc(certificateId)
  .set({
    courseId,
    courseName,
    completionDate: new Date().toISOString(),
    certificateId,
    downloadedAt: new Date().toISOString(),
  });
```

### User Interface Components

1. **Course Completion Card**

   When a user completes 100% of a course, they are presented with a congratulatory card that includes a prominent Download Certificate button.

2. **Certificate Navigation Link**

   Added a Certificates link in the profile sidebar navigation to allow users to access their certificates.

3. **Certificates Profile Page**

   Created a dedicated page at `/profile/certificates` that displays all certificates earned by the user in a grid layout with:

   - Course name
   - Completion date
   - Certificate ID
   - Download option

## Certificate Verification (Future Enhancement)

A future enhancement will be to implement a certificate verification system that allows:

1. Public verification of certificate authenticity
2. QR code on certificates linking to verification page
3. Employer access to verify certificate validity

## Implementation Notes

- Certificate records are stored in a subcollection of the user document: `users/{userId}/certificates/{certificateId}`
- Each certificate has a unique ID composed of parts of the course ID, user ID, and timestamp
- Certificates are generated on-demand when requested by the user

## Testing

To test the certificate system:

1. Complete a course to 100%
2. Click the Download Certificate button on the course page
3. Check the profile Certificates page to ensure the certificate is listed
4. Try re-downloading the certificate from the profile page

## Security Considerations

- Certificate generation is protected by Firebase Authentication
- API endpoint requires a valid Firebase ID token
- Certificate history is only accessible to the authenticated user
