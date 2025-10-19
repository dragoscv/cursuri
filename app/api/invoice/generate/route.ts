import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { firebaseApp } from '@/utils/firebase/firebase.config';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { requireAuth, canAccessResource, checkRateLimit } from '@/utils/api/auth';

// Initialize Firebase
const db = getFirestore(firebaseApp);

/**
 * Generate Invoice PDF
 * 
 * Security:
 * - Requires user authentication
 * - Users can only generate invoices for their own payments
 * - Admins can generate invoices for any user
 * - Rate limited to 10 invoices per minute per user
 */
export async function POST(request: NextRequest) {
    try {
        // Require authentication
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) return authResult;

        const authenticatedUser = authResult.user!;

        const { paymentId, userId } = await request.json();

        if (!paymentId || !userId) {
            return NextResponse.json({ error: 'Missing payment ID or user ID' }, { status: 400 });
        }

        // Verify user can access this resource (owner or admin)
        if (!canAccessResource(authenticatedUser, userId)) {
            return NextResponse.json(
                { error: 'Forbidden. You can only generate invoices for your own payments.' },
                { status: 403 }
            );
        }

        // Rate limiting: 10 invoices per minute per user
        if (!checkRateLimit(`invoice:${authenticatedUser.uid}`, 10, 60000)) {
            return NextResponse.json(
                { error: 'Rate limit exceeded. Please try again later.' },
                { status: 429 }
            );
        }

        // Get payment details from Firebase
        const paymentRef = doc(db, `customers/${userId}/payments/${paymentId}`);
        const paymentSnap = await getDoc(paymentRef);

        if (!paymentSnap.exists()) {
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
        }

        const paymentData = paymentSnap.data();

        // Get user data
        const userRef = doc(db, `users/${userId}`);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.exists() ? userSnap.data() : { displayName: 'Customer', email: 'customer@example.com' };

        // Get course data if available
        const courseId = paymentData.metadata?.courseId;
        let courseName = 'Unknown Course';

        if (courseId) {
            const courseRef = doc(db, `courses/${courseId}`);
            const courseSnap = await getDoc(courseRef);
            if (courseSnap.exists()) {
                courseName = courseSnap.data().name;
            }
        }

        // Generate PDF invoice
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595.28, 841.89]); // A4 size

        // Add fonts
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        // Set page margins
        const margin = 50;
        const width = page.getWidth() - 2 * margin;

        // Add company logo/header
        page.drawText('Cursuri', {
            x: margin,
            y: page.getHeight() - margin - 30,
            size: 24,
            font: helveticaBold,
            color: rgb(0.29, 0.27, 0.93), // Primary color
        });

        page.drawText('Invoice', {
            x: margin,
            y: page.getHeight() - margin - 60,
            size: 16,
            font: helveticaBold,
            color: rgb(0, 0, 0),
        });

        // Add invoice details
        page.drawText(`Invoice #: ${paymentId.substring(0, 8).toUpperCase()}`, {
            x: margin,
            y: page.getHeight() - margin - 100,
            size: 10,
            font: helveticaFont,
        });

        const date = paymentData.created
            ? new Date(paymentData.created * 1000).toLocaleDateString()
            : new Date().toLocaleDateString();

        page.drawText(`Date: ${date}`, {
            x: margin,
            y: page.getHeight() - margin - 120,
            size: 10,
            font: helveticaFont,
        });

        // Add customer info
        page.drawText('Billed To:', {
            x: margin,
            y: page.getHeight() - margin - 150,
            size: 12,
            font: helveticaBold,
        });

        page.drawText(userData.displayName || 'Customer', {
            x: margin,
            y: page.getHeight() - margin - 170,
            size: 10,
            font: helveticaFont,
        });

        page.drawText(userData.email || '', {
            x: margin,
            y: page.getHeight() - margin - 185,
            size: 10,
            font: helveticaFont,
        });

        // Add payment summary header
        const tableTop = page.getHeight() - margin - 230;

        // Draw table header
        page.drawRectangle({
            x: margin,
            y: tableTop - 20,
            width: width,
            height: 20,
            color: rgb(0.95, 0.95, 0.95),
        });

        page.drawText('Description', {
            x: margin + 10,
            y: tableTop - 12,
            size: 10,
            font: helveticaBold,
        });

        page.drawText('Amount', {
            x: margin + width - 80,
            y: tableTop - 12,
            size: 10,
            font: helveticaBold,
        });

        // Draw item row
        page.drawText(courseName, {
            x: margin + 10,
            y: tableTop - 40,
            size: 10,
            font: helveticaFont,
        });

        const formattedAmount = `${(paymentData.amount_total / 100).toFixed(2)} ${paymentData.currency?.toUpperCase() || 'USD'}`;

        page.drawText(formattedAmount, {
            x: margin + width - 80,
            y: tableTop - 40,
            size: 10,
            font: helveticaFont,
        });

        // Draw line
        page.drawLine({
            start: { x: margin, y: tableTop - 60 },
            end: { x: margin + width, y: tableTop - 60 },
            thickness: 1,
            color: rgb(0.9, 0.9, 0.9),
        });

        // Draw total
        page.drawText('Total', {
            x: margin + width - 150,
            y: tableTop - 80,
            size: 12,
            font: helveticaBold,
        });

        page.drawText(formattedAmount, {
            x: margin + width - 80,
            y: tableTop - 80,
            size: 12,
            font: helveticaBold,
        });

        // Draw footer
        page.drawText('Thank you for your purchase!', {
            x: margin,
            y: margin + 60,
            size: 12,
            font: helveticaBold,
            color: rgb(0.29, 0.27, 0.93), // Primary color
        });

        page.drawText('For support, contact us at support@cursuri.example.com', {
            x: margin,
            y: margin + 40,
            size: 10,
            font: helveticaFont,
        });

        // Generate PDF bytes
        const pdfBytes = await pdfDoc.save();

        // For this demo, we'll create a downloadable URL via Blob
        // In a real app, you might store this in Firebase Storage
        const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

        // Generate unique filename
        const filename = `invoice-${paymentId.substring(0, 8)}.pdf`;

        // In a real app, you would upload to Firebase Storage and get a URL:
        // const storageRef = ref(storage, `invoices/${userId}/${filename}`);
        // await uploadBytes(storageRef, pdfBlob);
        // const invoiceUrl = await getDownloadURL(storageRef);

        // For demo purposes, create a data URL
        const fileReader = new FileReader();
        let invoiceUrl = '';

        await new Promise<void>((resolve) => {
            fileReader.onloadend = () => {
                invoiceUrl = fileReader.result as string;
                resolve();
            };
            fileReader.readAsDataURL(pdfBlob);
        });

        // Update payment record with invoice URL
        await updateDoc(paymentRef, {
            invoiceUrl: invoiceUrl,
            invoiceGenerated: true,
        });

        return NextResponse.json({
            success: true,
            invoiceUrl: invoiceUrl,
            filename: filename
        });
    } catch (error) {
        console.error('Error generating invoice:', error);
        return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 });
    }
}
