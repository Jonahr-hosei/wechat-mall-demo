import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Users from './pages/Users';
import Points from './pages/Points';
import Parking from './pages/Parking';
import Statistics from './pages/Statistics';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

// 受保护的路由组件
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="products" element={<Products />} />
                <Route path="orders" element={<Orders />} />
                <Route path="users" element={<Users />} />
                <Route path="points" element={<Points />} />
                <Route path="parking" element={<Parking />} />
                <Route path="statistics" element={<Statistics />} />
              </Route>
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App; 