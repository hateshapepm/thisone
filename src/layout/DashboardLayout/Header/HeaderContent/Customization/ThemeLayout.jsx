import { useState } from 'react';

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
import { MenuOrientation, ThemeDirection } from 'config';
import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';

// assets
const defaultLayout = '/assets/images/customization/default.svg';
const rtlLayout = '/assets/images/customization/rtl.svg';
const miniMenu = '/assets/images/customization/mini-menu.svg';

// ==============================|| CUSTOMIZATION - LAYOUT ||============================== //

export default function ThemeLayout() {
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  const { miniDrawer, themeDirection, onChangeThemeLayout, onChangeMiniDrawer, menuOrientation } = useConfig();

  let initialTheme = 'default';
  if (miniDrawer === true) initialTheme = 'mini';
  if (themeDirection === ThemeDirection.RTL && !miniDrawer) initialTheme = 'rtl';

  const [value, setValue] = useState(initialTheme);
  const handleRadioChange = (event) => {
    const newValue = event.target.value;
    setValue(newValue);
    switch (newValue) {
      case 'mini':
        onChangeMiniDrawer(true);
        if (drawerOpen) {
          handlerDrawerOpen(false);
        }
        break;
      case ThemeDirection.RTL:
        onChangeThemeLayout(ThemeDirection.RTL, false);
        if (!drawerOpen) {
          handlerDrawerOpen(true);
        }
        break;
      case 'default':
        onChangeThemeLayout(ThemeDirection.LTR, false);
        if (!drawerOpen) {
          handlerDrawerOpen(true);
        }
        break;
      default:
        handlerDrawerOpen(true);
        break;
    }
  };

  const activeCardStyle = (theme) => ({
    bgcolor: 'primary.lighter',
    boxShadow: theme.customShadows.primary,
    '&:hover': { boxShadow: theme.customShadows.primary }
  });

  return (
    <RadioGroup row aria-label="theme-layout" name="theme-layout" value={value} onChange={handleRadioChange} sx={{ px: 1.5 }}>
      <Grid container spacing={2}>
        <Grid>
          <FormControlLabel
            value="default"
            control={<Radio sx={{ display: 'none' }} />}
            sx={{ display: 'flex', '& .MuiFormControlLabel-label': { flex: 1 } }}
            label={
              <MainCard
                content={false}
                border={false}
                boxShadow
                sx={(theme) => ({ bgcolor: 'secondary.lighter', p: 1, ...(value === 'default' && { ...activeCardStyle(theme) }) })}
              >
                <Stack sx={{ gap: 1.25, alignItems: 'center' }}>
                  <CardMedia component="img" src={defaultLayout} alt="Vertical" sx={{ borderRadius: 1, width: 60, height: 60 }} />
                  <Typography variant="caption">Default</Typography>
                </Stack>
              </MainCard>
            }
          />
        </Grid>

        {(menuOrientation === MenuOrientation.VERTICAL || downLG) && (
          <Grid>
            <FormControlLabel
              value="mini"
              control={<Radio sx={{ display: 'none' }} />}
              sx={{ display: 'flex', '& .MuiFormControlLabel-label': { flex: 1 } }}
              label={
                <MainCard
                  content={false}
                  border={false}
                  boxShadow
                  sx={(theme) => ({ bgcolor: 'secondary.lighter', p: 1, ...(value === 'mini' && { ...activeCardStyle(theme) }) })}
                >
                  <Stack sx={{ gap: 1.25, alignItems: 'center' }}>
                    <CardMedia component="img" src={miniMenu} alt="Vertical" sx={{ borderRadius: 1, width: 60, height: 60 }} />
                    <Typography variant="caption">Mini Drawer</Typography>
                  </Stack>
                </MainCard>
              }
            />
          </Grid>
        )}

        <Grid>
          <FormControlLabel
            value="rtl"
            control={<Radio sx={{ display: 'none' }} />}
            sx={{ display: 'flex', '& .MuiFormControlLabel-label': { flex: 1 } }}
            label={
              <MainCard
                content={false}
                border={false}
                boxShadow
                sx={(theme) => ({
                  bgcolor: 'secondary.lighter',
                  p: 1,
                  ...(value === ThemeDirection.RTL && !miniDrawer && { ...activeCardStyle(theme) })
                })}
              >
                <Stack sx={{ gap: 1.25, alignItems: 'center' }}>
                  <CardMedia component="img" src={rtlLayout} alt="Vertical" sx={{ borderRadius: 1, width: 60, height: 60 }} />
                  <Typography variant="caption">RTL</Typography>
                </Stack>
              </MainCard>
            }
          />
        </Grid>
      </Grid>
    </RadioGroup>
  );
}
