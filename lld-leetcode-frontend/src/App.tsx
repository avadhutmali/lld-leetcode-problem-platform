import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SolvePage from './pages/SolvePage';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<HomePage />} />
        <Route
          path="/solve/:id"
          element={(
            <ProtectedRoute>
              <SolvePage />
            </ProtectedRoute>
          )}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;