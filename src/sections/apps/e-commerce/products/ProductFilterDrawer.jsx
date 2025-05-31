import PropTypes from 'prop-types';
// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';

// project imports
import ProductFilterView from './ProductFilterView';
import ProductFilter from './ProductFilter';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';

import useConfig from 'hooks/useConfig';

export default function ProductFilterDrawer({ filter, initialState, handleDrawerOpen, openFilterDrawer, setFilter }) {
  const { container } = useConfig();
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));
  const matchLG = useMediaQuery((theme) => theme.breakpoints.only('lg'));

  const filterIsEqual = (a1, a2) =>
    a1 === a2 ||
    (a1.length === a2.length &&
      a1.search === a2.search &&
      a1.sort === a2.sort &&
      a1.price === a2.price &&
      a1.rating === a2.rating &&
      JSON.stringify(a1.gender) === JSON.stringify(a2.gender) &&
      JSON.stringify(a1.categories) === JSON.stringify(a2.categories) &&
      JSON.stringify(a1.colors) === JSON.stringify(a2.colors));

  const handleFilter = (type, params, rating) => {
    switch (type) {
      case 'gender':
        if (filter.gender.some((item) => item === params)) {
          setFilter({ ...filter, gender: filter.gender.filter((item) => item !== params) });
        } else {
          setFilter({ ...filter, gender: [...filter.gender, params] });
        }
        break;
      case 'categories':
        if (filter.categories.some((item) => item === params)) {
          setFilter({ ...filter, categories: filter.categories.filter((item) => item !== params) });
        } else if (filter.categories.some((item) => item === 'all') || params === 'all') {
          setFilter({ ...filter, categories: [params] });
        } else {
          setFilter({ ...filter, categories: [...filter.categories, params] });
        }

        break;
      case 'colors':
        if (filter.colors.some((item) => item === params)) {
          setFilter({ ...filter, colors: filter.colors.filter((item) => item !== params) });
        } else {
          setFilter({ ...filter, colors: [...filter.colors, params] });
        }
        break;
      case 'price':
        setFilter({ ...filter, price: params });
        break;
      case 'search':
        setFilter({ ...filter, search: params });
        break;
      case 'sort':
        setFilter({ ...filter, sort: params });
        break;
      case 'rating':
        setFilter({ ...filter, rating: rating });
        break;
      case 'reset':
        setFilter(initialState);
        break;
      default:
      // no options
    }
  };

  const drawerContent = (
    <Stack sx={{ gap: 0.5, p: 3 }}>
      <ProductFilterView filter={filter} filterIsEqual={filterIsEqual} handleFilter={handleFilter} initialState={initialState} />
      <ProductFilter filter={filter} handleFilter={handleFilter} />
    </Stack>
  );

  return (
    <Drawer
      sx={{
        width: container && matchLG ? 240 : 320,
        flexShrink: 0,
        zIndex: { xs: 1200, lg: 0 },
        mr: openFilterDrawer && !downLG ? 2.5 : 0,
        '& .MuiDrawer-paper': {
          height: { xs: '100%', lg: 'auto' },
          width: container && matchLG ? 240 : 320,
          boxSizing: 'border-box',
          position: 'relative',
          boxShadow: 'none'
        }
      }}
      variant={downLG ? 'temporary' : 'persistent'}
      anchor="left"
      open={openFilterDrawer}
      ModalProps={{ keepMounted: true }}
      onClose={handleDrawerOpen}
    >
      <MainCard
        title="Filter"
        sx={{ bgcolor: 'background.paper', borderRadius: '4px 0 0 4px', borderRight: 'none' }}
        border={!downLG}
        content={false}
      >
        {downLG && <SimpleBar sx={{ height: 'calc(100vh - 60px)' }}>{drawerContent}</SimpleBar>}
        {!downLG && drawerContent}
      </MainCard>
    </Drawer>
  );
}

ProductFilterDrawer.propTypes = {
  filter: PropTypes.any,
  initialState: PropTypes.any,
  handleDrawerOpen: PropTypes.func,
  openFilterDrawer: PropTypes.oneOfType([PropTypes.any, PropTypes.bool]),
  setFilter: PropTypes.func
};
