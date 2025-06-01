import React from 'react';
import {Clipboard} from 'lucide-react';
import bugcrowdSvg from '../../assets/bugcrowd.svg';
import hackeroneSvg from '../../assets/hackerone.svg';
import manualSvg from '../../assets/manual.svg';
import naSvg from '../../assets/na.svg';
import synackSvg from '../../assets/synack.svg';
import {copyInfoClipboard} from '../functions';

const logoStyle = {
    width: 'var(--program-svg)',
    height: 'var(--program-svg)',
    minWidth: 'var(--program-svg)',
    minHeight: 'var(--program-svg)',
    maxWidth: 'var(--program-svg)',
    maxHeight: 'var(--program-svg)',
    marginRight: 10,
    display: 'inline-block'
};

const ProgramWithLogo = ({programName, platformName, showCopyButton = true}) => {
    const getLogo = () => {
        if (!platformName) return null;
        const platform = platformName.toLowerCase();
        if (platform === 'bugcrowd') {
            return <img src={bugcrowdSvg} alt="Bugcrowd" className="mr-10" style={logoStyle}/>;
        } else if (platform === 'hackerone') {
            return <img src={hackeroneSvg} alt="HackerOne" className="mr-10" style={logoStyle}/>;
        } else if (platform === 'synack') {
            return <img src={synackSvg} alt="Synack" className="mr-10" style={logoStyle}/>;
        } else if (platform === 'manual') {
            return <img src={manualSvg} alt="Manual" className="mr-10" style={logoStyle}/>;
        } else if (platform === 'n/a') {
            return <img src={naSvg} alt="N/A" className="mr-10" style={logoStyle}/>;
        }
        return null;
    };

    return (
        <div className="copy-cell flex align-center">
            {getLogo()}
            <span className="flex-1 ellipsis nowrap">{programName}</span>
            {showCopyButton && (
                <button
                    className="copy-btn"
                    onClick={() => copyInfoClipboard(programName)}
                    title="Copy Program Name"
                    tabIndex={0}
                    aria-label="Copy Program Name"
                >
                    <Clipboard size={14}/>
                </button>
            )}
        </div>
    );
};

export default ProgramWithLogo;