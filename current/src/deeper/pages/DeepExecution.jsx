import React, { useState, useEffect, useRef } from 'react';
import '../../styles/Dashboard.css';
import { AnsiUp } from 'ansi_up';
import Modal from '../../common/components/Modal';

const MODES = [
    { value: 'asn', label: 'ASN', targetLabel: 'ASN Number', placeholder: 'e.g. 15768' },
    { value: 'ipcidr', label: 'IP CIDR', targetLabel: 'CIDR Range', placeholder: 'e.g. 1.2.3.0/24' },
    { value: 'manual', label: 'Manual', targetLabel: 'Target', placeholder: 'Manual target' },
    { value: 'multi', label: 'Multi', targetLabel: 'Target', placeholder: 'Multi target' },
    { value: 'multiplan', label: 'Multiplan', targetLabel: 'Target', placeholder: 'Multiplan target' },
    { value: 'ports', label: 'Ports', targetLabel: 'Target', placeholder: 'Ports target' },
    { value: 'rdap', label: 'RDAP', targetLabel: 'ASN or CIDR', placeholder: 'ASN or CIDR' },
    { value: 'rev', label: 'Reverse', targetLabel: 'Domain or Email', placeholder: 'domain.com or email' },
    { value: 'subdomain', label: 'Subdomain', targetLabel: 'Target Domain', placeholder: '' },
    { value: 'web', label: 'Web', targetLabel: 'Target Domain', placeholder: '' },
    { value: 'whois', label: 'Whois', targetLabel: 'Domain or CIDR', placeholder: 'domain.com or 1.2.3.0/24' },
];

const tips = [
    'Tip: Use the search box to quickly find a program.',
    'Tip: Modes like Subdomain/Web let you pick from known domains.',
    'Tip: Use Set Run for advanced manual functions.',
    'Tip: Verbose output (-v) will show a terminal-style log.',
];

// Define which options are valid for each mode
const MODE_OPTIONS = {
    asn: ['lastRun', 'verbose', 'liveOutput', 'showPreview'],
    ipcidr: ['lastRun', 'verbose', 'liveOutput', 'showPreview'],
    manual: ['manualRun', 'verbose', 'liveOutput', 'showPreview'],
    multi: ['verbose', 'liveOutput', 'showPreview'],
    multiplan: ['verbose', 'liveOutput', 'showPreview'],
    ports: ['verbose', 'liveOutput', 'showPreview'],
    rdap: ['lastRun', 'verbose', 'liveOutput', 'showPreview'],
    rev: ['lastRun', 'verbose', 'liveOutput', 'showPreview'],
    subdomain: ['lastRun', 'verbose', 'liveOutput', 'showPreview'],
    web: ['lastRun', 'verbose', 'liveOutput', 'showPreview'],
    whois: ['lastRun', 'verbose', 'liveOutput', 'showPreview'],
};

