import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Rating from '@mui/material/Rating';
import Skeleton from '@mui/material/Skeleton';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import Colors from './Colors';

// ==============================|| PRODUCT GRID GENDER FILTER ||============================== //

function Gender({ gender, handleFilter }) {
  const [isGenderLoading, setGenderLoading] = useState(true);

  useEffect(() => {
    setGenderLoading(false);
  }, []);

  return (
    <Stack>
      {isGenderLoading ? (
        <Skeleton variant="rectangular" width="100%" height={42} />
      ) : (
        <>
          <Typography variant="h5">Gender</Typography>
          <Box sx={{ pl: 0.5 }}>
            <Stack>
              <FormControlLabel
                control={<Checkbox checked={gender.some((item) => item === 'male')} />}
                onChange={() => handleFilter('gender', 'male')}
                label="Male"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={gender.some((item) => item === 'female')}
                    onChange={() => handleFilter('gender', 'female')}
                    color="secondary"
                  />
                }
                label="Female"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={gender.some((item) => item === 'kids')}
                    onChange={() => handleFilter('gender', 'kids')}
                    color="error"
                  />
                }
                label="Kids"
              />
            </Stack>
          </Box>
        </>
      )}
    </Stack>
  );
}

// ==============================|| PRODUCT GRID - CATEGORIES FILTER ||============================== //

function Categories({ categories, handleFilter }) {
  const [isCategoriesLoading, setCategoriesLoading] = useState(true);
  useEffect(() => {
    setCategoriesLoading(false);
  }, []);

  return (
    <Stack>
      {isCategoriesLoading ? (
        <Skeleton variant="rectangular" width="100%" height={96} />
      ) : (
        <>
          <Typography variant="h5">Categories</Typography>
          <Box sx={{ pl: 0.5 }}>
            <Stack>
              <FormControlLabel
                control={<Checkbox checked={categories.some((item) => item === 'all')} />}
                onChange={() => handleFilter('categories', 'all')}
                label="All"
              />
              <FormControlLabel
                control={<Checkbox checked={categories.some((item) => item === 'electronics')} />}
                onChange={() => handleFilter('categories', 'electronics')}
                label="Electronics"
              />
              <FormControlLabel
                control={<Checkbox checked={categories.some((item) => item === 'fashion')} />}
                onChange={() => handleFilter('categories', 'fashion')}
                label="Fashion"
              />
              <FormControlLabel
                control={<Checkbox checked={categories.some((item) => item === 'books')} />}
                onChange={() => handleFilter('categories', 'books')}
                label="Book"
              />
              <FormControlLabel
                control={<Checkbox checked={categories.some((item) => item === 'toys')} />}
                onChange={() => handleFilter('categories', 'toys')}
                label="Toys"
              />
              <FormControlLabel
                control={<Checkbox checked={categories.some((item) => item === 'kitchen')} />}
                onChange={() => handleFilter('categories', 'kitchen')}
                label="Home & Kitchen"
              />
            </Stack>
          </Box>
        </>
      )}
    </Stack>
  );
}

// ==============================|| PRODUCT GRID - PRICE FILTER ||============================== //

function Price({ handleFilter }) {
  const [isPriceLoading, setPriceLoading] = useState(true);
  useEffect(() => {
    setPriceLoading(false);
  }, []);

  const valuetext = (value) => `${value}`;

  const [value, setValue] = useState([0, 300]);
  const handleSlider = (event, newValue) => {
    setValue(newValue);
    const data = `${newValue[0]}-${newValue[1]}`;
    handleFilter('price', data);
  };

  return (
    <>
      {isPriceLoading ? (
        <Skeleton variant="rectangular" width="100%" height={172} />
      ) : (
        <Stack sx={{ gap: 1 }}>
          <Typography variant="h5">Price</Typography>
          <Typography variant="caption">{`$${value[0]} - $${value[1]}`}</Typography>
          <Box sx={{ px: 0.75 }}>
            <Slider min={0} max={1000} value={value} onChange={handleSlider} valueLabelDisplay="auto" getAriaValueText={valuetext} />
          </Box>
        </Stack>
      )}
    </>
  );
}

// ==============================|| PRODUCT GRID - RATING FILTER ||============================== //

function RatingSection({ rating, handleFilter }) {
  const [isRatingLoading, setRatingLoading] = useState(true);
  useEffect(() => {
    setRatingLoading(false);
  }, []);

  return (
    <>
      {isRatingLoading ? (
        <Skeleton variant="rectangular" width="100%" height={172} />
      ) : (
        <Stack sx={{ gap: 1 }}>
          <Typography variant="h5">Rating</Typography>
          <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
            <Rating
              precision={0.5}
              name="simple-controlled"
              value={rating}
              onChange={(event, newValue) => handleFilter('rating', '', newValue)}
            />
            <Typography component="legend">({rating})</Typography>
          </Stack>
        </Stack>
      )}
    </>
  );
}

// ==============================|| PRODUCT GRID - FILTER ||============================== //

export default function ProductFilter({ filter, handleFilter }) {
  return (
    <Grid container direction="column" rowSpacing={3}>
      <Grid>
        <Gender gender={filter.gender} handleFilter={handleFilter} />
      </Grid>
      <Grid>
        <Categories categories={filter.categories} handleFilter={handleFilter} />
      </Grid>
      <Grid>
        <Colors colors={filter.colors} handleFilter={handleFilter} />
      </Grid>
      <Grid>
        <Price handleFilter={handleFilter} />
      </Grid>
      <Grid>
        <RatingSection rating={filter.rating} handleFilter={handleFilter} />
      </Grid>
    </Grid>
  );
}

Gender.propTypes = { gender: PropTypes.array, handleFilter: PropTypes.func };

Categories.propTypes = { categories: PropTypes.array, handleFilter: PropTypes.func };

Price.propTypes = { handleFilter: PropTypes.string, params: PropTypes.string };

RatingSection.propTypes = { rating: PropTypes.number, handleFilter: PropTypes.func };

ProductFilter.propTypes = { filter: PropTypes.any, handleFilter: PropTypes.func };
