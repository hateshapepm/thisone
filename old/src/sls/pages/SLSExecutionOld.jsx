import React, { useState, useEffect, useRef } from 'react';
import { AnsiUp } from 'ansi_up';
import '../../styles/Dashboard.css';

const SLS_COMMANDS = [
    {value: 'update-channels', label: 'Update Channels', description: 'Update the list of channels'},
    {value: 'download-files', label: 'Download Files', description: 'Download new files from channels'},
    {value: 'process-files', label: 'Process Files', description: 'Process downloaded files'},
];

const QUERY_TYPES = [
    {value: 'p', label: 'Programs'},
    {value: 'f', label: 'TG Files'},
    {value: 'ch', label: 'TG Channels'},
    {value: 'c', label: 'Credentials'},
    {value: 'pc', label: 'Program Credentials'},
    {value: 's', label: 'Stats'},
    {value: 'hv', label: 'High Value'},
    {value: 'cs', label: 'Channel Stats'},
    {value: 't', label: 'TPLS'},
    {value: 'r', label: 'Raw Query'},
    {value: 'sc', label: 'Schema'},
    {value: 'wc', label: 'Working Credentials'},
];

const ADVANCED_COMMANDS = [
    {value: 'download-by-id', label: 'Download by File ID', description: 'Download a specific file by ID'},
    {value: 'process-file', label: 'Process File', description: 'Process a specific file by ID'},
    {value: 'query', label: 'Query', description: 'Run pre-defined database query'},
    {value: 'channel-enum', label: 'Channel Enum', description: 'Enumerate channel information'},
];

// Define which options are valid for each command
const COMMAND_OPTIONS = {
    'update-channels': ['verbose'],
    'download-files': ['verbose', 'downloadOnly', 'channel', 'limit', 'liveOutput', 'autoClear', 'preview'],
    'process-files': ['verbose', 'manual', 'channel', 'limit', 'liveOutput', 'autoClear', 'preview'],
    'download-by-id': ['fileId', 'liveOutput', 'autoClear', 'preview'],
    'process-file': ['fileId', 'manual', 'liveOutput', 'autoClear', 'preview'],
    'query': ['queryType', 'limit', 'rawQuery', 'preview'],
    'channel-enum': ['channel', 'verbose', 'preview'],
};

