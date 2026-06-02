export default function Modal({ isOpen, title, onClose, onConfirm, children }) {
    if (!isOpen) return null

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '30px',
                width: '100%',
                maxWidth: '480px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>{title}</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '20px',
                            cursor: 'pointer',
                            color: '#777'
                        }}
                    >
                        ✕
                    </button>
                </div>

                <div style={{ marginBottom: '25px' }}>
                    {children}
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" onClick={onClose}>
                        Annuler
                    </button>
                    {onConfirm && (
                        <button className="btn btn-primary" onClick={onConfirm}>
                            Confirmer
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}