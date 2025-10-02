"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../utils/cropUtils";

export default function ImageCropper({ image, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [aspect] = useState(1); // 1:1 for logo

  const onCropChange = useCallback((crop) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom) => {
    setZoom(zoom);
  }, []);

  const onRotationChange = useCallback((rotation) => {
    setRotation(rotation);
  }, []);

  const onCropCompleteHandler = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation);
      onCropComplete(croppedImage);
    } catch (e) {
      console.error("Crop failed:", e);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
        <Cropper
          image={image}
          crop={crop}
          rotation={rotation}
          zoom={zoom}
          aspect={aspect}
          onCropChange={onCropChange}
          onRotationChange={onRotationChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropCompleteHandler}
          cropShape="rect"
          showGrid={false}
          zoomSpeed={0.1}
          maxZoom={3}
          minZoom={0.1}
          restrictPosition={false}
        />
      </div>

      <div className="flex flex-col gap-4 w-full max-w-md">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium w-20">ซูม:</label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={zoom}
            onChange={(e) => onZoomChange(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm w-12 text-right">{Math.round(zoom * 100)}%</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium w-20">หมุน:</label>
          <input
            type="range"
            min="-180"
            max="180"
            step="1"
            value={rotation}
            onChange={(e) => onRotationChange(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm w-12 text-right">{rotation}°</span>
        </div>

        <div className="text-center text-sm text-gray-600 mb-2">
          ลาก ปรับขนาด และหมุนรูปเพื่อเลือกพื้นที่ครอปได้ตามใจชอบ
        </div>

        <div className="flex gap-2 justify-center pt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleCrop}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            ตัดรูปและบันทึก
          </button>
        </div>
      </div>
    </div>
  );
}
