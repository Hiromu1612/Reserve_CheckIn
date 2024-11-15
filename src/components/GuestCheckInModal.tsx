import React, { useState } from 'react';
import { LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useReservationStore } from '../store/reservationStore';
import { format } from 'date-fns';
import ja from 'date-fns/locale/ja';
import { useAuthStore } from '../store/authStore';

interface GuestCheckInModalProps {
  chairId: number;
  chairName: string;
  onClose: () => void;
  onCheckIn: () => void;
}

export default function GuestCheckInModal({
  chairId,
  chairName,
  onClose,
  onCheckIn,
}: GuestCheckInModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { getCurrentReservation } = useReservationStore();
  const { user, verifyPassword } = useAuthStore();
  
  const currentReservation = getCurrentReservation(chairId);
  const hasReservation = !!currentReservation;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (hasReservation) {
      if (!password.trim()) {
        setError('アカウントのパスワードを入力してください');
        return;
      }
      
      try {
        // ユーザーのアカウントパスワードと照合
        const isValid = verifyPassword(password);
        if (!isValid) {
          setError('パスワードが正しくありません');
          return;
        }
        onCheckIn();
      } catch (err) {
        setError('認証に失敗しました');
      }
    } else {
      onCheckIn();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-center mb-6">
        <div className="bg-indigo-100 rounded-full p-3">
          <LogIn className="w-8 h-8 text-indigo-600" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-center mb-6">
        {chairName}にチェックイン
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {hasReservation && (
          <>
            <div className="bg-indigo-50 p-4 rounded-lg mb-4">
              <p className="text-indigo-900 font-medium">予約情報</p>
              <p className="text-indigo-700 text-sm mt-1">
                {format(new Date(currentReservation.start_time), 'M月d日(E) HH:mm', { locale: ja })} -
                {format(new Date(currentReservation.end_time), 'HH:mm', { locale: ja })}
              </p>
              <p className="text-indigo-600 text-sm mt-2">
                予約者: {currentReservation.user_name}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                アカウントパスワード
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 pr-10"
                  placeholder="アカウントのパスワードを入力"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="flex space-x-4">
          <button
            type="submit"
            className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition duration-200"
          >
            チェックイン
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition duration-200"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}