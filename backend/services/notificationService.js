import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { sendAppointmentRequestEmail, sendAppointmentConfirmationEmail } from './emailService.js';

export const createNotification = async ({
  recipient,
  sender,
  type,
  title,
  message,
  data = {},
  sendEmail = true,
  emailData = {}
}) => {
  try {
    console.log(`Creating notification: ${type} for user ${recipient}`);

    // Create notification in database
    const notification = new Notification({
      recipient,
      sender,
      type,
      title,
      message,
      data
    });

    await notification.save();
    await notification.populate('sender', 'firstName lastName role');

    console.log(`✅ Notification created successfully: ${notification._id}`);

    // Send email if requested and for appointment notifications
    if (sendEmail && (type === 'appointment_request' || type === 'appointment_confirmed')) {
      try {
        const recipientUser = await User.findById(recipient).select('email firstName lastName');

        if (recipientUser && recipientUser.email) {
          if (type === 'appointment_request') {
            // Email to doctor about new appointment request
            await sendAppointmentRequestEmail(
              recipientUser.email,
              `${recipientUser.firstName} ${recipientUser.lastName}`,
              emailData.patientName,
              emailData.appointmentDate,
              emailData.symptoms
            );
          } else if (type === 'appointment_confirmed') {
            // Email to patient about appointment confirmation
            await sendAppointmentConfirmationEmail(
              recipientUser.email,
              `${recipientUser.firstName} ${recipientUser.lastName}`,
              emailData.doctorName,
              emailData.appointmentDate
            );
          }
          console.log(`📧 Email sent successfully for ${type}`);
        } else {
          console.log('⚠️ Recipient email not found, skipping email');
        }
      } catch (emailError) {
        console.error('❌ Failed to send email:', emailError);
        // Don't throw error, continue with notification creation
      }
    }

    return notification;
  } catch (error) {
    console.error('❌ Failed to create notification:', error);
    throw error;
  }
};

export const getNotificationTemplate = (type, data) => {
  const templates = {
    appointment_request: {
      title: 'New Appointment Request',
      message: `${data.patientName} has requested an appointment for ${data.appointmentDate}. Please review and respond to this request.`
    },
    appointment_confirmed: {
      title: 'Appointment Confirmed',
      message: `Your appointment with Dr. ${data.doctorName} has been confirmed for ${data.appointmentDate}. You will receive a reminder before your consultation.`
    },
    appointment_cancelled: {
      title: 'Appointment Cancelled',
      message: `Your appointment scheduled for ${data.appointmentDate} has been cancelled. If you need to reschedule, please book a new appointment.`
    },
    appointment_completed: {
      title: 'Consultation Completed',
      message: `Your consultation has been completed successfully. Prescription and consultation notes are now available in your dashboard.`
    },
    new_message: {
      title: 'New Message',
      message: `You have a new message from ${data.senderName}. Please check your messages for details.`
    },
    video_call_request: {
      title: 'Incoming Video Call',
      message: `${data.callerName} is requesting a video consultation. Please join the call when ready.`
    },
    prescription_added: {
      title: 'New Prescription Available',
      message: `Dr. ${data.doctorName} has added a prescription to your consultation. Please review the medication details and instructions.`
    }
  };

  return templates[type] || {
    title: 'Notification',
    message: 'You have a new notification from TeleMed Healthcare.'
  };
};