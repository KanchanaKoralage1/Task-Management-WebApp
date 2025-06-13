const nodemailer = require('nodemailer');
const { google } = require('googleapis');
require('dotenv').config();

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
);

const createTransporter = async () => {
    try {
        oauth2Client.setCredentials({
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN
        });

        const { token } = await oauth2Client.getAccessToken();
        console.log('🔑 Access token obtained');

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL_USER,
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
                accessToken: token
            }
        });

        await transporter.verify();
        console.log('📧 SMTP connection verified');
        return transporter;
    } catch (error) {
        console.error('❌ Transporter error:', error.message);
        throw error;
    }
};

const sendEmail = async (options) => {
    try {
        const transporter = await createTransporter();
        const info = await transporter.sendMail({
            from: `"Task Management App" <${process.env.EMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html
        });
        console.log('📨 Email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ Send email error:', error.message);
        return false;
    }
};

module.exports = { sendEmail };