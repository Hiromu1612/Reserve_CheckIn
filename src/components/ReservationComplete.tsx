import React from 'react';
import { CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import ja from 'date-fns/locale/ja';

interface ReservationCompleteProps {
  reservation: {
    startTime: Date;
    endTime: Date;
    people: number;
    chairIds: number[];
  };
  onClose: () => void;
}

export default function ReservationComplete({ reservation, onClose }: ReservationCompleteProps) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-center mb-6">
        <div className="bg-green-100 rounded-full p-3">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-center mb-6">
        予約が完了しました
      </h2>

      <div className="bg-gray-50 p-4 rounded-lg space-y-3 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">予約日時</span>
          <span className="font-semibold">
            {format(reservation.startTime, 'yyyy年MM月dd日(E)', { locale: ja })}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">時間</span>
          <span className="font-semibold">
            {format(reservation.startTime, 'HH:mm')} - {format(reservation.endTime, 'HH:mm')}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">利用人数</span>
          <span className="font-semibold">{reservation.people}名</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">予約チェア</span>
          <span className="font-semibold">
            チェア {reservation.chairIds.join(', ')}
          </span>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition duration-200"
      >
        閉じる
      </button>
    </div>
  );
}