// next
import NextLink from 'next/link';

// material-ui
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { motion } from 'framer-motion';

// project imports
import AnimateButton from 'components/@extended/AnimateButton';

// assets
import EyeOutlined from '@ant-design/icons/EyeOutlined';
const headertechimg = '/assets/images/landing/img-headertech.svg';

// ==============================|| LANDING - HEADER PAGE ||============================== //

export default function HeaderPage() {
  return (
    <Container sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Grid container alignItems="center" justifyContent="space-between" spacing={2} sx={{ pt: { md: 0, xs: 8 }, pb: { md: 0, xs: 5 } }}>
        <Grid size={{ xs: 12, lg: 5, md: 6 }}>
          <Grid
            container
            spacing={2}
            sx={(theme) => ({
              pr: { xs: 0, md: 10 },
              [theme.breakpoints.down('md')]: { textAlign: 'center', justifyContent: 'center', alignItems: 'center' }
            })}
          >
            <Grid size={12}>
              <motion.div
                initial={{ opacity: 0, translateY: 550 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', stiffness: 150, damping: 30 }}
              >
                <Typography
                  variant="h1"
                  color="white"
                  sx={{
                    fontSize: { xs: '1.825rem', sm: '2rem', md: '2.5rem' },
                    fontWeight: 700,
                    lineHeight: { xs: 1.3, sm: 1.3, md: 1.3 }
                  }}
                >
                  <span>Carefully Crafted for your </span>
                  <Box component="span" sx={{ color: 'primary.main' }}>
                    <span>Caring React </span>
                  </Box>
                  <span>Project</span>
                </Typography>
              </motion.div>
            </Grid>
            <Grid size={12}>
              <motion.div
                initial={{ opacity: 0, translateY: 550 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', stiffness: 150, damping: 30, delay: 0.2 }}
              >
                <Typography
                  variant="h6"
                  color="white"
                  sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, fontWeight: 400, lineHeight: { xs: 1.4, md: 1.4 } }}
                >
                  Mantis React is a blazing-fast dashboard template built using the MUI React library.
                </Typography>
              </motion.div>
            </Grid>
            <Grid sx={{ my: 3.25 }} size={12}>
              <motion.div
                initial={{ opacity: 0, translateY: 550 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', stiffness: 150, damping: 30, delay: 0.4 }}
              >
                <Grid container spacing={2} sx={{ justifyContent: { xs: 'center', md: 'flex-start' } }}>
                  <Grid>
                    <AnimateButton>
                      <Button component={NextLink} href="/components-overview/buttons" size="large" color="primary" variant="outlined">
                        Explore Components
                      </Button>
                    </AnimateButton>
                  </Grid>
                  <Grid>
                    <AnimateButton>
                      <Button
                        component={NextLink}
                        href="/login"
                        target="_blank"
                        size="large"
                        color="primary"
                        variant="contained"
                        startIcon={<EyeOutlined style={{ fontSize: '1.15rem' }} />}
                      >
                        Live Preview
                      </Button>
                    </AnimateButton>
                  </Grid>
                </Grid>
              </motion.div>
            </Grid>
            <Grid size={{ xs: 'auto', md: 12 }}>
              <motion.div
                initial={{ opacity: 0, translateY: 550 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', stiffness: 150, damping: 30, delay: 0.6 }}
              >
                <CardMedia component="img" sx={{ width: 'auto' }} src={headertechimg} alt="Mantis" style={{ zIndex: 9 }} />
              </motion.div>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}
