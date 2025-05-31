'use client';
import PropTypes from 'prop-types';

// material-ui
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import CardMedia from '@mui/material/CardMedia';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { motion } from 'framer-motion';

// project imports
import AnimateButton from 'components/@extended/AnimateButton';

import useConfig from 'hooks/useConfig';
import { ThemeDirection } from 'config';

// assets
import DiscordFilled from '@ant-design/icons/DiscordFilled';
import DribbbleSquareFilled from '@ant-design/icons/DribbbleSquareFilled';
import GithubFilled from '@ant-design/icons/GithubFilled';
import SendOutlined from '@ant-design/icons/SendOutlined';
import FacebookFilled from '@ant-design/icons/FacebookFilled';
import InstagramFilled from '@ant-design/icons/InstagramFilled';
import LinkedinFilled from '@ant-design/icons/LinkedinFilled';
import YoutubeFilled from '@ant-design/icons/YoutubeFilled';
import XOutlined from '@ant-design/icons/XOutlined';

const imgfooterlogo = '/assets/images/landing/codedthemes-logo.svg';
const figma = '/assets/images/icons/figma.svg';

// link - custom style
const FooterLink = styled(Link)(({ theme }) => ({
  color: theme.palette.secondary[400],
  '&:hover': { color: theme.palette.primary.main },
  '&:active': { color: theme.palette.primary.main }
}));

