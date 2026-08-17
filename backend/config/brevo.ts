import { BrevoClient } from "@getbrevo/brevo";

const brevoClient = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY!,
});

export const sendOTPEmail = async (
  to: string,
  otp: string,
  purpose: "signup" | "reset"
) => {
  const subject =
    purpose === "signup"
      ? "Verify Your Email - Project Management System"
      : "Password Reset OTP - Project Management System";

  const heading =
    purpose === "signup"
      ? "Verify Your Email"
      : "Reset Your Password";

  const message =
    purpose === "signup"
      ? "Use the OTP below to verify your email address."
      : "Use the OTP below to reset your password.";

  await brevoClient.transactionalEmails.sendTransacEmail({
    subject,

    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
        <h2>${heading}</h2>

        <p>${message}</p>

        <div style="
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          text-align: center;
          padding: 20px;
          margin: 20px 0;
          background: #f4f4f4;
          border-radius: 8px;
        ">
          ${otp}
        </div>

        <p>This OTP will expire in <strong>10 minutes</strong>.</p>

        <p>If you did not request this, you can safely ignore this email.</p>

        <p>
          Regards,<br />
          ${process.env.MAIL_NAME || "Project Management System"}
        </p>
      </div>
    `,

    sender: {
      name: process.env.MAIL_NAME!,
      email: process.env.MAIL_FROM!,
    },

    to: [
      {
        email: to,
      },
    ],
  });
};

export const sendTemporaryPasswordEmail = async (
  to: string,
  temporaryPassword: string,
  name: string
) => {
  const subject = "Welcome! Your Temporary Password - Project Management System";

  await brevoClient.transactionalEmails.sendTransacEmail({
    subject,

    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #3b82f6;">Welcome to the Project Management System!</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>An account has been created for you by the administrator on the Project Management System.</p>
        <p>Please use the temporary password below to log in for the first time:</p>

        <div style="
          font-size: 24px;
          font-weight: bold;
          letter-spacing: 2px;
          text-align: center;
          padding: 15px;
          margin: 20px 0;
          background: #f4f4f5;
          border-radius: 6px;
          font-family: monospace;
          color: #1f2937;
          border: 1px dashed #3b82f6;
        ">
          ${temporaryPassword}
        </div>

        <p style="color: #ef4444; font-weight: 500;">
          Important: For security reasons, you will be required to change your password immediately after logging in.
        </p>

        <p>If you have any questions, please contact your administrator.</p>

        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="font-size: 12px; color: #6b7280; line-height: 1.5;">
          Regards,<br />
          <strong>${process.env.MAIL_NAME || "Project Management System"}</strong>
        </p>
      </div>
    `,

    sender: {
      name: process.env.MAIL_NAME!,
      email: process.env.MAIL_FROM!,
    },

    to: [
      {
        email: to,
      },
    ],
  });
};

export default brevoClient;