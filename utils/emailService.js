const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'bhavikdemos@gmail.com',
        // In a real production app, use environment variables!
        pass: 'yietvpnefxoinuap'
    }
});

/**
 * Send an email with user credentials
 * @param {string} toEmail - Recipient email
 * @param {object} userDetails - User object { firstName, lastName, role, password, email }
 */
const sendUserCredentialsEmail = async (toEmail, userDetails) => {
    const subject = 'Welcome to Pritomatic AQI Dashboard - Your Credentials';
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
            <h2 style="color: #3256AA;">Welcome, ${userDetails.first_name}!</h2>
            <p>Your account has been created for the Pritomatic AQI Dashboard.</p>
            <p>Here are your login credentials:</p>
            <table style="width: 100%; max-width: 400px; margin-bottom: 20px;">
                <tr>
                    <td style="font-weight: bold; padding: 5px;">Role:</td>
                    <td>${userDetails.role}</td>
                </tr>
                <tr>
                    <td style="font-weight: bold; padding: 5px;">Email:</td>
                    <td>${userDetails.email}</td>
                </tr>
                <tr>
                    <td style="font-weight: bold; padding: 5px;">Password:</td>
                    <td style="background: #f5f5f5; padding: 5px; font-family: monospace; font-weight: bold;">${userDetails.password}</td>
                </tr>
            </table>
            <p>Please login and change your password if required.</p>
            <p style="color: #999; font-size: 12px;">This is an automated message. Please do not reply.</p>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: '"Pritomatic Admin" <bhavikdemos@gmail.com>',
            to: toEmail,
            subject: subject,
            html: html
        });
        console.log(`✅ Email sent to ${toEmail}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending email:', error);
    }
};

/**
 * Send Order Confirmation Email
 * @param {string} toEmail - Customer email
 * @param {object} orderDetails - Order object
 */
const sendOrderConfirmationEmail = async (toEmail, orderDetails) => {
    const subject = `Order Confirmation - #${orderDetails.order_number}`;
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
            <h2 style="color: #3256AA;">Order Placed Successfully!</h2>
            <p>Dear ${orderDetails.customer_name || 'Customer'},</p>
            <p>Thank you for your order with Pritomatic AQI.</p>
            <p><strong>Order Number:</strong> ${orderDetails.order_number}</p>
            <p><strong>Status:</strong> ${orderDetails.current_order_status}</p>
            <br>
            <h3>Order Details:</h3>
            <table style="width: 100%; max-width: 500px; border-collapse: collapse;">
                <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Company:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${orderDetails.company || '-'}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Location:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${orderDetails.location || '-'}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>City/Country:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${orderDetails.city || '-'}, ${orderDetails.country || '-'}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Contact:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${orderDetails.contact_number || '-'}</td></tr>
            </table>
            <br>
            <p>We will notify you when your order is shipped.</p>
            <p style="color: #999; font-size: 12px;">This is an automated message.</p>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: '"Pritomatic Orders" <bhavikdemos@gmail.com>',
            to: toEmail,
            subject: subject,
            html: html
        });
        console.log(`✅ Order confirmation email sent to ${toEmail}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending order email:', error);
        return false;
    }
};

/**
 * Configure the email service with password.
 * MUST be called before sending emails if the password wasn't set in environment (which it isn't yet).
 * Ideally, reading from process.env is better.
 */
const configureEmail = (password) => {
    transporter.options.auth.pass = password;
};

module.exports = {
    sendUserCredentialsEmail,
    sendOrderConfirmationEmail,
    configureEmail
};