export default function FooterBlock({ isFull }) {
  const { presetColor } = useConfig();

  const linkSX = {
    color: 'common.white',
    fontSize: '1.1rem',
    fontWeight: 400,
    opacity: '0.6',
    cursor: 'pointer',
    '&:hover': {
      opacity: '1'
    }
  };

  const frameworks = [
    { title: 'Pro Figma UI Kit', link: 'https://codedthemes.com/item/mantis-figma-ui-kit/' },
    { title: 'CodeIgniter', link: 'https://codedthemes.com/item/mantis-codeigniter-admin-template/' },
    {
      title: 'Vue',
      link: 'https://codedthemes.com/item/mantis-vue-admin-template/'
    },
    {
      title: 'Angular',
      link: 'https://codedthemes.com/item/mantis-angular-admin-template/'
    },
    {
      title: 'Bootstrap 5',
      link: 'https://codedthemes.com/item/mantis-bootstrap-admin-dashboard/'
    },
    {
      title: '.Net',
      link: 'https://codedthemes.com/item/mantis-dotnet-bootstrap-dashboard-template/'
    }
  ];

  return (
    <>
      {isFull && (
        <Box
          sx={(theme) => ({
            position: 'relative',
            bgcolor: 'grey.A700',
            zIndex: 1,
            mt: { xs: 0, md: 13.75 },
            pt: { xs: 8, sm: 7.5, md: 18.75 },
            pb: { xs: 2.5, md: 10 },
            '&:after': {
              content: '""',
              position: 'absolute',
              width: '100%',
              height: '80%',
              bottom: 0,
              left: 0,
              background:
                theme.direction === ThemeDirection.RTL
                  ? `linear-gradient(transparent 100%, rgb(31, 31, 31) 70%)`
                  : `linear-gradient(180deg, transparent 0%, ${theme.palette.grey.A700} 70%)`
            }
          })}
        >
          <CardMedia
            component="img"
            image={`/assets/images/landing/img-footer-${presetColor}.png`}
            sx={(theme) => ({
              display: { xs: 'none', md: 'block' },
              width: '55%',
              maxWidth: 700,
              position: 'absolute',
              top: '-28%',
              right: 0,
              ...(theme.direction === ThemeDirection.RTL && { transform: 'scaleX(-1)', float: 'none' })
            })}
          />
          <Container>
            <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
              <Grid sx={{ position: 'relative', zIndex: 1 }} size={{ xs: 12, md: 6 }}>
                <Grid container spacing={2} sx={(theme) => ({ [theme.breakpoints.down('md')]: { pr: 0, textAlign: 'center' } })}>
                  <Grid size={12}>
                    <Typography variant="subtitle1" sx={{ color: 'common.white' }}>
                      Roadmap
                    </Typography>
                  </Grid>
                  <Grid size={12}>
                    <motion.div
                      initial={{ opacity: 0, translateY: 550 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      transition={{ type: 'spring', stiffness: 150, damping: 30 }}
                    >
                      <Typography variant="h2" sx={{ color: 'common.white', fontWeight: 700 }}>
                        Upcoming Release
                      </Typography>
                    </motion.div>
                  </Grid>
                  <Grid size={12}>
                    <Typography variant="body1" sx={{ color: 'secondary.400' }}>
                      What is next? Checkout the Upcoming release of Mantis React.
                    </Typography>
                  </Grid>
                  <Grid sx={{ my: 2 }} size={12}>
                    <Box sx={{ display: 'inline-block' }}>
                      <AnimateButton>
                        <Button
                          size="large"
                          variant="contained"
                          endIcon={<SendOutlined />}
                          component={Link}
                          href="https://codedthemes.gitbook.io/mantis/roadmap"
                          target="_blank"
                        >
                          Roadmap
                        </Button>
                      </AnimateButton>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Container>
        </Box>
      )}
      <Box sx={{ pt: isFull ? 0 : 10, pb: 10, bgcolor: 'grey.A700' }}>
        <Container>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <motion.div
                initial={{ opacity: 0, translateY: 550 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 150,
                  damping: 30
                }}
              >
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <CardMedia component="img" image={imgfooterlogo} sx={{ width: 'auto' }} />
                  </Grid>
                  <Grid size={12}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 400, color: 'common.white' }}>
                      Since 2017, More than 204K+ Developers trust the CodedThemes Digital Product. Mantis React is Manage under their
                      Experienced Team Players.
                    </Typography>
                  </Grid>
                </Grid>
              </motion.div>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Grid container spacing={{ xs: 5, md: 2 }}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Stack sx={{ gap: { xs: 3, md: 5 } }}>
                    <Typography
                      variant="h5"
                      sx={(theme) => ({
                        fontWeight: 500,
                        color: 'background.paper',
                        ...theme.applyStyles('dark', { color: 'text.primary' })
                      })}
                    >
                      Help
                    </Typography>
                    <Stack sx={{ gap: { xs: 1.5, md: 2.5 } }}>
                      <FooterLink href="https://blog.codedthemes.com/" target="_blank" underline="none">
                        Blog
                      </FooterLink>
                      <FooterLink href="https://codedthemes.gitbook.io/mantis/" target="_blank" underline="none">
                        Documentation
                      </FooterLink>
                      <FooterLink href="https://codedthemes.gitbook.io/mantis/changelog" target="_blank" underline="none">
                        Change Log
                      </FooterLink>
                      <FooterLink href="https://codedthemes.support-hub.io/" target="_blank" underline="none">
                        Support
                      </FooterLink>
                    </Stack>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Stack sx={{ gap: { xs: 3, md: 5 } }}>
                    <Typography
                      variant="h5"
                      sx={(theme) => ({
                        fontWeight: 500,
                        color: 'background.paper',
                        ...theme.applyStyles('dark', { color: 'text.primary' })
                      })}
                    >
                      Store Help
                    </Typography>
                    <Stack sx={{ gap: { xs: 1.5, md: 2.5 } }}>
                      <FooterLink href="https://mui.com/store/license/" target="_blank" underline="none">
                        License
                      </FooterLink>
                      <FooterLink href="https://mui.com/store/customer-refund-policy/" target="_blank" underline="none">
                        Refund Policy
                      </FooterLink>
                      <FooterLink
                        href="https://support.mui.com/hc/en-us/sections/360002564979-For-customers"
                        target="_blank"
                        underline="none"
                      >
                        Submit a Request
                      </FooterLink>
                    </Stack>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Stack sx={{ gap: { xs: 3, md: 5 } }}>
                    <Typography
                      variant="h5"
                      sx={(theme) => ({
                        fontWeight: 500,
                        color: 'background.paper',
                        ...theme.applyStyles('dark', { color: 'text.primary' })
                      })}
                    >
                      Mantis Eco-System
                    </Typography>
                    <Stack sx={{ gap: { xs: 1.5, md: 2.5 } }}>
                      {frameworks.map((item, index) => (
                        <FooterLink href={item.link} target="_blank" underline="none" key={index}>
                          {item.title}
                          {/* {item.isUpcoming && <Chip variant="outlined" size="small" label="Upcoming" sx={{ ml: 0.5 }} />} */}
                        </FooterLink>
                      ))}
                    </Stack>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Stack sx={{ gap: { xs: 3, md: 5 } }}>
                    <Typography
                      variant="h5"
                      sx={(theme) => ({
                        fontWeight: 500,
                        color: 'background.paper',
                        ...theme.applyStyles('dark', { color: 'text.primary' })
                      })}
                    >
                      More Products
                    </Typography>
                    <Stack sx={{ gap: { xs: 1.5, md: 2.5 } }}>
                      <FooterLink href="https://codedthemes.com/item/mantis-free-figma-ui-kit/" target="_blank" underline="none">
                        Free Mantis Figma UI Kit
                      </FooterLink>
                      <FooterLink href="http://mui.com/store/previews/berry-react-material-admin/" target="_blank" underline="none">
                        Berry React Material
                      </FooterLink>
                      <FooterLink href="https://mui.com/store/previews/berry-react-material-admin-free/" target="_blank" underline="none">
                        Free Berry React
                      </FooterLink>
                      <FooterLink href="https://github.com/codedthemes/mantis-free-react-admin-template" target="_blank" underline="none">
                        Free Mantis React
                      </FooterLink>
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Divider sx={{ borderColor: 'grey.700' }} />
      <Box
        sx={(theme) => ({ py: 1.5, pb: { xs: 7.5, sm: 1.5 }, bgcolor: 'grey.800', ...theme.applyStyles('dark', { bgcolor: 'grey.50' }) })}
      >
        <Container>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2" color="secondary" sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                © Made with love by Team{' '}
                <Link href="https://codedthemes.com/" target="_blank" underline="hover">
                  CodedThemes
                </Link>
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Grid container spacing={{ xs: 2.25, md: 3 }} alignItems="center" sx={{ justifyContent: { xs: 'center', sm: 'flex-end' } }}>
                <Grid>
                  <Link href="https://github.com/codedthemes" underline="none" target="_blank" sx={linkSX}>
                    <GithubFilled />
                  </Link>
                </Grid>
                <Grid>
                  <Link href="https://www.instagram.com/codedthemes" underline="none" target="_blank" sx={linkSX}>
                    <InstagramFilled />
                  </Link>
                </Grid>
                <Grid>
                  <Link href="https://discord.com/invite/p2E2WhCb6s" underline="none" target="_blank" sx={linkSX}>
                    <DiscordFilled />
                  </Link>
                </Grid>
                <Grid>
                  <Link href="https://www.youtube.com/channel/UCiZG__BaRkT1OuZl5ifzO6A" underline="none" target="_blank" sx={linkSX}>
                    <YoutubeFilled />
                  </Link>
                </Grid>
                <Grid>
                  <Link href="https://x.com/codedthemes/" underline="none" target="_blank" sx={linkSX}>
                    <XOutlined />
                  </Link>
                </Grid>
                <Grid>
                  <Link href="https://www.linkedin.com/company/codedthemes" underline="none" target="_blank" sx={linkSX}>
                    <LinkedinFilled />
                  </Link>
                </Grid>
                <Grid>
                  <Link href="https://www.facebook.com/codedthemes/" underline="none" target="_blank" sx={linkSX}>
                    <FacebookFilled />
                  </Link>
                </Grid>
                <Grid>
                  <Link href="https://dribbble.com/codedthemes" underline="none" target="_blank" sx={linkSX}>
                    <DribbbleSquareFilled />
                  </Link>
                </Grid>
                <Grid>
                  <Link href="https://www.figma.com/@codedthemes" underline="none" target="_blank" sx={linkSX}>
                    <Box
                      sx={(theme) => ({
                        p: 0.05,
                        borderRadius: '1px',
                        width: 16,
                        bgcolor: 'secondary.light',
                        ...theme.applyStyles('dark', { bgcolor: 'secondary.dark' })
                      })}
                    >
                      <CardMedia src={figma} component="img" />
                    </Box>
                  </Link>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}

FooterBlock.propTypes = { isFull: PropTypes.bool };
