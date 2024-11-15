import React from 'react';
import { Check } from 'lucide-react';
import { useChair } from '../context/ChairContext';

interface CheckInConfirmationProps {
  onClose: () => void;
}

function CheckInConfirmation({ onClose }: CheckInConfirmationProps) {
  const { selectedChair, checkIn } = useChair();

  if (!selectedChair) {
    return null;
  }

  const handleConfirm = () => {
    checkIn(selectedChair.id, 'user123');
    onClose();
  };

  return (
    <div>
      <div className="flex items-center justify-center mb-6">
        <div className="bg-green-100 rounded-full p-3">
          <Check className="w-8 h-8 text-green-600" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-center mb-6">
        チェックイン確認
      </h2>

      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-center text-gray-600">
            {selectedChair.name}を選択しました
          </p>
          <p className="text-center text-gray-600 mt-2">
            チェックインしますか？
          </p>
        </div>

        <button
          onClick={handleConfirm}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition duration-200"
        >
          チェックインする
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

export default CheckInConfirmation;