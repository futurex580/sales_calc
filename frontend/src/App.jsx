import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Rules from './pages/Rules';
import Users from './pages/Users';
import ProgramAnalytics from './pages/ProgramAnalytics';
import AuditLogs from './pages/AuditLogs';
import { CurrencyProvider } from './CurrencyContext';

function App() {
  return (
    <CurrencyProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/users" element={<Users />} />
          <Route path="/analytics" element={<ProgramAnalytics />} />
          <Route path="/audit-logs" element={<AuditLogs />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </CurrencyProvider>
  );
}

export default App
