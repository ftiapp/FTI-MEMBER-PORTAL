import React from 'react';
import { STATUS_CONFIG } from '../../ีutils/constants';

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG[0];
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bgClass} ${config.textClass}`}>
      {config.text}
    </span>
  );
};

export default StatusBadge;