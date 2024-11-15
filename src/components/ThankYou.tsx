import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

interface ThankYouProps {
  onComplete: () => void;
}

function ThankYou({ onComplete }: ThankYouProps) {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }

    if (countdown === 0) {
      onComplete();
    }
  }, [countdown, onComplete]);

  return (
    <div className="text-center space-y-8 py-4">
      <div className="flex items-center justify-center">
        <div className="bg-green-100 rounded-full p-6">
          <CheckCircle className="w-16 h-16 text-green-600" />
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          ご利用ありがとうございました
        </h2>
      </div>

      <button
        onClick={onComplete}
        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition duration-200"
      >
        ホーム画面に戻る ({countdown}秒)
      </button>
    </div>
  );
}

export default ThankYou;