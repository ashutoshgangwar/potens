import React, { useState, useEffect } from 'react';
import { apiCreateUser } from '../../../../utils/apiCreateUser.js';
import { fetchNonPartnerRoles } from '../../../../utils/apiNonPartnerRoles.js';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;




const initialForm = {
  email: '',
  password: '',
  phone: '',
  role: '',
  dob: '',
  assigned_city: '',
  full_name: '',
};


const UsersSection = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);


  console.log('UsersSection rendered with users:', users);
    // Fetch users from API on mount
    useEffect(() => {
      const fetchUsers = async () => {
        try {
          const token = localStorage.getItem('POTENS_admin_access_token');
          if (!token) return;
          const response = await axios.get(`${API_BASE_URL}/api/auth/admin/users`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          // Map/normalize users if needed
          setUsers(Array.isArray(response.data) ? response.data : (response.data?.users || []));
        } catch (err) {
          // Optionally handle error
          setUsers([]);
        }
      };
      fetchUsers();
    }, []);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch roles when modal opens
  useEffect(() => {
    if (modalOpen) {
      fetchNonPartnerRoles()
        .then((data) => setRoles(Array.isArray(data) ? data : (data.roles || [])))
        .catch(() => setRoles([]));
    }
  }, [modalOpen]);

  const toggleActive = (id) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u)));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('POTENS_admin_access_token');
      await apiCreateUser({ ...form, token });
      setSuccess('User created successfully!');
      setForm(initialForm);
      setModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="users-section-ui" style={{ maxWidth: 1300, margin: '0 auto', padding: '3rem 2rem' }}>
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Users Table Card */}
        <div style={{ flex: '2 1 900px', background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px #0001', padding: 40, minWidth: 600 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1a237e' }}>Internal Users</h2>
            <button
              className="btn btn-primary"
              style={{ padding: '8px 18px', borderRadius: 8, background: '#3949ab', color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', boxShadow: '0 1px 4px #0002' }}
              onClick={() => { setModalOpen(true); setError(''); setSuccess(''); }}
            >
              + Create User
            </button>
          </div>
          <p style={{ color: '#607d8b', marginBottom: 18, fontSize: 15 }}>Manage internal staff and role assignments.</p>
          <div style={{ overflowX: 'auto', padding: '0 8px' }}>
            <style>{`
              .modern-table {
                width: 100%;
                border-collapse: separate;
                border-spacing: 0;
                font-size: 15px;
                background: #fff;
                border-radius: 16px;
                box-shadow: 0 2px 16px #0001;
                overflow: hidden;
              }
              .modern-table thead tr {
                background: linear-gradient(90deg, #e3eafc 60%, #f5f7fa 100%);
                position: sticky;
                top: 0;
                z-index: 2;
              }
              .modern-table th, .modern-table td {
                padding: 14px 18px;
                text-align: left;
                border-bottom: 1px solid #e3eafc;
                transition: background 0.2s;
                max-width: 220px;
                word-break: break-word;
              }
              .modern-table th {
                font-weight: 700;
                color: #283593;
                background: #e3eafc;
                position: sticky;
                top: 0;
                z-index: 1;
              }
              .modern-table tbody tr {
                transition: background 0.2s;
              }
              .modern-table tbody tr:nth-child(even) {
                background: #f7fafd;
              }
              .modern-table tbody tr:hover {
                background: #e8eaf6;
                box-shadow: 0 2px 8px #0002;
              }
              .modern-table td:last-child, .modern-table th:last-child {
                border-radius: 0 0 16px 0;
              }
              .modern-table td:first-child, .modern-table th:first-child {
                border-radius: 0 0 0 16px;
              }
            `}</style>
            <table className="modern-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 140 }}>Name</th>
                  <th style={{ minWidth: 200 }}>Email</th>
                  <th style={{ minWidth: 120 }}>Role</th>
                  <th style={{ minWidth: 120 }}>City</th>
                  <th style={{ minWidth: 140 }}>Phone</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => {
                  const roleObj = Array.isArray(u.roles) && u.roles.length > 0 ? u.roles[0] : null;
                  const roleName = roleObj ? (roleObj.role || roleObj.name || '') : (u.role || '');
                  const status = u.status || (u.is_active === false ? 'inactive' : 'active');
                  return (
                    <tr key={u._id || u.id || idx} data-status={status}>
                      <td>{u.full_name || u.name || ''}</td>
                      <td>{u.email}</td>
                      <td>{roleName}</td>
                      <td>{u.assigned_city}</td>
                      <td>{u.phone}</td>
                      <td>
                        {/* Actions can be implemented here if needed */}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Create User */}
        {modalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1000 }}>
            <style>{`
              .modal-backdrop {
                position: fixed;
                top: 0; left: 0; width: 100vw; height: 100vh;
                background: rgba(30,40,60,0.18);
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeInBg 0.3s;
              }
              .modal-center-box {
                background: #fff;
                border-radius: 20px;
                box-shadow: 0 8px 40px #0003;
                padding: 36px 32px 28px 32px;
                min-width: 340px;
                max-width: 400px;
                width: 100%;
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: stretch;
                animation: fadeInModal 0.35s cubic-bezier(.4,1.4,.6,1) both;
              }
              @keyframes fadeInBg {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              @keyframes fadeInModal {
                from { opacity: 0; transform: translateY(40px) scale(0.98); }
                to { opacity: 1; transform: translateY(0) scale(1); }
              }
            `}</style>
            <div className="modal-backdrop">
              <div className="modal-center-box">
                <button
                  onClick={() => { setModalOpen(false); setError(''); setSuccess(''); }}
                  style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 22, color: '#607d8b', cursor: 'pointer' }}
                  aria-label="Close"
                >
                  ×
                </button>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1a237e' }}>Create New User</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
                  <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="Full Name" required className="input-ui" style={{ padding: 10, borderRadius: 8, border: '1px solid #cfd8dc', fontSize: 15 }} />
                  <input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" required className="input-ui" style={{ padding: 10, borderRadius: 8, border: '1px solid #cfd8dc', fontSize: 15 }} />
                  <input name="password" value={form.password} onChange={handleChange} placeholder="Password" type="password" required className="input-ui" style={{ padding: 10, borderRadius: 8, border: '1px solid #cfd8dc', fontSize: 15 }} />
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" required className="input-ui" style={{ padding: 10, borderRadius: 8, border: '1px solid #cfd8dc', fontSize: 15 }} />
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    required
                    className="input-ui"
                    style={{ padding: 10, borderRadius: 8, border: '1px solid #cfd8dc', fontSize: 15 }}
                  >
                    <option value="" disabled>Select Role</option>
                    {roles.map((role) => (
                      <option key={role.id || role._id || role.name} value={role.name || role.role}>
                        {role.name || role.role}
                      </option>
                    ))}
                  </select>
                  <input name="dob" value={form.dob} onChange={handleChange} placeholder="Date of Birth (YYYY-MM-DD)" required className="input-ui" style={{ padding: 10, borderRadius: 8, border: '1px solid #cfd8dc', fontSize: 15 }} />
                  <input name="assigned_city" value={form.assigned_city} onChange={handleChange} placeholder="Assigned City" required className="input-ui" style={{ padding: 10, borderRadius: 8, border: '1px solid #cfd8dc', fontSize: 15 }} />
                  <button type="submit" className="btn btn-primary" style={{ marginTop: 8, padding: '10px 0', borderRadius: 8, background: '#3949ab', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', boxShadow: '0 1px 4px #0002' }} disabled={loading}>{loading ? 'Creating...' : 'Create User'}</button>
                  {error && <div style={{ color: '#d32f2f', marginTop: 4, fontWeight: 500 }}>{error}</div>}
                  {success && <div style={{ color: '#388e3c', marginTop: 4, fontWeight: 500 }}>{success}</div>}
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersSection;
