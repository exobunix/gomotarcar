import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

const RoutesConfig = () => (
  <Routes>
    <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
  </Routes>
);

export default RoutesConfig;
