import React from 'react';
import PropTypes from 'prop-types';
import ProgramWithLogo from '../components/ProgramWithLogo';
import {Clipboard, ClipboardCheck} from 'lucide-react';
import {copyInfoClipboard} from '../functions/copyToClipboard';

export const deeperAlertsColumns = [
    {
        Header: 'Program',
        accessor: 'program',
        Cell: ({row}) => <ProgramWithLogo programName={row.original.program}
                                          platformName={row.original.platform_name}/>,
    },
    {
        Header: 'Type',
        accessor: 'type',
        Cell: ({value}) => <span className="type-label">{value}</span>,
    },
    {
        Header: 'Value',
        accessor: 'value',
        Cell: ({value, row, showNotification}) => {
            const isUrl = row.original.type === 'url';
            return (
                <div className="copy-cell">
                    {isUrl ? <a href={value} target="_blank" rel="noopener noreferrer">{value}</a> :
                        <span>{value}</span>}
                    <button className="copy-btn" onClick={() => copyInfoClipboard(value, showNotification)}
                            title="Copy value">
                        <Clipboard size={14}/>
                    </button>
                </div>
            );
        },
    },
    {
        Header: 'Discovery Date',
        accessor: 'discovery_date',
        Cell: ({value}) => new Date(value).toLocaleString(),
    },
    {
        Header: 'Actions',
        accessor: 'id',
        Cell: ({row, handleAck}) => (
            <div className="actions-cell">
                <button className="ack-btn" onClick={() => handleAck(row.original.id, row.original.type)}
                        title="Acknowledge">
                    <ClipboardCheck size={14}/>
                </button>
            </div>
        ),
    },
];

deeperAlertsColumns.propTypes = [
    PropTypes.shape({
        Header: PropTypes.string.isRequired,
        accessor: PropTypes.string.isRequired,
        Cell: PropTypes.func,
    })
]; 