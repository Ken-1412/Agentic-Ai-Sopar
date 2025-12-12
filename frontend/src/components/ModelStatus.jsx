import { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import '../styles/Dashboard.css';

const ModelStatus = ({ onTrain }) => {
    const { user, token } = useAuthStore();
    const [training, setTraining] = useState(false);
    const [statusInfo, setStatusInfo] = useState(null);

    useEffect(() => {
        fetchStatus();
    }, [user]);

    const fetchStatus = async () => {
        if (!token) return;

        try {
            const res = await fetch('http://localhost:3001/api/training/status', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setStatusInfo(data);
            }
        } catch (error) {
            console.error('Error fetching status:', error);
        }
    };

    const handleTrain = async () => {
        setTraining(true);
        try {
            await onTrain();
            setTimeout(() => {
                fetchStatus();
                setTraining(false);
            }, 1000);
        } catch (error) {
            console.error('Training error:', error);
            setTraining(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    const isTrained = user?.modelTrained && statusInfo?.modelExists;
    const needsRetraining = statusInfo?.needsRetraining;

    return (
        <div className="model-status-card">
            <h3 className="model-status-title">
                <span className="emoji">🤖</span>
                Your AI Model
            </h3>

            <div className="status-indicator">
                <div className={`status-dot ${isTrained ? 'trained' : 'untrained'}`}></div>
                <span className="status-text">
                    {training ? 'Training...' : isTrained ? 'Trained' : 'Not Trained'}
                </span>
            </div>

            {isTrained && (
                <div className="status-info">
                    <div className="status-row">
                        <span className="status-label">Last Updated:</span>
                        <span className="status-value">{formatDate(user.lastTrainedAt)}</span>
                    </div>
                    <div className="status-row">
                        <span className="status-label">Model File:</span>
                        <span className="status-value">✓ Exists</span>
                    </div>
                </div>
            )}

            {!isTrained && user?.preferences?.tastes?.length === 0 && (
                <div className="status-warning">
                    <span className="warning-icon">⚠️</span>
                    Add at least one taste preference before training
                </div>
            )}

            <button
                onClick={handleTrain}
                disabled={training || user?.preferences?.tastes?.length === 0}
                className={`train-model-btn ${needsRetraining ? 'retrain' : ''}`}
            >
                {training ? (
                    <>
                        <span className="spinner-small"></span>
                        Training Model...
                    </>
                ) : needsRetraining ? (
                    <>🔄 Retrain Model</>
                ) : isTrained ? (
                    <>🔄 Retrain Model</>
                ) : (
                    <>🚀 Train Model</>
                )}
            </button>

            {training && (
                <div className="training-progress">
                    <div className="progress-bar">
                        <div className="progress-fill"></div>
                    </div>
                    <p className="progress-text">Training your personalized model...</p>
                </div>
            )}
        </div>
    );
};

export default ModelStatus;
