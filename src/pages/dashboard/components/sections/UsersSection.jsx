import React, { useState, useEffect } from 'react';
import { apiCreateUser } from '../../../../utils/apiCreateUser.js';
import { fetchNonPartnerRoles } from '../../../../utils/apiNonPartnerRoles.js';
import axios from 'axios';
import './UsersSection.css';

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
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setFetchLoading(true);
      try {
        const token = localStorage.getItem('POTENS_admin_access_token');
        if (!token) return;
        const response = await axios.get(`${API_BASE_URL}/api/auth/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(
          Array.isArray(response.data)
            ? response.data
            : response.data?.users || []
        );
      } catch {
        setUsers([]);
      } finally {
        setFetchLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (modalOpen) {
      fetchNonPartnerRoles()
        .then((data) => setRoles(Array.isArray(data) ? data : data.roles || []))
        .catch(() => setRoles([]));
    }
  }, [modalOpen]);

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

  const openModal = () => {
    setModalOpen(true);
    setError('');
    setSuccess('');
  };

  const closeModal = () => {
    setModalOpen(false);
    setError('');
    setSuccess('');
  };

  const getRoleName = (u) => {
    const roleObj = Array.isArray(u.roles) && u.roles.length > 0 ? u.roles[0] : null;
    return roleObj ? roleObj.role || roleObj.name || '' : u.role || '';
  };

  const getInitials = (name = '') =>
    name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('');

  return (
    <div className="users-section">
      {/* ── Header ── */}
      <div className="users-section__header">
        <div>
          <h2 className="users-section__title">Internal Users</h2>
          <p className="users-section__subtitle">Manage internal staff and role assignments.</p>
        </div>
        <button className="users-create-btn" onClick={openModal}>
          + Create User
        </button>
      </div>

      {/* ── Desktop table ── */}
      {fetchLoading ? (
        <div className="users-loading">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="users-empty">No users found.</div>
      ) : (
        <>
          <div className="users-table-wrap">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>City</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => (
                  <tr key={u._id || u.id || idx}>
                    <td>{u.full_name || u.name || '—'}</td>
                    <td>{u.email || '—'}</td>
                    <td>
                      {getRoleName(u) ? (
                        <span className="role-badge">{getRoleName(u)}</span>
                      ) : '—'}
                    </td>
                    <td>{u.assigned_city || '—'}</td>
                    <td>{u.phone || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile card list ── */}
          <div className="users-card-list">
            {users.map((u, idx) => (
              <div key={u._id || u.id || idx} className="user-card">
                <div className="user-card__header">
                  <div className="user-card__avatar">
                    {getInitials(u.full_name || u.name) || '?'}
                  </div>
                  <div className="user-card__info">
                    <p className="user-card__name">{u.full_name || u.name || '—'}</p>
                    <p className="user-card__email">{u.email || '—'}</p>
                  </div>
                  {getRoleName(u) && (
                    <span className="role-badge">{getRoleName(u)}</span>
                  )}
                </div>
                <div className="user-card__meta">
                  <div className="user-card__meta-row">
                    <span className="user-card__meta-label">Phone</span>
                    <span className="user-card__meta-value">{u.phone || '—'}</span>
                  </div>
                  <div className="user-card__meta-row">
                    <span className="user-card__meta-label">City</span>
                    <span className="user-card__meta-value">{u.assigned_city || '—'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Create User Modal ── */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-box__header">
              <h2 className="modal-box__title">Create new user</h2>
              <button className="modal-box__close" onClick={closeModal} aria-label="Close">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="create-user-form">
              <div className="form-field">
                <label className="form-label">Full name *</label>
                <input
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="Ravi Kumar"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-field">
                <label className="form-label">Email *</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="ravi@example.com"
                  type="email"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-field">
                <label className="form-label">Password *</label>
                <input
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  type="password"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-field">
                <label className="form-label">Phone *</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-field">
                <label className="form-label">Role *</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  required
                  className="form-input"
                >
                  <option value="" disabled>Select role</option>
                  {roles.map((role) => (
                    <option
                      key={role.id || role._id || role.name}
                      value={role.name || role.role}
                    >
                      {role.name || role.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">Date of birth *</label>
                <input
                  name="dob"
                  value={form.dob}
                  onChange={handleChange}
                  type="date"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-field">
                <label className="form-label">Assigned city *</label>
                <input
                  name="assigned_city"
                  value={form.assigned_city}
                  onChange={handleChange}
                  placeholder="Lucknow"
                  required
                  className="form-input"
                />
              </div>

              {error && <p className="form-error">{error}</p>}
              {success && <p className="form-success">{success}</p>}

              <button
                type="submit"
                className="form-submit-btn"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create user'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersSection;