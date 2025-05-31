import PropTypes from 'prop-types';
// material-ui
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// ==============================|| CUSTOMER - VIEW ||============================== //

export default function ProductView({ data }) {
  return (
    <Grid container spacing={2.5} sx={{ pl: { xs: 0, sm: 5, md: 6, lg: 10, xl: 12 } }}>
      <Grid size={{ xs: 6, sm: 5, md: 4, lg: 3 }}>
        <Box sx={{ position: 'relative' }}>
          <Box sx={{ bgcolor: 'grey.200', width: '100%' }}>
            <CardMedia component="img" src={data.image && `/assets/images/e-commerce/${data.image}`} alt="product" sx={{ width: 1 }} />
          </Box>
          <Chip
            label={data.isStock ? 'In Stock' : 'Out of Stock'}
            color={data.isStock ? 'success' : 'error'}
            variant="light"
            sx={{ position: 'absolute', right: 15, top: 15 }}
          />
        </Box>
      </Grid>
      <Grid size={{ xs: 12, sm: 7, md: 8, lg: 9 }}>
        <Stack sx={{ gap: 1, px: 2 }}>
          <Typography variant="h5">{data?.name}</Typography>
          <Typography color="text.secondary">{data?.about}</Typography>
          <Rating name="read-only" value={data.rating} readOnly />
          <Box sx={{ width: '80%', pt: 2 }}>
            <Grid container spacing={1}>
              <Grid size={{ xs: 4, md: 3 }}>
                <Typography color="text.secondary">Categories</Typography>
              </Grid>
              <Grid size={{ xs: 8, md: 9 }}>
                <Stack direction="row" sx={{ gap: 0.5 }}>
                  {data?.categories?.map((item, index) => (
                    <Typography key={index} variant="h6" sx={{ textTransform: 'capitalize' }}>
                      {item}
                      {data?.categories.length > index + 1 ? ',' : ''}
                    </Typography>
                  ))}
                </Stack>
              </Grid>
              <Grid size={{ xs: 4, md: 3 }}>
                <Typography color="text.secondary">Qty</Typography>
              </Grid>
              <Grid size={{ xs: 8, md: 9 }}>
                <Typography variant="h6">{data?.quantity}</Typography>
              </Grid>
              <Grid size={{ xs: 4, md: 3 }}>
                <Typography color="text.secondary">Price</Typography>
              </Grid>
              <Grid size={{ xs: 8, md: 9 }}>
                <Typography variant="h5">{data?.salePrice ? `$${data?.salePrice}` : `$${data?.offerPrice}`}</Typography>
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </Grid>
    </Grid>
  );
}

ProductView.propTypes = { data: PropTypes.any };
