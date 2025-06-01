// src/common/components/MetricCard.jsx
import React from 'react';
import '../../styles/components.css';

const MetricCard = ({title, value, description}) => {
    // Format numbers with commas
    const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;

    return (
        <div className="metric-card">
            <h3 className="metric-title">{title}</h3>
            <div className="metric-value">{formattedValue}</div>
            <div className="metric-description">{description}</div>
        </div>
    );
};

export default MetricCard;