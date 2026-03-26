import { useState, useEffect } from 'react';
import { Lock, Settings } from 'lucide-react';

const DEFAULT_PIN = '1234';
const PIN_KEY = 'cricket_organizer_pin';
const AUTH_KEY = 'cricket_auth_session';

export function PinProtection({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showChangePin, setShowChangePin] = useState(false);
  const [newPin, setNewPin] = useState('');

  useEffect(() => {
    // Check if already authenticated in this session
    const authSession = sessionStorage.getItem(AUTH_KEY);
    if (authSession === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const getStoredPin = () => {
    return localStorage.getItem(PIN_KEY) || DEFAULT_PIN;
  };

  const handleLogin = () => {
    const storedPin = getStoredPin();
    
    if (pin === storedPin) {
      setIsAuthenticated(true);
      sessionStorage.setItem(AUTH_KEY, 'true');
      setError('');
      setPin('');
    } else {
      setError('Invalid PIN. Please try again.');
      setPin('');
    }
  };

  const handleChangePin = () => {
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      alert('PIN must be exactly 4 digits');
      return;
    }
    
    localStorage.setItem(PIN_KEY, newPin);
    setShowChangePin(false);
    setNewPin('');
    alert('PIN changed successfully!');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(AUTH_KEY);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 via-green-800 to-gray-900 flex items-center justify-center px-4">
        <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full border border-gray-700 shadow-2xl">
          <div className="flex items-center justify-center mb-6">
            <Lock className="w-16 h-16 text-green-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Organizer Access
          </h1>
          <p className="text-gray-400 text-center mb-6 text-sm">
            Enter PIN to manage teams and matches
          </p>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Enter PIN
            </label>
            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="4-digit PIN"
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white text-center text-2xl tracking-widest placeholder-gray-500 focus:outline-none focus:border-green-500"
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-900 text-red-200 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold mb-4"
          >
            Unlock App
          </button>

          <div className="text-center text-sm text-gray-500">
            Default PIN: 1234
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Logout Button */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => setShowChangePin(!showChangePin)}
          className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg border border-gray-700 shadow-lg"
          title="Change PIN"
        >
          <Settings className="w-5 h-5" />
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-700 hover:bg-red-800 text-white px-4 py-3 rounded-lg font-semibold border border-red-600 shadow-lg flex items-center gap-2"
        >
          <Lock className="w-4 h-4" />
          Lock
        </button>
      </div>

      {/* Change PIN Modal */}
      {showChangePin && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Change PIN</h2>
            <input
              type="password"
              maxLength={4}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              placeholder="New 4-digit PIN"
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white text-center text-xl tracking-widest placeholder-gray-500 focus:outline-none focus:border-green-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowChangePin(false);
                  setNewPin('');
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePin}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
              >
                Change
              </button>
            </div>
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
