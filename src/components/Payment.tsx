import React, { useState } from 'react';
import { CreditCard, Smartphone, Check, Wallet } from 'lucide-react';
import { useChair } from '../context/ChairContext';

interface PaymentProps {
  onComplete: () => void;
  onClose: () => void;
}

function Payment({ onComplete, onClose }: PaymentProps) {
  const { selectedChair, checkOut, calculateFee } = useChair();
  const [showTouchPayment, setShowTouchPayment] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  if (!selectedChair || !selectedChair.startTime) {
    return null;
  }

  const duration = Math.ceil(
    (currentTime.getTime() - selectedChair.startTime.getTime()) / (1000 * 60)
  );
  const fee = calculateFee(selectedChair.startTime);

  const handleProceedToTouchPayment = () => {
    setShowTouchPayment(true);
  };

  const handleTouchPayment = async () => {
    setProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setPaymentComplete(true);

    setTimeout(() => {
      if (selectedChair) {
        checkOut(selectedChair.id);
      }
      setProcessing(false);
      onComplete();
    }, 1500);
  };

  if (showTouchPayment) {
    return (
      <div className="text-center space-y-8 py-4">
        {paymentComplete ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="bg-green-100 rounded-full p-6">
              <Check className="w-16 h-16 text-green-600" />
            </div>
            <p className="text-xl font-semibold text-green-600">
              お支払いが完了しました
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="bg-blue-100 rounded-full p-6 animate-pulse">
                <Wallet className="w-16 h-16 text-blue-600" />
              </div>
              <p className="text-xl font-semibold">
                カードをタッチしてください
              </p>
              <p className="text-gray-600">
                ¥{fee.toLocaleString()}
              </p>
            </div>

            {/* タッチ決済エリア */}
            <div className="relative">
              <button
                onClick={handleTouchPayment}
                disabled={processing}
                className="w-full h-48 border-4 border-dashed border-blue-300 rounded-lg flex items-center justify-center bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <span className="text-blue-600 font-medium relative z-10">
                  {processing ? '処理中...' : 'ここにカードをタッチ'}
                </span>
              </button>
            </div>

            {/* 対応カードの表示 */}
            <div className="text-sm text-gray-500">
              <p className="mb-2">対応カード</p>
              <div className="flex items-center justify-center space-x-4">
                <CreditCard className="w-6 h-6" />
                <Smartphone className="w-6 h-6" />
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-center mb-6">
        <div className="bg-indigo-100 rounded-full p-3">
          <CreditCard className="w-8 h-8 text-indigo-600" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-center mb-6">
        お支払い
      </h2>

      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">チェア番号</span>
            <span className="font-semibold">{selectedChair.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">利用開始時間</span>
            <span className="font-semibold">
              {selectedChair.startTime.toLocaleTimeString()}
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
          onClick={handleProceedToTouchPayment}
          className="w-full py-3 px-4 rounded-lg flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition duration-200"
        >
          <Wallet className="w-5 h-5" />
          <span>タッチ決済に進む</span>
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

export default Payment;