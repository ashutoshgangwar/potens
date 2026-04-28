// Approve/Reject Partner API
// POST /api/partners/approve
// { partnerId, partnerRole, approved, approvedBy, remarks }
import { apiClient } from './api';

export const apiApprovePartner = async ({ token, partnerId, partnerRole, approved, approvedBy, remarks }) => {
  if (!token) throw new Error('Not authorized.');
  try {
    const response = await apiClient.post('/auth/admin/partner-action', {
      partnerId,
      partnerRole,
      approved,
      approvedBy,
      remarks,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || 'Failed to approve/reject partner.');
  }
};
