/**
 * Vector Database และ Embeddings สำหรับแชทบอทอัจฉริยะ
 * ใช้ OpenAI Embeddings และ MySQL สำหรับเก็บ vector embeddings
 */

import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import fs from 'fs';
import path from 'path';
import { query } from '@/app/lib/db'; // ใช้ฟังก์ชัน query จากไฟล์ db.js ที่มีอยู่แล้ว

// ตั้งค่า API keys จาก environment variables
const openAIApiKey = process.env.OPENAI_API_KEY;

// สร้าง embeddings instance
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: openAIApiKey,
  modelName: "text-embedding-3-small", // รุ่นล่าสุดที่ประหยัดกว่า
});

/**
 * แปลงข้อความเป็น chunks เล็กๆ
 */
export async function splitTextIntoChunks(text, metadata = {}) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  
  return await splitter.createDocuments(
    [text],
    [metadata]
  );
}

/**
 * อ่านไฟล์และแปลงเป็น chunks
 */
export async function processFile(filePath, type) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return await splitTextIntoChunks(content, {
      source: filePath,
      type: type,
    });
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return [];
  }
}

/**
 * ดึงข้อมูลจากโค้ดในโปรเจค
 */
export async function extractDataFromProject(projectPath) {
  const ai_documents = [];
  
  // ฟังก์ชันสำหรับอ่านไฟล์ในโฟลเดอร์แบบ recursive
  async function processDirectory(dirPath, fileTypes) {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('node_modules') && !file.startsWith('.')) {
        // ทำงานกับโฟลเดอร์ย่อย (ยกเว้น node_modules และโฟลเดอร์ซ่อน)
        await processDirectory(filePath, fileTypes);
      } else if (stat.isFile()) {
        // ตรวจสอบนามสกุลไฟล์
        const ext = path.extname(file).toLowerCase();
        if (fileTypes.includes(ext)) {
          const chunks = await processFile(filePath, ext);
          ai_documents.push(...chunks);
        }
      }
    }
  }
  
  // ประมวลผลไฟล์ JavaScript, TypeScript, และ JSX/TSX
  await processDirectory(projectPath, ['.js', '.jsx', '.ts', '.tsx']);
  
  // ประมวลผลไฟล์ SQL (สำหรับโครงสร้างฐานข้อมูล)
  await processDirectory(projectPath, ['.sql']);
  
  // ประมวลผลไฟล์ Markdown และ HTML (สำหรับเอกสาร)
  await processDirectory(projectPath, ['.md', '.html']);
  
  return ai_documents;
}

/**
 * เพิ่มข้อมูลลงใน Vector Store (MySQL)
 */
export async function addDocumentsToVectorStore(ai_documents) {
  try {
    for (const doc of ai_documents) {
      // สร้าง embedding จากเนื้อหา
      const embeddingArray = await embeddings.embedDocuments([doc.pageContent]);
      const embedding = embeddingArray[0];
      
      // เพิ่มข้อมูลลงในตาราง ai_documents
      await query({
        query: 'INSERT INTO ai_documents (content, metadata, embedding) VALUES (?, ?, ?)',
        values: [
          doc.pageContent,
          JSON.stringify(doc.metadata || {}),
          JSON.stringify(embedding)
        ]
      });
    }
    
    return { success: true, count: ai_documents.length };
  } catch (error) {
    console.error('Error adding ai_documents to vector store:', error);
    return { success: false, error: error.message };
  }
}

/**
 * ค้นหาเอกสารที่คล้ายกับคำถามโดยใช้ MySQL และ stored procedure
 */
export async function searchSimilarDocuments(question, limit = 5) {
  try {
    // สร้าง embedding จากคำถาม
    const questionEmbeddingArray = await embeddings.embedQuery(question);
    
    // แปลง embedding เป็น JSON string
    const embeddingJson = JSON.stringify(questionEmbeddingArray);
    
    // เรียกใช้ stored procedure match_ai_documents
    const results = await query({
      query: 'CALL match_ai_documents(?, ?, ?)',
      values: [embeddingJson, 0.7, limit]
    });
    
    // แปลงผลลัพธ์ให้อยู่ในรูปแบบที่เหมาะสม
    return results[0].map(doc => ({
      pageContent: doc.content,
      metadata: JSON.parse(doc.metadata || '{}')
    }));
  } catch (error) {
    console.error('Error searching similar ai_documents:', error);
    return [];
  }
}

/**
 * สร้างคำตอบจากเอกสารที่เกี่ยวข้อง
 */
export async function generateAnswerFromDocuments(question, ai_documents) {
  // รวมเนื้อหาจากเอกสารที่เกี่ยวข้อง
  const context = ai_documents.map(doc => doc.pageContent).join('\n\n');
  
  // ใช้ OpenAI API เพื่อสร้างคำตอบ
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openAIApiKey}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `คุณเป็นผู้ช่วยตอบคำถามสำหรับ FTI Member Portal. ใช้ข้อมูลต่อไปนี้เพื่อตอบคำถาม: ${context}`
        },
        {
          role: "user",
          content: question
        }
      ],
      temperature: 0.3, // ตั้งค่าให้ต่ำเพื่อให้คำตอบมีความแน่นอนมากขึ้น
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * ค้นหาคำตอบสำหรับคำถาม
 */
export async function findAnswer(question) {
  try {
    // ค้นหาเอกสารที่เกี่ยวข้อง
    const ai_documents = await searchSimilarDocuments(question);
    
    if (ai_documents.length > 0) {
      // สร้างคำตอบจากเอกสารที่พบ
      return await generateAnswerFromDocuments(question, ai_documents);
    }
    
    return "ขออภัยครับ ผมไม่พบข้อมูลที่เกี่ยวข้องกับคำถามนี้";
  } catch (error) {
    console.error('Error finding answer:', error);
    return "ขออภัยครับ เกิดข้อผิดพลาดในการค้นหาคำตอบ";
  }
}
