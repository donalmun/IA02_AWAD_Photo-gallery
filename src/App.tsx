import { Routes, Route, Navigate } from 'react-router-dom';
import PhotoList from './components/PhotoList';
import PhotoDetail from './components/PhotoDetail';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Navigate to="/photos" replace />} />
        <Route path="/photos" element={<PhotoList />} />
        <Route path="/photo/:id" element={<PhotoDetail />} />
      </Routes>
    </div>
  );
}

export default App;
