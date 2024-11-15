import React, { useState, useEffect } from 'react';
import { Timer, Calendar, Clock, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useReservationStore } from '../store/reservationStore';
import { format, isWithinInterval, parseISO } from 'date-fns';
import ja from 'date-fns/locale/ja';

interface ChairCardProps {
  id: number;
  name: string;
  isOccupied: boolean;
  startTime?: Date;
  onSelect: () => void;
  isSelected?: boolean;
}

export default function ChairCard({ 
  id, 
  name, 
  isOccupied, 
  startTime, 
  onSelect,
  isSelected
}: ChairCardProps) {
  const { user } = useAuthStore();
  const { getChairReservations } = useReservationStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [reservations, setReservations] = useState(getChairReservations(id));

  // Update the current time and reservations every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setReservations(getChairReservations(id));
    }, 1000);

    return () => clearInterval(timer);
  }, [id, getChairReservations]);

  // Check the current reservation state
  const currentReservation = reservations.find(r => {
    const startTime = parseISO(r.start_time);
    const endTime = parseISO(r.end_time);
    return isWithinInterval(currentTime, { start: startTime, end: endTime });
  });

  // Check the user's reservation
  const userReservation = reservations.find(r => r.user_id === user?.id);

  // Retrieve reservations of other users (max 2)
  const otherReservations = reservations
    .filter(r => r.user_id !== user?.id)
    .slice(0, 2);

  // Determine status display
  let status = '';
  let statusColor = '';
  let bgColor = '';

  if (isOccupied) {
    status = '利用中';
    statusColor = 'red';
    bgColor = 'bg-red-50';
  } else if (currentReservation) {
    status = '予約中';
    statusColor = 'blue';
    bgColor = 'bg-blue-50';
  } else if (userReservation && !user?.isGuest) {
    status = '予約中';
    statusColor = 'blue';
    bgColor = 'bg-blue-50';
  } else if (isSelected) {
    status = '選択中';
    statusColor = 'green';
    bgColor = 'bg-green-50';
  } else {
    status = '空き';
    statusColor = 'green';
    bgColor = 'bg-white hover:bg-green-50';
  }

  return (
    <div
      className={`
        relative p-6 rounded-xl shadow-lg transition duration-200
        ${bgColor} cursor-pointer hover:shadow-xl
      `}
      style={{ minHeight: "280px" }}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">
          {name}
        </h3>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${statusColor}-100 text-${statusColor}-800`}>
          {status}
        </span>
      </div>

      {/* User's reservation display */}
      {userReservation && (
        <div className="bg-blue-50 p-3 rounded-lg mb-3">
          <div className="flex items-center justify-between text-sm font-medium text-blue-900 mb-1">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>あなたの予約</span>
            </div>
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span className="text-xs">{userReservation.user_name}</span>
            </div>
          </div>
          <div className="text-sm text-blue-700">
            {format(parseISO(userReservation.start_time), 'M月d日(E)', { locale: ja })}
            <br />
            <div className="flex items-center space-x-1 mt-1">
              <Clock className="w-4 h-4" />
              <span>
                {format(parseISO(userReservation.start_time), 'HH:mm', { locale: ja })} -
                {format(parseISO(userReservation.end_time), 'HH:mm', { locale: ja })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Display other users' reservation info (max 2) */}
      {otherReservations.length > 0 && !userReservation && (
        <div className="bg-gray-50 p-3 rounded-lg mb-3">
          <div className="text-sm font-medium text-gray-700 mb-2">予約状況</div>
          {otherReservations.map((reservation, index) => (
            <div key={index} className="text-sm text-gray-600 mb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{format(parseISO(reservation.start_time), 'M月d日(E)', { locale: ja })}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span className="text-xs">{reservation.user_name}</span>
                </div>
              </div>
              <div className="flex items-center space-x-1 mt-1">
                <Clock className="w-4 h-4" />
                <span>
                  {format(parseISO(reservation.start_time), 'HH:mm', { locale: ja })} -
                  {format(parseISO(reservation.end_time), 'HH:mm', { locale: ja })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Display available status if no reservations */}
      {!userReservation && otherReservations.length === 0 && !isOccupied && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-gray-600">
            予約可能時間
          </div>
          <div className="text-sm text-gray-500">
            10:00 - 20:00
          </div>
        </div>
      )}

      {/* Display start time if available */}
      {startTime && (
        <div className="mt-2 flex items-center space-x-2">
          <Timer className="w-5 h-5" />
          <span>開始: {format(startTime, 'HH:mm')}</span>
        </div>
      )}
    </div>
  );
}