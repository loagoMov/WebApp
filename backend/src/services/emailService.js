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

// Product Upload Email Template
const getProductUploadEmailHTML = (productData, vendorData) => {
    const { name, category, premium, currency, coverageAmount, description, status } = productData;
    const { companyName, fullName, email } = vendorData;
    const dashboardUrl = process.env.VENDOR_DASHBOARD_URL || 'http://localhost:5173/vendor-dashboard';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product Upload Confirmation</title>
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
                                ✅ Product Uploaded Successfully
                            </h1>
                            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px;">CoverBots Insurance Marketplace</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="color: #333333; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">
                                Dear ${companyName || fullName},
                            </p>
                            <p style="color: #333333; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">
                                Great news! Your insurance product has been successfully uploaded to the CoverBots marketplace.
                            </p>
                            
                            <!-- Product Details Card -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 6px; margin: 20px 0;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <h3 style="color: #003366; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #003366; padding-bottom: 10px;">
                                            Product Details
                                        </h3>
                                        
                                        <table width="100%" cellpadding="8" cellspacing="0">
                                            <tr>
                                                <td style="color: #666666; font-size: 14px; font-weight: bold; width: 35%;">Product Name:</td>
                                                <td style="color: #333333; font-size: 14px;">${name}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666666; font-size: 14px; font-weight: bold;">Category:</td>
                                                <td style="color: #333333; font-size: 14px;">${category}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666666; font-size: 14px; font-weight: bold;">Monthly Premium:</td>
                                                <td style="color: #333333; font-size: 14px; font-weight: bold;">${currency || 'BWP'} ${premium.toLocaleString()}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666666; font-size: 14px; font-weight: bold;">Coverage Amount:</td>
                                                <td style="color: #333333; font-size: 14px;">${currency || 'BWP'} ${coverageAmount ? coverageAmount.toLocaleString() : 'N/A'}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666666; font-size: 14px; font-weight: bold;">Status:</td>
                                                <td>
                                                    <span style="display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; ${status === 'Active' ? 'background-color: #d4edda; color: #155724;' : 'background-color: #fff3cd; color: #856404;'}">
                                                        ${status}
                                                    </span>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        ${description ? `
                                        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #dee2e6;">
                                            <p style="color: #666666; font-size: 13px; margin: 0 0 5px 0; font-weight: bold;">Description:</p>
                                            <p style="color: #333333; font-size: 14px; margin: 0; line-height: 1.5;">${description}</p>
                                        </div>
                                        ` : ''}
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Important Notice -->
                            ${status !== 'Active' ? `
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px; margin: 20px 0;">
                                <tr>
                                    <td style="padding: 15px;">
                                        <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.5;">
                                            <strong>⚠️ Note:</strong> Your product is currently in <strong>${status}</strong> status. ${status === 'Draft' ? 'Please activate it from your dashboard to make it visible to customers.' : 'It will be visible to customers once activated.'}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            ` : `
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #d4edda; border-left: 4px solid #28a745; border-radius: 4px; margin: 20px 0;">
                                <tr>
                                    <td style="padding: 15px;">
                                        <p style="color: #155724; font-size: 14px; margin: 0; line-height: 1.5;">
                                            <strong>✅ Great!</strong> Your product is now <strong>Active</strong> and visible to customers on the CoverBots marketplace.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            `}
                            
                            <!-- Action Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="${dashboardUrl}" style="display: inline-block; background-color: #003366; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 6px; font-size: 16px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                                            View in Dashboard →
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="color: #666666; font-size: 13px; line-height: 1.5; margin: 20px 0 0 0; text-align: center;">
                                You can manage your products, view analytics, and respond to customer inquiries from your vendor dashboard.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
                            <p style="color: #999999; font-size: 12px; margin: 0;">
                                CoverBots Insurance Marketplace | Connecting You with Customers
                            </p>
                            <p style="color: #999999; font-size: 12px; margin: 5px 0 0 0;">
                                Questions? Contact us at <a href="mailto:coverbotsbw@gmail.com" style="color: #0066cc; text-decoration: none;">coverbotsbw@gmail.com</a>
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

// Send product upload confirmation email
const sendProductUploadEmail = async (productData, vendorData) => {
    try {
        // Check if email is configured
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn('Email service not configured. Missing EMAIL_USER or EMAIL_PASS environment variables.');
            return {
                success: false,
                error: 'Email service not configured'
            };
        }

        const mailOptions = {
            from: `"CoverBots Marketplace" <${process.env.EMAIL_USER || 'coverbotsbw@gmail.com'}>`,
            to: vendorData.email,
            subject: `✅ Product Upload Confirmed - ${productData.name}`,
            html: getProductUploadEmailHTML(productData, vendorData)
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Product upload confirmation email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending product upload email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendVendorApplicationEmail,
    sendProductUploadEmail,
    verifyEmailConfig
};
