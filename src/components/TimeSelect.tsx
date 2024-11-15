import React from 'react';

interface TimeSelectProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

export default function TimeSelect({ value, onChange, label }: TimeSelectProps) {
  const [hours, minutes] = value.split(':');

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex items-center space-x-2">
        <div className="relative w-20">
          <select
            value={hours}
            onChange={(e) => onChange(`${e.target.value}:${minutes}`)}
            className="w-full py-2 pl-3 pr-8 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {Array.from({ length: 24 }, (_, i) => 
              i.toString().padStart(2, '0')
            ).map(hour => (
              <option key={hour} value={hour}>{hour}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <span className="text-xl font-medium text-gray-500">:</span>
        <div className="relative w-20">
          <select
            value={minutes}
            onChange={(e) => onChange(`${hours}:${e.target.value}`)}
            className="w-full py-2 pl-3 pr-8 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {Array.from({ length: 60 }, (_, i) => 
              i.toString().padStart(2, '0')
            ).map(minute => (
              <option key={minute} value={minute}>{minute}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}