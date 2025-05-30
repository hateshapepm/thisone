import PropTypes from 'prop-types';
import { useState, useCallback, useMemo, memo } from 'react';

// third-party
import { Map } from 'react-map-gl/mapbox';

// project imports
import ControlPanel from './control-panel';

const leftMapStyle = {
  position: 'absolute',
  width: '50%',
  height: '100%'
};

const rightMapStyle = {
  position: 'absolute',
  left: '50%',
  width: '50%',
  height: '100%'
};

// ==============================|| SIDE BY SIDE ||============================== //

function SideBySide({ ...other }) {
  const [viewState, setViewState] = useState({
    latitude: 21.2335611,
    longitude: 72.8636084,
    zoom: 12,
    pitch: 30
  });

  const [mode, setMode] = useState('split-screen');
  const [activeMap, setActiveMap] = useState('left');
  const onLeftMoveStart = useCallback(() => setActiveMap('left'), []);
  const onRightMoveStart = useCallback(() => setActiveMap('right'), []);
  const onMove = useCallback((event) => setViewState(event.viewState), []);

  const width = typeof window === 'undefined' ? 100 : window.innerWidth;
  const leftMapPadding = useMemo(() => ({ left: mode === 'split-screen' ? width / 2 : 0, top: 0, right: 0, bottom: 0 }), [width, mode]);
  const rightMapPadding = useMemo(() => ({ right: mode === 'split-screen' ? width / 2 : 0, top: 0, left: 0, bottom: 0 }), [width, mode]);

  const handleChangeMode = (event, newMode) => {
    if (newMode !== null) {
      setMode(newMode);
    }
  };

  return (
    <>
      <Map
        id="left-map"
        {...viewState}
        padding={leftMapPadding}
        onMoveStart={onLeftMoveStart}
        onMove={(event) => {
          if (activeMap === 'left') {
            onMove(event);
          }
        }}
        style={leftMapStyle}
        mapStyle="mapbox://styles/mapbox/light-v10"
        {...other}
        logoPosition="top-left"
      />
      <Map
        id="right-map"
        {...viewState}
        padding={rightMapPadding}
        onMoveStart={onRightMoveStart}
        onMove={(event) => {
          if (activeMap === 'right') {
            onMove(event);
          }
        }}
        style={rightMapStyle}
        mapStyle="mapbox://styles/mapbox/dark-v10"
        {...other}
        logoPosition="top-left"
      />
      <ControlPanel mode={mode} onModeChange={handleChangeMode} />
    </>
  );
}

export default memo(SideBySide);

SideBySide.propTypes = { other: PropTypes.any };
