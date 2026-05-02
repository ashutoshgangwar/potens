import React, { useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
// Set up PDF.js worker for Vite and pdfjs-dist v5+
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
import { Button, Card } from '../../../../components/ui/index.js';
import { apiDownloadCertificatePdfFile, apiGetCertificatePdfDetails } from '../../../../utils/api.js';

const DocumentsSection = ({ user }) => {
  const [certificateDetails, setCertificateDetails] = useState({});
  const [certificateImageUrl, setCertificateImageUrl] = useState(null);
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatDate = (value) => {
    if (!value) return '—';

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) return '—';

    return parsedDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

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

  const updatePreviewPdfUrl = (nextUrl) => {
    setPreviewPdfUrl((currentUrl) => {
      if (currentUrl && currentUrl !== nextUrl) {
        window.URL.revokeObjectURL(currentUrl);
      }

      return nextUrl;
    });
  };

  const fetchCertificateDetails = async () => {
    setLoading(true);
    try {
      if (user?.id) {
        const token = localStorage.getItem('POTENS_admin_access_token') || '';

        // console.log('[DocumentsSection] Fetching certificate:', {
        //   userId: user.id,
        //   hasToken: Boolean(token),
        // });

        const certRes = await apiGetCertificatePdfDetails({ token });

        // console.log('[DocumentsSection] Certificate response:', certRes);

        setCertificateDetails(certRes || {});

        if (certRes?.certificateUrl) {
          try {
            const { blob } = await apiDownloadCertificatePdfFile({ token });
            const blobPreviewUrl = window.URL.createObjectURL(blob);

            // console.log('[DocumentsSection] Certificate blob preview URL created');

            updatePreviewPdfUrl(blobPreviewUrl);

            const imgUrl = await renderPdfToImage(blobPreviewUrl);
            // console.log('[DocumentsSection] Certificate preview rendered:', Boolean(imgUrl));
            setCertificateImageUrl(imgUrl);
          } catch (previewError) {
            // console.error('[DocumentsSection] Blob preview generation failed:', previewError);
            updatePreviewPdfUrl(null);

            const imgUrl = await renderPdfToImage(certRes.certificateUrl);
            // console.log('[DocumentsSection] Fallback certificate preview rendered:', Boolean(imgUrl));
            setCertificateImageUrl(imgUrl);
          }
        } else {
          // console.log('[DocumentsSection] No certificateUrl returned from API');
          updatePreviewPdfUrl(null);
          setCertificateImageUrl(null);
        }
      } else {
        setCertificateDetails({});
        updatePreviewPdfUrl(null);
        setCertificateImageUrl(null);
      }
    } catch (err) {
      // console.error('[DocumentsSection] fetchCertificateDetails error:', err);
      setCertificateDetails({});
      updatePreviewPdfUrl(null);
      setCertificateImageUrl(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificateDetails();
  }, [user?.id]);

  useEffect(() => () => {
    if (previewPdfUrl) {
      window.URL.revokeObjectURL(previewPdfUrl);
    }
  }, [previewPdfUrl]);

  const handleDownloadCertificate = async () => {
    try {
      const token = localStorage.getItem('POTENS_admin_access_token') || '';

      // console.log('[DocumentsSection] Downloading certificate via API:', {
      //   hasToken: Boolean(token),
      // });

      const { blob, fileName } = await apiDownloadCertificatePdfFile({ token });
      const objectUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = fileName || 'my-certificate.pdf';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('[DocumentsSection] Download certificate error:', error);
    }
  };

  const handleViewCertificate = () => {
    const previewUrl = previewPdfUrl || certificateDetails.certificateUrl;

    if (!previewUrl) {
      return;
    }

    // console.log('[DocumentsSection] Viewing certificate in new tab:', previewUrl);
    window.open(previewUrl, '_blank', 'noopener,noreferrer');
  };

  const hasCertificatePdf = Boolean(previewPdfUrl || certificateDetails.certificateUrl);
  const certificateStatus = hasCertificatePdf ? 'Active' : 'Pending';
  const certificateFields = [
    {
      key: 'certificateNumber',
      label: 'Certificate Number',
      value: certificateDetails.certificateNumber || '—',
    },
    {
      key: 'deliveryPartner',
      label: 'Delivery Partner',
      value: certificateDetails.deliveryPartner || '—',
    },
    {
      key: 'issueDate',
      label: 'Issue Date',
      value: certificateDetails.issueDate ? formatDate(certificateDetails.issueDate) : '—',
    },
    {
      key: 'validUntil',
      label: 'Expiry Date',
      value: certificateDetails.validUntil ? formatDate(certificateDetails.validUntil) : '—',
    },
    {
      key: 'validityPeriod',
      label: 'Validity Period',
      value: certificateDetails.validityPeriod || '—',
    },
  ];


  // No loading message, just render empty or fallback UI if needed

  if (!user?.id) {
    return (
      <div tabIndex={0} style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card padding="md" shadow="sm" className="certificate-section-card">
          <p>User not found. Please log in again.</p>
        </Card>
      </div>
    );
  }

  return (
    <div tabIndex={0}>

      <Card padding="md" shadow="sm" className="certificate-section-card">
        <div className="certificate-content-wrap">
          <div className="certificate-hero">
            <div>
              <div className="certificate-hero-chip">Verified Document</div>
              <div className="card-header-row certificate-header-row">
                <h2 className="card-section-title">Certificate</h2>
                <span className={`certificate-status-badge ${hasCertificatePdf ? 'certificate-status-badge--active' : 'certificate-status-badge--pending'}`}>
                  {certificateStatus}
                </span>
              </div>
              <p className="certificate-hero-subtitle">
                View your certificate details, validity dates.
              </p>
            </div>
            <div className="certificate-hero-meta">
              {/* <span className="certificate-hero-meta-label">Holder</span> */}
              <strong>{certificateDetails.name || user?.name || '—'}</strong>
              <span>{certificateDetails.certificateType || 'Certificate details available below'}</span>
            </div>
          </div>

          {loading && (
            <p className="certificate-loading-copy">Loading certificate details...</p>
          )}

          <div className="certificate-preview-header">
            <div>
              <h3 className="certificate-section-title">Certificate Preview</h3>
              <p className="certificate-preview-copy">Your certificate is shown directly on screen below.</p>
            </div>
            {hasCertificatePdf && (
              <Button variant="primary" size="sm" onClick={handleViewCertificate}>
                <img src="/download-button.svg" alt="" aria-hidden="true" className="certificate-download-icon" />
                Download Certificate
              </Button>
            )}
          </div>

          {/* Certificate Preview at the top */}
          <div className={`certificate-preview-wrap${!loading ? ' certificate-preview-wrap--loaded' : ''}`} style={{ marginBottom: 32 }}>
            {loading ? (
              <div className="certificate-preview-skeleton" />
            ) : certificateImageUrl ? (
              <img
                src={certificateImageUrl}
                alt="Certificate Preview"
                className="certificate-image-preview"
              />
            ) : hasCertificatePdf ? (
              <iframe
                src={previewPdfUrl || certificateDetails.certificateUrl}
                title="Certificate Preview"
                className="certificate-pdf-preview"
              >
                <div className="certificate-dummy-preview">
                  <img src="/certificate.svg" alt="Certificate" className="certificate-dummy-icon" />
                  <strong>Certificate PDF preview not supported in this browser.</strong>
                  <span>Tap “Download Certificate PDF” to open it in a new tab.</span>
                </div>
              </iframe>
            ) : (
              <div className="certificate-dummy-preview">
                <img src="/certificate.svg" alt="Dummy certificate" className="certificate-dummy-icon" />
                <strong>No Certificate Generated</strong>
                <span>Complete your details and get your certificate.</span>
              </div>
            )}
          </div>

          {/* <div className="certificate-summary-grid">
            <div className="certificate-summary-card certificate-summary-card--primary">
              <span>Certifaaaicate Number</span>
              <strong>{certificateDetails.certificateNumber || '—'}</strong>
            </div>
            <div className="certificate-summary-card">
              <span>Issue Date</span>
              <strong>{certificateDetails.issueDate ? formatDate(certificateDetails.issueDate) : '—'}</strong>
            </div>
            <div className="certificate-summary-card">
              <span>Expiry Date</span>
              <strong>{certificateDetails.validUntil ? formatDate(certificateDetails.validUntil) : '—'}</strong>
            </div>
          </div> */}

          {/* Certificate Details below preview */}
          <aside className="certificate-sidebar-section certificate-sidebar-section--enhanced" style={{ marginBottom: 24 }}>
            <div className="certificate-section-heading-row">
              <h3 className="certificate-section-title">Certificate Details</h3>
              {/* <span className="certificate-section-note">Synced from your latest API response</span> */}
            </div>
            {Object.keys(certificateDetails).length === 0 ? (
              <div className="certificate-detail-grid">
                <div className="certificate-detail-item">
                  <span>No certificate data available.</span>
                </div>
              </div>
            ) : (
              <div className="certificate-detail-grid">
                {certificateFields.map((field) => (
                  <div
                    className="certificate-detail-item"
                    key={field.key}
                  >
                    <span>{field.label}</span>
                    <strong>{field.value}</strong>
                  </div>
                ))}
              </div>
            )}
          </aside>

          {/* Status and Actions below details
          <div className="certificate-status-panel">
            <span className="certificate-status-label">Certificaaaate Status</span>
            <strong className="certificate-status-value">{certificateStatus}</strong>
            <p className="certificate-status-copy">
              {hasCertificatePdf
                ? 'Your certificate is active and valid.'
                : 'Certificate PDF not uploaded yet. Showing dummy certificate preview.'}
            </p>
          </div> */}

          {/* <div className="certificate-cta-row certificate-cta-row--document">
            {hasCertificatePdf && (
              <Button variant="secondary" size="sm" onClick={handleViewCertificate}>
                Open Full Preview
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={handleDownloadCertificate}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1" />
              </svg>
              Download Certificate PDF
            </Button>
          </div> */}
        </div>



        <h3 className="certificate-section-title">Important Information</h3>
        <ul className="certificate-info-list">
          <li>This certificate is valid for {certificateDetails.validityPeriod || 'the configured validity period'} from the date of issuance.</li>
          <li>The certificate includes a QR code for public verification.</li>
          <li>Keep this certificate safe and present it when required.</li>
          <li>For any certificate-related issues, please contact support.</li>

        </ul>
      </Card>
    </div>
  );
}

export default DocumentsSection;
