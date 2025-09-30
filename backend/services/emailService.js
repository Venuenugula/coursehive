const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'venuenugula005@gmail.com',
    pass: process.env.EMAIL_PASSWORD // Must be a Gmail App Password, not regular password
  }
});

// Verify email configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Email service configuration error:', error.message);
    console.error('Please ensure EMAIL_PASSWORD is set to a Gmail App Password');
    console.error('To create an App Password:');
    console.error('1. Go to Google Account settings');
    console.error('2. Security → 2-Step Verification');
    console.error('3. App passwords → Generate password for "Mail"');
  } else {
    console.log('Email service ready to send emails');
  }
});

// Email templates
const emailTemplates = {
  passwordChanged: (userName) => ({
    subject: 'Password Changed - CourseHive Security Alert',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563EB, #7C3AED); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">CourseHive</h1>
        </div>
        <div style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #1E293B; margin-bottom: 20px;">Password Changed Successfully</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Hello ${userName},
          </p>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Your password has been successfully changed. If you made this change, no further action is required.
          </p>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            If you did not make this change, please contact our support team immediately.
          </p>
          <div style="background: #EFF6FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1E293B; margin-top: 0;">Security Tips:</h3>
            <ul style="color: #475569;">
              <li>Use a strong, unique password</li>
              <li>Enable two-factor authentication</li>
              <li>Never share your password with anyone</li>
              <li>Log out from shared devices</li>
            </ul>
          </div>
          <p style="color: #475569; font-size: 14px;">
            This is an automated message from CourseHive. Please do not reply to this email.
          </p>
        </div>
        <div style="background: #1E293B; padding: 20px; text-align: center;">
          <p style="color: #94A3B8; margin: 0;">© 2024 CourseHive. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  twoFactorEnabled: (userName) => ({
    subject: 'Two-Factor Authentication Enabled - CourseHive Security Update',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563EB, #7C3AED); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">CourseHive</h1>
        </div>
        <div style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #1E293B; margin-bottom: 20px;">Two-Factor Authentication Enabled</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Hello ${userName},
          </p>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Two-factor authentication has been successfully enabled on your CourseHive account. This adds an extra layer of security to protect your account.
          </p>
          <div style="background: #F0FDF4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
            <h3 style="color: #1E293B; margin-top: 0;">✅ Security Enhanced</h3>
            <p style="color: #475569; margin: 0;">
              Your account is now protected with two-factor authentication. You'll need to enter a verification code from your authenticator app when logging in.
            </p>
          </div>
          <div style="background: #EFF6FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1E293B; margin-top: 0;">Important Notes:</h3>
            <ul style="color: #475569;">
              <li>Keep your authenticator app secure</li>
              <li>Save backup codes in a safe place</li>
              <li>Contact support if you lose access to your authenticator</li>
            </ul>
          </div>
          <p style="color: #475569; font-size: 14px;">
            This is an automated message from CourseHive. Please do not reply to this email.
          </p>
        </div>
        <div style="background: #1E293B; padding: 20px; text-align: center;">
          <p style="color: #94A3B8; margin: 0;">© 2024 CourseHive. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  twoFactorDisabled: (userName) => ({
    subject: 'Two-Factor Authentication Disabled - CourseHive Security Alert',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #DC2626, #EF4444); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">CourseHive</h1>
        </div>
        <div style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #1E293B; margin-bottom: 20px;">Two-Factor Authentication Disabled</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Hello ${userName},
          </p>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Two-factor authentication has been disabled on your CourseHive account. Your account security has been reduced.
          </p>
          <div style="background: #FEF2F2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444;">
            <h3 style="color: #1E293B; margin-top: 0;">⚠️ Security Reduced</h3>
            <p style="color: #475569; margin: 0;">
              Your account is no longer protected with two-factor authentication. We recommend re-enabling it for better security.
            </p>
          </div>
          <div style="background: #EFF6FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1E293B; margin-top: 0;">Security Recommendations:</h3>
            <ul style="color: #475569;">
              <li>Re-enable two-factor authentication</li>
              <li>Use a strong, unique password</li>
              <li>Monitor your account for suspicious activity</li>
              <li>Enable login notifications</li>
            </ul>
          </div>
          <p style="color: #475569; font-size: 14px;">
            This is an automated message from CourseHive. Please do not reply to this email.
          </p>
        </div>
        <div style="background: #1E293B; padding: 20px; text-align: center;">
          <p style="color: #94A3B8; margin: 0;">© 2024 CourseHive. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  accountDeleted: (userName) => ({
    subject: 'Account Deleted - CourseHive Account Closure',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #DC2626, #EF4444); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">CourseHive</h1>
        </div>
        <div style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #1E293B; margin-bottom: 20px;">Account Successfully Deleted</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Hello ${userName},
          </p>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Your CourseHive account has been permanently deleted as requested. All your data has been removed from our systems.
          </p>
          <div style="background: #FEF2F2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444;">
            <h3 style="color: #1E293B; margin-top: 0;">Account Closed</h3>
            <p style="color: #475569; margin: 0;">
              Your account and all associated data have been permanently deleted. This action cannot be undone.
            </p>
          </div>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            If you have any questions or if this was done in error, please contact our support team immediately.
          </p>
          <p style="color: #475569; font-size: 14px;">
            This is an automated message from CourseHive. Please do not reply to this email.
          </p>
        </div>
        <div style="background: #1E293B; padding: 20px; text-align: center;">
          <p style="color: #94A3B8; margin: 0;">© 2024 CourseHive. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  loginNotification: (userName, loginTime, location) => ({
    subject: 'New Login Detected - CourseHive Security Alert',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563EB, #7C3AED); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">CourseHive</h1>
        </div>
        <div style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #1E293B; margin-bottom: 20px;">New Login Detected</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Hello ${userName},
          </p>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            We detected a new login to your CourseHive account.
          </p>
          <div style="background: #EFF6FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1E293B; margin-top: 0;">Login Details:</h3>
            <p style="color: #475569; margin: 5px 0;"><strong>Time:</strong> ${loginTime}</p>
            <p style="color: #475569; margin: 5px 0;"><strong>Location:</strong> ${location}</p>
          </div>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            If this was you, no action is needed. If you don't recognize this login, please change your password immediately and contact our support team.
          </p>
          <p style="color: #475569; font-size: 14px;">
            This is an automated message from CourseHive. Please do not reply to this email.
          </p>
        </div>
        <div style="background: #1E293B; padding: 20px; text-align: center;">
          <p style="color: #94A3B8; margin: 0;">© 2024 CourseHive. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  passwordReset: (userName, resetLink) => ({
    subject: 'Password Reset Request - CourseHive',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563EB, #7C3AED); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">CourseHive</h1>
        </div>
        <div style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #1E293B; margin-bottom: 20px;">Password Reset Request</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Hello ${userName},
          </p>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            We received a request to reset your password. Click the button below to create a new password:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: #2563EB; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Reset Password
            </a>
          </div>
          <div style="background: #FEF2F2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444;">
            <h3 style="color: #1E293B; margin-top: 0;">⚠️ Important Security Information</h3>
            <ul style="color: #475569; margin: 0;">
              <li>This link will expire in 1 hour</li>
              <li>If you didn't request this reset, ignore this email</li>
              <li>Your password will remain unchanged until you click the link</li>
              <li>For security, this link can only be used once</li>
            </ul>
          </div>
          <p style="color: #475569; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetLink}" style="color: #2563EB; word-break: break-all;">${resetLink}</a>
          </p>
          <p style="color: #475569; font-size: 14px;">
            This is an automated message from CourseHive. Please do not reply to this email.
          </p>
        </div>
        <div style="background: #1E293B; padding: 20px; text-align: center;">
          <p style="color: #94A3B8; margin: 0;">© 2024 CourseHive. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  testReminder: (userName, testName, testDate, testTime) => ({
    subject: `Test Reminder: ${testName} - CourseHive`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563EB, #7C3AED); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">CourseHive</h1>
        </div>
        <div style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #1E293B; margin-bottom: 20px;">📚 Test Reminder</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Hello ${userName},
          </p>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            This is a friendly reminder that you have a test coming up!
          </p>
          <div style="background: #EFF6FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1E293B; margin-top: 0;">Test Details</h3>
            <p style="color: #475569; margin: 5px 0;"><strong>Test:</strong> ${testName}</p>
            <p style="color: #475569; margin: 5px 0;"><strong>Date:</strong> ${testDate}</p>
            <p style="color: #475569; margin: 5px 0;"><strong>Time:</strong> ${testTime}</p>
          </div>
          <div style="background: #F0FDF4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22C55E;">
            <h3 style="color: #1E293B; margin-top: 0;">💡 Study Tips</h3>
            <ul style="color: #475569; margin: 0;">
              <li>Review your study materials</li>
              <li>Take practice tests if available</li>
              <li>Get a good night's sleep</li>
              <li>Arrive a few minutes early</li>
            </ul>
          </div>
          <p style="color: #475569; font-size: 14px;">
            Good luck with your test! You've got this! 🎯
          </p>
        </div>
        <div style="background: #1E293B; padding: 20px; text-align: center;">
          <p style="color: #94A3B8; margin: 0;">© 2024 CourseHive. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  achievementAlert: (userName, achievementName, achievementDescription, points) => ({
    subject: `🎉 Achievement Unlocked: ${achievementName} - CourseHive`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #F59E0B, #EF4444); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">CourseHive</h1>
        </div>
        <div style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #1E293B; margin-bottom: 20px;">🎉 Achievement Unlocked!</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Congratulations ${userName}!
          </p>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            You've just earned a new achievement! Keep up the great work!
          </p>
          <div style="background: linear-gradient(135deg, #FEF3C7, #FDE68A); padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #F59E0B;">
            <h3 style="color: #92400E; margin-top: 0; font-size: 24px;">🏆 ${achievementName}</h3>
            <p style="color: #92400E; margin: 10px 0; font-size: 16px;">${achievementDescription}</p>
            <div style="background: #92400E; color: white; padding: 10px; border-radius: 6px; display: inline-block; font-weight: bold;">
              +${points} Points Earned!
            </div>
          </div>
          <div style="background: #F0FDF4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1E293B; margin-top: 0;">🌟 Keep Going!</h3>
            <p style="color: #475569; margin: 0;">
              You're doing amazing! Continue learning and unlock even more achievements. 
              Check your profile to see all your accomplishments.
            </p>
          </div>
          <p style="color: #475569; font-size: 14px;">
            This is an automated message from CourseHive. Please do not reply to this email.
          </p>
        </div>
        <div style="background: #1E293B; padding: 20px; text-align: center;">
          <p style="color: #94A3B8; margin: 0;">© 2024 CourseHive. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  weeklyReport: (userName, weekData) => ({
    subject: `📊 Your Weekly Learning Report - CourseHive`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563EB, #7C3AED); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">CourseHive</h1>
        </div>
        <div style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #1E293B; margin-bottom: 20px;">📊 Weekly Learning Report</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Hello ${userName},
          </p>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Here's your learning progress for this week!
          </p>
          <div style="background: #EFF6FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1E293B; margin-top: 0;">📈 This Week's Stats</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
              <div style="background: white; padding: 15px; border-radius: 6px; text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #2563EB;">${weekData.testsCompleted || 0}</div>
                <div style="font-size: 14px; color: #475569;">Tests Completed</div>
              </div>
              <div style="background: white; padding: 15px; border-radius: 6px; text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #7C3AED;">${weekData.studyHours || 0}</div>
                <div style="font-size: 14px; color: #475569;">Study Hours</div>
              </div>
              <div style="background: white; padding: 15px; border-radius: 6px; text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #059669;">${weekData.achievementsEarned || 0}</div>
                <div style="font-size: 14px; color: #475569;">Achievements</div>
              </div>
              <div style="background: white; padding: 15px; border-radius: 6px; text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #DC2626;">${weekData.currentStreak || 0}</div>
                <div style="font-size: 14px; color: #475569;">Day Streak</div>
              </div>
            </div>
          </div>
          <div style="background: #F0FDF4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1E293B; margin-top: 0;">🎯 Next Week's Goals</h3>
            <ul style="color: #475569; margin: 0;">
              <li>Complete at least 3 practice tests</li>
              <li>Study for 2+ hours daily</li>
              <li>Maintain your learning streak</li>
              <li>Explore new topics and challenges</li>
            </ul>
          </div>
          <p style="color: #475569; font-size: 14px;">
            Keep up the excellent work! Your dedication to learning is inspiring. 🚀
          </p>
        </div>
        <div style="background: #1E293B; padding: 20px; text-align: center;">
          <p style="color: #94A3B8; margin: 0;">© 2024 CourseHive. All rights reserved.</p>
        </div>
      </div>
    `
  })
};

// Send email function
const sendEmail = async (to, templateName, data) => {
  try {
    const template = emailTemplates[templateName];
    if (!template) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    const emailContent = typeof template === 'function' ? template(data) : template;

    const mailOptions = {
      from: 'venuenugula005@gmail.com',
      to: to,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  emailTemplates
};
