// material-ui
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

// project imports
import MainCard from 'components/MainCard';
import data from 'data/movies';

// ==============================|| AUTOCOMPLETE - MULTIPLE ||============================== //

export default function MultipleAutocomplete() {
  return (
    <MainCard title="Multiple Tags">
      <Autocomplete
        multiple
        id="tags-outlined"
        options={data}
        renderOption={({ key, ...props }, option) => (
          <li key={key} {...props}>
            {option.label}
          </li>
        )}
        renderValue={(tagValue, getItemProps) => {
          return tagValue.map((option, index) => <Chip {...getItemProps({ index })} key={index} label={option.label} />);
        }}
        getOptionLabel={(option) => option.label}
        defaultValue={[data[7], data[13]]}
        filterSelectedOptions
        renderInput={(params) => <TextField {...params} placeholder="Favorites" />}
        sx={{
          '& .MuiOutlinedInput-root': {
            p: 1
          },
          '& .MuiAutocomplete-tag': {
            bgcolor: 'primary.lighter',
            border: '1px solid',
            borderColor: 'primary.light',
            '& .MuiSvgIcon-root': {
              color: 'primary.main',
              '&:hover': {
                color: 'primary.dark'
              }
            }
          }
        }}
      />
    </MainCard>
  );
}
