import React from 'react';

const Layout = ({ children }) => {
  return (
    <div>
      {/* Global Header */}
      <header className="flex items-center bg-blue-700 text-white p-4 shadow">
        <img
          src="/logo.png"   // place logo.png in public/ folder
          alt="Premier Cric Academy"
          style={{ height: '40px' }}
        />
        <h1 className="ml-3 text-xl font-bold">
          Premier Cricket Academy Player Portal
        </h1>
      </header>

      {/* Page Content */}
      <main className="p-6">{children}</main>
    </div>
  );
};

export default Layout;