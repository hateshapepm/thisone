// material-ui
import CardMedia from '@mui/material/CardMedia';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';
import Animation from './Animation';

// assets
const imgfeature1 = '/assets/images/landing/img-feature1.svg';
const imgfeature2 = '/assets/images/landing/img-feature2.svg';
const imgfeature3 = '/assets/images/landing/img-feature3.svg';

// ==============================|| LANDING - FEATURE PAGE ||============================== //

export default function FeatureBlock() {
  return (
    <Container>
      <Grid container alignItems="center" justifyContent="center" spacing={2} sx={{ mt: { md: 15, xs: 2.5 }, mb: { md: 10, xs: 2.5 } }}>
        <Grid size={12}>
          <Grid container spacing={1} justifyContent="center" sx={{ mb: 4, textAlign: 'center' }}>
            <Grid size={{ sm: 10, md: 6 }}>
              <Grid container spacing={1} justifyContent="center">
                <Grid size={12}>
                  <Typography variant="subtitle1" color="primary">
                    Mantis nailed it!
                  </Typography>
                </Grid>
                <Grid size={12}>
                  <Typography variant="h2" sx={{ mb: 2 }}>
                    Why Mantis?
                  </Typography>
                </Grid>
                <Grid size={12}>
                  <Typography
                    variant="body1"
                    sx={(theme) => ({ color: 'secondary.600', ...theme.applyStyles('dark', { color: 'secondary.400' }) })}
                  >
                    Customize everything with the Mantis React Material-UI Dashboard Template built with latest MUI v6 component library
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Animation
            variants={{
              hidden: { opacity: 0, translateY: 550 },
              visible: { opacity: 1, translateY: 0 }
            }}
          >
            <MainCard contentSX={{ p: 3 }}>
              <Grid container spacing={1}>
                <Grid size={12}>
                  <CardMedia component="img" sx={{ width: 'auto' }} src={imgfeature1} alt="feature" />
                </Grid>
                <Grid size={12}>
                  <Typography variant="h5" sx={{ fontWeight: 600, mt: 2 }}>
                    Professional Design
                  </Typography>
                </Grid>
                <Grid size={12}>
                  <Typography variant="body1" color="secondary">
                    Mantis has fully professional grade user interface for any kind of backend project.
                  </Typography>
                </Grid>
              </Grid>
            </MainCard>
          </Animation>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Animation
            variants={{
              hidden: { opacity: 0, translateY: 550 },
              visible: { opacity: 1, translateY: 0 }
            }}
          >
            <MainCard contentSX={{ p: 3 }}>
              <Grid container spacing={1}>
                <Grid size={12}>
                  <CardMedia component="img" sx={{ width: 'auto' }} src={imgfeature2} alt="feature" />
                </Grid>
                <Grid size={12}>
                  <Typography variant="h5" sx={{ fontWeight: 600, mt: 2 }}>
                    Flexible Solution
                  </Typography>
                </Grid>
                <Grid size={12}>
                  <Typography variant="body1" color="secondary">
                    Highly flexible to work around using Mantis React Template.
                  </Typography>
                </Grid>
              </Grid>
            </MainCard>
          </Animation>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Animation
            variants={{
              hidden: { opacity: 0, translateY: 550 },
              visible: { opacity: 1, translateY: 0 }
            }}
          >
            <MainCard contentSX={{ p: 3 }}>
              <Grid container spacing={1}>
                <Grid size={12}>
                  <CardMedia component="img" sx={{ width: 'auto' }} src={imgfeature3} alt="feature" />
                </Grid>
                <Grid size={12}>
                  <Typography variant="h5" sx={{ fontWeight: 600, mt: 2 }}>
                    Effective Documentation
                  </Typography>
                </Grid>
                <Grid size={12}>
                  <Typography variant="body1" color="secondary">
                    Need help? Check out the detailed Documentation guide.
                  </Typography>
                </Grid>
              </Grid>
            </MainCard>
          </Animation>
        </Grid>
      </Grid>
    </Container>
  );
}
