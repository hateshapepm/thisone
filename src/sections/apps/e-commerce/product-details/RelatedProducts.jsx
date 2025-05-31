import PropTypes from 'prop-types';
import { useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Rating from '@mui/material/Rating';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import SimpleBar from 'components/third-party/SimpleBar';

import { useGetReleatedProducts } from 'api/products';
import { openSnackbar } from 'api/snackbar';

// assets
import HeartFilled from '@ant-design/icons/HeartFilled';
import HeartOutlined from '@ant-design/icons/HeartOutlined';
import StarFilled from '@ant-design/icons/StarFilled';
import StarOutlined from '@ant-design/icons/StarOutlined';

function ListProduct({ product }) {
  const [wishlisted, setWishlisted] = useState(false);
  const addToFavourite = () => {
    setWishlisted(!wishlisted);
    openSnackbar({
      open: true,
      message: !wishlisted ? 'Added to favorites' : 'Removed from favorites',
      variant: 'alert',
      alert: { color: 'success' }
    });
  };

  return (
    <ListItem
      component={ListItemButton}
      divider
      secondaryAction={
        <IconButton
          size="medium"
          color={wishlisted ? 'error' : 'secondary'}
          sx={{ opacity: wishlisted ? 1 : 0.5, '&:hover': { bgcolor: 'transparent' } }}
          onClick={addToFavourite}
        >
          {wishlisted ? <HeartFilled style={{ fontSize: '1.15rem' }} /> : <HeartOutlined style={{ fontSize: '1.15rem' }} />}
        </IconButton>
      }
    >
      <ListItemAvatar>
        <Avatar
          alt="Avatar"
          size="xl"
          color="secondary"
          variant="rounded"
          type="combined"
          src={product.image ? `/assets/images/e-commerce/thumbs/${product.image}` : ''}
          sx={{ borderColor: 'divider', mr: 1 }}
        />
      </ListItemAvatar>
      <ListItemText
        disableTypography
        primary={<Typography variant="h5">{product.name}</Typography>}
        secondary={
          <Stack sx={{ gap: 1 }}>
            <Typography color="text.secondary">{product.description}</Typography>
            <Stack sx={{ gap: 1 }}>
              <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
                <Typography variant="h5">{product.salePrice ? `$${product.salePrice}` : `$${product.offerPrice}`}</Typography>
                {product.salePrice && (
                  <Typography variant="h6" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                    ${product.offerPrice}
                  </Typography>
                )}
              </Stack>
              <Rating
                name="simple-controlled"
                value={product.rating < 4 ? product.rating + 1 : product.rating}
                icon={<StarFilled style={{ fontSize: 'small' }} />}
                emptyIcon={<StarOutlined style={{ fontSize: 'small' }} />}
                readOnly
                precision={0.1}
              />
            </Stack>
          </Stack>
        }
      />
    </ListItem>
  );
}

// ==============================|| PRODUCT DETAILS - RELATED PRODUCTS ||============================== //

export default function RelatedProducts({ id }) {
  const { relatedProductsLoading, relatedProducts } = useGetReleatedProducts(id);

  let productResult = (
    <List>
      {[1, 2, 3].map((index) => (
        <ListItem key={index}>
          <ListItemAvatar sx={{ minWidth: 72 }}>
            <Skeleton variant="rectangular" width={62} height={62} />
          </ListItemAvatar>
          <ListItemText
            primary={<Skeleton animation="wave" height={22} />}
            secondary={
              <>
                <Skeleton animation="wave" height={14} width="60%" />
                <Skeleton animation="wave" height={18} width="20%" />
                <Skeleton animation="wave" height={14} width="35%" />
              </>
            }
          />
        </ListItem>
      ))}
    </List>
  );

  if (!relatedProductsLoading && relatedProducts) {
    productResult = (
      <List
        component="nav"
        sx={{
          '& .MuiListItemButton-root': {
            '& .MuiListItemSecondaryAction-root': {
              alignSelf: 'flex-start',
              ml: 1,
              position: 'relative',
              right: 'auto',
              top: 'auto',
              transform: 'none'
            },
            '& .MuiListItemAvatar-root': { mr: '7px' },
            py: 0.5,
            pl: '15px',
            pr: '8px'
          },
          p: 0
        }}
      >
        {relatedProducts.map((product, index) => (
          <ListProduct key={index} product={product} />
        ))}
      </List>
    );
  }

  return (
    <SimpleBar sx={{ height: { xs: '100%', md: 'calc(100% - 62px)' } }}>
      <Stack>
        {productResult}
        <Button color="secondary" variant="outlined" sx={{ mx: 2, my: 4, textTransform: 'none' }}>
          View all Products
        </Button>
      </Stack>
    </SimpleBar>
  );
}

ListProduct.propTypes = { product: PropTypes.any };

RelatedProducts.propTypes = { id: PropTypes.string };
