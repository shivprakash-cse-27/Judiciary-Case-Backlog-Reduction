import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Cases from '../pages/Cases';
import AddCase from '../pages/AddCase';
import EditCase from '../pages/EditCase';
import Hearings from '../pages/Hearings';
import Profile from '../pages/Profile';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Layout Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="cases" element={<Cases />} />
        <Route path="cases/add" element={
          <ProtectedRoute roles={['Admin', 'CourtStaff', 'Lawyer']}>
            <AddCase />
          </ProtectedRoute>
        } />
        <Route path="cases/:id/edit" element={<EditCase />} />
        <Route path="hearings" element={
          <ProtectedRoute roles={['Admin', 'Judge', 'CourtStaff']}>
            <Hearings />
          </ProtectedRoute>
        } />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
