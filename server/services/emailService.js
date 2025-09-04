import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });  

// Verify transporter configuration
export const verifyEmailConfig = async () => {
    try {
        await transporter.verify();
        console.log('Email service is ready');
        return true;
    } catch (error) {
        console.error('Email service configuration error:', error);
        return false;
    }
};

export const sendTeamInvitation = async ({ 
    recipientEmail, 
    recipientName, 
    inviterName, 
    botName, 
    role, 
    invitationLink 
}) => {
    try {
        const roleDescriptions = {
            admin: 'full access to manage the team, bot settings, and all features',
            editor: 'ability to edit bot configuration, training data, and view analytics',
            viewer: 'read-only access to conversations and basic analytics'
        };

        const rolePermissions = {
            admin: [
                'Manage team members and permissions',
                'Edit bot configuration and training',
                'Access all analytics and reports',
                'Manage integrations and settings'
            ],
            editor: [
                'Edit bot settings and configuration',
                'Manage training data and content',
                'View detailed analytics',
                'Test bot functionality'
            ],
            viewer: [
                'View conversations and chat history',
                'Access basic analytics',
                'Export conversation data',
                'Monitor bot performance'
            ]
        };

        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@customerbot.ai',
            to: recipientEmail,
            subject: `You've been invited to join ${botName} team`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Team Invitation - CustomerBot</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        
                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #1f2937 0%, #374151 100%); padding: 40px 30px; text-align: center;">
                            <div style="width: 60px; height: 60px; background-color: #ffffff; border-radius: 12px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#1f2937" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M2 17L12 22L22 17" stroke="#1f2937" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M2 12L12 17L22 12" stroke="#1f2937" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                            <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">Team Invitation</h1>
                            <p style="color: #d1d5db; margin: 0; font-size: 16px;">You've been invited to collaborate</p>
                        </div>
                        
                        <!-- Main Content -->
                        <div style="padding: 40px 30px;">
                            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                                Hello ${recipientName || 'there'}! 👋
                            </h2>
                            
                            <p style="color: #374151; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                                <strong style="color: #1f2937;">${inviterName}</strong> has invited you to join the 
                                <strong style="color: #1f2937;">${botName}</strong> team as a 
                                <span style="background-color: #f3f4f6; padding: 4px 8px; border-radius: 6px; font-weight: 600; color: #1f2937;">${role}</span>.
                            </p>
                            
                            <p style="color: #374151; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
                                As a <strong>${role}</strong>, you'll have ${roleDescriptions[role]}.
                            </p>

                            <!-- Role Permissions -->
                            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 0 0 30px 0;">
                                <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Your Permissions:</h3>
                                <ul style="color: #374151; margin: 0; padding: 0; list-style: none;">
                                    ${rolePermissions[role].map(permission => 
                                        `<li style="margin: 0 0 8px 0; padding-left: 20px; position: relative;">
                                            <span style="position: absolute; left: 0; top: 8px; width: 6px; height: 6px; background-color: #10b981; border-radius: 50%;"></span>
                                            ${permission}
                                        </li>`
                                    ).join('')}
                                </ul>
                            </div>
                            
                            <!-- CTA Button -->
                            <div style="text-align: center; margin: 0 0 30px 0;">
                                <a href="${invitationLink}" 
                                   style="display: inline-block; background: linear-gradient(135deg, #1f2937 0%, #374151 100%); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); transition: all 0.3s ease;">
                                    Accept Invitation
                                </a>
                            </div>
                            
                            <!-- Alternative Link -->
                            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center;">
                                <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">
                                    If the button doesn't work, copy and paste this link:
                                </p>
                                <p style="color: #3b82f6; margin: 0; font-size: 14px; word-break: break-all;">
                                    ${invitationLink}
                                </p>
                            </div>
                        </div>
                        
                        <!-- Footer -->
                        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 30px; text-align: center;">
                            <p style="color: #6b7280; margin: 0 0 15px 0; font-size: 14px;">
                                If you didn't expect this invitation, you can safely ignore this email.
                            </p>
                            <div style="margin: 0 0 15px 0;">
                                <a href="mailto:support@customerbot.ai" style="color: #3b82f6; text-decoration: none; font-size: 14px;">
                                    Need help? Contact Support
                                </a>
                            </div>
                            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                                © ${new Date().getFullYear()} CustomerBot. All rights reserved.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Team invitation sent to ${recipientEmail}`);
        return true;
    } catch (error) {
        console.error('Error sending team invitation:', error);
        throw new Error('Failed to send invitation email');
    }
};

export const sendWelcomeEmail = async ({ 
    recipientEmail, 
    recipientName, 
    botName, 
    role 
}) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@customerbot.ai',
            to: recipientEmail,
            subject: `Welcome to ${botName} team!`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Welcome to the Team - CustomerBot</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        
                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                            <div style="width: 60px; height: 60px; background-color: #ffffff; border-radius: 12px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 12L11 14L15 10" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#10b981" stroke-width="2"/>
                                </svg>
                            </div>
                            <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">Welcome to the Team!</h1>
                            <p style="color: #d1fae5; margin: 0; font-size: 16px;">You're now part of ${botName}</p>
                        </div>
                        
                        <!-- Main Content -->
                        <div style="padding: 40px 30px;">
                            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                                Hello ${recipientName || 'there'}! 🎉
                            </h2>
                            
                            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1px solid #bae6fd; border-radius: 8px; padding: 25px; margin: 0 0 30px 0;">
                                <p style="color: #374151; line-height: 1.6; margin: 0 0 15px 0; font-size: 16px;">
                                    Welcome to the <strong style="color: #1f2937;">${botName}</strong> team! You've been successfully added as a 
                                    <strong style="color: #1f2937;">${role}</strong> and can now start collaborating with your team.
                                </p>
                                <p style="color: #374151; line-height: 1.6; margin: 0; font-size: 16px;">
                                    Get started by logging into your dashboard and exploring your new permissions.
                                </p>
                            </div>
                            
                            <!-- Quick Start Guide -->
                            <div style="margin: 0 0 30px 0;">
                                <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Quick Start Guide:</h3>
                                <ol style="color: #374151; margin: 0; padding-left: 20px; line-height: 1.8;">
                                    <li style="margin: 0 0 8px 0;">Log into your CustomerBot dashboard</li>
                                    <li style="margin: 0 0 8px 0;">Navigate to the ${botName} bot</li>
                                    <li style="margin: 0 0 8px 0;">Explore your ${role} permissions</li>
                                    <li style="margin: 0;">Start collaborating with your team!</li>
                                </ol>
                            </div>
                            
                            <!-- CTA Button -->
                            <div style="text-align: center; margin: 0 0 30px 0;">
                                <a href="${process.env.VITE_WEB_URL}/dashboard" 
                                   style="display: inline-block; background: linear-gradient(135deg, #1f2937 0%, #374151 100%); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                    Go to Dashboard
                                </a>
                            </div>
                            
                            <!-- Support Info -->
                            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center;">
                                <h4 style="color: #1f2937; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Need Help?</h4>
                                <p style="color: #6b7280; margin: 0 0 15px 0; font-size: 14px;">
                                    Our support team is here to help you get started.
                                </p>
                                <a href="mailto:support@customerbot.ai" 
                                   style="color: #3b82f6; text-decoration: none; font-weight: 600; font-size: 14px;">
                                    Contact Support →
                                </a>
                            </div>
                        </div>
                        
                        <!-- Footer -->
                        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 25px 30px; text-align: center;">
                            <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">
                                This email was sent because you were invited to join a CustomerBot team.
                            </p>
                            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                                © ${new Date().getFullYear()} CustomerBot. All rights reserved.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Team invitation sent to ${recipientEmail}:`, info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending team invitation:', error);
        throw new Error(`Failed to send invitation email: ${error.message}`);
    }
};



