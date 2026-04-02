import React, { useState } from 'react';

interface KYCDocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  document: any;
  onApprove: () => void;
  onReject: () => void;
  onRequestMore: () => void;
}

const KYCDocumentViewer: React.FC<KYCDocumentViewerProps> = ({
  isOpen,
  onClose,
  document,
  onApprove,
  onReject,
  onRequestMore
}) => {
  const [activeDoc, setActiveDoc] = useState(0);

  if (!isOpen || !document) return null;

  const documents = [
    { type: 'ID Card', url: document.id_card_url },
    { type: 'Proof of Address', url: document.proof_of_address_url },
    { type: 'Selfie', url: document.selfie_url }
  ].filter(d => d.url);

  const currentDoc = documents[activeDoc];
  const isPDF = currentDoc?.url?.toLowerCase().endsWith('.pdf');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>KYC Document Verification</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="user-info mb-3">
            <h5>{document.user_accounts?.Name}</h5>
            <p className="text-muted">{document.user_accounts?.Email}</p>
            <span className="badge bg-warning">{document.status}</span>
          </div>

          <div className="document-tabs mb-3">
            {documents.map((doc, idx) => (
              <button
                key={idx}
                className={`tab-btn ${activeDoc === idx ? 'active' : ''}`}
                onClick={() => setActiveDoc(idx)}
              >
                {doc.type}
              </button>
            ))}
          </div>

          <div className="document-viewer">
            {isPDF ? (
              <iframe
                src={currentDoc.url}
                className="pdf-viewer"
                title={currentDoc.type}
              />
            ) : (
              <img
                src={currentDoc.url}
                alt={currentDoc.type}
                className="document-image"
              />
            )}
          </div>

          <div className="document-details mt-3">
            <p><strong>Document Type:</strong> {document.document_type}</p>
            <p><strong>Submitted:</strong> {new Date(document.created_at).toLocaleString()}</p>
            {document.rejection_reason && (
              <div className="alert alert-danger">
                <strong>Previous Rejection:</strong> {document.rejection_reason}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onRequestMore}>
            Request More
          </button>
          <button className="btn btn-danger" onClick={onReject}>
            Reject
          </button>
          <button className="btn btn-success" onClick={onApprove}>
            Approve
          </button>
        </div>
      </div>
    </div>
  );
};

export default KYCDocumentViewer;
