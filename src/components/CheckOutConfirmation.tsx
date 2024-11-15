import React, { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { useChair } from '../context/ChairContext';

interface CheckOutConfirmationProps {
  chairId: number;
  onClose: () => void;
  onProceedToPayment: () => void;
}

function CheckOutConfirmation({ chairId, onClose, onProceedToPayment }: CheckOutConfirmationProps) {
  const { chairs, calculateFee } = useChair();
  const [currentTime, setCurrentTime] = useState(new Date());
  const chair = chairs.find(c => c.id === chairId);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!chair || !chair.startTime) {
    return null;
  }

  const duration = Math.ceil(
    (currentTime.getTime() - chair.startTime.getTime()) / (1000 * 60)
  );
  const fee = calculateFee(chair.startTime);

  const handlePaymentClick = () => {
    onProceedToPayment();
  };

  return (
    <div>
      <div className="flex items-center justify-center mb-6">
        <div className="bg-red-100 rounded-full p-3">
          <LogOut className="w-8 h-8 text-red-600" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-center mb-6">
        チェックアウト確認
      </h2>

      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">チェア番号</span>
            <span className="font-semibold">{chair.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">利用開始時間</span>
            <span className="font-semibold">
              {chair.startTime.toLocaleTimeString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">利用時間</span>
            <span className="font-semibold">{duration}分</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">料金</span>
            <span className="font-semibold text-xl">
              ¥{fee.toLocaleString()}
            </span>
          </div>
        </div>

        <button
          onClick={handlePaymentClick}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition duration-200"
        >
          支払いに進む
        </button>

        <button
          onClick={onClose}
          className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition duration-200"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}

export default CheckOutConfirmation;