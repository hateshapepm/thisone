import React, { useState, useRef } from 'react';
import { AnsiUp } from 'ansi_up';
import '../../styles/Dashboard.css';

const SLS_COMMANDS = [
    { value: 'update-channels', label: 'Update Channels', description: 'Update the list of channels' },
    { value: 'download-files', label: 'Download Files', description: 'Download new files from channels' },
    { value: 'process-files', label: 'Process Files', description: 'Process downloaded files' },
];

const ADVANCED_COMMANDS = [
    { value: 'download-by-id', label: 'Download by File ID', description: 'Download a specific file by ID' },
    { value: 'process-file', label: 'Process File', description: 'Process a specific file by ID' },
    { value: 'query', label: 'Query', description: 'Run pre-defined database query' },
    { value: 'channel-enum', label: 'Channel Enum', description: 'Enumerate channel information' },
];

const SLSExecutionNew = () => {
    const [mode, setMode] = useState('update-channels');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ message: '', visible: false, isError: false });
    const [verbose, setVerbose] = useState(true);
    const [liveOutput, setLiveOutput] = useState(false);
    const [previewEnabled, setPreviewEnabled] = useState(true);
    const [channel, setChannel] = useState('');
    const [limit, setLimit] = useState('');
    const [fileId, setFileId] = useState('');
    const [manual, setManual] = useState(false);
    const [autoClear, setAutoClear] = useState(false);
    const [error, setError] = useState('');
    const [showOutputModal, setShowOutputModal] = useState(false);
    const outputEndRef = useRef(null);

    // Helper for task description
    const getTaskDescription = () => {
        if (showAdvanced && ADVANCED_COMMANDS.map(c => c.value).includes(mode)) {
            const adv = ADVANCED_COMMANDS.find(cmd => cmd.value === mode);
            return adv ? adv.description : '';
        }
        const cmd = SLS_COMMANDS.find(cmd => cmd.value === mode);
        return cmd ? cmd.description : '';
    };

    // Build the preview command
    const buildPreviewCommand = () => {
        let args = [];
        if (verbose) args.push('-v');
        if (mode === 'update-channels') {
            args.push('-uc');
        } else if (mode === 'download-files') {
            args.push('-d');
        } else if (mode === 'process-files') {
            args.push('-p');
        }
        return `. /home/dd/my/codes/sls/sls/bin/activate && python3 /home/dd/my/codes/sls/sls.py${args.length ? ' ' : ''}${args.join(' ')} && deactivate`;
    };

    // Notification helper
    const showNotification = (message, isError = false) => {
        setNotification({ message, visible: true, isError });
        setTimeout(() => setNotification(prev => ({ ...prev, visible: false })), 3000);
    };

    // Render output with ANSI colors
    const ansiUp = new AnsiUp();
    const renderTerminalOutput = (text) => {
        return (
            <div style={{ fontFamily: 'monospace', fontSize: 15, whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.5, padding: 10 }} dangerouslySetInnerHTML={{ __html: ansiUp.ansi_to_html(text) }} />
        );
    };

    return (
        <div className="programs-container">
            <div className="programs-metrics">
                <div style={{ gridColumn: 'span 6' }}>
                    <div className="programs-table deep-content-space">
                        <form className="dashboard-form deep-form">
                            <div className="form-group">
                                <label className="deep-label">Mode</label>
                                <div className="deep-mode-btns">
                                    {SLS_COMMANDS.map(cmd => (
                                        <button
                                            type="button"
                                            key={cmd.value}
                                            className={`toggle-btn${mode === cmd.value && !showAdvanced ? ' enabled' : ''}`}
                                            onClick={() => {
                                                setMode(cmd.value);
                                                setShowAdvanced(false);
                                            }}
                                            aria-pressed={mode === cmd.value && !showAdvanced}
                                        >
                                            {cmd.label}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        className={`toggle-btn${showAdvanced ? ' enabled' : ''}`}
                                        onClick={() => {
                                            setShowAdvanced(true);
                                            setMode('download-by-id');
                                        }}
                                        aria-pressed={showAdvanced}
                                    >
                                        Advanced
                                    </button>
                                </div>
                            </div>
                            {showAdvanced && (
                                <div className="form-group">
                                    <label className="deep-label">Category</label>
                                    <div className="deep-mode-btns">
                                        {ADVANCED_COMMANDS.map(cmd => (
                                            <button
                                                type="button"
                                                key={cmd.value}
                                                className={`toggle-btn${mode === cmd.value ? ' enabled' : ''}`}
                                                onClick={() => setMode(cmd.value)}
                                                aria-pressed={mode === cmd.value}
                                            >
                                                {cmd.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {mode === 'download-files' && (
                                <div className="form-group" style={{ width: '50%', marginBottom: 24 }}>
                                    <label>Channel Name</label>
                                    <input
                                        type="text"
                                        value={channel}
                                        onChange={e => setChannel(e.target.value)}
                                        placeholder="Enter channel name"
                                        className="deep-input"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            )}
                            <div className="form-group">
                                <label className="deep-label">Options</label>
                                <div className="deep-mode-btns" style={{ marginTop: 4 }}>
                                    <button type="button" className={`toggle-btn${verbose ? ' enabled' : ''}`} onClick={() => setVerbose(v => !v)}>Verbose (-v)</button>
                                    <button type="button" className={`toggle-btn${liveOutput ? ' enabled' : ''}`} onClick={() => setLiveOutput(v => !v)}>Live Output</button>
                                    <button type="button" className={`toggle-btn${previewEnabled ? ' enabled' : ''}`} onClick={() => setPreviewEnabled(v => !v)}>Preview</button>
                                </div>
                            </div>
                            {previewEnabled && (
                                <div className="form-group" style={{ marginTop: 18, marginBottom: 24 }}>
                                    <label className="deep-label">Command Preview</label>
                                    <div style={{ width: '50%', marginTop: 8 }}>
                                        <input
                                            type="text"
                                            className="deep-input"
                                            style={{
                                                width: '100%',
                                                fontFamily: 'monospace',
                                                color: '#eee',
                                                fontWeight: 600,
                                                border: '1px solid var(--primary)',
                                                cursor: 'pointer',
                                                height: 40,
                                                padding: '8px 12px'
                                            }}
                                            value={buildPreviewCommand()}
                                            readOnly
                                            onClick={() => {
                                                navigator.clipboard.writeText(buildPreviewCommand());
                                                showNotification('Copied command to clipboard');
                                            }}
                                            title="Click to copy command"
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <button
                                    type="submit"
                                    className="dashboard-btn deep-submit-btn"
                                    disabled={loading}
                                >
                                    {loading ? 'Running...' : 'Run SLS'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {liveOutput && (
                <div className="programs-table deep-content-space-cli">
                    <div className="deep-terminal-container">
                        <div className="deep-terminal-output">
                            {output ? renderTerminalOutput(output) :
                                <div style={{ color: '#888', padding: '10px' }}>Terminal output will appear here when you run the command...</div>
                            }
                        </div>
                    </div>
                </div>
            )}
            <div className="form-group" style={{ marginTop: 24, marginBottom: 0 }}>
                <label className="deep-label">Task Description</label>
                <div className="mt-8 text-cyan fw-600">
                    {getTaskDescription()}
                </div>
            </div>
            {notification.visible && (
                <div className={`notification${notification.isError ? ' notification-error' : ''}`} style={{
                    position: 'absolute',
                    top: 18,
                    right: 18,
                    background: notification.isError ? '#ff3b3b' : '#1ed760',
                    color: notification.isError ? '#fff' : '#181c20',
                    padding: '10px 18px',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 15,
                    boxShadow: '0 2px 8px #0006',
                    zIndex: 100,
                    minWidth: 180,
                    textAlign: 'center',
                    opacity: notification.visible ? 1 : 0,
                    transition: 'opacity 0.3s',
                }}>{notification.message}</div>
            )}
        </div>
    );
};

export default SLSExecutionNew; 