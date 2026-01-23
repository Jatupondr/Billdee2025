import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
  name: string;
  subject?: string;
  url?: string;
}

export const WelcomeEmail: React.FC<Readonly<WelcomeEmailProps>> = ({
  name,
  subject,
  url,
}) => (
  <Html>
    <Head />
    <Preview>ยินดีต้อนรับสู่ billDee - กรุณายืนยันตัวตนของคุณ</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>ยินดีต้อนรับสู่ billDee! 🎉</Heading>
        <Text style={text}>สวัสดีคุณ {name},</Text>
        <Text style={text}>
          ขอบคุณที่สมัครเข้าใช้งาน billDee -
          แพลตฟอร์มการออกใบเรียกเก็บเงินที่ทันสมัย
          เพื่อให้การใช้งานเป็นไปอย่างปลอดภัย
          กรุณายืนยันตัวตนของคุณโดยคลิกปุ่มด้านล่าง
        </Text>
        <Section style={buttonSection}>
          <Button href={url} style={button}>
            ยืนยันตัวตน
          </Button>
        </Section>
        <Text style={smallText}>
          หากคุณไม่ได้สมัครสมาชิกกับเรา กรุณาเพิกเฉยต่ออีเมลนี้
        </Text>
        <Text style={smallText}>
          หากมีข้อสงสัย กรุณาติดต่อเราที่ billdee.2025@gmail.com
        </Text>
        <Text style={signature}>
          ด้วยความเคารพ,
          <br />
          ทีมงาน BillDee
        </Text>
      </Container>
    </Body>
  </Html>
);

// Keep the old component for backward compatibility
export const WaitlistEmail: React.FC<Readonly<WelcomeEmailProps>> =
  WelcomeEmail;

export default WaitlistEmail;

const main = {
  backgroundColor: "#f6f9fc",
  margin: "0 auto",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #f0f0f0",
  borderRadius: "8px",
  margin: "40px auto",
  padding: "40px 32px",
  maxWidth: "600px",
};

const h1 = {
  color: "#1f2937",
  fontSize: "28px",
  fontWeight: "700",
  lineHeight: "36px",
  margin: "0 0 24px",
  textAlign: "center" as const,
};

const text = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#3b82f6",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 32px",
  margin: "0",
};

const smallText = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0 0 12px",
};

const signature = {
  color: "#374151",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "24px 0 0",
  paddingTop: "16px",
  borderTop: "1px solid #e5e7eb",
};
