import { query } from "@/app/lib/db";
import { updateContextWithFaq } from "../utils/contextManager.js";

/**
 * Handle user choice selection from multiple FAQ options
 * @param {string|number} choiceId - Selected FAQ ID or choice index
 * @param {string} sessionId - Session ID for context
 * @param {Array} availableChoices - Available choices from previous search
 * @returns {Promise<object|null>} Selected FAQ answer or null
 */
export async function handleChoiceSelection(choiceId, sessionId, availableChoices = null) {
  try {
    let selectedFaq = null;

    // If choiceId is a number and we have available choices, use index
    if (typeof choiceId === "number" && availableChoices && availableChoices.length > choiceId) {
      selectedFaq = availableChoices[choiceId];
    }
    // If choiceId is FAQ ID, fetch from database
    else if (typeof choiceId === "string" || typeof choiceId === "number") {
      const faqResult = await query({
        query: "SELECT * FROM faqs WHERE id = ? AND is_active = TRUE LIMIT 1",
        values: [choiceId],
      });

      if (faqResult && faqResult.length > 0) {
        selectedFaq = faqResult[0];
      }
    }

    if (!selectedFaq) {
      return null;
    }

    // Update conversation context
    if (sessionId) {
      // Create simple tokens from the selected question
      const tokens = selectedFaq.question.split(" ").filter((word) => word.length > 1);
      updateContextWithFaq(sessionId, selectedFaq, tokens, []);
    }

    return {
      question: selectedFaq.question,
      answer: selectedFaq.answer,
      id: selectedFaq.id,
      category: selectedFaq.category,
      isChoiceSelection: true,
    };
  } catch (error) {
    console.error("Error handling choice selection:", error);
    return null;
  }
}

/**
 * Format multiple FAQ choices for user selection
 * @param {Array} faqChoices - Array of FAQ objects with scores
 * @param {number} maxChoices - Maximum number of choices to show
 * @returns {object} Formatted choice response
 */
export function formatFaqChoices(faqChoices, maxChoices = 10) {
  if (!faqChoices || faqChoices.length === 0) {
    return null;
  }

  // Filter and limit choices
  const validChoices = faqChoices.filter((choice) => choice.score > 0).slice(0, maxChoices);

  if (validChoices.length === 0) {
    return null;
  }

  // If only one choice with high confidence, return it directly
  if (validChoices.length === 1 && validChoices[0].score > 15) {
    return {
      type: "direct_answer",
      data: {
        question: validChoices[0].faq.question,
        answer: validChoices[0].faq.answer,
        id: validChoices[0].faq.id,
        category: validChoices[0].faq.category,
        confidence: validChoices[0].score,
      },
    };
  }

  // Format choices for user selection
  const choices = validChoices.map((choice, index) => ({
    id: choice.faq.id,
    index: index,
    question: choice.faq.question,
    category: choice.faq.category,
    confidence: choice.score,
    preview: choice.faq.answer.substring(0, 100) + (choice.faq.answer.length > 100 ? "..." : ""),
  }));

  return {
    type: "multiple_choices",
    data: {
      message: `พบคำถามที่เกี่ยวข้อง ${choices.length} คำถาม กรุณาเลือกคำถามที่ต้องการ:`,
      choices: choices,
      totalFound: validChoices.length,
    },
  };
}

/**
 * Check if the input is a choice selection (number or FAQ ID)
 * @param {string} input - User input
 * @returns {{isChoice: boolean, choiceId?: string|number, choiceType?: string}}
 */
export function parseChoiceInput(input) {
  if (!input || typeof input !== "string") {
    return { isChoice: false };
  }

  const trimmedInput = input.trim();

  // Check if it's a number (choice index)
  const numberMatch = trimmedInput.match(/^(\d+)$/);
  if (numberMatch) {
    const choiceIndex = parseInt(numberMatch[1], 10) - 1; // Convert to 0-based index
    return {
      isChoice: true,
      choiceId: choiceIndex,
      choiceType: "index",
    };
  }

  // Check if it's a FAQ ID pattern
  const idMatch = trimmedInput.match(/^(?:faq_?)?(\d+)$/i);
  if (idMatch) {
    return {
      isChoice: true,
      choiceId: parseInt(idMatch[1], 10),
      choiceType: "id",
    };
  }

  // Check for choice keywords in Thai
  const choiceKeywords = ["เลือก", "ตัวเลือก", "ข้อ", "คำถาม", "อันที่", "ตัวที่"];

  for (const keyword of choiceKeywords) {
    const choicePattern = new RegExp(`${keyword}\\s*(\\d+)`, "i");
    const match = trimmedInput.match(choicePattern);
    if (match) {
      const choiceIndex = parseInt(match[1], 10) - 1; // Convert to 0-based index
      return {
        isChoice: true,
        choiceId: choiceIndex,
        choiceType: "keyword_index",
      };
    }
  }

  return { isChoice: false };
}

/**
 * Create help message for choice selection
 * @returns {object} Help message object
 */
export function getChoiceHelpMessage() {
  return {
    question: "วิธีการเลือกคำถาม",
    answer:
      "คุณสามารถเลือกคำถามได้ด้วยวิธีต่อไปนี้:\n\n" +
      '• พิมพ์ตัวเลข เช่น "1", "2", "3"\n' +
      '• พิมพ์ "เลือก 1", "ข้อ 2", "คำถามที่ 3"\n' +
      '• พิมพ์รหัสคำถาม เช่น "FAQ_123"\n\n' +
      "หรือพิมพ์คำถามใหม่เพื่อค้นหาใหม่",
    suggestions: ["ค้นหาคำถามใหม่", "แสดงคำถามยอดนิยม", "ติดต่อเจ้าหน้าที่"],
  };
}
