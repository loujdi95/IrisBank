import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Comptes from './pages/Comptes';
import Virements from './pages/Virements';
import Cartes from './pages/Cartes';
import Simulations from './pages/Simulations';
import Admin from './pages/Admin';
import Chatbot from './components/Chatbot';
import DashboardLayout from './components/DashboardLayout';

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

          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/comptes" element={<Comptes />} />
            <Route path="/virements" element={<Virements />} />
            <Route path="/cartes" element={<Cartes />} />
            <Route path="/simulations" element={<Simulations />} />
            <Route path="/admin" element={<Admin />} />
          </Route>

          <Route path="*" element={<Login />} />
        </Routes>
        <Chatbot />
      </Router>
    </>
  );
}

export default App;
