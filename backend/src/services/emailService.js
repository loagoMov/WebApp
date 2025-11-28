const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'coverbotsbw@gmail.com',
        pass: process.env.EMAIL_PASS // App password from Google
    }
});

// HTML Email Template
const getVendorApplicationEmailHTML = (vendorData) => {
    const { fullName, email, companyName, phone, createdAt, userId } = vendorData;
    const dashboardUrl = process.env.ADMIN_DASHBOARD_URL || 'http://localhost:5173/admin';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Vendor Application</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #003366 0%, #0066cc 100%); padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">
                                🏢 New Vendor Application
                            </h1>
                            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px;">CoverBots Admin Notification</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="color: #333333; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">
                                A new vendor has registered and is awaiting approval.
                            </p>
                            
                            <!-- Vendor Details Card -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 6px; margin: 20px 0;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <h3 style="color: #003366; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #003366; padding-bottom: 10px;">
                                            Vendor Details
                                        </h3>
                                        
                                        <table width="100%" cellpadding="8" cellspacing="0">
                                            <tr>
                                                <td style="color: #666666; font-size: 14px; font-weight: bold; width: 40%;">Company Name:</td>
                                                <td style="color: #333333; font-size: 14px;">${companyName || 'N/A'}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666666; font-size: 14px; font-weight: bold;">Contact Person:</td>
                                                <td style="color: #333333; font-size: 14px;">${fullName || 'N/A'}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666666; font-size: 14px; font-weight: bold;">Email:</td>
                                                <td style="color: #333333; font-size: 14px;">
                                                    <a href="mailto:${email}" style="color: #0066cc; text-decoration: none;">${email}</a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666666; font-size: 14px; font-weight: bold;">Phone:</td>
                                                <td style="color: #333333; font-size: 14px;">${phone || 'N/A'}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666666; font-size: 14px; font-weight: bold;">Application Date:</td>
                                                <td style="color: #333333; font-size: 14px;">${new Date(createdAt || Date.now()).toLocaleString('en-BW', { timeZone: 'Africa/Gaborone' })}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Action Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="${dashboardUrl}" style="display: inline-block; background-color: #003366; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 6px; font-size: 16px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                                            Review Application →
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="color: #666666; font-size: 13px; line-height: 1.5; margin: 20px 0 0 0; text-align: center;">
                                Click the button above to view and approve/reject this vendor application from your admin dashboard.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
                            <p style="color: #999999; font-size: 12px; margin: 0;">
                                CoverBots Insurance Marketplace | Automated Admin Notification
                            </p>
                            <p style="color: #999999; font-size: 12px; margin: 5px 0 0 0;">
                                This is an automated notification. Please do not reply to this email.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
};

// Send vendor application notification
const sendVendorApplicationEmail = async (vendorData) => {
    try {
        // Check if email is configured
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn('Email service not configured. Missing EMAIL_USER or EMAIL_PASS environment variables.');
            return {
                success: false,
                error: 'Email service not configured. Please add EMAIL_USER and EMAIL_PASS to .env file.'
            };
        }

        const adminEmails = (process.env.ADMIN_EMAILS || 'coverbotsbw@gmail.com,loagomontsho@icloud.com').split(',');

        const mailOptions = {
            from: `"CoverBots Admin" <${process.env.EMAIL_USER || 'coverbotsbw@gmail.com'}>`,
            to: adminEmails.join(','),
            subject: `🔔 New Vendor Application - ${vendorData.companyName || vendorData.fullName}`,
            html: getVendorApplicationEmailHTML(vendorData)
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Vendor application email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending vendor application email:', error);
        return { success: false, error: error.message };
    }
};

// Verify email configuration
const verifyEmailConfig = async () => {
    try {
        await transporter.verify();
        console.log('Email service is ready');
        return true;
    } catch (error) {
        console.error('Email service configuration error:', error.message);
        return false;
    }
};

module.exports = {
    sendVendorApplicationEmail,
    verifyEmailConfig
};
