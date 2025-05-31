import PropTypes from 'prop-types';
import { useState } from 'react';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

// project imports
import SortOptions from 'sections/apps/e-commerce/products/SortOptions';
import MainCard from 'components/MainCard';

// assets
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import DownOutlined from '@ant-design/icons/DownOutlined';
import FilterOutlined from '@ant-design/icons/FilterOutlined';

export default function ProductsHeader({ filter, handleDrawerOpen, setFilter }) {
  const downSM = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  // sort options
  const [anchorEl, setAnchorEl] = useState(null);
  const openSort = Boolean(anchorEl);
  const handleClickListItem = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // search filter
  const handleSearch = async (event) => {
    const newString = event?.target.value;
    setFilter({ ...filter, search: newString });
  };

  // sort filter
  const handleMenuItemClick = (event, index) => {
    setFilter({ ...filter, sort: index });
    setAnchorEl(null);
  };

  const sortLabel = SortOptions.filter((items) => items.value === filter.sort);

  return (
    <MainCard content={false}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ gap: 2, alignItems: { xs: 'space-between', sm: 'center' }, justifyContent: { xs: 'center', sm: 'space-between' }, p: 2 }}
      >
        <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center', justifyContent: 'space-between' }}>
          <Button disableRipple onClick={handleDrawerOpen} color="secondary" startIcon={<FilterOutlined />}>
            Filter
          </Button>

          <TextField
            sx={{ '& .MuiOutlinedInput-input': { pl: 0 } }}
            value={filter.search}
            placeholder="Search Product"
            size="medium"
            onChange={handleSearch}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined style={{ fontSize: 'small' }} />
                  </InputAdornment>
                )
              }
            }}
          />
        </Stack>
        <Button
          id="demo-positioned-button"
          aria-controls="demo-positioned-menu"
          aria-haspopup="true"
          aria-expanded={openSort ? 'true' : undefined}
          onClick={handleClickListItem}
          variant="outlined"
          size="large"
          color="secondary"
          endIcon={<DownOutlined style={{ fontSize: 'small' }} />}
          sx={{ color: 'text.primary' }}
        >
          {sortLabel.length > 0 && sortLabel[0].label}
        </Button>
        <Menu
          id="demo-positioned-menu"
          aria-labelledby="demo-positioned-button"
          anchorEl={anchorEl}
          open={openSort}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: downSM ? 'center' : 'right'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: downSM ? 'center' : 'right'
          }}
        >
          {SortOptions.map((option, index) => (
            <MenuItem
              sx={{ p: 1.5 }}
              key={index}
              selected={option.value === filter.sort}
              onClick={(event) => handleMenuItemClick(event, option.value)}
            >
              {option.label}
            </MenuItem>
          ))}
        </Menu>
      </Stack>
    </MainCard>
  );
}

ProductsHeader.propTypes = { filter: PropTypes.any, handleDrawerOpen: PropTypes.func, setFilter: PropTypes.func };
