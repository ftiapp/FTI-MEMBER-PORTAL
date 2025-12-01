"use client";

import { benefits } from "../data/benefits";

export default function SummaryStatistics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
      <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg p-6 text-white">
        <div className="text-center">
          <h4 className="text-lg font-semibold">ทบ สมทบ-บุคคลธรรมดา</h4>
          <p className="text-2xl font-bold mt-2">
            {benefits.filter((b) => b.supporting).length} สิทธิ
          </p>
          <p className="text-sm opacity-90">จาก {benefits.length} สิทธิทั้งหมด</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <div className="text-center">
          <h4 className="text-lg font-semibold">ทน สมทบ-นิติบุคคล</h4>
          <p className="text-2xl font-bold mt-2">
            {benefits.filter((b) => b.supporting).length} สิทธิ
          </p>
          <p className="text-sm opacity-90">จาก {benefits.length} สิทธิทั้งหมด</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <div className="text-center">
          <h4 className="text-lg font-semibold">สส สามัญ-สมาคมการค้า</h4>
          <p className="text-2xl font-bold mt-2">
            {benefits.filter((b) => b.associate).length} สิทธิ
          </p>
          <p className="text-sm opacity-90">จาก {benefits.length} สิทธิทั้งหมด</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-700 to-blue-800 rounded-lg p-6 text-white">
        <div className="text-center">
          <h4 className="text-lg font-semibold">สน สามัญ-โรงงาน</h4>
          <p className="text-2xl font-bold mt-2">
            {benefits.filter((b) => b.ordinary).length} สิทธิ
          </p>
          <p className="text-sm opacity-90">จาก {benefits.length} สิทธิทั้งหมด</p>
        </div>
      </div>
    </div>
  );
}
