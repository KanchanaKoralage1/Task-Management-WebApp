import React from 'react';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user')) || {};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Welcome, {user.name || 'User'}!</h2>
        <p>Role: {user.role || 'N/A'}</p>
      </div>
    </div>
  );
};

export default Dashboard;