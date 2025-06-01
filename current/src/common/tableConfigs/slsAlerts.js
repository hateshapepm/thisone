import React from 'react';
import PropTypes from 'prop-types';
import ProgramWithLogo from '../components/ProgramWithLogo';
import {Clipboard, ClipboardCheck, CheckCircle, Trash2, ExternalLink, Ban} from 'lucide-react';
import {copyInfoClipboard} from "../functions";

export const slsAlertsColumns = [
    {
        Header: 'Program',
        accessor: 'program',
        Cell: ({row}) => <ProgramWithLogo programName={row.original.program || 'N/A'}
                                          platformName={row.original.platform_name}/>,
    },
    {
        Header: 'Protocol/Domain',
        accessor: 'protocolDomain',
        Cell: ({value, row, handleCopyAndOpen, copyToClipboard, showNotification}) => {
            const domain = value || row.original['protocol/domain'] || row.original.domain || 'N/A';
            const isUrl = domain.startsWith('http://') || domain.startsWith('https://');
            return (
                <div className="copy-cell">
                    {isUrl ? (
                        <a href={domain} className="text-green-400 hover:text-green-300 transition-colors"
                           target="_blank" rel="noopener noreferrer"
                           onClick={e => handleCopyAndOpen(`${row.original.email}:${row.original.password}`, domain, e)}>{domain}</a>
                    ) : (
                        <span>{domain}</span>
                    )}
                    {isUrl && (
                        <a href={domain} className="text-gray-400 hover:text-white ml-1" target="_blank"
                           rel="noopener noreferrer" title="Open in new tab"
                           onClick={e => handleCopyAndOpen(`${row.original.email}:${row.original.password}`, domain, e)}>
                            <span className="ml-2 inline-block"/>
                            <ExternalLink size={14}/>
                        </a>
                    )}

                    <button className="copy-btn"
                            onClick={() => copyInfoClipboard(value, copyToClipboard, showNotification)}
                            title="Copy domain">
                        <Clipboard size={14}/>
                    </button>
                </div>
            );
        },
    },
    {
        Header: 'Email Address',
        accessor: 'email',
        Cell: ({value, copyToClipboard, showNotification}) => (
            <div className="copy-cell">
                <span>{value || 'N/A'}</span>
                <button className="copy-btn" onClick={() => copyInfoClipboard(value, copyToClipboard, showNotification)}
                        title="Copy email">
                    <Clipboard size={14}/>
                </button>
            </div>
        ),
    },
    {
        Header: 'Password',
        accessor: 'password',
        Cell: ({value, copyToClipboard, showNotification}) => (
            <div className="copy-cell">
                <span>{value || 'N/A'}</span>
                <button className="copy-btn" onClick={() => copyInfoClipboard(value, copyToClipboard, showNotification)}
                        title="Copy password">
                    <Clipboard size={14}/>
                </button>
            </div>
        ),
    },
    {
        Header: 'Actions',
        accessor: 'actions',
        width: 220,
        Cell: ({row, handleAck, openVerifyModal, handleDeleteCredential, handleIgnoreApex, stripProtocol}) => {
            const id = row.original.credentials_id || row.original.fk_credentials_id || row.original.program_credentials_id;
            const program = row.original.program || 'N/A';
            let domain = row.original.protocolDomain || row.original['protocol/domain'] || row.original.domain || 'N/A';
            const loginDomain = stripProtocol(row.original.login_domain || row.original.loginDomain || domain);
            return (
                <div className="actions-cell">
                    <button className="ack-btn" onClick={() => handleAck(id)} title="Acknowledge">
                        <ClipboardCheck size={14}/>
                    </button>
                    <button className="edit-btn" onClick={() => openVerifyModal(id, domain, program, loginDomain)}
                            title="Verify credential">
                        <CheckCircle size={14}/>
                    </button>
                    <button
                        className="ignore-btn"
                        onClick={() => handleIgnoreApex(domain)}
                        title="Ignore Apex"
                        tabIndex={0}
                        aria-label="Ignore apex domain"
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleIgnoreApex(domain); }}
                    >
                        <Ban size={14}/>
                    </button>
                    <button className="delete-btn" onClick={() => handleDeleteCredential(id)} title="Delete credential">
                        <Trash2 size={14}/>
                    </button>
                </div>
            );
        },
    },
];

slsAlertsColumns.propTypes = [
    PropTypes.shape({
        Header: PropTypes.string.isRequired,
        accessor: PropTypes.string,
        Cell: PropTypes.func,
    })
]; 