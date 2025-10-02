/**
 * API สำหรับแชทบอทอัจฉริยะที่ใช้ Vector Database และ Embeddings
 */

import { NextResponse } from "next/server";
import { findAnswer, extractDataFromProject, addDocumentsToVectorStore } from "@/app/lib/vectordb";
import path from "path";

// ตรวจสอบคำทักทาย
function isGreeting(text) {
  const greetings = ["สวัสดี", "หวัดดี", "hello", "hi", "hey", "สวัสดีครับ", "สวัสดีค่ะ"];
  const normalizedText = text.toLowerCase().trim();
  return greetings.some((greeting) => normalizedText.includes(greeting));
}

// คำทักทายเริ่มต้น
const GREETING_MESSAGE = "สวัสดีครับ มีอะไรให้ช่วยเหลือไหมครับ?";

// คำถามแนะนำเริ่มต้น
const DEFAULT_SUGGESTED_QUESTIONS = [
  "วิธีการลงทะเบียนสมาชิกใหม่",
  "วิธีการแก้ไขข้อมูลที่อยู่",
  "วิธีการอัปโหลดโลโก้บริษัท",
  "วิธีการติดต่อผู้ดูแลระบบ",
  "วิธีการเปลี่ยนรหัสผ่าน",
];

/**
 * ฟังก์ชันสำหรับเตรียมข้อมูลและเพิ่มลงใน Vector Store
 */
export async function prepareVectorStore() {
  try {
    // ดึงข้อมูลจากโปรเจค
    const projectPath = path.resolve(process.cwd());
    console.log(`Extracting data from project: ${projectPath}`);

    const documents = await extractDataFromProject(projectPath);
    console.log(`Extracted ${documents.length} documents from project`);

    // เพิ่มข้อมูลลงใน Vector Store
    await addDocumentsToVectorStore(documents);
    console.log("Successfully added documents to vector store");

    return { success: true, documentCount: documents.length };
  } catch (error) {
    console.error("Error preparing vector store:", error);
    return { success: false, error: error.message };
  }
}

/**
 * POST handler สำหรับรับคำถามและส่งคำตอบ
 */
export async function POST(request) {
  try {
    const { question } = await request.json();

    // ตรวจสอบว่าคำถามว่างหรือไม่
    if (!question || question.trim() === "") {
      return NextResponse.json({
        answer: "กรุณาป้อนคำถามครับ",
        suggestedQuestions: DEFAULT_SUGGESTED_QUESTIONS,
      });
    }

    // ตรวจสอบคำทักทาย
    if (isGreeting(question)) {
      return NextResponse.json({
        answer: GREETING_MESSAGE,
        suggestedQuestions: DEFAULT_SUGGESTED_QUESTIONS,
      });
    }

    // ค้นหาคำตอบจาก Vector Database
    const answer = await findAnswer(question);

    // สร้างคำถามแนะนำ (ในกรณีนี้เราใช้ค่าเริ่มต้น แต่ในอนาคตอาจปรับให้แนะนำตามบริบท)
    const suggestedQuestions = DEFAULT_SUGGESTED_QUESTIONS;

    return NextResponse.json({
      answer,
      suggestedQuestions,
    });
  } catch (error) {
    console.error("Error in AI FAQ API:", error);
    return NextResponse.json(
      {
        answer: "ขออภัย เกิดข้อผิดพลาดในการประมวลผลคำถาม",
        suggestedQuestions: DEFAULT_SUGGESTED_QUESTIONS,
        error: error.message,
      },
      { status: 500 },
    );
  }
}

/**
 * GET handler สำหรับเตรียมข้อมูลและเพิ่มลงใน Vector Store
 */
export async function GET(request) {
  try {
    const result = await prepareVectorStore();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully prepared vector store with ${result.documentCount} documents`,
        suggestedQuestions: DEFAULT_SUGGESTED_QUESTIONS,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to prepare vector store",
          error: result.error,
          suggestedQuestions: DEFAULT_SUGGESTED_QUESTIONS,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error in AI FAQ API (GET):", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error preparing vector store",
        error: error.message,
        suggestedQuestions: DEFAULT_SUGGESTED_QUESTIONS,
      },
      { status: 500 },
    );
  }
}
