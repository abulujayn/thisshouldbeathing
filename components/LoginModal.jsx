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
            background: 'rgba(5, 8, 20, 0.75)',
            backdropFilter: 'blur(8px)',
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
                    style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', color: 'var(--text-muted)' }}
                >
                    <X size={20} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                    <div style={{ padding: '0.6rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '10px', color: '#8b5cf6' }}>
                        <Shield size={28} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', fontWeight: '700' }}>Admin Login</h2>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>
                            Password
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
                            <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                Incorrect password. Try 'admin'.
                            </p>
                        )}
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;
