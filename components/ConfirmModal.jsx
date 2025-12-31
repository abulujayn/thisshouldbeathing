'use client';
import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

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
            zIndex: 1100, // Higher than other modals
            padding: '1rem'
        }} onClick={onCancel}>
            <div
                className="glass-panel"
                style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '2rem',
                    background: '#0f172a',
                    position: 'relative',
                    border: '1px solid rgba(255,255,255,0.1)',
                    textAlign: 'center'
                }}
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onCancel}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-muted)' }}
                >
                    <X size={20} />
                </button>

                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '50%',
                    color: '#ef4444',
                    marginBottom: '1.5rem'
                }}>
                    <AlertCircle size={32} />
                </div>

                <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>{title || 'Are you sure?'}</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{message}</p>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button
                        onClick={onCancel}
                        className="btn-secondary"
                        style={{ flex: 1 }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onCancel();
                        }}
                        className="btn-primary"
                        style={{ flex: 1, background: '#ef4444', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
