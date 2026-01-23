import { render } from "@react-email/components";
import ResetPasswordEmail from "./reset-password";
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY!);
const sendEmailResetPassword = async (to: string, subject: string, url: string) => {

  const template = await render(<ResetPasswordEmail to={to} subject={subject} url={url} />);
  const email = await resend.emails.send({
    to,
    from: "noreply@billdee.net",
    subject,
    html: template,
  });
  return email;
}

export { sendEmailResetPassword }


