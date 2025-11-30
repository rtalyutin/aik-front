import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout/Layout.jsx';
import Aik2Page from './features/aik2/Aik2Page.jsx';
import KaraokePage from './features/karaoke/KaraokePage.jsx';

const App = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/karaoke" replace />} />
        <Route path="/karaoke" element={<KaraokePage />} />
        <Route path="/aik2" element={<Aik2Page />} />
        <Route path="*" element={<Navigate to="/karaoke" replace />} />
      </Route>
    </Routes>
  );
};

export default App;
