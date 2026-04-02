import React, { useState, useEffect } from 'react';
import { kycAdminService } from '../../services/kycAdminService';
import { useAuth } from '../../contexts/AuthContext';
import KYCDocumentViewer from './KYCDocumentViewer';
import KYCApprovalModal from './KYCApprovalModal';
import Swal from 'sweetalert2';

const KYCVerification: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('pending');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [viewerState, setViewerState] = useState<{
    isOpen: boolean;
    document: any;
  }>({ isOpen: false, document: null });
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'reject' | 'request_more';
    document: any;
  }>({ isOpen: false, type: 'reject', document: null });

  useEffect(() => {
    fetchDocuments();
  }, [filter]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = filter === 'pending'
        ? await kycAdminService.getPendingKYC()
        : await kycAdminService.getAllKYC(filter === 'all' ? undefined : filter);
      setDocuments(data || []);
    } catch (error) {
      console.error('Failed to fetch KYC documents:', error);
      setDocuments([]);
      // Don't show error for empty table - it's normal
    } finally {
      setLoading(false);
    }
  };

  const handleView = (document: any) => {
    setViewerState({ isOpen: true, document });
  };

  const handleApprove = async () => {
    try {
      await kycAdminService.approveKYC(viewerState.document.id, user?.email!);
      Swal.fire('Success', 'KYC approved successfully', 'success');
      setViewerState({ isOpen: false, document: null });
      fetchDocuments();
    } catch (error) {
      Swal.fire('Error', 'Approval failed', 'error');
    }
  };

  const handleReject = () => {
    setModalState({ isOpen: true, type: 'reject', document: viewerState.document });
    setViewerState({ isOpen: false, document: null });
  };

  const handleRequestMore = () => {
    setModalState({ isOpen: true, type: 'request_more', document: viewerState.document });
    setViewerState({ isOpen: false, document: null });
  };

  const confirmAction = async (data: any) => {
    try {
      if (modalState.type === 'reject') {
        await kycAdminService.rejectKYC(modalState.document.id, user?.email!, data);
        Swal.fire('Success', 'KYC rejected', 'success');
      } else {
        await kycAdminService.requestAdditionalDocuments(modalState.document.id, user?.email!, data);
        Swal.fire('Success', 'Additional documents requested', 'success');
      }
      setModalState({ isOpen: false, type: 'reject', document: null });
      fetchDocuments();
    } catch (error) {
      Swal.fire('Error', 'Action failed', 'error');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) {
      Swal.fire('Warning', 'Please select documents to approve', 'warning');
      return;
    }

    const result = await Swal.fire({
      title: 'Bulk Approve',
      text: `Approve ${selectedIds.length} KYC document(s)?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, approve',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await kycAdminService.bulkApprove(selectedIds, user?.email!);
        Swal.fire('Success', `${selectedIds.length} KYC documents approved`, 'success');
        setSelectedIds([]);
        fetchDocuments();
      } catch (error) {
        Swal.fire('Error', 'Bulk approval failed', 'error');
      }
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === documents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(documents.map(d => d.id));
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: any = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
      additional_required: 'info'
    };
    return <span className={`badge bg-${colors[status] || 'secondary'}`}>{status}</span>;
  };

  if (loading) return <div className="text-center py-5">Loading...</div>;

  return (
    <div className="kyc-verification">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>KYC Verification</h2>
        <div className="d-flex gap-2">
          <select className="form-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="additional_required">Additional Required</option>
            <option value="all">All</option>
          </select>
          {selectedIds.length > 0 && (
            <button className="btn btn-success" onClick={handleBulkApprove}>
              Approve Selected ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {documents.length === 0 ? (
            <div className="text-center py-4">
              <p>No KYC documents found. This is normal for a new system.</p>
              <small className="text-muted">KYC documents will appear here when users submit verification requests.</small>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    {filter === 'pending' && (
                      <th>
                        <input
                          type="checkbox"
                          checked={selectedIds.length === documents.length}
                          onChange={toggleSelectAll}
                        />
                      </th>
                    )}
                    <th>Date</th>
                    <th>User</th>
                    <th>Document Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id}>
                      {filter === 'pending' && (
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(doc.id)}
                            onChange={() => toggleSelect(doc.id)}
                          />
                        </td>
                      )}
                      <td>{new Date(doc.created_at).toLocaleDateString()}</td>
                      <td>
                        {doc.user_accounts?.Name}<br />
                        <small className="text-muted">{doc.user_accounts?.Email}</small>
                      </td>
                      <td>{doc.document_type || 'Standard KYC'}</td>
                      <td>{getStatusBadge(doc.status)}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleView(doc)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <KYCDocumentViewer
        isOpen={viewerState.isOpen}
        onClose={() => setViewerState({ isOpen: false, document: null })}
        document={viewerState.document}
        onApprove={handleApprove}
        onReject={handleReject}
        onRequestMore={handleRequestMore}
      />

      <KYCApprovalModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, type: 'reject', document: null })}
        onConfirm={confirmAction}
        type={modalState.type}
        document={modalState.document}
      />
    </div>
  );
};

export default KYCVerification;
