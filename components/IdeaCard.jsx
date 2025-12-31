'use client';
import React, { useState } from 'react';
import { ArrowBigUp, MessageSquare, Clock, Trash2, RotateCcw, User } from 'lucide-react';

const IdeaCard = ({ idea, onVote, onComment, isAdmin, onDelete, onDeleteComment, onResetVotes, userEmail, onEmailChange }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [emailError, setEmailError] = useState(false);

    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const handleVote = (e) => {
        e.stopPropagation();
        onVote(idea.id);
    };

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (!validateEmail(userEmail)) {
            setEmailError(true);
            return;
        }
        setEmailError(false);
        if (!commentText.trim()) return;

        onComment(idea.id, commentText, userEmail);
        setCommentText('');
    };

    const formatDate = (timestamp) => {
        const d = new Date(timestamp);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    const getRelativeTime = (timestamp) => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const getAvatarColor = (name) => {
        const colors = [
            'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
            'linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)',
            'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
            'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
            'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)'
        ];
        let hash = 0;
        const str = name || 'Anonymous';
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <div className="glass-panel idea-card" style={{
            padding: '1.75rem',
            display: 'flex',
            gap: '1.75rem',
            position: 'relative',
            border: idea.userVoted ? '1px solid rgba(236, 72, 153, 0.4)' : '1px solid var(--glass-border)',
            background: idea.userVoted ? 'rgba(236, 72, 153, 0.05)' : 'var(--glass-bg)',
        }}>

            {isAdmin && (
                <button
                    onClick={() => onDelete(idea.id)}
                    style={{
                        position: 'absolute',
                        top: '1.25rem',
                        right: '1.25rem',
                        color: '#ef4444',
                        opacity: 0.4,
                        padding: '4px'
                    }}
                    className="hover-opacity-100"
                    title="Delete Idea"
                >
                    <Trash2 size={18} />
                </button>
            )}

            {/* Vote Section */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px', paddingTop: '0.25rem' }}>
                <button
                    onClick={handleVote}
                    style={{
                        color: idea.userVoted ? 'var(--secondary)' : 'var(--text-muted)',
                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        transform: idea.userVoted ? 'translateY(-2px)' : 'none',
                    }}
                    className="vote-btn"
                >
                    <ArrowBigUp size={42} fill={idea.userVoted ? 'currentColor' : 'none'} strokeWidth={1.5} />
                </button>
                <span style={{
                    fontWeight: '800',
                    fontSize: '1.25rem',
                    color: idea.userVoted ? 'var(--secondary)' : 'var(--text-primary)',
                    fontFamily: 'var(--font-display)',
                    marginTop: '-4px'
                }}>
                    {idea.votes}
                </span>

                {isAdmin && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onResetVotes(idea.id);
                        }}
                        style={{ marginTop: '1rem', color: 'var(--text-muted)', opacity: 0.3 }}
                        title="Reset Votes"
                        className="hover-opacity-100"
                    >
                        <RotateCcw size={14} />
                    </button>
                )}
            </div>

            {/* Content Section */}
            <div style={{ flex: 1 }}>
                <h3 style={{
                    fontSize: '1.6rem',
                    marginBottom: '0.75rem',
                    color: 'var(--text-primary)',
                    paddingRight: isAdmin ? '2.5rem' : '0',
                    letterSpacing: '-0.02em'
                }}>{idea.title}</h3>
                <p style={{
                    color: 'var(--text-secondary)',
                    marginBottom: '1.5rem',
                    lineHeight: '1.7',
                    fontSize: '1.05rem',
                    fontWeight: '400'
                }}>
                    {idea.description}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                        <div style={{
                            width: '1.5rem',
                            height: '1.5rem',
                            borderRadius: '6px',
                            background: getAvatarColor(idea.author),
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            color: 'white',
                            fontWeight: '700',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                        }}>
                            {(idea.author || 'A')[0].toUpperCase()}
                        </div>
                        <span style={{ fontWeight: '500' }}>{idea.author || 'Anonymous'}</span>
                    </div>

                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: isExpanded ? 'var(--primary)' : 'inherit',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            background: isExpanded ? 'rgba(139, 92, 246, 0.1)' : 'transparent'
                        }}
                        className="hover-text-primary"
                    >
                        <MessageSquare size={16} />
                        {idea.comments.length} {idea.comments.length === 1 ? 'Comment' : 'Comments'}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={16} />
                        {getRelativeTime(idea.timestamp)}
                    </div>
                </div>

                {/* Comments Section */}
                {isExpanded && (
                    <div style={{
                        marginTop: '1.75rem',
                        paddingTop: '1.75rem',
                        borderTop: '1px solid var(--glass-border)',
                        animation: 'fadeIn 0.3s ease-out'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                            {idea.comments.map((comment) => (
                                <div key={comment.id} className="glass-panel" style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    padding: '1rem',
                                    background: 'rgba(255,255,255,0.02)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <div style={{
                                        width: '2.25rem',
                                        height: '2.25rem',
                                        borderRadius: '8px',
                                        background: getAvatarColor(comment.author),
                                        flexShrink: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.9rem',
                                        fontWeight: 'bold',
                                        color: 'white',
                                    }}>
                                        {(comment.author || 'A')[0].toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{comment.author || 'Anonymous'}</span>
                                                <span style={{ margin: '0 0.5rem', opacity: 0.5 }}>•</span>
                                                {getRelativeTime(comment.timestamp)}
                                            </div>
                                            {isAdmin && (
                                                <button
                                                    onClick={() => onDeleteComment(idea.id, comment.id)}
                                                    style={{ color: '#ef4444', opacity: 0.4 }}
                                                    className="hover-opacity-100"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                            {comment.text}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {idea.comments.length === 0 && (
                                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '1rem' }}>No comments yet. Share your thoughts!</p>
                            )}
                        </div>

                        <form onSubmit={handleCommentSubmit} className="glass-panel" style={{
                            padding: '1.5rem',
                            background: 'rgba(0,0,0,0.2)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.25rem'
                        }}>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <div style={{ flex: '1 1 200px' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={userEmail}
                                        onChange={(e) => {
                                            onEmailChange(e.target.value);
                                            if (emailError) setEmailError(false);
                                        }}
                                        placeholder="you@example.com"
                                        className="input-field"
                                        style={{ borderColor: emailError ? '#ef4444' : '' }}
                                        required
                                    />
                                </div>
                                <div style={{ flex: '2 1 300px' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Comment</label>
                                    <input
                                        type="text"
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Add a comment..."
                                        className="input-field"
                                        required
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
                                    Post Comment
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IdeaCard;
