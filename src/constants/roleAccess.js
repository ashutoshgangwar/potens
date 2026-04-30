import { SIDEBAR_KEYS } from "./sidebarKeys.js";

export const roleAccess = {
  super_admin: {
    sidebar: [
      SIDEBAR_KEYS.OVERVIEW,
      SIDEBAR_KEYS.TRANSACTION,
      SIDEBAR_KEYS.AGREEMENT,
      SIDEBAR_KEYS.CERTIFICATE,
      SIDEBAR_KEYS.PAYMENTS,
      SIDEBAR_KEYS.APPROVALS,
      SIDEBAR_KEYS.USERS,
      // SIDEBAR_KEYS.REPORTS,
      // SIDEBAR_KEYS.ADMIN,
    ],
  },

  admin: {
    sidebar: [
      SIDEBAR_KEYS.OVERVIEW,
      SIDEBAR_KEYS.TRANSACTION,
      SIDEBAR_KEYS.AGREEMENT,
      SIDEBAR_KEYS.CERTIFICATE,
      SIDEBAR_KEYS.PAYMENTS,
      SIDEBAR_KEYS.APPROVALS,
      SIDEBAR_KEYS.USERS,
      // SIDEBAR_KEYS.REPORTS,
      // SIDEBAR_KEYS.ADMIN,
    ],
  },

  ops_manager: {
    sidebar: [
      SIDEBAR_KEYS.OVERVIEW,
      SIDEBAR_KEYS.TRANSACTION,
      // SIDEBAR_KEYS.WALLET,
      SIDEBAR_KEYS.AGREEMENT,
      SIDEBAR_KEYS.CERTIFICATE,
      SIDEBAR_KEYS.PAYMENTS,
      SIDEBAR_KEYS.APPROVALS,
      SIDEBAR_KEYS.USERS,
      // SIDEBAR_KEYS.REPORTS,
      // SIDEBAR_KEYS.ADMIN,
    ],
  },

  field_officer: {
      sidebar: [
      SIDEBAR_KEYS.OVERVIEW,
      SIDEBAR_KEYS.TRANSACTION,
      SIDEBAR_KEYS.AGREEMENT,
      SIDEBAR_KEYS.CERTIFICATE,
      SIDEBAR_KEYS.PAYMENTS,
      // SIDEBAR_KEYS.REPORTS,
    ],
  },

  accountant: {
   sidebar: [
      SIDEBAR_KEYS.OVERVIEW,
      SIDEBAR_KEYS.APPROVALS,
      SIDEBAR_KEYS.PAYMENTS,
      // SIDEBAR_KEYS.REPORTS,
    ],
  },

  account_executive: {
     sidebar: [
      SIDEBAR_KEYS.OVERVIEW,
      SIDEBAR_KEYS.APPROVALS,
      SIDEBAR_KEYS.PAYMENTS,
      // SIDEBAR_KEYS.REPORTS,
    ],
  },

  // Roles for small/field devices and drivers
  mini_pump: {
    sidebar: [
      SIDEBAR_KEYS.OVERVIEW,
      SIDEBAR_KEYS.TRANSACTION,
      // SIDEBAR_KEYS.WALLET,
      SIDEBAR_KEYS.AGREEMENT,
      SIDEBAR_KEYS.CERTIFICATE,
      SIDEBAR_KEYS.SUPPORT,
      SIDEBAR_KEYS.PROFILE,
      SIDEBAR_KEYS.PAYMENTS,
    ],
  },

  fdp_driver: {
     sidebar: [
      SIDEBAR_KEYS.OVERVIEW,
      SIDEBAR_KEYS.TRANSACTION,
      // SIDEBAR_KEYS.WALLET,
      SIDEBAR_KEYS.AGREEMENT,
      SIDEBAR_KEYS.CERTIFICATE,
      SIDEBAR_KEYS.SUPPORT,
      SIDEBAR_KEYS.PROFILE,
      SIDEBAR_KEYS.PAYMENTS, 
    ],
  },

  bowser: {
     sidebar: [
      SIDEBAR_KEYS.OVERVIEW,
      SIDEBAR_KEYS.TRANSACTION,
      // SIDEBAR_KEYS.WALLET,
      SIDEBAR_KEYS.AGREEMENT,
      SIDEBAR_KEYS.CERTIFICATE,
      SIDEBAR_KEYS.SUPPORT,
      SIDEBAR_KEYS.PROFILE,
      SIDEBAR_KEYS.PAYMENTS,
    ],
  },
};

const normalizeRole = (role) =>
  String(role || "")
    .toLowerCase()
    .replace(/-/g, "_")
    .trim();

export const hasAccess = (role, key) => {
  const normalized = normalizeRole(role);
  return (roleAccess[normalized]?.sidebar || []).includes(key);
};

export const getAllowedSidebarKeys = (role) => {
  const normalized = normalizeRole(role);
  return roleAccess[normalized]?.sidebar || [];
};

export default roleAccess;
