import React from 'react';
import { Timer, User, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Header() {
  const { user, logout } = useAuthStore();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Timer className="w-8 h-8 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">マッサージチェア</h1>
        </div>

        {user && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="bg-indigo-100 p-2 rounded-full">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{user.name}</p>
                {user.isGuest && (
                  <p className="text-xs text-gray-500">ゲストユーザー</p>
                )}
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}