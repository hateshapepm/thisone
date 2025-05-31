// material-ui
import CardMedia from '@mui/material/CardMedia';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { motion } from 'framer-motion';

// project imports
import useConfig from 'hooks/useConfig';

// assets
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
const imgelementmsg = '/assets/images/landing/img-element-msg.png';
const imgelementwidget = '/assets/images/landing/img-element-widget.png';

// ==============================|| LANDING - ELEMENT PAGE ||============================== //

export default function ElementBlock() {
  const { presetColor } = useConfig();

  const checkIcon = (
    <Box component="span" sx={{ color: 'primary.main' }}>
      <CheckCircleOutlined style={{ fontSize: '1.15rem' }} />
    </Box>
  );

  return (
    <Box
      sx={(theme) => ({
        overflowX: 'hidden',
        position: 'relative',
        '&:after': {
          content: '""',
          position: 'absolute',
          width: '100%',
          height: '45%',
          bottom: 0,
          left: 0,
          bgcolor: 'secondary.800',
          ...theme.applyStyles('dark', { bgcolor: 'grey.100' }),
          [theme.breakpoints.down('sm')]: { height: '60%' }
        },
        '@keyframes slideY': {
          '0%': {
            transform: 'translateY(0px)'
          },
          '50%': {
            transform: 'translateY(0px)'
          },
          '100%': {
            transform: 'translateY(0px)'
          },
          '25%': {
            transform: 'translateY(-20px)'
          },
          '75%': {
            transform: 'translateY(20px)'
          }
        }
      })}
    >
      <Container sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container alignItems="center" justifyContent="center" spacing={2} sx={{ mt: { md: 15, xs: 2.5 }, mb: { md: 10, xs: 2.5 } }}>
          <Grid size={12}>
            <Grid container spacing={1} justifyContent="center" sx={{ mb: 4, textAlign: 'center' }}>
              <Grid size={{ sm: 10, md: 6 }}>
                <Grid container spacing={1} justifyContent="center">
                  <Grid size={12}>
                    <Typography variant="h2">
                      Create beautiful yet powerful
                      <Box sx={{ display: 'block' }}>
                        <Box component="span" sx={{ mr: 1, color: 'primary.main' }}>
                          Web Apps
                        </Box>
                        with Mantis React
                      </Box>
                    </Typography>
                  </Grid>
                  <Grid size={12}>
                    <Typography
                      variant="body1"
                      sx={(theme) => ({ color: 'secondary.600', ...theme.applyStyles('dark', { color: 'secondary.400' }) })}
                    >
                      Create your powerful backend project using powerful design system of Mantis React Template.
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={9}>
            <Box sx={{ position: 'relative', mb: 3 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 150, damping: 30, delay: 0.4 }}
              >
                <CardMedia
                  component="img"
                  image={`/assets/images/landing/img-element-main-${presetColor}.png`}
                  sx={{ width: '100%', m: '0 auto' }}
                />
              </motion.div>
              <Box
                sx={(theme) => ({
                  width: 'auto',
                  position: 'absolute',
                  top: '3%',
                  right: '-17%',
                  animation: '10s slideY linear infinite',
                  animationDelay: '2s',
                  [theme.breakpoints.down('sm')]: { display: 'none' }
                })}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 150,
                    damping: 30,
                    delay: 0.4
                  }}
                >
                  <CardMedia
                    component="img"
                    image={imgelementmsg}
                    sx={(theme) => ({
                      width: 'auto',
                      position: 'absolute',
                      top: '3%',
                      right: '-17%',
                      [theme.breakpoints.down('sm')]: { display: 'none' }
                    })}
                  />
                </motion.div>
              </Box>
              <Box
                sx={(theme) => ({
                  position: 'absolute',
                  bottom: '20%',
                  left: '-17%',
                  width: 'auto',
                  animation: '10s slideY linear infinite',
                  animationDelay: '2s',
                  [theme.breakpoints.down('sm')]: { display: 'none' }
                })}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 150, damping: 30, delay: 0.4 }}
                >
                  <CardMedia
                    component="img"
                    image={imgelementwidget}
                    sx={(theme) => ({
                      width: 'auto',
                      position: 'absolute',
                      bottom: '20%',
                      left: '-17%',
                      [theme.breakpoints.down('sm')]: { display: 'none' }
                    })}
                  />
                </motion.div>
              </Box>
            </Box>
          </Grid>
          <Grid size={9}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 3 }}>
                <Grid container spacing={1}>
                  <Grid>{checkIcon}</Grid>
                  <Grid size="grow">
                    <Typography variant="body1" sx={{ color: 'secondary.400' }}>
                      Mock API
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Grid container spacing={1}>
                  <Grid>{checkIcon}</Grid>
                  <Grid size="grow">
                    <Typography variant="body1" sx={{ color: 'secondary.400' }}>
                      RTL Support
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Grid container spacing={1}>
                  <Grid>{checkIcon}</Grid>
                  <Grid size="grow">
                    <Typography variant="body1" sx={{ color: 'secondary.400' }}>
                      Auth Methods: JWT, Auth0, Firebase, AWS, Supabase
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Grid container spacing={1}>
                  <Grid>{checkIcon}</Grid>
                  <Grid size="grow">
                    <Typography variant="body1" sx={{ color: 'secondary.400' }}>
                      Code Splitting
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Grid container spacing={1}>
                  <Grid>{checkIcon}</Grid>
                  <Grid size="grow">
                    <Typography variant="body1" sx={{ color: 'secondary.400' }}>
                      Google Fonts
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Grid container spacing={1}>
                  <Grid>{checkIcon}</Grid>
                  <Grid size="grow">
                    <Typography variant="body1" sx={{ color: 'secondary.400' }}>
                      Internationalization Support
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Grid container spacing={1}>
                  <Grid>{checkIcon}</Grid>
                  <Grid size="grow">
                    <Typography variant="body1" sx={{ color: 'secondary.400' }}>
                      Light/Dark
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Grid container spacing={1}>
                  <Grid>{checkIcon}</Grid>
                  <Grid size="grow">
                    <Typography variant="body1" sx={{ color: 'secondary.400' }}>
                      React Hooks
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Grid container spacing={1}>
                  <Grid>{checkIcon}</Grid>
                  <Grid size="grow">
                    <Typography variant="body1" sx={{ color: 'secondary.400' }}>
                      Prettier Code Style
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
