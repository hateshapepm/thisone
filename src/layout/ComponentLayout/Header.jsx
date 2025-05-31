'use client';

// next
import NextLink from 'next/link';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Toolbar from '@mui/material/Toolbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import Logo from 'components/logo';
import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';

import { APP_DEFAULT_PATH } from 'config';
import useUser from 'hooks/useUser';
import { handlerComponentDrawer, useGetMenuMaster } from 'api/menu';

// assets
import MenuOutlined from '@ant-design/icons/MenuOutlined';

// ==============================|| COMPONENTS - APP BAR ||============================== //

export default function Header() {
  const user = useUser();
  const { menuMaster } = useGetMenuMaster();

  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));

  return (
    <AppBar
      sx={(theme) => ({
        bgcolor: 'grey.800',
        ...theme.applyStyles('dark', { bgcolor: 'grey.50' }),
        color: 'text.primary',
        boxShadow: 'none'
      })}
    >
      <Container disableGutters={downMD}>
        <Toolbar sx={{ px: { xs: 1.5, md: 0, lg: 0 }, py: 2 }}>
          <Stack direction="row" sx={{ alignItems: 'center', flexGrow: 1, display: { xs: 'none', md: 'block' } }}>
            <Typography sx={{ textAlign: 'left', display: 'inline-block' }}>
              <Logo reverse to="/" />
            </Typography>
            <Chip
              label={process.env.NEXT_PUBLIC_VERSION}
              variant="outlined"
              size="small"
              color="secondary"
              sx={{ mt: 0.5, ml: 1, fontSize: '0.725rem', height: 20, '& .MuiChip-label': { px: 0.5 } }}
            />
          </Stack>
          <Stack sx={{ '& .header-link': { px: 2, '&:hover': { color: 'primary.main' } }, display: { xs: 'none', md: 'block' } }}>
            <Link className="header-link" color="white" component={NextLink} href="/login" target="_blank" underline="none">
              Dashboard
            </Link>
            <Link className="header-link" color="primary" component={NextLink} href="/components-overview/buttons" underline="none">
              Components
            </Link>
            <Link className="header-link" color="white" href="https://codedthemes.gitbook.io/mantis/" target="_blank" underline="none">
              Documentation
            </Link>
            <Box sx={{ display: 'inline-block', ml: 1 }}>
              <AnimateButton>
                <Button
                  component={Link}
                  href="https://mui.com/store/items/mantis-react-admin-dashboard-template/"
                  target="_blank"
                  disableElevation
                  color="primary"
                  variant="contained"
                >
                  Purchase Now
                </Button>
              </AnimateButton>
            </Box>
          </Stack>
          <Box sx={{ width: '100%', alignItems: 'center', justifyContent: 'space-between', display: { xs: 'flex', md: 'none' } }}>
            <Typography sx={{ textAlign: 'left', display: 'inline-block' }}>
              <Logo reverse to="/" />
            </Typography>
            <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
              <Button
                variant="outlined"
                size="small"
                color="warning"
                component={NextLink}
                href={user ? APP_DEFAULT_PATH : '/login'}
                sx={{ height: 28 }}
              >
                {user ? 'Dashboard' : 'Login'}
              </Button>

              <IconButton
                color="secondary"
                onClick={() => handlerComponentDrawer(!menuMaster.isComponentDrawerOpened)}
                sx={(theme) => ({
                  color: 'grey.100',
                  '&:hover': { bgcolor: 'secondary.dark', color: 'grey.100' },
                  ...theme.applyStyles('dark', { color: 'inherit', '&:hover': { bgcolor: 'secondary.lighter' } })
                })}
              >
                <MenuOutlined />
              </IconButton>
            </Stack>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
