import React from 'react';
import { Button, Card } from '../../../../components/ui/index.js';

const DocumentsSection = ({ uploadedDocuments, totalDocuments, documentStatusRows, onOpenProfile }) => {
  return (
    <Card
      padding="md"
      shadow="sm"
      header={
        <div className="card-header-row">
          <h2 className="card-section-title">Documents</h2>
          <span className="meta-pill">
            {uploadedDocuments}/{totalDocuments} uploaded
          </span>
        </div>
      }
    >
      {documentStatusRows.map(({ key, label, uploaded }) => (
        <div key={key} className="status-row">
          <span className="status-label">{label}</span>
          <span className="status-value">{uploaded ? 'Uploaded' : 'Pending'}</span>
        </div>
      ))}
      <Button variant="secondary" size="sm" onClick={onOpenProfile}>
        Manage Documents
      </Button>
    </Card>
  );
};

export default DocumentsSection;
