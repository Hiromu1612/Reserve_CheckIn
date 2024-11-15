import React from 'react';
import { format, parseISO } from 'date-fns';
import ja from 'date-fns/locale/ja';
import { Edit3, X } from 'lucide-react';

interface Reservation {
  start_time: string;
  end_time: string;
}

interface ReservationConfirmationProps {
  originalReservation: Reservation;
  newReservation: Reservation;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ReservationConfirmation({
  originalReservation,
  newReservation,
  onConfirm,
  onCancel
}: ReservationConfirmationProps) {
  // 日時が文字列で渡ってくる場合に対応
  const formatDateTime = (dateTime: string | Date) => {
    const date = typeof dateTime === 'string' ? parseISO(dateTime) : dateTime;
    return {
      date: format(date, 'M月d日', { locale: ja }),
      time: format(date, 'HH:mm', { locale: ja }),
      weekday: format(date, '(E)', { locale: ja })
    };
  };

  const original = {
    start: formatDateTime(originalReservation.start_time),
    end: formatDateTime(originalReservation.end_time)
  };

  const updated = {
    start: formatDateTime(newReservation.start_time),
    end: formatDateTime(newReservation.end_time)
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-center mb-6">
        <div className="bg-indigo-100 rounded-full p-3">
          <Edit3 className="w-8 h-8 text-indigo-600" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-center mb-6">
        予約修正の確認
      </h2>

      <div className="space-y-6 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <span>修正前</span>
            <span className="font-medium">
              {original.start.date}{original.start.weekday} {original.start.time}
              {' - '}
              {original.end.time}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span>↓</span>
          </div>
          <div className="flex items-center space-x-2 text-indigo-600">
            <span>修正後</span>
            <span className="font-medium">
              {updated.start.date}{updated.start.weekday} {updated.start.time}
              {' - '}
              {updated.end.time}
            </span>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={onConfirm}
          className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition duration-200"
        >
          確定する
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition duration-200"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}