export const sendTeamRemovalNotification = async ({ 
    recipientEmail, 
    recipientName, 
    botName, 
    removerName 
}) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@customerbot.ai',
            to: recipientEmail,
            subject: `You've been removed from ${botName} team`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Team Update - CustomerBot</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        
                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); padding: 40px 30px; text-align: center;">
                            <div style="width: 60px; height: 60px; background-color: #ffffff; border-radius: 12px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                            <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">Team Update</h1>
                            <p style="color: #e5e7eb; margin: 0; font-size: 16px;">Changes to your team access</p>
                        </div>
                        
                        <!-- Main Content -->
                        <div style="padding: 40px 30px;">
                            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                                Hello ${recipientName || 'there'},
                            </h2>
                            
                            <p style="color: #374151; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                                We're writing to inform you that your access to the <strong style="color: #1f2937;">${botName}</strong> team 
                                has been removed by <strong style="color: #1f2937;">${removerName}</strong>.
                            </p>
                            
                            <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 0 0 25px 0;">
                                <p style="color: #991b1b; margin: 0; font-size: 14px; font-weight: 600;">
                                    ⚠️ Your access to this bot has been revoked
                                </p>
                                <p style="color: #7f1d1d; margin: 10px 0 0 0; font-size: 14px;">
                                    You will no longer be able to access the bot's dashboard, conversations, or settings.
                                </p>
                            </div>
                            
                            <p style="color: #374151; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
                                If you believe this was done in error or have questions about this change, 
                                please contact the team administrator or our support team.
                            </p>
                            
                            <!-- Support Contact -->
                            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center;">
                                <h4 style="color: #1f2937; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Need Assistance?</h4>
                                <p style="color: #6b7280; margin: 0 0 15px 0; font-size: 14px;">
                                    Our support team is available to help with any questions.
                                </p>
                                <a href="mailto:support@customerbot.ai" 
                                   style="color: #3b82f6; text-decoration: none; font-weight: 600; font-size: 14px;">
                                    Contact Support →
                                </a>
                            </div>
                        </div>
                        
                        <!-- Footer -->
                        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 25px 30px; text-align: center;">
                            <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">
                                This is an automated notification from CustomerBot.
                            </p>
                            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                                © ${new Date().getFullYear()} CustomerBot. All rights reserved.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Team removal notification sent to ${recipientEmail}:`, info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending team removal notification:', error);
        throw new Error(`Failed to send removal notification: ${error.message}`);
    }
};

export const sendRoleUpdateNotification = async ({ 
    recipientEmail, 
    recipientName, 
    botName, 
    oldRole, 
    newRole, 
    updaterName 
}) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@customerbot.ai',
            to: recipientEmail,
            subject: `Your role has been updated in ${botName} team`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Role Update - CustomerBot</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        
                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
                            <div style="width: 60px; height: 60px; background-color: #ffffff; border-radius: 12px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 15L17 10H7L12 15Z" fill="#3b82f6"/>
                                </svg>
                            </div>
                            <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">Role Updated</h1>
                            <p style="color: #dbeafe; margin: 0; font-size: 16px;">Your permissions have changed</p>
                        </div>
                        
                        <!-- Main Content -->
                        <div style="padding: 40px 30px;">
                            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                                Hello ${recipientName || 'there'}!
                            </h2>
                            
                            <p style="color: #374151; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
                                <strong style="color: #1f2937;">${updaterName}</strong> has updated your role in the 
                                <strong style="color: #1f2937;">${botName}</strong> team.
                            </p>
                            
                            <!-- Role Change Display -->
                            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1px solid #bae6fd; border-radius: 8px; padding: 25px; margin: 0 0 30px 0; text-align: center;">
                                <div style="display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 15px;">
                                    <div style="text-align: center;">
                                        <p style="color: #6b7280; margin: 0 0 5px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Previous Role</p>
                                        <span style="background-color: #f3f4f6; color: #374151; padding: 8px 16px; border-radius: 20px; font-weight: 600; text-transform: capitalize; font-size: 14px;">
                                            ${oldRole}
                                        </span>
                                    </div>
                                    <div style="color: #3b82f6; font-size: 24px;">→</div>
                                    <div style="text-align: center;">
                                        <p style="color: #6b7280; margin: 0 0 5px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">New Role</p>
                                        <span style="background-color: #3b82f6; color: #ffffff; padding: 8px 16px; border-radius: 20px; font-weight: 600; text-transform: capitalize; font-size: 14px;">
                                            ${newRole}
                                        </span>
                                    </div>
                                </div>
                                <p style="color: #1e40af; margin: 0; font-size: 14px; font-weight: 600;">
                                    Your permissions have been ${newRole === 'admin' ? 'expanded' : newRole === 'editor' ? 'updated' : 'adjusted'}
                                </p>
                            </div>
                            
                            <!-- CTA Button -->
                            <div style="text-align: center; margin: 0 0 30px 0;">
                                <a href="${process.env.VITE_WEB_URL}/dashboard" 
                                   style="display: inline-block; background: linear-gradient(135deg, #1f2937 0%, #374151 100%); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                    View Dashboard
                                </a>
                            </div>
                            
                            <!-- Support Info -->
                            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center;">
                                <p style="color: #6b7280; margin: 0 0 15px 0; font-size: 14px;">
                                    Questions about your new role? We're here to help.
                                </p>
                                <a href="mailto:support@customerbot.ai" 
                                   style="color: #3b82f6; text-decoration: none; font-weight: 600; font-size: 14px;">
                                    Contact Support →
                                </a>
                            </div>
                        </div>
                        
                        <!-- Footer -->
                        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 25px 30px; text-align: center;">
                            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                                © ${new Date().getFullYear()} CustomerBot. All rights reserved.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Role update notification sent to ${recipientEmail}:`, info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending role update notification:', error);
        throw new Error(`Failed to send role update notification: ${error.message}`);
    }
};

