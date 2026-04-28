import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { apiGetOnboardingProgress, apiGetProfileDetails } from '../../utils/api.js';
import DashboardSidebar from './components/DashboardSidebar.jsx';
import OverviewSection from './components/sections/OverviewSection.jsx';
import TransactionSection from './components/sections/TransactionSection.jsx';
import ProfileSection from './components/sections/ProfileSection.jsx';
import InvestmentSection from './components/sections/InvestmentSection.jsx';
import WalletSection from './components/sections/WalletSection.jsx';
import DocumentsSection from './components/sections/DocumentsSection.jsx';
import SupportSection from './components/sections/SupportSection.jsx';
import UsersSection from './components/sections/UsersSection.jsx';
import { SIDEBAR_CONFIG } from '../../constants/sidebarConfig.js';
import { getAllowedSidebarKeys } from '../../constants/roleAccess.js';


const createSidebarIcon = (src, alt) => (
	<img
		src={src}
		alt={alt}
		style={{ width: '1.1rem', height: '1.1rem', filter: 'brightness(0) invert(1)' }}
	/>
);

const REQUIRED_PROFILE_FIELDS = [
	'fullName',
	'fatherName',
	'dob',
	'gender',
	'state',
	'district',
	'fieldOfficerName',
	'pinCode',
	'oilSectorExperienceYears',
	'nearestFuelPumpDistance',
	'investmentPlan',
	'permanentAddressLine1',
	'permanentAddressLine2',
	'permanentCity',
	'permanentState',
	'permanentDistrict',
	'permanentPincode',
	'permanentLatitude',
	'permanentLongitude',
	'businessAddressLine1',
	'businessAddressLine2',
	'businessCity',
	'businessState',
	'businessDistrict',
	'businessPincode',
	'businessLatitude',
	'businessLongitude',
	'vehicleNumber',
	'paymentMode',
	'panNumber',
	'panFileUrl',
	'aadhaarNumber',
	'aadhaarFileUrl',
	'drivingLicenseNumber',
	'drivingLicenseFileUrl',
	'vehicleRcNumber',
	'vehicleRcFileUrl',
	'passportPhotoFileUrl',
	'nocFileUrl',
	'combinedDocumentsPdfUrl',
];

const REQUIRED_DOCUMENT_FIELDS = [
	'panFileUrl',
	'aadhaarFileUrl',
	'drivingLicenseFileUrl',
	'vehicleRcFileUrl',
	'passportPhotoFileUrl',
	'nocFileUrl',
	'combinedDocumentsPdfUrl',
];

const PAYMENT_LABELS = {
	upi: 'UPI',
	bank: 'Bank Transfer',
	both: 'UPI + Bank',
};

const DOCUMENT_LABELS = {
	panFileUrl: 'PAN Card',
	aadhaarFileUrl: 'Aadhaar Card',
	drivingLicenseFileUrl: 'Driving License',
	vehicleRcFileUrl: 'Vehicle RC',
	passportPhotoFileUrl: 'Passport Photo',
	nocFileUrl: 'NOC',
	combinedDocumentsPdfUrl: 'Combined Documents PDF',
};

const PARTNER_KPI_BASE = {
	totalOrders: 248,
	completedOrders: 227,
	todayOrders: 12,
	todayIncome: 3480,
	pendingOrders: 5,
	avgDeliveryTimeMinutes: 34,
};

const fallbackActivities = [
	{ user: 'Onboarding', action: 'Complete partner profile details', time: 'Pending', avatar: 'OB' },
	{ user: 'Address', action: 'Add logistics addresses and vehicle number', time: 'Pending', avatar: 'AD' },
	{ user: 'Documents', action: 'Upload PAN, Aadhaar and vehicle documents', time: 'Pending', avatar: 'DC' },
];

const isFilled = (value) => Boolean(String(value ?? '').trim());

const getPaymentHealth = (profileDetails) => {
	const mode = profileDetails?.paymentMode;
	if (mode === 'upi') return isFilled(profileDetails?.upiId);
	if (mode === 'bank') {
		return (
			isFilled(profileDetails?.bankAccountNumber) &&
			isFilled(profileDetails?.ifscCode) &&
			isFilled(profileDetails?.bankName) &&
			isFilled(profileDetails?.accountHolderName) &&
			isFilled(profileDetails?.bankBranch)
		);
	}
	if (mode === 'both') {
		return (
			isFilled(profileDetails?.upiId) &&
			isFilled(profileDetails?.bankAccountNumber) &&
			isFilled(profileDetails?.ifscCode) &&
			isFilled(profileDetails?.bankName) &&
			isFilled(profileDetails?.accountHolderName) &&
			isFilled(profileDetails?.bankBranch)
		);
	}
	return false;
};

