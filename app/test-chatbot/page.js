import { notFound } from "next/navigation";
import FaqBotProvider from "../components/FaqBot/FaqBotProvider";

export default function TestChatbot() {
  if (process.env.NEXT_PUBLIC_ENABLE_FAQ_BOT !== "true") {
    return notFound();
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "Kanit, sans-serif",
      }}
    >
      <h1>ทดสอบ FTI Member Portal Chat Bot</h1>
      <p>คลิกที่ไอคอนแชทด้านล่างขวาเพื่อเริ่มใช้งาน Chat Bot</p>
      <div style={{ marginTop: "20px" }}>
        <h2>คำถามแนะนำ:</h2>
        <ul>
          <li>สวัสดี</li>
          <li>ฉันจะสมัครสมาชิกได้อย่างไร?</li>
          <li>ฉันลืมรหัสผ่าน ต้องทำอย่างไร?</li>
          <li>ฉันจะแก้ไขข้อมูลที่อยู่ได้อย่างไร?</li>
        </ul>
      </div>
      <FaqBotProvider />
    </div>
  );
}