const DeepExecution = () => {
    const [mode, setMode] = useState('asn');
    const [program, setProgram] = useState('');
    const [programId, setProgramId] = useState('');
    const [target, setTarget] = useState('');
    const [setRun, setSetRun] = useState('');
    const [lastRun, setLastRun] = useState(false);
    const [verbose, setVerbose] = useState(true);
    const [manualRun, setRunFlag] = useState(false);
    const [manualTerminal, setTerminalFlag] = useState(false);
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ message: '', visible: false, isError: false });
    const [showOutputModal, setShowOutputModal] = useState(false);
    const [programs, setPrograms] = useState([]);
    const [domains, setDomains] = useState([]);
    const [domainLoading, setDomainLoading] = useState(false);
    const [programsLoading, setProgramsLoading] = useState(false);
    const [programFilter, setProgramFilter] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showSetRun, setShowSetRun] = useState(false);
    const [liveOutput, setLiveOutput] = useState(false);
    const [addDomainVisible, setAddDomainVisible] = useState(false);
    const [newDomain, setNewDomain] = useState('');
    const [newTargetMode, setNewTargetMode] = useState(false);
    const [assetOptions, setAssetOptions] = useState([]);
    const [showPreview, setShowPreview] = useState(true);
    const wsRef = useRef(null);

    useEffect(() => {
        setProgramsLoading(true);
        fetch('/api/deeper/programs')
            .then(res => res.json())
            .then(data => setPrograms(data))
            .catch(() => setPrograms([]))
            .finally(() => setProgramsLoading(false));
    }, []);

    useEffect(() => {
        if (programId && (mode === 'subdomain' || mode === 'web')) {
            setDomainLoading(true);
            fetch(`/api/shared/programs/${programId}/scope`)
                .then(res => res.json())
                .then(data => setDomains((data.data || [])))
                .catch(() => setDomains([]))
                .finally(() => setDomainLoading(false));
        } else {
            setDomains([]);
        }
    }, [programId, mode]);

    useEffect(() => {
        if (!programId) {
            setAssetOptions([]);
            return;
        }
        let endpoint = null;
        if (mode === 'subdomain' || mode === 'web') {
            endpoint = `/api/shared/programs/${programId}/scope`;
        } else if (mode === 'asn') {
            endpoint = `/api/deeper/programs/${programId}/asn`;
        } else if (mode === 'ipcidr') {
            endpoint = `/api/deeper/programs/${programId}/cidr`;
        } // Add more as needed
        if (endpoint) {
            setDomainLoading(true);
            fetch(endpoint)
                .then(res => res.json())
                .then(data => setAssetOptions((data.data || [])))
                .catch(() => setAssetOptions([]))
                .finally(() => setDomainLoading(false));
        } else {
            setAssetOptions([]);
        }
    }, [programId, mode]);

    const showNotification = (message, isError = false) => {
        setNotification({ message, visible: true, isError });
        setTimeout(() => setNotification(prev => ({ ...prev, visible: false })), 3000);
    };

    // Searchable program dropdown logic
    const filteredPrograms = programs.filter(p =>
        p.program.toLowerCase().includes(programFilter.toLowerCase())
    );

    const handleProgramInput = (e) => {
        setProgramFilter(e.target.value);
        setIsDropdownOpen(true);
    };

    const handleProgramSelect = (p) => {
        setProgram(p.program);
        setProgramId(p.id);
        setProgramFilter(p.program);
        setIsDropdownOpen(false);
        setTarget('');
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
            ws.send(JSON.stringify({ type: 'run', command: commandStr }));
        };
        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type === 'output') {
                setOutput(prev => prev + msg.data);
            } else if (msg.type === 'end') {
                setLoading(false);
                setShowOutputModal(true);
                ws.close();
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setOutput('');
        setError('');
        setShowOutputModal(false);
        if (!mode || !program || !target) {
            showNotification('Mode, program, and target are required', true);
            setLoading(false);
            return;
        }
        // Build the command string for live output
        const commandStr = `/home/dd/my/codes/deepv2/deep -m ${mode} -p "${program}" -t "${target}"${setRun ? ` -sr \"${setRun}\"` : ''}${lastRun ? ' -lr' : ''}${verbose ? ' -v' : ''}`;
        if (liveOutput) {
            handleLiveRun(commandStr);
            return;
        }
        try {
            const response = await fetch('/api/deeper/deep/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode, program, target, setRun, lastRun, verbose }),
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setOutput(data.output);
                setShowOutputModal(true);
            } else {
                setError(data.error || 'Unknown error');
                setOutput(data.output || '');
                setShowOutputModal(true);
            }
        } catch (err) {
            setError(err.message);
            setShowOutputModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        showNotification('Output copied to clipboard');
    };

    // Command preview builder
    const buildPreviewCommand = () => {
        let args = [];
        if (verbose) args.push('-v');
        args.push('-m', mode);
        args.push('-p', program);
        args.push('-t', target);
        if (setRun) args.push('-sr', setRun);
        if (lastRun) args.push('-lr');
        return `/home/dd/my/codes/deepv2/deep ${args.join(' ')}`;
    };

    // Dynamic target input
    let targetInput = null;
    if (mode === 'subdomain' || mode === 'web') {
        targetInput = (
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 0, marginBottom: 24 }}>
                <div style={{ width: '50%' }}>
                    <label>Target Domain</label>
                    {!newTargetMode ? (
                        <>
                            {domainLoading ? (
                                <span>Loading domains...</span>
                            ) : (
                                <select value={target} onChange={e => setTarget(e.target.value)} required style={{ width: '100%' }}>
                                    <option value="">Select domain</option>
                                    {domains.map(d => <option key={d.id} value={d.apex_domain}>{d.apex_domain}</option>)}
                                </select>
                            )}
                        </>
                    ) : (
                        <form style={{ display: 'flex', alignItems: 'center', width: '100%' }} onSubmit={async e => {
                            e.preventDefault();
                            if (!newDomain.trim()) return;
                            try {
                                const res = await fetch(`/api/shared/programs/${programId}/scope`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ apex_domain: newDomain.trim() })
                                });
                                const data = await res.json();
                                if (data.success) {
                                    setNewDomain('');
                                    setNewTargetMode(false);
                                    setDomainLoading(true);
                                    fetch(`/api/shared/programs/${programId}/scope`)
                                        .then(res => res.json())
                                        .then(data => setDomains((data.data || [])))
                                        .catch(() => setDomains([]))
                                        .finally(() => setDomainLoading(false));
                                    showNotification('Domain added!');
                                } else {
                                    showNotification(data.error || 'Failed to add domain', true);
                                }
                            } catch (err) {
                                showNotification('Error adding domain', true);
                            }
                        }}>
                            <input type="text" value={newDomain} onChange={e => setNewDomain(e.target.value)} placeholder="example.com" style={{ fontSize: 14, padding: '4px 8px', borderRadius: 4, border: '1px solid #444', width: '100%' }} />
                            <button type="submit" className="toggle-btn enabled" style={{ minWidth: 120, fontWeight: 600, marginLeft: 12 }}>Save</button>
                            <button type="button" className="toggle-btn" style={{ minWidth: 120, fontWeight: 600, marginLeft: 4 }} onClick={() => { setNewTargetMode(false); setNewDomain(''); }}>Cancel</button>
                        </form>
                    )}
                </div>
                <button type="button" className={`toggle-btn${newTargetMode ? ' enabled' : ''}`} onClick={() => setNewTargetMode(true)} style={{ minWidth: 120, fontWeight: 600, marginLeft: 16, marginTop: 24, height: 38 }}>
                    New
                </button>
            </div>
        );
    } else if (['asn', 'ipcidr'].includes(mode)) {
        targetInput = (
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 0, marginBottom: 24 }}>
                <div style={{ width: '50%' }}>
                    <label>{MODES.find(m => m.value === mode)?.targetLabel || 'Target'}</label>
                    {!newTargetMode ? (
                        <>
                            {domainLoading ? (
                                <span>Loading...</span>
                            ) : (
                                <select value={target} onChange={e => setTarget(e.target.value)} required style={{ width: '100%' }}>
                                    <option value="">Select {mode.toUpperCase()}</option>
                                    {assetOptions.map(opt => (
                                        <option key={opt.id || opt.asn || opt.cidr_range} value={opt.asn || opt.cidr_range}>{opt.asn || opt.cidr_range}</option>
                                    ))}
                                </select>
                            )}
                        </>
                    ) : (
                        <form style={{ display: 'flex', alignItems: 'center', width: '100%' }} onSubmit={e => { e.preventDefault(); /* TODO: implement add for ASN/CIDR */ setNewTargetMode(false); setNewDomain(''); }}>
                            <input type="text" value={newDomain} onChange={e => setNewDomain(e.target.value)} placeholder={mode === 'asn' ? 'ASN (e.g. 12345)' : 'CIDR (e.g. 1.2.3.0/24)'} style={{ fontSize: 14, padding: '4px 8px', borderRadius: 4, border: '1px solid #444', width: '100%' }} />
                            <button type="submit" className="toggle-btn enabled" style={{ minWidth: 120, fontWeight: 600, marginLeft: 12 }}>Save</button>
                            <button type="button" className="toggle-btn" style={{ minWidth: 120, fontWeight: 600, marginLeft: 4 }} onClick={() => { setNewTargetMode(false); setNewDomain(''); }}>Cancel</button>
                        </form>
                    )}
                </div>
                <button type="button" className={`toggle-btn${newTargetMode ? ' enabled' : ''}`} onClick={() => setNewTargetMode(true)} style={{ minWidth: 120, fontWeight: 600, marginLeft: 16, marginTop: 24, height: 38 }}>
                    New
                </button>
            </div>
        );
    } else {
        const modeObj = MODES.find(m => m.value === mode);
        targetInput = (
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 0, marginBottom: 24 }}>
                <div style={{ width: '50%' }}>
                    <label>{modeObj?.targetLabel || 'Target'}</label>
                    <input
                        type="text"
                        value={target}
                        onChange={e => setTarget(e.target.value)}
                        placeholder={modeObj?.placeholder || ''}
                        required
                        style={{ width: '100%' }}
                    />
                </div>
            </div>
        );
    }

    // Render output with ANSI colors
    const ansiUp = new AnsiUp();
    const renderTerminalOutput = (text) => {
        return <div style={{
            fontFamily: 'monospace',
            fontSize: 15,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            lineHeight: 1.5,
            padding: 10
        }} dangerouslySetInnerHTML={{ __html: ansiUp.ansi_to_html(text) }} />;
    };

    return (
        <div className="programs-container">
            {/* <style>{styles}</style> */}
            <div className="programs-metrics">
                <div style={{ gridColumn: 'span 6' }}>
                    {/* Content Space #1: Configuration area */}
                    <div className="programs-table deep-content-space">
                        <form className="dashboard-form deep-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="deep-label">Mode</label>
                                <div className="deep-mode-btns">
                                    {MODES.map(m => (
                                        <button
                                            type="button"
                                            key={m.value}
                                            className={`toggle-btn${mode === m.value ? ' enabled' : ''}`}
                                            onClick={() => {
                                                setMode(m.value);
                                                setTarget('');
                                            }}
                                            aria-pressed={mode === m.value}
                                        >
                                            {m.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group" style={{ width: '50%', marginBottom: 24 }}>
                                <label htmlFor="programInput" className="deep-label">Program</label>
                                <div className="custom-dropdown">
                                    <input
                                        id="programInput"
                                        type="text"
                                        value={programFilter}
                                        onChange={handleProgramInput}
                                        onFocus={() => setIsDropdownOpen(true)}
                                        placeholder="Type to filter programs..."
                                        disabled={programsLoading}
                                        required
                                        className="deep-input"
                                        aria-autocomplete="list"
                                        aria-controls="programDropdownList"
                                        style={{ width: '100%' }}
                                    />
                                    {isDropdownOpen && (
                                        <ul id="programDropdownList" className="dropdown-list">
                                            {programsLoading ? (
                                                <li className="dropdown-item disabled">Loading programs...</li>
                                            ) : filteredPrograms.length === 0 ? (
                                                <li className="dropdown-item disabled">No active programs available</li>
                                            ) : (
                                                filteredPrograms.map(p => (
                                                    <li
                                                        key={p.id}
                                                        className="dropdown-item"
                                                        onClick={() => handleProgramSelect(p)}
                                                        tabIndex={0}
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter') handleProgramSelect(p);
                                                        }}
                                                    >
                                                        {p.program}
                                                    </li>
                                                ))
                                            )}
                                        </ul>
                                    )}
                                </div>
                            </div>
                            {targetInput}
                            <div className="form-group">
                                <label className="deep-label">Options</label>
                                <div className="deep-mode-btns" style={{ marginTop: 4 }}>
                                    {MODE_OPTIONS[mode]?.includes('lastRun') && (
                                        <button type="button" className={`toggle-btn${lastRun ? ' enabled' : ''}`} onClick={() => setLastRun(v => !v)}>Last Run (-lr)</button>
                                    )}
                                    {MODE_OPTIONS[mode]?.includes('manualRun') && (
                                        <button type="button" className={`toggle-btn${manualRun ? ' enabled' : ''}`} onClick={() => setRunFlag(v => !v)}>Manual (-sr)</button>
                                    )}
                                    {MODE_OPTIONS[mode]?.includes('verbose') && (
                                        <button type="button" className={`toggle-btn${verbose ? ' enabled' : ''}`} onClick={() => setVerbose(v => !v)}>Verbose (-v)</button>
                                    )}
                                    {MODE_OPTIONS[mode]?.includes('liveOutput') && (
                                        <button type="button" className={`toggle-btn${liveOutput ? ' enabled' : ''}`} onClick={() => setLiveOutput(v => !v)}>Live Output</button>
                                    )}
                                    {MODE_OPTIONS[mode]?.includes('showPreview') && (
                                        <button type="button" className={`toggle-btn${showPreview ? ' enabled' : ''}`} onClick={() => setShowPreview(v => !v)}>Preview</button>
                                    )}
                                </div>
                            </div>
                            {showPreview && (
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
                            {manualRun && (
                                <div className="form-group" style={{ width: '50%', marginBottom: 24 }}>
                                    <label htmlFor="setRunInput" className="deep-label">Set Run <span
                                        title="Advanced: comma-separated functions to run (optional)"
                                        className="deep-help"></span></label>
                                    <input id="setRunInput" type="text" value={setRun}
                                        onChange={e => setSetRun(e.target.value)}
                                        placeholder="radb_whois, ipinfos, ..." className="deep-input"
                                        style={{ width: '100%' }} />
                                </div>
                            )}
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <button type="submit" className="dashboard-btn deep-submit-btn" disabled={loading}>
                                    {loading ? 'Running...' : 'Run Deep'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Content Space #2: Terminal Output (only visible when Live Output is enabled) */}
                    {liveOutput && (
                        <div className="programs-table deep-content-space-cli">
                            <div className="deep-terminal-container">
                                <div className="deep-terminal-output">
                                    {output ? renderTerminalOutput(output) : <div style={{ color: '#888', padding: '10px' }}>Terminal output will appear here when you run the command...</div>}
                                    {output && (
                                        <div className="deep-terminal-btns">
                                            <button className="dashboard-btn deep-copy-btn" onClick={handleCopy}>Copy Output</button>
                                            <button className="dashboard-btn deep-clear-btn" onClick={() => {
                                                setOutput('');
                                                setShowOutputModal(false);
                                            }}>Clear</button>
                                        </div>
                                    )}
                                    {loading && <div style={{ color: '#1ed760', fontWeight: 600, marginTop: 8 }}>Live streaming...</div>}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>


            {/* Modal for non-verbose output */}
            {!verbose && showOutputModal && (
                <div className="modal-overlay" onClick={() => setShowOutputModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}
                        style={{ borderRadius: 12, padding: 32, background: '#23272e', color: '#eee', maxWidth: 600 }}>
                        <h3 style={{ color: '#1ed760', fontWeight: 700 }}>Deep Output</h3>
                        {error && <div className="error"
                            style={{ color: '#ff3b3b', fontWeight: 600, marginBottom: 10 }}>{error}</div>}
                        <pre style={{
                            maxHeight: 400,
                            overflow: 'auto',
                            background: '#222',
                            color: '#eee',
                            padding: 12,
                            borderRadius: 8
                        }}>{output}</pre>
                        <button className="dashboard-btn" onClick={handleCopy}
                            style={{ marginRight: 8, borderRadius: 6, fontWeight: 600 }}>Copy Output
                        </button>
                        <button className="dashboard-btn" onClick={() => setShowOutputModal(false)}
                            style={{ borderRadius: 6, fontWeight: 600 }}>Close
                        </button>
                    </div>
                </div>
            )}

            {notification.visible && (
                <div className={`notification ${notification.isError ? 'error' : ''}`} style={{
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

export default DeepExecution;