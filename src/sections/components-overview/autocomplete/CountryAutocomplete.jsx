// material-ui
import Autocomplete from '@mui/material/Autocomplete';
import CardMedia from '@mui/material/CardMedia';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';

// project imports
import countries from 'data/countries';
import MainCard from 'components/MainCard';

// ==============================|| AUTOCOMPLETE - COUNTRY ||============================== //

export default function CountryAutocomplete() {
  return (
    <MainCard title="With Image">
      <Autocomplete
        id="country-select-demo"
        fullWidth
        options={countries}
        autoHighlight
        getOptionLabel={(option) => option.label}
        renderOption={({ key, ...props }, option) => (
          <Box key={key} component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
            {option.code && (
              <CardMedia
                component="img"
                loading="lazy"
                src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                alt="img"
                sx={{ width: 20 }}
              />
            )}
            {option.label} ({option.code}) +{option.phone}
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Choose a country"
            slotProps={{
              htmlInput: {
                ...params.inputProps,
                autoComplete: 'new-password' // disable autocomplete and autofill
              }
            }}
          />
        )}
      />
    </MainCard>
  );
}
