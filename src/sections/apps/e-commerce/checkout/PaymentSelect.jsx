import PropTypes from 'prop-types';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import MainCard from 'components/MainCard';

// ==============================|| CHECKOUT PAYMENT - OPTIONS ||============================== //

export default function PaymentSelect({ item }) {
  return (
    <MainCard content={false} sx={(theme) => ({ '&:hover': { boxShadow: theme.customShadows.primary } })}>
      <Box sx={{ p: 2, py: 1, pr: 0 }}>
        <FormControlLabel
          value={item.value}
          control={<Radio />}
          label={
            <Stack sx={{ gap: 0.5, width: '100%' }}>
              <Stack direction="row" sx={{ gap: 2.5, alignItems: 'center', justifyContent: 'space-between', width: 1 }}>
                <Typography variant="subtitle1">{item.title}</Typography>
                <Box
                  sx={{
                    backgroundImage: `url(${item.image})`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'right',
                    borderColor: 'error.light',
                    ...item.size
                  }}
                />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {item.caption}
              </Typography>
            </Stack>
          }
          sx={{
            width: '100%',
            alignItems: 'flex-start',
            '& .MuiSvgIcon-root': { fontSize: 32 },
            '& .MuiFormControlLabel-label': { width: '100%' },
            '& .MuiRadio-root': { p: 0, pl: 1, pr: 1, pt: 0.5 }
          }}
        />
      </Box>
    </MainCard>
  );
}

PaymentSelect.propTypes = { item: PropTypes.any };