const getProfileActivities = (profileDetails) => {
	if (!profileDetails) return fallbackActivities;

	return [
		{
			user: 'Profile',
			action: isFilled(profileDetails.fullName)
				? `Partner name set as ${profileDetails.fullName}`
				: 'Partner personal details pending',
			time: profileDetails.updatedAt ? 'Updated profile' : 'Pending',
			avatar: 'PF',
		},
		{
			user: 'Logistics',
			action: isFilled(profileDetails.vehicleNumber)
				? `Vehicle registered: ${profileDetails.vehicleNumber}`
				: 'Vehicle number not added yet',
			time: isFilled(profileDetails.vehicleNumber) ? 'Saved' : 'Pending',
			avatar: 'LG',
		},
		{
			user: 'Payment',
			action: profileDetails.paymentMode
				? `Payment mode selected: ${PAYMENT_LABELS[profileDetails.paymentMode] || profileDetails.paymentMode}`
				: 'Payment mode not selected',
			time: profileDetails.paymentMode ? 'Saved' : 'Pending',
			avatar: 'PM',
		},
		{
			user: 'Documents',
			action: `${REQUIRED_DOCUMENT_FIELDS.filter((key) => isFilled(profileDetails[key])).length}/${REQUIRED_DOCUMENT_FIELDS.length} required documents uploaded`,
			time: 'Track',
			avatar: 'DC',
		},
	];
};

const MOCK_TRANSACTIONS = [
	{ id: 1, date: '2026-04-01', amount: 1200, status: 'Completed', orderId: 'ORD-001' },
	{ id: 2, date: '2026-04-02', amount: 800, status: 'Pending', orderId: 'ORD-002' },
	{ id: 3, date: '2026-04-03', amount: 1500, status: 'Completed', orderId: 'ORD-003' },
	{ id: 4, date: '2026-04-04', amount: 700, status: 'Pending', orderId: 'ORD-004' },
];

