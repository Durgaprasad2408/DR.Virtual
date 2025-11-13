import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

// Initialize SendGrid if API key is available
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Email template for OTP
const otpEmailTemplate = (otp) => ({
  subject: 'Your TeleMed Verification Code',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TeleMed - OTP Verification</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #3b82f6;
          margin-bottom: 10px;
        }
        .subtitle {
          color: #6b7280;
          font-size: 16px;
        }
        .otp-container {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          padding: 25px;
          border-radius: 10px;
          text-align: center;
          margin: 30px 0;
        }
        .otp-label {
          color: white;
          font-size: 14px;
          margin-bottom: 10px;
          opacity: 0.9;
        }
        .otp-code {
          font-size: 36px;
          font-weight: bold;
          color: white;
          letter-spacing: 5px;
          font-family: 'Courier New', monospace;
          margin: 0;
        }
        .warning {
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .warning-title {
          color: #dc2626;
          font-weight: bold;
          margin-bottom: 8px;
        }
        .warning-text {
          color: #7f1d1d;
          font-size: 14px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🏥 TeleMed</div>
          <div class="subtitle">Healthcare at Your Fingertips</div>
        </div>

        <h2>Verify Your Email Address</h2>
        <p>Hello! Thank you for registering with TeleMed. To complete your account setup, please verify your email address using the code below:</p>

        <div class="otp-container">
          <div class="otp-label">Your verification code is:</div>
          <div class="otp-code">${otp}</div>
        </div>

        <div class="warning">
          <div class="warning-title">⚠️ Important Security Note</div>
          <div class="warning-text">
            This verification code will expire in 10 minutes. If you didn't create an account with TeleMed, please ignore this email.
          </div>
        </div>

        <p>Enter this code in the registration form to continue. If you're having trouble, please contact our support team.</p>

        <div class="footer">
          <p>This email was sent from TeleMed, your trusted healthcare platform.</p>
          <p>If you have any questions, contact us at support@telemed.com</p>
        </div>
      </div>
    </body>
    </html>
  `,
  text: `
    TeleMed - Email Verification

    Hello! Thank you for registering with TeleMed.

    Your verification code is: ${otp}

    This code will expire in 10 minutes.
    If you didn't create an account with TeleMed, please ignore this email.

    Enter this code in the registration form to continue.

    This email was sent from TeleMed.
    For support, contact us at support@telemed.com
  `
});

/**
 * Send OTP email
 * @param {string} email - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise<Object>} Email sending result
 */
export const sendOTPMail = async (email, otp) => {
  try {
    console.log('=== EMAIL DEBUG START ===');
    console.log('Environment check:');
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`SENDGRID_API_KEY: ${process.env.SENDGRID_API_KEY ? 'Set' : 'NOT SET'}`);
    console.log(`EMAIL_FROM: ${process.env.EMAIL_FROM}`);

    // Check if SendGrid is configured
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SendGrid API key not configured');
      return {
        success: false,
        error: 'SendGrid API key not configured',
        message: 'Email service not configured'
      };
    }

    const template = otpEmailTemplate(otp);

    console.log('Using SendGrid for email delivery');

    const msg = {
      to: email,
      from: process.env.EMAIL_FROM || 'noreply@telemed.com',
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    console.log(`Sending OTP email via SendGrid to: ${email}`);
    const result = await sgMail.send(msg);
    console.log('SendGrid email sent successfully:', result[0]?.headers?.['x-message-id']);
    console.log('=== EMAIL DEBUG END ===');

    return {
      success: true,
      messageId: result[0]?.headers?.['x-message-id'],
      message: 'OTP sent successfully via SendGrid'
    };
  } catch (error) {
    console.error('=== EMAIL ERROR DEBUG ===');
    console.error('Error sending OTP email:', error.message);
    console.error('Error code:', error.code);
    console.error('Error errno:', error.errno);
    console.error('Error syscall:', error.syscall);
    console.error('Error hostname:', error.hostname);
    console.error('Stack trace:', error.stack);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    console.error('=== EMAIL ERROR DEBUG END ===');

    // Provide more specific error messages
    let errorMessage = 'Failed to send OTP email';
    if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Please check credentials.';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Cannot connect to email server. Please check network settings.';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Email server connection timed out.';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Email server hostname not found.';
    }

    return {
      success: false,
      error: error.message,
      code: error.code,
      message: errorMessage
    };
  }
};

/**
 * Send welcome email after successful registration
 * @param {string} email - User email
 * @param {string} firstName - User first name
 * @param {string} role - User role (patient/doctor)
 * @returns {Promise<Object>} Email sending result
 */
export const sendWelcomeEmail = async (email, firstName, role) => {
  try {
    const welcomeTemplate = {
      subject: 'Welcome to TeleMed! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to TeleMed</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background-color: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #3b82f6;
              margin-bottom: 10px;
            }
            .welcome-message {
              font-size: 18px;
              margin-bottom: 20px;
            }
            .role-badge {
              display: inline-block;
              background: linear-gradient(135deg, #3b82f6, #1d4ed8);
              color: white;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: bold;
              margin: 10px 0;
            }
            .features {
              background-color: #f8fafc;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .feature {
              margin: 10px 0;
              display: flex;
              align-items: center;
            }
            .feature-icon {
              margin-right: 10px;
              color: #3b82f6;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🏥 TeleMed</div>
            </div>

            <div class="welcome-message">
              Welcome to TeleMed, ${firstName}! 🎉
            </div>

            <p>We're excited to have you join our healthcare community. Your ${role === 'doctor' ? 'doctor' : 'patient'} account has been successfully created and verified.</p>

            <div class="role-badge">
              ${role === 'doctor' ? '👨‍⚕️ Doctor Account' : '👤 Patient Account'}
            </div>

            <div class="features">
              <h3>What you can do now:</h3>
              ${role === 'doctor' ? `
                <div class="feature">
                  <span class="feature-icon">📅</span>
                  <span>Set up your availability and schedule</span>
                </div>
                <div class="feature">
                  <span class="feature-icon">💬</span>
                  <span>Start consulting with patients</span>
                </div>
                <div class="feature">
                  <span class="feature-icon">📋</span>
                  <span>Manage your patient records</span>
                </div>
              ` : `
                <div class="feature">
                  <span class="feature-icon">🔍</span>
                  <span>Find and book appointments with doctors</span>
                </div>
                <div class="feature">
                  <span class="feature-icon">💬</span>
                  <span>Start video consultations</span>
                </div>
                <div class="feature">
                  <span class="feature-icon">📱</span>
                  <span>Access your medical records anytime</span>
                </div>
              `}
            </div>

            <p>Get started by logging into your account and exploring the platform!</p>

            <div class="footer">
              <p>Thank you for choosing TeleMed for your healthcare needs.</p>
              <p>If you have any questions, contact us at support@telemed.com</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to TeleMed, ${firstName}!

        Your ${role} account has been successfully created and verified.

        ${role === 'doctor' ?
          'You can now set up your availability, start consulting with patients, and manage your medical practice.' :
          'You can now find and book appointments with doctors, start video consultations, and access your medical records.'
        }

        Get started by logging into your account and exploring the platform!

        Thank you for choosing TeleMed.
        For support, contact us at support@telemed.com
      `
    };

    // Check if SendGrid is configured
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SendGrid API key not configured');
      return {
        success: false,
        error: 'SendGrid API key not configured',
        message: 'Email service not configured'
      };
    }

    console.log('Using SendGrid for welcome email');

    const msg = {
      to: email,
      from: process.env.EMAIL_FROM || 'noreply@telemed.com',
      subject: welcomeTemplate.subject,
      html: welcomeTemplate.html,
      text: welcomeTemplate.text,
    };

    const result = await sgMail.send(msg);
    console.log('Welcome email sent successfully via SendGrid:', result[0]?.headers?.['x-message-id']);

    return {
      success: true,
      messageId: result[0]?.headers?.['x-message-id'],
      message: 'Welcome email sent successfully via SendGrid'
    };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send welcome email'
    };
  }
};

