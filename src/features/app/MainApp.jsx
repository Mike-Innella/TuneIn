import { useState, useEffect } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { Header } from "../../components/ui/Header";
import { Footer } from "../../components/ui/Footer";
import { Toast } from "../../components/Toast";
import Account from "../../pages/Account";
import HomePage from "../../components/HomePage";

export default function MainApp() {
  const nav = useNavigate();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showHotkeys, setShowHotkeys] = useState(false);

  // Listen for custom navigation events
  useEffect(() => {
    function toAccount() { nav('/account'); }
    window.addEventListener('navigate:account', toAccount);
    return () => window.removeEventListener('navigate:account', toAccount);
  }, [nav]);


  const handleShowToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleToggleTheme = () => {
    const themeButton = document.querySelector('[aria-label*="Switch to"]');
    if (themeButton) {
      themeButton.click();
      handleShowToast('Theme toggled');
    }
  };

  const handleShowHelp = () => {
    setShowHotkeys(true);
  };

  return (
    <div className="min-h-screen bg-app text-app-text">
      <Header showHotkeys={showHotkeys} onCloseHotkeys={() => setShowHotkeys(false)} />

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              showToast={handleShowToast}
              onToggleTheme={handleToggleTheme}
              onShowHelp={handleShowHelp}
            />
          }
        />
        <Route path="/account" element={<Account />} />
      </Routes>

      <Toast show={showToast} text={toastMessage} />
      <Footer />
    </div>
  );
}