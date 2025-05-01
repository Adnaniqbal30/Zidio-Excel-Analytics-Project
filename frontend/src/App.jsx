import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Dashboard from './pages/dashboard'; // Correct import without ".jsx"
import Home from './pages/Home';
import ProtectedRoute from './components/protectedroute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['admin', 'user']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
