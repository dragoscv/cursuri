import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { requireAuth, checkRateLimit } from '@/utils/api/auth';
import { logAdminAction } from '@/utils/auditLog';
import { validateRequestBody, APISchemas } from '@/utils/security/inputValidation';

/**
 * Generate Course Completion Certificate
 *
 * Security:
 * - Requires user authentication
 * - Verifies course completion before generating certificate
 * - Rate limited to 5 certificates per minute per user
 * - User can only generate certificates for courses they completed
 */
export async function POST(req: NextRequest) {
  try {
    // Check if we're in build mode
    const isBuild = process.env.NODE_ENV !== 'production' || !process.env.FIREBASE_PRIVATE_KEY;

    // If we're building, return a mock response to allow the build to complete
    if (isBuild) {
      return NextResponse.json({
        success: true,
        message: 'This is a mock certificate response for build time',
        certificateUrl: 'https://example.com/mock-certificate.pdf',
      });
    }

    // Require authentication
    const authResult = await requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    const user = authResult.user!;
    const userId = user.uid;

    // Validate request body
    const validation = await validateRequestBody(req, APISchemas.certificateRequest);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.errors },
        { status: 400 }
      );
    }

    const { courseId } = validation.data!;

    // Rate limiting: 5 certificates per minute per user
    const rateLimitAllowed = await checkRateLimit(`certificate:${userId}`, 5, 60000);
    if (!rateLimitAllowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Fetch user and course info
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(userId).get();
    const courseDoc = await db.collection('courses').doc(courseId).get();

    if (!userDoc.exists || !courseDoc.exists) {
      return NextResponse.json({ error: 'User or course not found' }, { status: 404 });
    }

    // Verify course completion before generating certificate
    const progressDoc = await db
      .collection('users')
      .doc(userId)
      .collection('progress')
      .doc(courseId)
      .get();

    if (!progressDoc.exists) {
      return NextResponse.json({ error: 'Course not enrolled or completed' }, { status: 403 });
    }

    const progressData = progressDoc.data();
    const completionPercentage = progressData?.completionPercentage || 0;

    // Require at least 90% completion to generate certificate
    if (completionPercentage < 90) {
      return NextResponse.json(
        {
          error: 'Course not completed. Minimum 90% completion required for certificate.',
          currentProgress: completionPercentage,
        },
        { status: 403 }
      );
    }

    const course = courseDoc.data();

    // Generate a more professional certificate
    const pdfDoc = await PDFDocument.create();

    // Create a premium-looking certificate with A4 landscape
    const page = pdfDoc.addPage([841.89, 595.28]); // A4 landscape

    // Get fonts
    const titleFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const bodyFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    // Define colors
    const primaryColor = rgb(0.2, 0.2, 0.6); // Deep blue
    const accentColor = rgb(0.7, 0.5, 0.1); // Gold
    const textColor = rgb(0.1, 0.1, 0.1); // Near black

    // Draw border
    page.drawRectangle({
      x: 20,
      y: 20,
      width: 801.89,
      height: 555.28,
      borderColor: accentColor,
      borderWidth: 3,
      color: rgb(1, 1, 1),
    });

    // Inner decorative border
    page.drawRectangle({
      x: 30,
      y: 30,
      width: 781.89,
      height: 535.28,
      borderColor: accentColor,
      borderWidth: 1,
      color: rgb(1, 1, 1),
    });

    // Certificate title
    page.drawText('CERTIFICATE OF COMPLETION', {
      x: 250,
      y: 500,
      size: 28,
      font: titleFont,
      color: primaryColor,
    });

    // Cursuri logo position
    page.drawText('CURSURI', {
      x: 375,
      y: 460,
      size: 20,
      font: titleFont,
      color: accentColor,
    });

    // This certifies that text
    page.drawText('This certifies that', {
      x: 320,
      y: 380,
      size: 16,
      font: bodyFont,
      color: textColor,
    });

    // Student name (prominently displayed)
    const userName = user?.displayName || user?.email || 'Student';
    const nameWidth = titleFont.widthOfTextAtSize(userName, 26);
    const nameX = (841.89 - nameWidth) / 2; // Center horizontally

    page.drawText(userName, {
      x: nameX,
      y: 340,
      size: 26,
      font: titleFont,
      color: textColor,
    });

    // Has successfully completed text
    page.drawText('has successfully completed the course', {
      x: 280,
      y: 300,
      size: 16,
      font: bodyFont,
      color: textColor,
    });

    // Course name (prominently displayed)
    const courseName = course?.name || 'Course';
    const courseWidth = titleFont.widthOfTextAtSize(courseName, 22);
    const courseX = (841.89 - courseWidth) / 2; // Center horizontally

    page.drawText(courseName, {
      x: courseX,
      y: 260,
      size: 22,
      font: titleFont,
      color: accentColor,
    });

    // Completion date
    const completionDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    page.drawText(`Awarded on ${completionDate}`, {
      x: 320,
      y: 200,
      size: 14,
      font: bodyFont,
      color: textColor,
    });

    // Signature line
    page.drawLine({
      start: { x: 250, y: 130 },
      end: { x: 450, y: 130 },
      thickness: 1,
      color: primaryColor,
    });

    // Signature text
    page.drawText('Course Instructor', {
      x: 300,
      y: 110,
      size: 14,
      font: bodyFont,
      color: textColor,
    });

    // Certificate ID
    const certificateId = `${courseId.substring(0, 6)}-${userId.substring(0, 6)}-${Date.now().toString().substring(6, 12)}`;
    page.drawText(`Certificate ID: ${certificateId}`, {
      x: 320,
      y: 50,
      size: 10,
      font: bodyFont,
      color: textColor,
    });

    // Store certificate information in Firestore for records
    await db.collection('users').doc(userId).collection('certificates').doc(certificateId).set({
      courseId,
      courseName,
      completionDate: new Date().toISOString(),
      certificateId,
      downloadedAt: new Date().toISOString(),
    });

    // Log certificate generation
    await logAdminAction(
      'certificate_generated',
      req,
      user,
      'certificate',
      certificateId,
      { courseId, courseName, completionPercentage },
      true
    );

    // Convert to PDF and return
    const pdfBytes = await pdfDoc.save();
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificate-${certificateId}.pdf"`,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    // Log certificate generation error
    try {
      const authResult = await requireAuth(req);
      if (!(authResult instanceof NextResponse)) {
        await logAdminAction(
          'certificate_generation_failed',
          req,
          authResult.user!,
          'certificate',
          undefined,
          { errorMessage },
          false
        );
      }
    } catch {
      // Ignore logging errors in error handler
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
