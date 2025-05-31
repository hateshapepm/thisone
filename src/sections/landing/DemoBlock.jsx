// next
import NextLink from 'next/link';

// material-ui
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import AnimateButton from 'components/@extended/AnimateButton';
import MainCard from 'components/MainCard';
import Animation from './Animation';

// assets
import SendOutlined from '@ant-design/icons/SendOutlined';
const imgdemo1 = '/assets/images/landing/img-demo1.jpg';
const imgdemo2 = '/assets/images/landing/img-demo2.jpg';
const imgdemo3 = '/assets/images/landing/img-demo3.jpg';

// ==============================|| LANDING - DEMO PAGE ||============================== //

export default function DemoBlock() {
  return (
    <Container>
      <Grid container alignItems="center" justifyContent="center" spacing={2} sx={{ mt: { md: 15, xs: 2.5 }, mb: { md: 10, xs: 2.5 } }}>
        <Grid size={12}>
          <Grid container spacing={1} justifyContent="center" sx={{ mb: 4, textAlign: 'center' }}>
            <Grid size={{ sm: 10, md: 6 }}>
              <Grid container spacing={1} justifyContent="center">
                <Grid size={12}>
                  <Typography variant="subtitle1" color="primary">
                    Mantis for All
                  </Typography>
                </Grid>
                <Grid size={12}>
                  <Typography variant="h2" sx={{ mb: 2 }}>
                    Complete Combo
                  </Typography>
                </Grid>
                <Grid size={12}>
                  <Typography
                    variant="body1"
                    sx={(theme) => ({ color: 'secondary.600', ...theme.applyStyles('dark', { color: 'secondary.400' }) })}
                  >
                    Whether you are developer or designer, Mantis serve the need of all - No matter you are novice or expert
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid size={{ xs: 12, sm: 4, md: 4 }}>
          <Animation
            variants={{
              visible: { opacity: 1 },
              hidden: { opacity: 0 }
            }}
          >
            <MainCard contentSX={{ p: 3 }}>
              <Grid container spacing={1.5}>
                <Grid size={12}>
                  <Typography variant="h3" sx={{ fontWeight: 600, mt: 2 }}>
                    Design Source File
                  </Typography>
                </Grid>
                <Grid size={12}>
                  <Typography variant="body1" color="secondary">
                    Check the live preview of Mantis figma design file. Figma file included in Plus and Extended License only.
                  </Typography>
                </Grid>
                <Grid size={12}>
                  <Box sx={{ display: 'inline-block' }}>
                    <AnimateButton>
                      <Button
                        variant="outlined"
                        endIcon={<SendOutlined />}
                        sx={{ my: 2 }}
                        component={Link}
                        href="https://www.figma.com/file/NJGFukWMHgU0LVhS4qLP4A/Mantis?node-id=106412%3A169520"
                        target="_blank"
                      >
                        Preview Figma
                      </Button>
                    </AnimateButton>
                  </Box>
                </Grid>
                <Grid sx={{ '& img': { mb: -3.75, width: `calc(100% + 24px)` } }} size={12}>
                  <CardMedia component="img" src={imgdemo2} alt="feature" />
                </Grid>
              </Grid>
            </MainCard>
          </Animation>
        </Grid>
        <Grid size={{ xs: 12, sm: 4, md: 4 }}>
          <Animation
            variants={{
              visible: { opacity: 1 },
              hidden: { opacity: 0 }
            }}
          >
            <MainCard contentSX={{ p: 3, bgcolor: 'primary.lighter' }}>
              <Grid container spacing={1.5}>
                <Grid size={12}>
                  <Typography variant="h3" sx={{ fontWeight: 600, mt: 2 }}>
                    Components
                  </Typography>
                </Grid>
                <Grid size={12}>
                  <Typography variant="body1" color="secondary">
                    Check the all components of Mantis in single place with search feature for easing your development while working.
                  </Typography>
                </Grid>
                <Grid size={12}>
                  <Box sx={{ display: 'inline-block' }}>
                    <AnimateButton>
                      <Button variant="contained" sx={{ my: 2 }} component={NextLink} href="/components-overview/buttons" target="_blank">
                        View All Components
                      </Button>
                    </AnimateButton>
                  </Box>
                </Grid>
                <Grid sx={{ '& img': { mb: -3.75, width: `calc(100% + 24px)` } }} size={12}>
                  <CardMedia component="img" src={imgdemo1} alt="feature" />
                </Grid>
              </Grid>
            </MainCard>
          </Animation>
        </Grid>
        <Grid size={{ xs: 12, sm: 4, md: 4 }}>
          <Animation
            variants={{
              visible: { opacity: 1 },
              hidden: { opacity: 0 }
            }}
          >
            <MainCard contentSX={{ p: 3 }}>
              <Grid container spacing={1.5}>
                <Grid size={12}>
                  <Typography variant="h3" sx={{ fontWeight: 600, mt: 2 }}>
                    Documentation
                  </Typography>
                </Grid>
                <Grid size={12}>
                  <Typography variant="body1" color="secondary">
                    From Quick start to detailed installation with super easy navigation for find out solution of your queries with
                    developer-friendly documentation guide.
                  </Typography>
                </Grid>
                <Grid size={12}>
                  <Box sx={{ display: 'inline-block' }}>
                    <AnimateButton>
                      <Button
                        variant="outlined"
                        sx={{ my: 2 }}
                        component={Link}
                        href="https://codedthemes.gitbook.io/mantis/"
                        target="_blank"
                      >
                        Explore Documentation
                      </Button>
                    </AnimateButton>
                  </Box>
                </Grid>
                <Grid sx={{ '& img': { mb: -3.75, width: `calc(100% + 24px)` } }} size={12}>
                  <CardMedia component="img" src={imgdemo3} alt="feature" />
                </Grid>
              </Grid>
            </MainCard>
          </Animation>
        </Grid>
      </Grid>
    </Container>
  );
}
