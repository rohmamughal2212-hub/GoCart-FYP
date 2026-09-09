import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";

const WelcomePopup = () => {
  const { setShowUserLogin } = useAppContext();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if popup has been shown in this session
    const hasShownPopup = sessionStorage.getItem("welcomePopupShown");
    if (!hasShownPopup) {
      setIsVisible(true);
      sessionStorage.setItem("welcomePopupShown", "true");
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleRegisterClick = () => {
    setIsVisible(false);
    setShowUserLogin(true);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 relative overflow-hidden pointer-events-auto">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition z-10"
          aria-label="Close"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Content */}
        <div className="p-8 text-center space-y-6">
          {/* Logo/Header */}
          <div className="pt-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <svg viewBox="0 0 38 32" className="w-10 h-10" fill="none">
                <path d="M2 2h5l3.5 17.5a2.5 2.5 0 002.5 2H29a2.5 2.5 0 002.45-2L34 9H10" stroke="#1B3A6B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="14" cy="28" r="2" fill="#1B3A6B"/>
                <circle cx="27" cy="28" r="2" fill="#1B3A6B"/>
              </svg>
              <span className="text-2xl font-bold">
                <span style={{ color: "#1B3A6B" }}>Go</span><span className="text-gray-900">Cart</span>
              </span>
            </div>
          </div>

          {/* Main Title */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to GoCart
            </h1>
            <p className="text-gray-600 text-sm">
              Your one-stop shop for quality products delivered quickly
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">🚚</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Quick Delivery</p>
                <p className="text-gray-500 text-xs">On all orders, every day</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">📦</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Genuine Products</p>
                <p className="text-gray-500 text-xs">Sourced from trusted sellers</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">🔒</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Secure Shopping</p>
                <p className="text-gray-500 text-xs">Your data stays safe</p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleRegisterClick}
            className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:shadow-lg"
            style={{ background: "#1B3A6B" }}
          >
            Register Now
          </button>

          {/* Close link */}
          <button
            onClick={handleClose}
            className="text-gray-500 text-sm hover:text-gray-700 transition"
          >
            Continue browsing
          </button>

          {/* Footer message */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-gray-600 text-sm italic">
              Thanks for visiting us!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup;