// Subscription renewal notification
export const sendSubscriptionRenewalNotification = async ({ 
    recipientEmail, 
    recipientName, 
    planType, 
    renewalDate, 
    creditsReset 
}) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@customerbot.ai',
            to: recipientEmail,
            subject: `Your ${planType} subscription has been renewed`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Subscription Renewed - CustomerBot</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        
                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">Subscription Renewed! 🎉</h1>
                            <p style="color: #d1fae5; margin: 0; font-size: 16px;">Your ${planType} plan is active</p>
                        </div>
                        
                        <!-- Main Content -->
                        <div style="padding: 40px 30px;">
                            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                                Hello ${recipientName}!
                            </h2>
                            
                            <p style="color: #374151; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
                                Your <strong style="color: #1f2937;">${planType}</strong> subscription has been successfully renewed. 
                                Your credits have been reset and you can continue using CustomerBot without interruption.
                            </p>
                            
                            <!-- Renewal Details -->
                            <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 25px; margin: 0 0 30px 0;">
                                <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Renewal Details:</h3>
                                <ul style="color: #374151; margin: 0; padding: 0; list-style: none;">
                                    <li style="margin: 0 0 8px 0; padding-left: 20px; position: relative;">
                                        <span style="position: absolute; left: 0; top: 8px; width: 6px; height: 6px; background-color: #10b981; border-radius: 50%;"></span>
                                        Plan: ${planType.charAt(0).toUpperCase() + planType.slice(1)}
                                    </li>
                                    <li style="margin: 0 0 8px 0; padding-left: 20px; position: relative;">
                                        <span style="position: absolute; left: 0; top: 8px; width: 6px; height: 6px; background-color: #10b981; border-radius: 50%;"></span>
                                        Credits Reset: ${creditsReset.toLocaleString()}
                                    </li>
                                    <li style="margin: 0 0 8px 0; padding-left: 20px; position: relative;">
                                        <span style="position: absolute; left: 0; top: 8px; width: 6px; height: 6px; background-color: #10b981; border-radius: 50%;"></span>
                                        Next Renewal: ${new Date(renewalDate).toLocaleDateString()}
                                    </li>
                                </ul>
                            </div>
                            
                            <!-- CTA Button -->
                            <div style="text-align: center; margin: 0 0 30px 0;">
                                <a href="${process.env.VITE_WEB_URL}/dashboard" 
                                   style="display: inline-block; background: linear-gradient(135deg, #1f2937 0%, #374151 100%); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                    Go to Dashboard
                                </a>
                            </div>
                        </div>
                        
                        <!-- Footer -->
                        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 25px 30px; text-align: center;">
                            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                                © ${new Date().getFullYear()} CustomerBot. All rights reserved.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Subscription renewal notification sent to ${recipientEmail}:`, info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending subscription renewal notification:', error);
        throw new Error(`Failed to send renewal notification: ${error.message}`);
    }
};

// Subscription expiry warning
export const sendSubscriptionExpiryWarning = async ({ 
    recipientEmail, 
    recipientName, 
    planType, 
    expiryDate, 
    daysRemaining 
}) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@customerbot.ai',
            to: recipientEmail,
            subject: `Your ${planType} subscription expires in ${daysRemaining} days`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Subscription Expiry Warning - CustomerBot</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        
                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">Subscription Expiring Soon ⚠️</h1>
                            <p style="color: #fef3c7; margin: 0; font-size: 16px;">${daysRemaining} days remaining</p>
                        </div>
                        
                        <!-- Main Content -->
                        <div style="padding: 40px 30px;">
                            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                                Hello ${recipientName}!
                            </h2>
                            
                            <p style="color: #374151; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
                                Your <strong style="color: #1f2937;">${planType}</strong> subscription will expire on 
                                <strong style="color: #1f2937;">${new Date(expiryDate).toLocaleDateString()}</strong> 
                                (${daysRemaining} days from now).
                            </p>
                            
                            <!-- Warning Box -->
                            <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 25px; margin: 0 0 30px 0;">
                                <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">What happens after expiry?</h3>
                                <ul style="color: #92400e; margin: 0; padding-left: 20px;">
                                    <li>Your account will be downgraded to the free plan</li>
                                    <li>Bot functionality will be limited</li>
                                    <li>Advanced features will be disabled</li>
                                    <li>Credit allowance will be reduced</li>
                                </ul>
                            </div>
                            
                            <!-- CTA Button -->
                            <div style="text-align: center; margin: 0 0 30px 0;">
                                <a href="${process.env.VITE_WEB_URL}/billing" 
                                   style="display: inline-block; background: linear-gradient(135deg, #1f2937 0%, #374151 100%); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                    Renew Subscription
                                </a>
                            </div>
                        </div>
                        
                        <!-- Footer -->
                        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 25px 30px; text-align: center;">
                            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                                © ${new Date().getFullYear()} CustomerBot. All rights reserved.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Subscription expiry warning sent to ${recipientEmail}:`, info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending subscription expiry warning:', error);
        throw new Error(`Failed to send expiry warning: ${error.message}`);
    }
};

