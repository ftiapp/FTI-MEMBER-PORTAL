"use client";

import { useState, useEffect } from "react";
import ChatWidget from "./ChatWidget";

const FaqBotProvider = () => {
  // แสดงแชทบอททันทีโดยไม่ตรวจสอบสถานะการล็อกอิน (เพื่อทดสอบ)

  return <ChatWidget />;
};

export default FaqBotProvider;
