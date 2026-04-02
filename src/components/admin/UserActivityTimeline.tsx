import React from 'react';

interface UserActivityTimelineProps {
  activity: any[];
}

const UserActivityTimeline: React.FC<UserActivityTimelineProps> = ({ activity }) => {
  const getActionIcon = (action: string) => {
    const icons: any = {
      SUSPEND_USER: 'fa-ban',
      ACTIVATE_USER: 'fa-check-circle',
      OVERRIDE_KYC: 'fa-id-card',
      APPROVE_WITHDRAWAL: 'fa-money-bill',
      REJECT_WITHDRAWAL: 'fa-times-circle',
      APPROVE_KYC: 'fa-check',
      REJECT_KYC: 'fa-times'
    };
    return icons[action] || 'fa-circle';
  };

  const getActionColor = (action: string) => {
    if (action.includes('APPROVE')) return 'success';
    if (action.includes('REJECT') || action.includes('SUSPEND')) return 'danger';
    if (action.includes('ACTIVATE')) return 'success';
    return 'info';
  };

  if (activity.length === 0) {
    return <p className="text-center text-muted">No activity recorded</p>;
  }

  return (
    <div className="activity-timeline">
      {activity.map((item, index) => (
        <div key={index} className="timeline-item">
          <div className={`timeline-icon bg-${getActionColor(item.action)}`}>
            <i className={`fas ${getActionIcon(item.action)}`}></i>
          </div>
          <div className="timeline-content">
            <div className="timeline-header">
              <strong>{item.action.replace(/_/g, ' ')}</strong>
              <span className="text-muted">
                {new Date(item.created_at).toLocaleString()}
              </span>
            </div>
            <div className="timeline-body">
              <small className="text-muted">By: {item.admin_email}</small>
              {item.details && (
                <div className="mt-1">
                  <small>{JSON.stringify(item.details, null, 2)}</small>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserActivityTimeline;
