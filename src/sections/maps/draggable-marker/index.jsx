import PropTypes from 'prop-types';
import { useState, useCallback, memo } from 'react';

// third-party
import Map from 'react-map-gl/mapbox';

// project imports
import ControlPanel from './control-panel';
import MapControl from 'components/third-party/map/MapControl';
import MapMarker from 'components/third-party/map/MapMarker';

// ==============================|| MAP - DRAGGABLE MARKER ||============================== //

function DraggableMarkers({ ...other }) {
  const [marker, setMarker] = useState({
    latitude: 21.2335611,
    longitude: 72.8636084
  });

  const [events, logEvents] = useState({});

  const onMarkerDragStart = useCallback((event) => {
    logEvents((_events) => ({ ..._events, onDragStart: event.lngLat }));
  }, []);

  const onMarkerDrag = useCallback((event) => {
    logEvents((_events) => ({ ..._events, onDrag: event.lngLat }));

    setMarker({
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat
    });
  }, []);

  const onMarkerDragEnd = useCallback((event) => {
    logEvents((_events) => ({ ..._events, onDragEnd: event.lngLat }));
  }, []);

  return (
    <>
      <Map initialViewState={{ latitude: 21.2335611, longitude: 72.8636084, zoom: 6 }} {...other} logoPosition="top-left">
        <MapControl />
        <MapMarker
          longitude={marker.longitude}
          latitude={marker.latitude}
          anchor="bottom"
          draggable
          onDragStart={onMarkerDragStart}
          onDrag={onMarkerDrag}
          onDragEnd={onMarkerDragEnd}
        />
      </Map>

      <ControlPanel events={events} />
    </>
  );
}

export default memo(DraggableMarkers);

DraggableMarkers.propTypes = { other: PropTypes.any };
