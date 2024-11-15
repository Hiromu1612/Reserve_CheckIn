import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ChairProvider } from './context/ChairContext';
import Header from './components/Header';
import Login from './components/Login';
import ChairSelection from './components/ChairSelection';
import { useAuthStore } from './store/authStore';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <ChairProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <Header />
          <main className="max-w-7xl mx-auto px-4 py-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/chairs"
                element={
                  <PrivateRoute>
                    <ChairSelection />
                  </PrivateRoute>
                }
              />
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ChairProvider>
  );
}

export default App;