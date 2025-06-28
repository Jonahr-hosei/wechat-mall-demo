import React, { useState } from 'react';
import { Layout as AntLayout, Menu, Dropdown, Avatar, Space } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  TeamOutlined,
  GiftOutlined,
  CarOutlined,
  BarChartOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

const { Header, Sider, Content } = AntLayout;

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: React.createElement(DashboardOutlined),
      label: '仪表盘',
    },
    {
      key: '/products',
      icon: React.createElement(ShoppingOutlined),
      label: '商品管理',
    },
    {
      key: '/orders',
      icon: React.createElement(ShoppingCartOutlined),
      label: '订单管理',
    },
    {
      key: '/users',
      icon: React.createElement(UserOutlined),
      label: '小程序用户',
    },
    {
      key: '/admin-users',
      icon: React.createElement(TeamOutlined),
      label: '后台用户',
    },
    {
      key: '/points',
      icon: React.createElement(GiftOutlined),
      label: '积分管理',
    },
    {
      key: '/parking',
      icon: React.createElement(CarOutlined),
      label: '停车管理',
    },
    {
      key: '/statistics',
      icon: React.createElement(BarChartOutlined),
      label: '数据统计',
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: React.createElement(UserOutlined),
      label: '个人资料',
    },
    {
      key: 'settings',
      icon: React.createElement(SettingOutlined),
      label: '系统设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: React.createElement(LogoutOutlined),
      label: '退出登录',
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleUserMenuClick = ({ key }) => {
    if (key === 'logout') {
      logout();
      navigate('/login');
    }
  };

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo">
          {!collapsed && <span>商场管理系统</span>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <AntLayout>
        <Header style={{ padding: 0, background: '#fff' }}>
          <div className="header-content">
            <div className="header-left">
              {React.createElement(
                collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
                {
                  className: 'trigger',
                  onClick: () => setCollapsed(!collapsed),
                }
              )}
            </div>
            <div className="header-right">
              <Dropdown
                menu={{
                  items: userMenuItems,
                  onClick: handleUserMenuClick,
                }}
                placement="bottomRight"
              >
                <Space className="user-info">
                  <Avatar icon={React.createElement(UserOutlined)} />
                  <span>{user?.name || '管理员'}</span>
                </Space>
              </Dropdown>
            </div>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: '#fff',
          }}
        >
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout; 