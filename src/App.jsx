import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import KaraokePage from './features/karaoke/KaraokePage.jsx';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/karaoke" replace />} />
      <Route path="/karaoke" element={<KaraokePage />} />
      <Route path="*" element={<Navigate to="/karaoke" replace />} />
    </Routes>
  );
};

export default App;
