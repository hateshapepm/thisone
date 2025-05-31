import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import BackLeft from './UserProfileBackLeft';
import BackRight from './UserProfileBackRight';
import MainCard from 'components/MainCard';
import ProfileRadialChart from './ProfileRadialChart';
import { ThemeDirection } from 'config';

// ==============================|| USER PROFILE - TOP CARD ||============================== //

export default function ProfileCard() {
  return (
    <MainCard border={false} content={false} sx={{ bgcolor: 'primary.lighter', position: 'relative' }}>
      <Box
        sx={(theme) => ({
          position: 'absolute',
          bottom: -7,
          left: 0,
          zIndex: 1,
          ...(theme.direction === ThemeDirection.RTL && { transform: 'rotate(180deg)', top: -7, bottom: 'unset' })
        })}
      >
        <BackLeft />
      </Box>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ position: 'relative', zIndex: 5 }}>
        <Grid>
          <Stack direction="row" sx={{ gap: { xs: 1, sm: 2 }, alignItems: 'center' }}>
            <Box sx={{ ml: { xs: 0, sm: 1.75 } }}>
              <ProfileRadialChart />
            </Box>
            <Stack sx={{ gap: 0.75 }}>
              <Typography variant="h5">Edit Your Profile</Typography>
              <Typography variant="body2" color="secondary">
                Complete your profile to unlock all features
              </Typography>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
      <Box
        sx={(theme) => ({
          position: 'absolute',
          top: 0,
          right: 0,
          zIndex: 1,
          ...(theme.direction === ThemeDirection.RTL && { transform: 'rotate(180deg)', top: -10, bottom: 'unset' })
        })}
      >
        <BackRight />
      </Box>
    </MainCard>
  );
}
