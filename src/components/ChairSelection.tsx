import React, { useState } from 'react';
import { useChair } from '../context/ChairContext';
import Modal from './Modal';
import ChairCard from './ChairCard';
import ReservationModal from './ReservationModal';
import ChairVisualization from './ChairVisualization';
import ReservationComplete from './ReservationComplete';
import ReservationConfirmation from './ReservationConfirmation';
import GuestCheckInModal from './GuestCheckInModal';
import CheckOutConfirmation from './CheckOutConfirmation';
import Payment from './Payment';
import ThankYou from './ThankYou';
import { useAuthStore } from '../store/authStore';
import { useReservationStore } from '../store/reservationStore';
import { isWithinInterval } from 'date-fns';

interface Reservation {
  start_time: string;
  end_time: string;
  user_id: string;
}

export default function ChairSelection() {
  const { chairs, startUse, endUse } = useChair();
  const { user } = useAuthStore();
  const { getChairReservations, getCurrentReservation, cancelReservation } = useReservationStore();
  const [selectedChair, setSelectedChair] = useState<number | null>(null);
  const [selectedChairs, setSelectedChairs] = useState<number[]>([]);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showGuestCheckInModal, setShowGuestCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [lastReservation, setLastReservation] = useState<any>(null);
  const [originalReservation, setOriginalReservation] = useState<Reservation | null>(null);
  const [newReservation, setNewReservation] = useState<Reservation | null>(null);
  const [error, setError] = useState('');

  const handleChairSelect = (chairId: number) => {
    const chair = chairs.find(c => c.id === chairId);
    if (!chair) return;

    // 現在の予約状態を確認
    const currentReservation = getCurrentReservation(chairId);
    const now = new Date();

    // チェアが利用中で、自分が利用している場合はチェックアウトモーダルを表示
    if (chair.isOccupied && chair.userId === user?.id) {
      setSelectedChair(chairId);
      setShowCheckOutModal(true);
      return;
    }

    // ゲストユーザーの場合の処理
    if (user?.isGuest) {
      setSelectedChair(chairId);
      setSelectedChairs([chairId]);
      
      // 予約があり、現在時刻が予約時間内の場合はチェックインモーダルを表示
      if (currentReservation && isWithinInterval(now, {
        start: new Date(currentReservation.start_time),
        end: new Date(currentReservation.end_time)
      })) {
        setShowGuestCheckInModal(true);
      } else if (!chair.isOccupied) {
        // 予約がないか予約時間外で、チェアが空いている場合は直接チェックイン
        setShowGuestCheckInModal(true);
      }
      return;
    }

    // 通常ユーザーの場合の処理
    setSelectedChair(chairId);
    setSelectedChairs([chairId]);
    
    const reservations = getChairReservations(chairId);
    const userReservation = reservations.find(r => r.user_id === user?.id);
    
    if (userReservation) {
      setOriginalReservation(userReservation);
      setShowReservationModal(true);
    } else {
      setShowReservationModal(true);
    }
  };

  const handleGuestCheckIn = () => {
    if (selectedChair === null) return;
    startUse(selectedChair, user?.id || '');
    setShowGuestCheckInModal(false);
    setSelectedChair(null);
    setSelectedChairs([]);
  };

  const handleReservationComplete = (reservation: any) => {
    if (originalReservation) {
      setNewReservation({
        ...reservation,
        start_time: reservation.startTime.toISOString(),
        end_time: reservation.endTime.toISOString(),
        user_id: user?.id || ''
      });
      setShowReservationModal(false);
      setShowConfirmationModal(true);
    } else {
      setLastReservation({
        ...reservation,
        chairIds: selectedChairs
      });
      setShowReservationModal(false);
      setShowCompleteModal(true);
      setSelectedChairs([]);
      setError('');
    }
  };

  const handleConfirmationConfirm = () => {
    if (newReservation) {
      setLastReservation({
        ...newReservation,
        chairIds: selectedChairs
      });
      setShowConfirmationModal(false);
      setShowCompleteModal(true);
      setOriginalReservation(null);
      setNewReservation(null);
      setSelectedChairs([]);
      setError('');
    }
  };

  const handleConfirmationCancel = () => {
    setShowConfirmationModal(false);
    setShowReservationModal(true);
  };

  const handleReservationCancel = () => {
    if (selectedChair === null) return;
    const reservations = getChairReservations(selectedChair);
    const userReservation = reservations.find(r => r.user_id === user?.id);
    if (userReservation) {
      cancelReservation(userReservation.id);
      setShowReservationModal(false);
      setSelectedChair(null);
      setSelectedChairs([]);
    }
  };

  const handleCheckOut = () => {
    setShowCheckOutModal(false);
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = () => {
    if (selectedChair === null) return;
    endUse(selectedChair);
    setShowPaymentModal(false);
    setShowThankYouModal(true);
  };

  const handleThankYouComplete = () => {
    setShowThankYouModal(false);
    setSelectedChair(null);
    setSelectedChairs([]);
  };

  const handleModalClose = () => {
    setShowReservationModal(false);
    setShowConfirmationModal(false);
    setShowCompleteModal(false);
    setShowGuestCheckInModal(false);
    setShowCheckOutModal(false);
    setShowPaymentModal(false);
    setShowThankYouModal(false);
    setSelectedChair(null);
    setOriginalReservation(null);
    setNewReservation(null);
    setSelectedChairs([]);
    setError('');
  };

  return (
    <div className="container mx-auto px-4">
      <ChairVisualization 
        onChairSelect={handleChairSelect}
        highlightedChairId={selectedChair}
        showReservationHighlight={showReservationModal}
        selectedChairs={selectedChairs}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {chairs.map((chair) => (
          <ChairCard
            key={chair.id}
            {...chair}
            onSelect={() => handleChairSelect(chair.id)}
            isSelected={selectedChairs.includes(chair.id)}
          />
        ))}
      </div>

      {selectedChair !== null && (
        <>
          <Modal
            isOpen={showReservationModal}
            onClose={handleModalClose}
          >
            <ReservationModal
              chairId={selectedChair}
              chairName={chairs.find(c => c.id === selectedChair)?.name || ''}
              onClose={handleModalClose}
              onComplete={handleReservationComplete}
              selectedChairs={selectedChairs}
              existingReservation={originalReservation}
              onCancel={handleReservationCancel}
              isOccupied={chairs.find(c => c.id === selectedChair)?.isOccupied}
            />
          </Modal>

          <Modal
            isOpen={showConfirmationModal}
            onClose={handleModalClose}
          >
            {originalReservation && newReservation && (
              <ReservationConfirmation
                originalReservation={originalReservation}
                newReservation={newReservation}
                onConfirm={handleConfirmationConfirm}
                onCancel={handleConfirmationCancel}
              />
            )}
          </Modal>

          <Modal
            isOpen={showCompleteModal}
            onClose={handleModalClose}
          >
            <ReservationComplete
              reservation={lastReservation}
              onClose={handleModalClose}
            />
          </Modal>

          <Modal
            isOpen={showGuestCheckInModal}
            onClose={handleModalClose}
          >
            <GuestCheckInModal
              chairId={selectedChair}
              chairName={chairs.find(c => c.id === selectedChair)?.name || ''}
              onClose={handleModalClose}
              onCheckIn={handleGuestCheckIn}
            />
          </Modal>

          <Modal
            isOpen={showCheckOutModal}
            onClose={handleModalClose}
          >
            <CheckOutConfirmation
              chairId={selectedChair}
              onClose={handleModalClose}
              onProceedToPayment={handleCheckOut}
            />
          </Modal>

          <Modal
            isOpen={showPaymentModal}
            onClose={handleModalClose}
          >
            <Payment
              onComplete={handlePaymentComplete}
              onClose={handleModalClose}
            />
          </Modal>

          <Modal
            isOpen={showThankYouModal}
            onClose={handleModalClose}
          >
            <ThankYou
              onComplete={handleThankYouComplete}
            />
          </Modal>
        </>
      )}
    </div>
  );
}