require('dotenv').config();
const { sendEmail } = require('./emailUtils');

async function testEmail() {
    console.log('🚀 Starting email test...');
    console.log('📧 Using email:', process.env.EMAIL_USER);
    console.log('🔑 OAuth2 credentials loaded:', {
        clientId: !!process.env.GOOGLE_CLIENT_ID,
        clientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: !!process.env.GOOGLE_REFRESH_TOKEN
    });

    try {
        const result = await sendEmail({
            email: process.env.EMAIL_USER,
            subject: 'OAuth2 Test Email',
            message: 'This is a test email using OAuth2',
            html: `
                <h1>OAuth2 Test Email</h1>
                <p>If you see this email, your OAuth2 configuration is working!</p>
                <p>Time: ${new Date().toLocaleString()}</p>
            `
        });

        if (result) {
            console.log('✅ Email sent successfully!');
        } else {
            console.log('❌ Email sending failed');
        }
    } catch (error) {
        console.error('❌ Test failed:', error?.message || error);
    }
}

testEmail();