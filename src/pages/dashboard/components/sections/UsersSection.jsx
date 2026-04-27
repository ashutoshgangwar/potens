import React, { useState } from 'react';

const mockUsers = [
  { id: 'U1', name: 'Aarti Sharma', email: 'aarti@company.com', role: 'logistics-manager', status: 'active' },
  { id: 'U2', name: 'Kunal Verma', email: 'kunal@company.com', role: 'ops-manager', status: 'active' },
  { id: 'U3', name: 'Meena Iyer', email: 'meena@company.com', role: 'account-executive', status: 'inactive' },
];

const UsersSection = () => {
  const [users, setUsers] = useState(mockUsers);

  const toggleActive = (id) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u)));
  };

  return (
    <div className="users-table" style={{ padding: '1.5rem' }}>
      <h3>Internal Users</h3>
      <p>Manage internal staff and role assignments.</p>
      <div style={{ marginTop: 12 }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.status}</td>
                <td>
                  <button className="btn btn-secondary" onClick={() => toggleActive(u.id)}>{u.status === 'active' ? 'Deactivate' : 'Activate'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersSection;
