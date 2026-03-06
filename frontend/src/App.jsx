import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Chatbot from './components/Chatbot';

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'premium-card !p-4 !rounded-2xl !bg-white/90 !backdrop-blur-md !border-none !shadow-2xl',
          duration: 4000,
          style: {
            fontFamily: 'Inter, sans-serif',
          },
        }}
      />
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Login />} />
        </Routes>
        <Chatbot />
      </Router>
    </>
  );
}

export default App;
