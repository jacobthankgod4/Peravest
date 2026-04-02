import React from 'react';
import styles from './ActivityFeed.module.css';

interface Activity {
  id: number;
  type: 'investment' | 'withdrawal' | 'dividend';
  title: string;
  amount: number;
  date: string;
  icon: string;
  color: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-GB');
  };

  return (
    <div className={styles.activityFeed}>
      <h2 className={styles.title}>Recent Activity</h2>
      <div className={styles.activityList}>
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div key={activity.id} className={styles.activityItem}>
              <div className={styles.iconWrapper} style={{ backgroundColor: `${activity.color}15` }}>
                <i className={activity.icon} style={{ color: activity.color }}></i>
              </div>
              <div className={styles.activityContent}>
                <p className={styles.activityTitle}>{activity.title}</p>
                <span className={styles.activityDate}>{getTimeAgo(activity.date)}</span>
              </div>
              <div className={styles.activityAmount}>
                ₦{activity.amount.toLocaleString('en-NG')}
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <i className="fas fa-history"></i>
            <p>No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
