class NotificationService {
  /**
   * Sends an emergency notification to the trusted contact.
   * NOTE: Adheres strictly to security specifications. Never logs the emergency
   * description or the contact's phone number.
   * 
   * @param {Object} user - The user object or object containing user id.
   * @param {Object} contact - The trusted contact object.
   * @param {Object} request - The emergency request details.
   */
  async sendEmergencyNotification(user, contact, request) {
    // SECURITY: Only log non-sensitive metadata (names/IDs). DO NOT log contact.phone or request.description.
    console.log(
      `[NotificationService] Dispatching emergency alert for user ID: ${user.id} to contact: ${contact.name} (${contact.relationship})`
    );

    // In a real-world scenario, this service would integrate with Twilio, AWS SNS, etc.
    // E.g.,
    // await twilio.messages.create({
    //   body: `Urgent support request from ${user.fullName || 'a community member'}. Please contact them immediately.`,
    //   to: contact.phone
    // });

    return {
      success: true,
      provider: 'MOCK_NOTIFICATION_SERVICE',
      message: `Notification was triggered. (Provider not configured; SMS dispatch skipped for ${contact.name}).`,
    };
  }
}

module.exports = new NotificationService();
