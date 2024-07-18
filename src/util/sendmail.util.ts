import nodemailer from "nodemailer";
import { ApiResponse } from "../types/Response/ApiResponse";
const Transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,

  service: process.env.SMTP_SERVICE,
  auth: {
    user: process.env.SMTP_USER,

    pass: process.env.SMTP_PASS,
  },
});
const sendVerificationMail = async (
  username: string,
  email: string,
  verifyCode: string
): Promise<ApiResponse> => {
  try {
    const MailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "Procoders verification code",
      text: `your verification code is ${verifyCode} for username :${username}`,
    };
    await Transporter.sendMail(MailOptions);
    return {
      success: true,
      message: "Verification email sent successfully",
    };
  } catch (error) {
    console.log("Error in sending email");
    return {
      success: false,
      message: "Failed to send verification email",
    };
  }
};
export default sendVerificationMail;
