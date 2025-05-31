'use client';

// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';
import ComponentHeader from 'components/cards/ComponentHeader';
import ComponentWrapper from 'sections/components-overview/ComponentWrapper';
import ComponentSkeleton from 'sections/components-overview/ComponentSkeleton';

import {
  ColorVariants,
  CustomComponent,
  Dense,
  DismissSnackBar,
  HideDuration,
  IconVariants,
  MaxSnackbar,
  PositioningSnackbar,
  PreventDuplicate,
  SnackBarAction,
  TransitionBar
} from 'sections/components-overview/notistack';

import { openSnackbar } from 'api/snackbar';

// ==============================|| COMPONENTS - SNACKBAR ||============================== //

export default function ComponentSnackbar() {
  return (
    <ComponentSkeleton>
      <ComponentHeader
        title="Snackbar"
        caption="Snackbars provide brief notifications. The component is also known as a toast."
        directory="src/pages/components-overview/snackbar"
        link="https://mui.com/material-ui/react-snackbar/"
      />
      <ComponentWrapper>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <MainCard title="Basic">
              <Grid container spacing={2}>
                <Grid>
                  <Button
                    variant="contained"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is a default message',
                        variant: 'alert'
                      })
                    }
                  >
                    Default
                  </Button>
                </Grid>
                <Grid>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is a secondary message',
                        variant: 'alert',
                        alert: { color: 'secondary' }
                      })
                    }
                  >
                    Secondary
                  </Button>
                </Grid>
                <Grid>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is a success message',
                        variant: 'alert',

                        alert: {
                          color: 'success'
                        }
                      })
                    }
                  >
                    Success
                  </Button>
                </Grid>
                <Grid>
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is a warning message',
                        variant: 'alert',

                        alert: {
                          color: 'warning'
                        }
                      })
                    }
                  >
                    Warning
                  </Button>
                </Grid>
                <Grid>
                  <Button
                    variant="contained"
                    color="info"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is a info message',
                        variant: 'alert',

                        alert: {
                          color: 'info'
                        }
                      })
                    }
                  >
                    Info
                  </Button>
                </Grid>
                <Grid>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is a error message',
                        variant: 'alert',

                        alert: {
                          color: 'error'
                        }
                      })
                    }
                  >
                    Error
                  </Button>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <MainCard title="Outlined">
              <Grid container spacing={2}>
                <Grid>
                  <Button
                    variant="outlined"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is a default message',
                        variant: 'alert',
                        alert: { variant: 'outlined' }
                      })
                    }
                  >
                    Default
                  </Button>
                </Grid>
                <Grid>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is a secondary message',
                        variant: 'alert',
                        alert: { variant: 'outlined', color: 'secondary' }
                      })
                    }
                  >
                    Secondary
                  </Button>
                </Grid>
                <Grid>
                  <Button
                    variant="outlined"
                    color="success"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is a success message',
                        variant: 'alert',
                        alert: { variant: 'outlined', color: 'success' }
                      })
                    }
                  >
                    Success
                  </Button>
                </Grid>
                <Grid>
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is a warning message',
                        variant: 'alert',
                        alert: { variant: 'outlined', color: 'warning' }
                      })
                    }
                  >
                    Warning
                  </Button>
                </Grid>
                <Grid>
                  <Button
                    variant="outlined"
                    color="info"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is a info message',
                        variant: 'alert',
                        alert: { variant: 'outlined', color: 'info' }
                      })
                    }
                  >
                    Info
                  </Button>
                </Grid>
                <Grid>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is a error message',
                        variant: 'alert',
                        alert: { variant: 'outlined', color: 'error' }
                      })
                    }
                  >
                    Error
                  </Button>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <MainCard title="With Close">
              <Grid container spacing={2}>
                <Grid>
                  <Button
                    variant="contained"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is a default message',
                        variant: 'alert',
                        close: true
                      })
                    }
                  >
                    Default
                  </Button>
                </Grid>
                <Grid>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is a secondary message',
                        variant: 'alert',

                        alert: {
                          color: 'secondary'
                        },

                        close: true
                      })
                    }
                  >
                    Secondary
                  </Button>
                </Grid>
                <Grid>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is a success message',
                        variant: 'alert',

                        alert: {
                          color: 'success'
                        },

                        close: true
                      })
                    }
                  >
                    Success
                  </Button>
                </Grid>
                <Grid>
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is a warning message',
                        variant: 'alert',

                        alert: {
                          color: 'warning'
                        },

                        close: true
                      })
                    }
                  >
                    Warning
                  </Button>
                </Grid>
                <Grid>
                  <Button
                    variant="contained"
                    color="info"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is a info message',
                        variant: 'alert',

                        alert: {
                          color: 'info'
                        },

                        close: true
                      })
                    }
                  >
                    Info
                  </Button>
                </Grid>
                <Grid>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is a error message',
                        variant: 'alert',

                        alert: {
                          color: 'error'
                        },

                        close: true
                      })
                    }
                  >
                    Error
                  </Button>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <MainCard title="With Close + Action">
              <Grid container spacing={2}>
                <Grid>
                  <Button
                    variant="outlined"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is a default message',
                        variant: 'alert',
                        alert: { variant: 'outlined' },
                        actionButton: true,
                        close: true
                      })
                    }
                  >
                    Default
                  </Button>
                </Grid>
                <Grid>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is a secondary message',
                        variant: 'alert',
                        alert: { variant: 'outlined', color: 'secondary' },
                        actionButton: true,
                        close: true
                      })
                    }
                  >
                    Secondary
                  </Button>
                </Grid>
                <Grid>
                  <Button
                    variant="outlined"
                    color="success"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is a success message',
                        variant: 'alert',
                        alert: { variant: 'outlined', color: 'success' },
                        actionButton: true,
                        close: true
                      })
                    }
                  >
                    Success
                  </Button>
                </Grid>
                <Grid>
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is a warning message',
                        variant: 'alert',
                        alert: { variant: 'outlined', color: 'warning' },
                        actionButton: true,
                        close: true
                      })
                    }
                  >
                    Warning
                  </Button>
                </Grid>
                <Grid>
                  <Button
                    variant="outlined"
                    color="info"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is a info message',
                        variant: 'alert',
                        alert: { variant: 'outlined', color: 'info' },
                        actionButton: true,
                        close: true
                      })
                    }
                  >
                    Info
                  </Button>
                </Grid>
                <Grid>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is a error message',
                        variant: 'alert',
                        alert: { variant: 'outlined', color: 'error' },
                        actionButton: true,
                        close: true
                      })
                    }
                  >
                    Error
                  </Button>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <MainCard title="Position">
              <Grid container spacing={2}>
                <Grid>
                  <Button
                    variant="contained"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        anchorOrigin: { vertical: 'top', horizontal: 'left' },
                        message: 'This is a top-left message!',
                        close: true
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
                      openSnackbar({
                        open: true,
                        anchorOrigin: { vertical: 'top', horizontal: 'center' },
                        message: 'This is a top-center message!',
                        close: true
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
                      openSnackbar({
                        open: true,
                        anchorOrigin: { vertical: 'top', horizontal: 'right' },
                        message: 'This is a top-right message!',
                        close: true
                      })
                    }
                  >
                    Top-Right
                  </Button>
                </Grid>
                <Grid>
                  <Button
                    variant="contained"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
                        message: 'This is a bottom-right message!',
                        close: true
                      })
                    }
                  >
                    Bottom-Right
                  </Button>
                </Grid>
                <Grid>
                  <Button
                    variant="contained"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
                        message: 'This is a bottom-center message!',
                        close: true
                      })
                    }
                  >
                    Bottom-Center
                  </Button>
                </Grid>
                <Grid>
                  <Button
                    variant="contained"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                        message: 'This is a bottom-left message!',
                        close: true
                      })
                    }
                  >
                    Bottom-Left
                  </Button>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <MainCard title="Transitions">
              <Grid container spacing={2}>
                <Grid>
                  <Button
                    variant="contained"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is a fade message!',
                        transition: 'Fade',
                        close: true
                      })
                    }
                  >
                    Default/Fade
                  </Button>
                </Grid>
                <Grid>
                  <Button
                    variant="contained"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is a slide-left message!',
                        transition: 'SlideLeft',
                        close: true
                      })
                    }
                  >
                    Slide Left
                  </Button>
                </Grid>
                <Grid>
                  <Button
                    variant="contained"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is a slide-up message!',
                        transition: 'SlideUp',
                        close: true
                      })
                    }
                  >
                    Slide Up
                  </Button>
                </Grid>
                <Grid>
                  <Button
                    variant="contained"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is a slide-right message!',
                        transition: 'SlideRight',
                        close: true
                      })
                    }
                  >
                    Slide Right
                  </Button>
                </Grid>
                <Grid>
                  <Button
                    variant="contained"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is a slide-down message!',
                        transition: 'SlideDown',
                        close: true
                      })
                    }
                  >
                    Slide Down
                  </Button>
                </Grid>
                <Grid>
                  <Button
                    variant="contained"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is a grow message!',
                        transition: 'Grow',
                        close: true
                      })
                    }
                  >
                    Grow
                  </Button>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid size={12}>
            <Typography variant="h5" sx={{ mt: 2 }}>
              Extended - Notistack
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <ColorVariants />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <MaxSnackbar />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <IconVariants />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <HideDuration />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <SnackBarAction />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <DismissSnackBar />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <PreventDuplicate />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <TransitionBar />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Dense />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <CustomComponent />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <PositioningSnackbar />
          </Grid>
        </Grid>
      </ComponentWrapper>
    </ComponentSkeleton>
  );
}
