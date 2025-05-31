import PropTypes from 'prop-types';
// next
import NextLink from 'next/link';

import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';

// third-party
import { Chance } from 'chance';

// project imports
import MainCard from 'components/MainCard';
import { PopupTransition } from 'components/@extended/Transitions';

// assets
const completed = '/assets/images/e-commerce/completed.png';

const chance = new Chance();

// ==============================|| CHECKOUT - ORDER COMPLETE ||============================== //

export default function OrderComplete({ open }) {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));

  return (
    <Dialog open={open} fullScreen slots={{ transition: PopupTransition }} sx={{ '& .MuiDialog-paper': { bgcolor: 'background.paper' } }}>
      <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: '100vh' }}>
        <Grid>
          <MainCard border={false} sx={{ boxShadow: 'none' }}>
            <Stack sx={{ gap: 2, alignItems: 'center' }}>
              <Box sx={{ position: 'relative', width: { xs: 320, sm: 500 } }}>
                <CardMedia component="img" src={completed} alt="Order Complete" />
              </Box>
              <Typography variant={downMD ? 'h3' : 'h1'} align="center">
                Thank you for Purchase!
              </Typography>
              <Box sx={{ px: 2.5 }}>
                <Typography align="center" color="text.secondary">
                  We will send a process notification, before it delivered.
                </Typography>
                <Typography align="center" color="text.secondary">
                  Your order id:{' '}
                  <Typography variant="subtitle1" component="span" color="primary">
                    {chance.guid()}
                  </Typography>
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ py: { xs: 1, sm: 3 } }}>
                (219) 404-5468
              </Typography>
              <Stack direction="row" sx={{ gap: 3, justifyContent: 'center' }}>
                <Button
                  component={NextLink}
                  href="/apps/e-commerce/products"
                  variant="outlined"
                  color="secondary"
                  size={downMD ? 'small' : 'medium'}
                >
                  Continue Shopping
                </Button>
                <Button
                  component={NextLink}
                  href="/apps/e-commerce/products"
                  variant="contained"
                  color="primary"
                  size={downMD ? 'small' : 'medium'}
                >
                  Download Invoice
                </Button>
              </Stack>
            </Stack>
          </MainCard>
        </Grid>
      </Grid>
    </Dialog>
  );
}

OrderComplete.propTypes = { open: PropTypes.bool };
