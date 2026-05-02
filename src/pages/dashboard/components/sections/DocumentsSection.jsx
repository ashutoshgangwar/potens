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

  // Convert PDF to image using pdfjs — crops out blank bottom area
  const renderPdfToImage = async (pdfUrl) => {
    try {
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 2.5 }); // higher scale = sharper
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: context, viewport }).promise;

      // Crop: scan from bottom to find last non-white/non-black row
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const { data, width, height } = imageData;
      let lastContentRow = height;
      for (let y = height - 1; y >= 0; y--) {
        let rowHasContent = false;
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          // not white/near-white AND not black/near-black (black = pdf.js default blank bg)
          const isWhite = r > 240 && g > 240 && b > 240;
          const isBlack = r < 15 && g < 15 && b < 15;
          if (!isWhite && !isBlack) {
            rowHasContent = true;
            break;
          }
        }
        if (rowHasContent) {
          lastContentRow = y + 1;
          break;
        }
      }

      // Draw cropped result
      const cropped = document.createElement('canvas');
      cropped.width = canvas.width;
      cropped.height = lastContentRow;
      const croppedCtx = cropped.getContext('2d');
      croppedCtx.drawImage(canvas, 0, 0);
      return cropped.toDataURL('image/png');
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

        const certRes = await apiGetCertificatePdfDetails({ token });

        setCertificateDetails(certRes || {});

        if (certRes?.certificateUrl) {
          try {
            const { blob } = await apiDownloadCertificatePdfFile({ token });
            const blobPreviewUrl = window.URL.createObjectURL(blob);

            updatePreviewPdfUrl(blobPreviewUrl);

            const imgUrl = await renderPdfToImage(blobPreviewUrl);
            setCertificateImageUrl(imgUrl);
          } catch (previewError) {
            updatePreviewPdfUrl(null);

            const imgUrl = await renderPdfToImage(certRes.certificateUrl);
            setCertificateImageUrl(imgUrl);
          }
        } else {
          updatePreviewPdfUrl(null);
          setCertificateImageUrl(null);
        }
      } else {
        setCertificateDetails({});
        updatePreviewPdfUrl(null);
        setCertificateImageUrl(null);
      }
    } catch (err) {
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
    <>
      {/* Responsive styles injected inline so no external CSS file change needed */}
      <style>{`
        .certificate-preview-responsive-wrap {
          width: 100%;
          max-width: 860px;
          margin: 0 auto 32px;
          border-radius: 16px;
          overflow: hidden;
          border: 1.5px solid #d0e4f7;
          background: #fff;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
        }
        .certificate-image-preview-responsive {
          width: 100%;
          height: auto;
          display: block;
          border-radius: 0;
        }
        .certificate-skeleton-responsive {
          width: 100%;
          aspect-ratio: 1.414 / 1;
          background: linear-gradient(90deg, #f0f4f8 25%, #e2eaf2 50%, #f0f4f8 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 12px;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .certificate-dummy-preview-responsive {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 48px 24px;
          text-align: center;
          color: #6b7c93;
          min-height: 260px;
        }
        .certificate-dummy-icon-responsive {
          width: 56px;
          height: 56px;
          opacity: 0.5;
        }
        @media (max-width: 600px) {
          .certificate-preview-responsive-wrap {
            border-radius: 10px;
            margin-bottom: 20px;
          }
          .certificate-preview-header-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 10px !important;
          }
        }
      `}</style>

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
                <strong>{certificateDetails.name || user?.name || '—'}</strong>
                <span>{certificateDetails.certificateType || 'Certificate details available below'}</span>
              </div>
            </div>

            {loading && (
              <p className="certificate-loading-copy">Loading certificate details...</p>
            )}

            {/* Certificate Preview Header */}
            <div
              className="certificate-preview-header certificate-preview-header-row"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}
            >
              <div>
                <h3 className="certificate-section-title">Certificate Preview</h3>
                <p className="certificate-preview-copy">Your certificate is shown directly on screen below.</p>
              </div>
              {hasCertificatePdf && (
                <Button variant="primary" size="sm" onClick={handleDownloadCertificate}>
                  <img src="/download-button.svg" alt="" aria-hidden="true" className="certificate-download-icon" />
                  Download Certificate
                </Button>
              )}
            </div>

            {/* Certificate Preview — responsive, cropped */}
            <div className="certificate-preview-responsive-wrap">
              {loading ? (
                <div className="certificate-skeleton-responsive" />
              ) : certificateImageUrl ? (
                <img
                  src={certificateImageUrl}
                  alt="Certificate Preview"
                  className="certificate-image-preview-responsive"
                />
              ) : hasCertificatePdf ? (
                <div className="certificate-dummy-preview-responsive">
                  <img src="/certificate.svg" alt="Certificate" className="certificate-dummy-icon-responsive" />
                  <strong>Certificate Ready</strong>
                  <span>Click the button below to view or download your certificate.</span>
                  <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Button variant="primary" size="sm" onClick={handleDownloadCertificate}>
                      Download Certificate
                    </Button>
                    <Button variant="secondary" size="sm" onClick={handleViewCertificate}>
                      View in New Tab
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="certificate-dummy-preview-responsive">
                  <img src="/certificate.svg" alt="Dummy certificate" className="certificate-dummy-icon-responsive" />
                  <strong>No Certificate Generated</strong>
                  <span>Complete your details and get your certificate.</span>
                </div>
              )}
            </div>

            {/* Certificate Details */}
            <aside className="certificate-sidebar-section certificate-sidebar-section--enhanced" style={{ marginBottom: 24 }}>
              <div className="certificate-section-heading-row">
                <h3 className="certificate-section-title">Certificate Details</h3>
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
    </>
  );
};

export default DocumentsSection;