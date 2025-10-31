"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Shared Image Editor Modal Component
 * Used for editing company stamps and authorized signatures across all membership types
 */
const ImageEditor = ({ isOpen, onClose, onSave, initialImage, title }) => {
  const canvasRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (initialImage && isOpen) {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        // Reset position and scale
        setScale(1);
        setPosition({ x: 0, y: 0 });
      };
      if (typeof initialImage === "string") {
        img.src = initialImage;
      } else {
        img.src = URL.createObjectURL(initialImage);
      }
    }
  }, [initialImage, isOpen]);

  useEffect(() => {
    if (image && isOpen) {
      drawCanvas();
    }
  }, [image, scale, position, isOpen]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext("2d");
    canvas.width = 400;
    canvas.height = 200;

    // Clear canvas
    ctx.fillStyle = "#f8f9fa";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "#e9ecef";
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw image
    ctx.save();
    ctx.translate(canvas.width / 2 + position.x, canvas.height / 2 + position.y);
    ctx.scale(scale, scale);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);
    ctx.restore();

    // Draw border
    ctx.strokeStyle = "#dee2e6";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const rect = canvasRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left - position.x,
      y: e.clientY - rect.top - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left - dragStart.x,
      y: e.clientY - rect.top - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      onSave(blob);
    }, "image/png");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>

        <div className="mb-4">
          <canvas
            ref={canvasRef}
            className="border border-gray-300 rounded cursor-move block mx-auto"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ขนาด: {Math.round(scale * 100)}%
          </label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.01"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="text-xs text-gray-700 mb-4 bg-blue-50 p-3 rounded leading-5">
          <div className="font-semibold mb-1">คำแนะนำการใช้งาน</div>
          <ul className="list-disc pl-5 space-y-1">
            <li>กรุณาคลิกค้างและลากภาพเพื่อปรับเปลี่ยนตำแหน่ง</li>
            <li>กรุณาใช้แถบเลื่อนเพื่อปรับขนาดภาพให้เหมาะสม (10-300%)</li>
            <li>
              ขนาดที่แนะนำ:
              <ul className="list-[circle] pl-5 mt-1 space-y-0.5">
                <li>โลโก้/ตราประทับบริษัท: 300 × 300 พิกเซล</li>
                <li>ลายเซ็นผู้มีอำนาจลงนาม: 120 × 60 พิกเซล</li>
              </ul>
            </li>
            <li>ท่านควรใช้ไฟล์ PNG พื้นหลังโปร่งใสเพื่อผลลัพธ์ที่เหมาะสม</li>
          </ul>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
