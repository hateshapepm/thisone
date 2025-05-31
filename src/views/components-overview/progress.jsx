'use client';

import { useEffect, useRef, useState } from 'react';

// material-ui
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';

// project imports
import MainCard from 'components/MainCard';
import ComponentHeader from 'components/cards/ComponentHeader';
import CircularWithLabel from 'components/@extended/progress/CircularWithLabel';
import LinearWithLabel from 'components/@extended/progress/LinearWithLabel';
import LinearWithIcon from 'components/@extended/progress/LinearWithIcon';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';

import ComponentWrapper from 'sections/components-overview/ComponentWrapper';
import ComponentSkeleton from 'sections/components-overview/ComponentSkeleton';

// assets
import CheckCircleFilled from '@ant-design/icons/CheckCircleFilled';
import CloseCircleFilled from '@ant-design/icons/CloseCircleFilled';

// ==============================|| COMPONENTS - PROGRESS ||============================== //

export default function ComponentProgress() {
  const [progress, setProgress] = useState(0);
  const [bufferProgress, setBufferProgress] = useState(0);
  const [buffer, setBuffer] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => (prevProgress >= 100 ? 0 : prevProgress + 10));
    }, 800);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const progressRef = useRef(() => {});
  useEffect(() => {
    progressRef.current = () => {
      if (bufferProgress > 100) {
        setBufferProgress(0);
        setBuffer(10);
      } else {
        const diff = Math.random() * 10;
        const diff2 = Math.random() * 10;
        setBufferProgress(bufferProgress + diff);
        setBuffer(bufferProgress + diff + diff2);
      }
    };
  });

  useEffect(() => {
    const bufferTimer = setInterval(() => {
      progressRef.current();
    }, 500);

    return () => {
      clearInterval(bufferTimer);
    };
  }, []);

  return (
    <ComponentSkeleton>
      <ComponentHeader
        title="Progress"
        caption="Progress indicators commonly known as spinners, express an unspecified wait time or display the length of a process."
        directory="src/pages/components-overview/progress"
        link="https://mui.com/material-ui/react-progress/"
      />
      <ComponentWrapper>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Stack sx={{ gap: 3 }}>
              <MainCard title="Circular Indeterminate">
                <Grid container spacing={3} alignItems="center">
                  <Grid>
                    <CircularProgress sx={{ color: 'red' }} />
                  </Grid>
                  <Grid>
                    <CircularProgress color="secondary" />
                  </Grid>
                  <Grid>
                    <CircularProgress color="success" />
                  </Grid>
                  <Grid>
                    <CircularProgress color="warning" />
                  </Grid>
                  <Grid>
                    <CircularProgress color="info" />
                  </Grid>
                  <Grid>
                    <CircularProgress color="error" />
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Circular Indeterminate with path">
                <Grid container spacing={3} alignItems="center">
                  <Grid>
                    <CircularWithPath />
                  </Grid>
                  <Grid>
                    <CircularWithPath color="secondary" />
                  </Grid>
                  <Grid>
                    <CircularWithPath color="success" />
                  </Grid>
                  <Grid>
                    <CircularWithPath color="warning" />
                  </Grid>
                  <Grid>
                    <CircularWithPath color="info" />
                  </Grid>
                  <Grid>
                    <CircularWithPath color="error" />
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Circular Determinate">
                <Grid container spacing={3} alignItems="center">
                  <Grid>
                    <CircularProgress variant="determinate" value={25} />
                  </Grid>
                  <Grid>
                    <CircularProgress variant="determinate" value={50} />
                  </Grid>
                  <Grid>
                    <CircularProgress variant="determinate" value={75} />
                  </Grid>
                  <Grid>
                    <CircularProgress variant="determinate" value={100} />
                  </Grid>
                  <Grid>
                    <CircularProgress variant="determinate" value={progress} />
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Circular Determinate With Path">
                <Grid container spacing={3} alignItems="center">
                  <Grid>
                    <CircularWithPath variant="determinate" value={25} />
                  </Grid>
                  <Grid>
                    <CircularWithPath variant="determinate" value={50} />
                  </Grid>
                  <Grid>
                    <CircularWithPath variant="determinate" value={75} />
                  </Grid>
                  <Grid>
                    <CircularWithPath variant="determinate" value={100} />
                  </Grid>
                  <Grid>
                    <CircularWithPath variant="determinate" value={progress} />
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Circular With Label">
                <Grid container spacing={3} alignItems="center">
                  <Grid>
                    <CircularWithLabel value={progress} />
                  </Grid>
                  <Grid>
                    <CircularWithLabel value={80} color="success" />
                  </Grid>
                  <Grid>
                    <CircularWithLabel value={55} color="info" />
                  </Grid>
                  <Grid>
                    <CircularWithLabel value={35} color="warning" />
                  </Grid>
                  <Grid>
                    <CircularWithLabel value={10} color="error" />
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Circular With Label and Path">
                <Grid container spacing={3} alignItems="center">
                  <Grid>
                    <CircularWithPath showLabel variant="determinate" value={progress} />
                  </Grid>
                  <Grid>
                    <CircularWithPath showLabel variant="determinate" value={80} color="success" />
                  </Grid>
                  <Grid>
                    <CircularWithPath showLabel variant="determinate" value={55} color="info" />
                  </Grid>
                  <Grid>
                    <CircularWithPath showLabel variant="determinate" value={35} color="warning" />
                  </Grid>
                  <Grid>
                    <CircularWithPath showLabel variant="determinate" value={10} color="error" />
                  </Grid>
                </Grid>
              </MainCard>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Stack sx={{ gap: 3 }}>
              <MainCard title="Linear Indeterminate">
                <LinearProgress />
              </MainCard>
              <MainCard title="Linear Determinate">
                <LinearProgress variant="determinate" value={progress} />
              </MainCard>

              <MainCard title="Linear With Label / Icon">
                <Stack sx={{ gap: 1, '& .icon-success': { color: 'success.main' }, '& .icon-error': { color: 'error.main' } }}>
                  <LinearWithIcon value={100} color="success" icon={<CheckCircleFilled className="icon-success" />} />
                  <LinearWithLabel variant="determinate" value={progress} />
                  <LinearWithIcon value={5} color="error" icon={<CloseCircleFilled className="icon-error" />} />
                </Stack>
              </MainCard>
              <MainCard title="Linear Color With Height">
                <Stack sx={{ gap: 1 }}>
                  <LinearWithLabel value={80} />
                  <LinearWithLabel value={75} color="secondary" sx={{ height: 6 }} />
                  <LinearWithLabel value={99} color="success" sx={{ height: 8 }} />
                  <LinearWithLabel value={35} color="warning" sx={{ height: 10 }} />
                  <LinearWithLabel value={60} color="info" sx={{ height: 12 }} />
                  <LinearWithLabel value={15} color="error" sx={{ height: 2 }} />
                </Stack>
              </MainCard>
              <MainCard title="Linear Buffer">
                <LinearProgress variant="buffer" value={bufferProgress} valueBuffer={buffer} />
              </MainCard>
              <MainCard title="Circular Progress Size">
                <Grid container spacing={3} alignItems="center">
                  <Grid>
                    <CircularProgress size={20} />
                  </Grid>
                  <Grid>
                    <CircularWithPath color="success" size={32} />
                  </Grid>
                  <Grid>
                    <CircularProgress variant="determinate" value={80} color="info" />
                  </Grid>
                  <Grid>
                    <CircularWithPath variant="determinate" value={40} color="warning" size={52} />
                  </Grid>
                  <Grid>
                    <CircularWithLabel variant="determinate" value={75} color="error" size={64} />
                  </Grid>
                  <Grid>
                    <CircularWithPath showLabel variant="determinate" value={55} color="secondary" size={80} />
                  </Grid>
                </Grid>
              </MainCard>
            </Stack>
          </Grid>
        </Grid>
      </ComponentWrapper>
    </ComponentSkeleton>
  );
}
