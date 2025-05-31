'use client';

// material-ui
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';

// project imports
import MainCard from 'components/MainCard';

// third-party
import { enqueueSnackbar } from 'notistack';

// ==============================|| NOTISTACK - POSTIONING ||============================== //

export default function PositioningSnackbar() {
  const theme = useTheme();
  const backgroundColor = theme.palette.primary.main;

  return (
    <MainCard title="Positioning">
      <Grid container spacing={2}>
        <Grid>
          <Button
            variant="contained"
            onClick={() =>
              enqueueSnackbar('This is a top-left message.', {
                anchorOrigin: {
                  vertical: 'top',
                  horizontal: 'left'
                },
                style: { backgroundColor: backgroundColor }
              })
            }
          >
            Top-Left
          </Button>
        </Grid>
        <Grid>
          <Button
            variant="contained"
            onClick={() =>
              enqueueSnackbar('This is a top-center message', {
                anchorOrigin: {
                  vertical: 'top',
                  horizontal: 'center'
                },
                style: { backgroundColor: backgroundColor }
              })
            }
          >
            Top-Center
          </Button>
        </Grid>
        <Grid>
          <Button
            variant="contained"
            onClick={() =>
              enqueueSnackbar('This is a top-right message', {
                anchorOrigin: {
                  vertical: 'top',
                  horizontal: 'right'
                },
                style: { backgroundColor: backgroundColor }
              })
            }
          >
            Top-right
          </Button>
        </Grid>
        <Grid>
          <Button
            variant="contained"
            onClick={() =>
              enqueueSnackbar('This is a bottom-left message', {
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'left'
                },
                style: { backgroundColor: backgroundColor }
              })
            }
          >
            Bottom-left
          </Button>
        </Grid>
        <Grid>
          <Button
            variant="contained"
            onClick={() =>
              enqueueSnackbar('This is a bottom-center message', {
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'center'
                },
                style: { backgroundColor: backgroundColor }
              })
            }
          >
            Bottom-center
          </Button>
        </Grid>
        <Grid>
          <Button
            variant="contained"
            onClick={() =>
              enqueueSnackbar('This is a bottom-right message', {
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'right'
                },
                style: { backgroundColor: backgroundColor }
              })
            }
          >
            Bottom-Right
          </Button>
        </Grid>
      </Grid>
    </MainCard>
  );
}
