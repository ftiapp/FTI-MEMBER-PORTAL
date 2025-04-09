'use server';

/**
 * Utility for sending SMS messages using the SMS API
 */

// Function to send OTP via SMS
export async function sendOTP(phoneNumber, otpCode) {
  try {
    // Format the message
    const message = `รหัส OTP ของคุณคือ ${otpCode} (หมดอายุใน 5 นาที) - สภาอุตสาหกรรมแห่งประเทศไทย`;

    // Prepare the API request
    const params = new URLSearchParams({
      user: process.env.SMS_USER,
      pass: process.env.SMS_PASS,
      type: process.env.SMS_TYPE,
      from: process.env.SMS_FROM,
      to: phoneNumber,
      text: message,
      servid: process.env.SMS_SERVICE_ID
    });

    // Send the SMS
    const response = await fetch(`${process.env.SMS_API_URL}?${params.toString()}`);
    const data = await response.text();

    // Log the response
    console.log('SMS API Response:', data);

    // Check if the SMS was sent successfully
    // The API returns "OK" followed by a message ID if successful
    if (data.startsWith('OK')) {
      return {
        success: true,
        messageId: data.split(' ')[1]
      };
    } else {
      return {
        success: false,
        error: data
      };
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Function to generate a random 6-digit OTP
export function generateOTP() {
  // Generate a random 6-digit number
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to log SMS activity
export async function logSMSActivity(userId, phone, otpCode, success, error = null) {
  try {
    const { query } = await import('./db');
    
    // Log the activity
    await query(
      `INSERT INTO incentive_activity_logs 
      (agent_id, action, module, description, ip_address, user_agent) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        success ? 'SMS_OTP_SENT' : 'SMS_OTP_FAILED',
        'member_verification',
        JSON.stringify({
          phone,
          success,
          error,
          timestamp: new Date().toISOString()
        }),
        '', // IP address will be handled by the API route
        'SMS Service' // User agent
      ]
    );
    
    return true;
  } catch (error) {
    console.error('Error logging SMS activity:', error);
    return false;
  }
}
