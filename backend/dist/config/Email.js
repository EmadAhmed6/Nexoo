import nodemailer from "nodemailer";
const sendEmail = async (to, subject, html) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.USER_EMAIL,
            pass: process.env.USER_PASS,
        },
    });
    await transporter.sendMail({
        from: `Nexo App <${process.env.USER_EMAIL}>`,
        to,
        subject,
        html,
    });
};
const generateResetPasswordEmailHtml = (username, resetLink) => {
    const currentYear = new Date().getFullYear();
    return `
  <!DOCTYPE html>
  <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Reset Your Password - Nexoo</title>
    <!--[if mso]>
    <style>
      table { border-collapse: collapse; }
      *, body, td, p, a { font-family: Arial, sans-serif !important; }
    </style>
    <![endif]-->
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      body, table, td, p, a, li, blockquote {
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }
      table, td {
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }
      img {
        -ms-interpolation-mode: bicubic;
        border: 0;
        outline: none;
        text-decoration: none;
      }
      @media only screen and (max-width: 600px) {
        .email-container {
          width: 100% !important;
          margin: auto !important;
          border-radius: 16px !important;
        }
        .content-cell {
          padding: 24px 20px !important;
        }
        .header-cell {
          padding: 28px 20px 20px 20px !important;
        }
        .cta-btn {
          display: block !important;
          width: 100% !important;
          box-sizing: border-box !important;
          padding: 16px 20px !important;
        }
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #0b0c10; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6; -webkit-font-smoothing: antialiased;">
    <!-- Outer Table -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0c10; width: 100%; margin: 0; padding: 40px 12px;">
      <tr>
        <td align="center">
          <!-- Main Card Container -->
          <table role="presentation" class="email-container" width="100%" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #161920; border-radius: 24px; border: 1px solid #272a33; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);">
            
            <!-- Top Gold Accent Line -->
            <tr>
              <td height="4" style="background: linear-gradient(90deg, #b8972b 0%, #d4af37 50%, #f6e05e 100%); line-height: 4px; font-size: 0px;">&nbsp;</td>
            </tr>

            <!-- Header / Brand Section -->
            <tr>
              <td align="center" class="header-cell" style="padding: 36px 36px 24px 36px; background: linear-gradient(180deg, rgba(212, 175, 55, 0.08) 0%, rgba(22, 25, 32, 0) 100%);">
                
                <!-- Brand Badge -->
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                  <tr>
                    <td align="center" style="background: rgba(212, 175, 55, 0.12); border: 1px solid rgba(212, 175, 55, 0.35); border-radius: 12px; padding: 8px 20px;">
                      <span style="font-size: 20px; font-weight: 900; letter-spacing: 3px; color: #d4af37; text-transform: uppercase;">
                        NEXO<span style="color: #ffffff;">O</span>
                      </span>
                    </td>
                  </tr>
                </table>

                <!-- Security Icon Container -->
                <div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; background: radial-gradient(circle, rgba(212, 175, 55, 0.2) 0%, rgba(22, 25, 32, 0.6) 100%); border: 1px solid rgba(212, 175, 55, 0.4); border-radius: 50%; margin-bottom: 16px; box-shadow: 0 0 20px rgba(212, 175, 55, 0.2);">
                  <span style="font-size: 26px;">🔐</span>
                </div>

                <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #f3f4f6; letter-spacing: -0.5px;">
                  Reset Your Password
                </h1>
                <p style="margin: 8px 0 0 0; font-size: 13px; color: #9ca3af; font-weight: 500;">
                  Nexoo Account Security Service
                </p>
              </td>
            </tr>

            <!-- Content Body -->
            <tr>
              <td class="content-cell" style="padding: 10px 36px 32px 36px; text-align: left;">
                
                <p style="margin: 0 0 16px 0; font-size: 15px; color: #f3f4f6; line-height: 1.6;">
                  Hello <strong style="color: #d4af37; font-weight: 700;">${username}</strong>,
                </p>
                <p style="margin: 0 0 24px 0; font-size: 14px; color: #9ca3af; line-height: 1.6;">
                  We received a request to reset the password for your <strong style="color: #f3f4f6;">Nexoo</strong> account. Click the button below to choose a new secure password:
                </p>

                <!-- Primary CTA Button -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                  <tr>
                    <td align="center">
                      <!--[if mso]>
                      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${resetLink}" style="height:50px;v-text-anchor:middle;width:240px;" arcsize="24%" stroke="f" fillcolor="#d4af37">
                        <w:anchorlock/>
                        <center style="color:#0f1115;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">Reset Password</center>
                      </v:roundrect>
                      <![endif]-->
                      <!--[if !mso]><!-->
                      <a href="${resetLink}" target="_blank" class="cta-btn" style="display: inline-block; padding: 15px 38px; background: linear-gradient(135deg, #d4af37 0%, #b8972b 100%); color: #0f1115; border-radius: 14px; font-weight: 800; font-size: 14px; text-decoration: none; text-transform: uppercase; letter-spacing: 0.8px; box-shadow: 0 8px 24px rgba(212, 175, 55, 0.35); border: 1px solid #f6e05e;">
                        Reset Password &rarr;
                      </a>
                      <!--<![endif]-->
                    </td>
                  </tr>
                </table>

                <!-- Expiry & Security Notice Box -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f1115; border: 1px solid #272a33; border-radius: 14px; margin: 24px 0 20px 0; overflow: hidden;">
                  <tr>
                    <td style="padding: 14px 18px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td width="28" valign="top" style="font-size: 16px;">⏱️</td>
                          <td style="font-size: 12px; color: #cbd5e1; line-height: 1.5;">
                            This link is confidential and will expire in <strong style="color: #d4af37;">10 minutes</strong>.
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Fallback URL Section -->
                <div style="background-color: #0f1115; border: 1px dashed #272a33; border-radius: 12px; padding: 14px; font-size: 11px; color: #6b7280; line-height: 1.5; word-break: break-all;">
                  <span style="color: #9ca3af; font-weight: 600; display: block; margin-bottom: 4px;">Having trouble with the button?</span>
                  Copy and paste this URL into your browser:<br>
                  <a href="${resetLink}" style="color: #d4af37; text-decoration: underline; word-break: break-all;">${resetLink}</a>
                </div>

                <!-- Ignored Request Notice -->
                <p style="margin: 20px 0 0 0; font-size: 12px; color: #6b7280; line-height: 1.5; text-align: center;">
                  🛡️ If you did not request this reset, you can safely ignore this email. Your password will remain unchanged.
                </p>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="padding: 24px 32px; background-color: #0f1115; border-top: 1px solid #272a33; font-size: 11px; color: #6b7280; line-height: 1.6;">
                <p style="margin: 0 0 6px 0; color: #9ca3af; font-weight: 600;">
                  Nexoo E-Commerce Platform
                </p>
                <p style="margin: 0; color: #4b5563;">
                  &copy; ${currentYear} Nexoo Inc. All rights reserved. &bull; Secure Authentication
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};
const generateVerifyOtpEmailHtml = (username, otp) => {
    const currentYear = new Date().getFullYear();
    return `
  <!DOCTYPE html>
  <html lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Nexoo</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      body, table, td, p, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
      table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
      img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
      @media only screen and (max-width: 600px) {
        .email-container { width: 100% !important; }
        .content-cell { padding: 24px 20px !important; }
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #0b0c10; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0c10; width: 100%; margin: 0; padding: 40px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" class="email-container" width="100%" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #161920; border-radius: 24px; border: 1px solid #272a33; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7);">

            <!-- Top Accent Line -->
            <tr>
              <td height="4" style="background: linear-gradient(90deg, #b8972b 0%, #d4af37 50%, #f6e05e 100%); line-height: 4px; font-size: 0px;">&nbsp;</td>
            </tr>

            <!-- Header -->
            <tr>
              <td align="center" style="padding: 36px 36px 24px 36px; background: linear-gradient(180deg, rgba(212,175,55,0.08) 0%, rgba(22,25,32,0) 100%);">
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                  <tr>
                    <td align="center" style="background: rgba(212,175,55,0.12); border: 1px solid rgba(212,175,55,0.35); border-radius: 12px; padding: 8px 20px;">
                      <span style="font-size: 20px; font-weight: 900; letter-spacing: 3px; color: #d4af37; text-transform: uppercase;">NEXO<span style="color: #ffffff;">O</span></span>
                    </td>
                  </tr>
                </table>
                <div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; background: radial-gradient(circle, rgba(212,175,55,0.2) 0%, rgba(22,25,32,0.6) 100%); border: 1px solid rgba(212,175,55,0.4); border-radius: 50%; margin-bottom: 16px; box-shadow: 0 0 20px rgba(212,175,55,0.2);">
                  <span style="font-size: 26px;">✉️</span>
                </div>
                <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #f3f4f6; letter-spacing: -0.5px;">Verify Your Email</h1>
                <p style="margin: 8px 0 0 0; font-size: 13px; color: #9ca3af; font-weight: 500;">Nexoo Account Verification</p>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td class="content-cell" style="padding: 10px 36px 32px 36px; text-align: left;">
                <p style="margin: 0 0 16px 0; font-size: 15px; color: #f3f4f6; line-height: 1.6;">
                  Hello <strong style="color: #d4af37; font-weight: 700;">${username}</strong>,
                </p>
                <p style="margin: 0 0 24px 0; font-size: 14px; color: #9ca3af; line-height: 1.6;">
                  Use the verification code below to confirm your email address and activate your <strong style="color: #f3f4f6;">Nexoo</strong> account:
                </p>

                <!-- OTP Box -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0 28px 0;">
                  <tr>
                    <td align="center">
                      <div style="display: inline-block; background: rgba(212,175,55,0.08); border: 1.5px solid rgba(212,175,55,0.4); border-radius: 16px; padding: 20px 40px; letter-spacing: 10px; font-size: 36px; font-weight: 900; color: #d4af37; font-family: 'Courier New', monospace; box-shadow: 0 0 30px rgba(212,175,55,0.15);">${otp}</div>
                    </td>
                  </tr>
                </table>

                <!-- Expiry Notice -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f1115; border: 1px solid #272a33; border-radius: 14px; margin: 0 0 20px 0; overflow: hidden;">
                  <tr>
                    <td style="padding: 14px 18px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td width="28" valign="top" style="font-size: 16px;">⏱️</td>
                          <td style="font-size: 12px; color: #cbd5e1; line-height: 1.5;">
                            This code expires in <strong style="color: #d4af37;">10 minutes</strong>. Do not share it with anyone.
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <p style="margin: 20px 0 0 0; font-size: 12px; color: #6b7280; line-height: 1.5; text-align: center;">
                  🛡️ If you didn't create a Nexoo account, you can safely ignore this email.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="padding: 24px 32px; background-color: #0f1115; border-top: 1px solid #272a33; font-size: 11px; color: #6b7280; line-height: 1.6;">
                <p style="margin: 0 0 6px 0; color: #9ca3af; font-weight: 600;">Nexoo E-Commerce Platform</p>
                <p style="margin: 0; color: #4b5563;">&copy; ${currentYear} Nexoo Inc. All rights reserved.</p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};
export { generateResetPasswordEmailHtml, generateVerifyOtpEmailHtml, sendEmail };
//# sourceMappingURL=Email.js.map