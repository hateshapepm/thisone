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

// assets
const defaultLayout = '/assets/images/customization/default.svg';
const containerLayout = '/assets/images/customization/container.svg';

// ==============================|| CUSTOMIZATION - CONTAINER ||============================== //

export default function ThemeWidth() {
  const { container, onChangeContainer } = useConfig();

  const handleContainerChange = (e) => {
    const newValue = e.target.value === 'container';
    onChangeContainer(newValue);
  };

  const activeCardStyle = (theme) => ({
    bgcolor: 'primary.lighter',
    boxShadow: theme.customShadows.primary,
    '&:hover': { boxShadow: theme.customShadows.primary }
  });

  return (
    <RadioGroup
      row
      aria-label="theme-width"
      name="theme-width"
      value={container ? 'container' : 'fluid'}
      onChange={handleContainerChange}
      sx={{ px: 1.5 }}
    >
      <Grid container spacing={2}>
        <Grid>
          <FormControlLabel
            control={<Radio value="fluid" sx={{ display: 'none' }} />}
            sx={{ display: 'flex', '& .MuiFormControlLabel-label': { flex: 1 } }}
            label={
              <MainCard
                content={false}
                border={false}
                boxShadow
                sx={(theme) => ({ bgcolor: 'secondary.lighter', p: 1, ...(!container && { ...activeCardStyle(theme) }) })}
              >
                <Stack sx={{ gap: 1.25, alignItems: 'center' }}>
                  <CardMedia component="img" src={defaultLayout} alt="Vertical" sx={{ borderRadius: 1, width: 64, height: 64 }} />
                  <Typography variant="caption">Fluid</Typography>
                </Stack>
              </MainCard>
            }
          />
        </Grid>
        <Grid>
          <FormControlLabel
            control={<Radio value="container" sx={{ display: 'none' }} />}
            sx={{ display: 'flex', '& .MuiFormControlLabel-label': { flex: 1 } }}
            label={
              <MainCard
                content={false}
                border={false}
                boxShadow
                sx={(theme) => ({ bgcolor: 'secondary.lighter', p: 1, ...(container && { ...activeCardStyle(theme) }) })}
              >
                <Stack sx={{ gap: 1.25, alignItems: 'center' }}>
                  <CardMedia component="img" src={containerLayout} alt="Vertical" sx={{ borderRadius: 1, width: 64, height: 64 }} />
                  <Typography variant="caption">Container</Typography>
                </Stack>
              </MainCard>
            }
          />
        </Grid>
      </Grid>
    </RadioGroup>
  );
}
