"use client";

import { useState } from "react";

export default function DocumentRequirements() {
  const [activeDocumentTab, setActiveDocumentTab] = useState("ordinary");

  const documentRequirements = {
    ordinary: {
      title: "สมาชิกสามัญ - โรงงาน (สน)",
      description:
        "เป็นนิติบุคคลที่ตั้งขึ้นตามกฎหมายไทย และประกอบอุตสาหกรรมจากการผลิต แบ่งออกเป็น 2 ประเภท ดังนี้",
      categories: [
        {
          title: "ประเภทที่ 1",
          subtitle: "มีเครื่องจักร มากกว่า 50 แรงม้า",
          requirements: [
            "มีใบอนุญาตประกอบกิจการโรงงาน (รง.4) / ใบอนุญาตให้ใช้ที่ดินและประกอบกิจการในนิคมอุตสาหกรรม (กนอ.)",
          ],
        },
        {
          title: "ประเภทที่ 2",
          subtitle: "ไม่มีเครื่องจักร/ มีเครื่องจักร ต่ำกว่า 50 แรงม้า",
          requirements: [
            "ไม่มีใบอนุญาตพิจารณาจากรหัส (TSIC Code) ที่จดทะเบียนกับกรมพัฒนาธุรกิจการค้ากระทรวงพาณิชย์ ซึ่งแสดงถึงความเกี่ยวข้องกับอุตสาหกรรม หมวดที่เป็น Positive list โดยใช้หลักฐานเพิ่มเติมได้แก่",
            "> - เอกสารที่ออกโดยหน่วยงานภาครัฐที่แสดงถึงการผลิต และ/หรือ",
            "> - รูปถ่าย เครื่องจักร อุปกรณ์ และสถานที่ผลิต",
          ],
        },
      ],
    },
    associate: {
      title: "สมาชิกสามัญ - สมาคมการค้า (สส)",
      description:
        "เป็นสมาคมการค้าที่ตั้งขึ้นตามกฎหมายว่าด้วย สมาคมการค้า และมีวัตถุประสงค์เพื่อส่งเสริมการประกอบอุตสาหกรรม",
      documents: ["สำเนาหนังสือรับรองการจดทะเบียนเป็นสมาคมการค้า", "รายชื่อสมาชิกสมาคม"],
    },
    supporting_corporate: {
      title: "สมาชิกสมทบ - นิติบุคคล (ทน)",
      description:
        "เป็นนิติบุคคลที่ตั้งขึ้นตามกฎหมายไทย และประกอบธุรกิจการค้า/ให้บริการ แต่มิได้ประกอบอุตสาหกรรมจากการผลิต",
      documents: ["สำเนาหนังสือรับรองการจดทะเบียนนิติบุคคล"],
    },
    supporting_individual: {
      title: "สมาชิกสมทบ - บุคคลธรรมดา (ทบ)",
      description: "เป็นบุคคลธรรมดา ที่ไม่ได้จดทะเบียนนิติบุคคล",
      documents: ["สำเนาบัตรประชาชน", "สำเนาใบทะเบียนพาณิชย์ (ถ้ามี)"],
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <h3 className="text-2xl font-bold mb-2">เอกสารประกอบการรับสมัครสมาชิก</h3>
        <p className="opacity-90">เอกสารที่จำเป็นสำหรับการสมัครสมาชิกประเภทต่างๆ</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b bg-gray-50">
        <div className="flex overflow-x-auto">
          {Object.entries(documentRequirements).map(([key, requirement]) => (
            <button
              key={key}
              onClick={() => setActiveDocumentTab(key)}
              className={`flex-shrink-0 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeDocumentTab === key
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300"
              }`}
            >
              {requirement.title.split(" - ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {Object.entries(documentRequirements).map(([key, requirement]) => (
          <div key={key} className={`${activeDocumentTab === key ? "block" : "hidden"}`}>
            <div className="mb-6">
              <div className="mb-4">
                <h4 className="text-xl font-bold text-blue-900 mb-2">{requirement.title}</h4>
                <p className="text-gray-600">{requirement.description}</p>
              </div>
            </div>

            {/* Categories for ordinary membership */}
            {requirement.categories && (
              <div className="space-y-6">
                {requirement.categories.map((category, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg"
                  >
                    <h5 className="font-semibold text-blue-900 mb-2">
                      {category.title}: {category.subtitle}
                    </h5>
                    <ul className="space-y-2">
                      {category.requirements.map((req, idx) => (
                        <li key={idx} className="text-gray-700 leading-relaxed">
                          {req.startsWith(">") ? (
                            <span className="ml-4 text-gray-600">{req}</span>
                          ) : (
                            <span className="flex items-start">
                              <span className="text-blue-600 mr-2 font-bold">•</span>
                              {req}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Documents for other membership types */}
            {requirement.documents && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <svg
                    className="w-5 h-5 text-blue-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  เอกสารประกอบ
                </h5>
                <ul className="space-y-2">
                  {requirement.documents.map((doc, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <svg
                        className="w-4 h-4 text-blue-500 mr-3 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Additional Info */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-blue-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-medium text-blue-800">หมายเหตุ</span>
              </div>
              <p className="text-blue-700 mt-1 text-sm">
                เอกสารทั้งหมด ให้รับรองสำเนาถูกต้อง หากไม่ครบถ้วนเจ้าหน้าที่อาจขอเอกสารเพิ่มเติม
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
