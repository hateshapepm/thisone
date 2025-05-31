// material-ui
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import CardMedia from '@mui/material/CardMedia';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import AnimateButton from 'components/@extended/AnimateButton';
import MainCard from 'components/MainCard';

const avatar = '/assets/images/users/avatar-group.png';

// ==============================|| DRAWER CONTENT - NAVIGATION CARD ||============================== //

export default function NavCard() {
  return (
    <MainCard sx={{ bgcolor: 'grey.50', m: 3 }}>
      <Stack sx={{ gap: 2.5, alignItems: 'center' }}>
        <CardMedia component="img" image={avatar} />
        <Stack sx={{ alignItems: 'center' }}>
          <Typography variant="h5">Help?</Typography>
          <Typography variant="h6" color="secondary">
            Get to resolve query
          </Typography>
        </Stack>
        <AnimateButton>
          <Button variant="shadow" size="small" component={Link} href="https://codedthemes.support-hub.io/" target="_blank">
            Support
          </Button>
        </AnimateButton>
      </Stack>
    </MainCard>
  );
}
