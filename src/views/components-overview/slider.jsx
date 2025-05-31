'use client';

import { useState } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';

// project imports
import MainCard from 'components/MainCard';
import ComponentHeader from 'components/cards/ComponentHeader';
import ComponentWrapper from 'sections/components-overview/ComponentWrapper';
import ComponentSkeleton from 'sections/components-overview/ComponentSkeleton';

// assets
import AudioMutedOutlined from '@ant-design/icons/AudioMutedOutlined';
import SoundOutlined from '@ant-design/icons/SoundOutlined';

function valuetext(value) {
  return `${value}°C`;
}

function valueLabelFormat(value) {
  return marks.findIndex((mark) => mark.value === value) + 1;
}

const minDistance = 10;

const marks = [
  {
    value: 0,
    label: '0°C'
  },
  {
    value: 20,
    label: '20°C'
  },
  {
    value: 37,
    label: '37°C'
  },
  {
    value: 100,
    label: '100°C'
  }
];

// ==============================|| COMPONENTS - SLIDER ||============================== //

export default function ComponentSlider() {
  const [volume, setVolume] = useState(55);
  const handleVolumeChange = (event, newVolume) => {
    setVolume(newVolume);
  };

  const [range, setRange] = useState([20, 37]);
  const handleRangeChange = (event, newRange) => {
    setRange(newRange);
  };

  const [value1, setValue1] = useState([20, 55]);
  const handleChange1 = (event, newValue, activeThumb) => {
    if (!Array.isArray(newValue)) {
      return;
    }

    if (activeThumb === 0) {
      setValue1([Math.min(newValue[0], value1[1] - minDistance), value1[1]]);
    } else {
      setValue1([value1[0], Math.max(newValue[1], value1[0] + minDistance)]);
    }
  };

  const [value2, setValue2] = useState([35, 76]);
  const handleChange2 = (event, newValue, activeThumb) => {
    if (!Array.isArray(newValue)) {
      return;
    }

    if (newValue[1] - newValue[0] < minDistance) {
      if (activeThumb === 0) {
        const clamped = Math.min(newValue[0], 100 - minDistance);
        setValue2([clamped, clamped + minDistance]);
      } else {
        const clamped = Math.max(newValue[1], minDistance);
        setValue2([clamped - minDistance, clamped]);
      }
    } else {
      setValue2(newValue);
    }
  };

  return (
    <ComponentSkeleton>
      <ComponentHeader
        title="Slider"
        caption="Sliders allow users to make selections from a range of values."
        directory="src/pages/components-overview/slider"
        link="https://mui.com/material-ui/react-slider/"
      />
      <ComponentWrapper>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack spacing={2.5}>
              <MainCard title="Basic" codeHighlight>
                <Slider defaultValue={35} />
              </MainCard>
              <MainCard title="With Icons">
                <Stack
                  direction="row"
                  sx={{
                    gap: 2,
                    alignItems: 'center',
                    mb: 1,
                    '& .icon-muted': { color: volume <= 25 ? 'inherit' : 'text.secondary' },
                    '& .icon-sound': { color: volume > 25 ? 'inherit' : 'text.secondary' }
                  }}
                >
                  <AudioMutedOutlined className="icon-muted" />
                  <Slider aria-label="Volume" value={volume} onChange={handleVolumeChange} />
                  <SoundOutlined className="icon-sound" />
                </Stack>
              </MainCard>
              <MainCard title="Range">
                <Slider
                  getAriaLabel={() => 'Temperature range'}
                  value={range}
                  onChange={handleRangeChange}
                  valueLabelDisplay="auto"
                  getAriaValueText={valuetext}
                />
              </MainCard>
              <MainCard title="With Label">
                <Slider
                  sx={{ mt: 2.5 }}
                  aria-label="Always visible"
                  defaultValue={80}
                  getAriaValueText={valuetext}
                  step={10}
                  valueLabelDisplay="on"
                />
              </MainCard>
              <MainCard title="Vertical">
                <Stack direction="row" sx={{ gap: 1, height: 300 }}>
                  <Slider aria-label="Temperature" orientation="vertical" getAriaValueText={valuetext} defaultValue={30} />
                  <Slider
                    aria-label="Temperature"
                    orientation="vertical"
                    defaultValue={30}
                    disabled
                    sx={{
                      '&.MuiSlider-root.Mui-disabled': {
                        '& .MuiSlider-track': { color: 'secondary.200' },
                        '& .MuiSlider-thumb': { bgcolor: 'primary.light' }
                      }
                    }}
                  />
                  <Slider
                    getAriaLabel={() => 'Temperature'}
                    orientation="vertical"
                    getAriaValueText={valuetext}
                    defaultValue={[20, 37]}
                    marks={marks}
                    color="warning"
                  />
                </Stack>
              </MainCard>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 2.5 }}>
              <MainCard title="Disabled">
                <Slider
                  defaultValue={50}
                  disabled
                  sx={{
                    '&.MuiSlider-root.Mui-disabled': {
                      '& .MuiSlider-track': { color: 'secondary.200' },
                      '& .MuiSlider-thumb': { bgcolor: 'primary.light' }
                    }
                  }}
                />
              </MainCard>
              <MainCard title="Sizes">
                <Slider size="small" defaultValue={70} aria-label="Small" valueLabelDisplay="auto" />
                <Slider defaultValue={50} aria-label="Default" valueLabelDisplay="auto" />
              </MainCard>
              <MainCard title="Discrete">
                <Slider
                  aria-label="Temperature"
                  defaultValue={60}
                  getAriaValueText={valuetext}
                  valueLabelDisplay="auto"
                  step={10}
                  marks
                  min={10}
                  max={110}
                />
              </MainCard>
              <MainCard title="Restricted values">
                <Slider
                  aria-label="Restricted values"
                  defaultValue={20}
                  valueLabelFormat={valueLabelFormat}
                  getAriaValueText={valuetext}
                  step={null}
                  valueLabelDisplay="auto"
                  marks={marks}
                />
              </MainCard>
              <MainCard title="Minimum distance">
                <Slider
                  getAriaLabel={() => 'Minimum distance'}
                  value={value1}
                  onChange={handleChange1}
                  valueLabelDisplay="auto"
                  getAriaValueText={valuetext}
                  disableSwap
                />
                <Slider
                  getAriaLabel={() => 'Minimum distance shift'}
                  value={value2}
                  onChange={handleChange2}
                  valueLabelDisplay="auto"
                  getAriaValueText={valuetext}
                  disableSwap
                />
              </MainCard>
              <MainCard title="Colors">
                <Slider defaultValue={65} />
                <Slider defaultValue={50} color="secondary" />
                <Slider defaultValue={95} color="success" />
                <Slider defaultValue={30} color="warning" />
                <Slider defaultValue={85} color="info" />
                <Slider defaultValue={5} color="error" />
              </MainCard>
            </Stack>
          </Grid>
        </Grid>
      </ComponentWrapper>
    </ComponentSkeleton>
  );
}
