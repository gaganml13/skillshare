import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import VerificationBadge from '../components/common/VerificationBadge';

const MyProfilePage = () => {
    const { user } = useContext(AuthContext);

    // Mock Data for "LinkedIn-style" profile
    const profileData = {
        headline: "Frontend Developer | React Enthusiast | UX Learner",
        bio: "Passionate about building intuitive user experiences and learning modern web technologies. Currently mastering the MERN stack and exploring AI integration in web apps.",
        jobReadiness: 72,
        skills: [
            { name: "React.js", source: "Course: specialized React Patterns" },
            { name: "Node.js", source: "Project: API Development" },
            { name: "UI/UX Design", source: "Assignment: Portfolio Redesign" },
            { name: "JavaScript (ES6+)", source: "Course: Advanced JS" },
            { name: "CSS Grid/Flexbox", source: "Project: Dashboard Layout" }
        ],
        projects: [
            { title: "E-commerce Dashboard", type: "Project", date: "Dec 2025" },
            { title: "Task Management App", type: "Assignment", date: "Nov 2025" },
            { title: "Weather Forecast Widget", type: "Project", date: "Oct 2025" }
        ],
        achievements: [
            { title: "Top Contributor", icon: "🏆", desc: "Top 5% in Community" },
            { title: "Fast Learner", icon: "⚡", desc: "Completed 3 courses in a week" },
            { title: "Bug Hunter", icon: "🐛", desc: "Reported 5 valid issues" }
        ],
        review: {
            strengths: [
                { label: "Learning Consistency", value: "High", color: "var(--success, #22c55e)", score: 90 },
                { label: "Community Participation", value: "Active", color: "var(--success, #22c55e)", score: 85 }
            ],
            improvementAreas: [
                { label: "Assignment Completion", value: "Low", color: "var(--warning, #f59e0b)", score: 40 },
                { label: "Study Time", value: "Inconsistent", color: "var(--warning, #f59e0b)", score: 55 }
            ],
            recommendations: [
                "Complete 2 assignments this week to boost your practice score.",
                "Join one micro-event to network with peers.",
                "Engage in community discussions to improve visibility."
            ]
        }
    };

    return (
        <div className="profile-page-container" style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1.5rem', fontFamily: 'var(--font-family-base)' }}>

            {/* Header Section */}
            <div className="profile-header card" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '2rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="profile-avatar" style={{
                    width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 'bold'
                }}>
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="profile-info" style={{ flex: 1 }}>
                    <h1 style={{ margin: '0 0 0.5rem', fontSize: '2rem', color: 'var(--text-primary)' }}>{user?.name || 'User Name'}</h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{profileData.headline}</p>
                    <p style={{ color: 'var(--text-tertiary)', lineHeight: '1.5' }}>{profileData.bio}</p>
                </div>
                <div className="job-readiness" style={{ width: '250px', padding: '1.5rem', background: 'var(--bg-body)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: '600' }}>
                        <span>Job Readiness</span>
                        <span style={{ color: 'var(--primary)' }}>{profileData.jobReadiness}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${profileData.jobReadiness}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px' }}></div>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>Based on skills & activity</p>
                </div>
            </div>



            {/* Personalized Review Section */}
            < section className="profile-review-section" style={{ marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

                {/* Strengths & Improvements Card */}
                < div className="card" style={{ padding: '2rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>Performance Analysis</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Strengths</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {profileData.review.strengths.map((item, idx) => (
                                    <div key={idx}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                                            <strong>{item.label}</strong>
                                            <span style={{ color: item.color, fontWeight: '600' }}>{item.value}</span>
                                        </div>
                                        <div style={{ width: '100%', height: '6px', background: 'var(--bg-body)', borderRadius: '3px' }}>
                                            <div style={{ width: `${item.score}%`, height: '100%', background: item.color, borderRadius: '3px' }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Areas for Improvement</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {profileData.review.improvementAreas.map((item, idx) => (
                                    <div key={idx}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                                            <strong>{item.label}</strong>
                                            <span style={{ color: item.color, fontWeight: '600' }}>{item.value}</span>
                                        </div>
                                        <div style={{ width: '100%', height: '6px', background: 'var(--bg-body)', borderRadius: '3px' }}>
                                            <div style={{ width: `${item.score}%`, height: '100%', background: item.color, borderRadius: '3px' }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div >

                {/* AI Recommendations Card */}
                < div className="card" style={{ padding: '2rem', background: 'linear-gradient(135deg, var(--bg-surface), var(--bg-body))', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>🤖</span> Personalized Mentor
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Based on your recent activity, here are some recommended actions to fast-track your growth:</p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {profileData.review.recommendations.map((rec, idx) => (
                            <li key={idx} style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '1rem', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--primary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                {rec}
                            </li>
                        ))}
                    </ul>
                </div >
            </section >

            <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>

                {/* Left Column */}
                <div className="main-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Detailed Skills Section */}
                    <section className="card" style={{ padding: '2rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            Verified Skills <span style={{ fontSize: '0.8rem', background: 'var(--success-light)', color: 'var(--success)', padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>{profileData.skills.length} Certified</span>
                        </h2>
                        <div className="skills-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {profileData.skills.map((skill, index) => (
                                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-body)', borderRadius: 'var(--radius-md)' }}>
                                    <div>
                                        <strong style={{ display: 'block', fontSize: '1.1rem', marginBottom: '0.25rem' }}>{skill.name}</strong>
                                        <span style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)' }}>{skill.source}</span>
                                    </div>
                                    <VerificationBadge />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Projects Section */}
                    <section className="card" style={{ padding: '2rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Projects & Assignments</h2>
                        <div className="projects-grid" style={{ display: 'grid', gap: '1rem' }}>
                            {profileData.projects.map((project, index) => (
                                <div key={index} style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem' }}>{project.title}</h3>
                                        <span style={{ fontSize: '0.9rem', padding: '0.25rem 0.75rem', background: 'var(--bg-body)', borderRadius: '1rem', color: 'var(--text-secondary)' }}>{project.type}</span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <VerificationBadge text="Verified" size={16} />
                                        </div>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>{project.date}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                </div>

                {/* Right Column */}
                <div className="sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Achievements */}
                    <section className="card" style={{ padding: '2rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                        <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>Achievements</h2>
                        <div className="badges-list" style={{ display: 'grid', gap: '1rem' }}>
                            {profileData.achievements.map((item, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ fontSize: '2rem', width: '50px', height: '50px', background: 'var(--bg-body)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{item.title}</strong>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>{item.desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="btn btn--outline" style={{ width: '100%', marginTop: '1.5rem' }}>View All Badges</button>
                    </section>

                    {/* Contact / Social Placeholder */}
                    <section className="card" style={{ padding: '2rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Public Profile</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>Your profile is visible to employers and peers.</p>
                        <button className="btn btn--primary" style={{ width: '100%' }}>Share Profile</button>
                    </section>

                </div>
            </div>
        </div >
    );
};

export default MyProfilePage;
