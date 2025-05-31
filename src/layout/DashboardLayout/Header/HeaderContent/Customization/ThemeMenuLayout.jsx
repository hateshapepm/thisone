import useMediaQuery from '@mui/material/useMediaQuery';
import CardMedia from '@mui/material/CardMedia';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';

import useConfig from 'hooks/useConfig';
import { handlerDrawerOpen } from 'api/menu';
import { MenuOrientation, ThemeDirection } from 'config';

// assets
const defaultLayout = '/assets/images/customization/default.svg';
const containerLayout = '/assets/images/customization/container.svg';

// ==============================|| CUSTOMIZATION - CONTAINER ||============================== //

export default function ThemeMenuLayout() {
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  const { menuOrientation, onChangeMenuOrientation, onChangeMiniDrawer, onChangeDirection } = useConfig();
  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downLG;

  const handleContainerChange = (e) => {
    if (e.target.value === MenuOrientation.HORIZONTAL) {
      onChangeMiniDrawer(true);
      onChangeDirection(ThemeDirection.LTR);
      onChangeMenuOrientation(e.target.value);
      handlerDrawerOpen(false);
    } else {
      onChangeMiniDrawer(true);
      onChangeDirection(ThemeDirection.LTR);
      onChangeMenuOrientation(e.target.value);
      handlerDrawerOpen(true);
    }
  };

  const activeCardStyle = (theme) => ({
    bgcolor: 'primary.lighter',
    boxShadow: theme.customShadows.primary,
    '&:hover': { boxShadow: theme.customShadows.primary }
  });

  return (
    <RadioGroup row aria-label="menu-layout" name="menu-layout" value={menuOrientation} onChange={handleContainerChange} sx={{ px: 1.5 }}>
      <Grid container spacing={2}>
        <Grid>
          <FormControlLabel
            control={<Radio value={MenuOrientation.VERTICAL} sx={{ display: 'none' }} />}
            sx={{ display: 'flex', '& .MuiFormControlLabel-label': { flex: 1 } }}
            label={
              <MainCard
                content={false}
                border={false}
                boxShadow
                sx={(theme) => ({ bgcolor: 'secondary.lighter', p: 1, ...(!isHorizontal && { ...activeCardStyle(theme) }) })}
              >
                <Stack sx={{ gap: 1.25, alignItems: 'center' }}>
                  <CardMedia component="img" src={defaultLayout} alt="Vertical" sx={{ borderRadius: 1, width: 64, height: 64 }} />
                  <Typography variant="caption">Vertical</Typography>
                </Stack>
              </MainCard>
            }
          />
        </Grid>
        <Grid>
          <FormControlLabel
            control={<Radio value={MenuOrientation.HORIZONTAL} sx={{ display: 'none' }} />}
            sx={{ display: 'flex', '& .MuiFormControlLabel-label': { flex: 1 } }}
            label={
              <MainCard
                content={false}
                border={false}
                boxShadow
                sx={(theme) => ({ bgcolor: 'secondary.lighter', p: 1, ...(isHorizontal && { ...activeCardStyle(theme) }) })}
              >
                <Stack sx={{ gap: 1.25, alignItems: 'center' }}>
                  <CardMedia component="img" src={containerLayout} alt="horizontal" sx={{ borderRadius: 1, width: 64, height: 64 }} />
                  <Typography variant="caption">Horizontal</Typography>
                </Stack>
              </MainCard>
            }
          />
        </Grid>
      </Grid>
    </RadioGroup>
  );
}