// Subscription expired notification
export const sendSubscriptionExpiredNotification = async ({ 
    recipientEmail, 
    recipientName, 
    planType, 
    expiryDate 
}) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@customerbot.ai',
            to: recipientEmail,
            subject: `Your ${planType} subscription has expired`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Subscription Expired - CustomerBot</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        
                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">Subscription Expired</h1>
                            <p style="color: #fecaca; margin: 0; font-size: 16px;">Account downgraded to free plan</p>
                        </div>
                        
                        <!-- Main Content -->
                        <div style="padding: 40px 30px;">
                            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                                Hello ${recipientName},
                            </h2>
                            
                            <p style="color: #374151; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
                                Your <strong style="color: #1f2937;">${planType}</strong> subscription expired on 
                                <strong style="color: #1f2937;">${new Date(expiryDate).toLocaleDateString()}</strong>. 
                                Your account has been automatically downgraded to the free plan.
                            </p>
                            
                            <!-- Impact Notice -->
                            <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 25px; margin: 0 0 30px 0;">
                                <h3 style="color: #991b1b; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">What's Changed:</h3>
                                <ul style="color: #7f1d1d; margin: 0; padding-left: 20px;">
                                    <li>Limited to 100 conversations per month</li>
                                    <li>Maximum 1 AI assistant</li>
                                    <li>Basic analytics only</li>
                                    <li>Email support only</li>
                                </ul>
                            </div>
                            
                            <!-- CTA Button -->
                            <div style="text-align: center; margin: 0 0 30px 0;">
                                <a href="${process.env.VITE_WEB_URL}/billing" 
                                   style="display: inline-block; background: linear-gradient(135deg, #1f2937 0%, #374151 100%); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                    Reactivate Subscription
                                </a>
                            </div>
                        </div>
                        
                        <!-- Footer -->
                        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 25px 30px; text-align: center;">
                            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                                © ${new Date().getFullYear()} CustomerBot. All rights reserved.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Subscription expired notification sent to ${recipientEmail}:`, info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending subscription expired notification:', error);
        throw new Error(`Failed to send expired notification: ${error.message}`);
    }
};

// Test email configuration
export const testEmailService = async () => {
    try {
        const testMailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@customerbot.ai',
            to: process.env.EMAIL_USER, // Send test email to configured email
            subject: 'CustomerBot Email Service Test',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2>Email Service Test</h2>
                    <p>This is a test email to verify that the CustomerBot email service is working correctly.</p>
                    <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                    <p><strong>Service:</strong> CustomerBot Team Management</p>
                </div>
            `
        };

        const info = await transporter.sendMail(testMailOptions);
        console.log('Test email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email service test failed:', error);
        throw new Error(`Email service test failed: ${error.message}`);
    }
};