const DashboardPage = () => {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const [profileDetails, setProfileDetails] = useState(null);
	const [onboardingProgress, setOnboardingProgress] = useState(null);
	const [loadingProfile, setLoadingProfile] = useState(true);
	const [activeSection, setActiveSection] = useState('dashboard');
	// Track if payment step is completed by user action
	const [paymentStepCompleted, setPaymentStepCompleted] = useState(false);

	useEffect(() => {
		let mounted = true;
		const fetchPartnerProfile = async () => {
			try {
				const [details, progress] = await Promise.all([
					apiGetProfileDetails(user?.id),
					apiGetOnboardingProgress().catch(() => null),
				]);

				if (mounted) {
					console.log('[DashboardPage] profileDetails:', details);
					setProfileDetails(details);
					setOnboardingProgress(progress);
				}
			} finally {
				if (mounted) setLoadingProfile(false);
			}
		};
		fetchPartnerProfile();
		return () => { mounted = false; };
	}, [user?.id]);

	const localProfileCompletion = useMemo(() => {
		if (!profileDetails) return 0;
		const completedCount = REQUIRED_PROFILE_FIELDS.filter((field) =>
			isFilled(profileDetails[field])
		).length;
		return Math.round((completedCount / REQUIRED_PROFILE_FIELDS.length) * 100);
	}, [profileDetails]);

	const profileCompletion = useMemo(() => {
		if (typeof onboardingProgress?.onboardingProgressPercentage === 'number') {
			return onboardingProgress.onboardingProgressPercentage;
		}

		return localProfileCompletion;
	}, [localProfileCompletion, onboardingProgress]);

	const uploadedDocuments = useMemo(
		() => REQUIRED_DOCUMENT_FIELDS.filter((field) => isFilled(profileDetails?.[field])).length,
		[profileDetails]
	);

	const paymentReady = useMemo(() => getPaymentHealth(profileDetails), [profileDetails]);

	const completionRate = useMemo(() => {
		if (!PARTNER_KPI_BASE.totalOrders) return 0;
		return Math.round((PARTNER_KPI_BASE.completedOrders / PARTNER_KPI_BASE.totalOrders) * 100);
	}, []);

	const partnerKpis = useMemo(() => ({
		...PARTNER_KPI_BASE,
		completionRate,
		todayIncomeLabel: `₹${PARTNER_KPI_BASE.todayIncome.toLocaleString('en-IN')}`,
	}), [completionRate]);

	const stats = useMemo(() => [
		{
			label: 'Total Orders',
			value: partnerKpis.totalOrders,
			change: `${partnerKpis.todayOrders} today`,
			up: true,
			icon: '🛢️',
		},
		{
			label: 'Completed Orders',
			value: partnerKpis.completedOrders,
			change: `${partnerKpis.completionRate}% completion`,
			up: partnerKpis.completionRate >= 80,
			icon: '✅',
		},
		{
			label: "Today's Income",
			value: partnerKpis.todayIncomeLabel,
			change: `${partnerKpis.todayOrders} deliveries billed`,
			up: true,
			icon: '💰',
		},
		{
			label: 'Pending Orders',
			value: partnerKpis.pendingOrders,
			change: `Avg ${partnerKpis.avgDeliveryTimeMinutes} min/delivery`,
			up: partnerKpis.pendingOrders <= 6,
			icon: '⏱️',
		},
	], [partnerKpis]);

	const profileStageBadges = useMemo(() => [
		{
			label: 'KYC Badge',
			value: uploadedDocuments === REQUIRED_DOCUMENT_FIELDS.length ? 'Ready' : 'Pending',
			tone: uploadedDocuments === REQUIRED_DOCUMENT_FIELDS.length ? 'success' : 'warning',
		},
		{
			label: 'Partner Verification',
			// Only mark as complete if profileCompletion is 100 and payment step is completed by user
			value: (onboardingProgress?.isProfileCompleted || (profileCompletion === 100 && paymentStepCompleted)) ? 'In Review' : 'Incomplete',
			tone: (onboardingProgress?.isProfileCompleted || (profileCompletion === 100 && paymentStepCompleted)) ? 'success' : 'warning',
		},
	], [onboardingProgress?.isProfileCompleted, paymentStepCompleted, profileCompletion, uploadedDocuments]);

	const recentActivity = useMemo(() => getProfileActivities(profileDetails), [profileDetails]);

	const profileSummary = [
		{ label: 'Full Name', value: profileDetails?.fullName || user?.name || 'Not provided' },
		{ label: 'Email', value: user?.email || 'Not provided' },
		{ label: 'Phone', value: user?.phone || 'Not provided' },
		{ label: 'Role', value: user?.role || 'Not provided' },
		{ label: 'Date of Birth', value: profileDetails?.dob || 'Not provided' },
		{ label: 'Field Officer', value: profileDetails?.fieldOfficerName || 'Not provided' },
		{ label: 'Vehicle Number', value: profileDetails?.vehicleNumber || 'Not provided' },
		{
			label: 'State / District',
			value: profileDetails?.state && profileDetails?.district
				? `${profileDetails.state} / ${profileDetails.district}`
				: 'Not provided',
		},
		{
			label: 'Fuel Experience',
			value: isFilled(profileDetails?.oilSectorExperienceYears)
				? `${profileDetails.oilSectorExperienceYears} years`
				: 'Not provided',
		},
	];

	const completionMilestones = useMemo(
		() => [
			{ label: 'Start', value: 0 },
			{ label: 'Halfway', value: 50 },
			{ label: 'Ready', value: 80 },
			{ label: 'Verified', value: 100 },
		],
		[]
	);

	const documentStatusRows = useMemo(
		() =>
			REQUIRED_DOCUMENT_FIELDS.map((field) => ({
				key: field,
				label: DOCUMENT_LABELS[field] || field,
				uploaded: isFilled(profileDetails?.[field]),
			})),
		[profileDetails]
	);

	const completedProfileFieldsCount = useMemo(
		() => REQUIRED_PROFILE_FIELDS.filter((field) => isFilled(profileDetails?.[field])).length,
		[profileDetails]
	);

	const paymentPreferenceLabel = PAYMENT_LABELS[profileDetails?.paymentMode] || 'Not selected';

	const handleLogout = async () => {
		await logout();
		navigate('/login', { replace: true });
	};

	const handleSidebarClick = (key) => {
		setActiveSection(key);
	};

		// Dynamically generate sidebar items based on user role
		const allowedSidebarKeys = getAllowedSidebarKeys(user?.role);
		const SIDEBAR_ITEMS = allowedSidebarKeys
			.map((key) => {
				const config = SIDEBAR_CONFIG[key];
				if (!config) return null;
				return {
					icon: createSidebarIcon(config.icon, config.label),
					label: config.label,
					key,
				};
			})
			.filter(Boolean);

	if (loadingProfile || profileDetails) {
		return <div style={{padding: '2rem', textAlign: 'center'}}>Loading profile...</div>;
	}

	const sectionsByKey = {
		dashboard: (
			<OverviewSection
				user={user}
				navigate={navigate}
				loadingProfile={loadingProfile}
				profileCompletion={profileCompletion}
				stats={stats}
				recentActivity={recentActivity}
				profileSummary={profileSummary}
			/>
		),
		profile: (
			   <ProfileSection
				   user={user}
				   profileCompletion={profileCompletion}
				   completedProfileFieldsCount={completedProfileFieldsCount}
				   totalProfileFields={REQUIRED_PROFILE_FIELDS.length}
				   uploadedDocuments={uploadedDocuments}
				   totalDocuments={REQUIRED_DOCUMENT_FIELDS.length}
				   paymentReady={paymentReady}
				   paymentPreferenceLabel={paymentPreferenceLabel}
				   navigate={navigate}
			   />
		),
		transaction: <TransactionSection transactions={MOCK_TRANSACTIONS} />, 
		investment: (
			<InvestmentSection
				profileDetails={profileDetails}
				userId={user?.id}
				partnerKpis={partnerKpis}
				onOpenProfile={() => navigate('/profile-completion')}
			/>
		),
		   wallet: (
			   <WalletSection
				   paymentReady={paymentReady}
				   paymentPreferenceLabel={paymentPreferenceLabel}
				   onOpenProfile={() => navigate('/profile-completion')}
				   paymentStepCompleted={paymentStepCompleted}
				   onPaymentStepComplete={() => setPaymentStepCompleted(true)}
			   />
		   ),
		   payments: (
			   <div style={{ padding: 32 }}>
				   <h2>Payments</h2>
				   <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 24 }}>
					   <thead>
						   <tr style={{ background: '#f5f7fa' }}>
							   <th style={{ padding: 12, border: '1px solid #e0e0e0' }}>UTR Number</th>
							   <th style={{ padding: 12, border: '1px solid #e0e0e0' }}>Bank</th>
							   <th style={{ padding: 12, border: '1px solid #e0e0e0' }}>Date</th>
							   <th style={{ padding: 12, border: '1px solid #e0e0e0' }}>Action</th>
						   </tr>
					   </thead>
					   <tbody>
						   {/* Example static data, replace with real data as needed */}
						   <tr>
							   <td style={{ padding: 12, border: '1px solid #e0e0e0' }}>UTR123456789</td>
							   <td style={{ padding: 12, border: '1px solid #e0e0e0' }}>HDFC Bank</td>
							   <td style={{ padding: 12, border: '1px solid #e0e0e0' }}>2026-04-27</td>
							   <td style={{ padding: 12, border: '1px solid #e0e0e0' }}>
								   <button style={{ marginRight: 8, background: '#4caf50', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer' }}>Approve</button>
								   <button style={{ background: '#f44336', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer' }}>Reject</button>
							   </td>
						   </tr>
						   <tr>
							   <td style={{ padding: 12, border: '1px solid #e0e0e0' }}>UTR987654321</td>
							   <td style={{ padding: 12, border: '1px solid #e0e0e0' }}>ICICI Bank</td>
							   <td style={{ padding: 12, border: '1px solid #e0e0e0' }}>2026-04-26</td>
							   <td style={{ padding: 12, border: '1px solid #e0e0e0' }}>
								   <button style={{ marginRight: 8, background: '#4caf50', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer' }}>Approve</button>
								   <button style={{ background: '#f44336', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer' }}>Reject</button>
							   </td>
						   </tr>
					   </tbody>
				   </table>
			   </div>
		   ),
		documents: (
			<DocumentsSection
				user={user}
				uploadedDocuments={uploadedDocuments}
				totalDocuments={REQUIRED_DOCUMENT_FIELDS.length}
				documentStatusRows={documentStatusRows}
				certificatePdfUrl={profileDetails?.certificatePdfUrl || profileDetails?.combinedDocumentsPdfUrl}
				onOpenProfile={() => navigate('/profile-completion')}
			/>
		),
		certificate: (
			<DocumentsSection
				user={user}
				uploadedDocuments={uploadedDocuments}
				totalDocuments={REQUIRED_DOCUMENT_FIELDS.length}
				documentStatusRows={documentStatusRows}
				certificatePdfUrl={profileDetails?.certificatePdfUrl || profileDetails?.combinedDocumentsPdfUrl}
				onOpenProfile={() => navigate('/profile-completion')}
			/>
		),
		support: <SupportSection />,
		users: <UsersSection />,
	};

	return (
		<div className="dashboard">
			<DashboardSidebar
				items={SIDEBAR_ITEMS}
				activeSection={activeSection}
				onSectionChange={handleSidebarClick}
				user={user}
				onLogout={handleLogout}
			/>

			<nav className="dashboard-mobile-nav" aria-label="Dashboard sections">
				<div className="dashboard-mobile-nav-scroll">
					{SIDEBAR_ITEMS.map(({ icon, label, key }) => (
						<button
							type="button"
							key={key}
							className={[
								'dashboard-mobile-nav-item',
								activeSection === key ? 'dashboard-mobile-nav-item--active' : '',
							]
								.filter(Boolean)
								.join(' ')}
							onClick={() => handleSidebarClick(key)}
						>
							<span>{icon}</span>
							<span>{label}</span>
						</button>
					))}
				</div>
			</nav>

			{/* Main content */}
			<main className="dashboard-main">{sectionsByKey[activeSection] || sectionsByKey.dashboard}</main>
		</div>
	);
};

export default DashboardPage;
