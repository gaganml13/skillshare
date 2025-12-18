import React from 'react';
import VerificationBadge from '../common/VerificationBadge';

const JobReadinessSidebar = ({ user }) => {
    // Mock Data mimicking profile
    const readinessData = {
        score: 72,
        verifiedSkills: [
            "React.js", "Node.js", "UI/UX Design", "JavaScript"
        ],
        missingSkills: [
            "TypScript", "GraphQL", "AWS"
        ],
        recommendations: [
            { title: "Advanced TypeScript Patterns", type: "Course" },
            { title: "GraphQL for React Devs", type: "Workshop" }
        ],
        badges: ["🏆", "⚡", "🐛"]
    };

    return (
        <aside className="job-readiness-sidebar" style={{ minWidth: '300px' }}>
            <div className="card" style={{ padding: '1.5rem', background: '#fff', borderRadius: '1rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', position: 'sticky', top: '2rem' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{user?.name || "User"}</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Frontend Developer</p>
                    </div>
                </div>

                {/* Readiness Score */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>
                        <span>Job Readiness</span>
                        <span style={{ color: 'var(--primary)' }}>{readinessData.score}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--bg-body)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${readinessData.score}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px' }}></div>
                    </div>
                </div>

                {/* Verified Skills */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Verified Skills</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {readinessData.verifiedSkills.map((skill, idx) => (
                            <span key={idx} style={{ fontSize: '0.85rem', padding: '0.25rem 0.6rem', background: 'var(--bg-surface-2)', borderRadius: '4px', border: '1px solid var(--primary-light)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                {skill}
                                <VerificationBadge size={12} text="" />
                            </span>
                        ))}
                    </div>
                </div>

                {/* Recommendations / Gap Analysis */}
                <div style={{ padding: '1rem', background: 'var(--bg-body)', borderRadius: '0.5rem' }}>
                    <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        🚀 Boost Your Profile
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        acquire <strong>{readinessData.missingSkills[0]}</strong> to match 15% more jobs.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {readinessData.recommendations.map((rec, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', padding: '0.5rem', background: '#fff', borderRadius: '4px', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                                <span style={{ fontSize: '1rem' }}>📚</span>
                                <span style={{ flex: 1, fontWeight: '500' }}>{rec.title}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{rec.type}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </aside>
    );
};

export default JobReadinessSidebar;
