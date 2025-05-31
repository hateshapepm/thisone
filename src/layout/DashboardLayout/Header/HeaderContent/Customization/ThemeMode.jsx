import CardMedia from '@mui/material/CardMedia';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';

import { ThemeMode } from 'config';
import useConfig from 'hooks/useConfig';

// assets
const defaultLayout = '/assets/images/customization/default.svg';
const darkLayout = '/assets/images/customization/dark.svg';

// ==============================|| CUSTOMIZATION - MODE ||============================== //

export default function ThemeModeLayout() {
  const { mode, onChangeMode } = useConfig();

  const handleModeChange = (event) => {
    onChangeMode(event.target.value);
  };

  const activeCardStyle = (theme) => ({
    bgcolor: 'primary.lighter',
    boxShadow: theme.customShadows.primary,
    '&:hover': { boxShadow: theme.customShadows.primary }
  });

  return (
    <RadioGroup row aria-label="payment-card" name="payment-card" value={mode} onChange={handleModeChange} sx={{ px: 1.5 }}>
      <Grid container spacing={2}>
        <Grid>
          <FormControlLabel
            control={<Radio value="light" sx={{ display: 'none' }} />}
            sx={{ display: 'flex', '& .MuiFormControlLabel-label': { flex: 1 } }}
            label={
              <MainCard
                content={false}
                border={false}
                boxShadow
                sx={(theme) => ({
                  bgcolor: 'secondary.lighter',
                  p: 1,
                  ...(mode === ThemeMode.LIGHT && { ...activeCardStyle(theme) })
                })}
              >
                <Stack sx={{ gap: 1.25, alignItems: 'center' }}>
                  <CardMedia component="img" src={defaultLayout} alt="Vertical" sx={{ borderRadius: 1, width: 64, height: 64 }} />
                  <Typography variant="caption">Light</Typography>
                </Stack>
              </MainCard>
            }
          />
        </Grid>
        <Grid>
          <FormControlLabel
            control={<Radio value="dark" sx={{ display: 'none' }} />}
            sx={{ display: 'flex', '& .MuiFormControlLabel-label': { flex: 1 } }}
            label={
              <MainCard
                content={false}
                border={false}
                boxShadow
                sx={(theme) => ({
                  bgcolor: 'secondary.lighter',
                  p: 1,
                  ...(mode !== ThemeMode.LIGHT && { ...activeCardStyle(theme) })
                })}
              >
                <Stack sx={{ gap: 1.25, alignItems: 'center' }}>
                  <CardMedia component="img" src={darkLayout} alt="Vertical" sx={{ borderRadius: 1, width: 64, height: 64 }} />
                  <Typography variant="caption">Dark</Typography>
                </Stack>
              </MainCard>
            }
          />
        </Grid>
      </Grid>
    </RadioGroup>
  );
}
