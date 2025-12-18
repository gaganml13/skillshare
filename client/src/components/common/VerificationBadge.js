import React from 'react';
import PropTypes from 'prop-types';

const VerificationBadge = ({ size = 20, className = '', text = "Verified" }) => {
    return (
        <div
            className={`verification-badge ${className}`}
            title="Verified through SkillverseX internal assessment"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary, #6366f1)', fontWeight: '600', fontSize: '0.85rem', cursor: 'help' }}
        >
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" fill="currentColor" fillOpacity="0.15" />
                <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7.75 12.75L10.25 15.25L16.25 9.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {text && <span>{text}</span>}
        </div>
    );
};

VerificationBadge.propTypes = {
    size: PropTypes.number,
    className: PropTypes.string,
    text: PropTypes.string
};

export default VerificationBadge;
