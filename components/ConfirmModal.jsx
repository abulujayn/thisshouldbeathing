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
            background: 'rgba(5, 8, 20, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100, // Higher than other modals
            padding: '1.5rem'
        }} onClick={onCancel}>
            <div
                className="glass-panel"
                style={{
                    width: '100%',
                    maxWidth: '420px',
                    padding: '2.5rem',
                    background: '#0f172a',
                    position: 'relative',
                    border: '1px solid rgba(255,255,255,0.1)',
                    textAlign: 'center',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    animation: 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onCancel}
                    style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', color: 'var(--text-muted)' }}
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
                    marginBottom: '1.5rem',
                    boxShadow: '0 0 20px rgba(239, 68, 68, 0.1)'
                }}>
                    <AlertCircle size={36} strokeWidth={1.5} />
                </div>

                <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.75rem', fontWeight: '700' }}>{title || 'Are you sure?'}</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2.25rem', lineHeight: '1.6' }}>{message}</p>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={onCancel}
                        className="btn-secondary"
                        style={{ flex: 1, padding: '0.75rem' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onCancel();
                        }}
                        className="btn-primary"
                        style={{
                            flex: 1,
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                            padding: '0.75rem'
                        }}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
