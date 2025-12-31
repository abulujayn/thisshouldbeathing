'use client';
import React, { useState } from 'react';
import { X, Shield } from 'lucide-react';

const LoginModal = ({ isOpen, onClose, onLogin }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password === 'admin') {
            onLogin();
            setPassword('');
            setError(false);
            onClose();
        } else {
            setError(true);
            setPassword('');
        }
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
                    maxWidth: '400px',
                    padding: '2rem',
                    background: '#0f172a',
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
                        <Shield size={24} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>Admin Login</h2>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                            Enter Password
                        </label>
                        <input
                            autoFocus
                            type="password"
                            placeholder="••••••••"
                            className="input-field"
                            value={password}
                            onChange={e => {
                                setPassword(e.target.value);
                                setError(false);
                            }}
                            style={{ fontSize: '1.1rem', border: error ? '1px solid #ef4444' : '1px solid var(--glass-border)' }}
                        />
                        {error && (
                            <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                                Incorrect password. Please try again.
                            </p>
                        )}
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;
