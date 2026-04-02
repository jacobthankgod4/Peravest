import React from 'react';

interface UserActionsProps {
  user: any;
  onView: () => void;
  onSuspend: () => void;
  onActivate: () => void;
}

const UserActions: React.FC<UserActionsProps> = ({
  user,
  onView,
  onSuspend,
  onActivate
}) => {
  const isActive = user.status === 'active' || !user.status;
  const isSuspended = user.status === 'suspended';

  return (
    <div className="btn-group btn-group-sm">
      <button
        className="btn btn-outline-primary"
        onClick={onView}
        title="View Details"
      >
        <i className="fas fa-eye"></i>
      </button>

      {isActive ? (
        <button
          className="btn btn-outline-warning"
          onClick={onSuspend}
          title="Suspend User"
        >
          <i className="fas fa-ban"></i>
        </button>
      ) : (
        <button
          className="btn btn-outline-success"
          onClick={onActivate}
          title="Activate User"
        >
          <i className="fas fa-check-circle"></i>
        </button>
      )}
    </div>
  );
};

export default UserActions;