/**
 * Send appointment request email to doctor
 * @param {string} doctorEmail - Doctor's email
 * @param {string} doctorName - Doctor's name
 * @param {string} patientName - Patient's name
 * @param {string} appointmentDate - Formatted appointment date
 * @param {string} symptoms - Patient's symptoms
 * @returns {Promise<Object>} Email sending result
 */
export const sendAppointmentRequestEmail = async (doctorEmail, doctorName, patientName, appointmentDate, symptoms) => {
  try {
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    const template = {
      subject: 'New Appointment Request - TeleMed',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Appointment Request</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background-color: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #3b82f6;
              margin-bottom: 10px;
            }
            .appointment-card {
              background-color: #f8fafc;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #3b82f6;
            }
            .appointment-detail {
              margin: 10px 0;
              display: flex;
              justify-content: space-between;
            }
            .label {
              font-weight: bold;
              color: #374151;
            }
            .value {
              color: #6b7280;
            }
            .view-button {
              display: inline-block;
              background: linear-gradient(135deg, #3b82f6, #1d4ed8);
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              text-align: center;
              margin: 20px 0;
              transition: background-color 0.3s;
            }
            .view-button:hover {
              background: linear-gradient(135deg, #2563eb, #1e40af);
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🏥 TeleMed</div>
              <h2>New Appointment Request</h2>
            </div>

            <p>Hello Dr. ${doctorName},</p>
            <p>You have received a new appointment request from a patient. Here are the details:</p>

            <div class="appointment-card">
              <div class="appointment-detail">
                <span class="label">Patient:</span>
                <span class="value">${patientName}</span>
              </div>
              <div class="appointment-detail">
                <span class="label">Date & Time:</span>
                <span class="value">${appointmentDate}</span>
              </div>
              <div class="appointment-detail">
                <span class="label">Symptoms:</span>
                <span class="value">${symptoms}</span>
              </div>
            </div>

            <p>Please review this appointment request and take appropriate action.</p>

            <div style="text-align: center;">
              <a href="${frontendUrl}/appointments" class="view-button">View Appointment</a>
            </div>

            <div class="footer">
              <p>This email was sent from TeleMed, your trusted healthcare platform.</p>
              <p>If you have any questions, contact us at support@telemed.com</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        TeleMed - New Appointment Request

        Hello Dr. ${doctorName},

        You have received a new appointment request from ${patientName}.

        Appointment Details:
        - Date & Time: ${appointmentDate}
        - Symptoms: ${symptoms}

        Please review this appointment request and take appropriate action.

        View appointment: ${frontendUrl}/appointments

        This email was sent from TeleMed.
        For support, contact us at support@telemed.com
      `
    };

    // Check if SendGrid is configured
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SendGrid API key not configured');
      return {
        success: false,
        error: 'SendGrid API key not configured',
        message: 'Email service not configured'
      };
    }

    const msg = {
      to: doctorEmail,
      from: process.env.EMAIL_FROM || 'noreply@telemed.com',
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    const result = await sgMail.send(msg);
    console.log('Appointment request email sent successfully:', result[0]?.headers?.['x-message-id']);

    return {
      success: true,
      messageId: result[0]?.headers?.['x-message-id'],
      message: 'Appointment request email sent successfully'
    };
  } catch (error) {
    console.error('Error sending appointment request email:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send appointment request email'
    };
  }
};

/**
 * Send appointment reminder email to patient
 * @param {string} patientEmail - Patient's email
 * @param {string} patientName - Patient's name
 * @param {string} doctorName - Doctor's name
 * @param {string} appointmentDate - Formatted appointment date
 * @param {string} meetingLink - Meeting link if available
 * @returns {Promise<Object>} Email sending result
 */
export const sendAppointmentReminderEmail = async (patientEmail, patientName, doctorName, appointmentDate, meetingLink = '') => {
  try {
    const template = {
      subject: 'Appointment Reminder - TeleMed',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Appointment Reminder</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background-color: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #f59e0b;
              margin-bottom: 10px;
            }
            .reminder-icon {
              font-size: 48px;
              margin-bottom: 20px;
            }
            .appointment-card {
              background-color: #fef3c7;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #f59e0b;
            }
            .appointment-detail {
              margin: 10px 0;
              display: flex;
              justify-content: space-between;
            }
            .label {
              font-weight: bold;
              color: #374151;
            }
            .value {
              color: #6b7280;
            }
            .urgent-notice {
              background-color: #fee2e2;
              border: 1px solid #fecaca;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .urgent-title {
              color: #dc2626;
              font-weight: bold;
              margin-bottom: 8px;
            }
            .join-button {
              display: inline-block;
              background: linear-gradient(135deg, #3b82f6, #1d4ed8);
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              text-align: center;
              margin: 20px 0;
              transition: background-color 0.3s;
            }
            .join-button:hover {
              background: linear-gradient(135deg, #2563eb, #1e40af);
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🏥 TeleMed</div>
              <div class="reminder-icon">⏰</div>
              <h2>Appointment Reminder</h2>
            </div>

            <p>Hello ${patientName},</p>
            <p>This is a friendly reminder that your appointment is coming up soon. Here are the details:</p>

            <div class="appointment-card">
              <div class="appointment-detail">
                <span class="label">Doctor:</span>
                <span class="value">Dr. ${doctorName}</span>
              </div>
              <div class="appointment-detail">
                <span class="label">Date & Time:</span>
                <span class="value">${appointmentDate}</span>
              </div>
            </div>

            <div class="urgent-notice">
              <div class="urgent-title">⚠️ Important Reminder</div>
              <div>Your video consultation will begin in approximately 30 minutes. Please ensure you have:</div>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>A stable internet connection</li>
                <li>A quiet, private space</li>
                <li>Your device camera and microphone ready</li>
              </ul>
            </div>

            ${meetingLink ? `
            <p>You can join the consultation using the link below when it's time:</p>
            <div style="text-align: center;">
              <a href="${meetingLink}" class="join-button">Join Video Consultation</a>
            </div>
            ` : ''}

            <p>If you need to reschedule or have any questions, please contact us immediately.</p>

            <div class="footer">
              <p>This email was sent from TeleMed, your trusted healthcare platform.</p>
              <p>If you have any questions, contact us at support@telemed.com</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        TeleMed - Appointment Reminder

        Hello ${patientName},

        This is a reminder that your appointment with Dr. ${doctorName} is coming up soon.

        Appointment Details:
        - Date & Time: ${appointmentDate}

        Your video consultation will begin in approximately 30 minutes.
        Please ensure you have a stable internet connection and your device ready.

        ${meetingLink ? `Join here: ${meetingLink}` : ''}

        If you need to reschedule or have questions, please contact us.

        This email was sent from TeleMed.
        For support, contact us at support@telemed.com
      `
    };

    // Check if SendGrid is configured
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SendGrid API key not configured');
      return {
        success: false,
        error: 'SendGrid API key not configured',
        message: 'Email service not configured'
      };
    }

    const msg = {
      to: patientEmail,
      from: process.env.EMAIL_FROM || 'noreply@telemed.com',
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    const result = await sgMail.send(msg);
    console.log('Appointment reminder email sent successfully:', result[0]?.headers?.['x-message-id']);

    return {
      success: true,
      messageId: result[0]?.headers?.['x-message-id'],
      message: 'Appointment reminder email sent successfully'
    };
  } catch (error) {
    console.error('Error sending appointment reminder email:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send appointment reminder email'
    };
  }
};

/**
 * Send appointment confirmation email to patient
 * @param {string} patientEmail - Patient's email
 * @param {string} patientName - Patient's name
 * @param {string} doctorName - Doctor's name
 * @param {string} appointmentDate - Formatted appointment date
 * @returns {Promise<Object>} Email sending result
 */
export const sendAppointmentConfirmationEmail = async (patientEmail, patientName, doctorName, appointmentDate) => {
  try {
    const template = {
      subject: 'Appointment Confirmed - TeleMed',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Appointment Confirmed</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background-color: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #10b981;
              margin-bottom: 10px;
            }
            .success-icon {
              font-size: 48px;
              margin-bottom: 20px;
            }
            .appointment-card {
              background-color: #f0fdf4;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #10b981;
            }
            .appointment-detail {
              margin: 10px 0;
              display: flex;
              justify-content: space-between;
            }
            .label {
              font-weight: bold;
              color: #374151;
            }
            .value {
              color: #6b7280;
            }
            .reminder {
              background-color: #fef3c7;
              border: 1px solid #f59e0b;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .reminder-title {
              color: #d97706;
              font-weight: bold;
              margin-bottom: 8px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🏥 TeleMed</div>
              <div class="success-icon">✅</div>
              <h2>Appointment Confirmed!</h2>
            </div>

            <p>Hello ${patientName},</p>
            <p>Great news! Your appointment has been confirmed by Dr. ${doctorName}. Here are the details:</p>

            <div class="appointment-card">
              <div class="appointment-detail">
                <span class="label">Doctor:</span>
                <span class="value">Dr. ${doctorName}</span>
              </div>
              <div class="appointment-detail">
                <span class="label">Date & Time:</span>
                <span class="value">${appointmentDate}</span>
              </div>
            </div>

            <div class="reminder">
              <div class="reminder-title">📅 Reminder</div>
              <div>You will receive a reminder notification 30 minutes before your appointment. Please ensure you have a stable internet connection for your video consultation.</div>
            </div>

            <p>We're looking forward to your consultation. If you need to reschedule or have any questions, please contact us.</p>

            <div class="footer">
              <p>This email was sent from TeleMed, your trusted healthcare platform.</p>
              <p>If you have any questions, contact us at support@telemed.com</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        TeleMed - Appointment Confirmed

        Hello ${patientName},

        Great news! Your appointment has been confirmed by Dr. ${doctorName}.

        Appointment Details:
        - Doctor: Dr. ${doctorName}
        - Date & Time: ${appointmentDate}

        You will receive a reminder notification 30 minutes before your appointment.
        Please ensure you have a stable internet connection for your video consultation.

        We're looking forward to your consultation. If you need to reschedule or have any questions, please contact us.

        This email was sent from TeleMed.
        For support, contact us at support@telemed.com
      `
    };

    // Check if SendGrid is configured
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SendGrid API key not configured');
      return {
        success: false,
        error: 'SendGrid API key not configured',
        message: 'Email service not configured'
      };
    }

    const msg = {
      to: patientEmail,
      from: process.env.EMAIL_FROM || 'noreply@telemed.com',
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    const result = await sgMail.send(msg);
    console.log('Appointment confirmation email sent successfully:', result[0]?.headers?.['x-message-id']);

    return {
      success: true,
      messageId: result[0]?.headers?.['x-message-id'],
      message: 'Appointment confirmation email sent successfully'
    };
  } catch (error) {
    console.error('Error sending appointment confirmation email:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send appointment confirmation email'
    };
  }
};

/**
 * Test email configuration
 * @returns {Promise<Object>} Test result
 */
export const testEmailConfiguration = async () => {
  try {
    console.log('Testing email configuration...');
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`SENDGRID_API_KEY: ${process.env.SENDGRID_API_KEY ? 'Set' : 'Not set'}`);

    // Check if SendGrid is configured
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SendGrid API key not configured');
      return {
        success: false,
        error: 'SendGrid API key not configured',
        message: 'SendGrid API key is required for email functionality'
      };
    }

    console.log('Testing SendGrid configuration...');

    const testMsg = {
      to: process.env.EMAIL_USER || 'test@example.com', // Send to yourself for testing
      from: process.env.EMAIL_FROM || 'noreply@telemed.com',
      subject: 'TeleMed Email Configuration Test',
      text: 'This is a test email to verify SendGrid configuration.',
      html: '<p>This is a test email to verify <strong>SendGrid</strong> configuration.</p>'
    };

    await sgMail.send(testMsg);
    console.log('SendGrid configuration verified successfully');
    return {
      success: true,
      message: 'SendGrid email configuration is working correctly'
    };
  } catch (error) {
    console.error('Email configuration error:', error);
    console.error('Error details:', {
      code: error.code,
      errno: error.errno,
      syscall: error.syscall,
      hostname: error.hostname
    });

    let errorMessage = 'Email configuration test failed';
    if (error.code === 'EAUTH') {
      errorMessage = 'Authentication failed. Please check email credentials.';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'SMTP server not found. Please check EMAIL_HOST.';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Connection refused. Please check EMAIL_PORT and firewall settings.';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Connection timed out. Please check network connectivity.';
    }

    return {
      success: false,
      error: error.message,
      code: error.code,
      message: errorMessage
    };
  }
};