const SLSExecution = () => {
    const [selectedCommand, setSelectedCommand] = useState('update-channels');
    const [verbose, setVerbose] = useState(true);
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showOutputModal, setShowOutputModal] = useState(false);
    const [notification, setNotification] = useState({message: '', visible: false, isError: false});
    const [summary, setSummary] = useState(null);
    const [limit, setLimit] = useState('');
    const [queryType, setQueryType] = useState('');
    const [rawQuery, setRawQuery] = useState('');
    const [fileId, setFileId] = useState('');
    const [manual, setManual] = useState(false);
    const [channel, setChannel] = useState('');
    const [downloadOnly, setDownloadOnly] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [limitEnabled, setLimitEnabled] = useState(false);
    const [previewEnabled, setPreviewEnabled] = useState(true);
    const [fileIdEnabled, setFileIdEnabled] = useState(false);
    const [manualEnabled, setManualEnabled] = useState(false);
    const [channelEnabled, setChannelEnabled] = useState(false);
    const [liveOutput, setLiveOutput] = useState(false);
    const [autoClear, setAutoClear] = useState(false);
    const wsRef = useRef(null);
    const terminalRef = useRef(null);
    const outputEndRef = useRef(null);

    // Move fetchSummary outside useEffect so it can be called elsewhere
    const fetchSummary = async () => {
        try {
            const [filesRes, alertsRes] = await Promise.all([
                fetch('/api/sls/tg-files-metrics').then(r => r.json()),
                fetch('/api/sls/alerts/counts').then(r => r.json()),
            ]);
            setSummary({...filesRes, ...alertsRes});
        } catch (e) {
            setSummary(null);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, []);

    // Function to handle auto-scrolling of terminal output
    useEffect(() => {
        if (outputEndRef.current && liveOutput) {
            outputEndRef.current.scrollIntoView({behavior: 'smooth'});
        }
    }, [output, liveOutput]);

    const showNotification = (message, isError = false) => {
        setNotification({message, visible: true, isError});
        setTimeout(() => setNotification(prev => ({...prev, visible: false})), 3000);
    };

    // WebSocket live output handler
    const handleLiveRun = (commandStr) => {
        setOutput('');
        setError('');
        setShowOutputModal(false);
        setLoading(true);
        if (wsRef.current) {
            wsRef.current.close();
        }
        const ws = new window.WebSocket(`ws://${window.location.hostname}:5000/ws/terminal`);
        wsRef.current = ws;
        ws.onopen = () => {
            ws.send(JSON.stringify({type: 'run', command: commandStr}));
        };
        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type === 'output') {
                setOutput(prev => {
                    // Split previous output into lines
                    let lines = prev.split('\n');
                    // Remove any trailing empty lines
                    while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();

                    // Detect if the new message is a progress block
                    const isProgress = msg.data.includes('raw_extract:') || msg.data.includes('lines/sec');
                    if (isProgress) {
                        // Remove previous progress block (last lines matching progress patterns)
                        while (
                            lines.length &&
                            (lines[lines.length - 1].includes('raw_extract:') || lines[lines.length - 1].includes('lines/sec'))
                            ) {
                            lines.pop();
                        }
                        // Add the new progress line
                        lines.push(msg.data);
                        return lines.join('\n');
                    } else {
                        // Normal output, append
                        return prev + (prev.endsWith('\n') ? '' : '\n') + msg.data;
                    }
                });
            } else if (msg.type === 'end') {
                setLoading(false);
                setShowOutputModal(true);
                ws.close();
                // Clear output automatically if autoClear is enabled
                if (autoClear) {
                    setTimeout(() => {
                        setOutput('');
                        setShowOutputModal(false);
                    }, 3000); // Clear after 3 seconds
                }
            } else if (msg.type === 'error') {
                setError(msg.error);
                setLoading(false);
                setShowOutputModal(true);
                ws.close();
            }
        };
        ws.onerror = (e) => {
            setError('WebSocket error');
            setLoading(false);
            setShowOutputModal(true);
        };
        ws.onclose = () => {
            wsRef.current = null;
            setLoading(false);
        };
    };

    const runSLS = async (e) => {
        e.preventDefault();
        setOutput('');
        setError('');
        setShowOutputModal(false);
        // Build the command string for live output
        const commandStr = buildPreviewCommand();
        if (liveOutput) {
            handleLiveRun(commandStr);
            return;
        }
        try {
            let command = selectedCommand;
            // Advanced commands override
            if (showAdvanced && ADVANCED_COMMANDS.map(c => c.value).includes(selectedCommand)) {
                command = selectedCommand;
            }
            const body = {
                command,
                limit: (limitEnabled && limit) ? Number(limit) : undefined,
                query: queryType || undefined,
                rawQuery: rawQuery || undefined,
                fileId: (fileIdEnabled && fileId) ? fileId : undefined,
                manual: manualEnabled ? true : undefined,
                channel: (channelEnabled && channel) ? channel : undefined,
                downloadOnly: downloadOnly || undefined,
                verbose,
            };
            const res = await fetch('/api/sls/launcher/run', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (data.success) {
                setOutput(data.output);
                setShowOutputModal(true);
                // Clear output automatically if autoClear is enabled
                if (autoClear) {
                    setTimeout(() => {
                        setOutput('');
                        setShowOutputModal(false);
                    }, 3000); // Clear after 3 seconds
                }
            } else {
                setError(data.error || 'Unknown error');
                setOutput(data.output || '');
                setShowOutputModal(true);
            }
        } catch (e) {
            setError(e.message);
            setShowOutputModal(true);
        } finally {
            fetchSummary(); // Refresh stats after run completes
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        showNotification('Output copied to clipboard');
    };

    const handleClear = () => {
        setOutput('');
        setError('');
        setShowOutputModal(false);
    };

    // Helper to determine if limit should be shown
    const canEnableLimit =
        (selectedCommand === 'download-files' || selectedCommand === 'process-files') ||
        (showAdvanced && (selectedCommand === 'query'));
    const showLimit = canEnableLimit && limitEnabled;
    const showQueryType = showAdvanced && selectedCommand === 'query';
    const showRawQuery = showQueryType && queryType === 'r';
    const showFileId = showAdvanced && (selectedCommand === 'download-by-id' || selectedCommand === 'process-file');
    const showManual = showAdvanced && selectedCommand === 'process-file';
    const showChannel = showAdvanced && (selectedCommand === 'channel-enum' || selectedCommand === 'download-files' || selectedCommand === 'process-files');
    const showDownloadOnly = selectedCommand === 'download-files';

    // Helper to get the current task description
    const getTaskDescription = () => {
        if (showAdvanced && ADVANCED_COMMANDS.map(c => c.value).includes(selectedCommand)) {
            const adv = ADVANCED_COMMANDS.find(cmd => cmd.value === selectedCommand);
            return adv ? adv.description : '';
        }
        const cmd = SLS_COMMANDS.find(cmd => cmd.value === selectedCommand);
        return cmd ? cmd.description : '';
    };

    // Build the preview command
    const buildPreviewCommand = () => {
        let args = [];
        let command = selectedCommand;
        if (showAdvanced && ADVANCED_COMMANDS.map(c => c.value).includes(selectedCommand)) {
            command = selectedCommand;
        }
        if (verbose) args.push('-v');
        if (command === 'update-channels') {
            args.push('-uc');
            if (channelEnabled && channel) args.push('-c', channel);
        } else if (command === 'download-files') {
            args.push('-d');
            if (downloadOnly) args.push('-do');
            if (limitEnabled && limit) args.push('-l', String(limit));
            if (channelEnabled && channel) args.push('-c', channel);
        } else if (command === 'process-files') {
            args.push('-p');
            if (limitEnabled && limit) args.push('-l', String(limit));
            if (manualEnabled) args.push('-m');
            if (channelEnabled && channel) args.push('-c', channel);
        } else if (command === 'download-by-id') {
            if (fileIdEnabled && fileId) args.push('-di', String(fileId));
        } else if (command === 'process-file') {
            if (fileIdEnabled && fileId) args.push('-f', String(fileId));
            if (manualEnabled) args.push('-m');
        } else if (command === 'query') {
            if (queryType) args.push('-q', queryType);
            if (limitEnabled && limit) args.push('-l', String(limit));
            if (rawQuery) args.push('-qr', rawQuery);
        } else if (command === 'channel-enum') {
            args.push('-ce');
            if (channelEnabled && channel) args.push('-c', channel);
        }
        return `. /home/dd/my/codes/sls/sls/bin/activate && python3 /home/dd/my/codes/sls/sls.py${args.length ? ' ' : ''}${args.join(' ')} && deactivate`;
    };

    // Render output with ANSI colors
    const ansiUp = new AnsiUp();
    const renderTerminalOutput = (text) => {
        return (
            <div className="terminal-output-box">
                <div dangerouslySetInnerHTML={{__html: ansiUp.ansi_to_html(text)}}/>
                <div ref={outputEndRef} className="h-1"/>
            </div>
        );
    };

    // Always show Live Output button
    const commandOptions = COMMAND_OPTIONS[selectedCommand]
        ? Array.from(new Set([...COMMAND_OPTIONS[selectedCommand], 'liveOutput']))
        : ['liveOutput'];

    return (
        <div className="programs-metrics">
            <div className="programs-table deep-content-space">
                <form className="dashboard-form deep-form" onSubmit={runSLS}>
                    {/* Mode Section */}
                    <div className="form-group">
                        <label className="deep-label">Mode</label>
                        <div className="deep-mode-btns">
                            {SLS_COMMANDS.map(cmd => (
                                <button
                                    type="button"
                                    key={cmd.value}
                                    className={`toggle-btn${selectedCommand === cmd.value && !showAdvanced ? ' enabled' : ''}`}
                                    onClick={() => {
                                        setSelectedCommand(cmd.value);
                                        setShowAdvanced(false);
                                    }}
                                    aria-pressed={selectedCommand === cmd.value && !showAdvanced}
                                >
                                    {cmd.label}
                                </button>
                            ))}
                            <button
                                type="button"
                                className={`toggle-btn${showAdvanced ? ' enabled' : ''}`}
                                onClick={() => {
                                    setShowAdvanced(true);
                                    setSelectedCommand('download-by-id');
                                }}
                                aria-pressed={showAdvanced}
                            >
                                Advanced
                            </button>
                        </div>
                    </div>
                    {/* Advanced Category Section */}
                    {showAdvanced && (
                        <div className="form-group">
                            <label className="deep-label">Category</label>
                            <div className="deep-mode-btns">
                                {ADVANCED_COMMANDS.map(cmd => (
                                    <button
                                        type="button"
                                        key={cmd.value}
                                        className={`toggle-btn${selectedCommand === cmd.value ? ' enabled' : ''}`}
                                        onClick={() => {
                                            setSelectedCommand(cmd.value);
                                            setFileIdEnabled(false);
                                            setManualEnabled(false);
                                            setChannelEnabled(false);
                                            setLimitEnabled(false);
                                            setFileId('');
                                            setManual(false);
                                            setChannel('');
                                            setLimit('');
                                        }}
                                        aria-pressed={selectedCommand === cmd.value}
                                    >
                                        {cmd.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* Channel, FileId, QueryType, RawQuery, Limit fields (50% width) */}
                    {showChannel && (
                        <div className="form-group" style={{ width: '50%', marginBottom: 24 }}>
                            <label>Channel Name</label>
                            <input
                                type="text"
                                value={channel}
                                onChange={e => setChannel(e.target.value)}
                                placeholder="Enter channel name"
                                required={manualEnabled}
                                className="deep-input"
                                style={{ width: '100%' }}
                            />
                        </div>
                    )}
                    {showFileId && (
                        <div className="form-group" style={{ width: '50%', marginBottom: 24 }}>
                            <label>File ID</label>
                            <input
                                type="text"
                                value={fileId}
                                onChange={e => setFileId(e.target.value)}
                                placeholder="Enter file ID"
                                required
                                className="deep-input"
                                style={{ width: '100%' }}
                            />
                        </div>
                    )}
                    {showQueryType && (
                        <div className="form-group" style={{ width: '50%', marginBottom: 24 }}>
                            <label>Query Type</label>
                            <select
                                value={queryType}
                                onChange={e => setQueryType(e.target.value)}
                                required
                                className="deep-input"
                                style={{ width: '100%' }}
                            >
                                <option value="">Select Query Type</option>
                                {QUERY_TYPES.map(q => (
                                    <option key={q.value} value={q.value}>{q.label}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    {showRawQuery && (
                        <div className="form-group" style={{ width: '50%', marginBottom: 24 }}>
                            <label>Raw SQL Query</label>
                            <textarea
                                value={rawQuery}
                                onChange={e => setRawQuery(e.target.value)}
                                placeholder="SELECT * FROM ..."
                                className="deep-input"
                                style={{ width: '100%' }}
                            />
                        </div>
                    )}
                    {showLimit && (
                        <div className="form-group" style={{ width: '50%', marginBottom: 24 }}>
                            <label>Limit</label>
                            <input
                                type="number"
                                min="1"
                                value={limit}
                                onChange={e => setLimit(e.target.value)}
                                placeholder="e.g. 10"
                                className="deep-input"
                                style={{ width: '100%' }}
                            />
                        </div>
                    )}
                    {/* Options Section */}
                    <div className="form-group">
                        <label className="deep-label">Options</label>
                        <div className="deep-mode-btns" style={{ marginTop: 4, flexWrap: 'wrap' }}>
                            {commandOptions.includes('verbose') && (
                                <button type="button" className={`toggle-btn${verbose ? ' enabled' : ''}`}
                                        onClick={() => setVerbose(v => !v)}>Verbose (-v)</button>
                            )}
                            {commandOptions.includes('downloadOnly') && (
                                <button type="button" className={`toggle-btn${downloadOnly ? ' enabled' : ''}`}
                                        onClick={() => setDownloadOnly(v => !v)}>Download Only (-do)</button>
                            )}
                            {commandOptions.includes('manual') && (
                                <button type="button" className={`toggle-btn${manualEnabled ? ' enabled' : ''}`}
                                        onClick={() => setManualEnabled(v => !v)}>Manual (-m)</button>
                            )}
                            {commandOptions.includes('liveOutput') && (
                                <button type="button" className={`toggle-btn${liveOutput ? ' enabled' : ''}`}
                                        onClick={() => setLiveOutput(v => !v)}>Live Output</button>
                            )}
                            {commandOptions.includes('autoClear') && (
                                <button type="button" className={`toggle-btn${autoClear ? ' enabled' : ''}`}
                                        onClick={() => setAutoClear(v => !v)}>Auto Clear</button>
                            )}
                            {commandOptions.includes('preview') && (
                                <button type="button"
                                        className={`toggle-btn${previewEnabled ? ' enabled' : ''}`}
                                        onClick={() => setPreviewEnabled(v => !v)}>Preview</button>
                            )}
                            {commandOptions.includes('channel') && (
                                <button type="button"
                                        className={`toggle-btn${channelEnabled ? ' enabled' : ''}`}
                                        onClick={() => setChannelEnabled(v => !v)}>Channel (-c)</button>
                            )}
                            {commandOptions.includes('limit') && (
                                <button type="button" className={`toggle-btn${limitEnabled ? ' enabled' : ''}`}
                                        onClick={() => setLimitEnabled(v => !v)}>Limit (-l)</button>
                            )}
                            {commandOptions.includes('fileId') && (
                                <button type="button" className={`toggle-btn${fileIdEnabled ? ' enabled' : ''}`}
                                        onClick={() => setFileIdEnabled(v => !v)}>File ID</button>
                            )}
                            {commandOptions.includes('queryType') && (
                                <button type="button" className={`toggle-btn${showQueryType ? ' enabled' : ''}`}
                                        onClick={() => setQueryType(q => q ? '' : QUERY_TYPES[0].value)}>Query
                                    Type</button>
                            )}
                            {commandOptions.includes('rawQuery') && (
                                <button type="button" className={`toggle-btn${showRawQuery ? ' enabled' : ''}`}
                                        onClick={() => setRawQuery(r => r ? '' : 'SELECT * FROM ...')}>Raw
                                    Query</button>
                            )}
                        </div>
                    </div>
                    {/* Command Preview Section */}
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
                    {/* Run Button Section */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <button
                            type="submit"
                            className="dashboard-btn deep-submit-btn"
                            disabled={loading || (manualEnabled && (!channel || channel.trim() === ''))}
                        >
                            {loading ? 'Running...' : 'Run SLS'}
                        </button>
                        {manualEnabled && (!channel || channel.trim() === '') && (
                            <div className="mt-8 text-error fw-600">
                                Channel Name is required for Manual mode
                            </div>
                        )}
                    </div>
                    {/* Task Description Section */}
                    <div className="form-group" style={{ marginTop: 24, marginBottom: 0 }}>
                        <label className="deep-label">Task Description</label>
                        <div className="mt-8 text-cyan fw-600">
                            {getTaskDescription()}
                        </div>
                    </div>
                </form>
            </div>
            {/* Terminal Output always below, full width */}
            {liveOutput && (
                <div className="programs-table deep-content-space-cli">
                    <div className="deep-terminal-container">
                        <div className="deep-terminal-output">
                            {output ? renderTerminalOutput(output) :
                                <div style={{ color: '#888', padding: '10px' }}>Terminal output will appear here when you run the command...</div>
                            }
                            {output && (
                                <div className="deep-terminal-btns">
                                    <button className="dashboard-btn deep-copy-btn" onClick={handleCopy}>Copy Output</button>
                                    <button className="dashboard-btn deep-clear-btn" onClick={handleClear}>Clear</button>
                                    {autoClear && <span className="text-success ml-10 italic">Auto-clear enabled</span>}
                                </div>
                            )}
                            {loading && <div style={{ color: '#1ed760', fontWeight: 600, marginTop: 8 }}>Live streaming...</div>}
                        </div>
                    </div>
                </div>
            )}
            {/* Modal for non-verbose output */}
            {!verbose && showOutputModal && (
                <div className="modal-overlay" onClick={handleClear}>
                    <div className="modal-content modal-content-sls-output" onClick={e => e.stopPropagation()} style={{ borderRadius: 12, padding: 32, background: '#23272e', color: '#eee', maxWidth: 600 }}>
                        <h3 style={{ color: '#1ed760', fontWeight: 700 }}>SLS Output</h3>
                        {error && <div className="error" style={{ color: '#ff3b3b', fontWeight: 600, marginBottom: 10 }}>{error}</div>}
                        <pre style={{ maxHeight: 400, overflow: 'auto', background: '#222', color: '#eee', padding: 12, borderRadius: 8 }}>{output}</pre>
                        <button className="dashboard-btn" onClick={handleCopy} style={{ marginRight: 8, borderRadius: 6, fontWeight: 600 }}>Copy Output</button>
                        <button className="dashboard-btn" onClick={handleClear} style={{ borderRadius: 6, fontWeight: 600 }}>Close</button>
                    </div>
                </div>
            )}
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

export default SLSExecution;