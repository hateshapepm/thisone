import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

// next
import NextLink from 'next/link';

// material-ui
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

// third-party
import { sum } from 'lodash-es';
import currency from 'currency.js';

// project imports
import CartDiscount from './CartDiscount';
import OrderSummary from './OrderSummery';
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import Avatar from 'components/@extended/Avatar';
import ColorOptions from '../products/ColorOptions';

// assets
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import LeftOutlined from '@ant-design/icons/LeftOutlined';
import MinusOutlined from '@ant-design/icons/MinusOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';

// product color select
function getColor(color) {
  return ColorOptions.filter((item) => item.value === color);
}

function Increment({ itemId, quantity, updateQuantity }) {
  const [value, setValue] = useState(quantity);

  const incrementHandler = () => {
    setValue(value - 1);
    updateQuantity(itemId, value - 1);
  };

  const decrementHandler = () => {
    setValue(value + 1);
    updateQuantity(itemId, value + 1);
  };

  return (
    <Stack direction="row">
      <Button
        key="three"
        variant="text"
        disabled={value <= 1}
        onClick={incrementHandler}
        sx={{ pr: 0.75, pl: 0.75, minWidth: '0px !important', '&:hover': { bgcolor: 'transparent' } }}
      >
        <MinusOutlined style={{ fontSize: 'inherit' }} />
      </Button>
      <Typography key="two" sx={{ p: '9px 15px', border: '1px solid', borderColor: 'grey.A800' }}>
        {value}
      </Typography>
      <Button
        key="one"
        variant="text"
        onClick={decrementHandler}
        sx={{ pl: 0.75, pr: 0.75, minWidth: '0px !important', '&:hover': { bgcolor: 'transparent' } }}
      >
        <PlusOutlined style={{ fontSize: 'inherit' }} />
      </Button>
    </Stack>
  );
}

export default function Cart({ checkout, onNext, removeProduct, updateQuantity }) {
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [rows, setRows] = useState(checkout.products);

  useEffect(() => {
    setRows(checkout.products);
    setTotalQuantity(sum(checkout.products.map((item) => item.quantity)));
  }, [checkout.products]);

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 8 }}>
        <Stack sx={{ gap: 2 }}>
          <MainCard content={false}>
            <Grid container>
              <Grid sx={{ py: 2.5, pl: 2.5 }} size={12}>
                <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                  <Typography variant="subtitle1">Cart</Typography>
                  <Avatar color="secondary" size="xs">
                    {totalQuantity}
                  </Avatar>
                </Stack>
              </Grid>
              <Grid size={12}>
                <Divider />
              </Grid>
              <Grid size={12}>
                <TableContainer>
                  <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableBody>
                      {rows.map((row, index) => {
                        const colorsData = row.color ? getColor(row.color) : false;
                        return (
                          <TableRow key={index} sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}>
                            <TableCell component="th" scope="row">
                              <Grid container alignItems="center" spacing={2}>
                                <Grid>
                                  <Avatar
                                    size="lg"
                                    variant="rounded"
                                    color="secondary"
                                    type="combined"
                                    src={row.image ? `/assets/images/e-commerce/thumbs/${row.image}` : ''}
                                  />
                                </Grid>
                                <Grid>
                                  <Stack>
                                    <Typography
                                      component={NextLink}
                                      href={`/apps/e-commerce/product-details/${row.id}`}
                                      target="_blank"
                                      variant="subtitle1"
                                      color="text.primary"
                                      sx={{ textDecoration: 'none' }}
                                    >
                                      {row.name}
                                    </Typography>
                                    <Typography color="text.secondary">{colorsData ? colorsData[0].label : 'Multicolor'}</Typography>
                                  </Stack>
                                </Grid>
                              </Grid>
                            </TableCell>
                            <TableCell align="right">
                              <Stack sx={{ alignItems: 'center' }}>
                                {row.offerPrice && row.quantity && (
                                  <Typography variant="subtitle1">{currency(row.offerPrice * row.quantity).format()}</Typography>
                                )}
                              </Stack>
                            </TableCell>
                            <TableCell align="right">
                              <Increment quantity={row.quantity} itemId={row.itemId} updateQuantity={updateQuantity} />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                onClick={() => removeProduct(row.itemId)}
                                size="medium"
                                sx={{ color: 'grey.400', '&:hover': { bgcolor: 'transparent', color: 'error.main' } }}
                              >
                                <DeleteOutlined />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </MainCard>
          <Grid sx={{ textAlign: 'right' }}>
            <Button
              color="secondary"
              component={NextLink}
              href="/apps/e-commerce/products"
              passHref
              variant="text"
              startIcon={<LeftOutlined />}
            >
              <Typography variant="h6" color="text.primary">
                Back to Shopping
              </Typography>
            </Button>
          </Grid>
        </Stack>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Stack sx={{ gap: 3 }}>
          <MainCard>
            <CartDiscount />
          </MainCard>
          <OrderSummary checkout={checkout} show />
          <Button variant="contained" sx={{ textTransform: 'none' }} fullWidth onClick={onNext}>
            Process to Checkout
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
}

Increment.propTypes = {
  itemId: PropTypes.oneOfType([PropTypes.any, PropTypes.string, PropTypes.number]),
  quantity: PropTypes.number,
  updateQuantity: PropTypes.func
};

Cart.propTypes = { checkout: PropTypes.any, onNext: PropTypes.func, removeProduct: PropTypes.func, updateQuantity: PropTypes.func };
