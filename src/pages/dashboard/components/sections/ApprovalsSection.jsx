
import React, { useEffect, useState } from 'react';
import { apiGetPartners } from '../../../../utils/api';
import { useAuth } from '../../../../context/AuthContext';
import './ApprovalsSection.css';


const ApprovalsSection = () => {
  const { token } = useAuth();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);

  useEffect(() => {
    const fetchPartners = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiGetPartners(token);
        console.log('[ApprovalsSection] fetched partners:', data);
        setPartners(data);
      } catch (err) {
        setError(err.message || 'Failed to load partners');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchPartners();
  }, [token]);

  const handleApprove = (id) => {
    // TODO: Implement approve API call
    setPartners((prev) => prev.map((p) => (p._id === id ? { ...p, status: 'approved' } : p)));
  };
  const handleReject = (id) => {
    // TODO: Implement reject API call
    setPartners((prev) => prev.map((p) => (p._id === id ? { ...p, status: 'rejected' } : p)));
  };
  const handleView = (partner) => setSelectedPartner(partner);
  const handleCloseModal = () => setSelectedPartner(null);

  return (
    <div className="approvals-list-wrap">
      <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 4, color: '#1a237e' }}>Onboarding Approvals</h3>
      <p style={{ color: '#475569', marginBottom: 18 }}>Pending onboarding requests for review.</p>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <table className="approvals-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>City</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((p) => (
              <tr key={p._id}>
                <td>{p.full_name}</td>
                <td>{p.email}</td>
                <td>{p.phone}</td>
                <td>{p.status}</td>
                <td>{p.assigned_city || '-'}</td>
                <td>
                  <button className="approvals-action-btn view" onClick={() => handleView(p)}>View</button>
                  <button className="approvals-action-btn approve" onClick={() => handleApprove(p._id)}>Approve</button>
                  <button className="approvals-action-btn reject" onClick={() => handleReject(p._id)}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal for partner details */}
      {selectedPartner && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginBottom: 18, fontWeight: 700, fontSize: 20 }}>Partner Overview</h3>
            <table style={{ width: '100%', marginBottom: 20, fontSize: 15, background: '#f8fafc', borderRadius: 8, overflow: 'hidden' }}>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600, width: 160, padding: 6 }}>Father Name</td>
                  <td style={{ padding: 6 }}>{selectedPartner.professional?.father_name || '-'}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, padding: 6 }}>Date of Birth</td>
                  <td style={{ padding: 6 }}>{selectedPartner.professional?.dob ? new Date(selectedPartner.professional.dob).toLocaleDateString() : '-'}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, padding: 6 }}>Business Address</td>
                  <td style={{ padding: 6 }}>
                    {selectedPartner.address?.business_address ? (
                      typeof selectedPartner.address.business_address === 'object'
                        ? Object.values(selectedPartner.address.business_address).filter(Boolean).join(', ')
                        : selectedPartner.address.business_address
                    ) : '-'}
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, padding: 6 }}>Permanent Address</td>
                  <td style={{ padding: 6 }}>
                    {selectedPartner.address?.permanent_address ? (
                      typeof selectedPartner.address.permanent_address === 'object'
                        ? Object.values(selectedPartner.address.permanent_address).filter(Boolean).join(', ')
                        : selectedPartner.address.permanent_address
                    ) : '-'}
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, padding: 6 }}>Role Type</td>
                  <td style={{ padding: 6 }}>{selectedPartner.professional?.register_as || '-'}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, padding: 6 }}>Bowser Capacity</td>
                  <td style={{ padding: 6 }}>{selectedPartner.vehicle?.bowser_capacity_id || '-'}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, padding: 6 }}>Land Area (Acres)</td>
                  <td style={{ padding: 6 }}>{selectedPartner.professional?.land_area_acres || '-'}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, padding: 6 }}>PAN Number</td>
                  <td style={{ padding: 6 }}>{selectedPartner.documents?._doc?.pan_card?.number || '-'}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, padding: 6 }}>Aadhaar Number</td>
                  <td style={{ padding: 6 }}>{selectedPartner.documents?._doc?.aadhaar_card?.number || '-'}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, padding: 6 }}>Aadhaar Verified</td>
                  <td style={{ padding: 6 }}>
                    {selectedPartner.documents?._doc?.aadhaar_card?.file_url
                      ? <span style={{ color: 'green', fontWeight: 700 }}>&#10003; Verified</span>
                      : <span style={{ color: 'red', fontWeight: 700 }}>&#10007; Not Verified</span>}
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, padding: 6 }}>PAN Verified</td>
                  <td style={{ padding: 6 }}>
                    {selectedPartner.documents?._doc?.pan_card?.file_url
                      ? <span style={{ color: 'green', fontWeight: 700 }}>&#10003; Verified</span>
                      : <span style={{ color: 'red', fontWeight: 700 }}>&#10007; Not Verified</span>}
                  </td>
                </tr>
              </tbody>
            </table>
            <button onClick={handleCloseModal} className="approvals-action-btn view" style={{ marginTop: 16, padding: '8px 20px', fontSize: 15 }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalsSection;
