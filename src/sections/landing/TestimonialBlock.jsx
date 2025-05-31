import PropTypes from 'prop-types';
// material-ui
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import Slider from 'react-slick';

// project imports
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';

// ================================|| TESTIMONIAL - ITEMS ||================================ //

function Item({ item }) {
  return (
    <MainCard sx={{ mx: 2 }} contentSX={{ p: 3 }}>
      <Grid container spacing={1}>
        <Grid>
          <Avatar src={item.image ? `/assets/images/landing/clients/${item.image}` : undefined} alt={item.client}>
            {item.client.slice(0, 1)}
          </Avatar>
        </Grid>
        <Grid size={{ sm: 'grow' }}>
          <Grid container spacing={1}>
            <Grid size={12}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {item.title}
              </Typography>
              <Rating name="read-only" readOnly value={item.rating} size="small" precision={0.5} />
            </Grid>
            <Grid size={12}>
              <Typography variant="body1" color="secondary">
                {item.review}
              </Typography>
            </Grid>
            <Grid size={12}>
              <Typography variant="subtitle2">{item.client}</Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </MainCard>
  );
}

// ==============================|| LANDING - TESTIMONIAL PAGE ||============================== //

export default function TestimonialBlock() {
  const settings = {
    autoplay: true,
    arrows: false,
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1
  };

  const items = [
    {
      title: 'Design Quality',
      review:
        'Mantis dashboard template is the best! Its clean design shortened the app development time. It provides various components so I could easily implement the UI I wanted, and the community is active so I could solve problems quickly. I highly recommend it!!',
      rating: 5,
      client: 'TAEJIN J.'
    },
    {
      image: 'brandons.jpeg',
      title: 'Customer Support',
      review: 'A beautiful template and amazing, fast support team to go with it!',
      rating: 5,
      client: 'Brandon S.'
    },
    {
      image: 'yingchun.jpeg',
      title: 'Customer Support',
      review:
        'I strongly recommend mantis react theme, that is very usefully, can help more and more productivity for our internal project, BTW my license have expired, my computer break, i lost my mantis code, i contact the mantis team, it send my a new download link, Thank you very much to them for their professional service',
      rating: 4,
      client: 'yingchun t.'
    },
    {
      title: 'Customizability',
      review:
        'I am very grateful for this template both code and design as well as customer service. It has really helped de-mystify and accelerate the process immensely. Thank you!',
      rating: 5,
      client: 'Emma M.'
    },
    {
      image: 'prajwal.jpeg',
      title: 'Design Quality',
      review: 'Very satisfied so far! Great team work',
      rating: 5,
      client: 'Prajwal S.'
    },
    {
      image: 'atishay.jpeg',
      title: 'Customizability',
      review: 'A really nice to have theme, It checks all the boxes of the perfect react theme built on top of material UI',
      rating: 5,
      client: 'Atishay J.'
    }
  ];

  return (
    <Box sx={{ overflowX: 'hidden' }}>
      <Container>
        <Grid container alignItems="center" justifyContent="center" spacing={2} sx={{ mt: { md: 15, xs: 2.5 }, mb: { md: 10, xs: 2.5 } }}>
          <Grid size={12}>
            <Grid container spacing={1} justifyContent="center" sx={{ mb: 4, textAlign: 'center' }}>
              <Grid size={{ sm: 10, md: 6 }}>
                <Grid container spacing={1} justifyContent="center">
                  <Grid size={12}>
                    <Typography variant="subtitle1" color="primary">
                      Testament
                    </Typography>
                  </Grid>
                  <Grid size={12}>
                    <Typography variant="h2">Customers Voice</Typography>
                  </Grid>
                  <Grid size={12}>
                    <Typography
                      variant="body1"
                      sx={(theme) => ({ color: 'secondary.600', ...theme.applyStyles('dark', { color: 'secondary.400' }) })}
                    >
                      We have proven records in Dashboard development with an average 4.72/5 ratings. We are glad to show such a warm
                      reveiws from our loyal customers.
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid sx={{ '& .slick-list': { overflow: 'visible' } }} size={{ lg: 6, md: 8, xs: 12 }}>
            <Slider {...settings}>
              {items.map((item, index) => (
                <Item key={index} item={item} />
              ))}
            </Slider>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

Item.propTypes = { item: PropTypes.object };
