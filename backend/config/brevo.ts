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

export default brevoClient;