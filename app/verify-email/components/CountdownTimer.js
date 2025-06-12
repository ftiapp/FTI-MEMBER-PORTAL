// CountdownTimer.js
import { useState, useEffect } from 'react';

export default function CountdownTimer({ initialCount = 10, onComplete }) {
  const [countdown, setCountdown] = useState(initialCount);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (countdown === 0 && onComplete) {
      onComplete();
    }
  }, [countdown, onComplete]);

  if (countdown <= 0) return null;

  return (
    <div className="mt-4 bg-blue-50 p-4 rounded-lg">
      <p className="text-blue-800">
        คุณสามารถเข้าสู่ระบบได้แล้ว หรือรอ <span className="font-bold">{countdown}</span> วินาที
      </p>
      <div className="w-full bg-blue-200 rounded-full h-2.5 mt-2">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000 ease-linear"
          style={{ width: `${(countdown/initialCount) * 100}%` }}
        />
      </div>
    </div>
  );
}