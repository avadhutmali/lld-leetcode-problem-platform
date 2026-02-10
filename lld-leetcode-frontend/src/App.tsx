import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SolvePage from './pages/SolvePage';

// You can create a simple HomePage later that lists problems
const HomePage = () => (
    <div className="p-10 text-white bg-black h-screen">
        <h1 className="text-3xl font-bold mb-6">Problems</h1>
        <div className="flex gap-4">
            <a href="/solve/1" className="block p-4 border border-gray-700 rounded hover:bg-gray-800">
                Solve Problem 1: Parking Lot
            </a>
            <a href="/solve/2" className="block p-4 border border-gray-700 rounded hover:bg-gray-800">
                Solve Problem 2: Notification System
            </a>
        </div>
    </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/solve/:id" element={<SolvePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;