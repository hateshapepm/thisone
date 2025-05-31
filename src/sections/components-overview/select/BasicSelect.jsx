import { useState } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';

// project imports
import MainCard from 'components/MainCard';

// ==============================|| COMPONENTS - BASIC ||============================== //

export default function BasicSelect() {
  const [age, setAge] = useState('');

  const handleChange = (event) => {
    setAge(event.target.value);
  };

  return (
    <MainCard title="Basic" codeHighlight>
      <Grid container spacing={2.5}>
        <Grid size={12}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>Age</InputLabel>
            <FormControl fullWidth>
              <Select labelId="demo-simple-select-label" id="demo-simple-select" value={age} onChange={handleChange}>
                <MenuItem value={10}>Ten</MenuItem>
                <MenuItem value={20}>Twenty</MenuItem>
                <MenuItem value={30}>Thirty</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Grid>
        <Grid size={12}>
          <FormControl fullWidth>
            <Select value={age} onChange={handleChange} displayEmpty slotProps={{ input: { 'aria-label': 'Without label' } }}>
              <MenuItem value="" sx={{ color: 'text.secondary' }}>
                Without label
              </MenuItem>
              <MenuItem value={10}>Ten</MenuItem>
              <MenuItem value={20}>Twenty</MenuItem>
              <MenuItem value={30}>Thirty</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </MainCard>
  );
}
