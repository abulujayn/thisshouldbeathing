'use client';
import React, { useState } from 'react';
import { ArrowBigUp, MessageSquare, Clock, Trash2, RotateCcw } from 'lucide-react';

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
        const dateStr = d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        const timeStr = d.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
        });
        return `${dateStr} ${timeStr}`;
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

    // Generate a consistent color based on string
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
            padding: '1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            gap: '1.5rem',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            border: idea.userVoted ? '1px solid rgba(236, 72, 153, 0.3)' : '1px solid var(--glass-border)',
            transform: isExpanded ? 'scale(1.02)' : 'scale(1)'
        }}>

            {/* Admin Delete Idea Button */}
            {isAdmin && (
                <button
                    onClick={() => onDelete(idea.id)}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        color: '#ef4444',
                        opacity: 0.5,
                        transition: 'opacity 0.2s'
                    }}
                    className="hover-opacity-100"
                    title="Delete Idea"
                >
                    <Trash2 size={20} />
                </button>
            )}

            {/* Vote Section */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '46px' }}>
                <button
                    onClick={handleVote}
                    style={{
                        color: idea.userVoted ? 'var(--secondary)' : 'var(--text-muted)',
                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        transform: idea.userVoted ? 'scale(1.2) translateY(-2px)' : 'scale(1)'
                    }}
                    className="vote-btn"
                >
                    <ArrowBigUp size={36} fill={idea.userVoted ? 'currentColor' : 'none'} />
                </button>
                <span style={{
                    fontWeight: '800',
                    fontSize: '1.2rem',
                    marginTop: '0.2rem',
                    color: idea.userVoted ? 'var(--secondary)' : 'var(--text-primary)'
                }}>
                    {idea.votes}
                </span>

                {isAdmin && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onResetVotes(idea.id);
                        }}
                        style={{ marginTop: '0.75rem', color: 'var(--text-muted)', opacity: 0.4 }}
                        title="Reset Votes"
                        className="hover-opacity-100"
                    >
                        <RotateCcw size={14} />
                    </button>
                )}
            </div>

            {/* Content Section */}
            <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)', paddingRight: isAdmin ? '2rem' : '0' }}>{idea.title}</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.6', fontSize: '1.05rem' }}>
                    {idea.description}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                        <div style={{
                            width: '1.25rem',
                            height: '1.25rem',
                            borderRadius: '4px',
                            background: getAvatarColor(idea.author),
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem',
                            color: 'white',
                            fontWeight: 'bold'
                        }}>
                            {(idea.author || 'A')[0].toUpperCase()}
                        </div>
                        Submitted by {idea.author || 'Anonymous'}
                    </span>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: isExpanded ? 'var(--primary)' : 'inherit',
                            transition: 'all 0.2s'
                        }}
                        className="hover-text-primary"
                    >
                        <MessageSquare size={16} />
                        {idea.comments.length} {idea.comments.length === 1 ? 'Comment' : 'Comments'}
                    </button>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={16} />
                        {formatDate(idea.timestamp)} ({getRelativeTime(idea.timestamp)})
                    </span>
                </div>

                {/* Comments Section */}
                {isExpanded && (
                    <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)', animation: 'fadeIn 0.3s ease-out' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
                            {idea.comments.map((comment) => (
                                <div key={comment.id} style={{ display: 'flex', gap: '0.75rem' }}>
                                    <div style={{
                                        width: '2.5rem',
                                        height: '2.5rem',
                                        borderRadius: '12px',
                                        background: getAvatarColor(comment.author),
                                        flexShrink: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1rem',
                                        fontWeight: 'bold',
                                        color: 'white',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}>
                                        {(comment.author || 'A')[0].toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                                <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{comment.author || 'Anonymous'}</span> • {formatDate(comment.timestamp)} ({getRelativeTime(comment.timestamp)})
                                            </div>
                                            {isAdmin && (
                                                <button
                                                    onClick={() => onDeleteComment(idea.id, comment.id)}
                                                    style={{ color: '#ef4444', opacity: 0.4 }}
                                                    className="hover-opacity-100"
                                                    title="Delete Comment"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                                            {comment.text}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {idea.comments.length === 0 && (
                                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '1rem' }}>No comments yet. Be the first to share your thoughts!</p>
                            )}
                        </div>

                        <form onSubmit={handleCommentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flexShrink: 0 }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: emailError ? '#ef4444' : 'var(--text-muted)', marginBottom: '0.4rem', marginLeft: '0.25rem' }}>
                                        {emailError ? 'Invalid Email' : 'Email Address'}
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
                                        style={{ width: '220px', borderColor: emailError ? '#ef4444' : '' }}
                                        required
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem', marginLeft: '0.25rem' }}>Comment</label>
                                    <input
                                        type="text"
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Add a comment..."
                                        className="input-field"
                                        style={{ width: '100%' }}
                                        required
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button type="submit" className="btn-secondary" style={{ background: 'var(--primary)', color: 'white', border: 'none' }}>
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
