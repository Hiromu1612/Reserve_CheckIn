import React, { useState } from 'react';
import { Calendar as CalendarIcon, Users, Edit3, Trash2, X, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useReservationStore } from '../store/reservationStore';
import { addHours, addMinutes, format, parse, setHours, setMinutes, isWithinInterval } from 'date-fns';
import ja from 'date-fns/locale/ja';
import Calendar from './Calendar';
import TimeSelect from './TimeSelect';

interface ReservationModalProps {
  chairId: number;
  chairName: string;
  onClose: () => void;
  onComplete: (reservation: any) => void;
  selectedChairs?: number[];
  existingReservation?: any;
  onCancel?: () => void;
  isOccupied?: boolean;
}

export default function ReservationModal({ 
  chairId, 
  chairName, 
  onClose,
  onComplete,
  selectedChairs = [],
  existingReservation,
  onCancel,
  isOccupied = false
}: ReservationModalProps) {
  const { user } = useAuthStore();
  const { addReservation, cancelReservation, getChairReservations, isChairAvailable } = useReservationStore();
  const [showCalendar, setShowCalendar] = useState(false);
  const [error, setError] = useState('');
  const [people, setPeople] = useState(selectedChairs.length || 1);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // 現在時刻から6時間後を初期値に設定
  const now = new Date();
  const initialStartTime = isOccupied ? addHours(now, 6) : addMinutes(now, 1);
  const initialEndTime = addHours(initialStartTime, 1);

  const [date, setDate] = useState(format(initialStartTime, 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState(format(initialStartTime, 'HH:mm'));
  const [endTime, setEndTime] = useState(format(initialEndTime, 'HH:mm'));

  // 他のユーザーの予約を取得
  const otherReservations = getChairReservations(chairId)
    .filter(r => r.user_id !== user?.id)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  const handleStartTimeChange = (value: string) => {
    setError('');
    const [hours, minutes] = value.split(':').map(Number);
    const newStartDate = setHours(setMinutes(parse(date, 'yyyy-MM-dd', new Date()), minutes), hours);
    const newEndDate = addHours(newStartDate, 1);
    setStartTime(value);
    setEndTime(format(newEndDate, 'HH:mm'));
  };

  const handleEndTimeChange = (value: string) => {
    setEndTime(value);
    setError('');
  };

  const validateTimeSlot = (startDate: Date, endDate: Date) => {
    // 予約時間の重複チェック
    const isAvailable = selectedChairs.every(chairId => 
      isChairAvailable(chairId, startDate, endDate)
    );

    if (!isAvailable) {
      setError('選択した時間帯は既に予約されています。他の時間を選択してください。');
      return false;
    }

    // 現在時刻から6時間以内の予約は不可（利用中の場合）
    if (isOccupied) {
      const minStartTime = addHours(now, 6);
      if (startDate < minStartTime) {
        setError('利用中のチェアは6時間後以降の時間帯から予約可能です。');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const startDate = parse(`${date} ${startTime}`, 'yyyy-MM-dd HH:mm', new Date());
    const endDate = parse(`${date} ${endTime}`, 'yyyy-MM-dd HH:mm', new Date());

    // 予約時間の重複チェック
    if (!validateTimeSlot(startDate, endDate)) {
      return;
    }

    if (existingReservation) {
      // 修正の場合は確認画面を表示
      setShowConfirmation(true);
      return;
    }

    // 新規予約の場合は直接処理
    try {
      for (const chairId of selectedChairs) {
        const reservation = {
          chair_id: chairId,
          user_id: user?.id,
          user_name: user?.name || 'ゲスト',
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString(),
          duration: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60)),
          people: selectedChairs.length
        };

        await addReservation(reservation);
      }

      onComplete({
        startTime: startDate,
        endTime: endDate,
        people: selectedChairs.length,
        chairIds: selectedChairs
      });
    } catch (error) {
      console.error('Error saving reservation:', error);
      setError('予約の保存中にエラーが発生しました。');
    }
  };

  const handleConfirmModification = async () => {
    const startDate = parse(`${date} ${startTime}`, 'yyyy-MM-dd HH:mm', new Date());
    const endDate = parse(`${date} ${endTime}`, 'yyyy-MM-dd HH:mm', new Date());

    try {
      // 既存の予約をキャンセル
      await cancelReservation(existingReservation.id);

      // 新しい予約を作成
      const reservation = {
        chair_id: chairId,
        user_id: user?.id,
        user_name: user?.name || 'ゲスト',
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        duration: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60)),
        people: selectedChairs.length
      };

      await addReservation(reservation);

      onComplete({
        startTime: startDate,
        endTime: endDate,
        people: selectedChairs.length,
        chairIds: selectedChairs
      });
    } catch (error) {
      console.error('Error modifying reservation:', error);
      setError('予約の修正中にエラーが発生しました。');
    }
  };

  if (showConfirmation) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-center mb-6">予約修正の確認</h2>
        <div className="space-y-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium text-gray-700 mb-2">修正前</p>
            <p className="text-gray-600">
              {format(new Date(existingReservation.start_time), 'M月d日(E) HH:mm', { locale: ja })} -
              {format(new Date(existingReservation.end_time), 'HH:mm', { locale: ja })}
            </p>
          </div>
          <div className="text-center">↓</div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="font-medium text-blue-700 mb-2">修正後</p>
            <p className="text-blue-600">
              {format(parse(`${date} ${startTime}`, 'yyyy-MM-dd HH:mm', new Date()), 'M月d日(E) HH:mm', { locale: ja })} -
              {format(parse(`${date} ${endTime}`, 'yyyy-MM-dd HH:mm', new Date()), 'HH:mm', { locale: ja })}
            </p>
          </div>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleConfirmModification}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            確定
          </button>
          <button
            onClick={() => setShowConfirmation(false)}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition duration-200"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 relative">
      <div className="absolute top-2 right-2">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <h2 className="text-2xl font-bold text-center mb-6">
        {existingReservation ? '予約の管理' : `チェア ${selectedChairs.map(id => id).join(', ')} の予約`}
      </h2>

      {showCalendar && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 shadow-xl">
          <Calendar
            selectedDate={parse(date, 'yyyy-MM-dd', new Date())}
            onDateSelect={(newDate) => {
              setDate(format(newDate, 'yyyy-MM-dd'));
              setShowCalendar(false);
              setError('');
            }}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowCalendar(!showCalendar)}
            className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700"
          >
            <CalendarIcon className="w-5 h-5" />
            <span>{format(parse(date, 'yyyy-MM-dd', new Date()), 'yyyy年MM月dd日(E)', { locale: ja })}</span>
          </button>

          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-gray-500" />
            <span className="text-lg font-medium">{people}名</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <TimeSelect
            label="開始時間"
            value={startTime}
            onChange={handleStartTimeChange}
          />
          <TimeSelect
            label="終了時間"
            value={endTime}
            onChange={handleEndTimeChange}
          />
        </div>

        {/* 他のユーザーの予約状況表示 */}
        {otherReservations.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">予約状況</h3>
            <div className="space-y-2">
              {otherReservations.map((reservation, index) => (
                <div key={index} className="text-sm text-blue-700 flex items-center space-x-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span>
                    {format(new Date(reservation.start_time), 'M月d日(E) HH:mm', { locale: ja })} -
                    {format(new Date(reservation.end_time), 'HH:mm', { locale: ja })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="flex space-x-4">
          {existingReservation ? (
            <>
              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition duration-200"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Edit3 className="w-5 h-5" />
                  <span>予約を修正</span>
                </div>
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition duration-200"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Trash2 className="w-5 h-5" />
                  <span>予約をキャンセル</span>
                </div>
              </button>
            </>
          ) : (
            <>
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition duration-200"
              >
                予約する
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition duration-200"
              >
                キャンセル
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}