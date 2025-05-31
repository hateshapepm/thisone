// third-party
import { ReactCompareSlider, ReactCompareSliderImage, ReactCompareSliderHandle } from 'react-compare-slider';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';

// project imports
import useConfig from 'hooks/useConfig';

// ==============================|| LANDING - BROWSER  PAGE ||============================== //

export default function BrowserBlockPage() {
  const theme = useTheme();
  const { presetColor } = useConfig();

  return (
    <Box sx={(theme) => ({ position: 'relative', '& .ReactCompareSlider': { direction: theme.direction } })}>
      <ReactCompareSlider
        className="ReactCompareSlider"
        handle={
          <ReactCompareSliderHandle
            buttonStyle={{
              backdropFilter: undefined,
              background: theme.palette.background.paper,
              border: 0,
              color: theme.palette.text.primary
            }}
          />
        }
        itemOne={<ReactCompareSliderImage src={`/assets/images/landing/${presetColor}-dark.jpg`} />}
        itemTwo={<ReactCompareSliderImage src={`/assets/images/landing/${presetColor}-light.jpg`} />}
      />
    </Box>
  );
}
