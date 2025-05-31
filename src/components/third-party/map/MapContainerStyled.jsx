// material-ui
import { styled } from '@mui/material/styles';

// ==============================|| MAP BOX - CONTAINER STYLED ||============================== //

const MapContainerStyled = styled('div')({
  zIndex: 0,
  height: 576,
  overflow: 'hidden',
  position: 'relative',
  borderRadius: 4,
  '& .mapboxgl-ctrl-logo, .mapboxgl-ctrl-bottom-right': {
    display: 'none'
  }
});

export default MapContainerStyled;
