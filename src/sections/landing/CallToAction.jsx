// material-ui
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { motion } from 'framer-motion';

// project imports
import AnimateButton from 'components/@extended/AnimateButton';
import { ThemeDirection } from 'config';

// assets
import DownloadOutlined from '@ant-design/icons/DownloadOutlined';
const imgbg = '/assets/images/landing/img-bg-screen.png';

// ==============================|| LANDING - CALL TO ACTION PAGE ||============================== //

export default function CallToActionPage() {
  return (
    <Box
      sx={(theme) => ({
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'secondary.800',
        ...theme.applyStyles('dark', { bgcolor: 'grey.100' }),
        '&:after': {
          content: '""',
          position: 'absolute',
          width: '100%',
          height: '80%',
          bottom: 0,
          left: 0,
          background: `linear-gradient(180deg, transparent, ${theme.palette.secondary[800]})`,
          ...theme.applyStyles('dark', { background: `linear-gradient(180deg, transparent, ${theme.palette.secondary[100]})` })
        }
      })}
    >
      <CardMedia
        component="img"
        image={imgbg}
        sx={(theme) => ({
          width: 'auto',
          position: 'absolute',
          top: 0,
          right: 0,
          opacity: { sm: 0.25, md: 1 },
          ...(theme.direction === ThemeDirection.RTL && { transform: 'scaleX(-1)', float: 'none' })
        })}
      />
      <Container>
        <Grid
          container
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
          sx={{
            position: 'relative',
            zIndex: 1,
            pt: { md: 18.75, xs: 7.5 },
            pb: { md: 10, xs: 3.75 }
          }}
        >
          <Grid sx={{ position: 'relative', zIndex: 1 }} size={{ xs: 12, md: 7 }}>
            <Grid container spacing={2} sx={(theme) => ({ [theme.breakpoints.down('md')]: { pr: 0, textAlign: 'center' } })}>
              <Grid size={12}>
                <motion.div
                  initial={{ opacity: 0, translateY: 550 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 150,
                    damping: 30
                  }}
                >
                  <Typography
                    variant="h2"
                    sx={{
                      color: 'common.white',
                      fontSize: { xs: '1.25rem', sm: '1.56rem', md: '1.875rem' },
                      fontWeight: 700,
                      lineHeight: { xs: 1.4, sm: 1.4, md: 1.4 }
                    }}
                  >
                    <Box component="span" sx={{ mx: 0 }}>
                      Check Mantis
                    </Box>
                    <Box component="span" sx={{ mx: 0, color: 'primary.main' }}>
                      &nbsp;Free&nbsp;
                    </Box>
                    Version Before Purchase
                  </Typography>
                </motion.div>
              </Grid>
              <Grid sx={{ my: 3.25 }} size={12}>
                <motion.div
                  initial={{ display: 'inline-block', opacity: 0, translateY: 550 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 150,
                    damping: 30,
                    delay: 0.2
                  }}
                >
                  <AnimateButton>
                    <Button
                      component={Link}
                      target="_blank"
                      href="https://github.com/codedthemes/mantis-free-react-admin-template"
                      size="large"
                      color="primary"
                      variant="contained"
                      startIcon={<DownloadOutlined />}
                    >
                      Download Now
                    </Button>
                  </AnimateButton>
                </motion.div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
