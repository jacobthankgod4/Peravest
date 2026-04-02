import React from 'react';
import { useNavigate } from 'react-router-dom';

interface BreadcrumbProps {
  title: string;
  currentPage?: string;
  items?: Array<{label: string; href?: string; active?: boolean}>;
  backgroundImage?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = () => {
  return null;
};

export default Breadcrumb;
