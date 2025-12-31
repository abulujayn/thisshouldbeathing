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
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        }} onClick={onClose}>
            <div
                className="glass-panel"
                style={{
                    width: '100%',
                    maxWidth: '500px',
                    padding: '2rem',
                    background: '#0f172a', /* Fallback/Solid for readability */
                    position: 'relative',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-muted)' }}
                >
                    <X size={24} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '0.5rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px', color: '#8b5cf6' }}>
                        <Lightbulb size={24} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>Submit an Idea</h2>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', color: emailError ? '#ef4444' : 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
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
                            style={{ borderColor: emailError ? '#ef4444' : '' }}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
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
                        <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                            How would it work?
                        </label>
                        <textarea
                            rows={4}
                            placeholder="Describe user features, the problem it solves, etc..."
                            className="input-field"
                            style={{ resize: 'vertical' }}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            Submit Idea
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubmitModal;
