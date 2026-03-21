import React from 'react';
import { Outlet } from 'react-router-dom';

// import { Footer } from '@/components/Footer';
// import { Header } from '@/components/Header';
// import { SideBar } from '@/components/SideBar';
import './wrapper.scss';

export const Wrapper: React.FC = () => (
  <div className="wrapper">
    {/* <SideBar /> */}
    <div className="wrapper__maincont">
      {/* <Header /> */}
      <Outlet />
      {/* <Footer /> */}
    </div>
  </div>
);
