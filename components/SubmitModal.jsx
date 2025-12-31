'use client';
import React, { useState } from 'react';
import { X, Lightbulb } from 'lucide-react';

const SubmitModal = ({ isOpen, onClose, onSubmit, userEmail, onEmailChange }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [emailError, setEmailError] = useState(false);

    if (!isOpen) return null;

    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateEmail(userEmail)) {
            setEmailError(true);
            return;
        }

        setEmailError(false);
        if (!title.trim() || !description.trim()) return;

        onSubmit({ title, description, author: userEmail });
        setTitle('');
        setDescription('');
        onClose();
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(5, 8, 20, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem'
        }} onClick={onClose}>
            <div
                className="glass-panel"
                style={{
                    width: '100%',
                    maxWidth: '560px',
                    padding: '2.5rem',
                    background: '#0f172a',
                    position: 'relative',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    animation: 'fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1.25rem',
                        right: '1.25rem',
                        color: 'var(--text-muted)',
                        padding: '8px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.05)'
                    }}
                    className="hover-text-primary"
                >
                    <X size={20} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{
                        padding: '0.75rem',
                        background: 'rgba(139, 92, 246, 0.1)',
                        borderRadius: '12px',
                        color: '#8b5cf6',
                        boxShadow: 'inset 0 0 12px rgba(139, 92, 246, 0.2)'
                    }}>
                        <Lightbulb size={28} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Submit an Idea</h2>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Share your vision with the community.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{
                            display: 'block',
                            color: emailError ? '#ef4444' : 'var(--text-secondary)',
                            marginBottom: '0.6rem',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            {emailError ? 'Please enter a valid email' : 'Your Email'}
                        </label>
                        <input
                            autoFocus
                            type="email"
                            placeholder="you@example.com"
                            className="input-field"
                            value={userEmail}
                            onChange={(e) => {
                                onEmailChange(e.target.value);
                                if (emailError) setEmailError(false);
                            }}
                            style={{ borderColor: emailError ? '#ef4444' : '', fontSize: '1.05rem' }}
                            required
                        />
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            color: 'var(--text-secondary)',
                            marginBottom: '0.6rem',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            What's the idea?
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Smart plant tracker"
                            className="input-field"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            style={{ fontSize: '1.1rem' }}
                            required
                        />
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            color: 'var(--text-secondary)',
                            marginBottom: '0.6rem',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            How would it work?
                        </label>
                        <textarea
                            rows={4}
                            placeholder="Describe user features, the problem it solves, etc..."
                            className="input-field"
                            style={{ resize: 'vertical', minHeight: '120px', fontSize: '1.05rem', lineHeight: '1.6' }}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" style={{ padding: '0.75rem 2rem' }}>
                            Submit Idea
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubmitModal;
