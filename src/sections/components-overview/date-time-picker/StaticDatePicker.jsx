'use client';

import { useState } from 'react';

// material-ui
import Stack from '@mui/material/Stack';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';

// project imports
import MainCard from 'components/MainCard';

// ==============================|| DATE PICKER - STATIC ||============================== //

export default function ComponentStaticDatePicker() {
  const [value, setValue] = useState(new Date());

  return (
    <MainCard title="Static Mode">
      <Stack sx={{ gap: 3 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <StaticDatePicker
            displayStaticWrapperAs="desktop"
            openTo="year"
            value={value}
            onChange={(newValue) => {
              setValue(newValue);
            }}
          />
        </LocalizationProvider>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <StaticDatePicker
            displayStaticWrapperAs="desktop"
            openTo="day"
            value={value}
            onChange={(newValue) => {
              setValue(newValue);
            }}
          />
        </LocalizationProvider>
      </Stack>
    </MainCard>
  );
}
