import nodemailer from "nodemailer";

export async function sendGroupInviteEmail(
  toEmail: string,
  inviterName: string,
  groupName: string,
  inviteToken: string,
) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const inviteLink = `${
      process.env.NEXT_PUBLIC_APP_URL || "https://www.hissaa.in"
    }/invite/${inviteToken}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #075e54; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">hissa.</h1>
        </div>
        <div style="padding: 32px 24px;">
          <p style="font-size: 16px; color: #334155;">Hello,</p>
          <p style="font-size: 16px; color: #334155; line-height: 1.5;">
            <strong>${inviterName}</strong> has invited you to join the group <strong>"${groupName}"</strong> on hissa to share and split expenses seamlessly.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${inviteLink}" style="background-color: #075e54; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          <p style="font-size: 14px; color: #64748b; line-height: 1.5;">
            If you don't have an account yet, you'll be able to create one before joining the group. This link will expire in 7 days.
          </p>
        </div>
        <div style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">
            hissa. &copy; ${new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </div>
    `;

    // Only attempt to send if SMTP credentials exist, else log it for local dev
    if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
      await transporter.sendMail({
        from: `"hissa. Support" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject: `${inviterName} invited you to join "${groupName}" on hissa.`,
        html: htmlContent,
      });
      console.log(`Email sent successfully to ${toEmail}`);
    } else {
      console.log("-----------------------------------------");
      console.log(`[DEV MODE] Simulate sending email to: ${toEmail}`);
      console.log(
        `[DEV MODE] Subject: ${inviterName} invited you to join "${groupName}"`,
      );
      console.log(`[DEV MODE] Link: ${inviteLink}`);
      console.log("-----------------------------------------");
    }

    return true;
  } catch (error) {
    console.error("Error sending invite email:", error);
    return false;
  }
}
