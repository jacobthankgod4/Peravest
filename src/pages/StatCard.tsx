import React from 'react';
import styles from './StatCard.module.css';

interface StatCardProps {
  icon: string;
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down';
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  icon, 
  title, 
  value, 
  change, 
  trend = 'up',
  color = '#09c398'
}) => {
  return (
    <div className={styles.statCard}>
      <div className={styles.iconWrapper} style={{ backgroundColor: `${color}15` }}>
        <i className={icon} style={{ color }}></i>
      </div>
      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        <h3 className={styles.value}>{value}</h3>
        {change !== undefined && (
          <div className={`${styles.change} ${styles[trend]}`}>
            <i className={`fas fa-arrow-${trend === 'up' ? 'up' : 'down'}`}></i>
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
