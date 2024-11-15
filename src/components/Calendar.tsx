import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isAfter, startOfDay } from 'date-fns';
import ja from 'date-fns/locale/ja';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export default function Calendar({ selectedDate, onDateSelect }: CalendarProps) {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const today = startOfDay(new Date());

  const weekDays = ['月', '火', '水', '木', '金', '土', '日'];

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <select
            value={format(selectedDate, 'yyyy')}
            onChange={(e) => {
              const newDate = new Date(selectedDate);
              newDate.setFullYear(parseInt(e.target.value));
              onDateSelect(newDate);
            }}
            className="bg-gray-50 text-gray-700 px-2 py-1 rounded-md"
          >
            {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() + i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            value={format(selectedDate, 'M')}
            onChange={(e) => {
              const newDate = new Date(selectedDate);
              newDate.setMonth(parseInt(e.target.value) - 1);
              onDateSelect(newDate);
            }}
            className="bg-gray-50 text-gray-700 px-2 py-1 rounded-md"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <option key={month} value={month}>{month}月</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`
              text-center text-sm font-medium py-2
              ${index === 5 ? 'text-blue-600' : ''}
              ${index === 6 ? 'text-red-600' : 'text-gray-500'}
            `}
          >
            {day}
          </div>
        ))}
        {days.map((day, i) => {
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, selectedDate);
          const isPast = !isAfter(day, today);
          const dayOfWeek = day.getDay();
          const isSaturday = dayOfWeek === 6;
          const isSunday = dayOfWeek === 0;
          
          return (
            <button
              key={i}
              onClick={() => !isPast && onDateSelect(day)}
              disabled={isPast}
              className={`
                aspect-square rounded-full flex items-center justify-center text-sm
                ${isPast ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : ''}
                ${isSelected && !isPast ? 'bg-blue-100 text-blue-600' : ''}
                ${!isCurrentMonth ? 'text-gray-300' : ''}
                ${isSaturday && !isPast ? 'text-blue-600' : ''}
                ${isSunday && !isPast ? 'text-red-600' : ''}
                ${!isPast ? 'hover:bg-gray-100' : ''}
                transition-colors
              `}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}