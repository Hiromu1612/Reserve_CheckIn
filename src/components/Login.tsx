import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const { login, signup, guestLogin, loading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSignup, setShowSignup] = useState(false);
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const validateForm = () => {
    if (password.length < 4) {
      setValidationError('パスワードは4文字以上で入力してください');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await login(email, password);
      navigate('/chairs');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await signup(email, password, name);
      navigate('/chairs');
    } catch (err) {
      console.error('Signup failed:', err);
    }
  };

  const handleGuestLogin = () => {
    guestLogin();
    navigate('/chairs');
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setValidationError('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          ようこそ
        </h2>

        {showSignup ? (
          <form onSubmit={handleSignup} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                お名前
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                パスワード（4文字以上）
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 pr-10"
                  required
                  minLength={4}
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
            {(error || validationError) && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">{validationError || error}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition duration-200"
            >
              {loading ? '処理中...' : '新規登録'}
            </button>
            <p className="text-center text-sm text-gray-600">
              すでにアカウントをお持ちの方は
              <button
                type="button"
                onClick={() => {
                  setShowSignup(false);
                  resetForm();
                }}
                className="text-indigo-600 hover:text-indigo-700 ml-1"
              >
                ログイン
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                パスワード
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 pr-10"
                  required
                  minLength={4}
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
            {(error || validationError) && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">{validationError || error}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition duration-200"
            >
              {loading ? '処理中...' : 'ログイン'}
            </button>
            <p className="text-center text-sm text-gray-600">
              アカウントをお持ちでない方は
              <button
                type="button"
                onClick={() => {
                  setShowSignup(true);
                  resetForm();
                }}
                className="text-indigo-600 hover:text-indigo-700 ml-1"
              >
                新規登録
              </button>
            </p>
          </form>
        )}

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">または</span>
          </div>
        </div>

        <button
          onClick={handleGuestLogin}
          className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-200"
        >
          <User className="w-5 h-5 text-gray-600" />
          <span className="text-gray-700 font-medium">
            ゲストとして利用
          </span>
        </button>
      </div>
    </div>
  );
}