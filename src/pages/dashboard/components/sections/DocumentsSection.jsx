import React, { useEffect, useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
// Set up PDF.js worker for Vite and pdfjs-dist v5+
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
import { Button, Card } from '../../../../components/ui/index.js';
import { apiGetCertificatePdfDetails, apiGetAgreementPdfDetails, apiGenerateAgreementPdf, apiGenerateCertificatePdf } from '../../../../utils/api.js';

const DocumentsSection = ({ user }) => {
  const [certificateDetails, setCertificateDetails] = useState({});
  const [certificateImageUrl, setCertificateImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const sectionRef = useRef(null);
  const [hasFetched, setHasFetched] = useState(false);

  // Fetch PDFs when section is focused/visible
  useEffect(() => {
    const handleFocus = () => {
      if (!hasFetched && user?.id) {
        fetchPdfs();
      }
    };
    const node = sectionRef.current;
    if (node) {
      node.addEventListener('focus', handleFocus);
      node.addEventListener('mouseenter', handleFocus);
    }
    return () => {
      if (node) {
        node.removeEventListener('focus', handleFocus);
        node.removeEventListener('mouseenter', handleFocus);
      }
    };
    // eslint-disable-next-line
  }, [user, hasFetched]);

  // Convert PDF to image using pdfjs
  const renderPdfToImage = async (pdfUrl) => {
    try {
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: context, viewport }).promise;
      return canvas.toDataURL('image/png');
    } catch (err) {
      console.error('PDF to image conversion failed:', err);
      return null;
    }
  };

  const fetchPdfs = async () => {
    setLoading(true);
    try {
      if (user?.id) {
        // Debug logs
        const token = localStorage.getItem('POTENS_admin_access_token') || '';
        console.log('DocumentsSection: user.id', user.id);
        console.log('DocumentsSection: token', token);
        const certRes = await apiGetCertificatePdfDetails({
          userId: user.id,
          token,
        });
        console.log('DocumentsSection: certRes', certRes);
        setCertificateDetails(certRes || {});
        // If PDF URL exists, try to render as image
        if (certRes && certRes.certificateUrl) {
          const imgUrl = await renderPdfToImage(certRes.certificateUrl);
          setCertificateImageUrl(imgUrl);
        } else {
          setCertificateImageUrl(null);
        }
        setHasFetched(true);
      }
    } catch (err) {
      console.error('DocumentsSection: fetchPdfs error', err);
      setCertificateDetails({});
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAgreement = async () => {
    if (!user?.id) return;
    setGenerating(true);
    try {
      await apiGenerateAgreementPdf(user.id);
      await fetchPdfs();
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateCertificate = async () => {
    if (!user?.id) return;
    setGenerating(true);
    try {
      await apiGenerateCertificatePdf(user.id);
      await fetchPdfs();
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadAgreement = () => {
    if (agreementPdfUrl) {
      window.open(`${agreementPdfUrl}?download=true`, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDownloadCertificate = () => {
    if (certificateDetails.certificateUrl) {
      window.open(`${certificateDetails.certificateUrl}?download=true`, '_blank', 'noopener,noreferrer');
    }
  };

  const hasCertificatePdf = Boolean(certificateDetails.certificateUrl);


  // No loading message, just render empty or fallback UI if needed

  if (!user?.id) {
    return (
      <div ref={sectionRef} tabIndex={0} style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card padding="md" shadow="sm" className="certificate-section-card">
          <p>User not found. Please log in again.</p>
        </Card>
      </div>
    );
  }

  return (
    <div ref={sectionRef} tabIndex={0}>

      <Card padding="md" shadow="sm" className="certificate-section-card">
        <div className="certificate-content-wrap">
          <div className="card-header-row">
            <h2 className="card-section-title">Certificate</h2>
          </div>

          {/* Certificate Preview at the top */}
          <div className="certificate-preview-wrap" style={{ marginBottom: 32 }}>
            {certificateImageUrl ? (
              <img
                src={certificateImageUrl}
                alt="Certificate Preview"
                className="certificate-image-preview"
              />
            ) : hasCertificatePdf ? (
              <object
                data={certificateDetails.certificateUrl}
                type="application/pdf"
                className="certificate-pdf-preview"
                aria-label="Certificate PDF preview"
              >
                <div className="certificate-dummy-preview">
                  <img src="/certificate.svg" alt="Certificate" className="certificate-dummy-icon" />
                  <strong>Certificate PDF preview not supported in this browser.</strong>
                  <span>Tap “Download Certificate PDF” to open it in a new tab.</span>
                </div>
              </object>
            ) : (
              <div className="certificate-dummy-preview">
                <img src="/certificate.svg" alt="Dummy certificate" className="certificate-dummy-icon" />
                <strong>No Certificate Generated</strong>
                <span>Complete your details and get your certificate.</span>
              </div>
            )}
          </div>

          {/* Certificate Details below preview */}
          <aside className="certificate-sidebar-section" style={{ marginBottom: 24 }}>
            <h3 className="certificate-section-title">Certificate Details</h3>
            {Object.keys(certificateDetails).length === 0 ? (
              <div className="certificate-detail-grid">
                <div className="certificate-detail-item">
                  <span>No certificate data available.</span>
                </div>
              </div>
            ) : (
              <div className="certificate-detail-grid">
                {certificateDetails.certificateUrl && (
                  <div className="certificate-detail-item">
                    <span>Certificate PDF</span>
                    <a href={certificateDetails.certificateUrl} target="_blank" rel="noopener noreferrer">View Certificate PDF</a>
                  </div>
                )}
                {certificateDetails.certificateNumber && (
                  <div className="certificate-detail-item">
                    <span>Certificate Number</span>
                    <strong>{certificateDetails.certificateNumber}</strong>
                  </div>
                )}
                {certificateDetails.issueDate && (
                  <div className="certificate-detail-item">
                    <span>Issued Date</span>
                    <strong>{new Date(certificateDetails.issueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                  </div>
                )}
                {certificateDetails.certificateType && (
                  <div className="certificate-detail-item">
                    <span>Certificate Type</span>
                    <strong>{certificateDetails.certificateType}</strong>
                  </div>
                )}
                {certificateDetails.deliveryPartner && (
                  <div className="certificate-detail-item">
                    <span>Delivery Partner</span>
                    <strong>{certificateDetails.deliveryPartner}</strong>
                  </div>
                )}
                {certificateDetails.validUntil && (
                  <div className="certificate-detail-item">
                    <span>Valid Until</span>
                    <strong>{new Date(certificateDetails.validUntil).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                  </div>
                )}
                {certificateDetails.validityPeriodMonths !== undefined && (
                  <div className="certificate-detail-item">
                    <span>Validity Period (Months)</span>
                    <strong>{certificateDetails.validityPeriodMonths}</strong>
                  </div>
                )}
                {certificateDetails.validityPeriod && (
                  <div className="certificate-detail-item">
                    <span>Validity Period</span>
                    <strong>{certificateDetails.validityPeriod}</strong>
                  </div>
                )}
              </div>
            )}
          </aside>

          {/* Status and Actions below details */}
          <div className="certificate-status-panel">
            <span className="certificate-status-label">Certificate Status</span>
            <strong className="certificate-status-value">{hasCertificatePdf ? 'Active' : 'Pending'}</strong>
            <p className="certificate-status-copy">
              {hasCertificatePdf
                ? 'Your certificate is active and valid.'
                : 'Certificate PDF not uploaded yet. Showing dummy certificate preview.'}
            </p>
          </div>

          <div className="certificate-cta-row">
            <Button variant="primary" size="sm" onClick={handleDownloadCertificate}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1" />
              </svg>
              Download Certificate PDF
            </Button>
          </div>
        </div>



        <h3 className="certificate-section-title">Important Information</h3>
        <ul className="certificate-info-list">
          <li>This certificate is valid for 2 years from the date of issuance.</li>
          <li>The certificate includes a QR code for public verification.</li>
          <li>Keep this certificate safe and present it when required.</li>
          <li>For any certificate-related issues, please contact support.</li>

        </ul>
      </Card>
    </div>
  );
}

export default DocumentsSection;
