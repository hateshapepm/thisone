'use client';
import { useState } from 'react';

// material-ui
import { styled, useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

// project imports
import MainCard from 'components/MainCard';
import ComponentHeader from 'components/cards/ComponentHeader';
import ComponentWrapper from 'sections/components-overview/ComponentWrapper';
import ComponentSkeleton from 'sections/components-overview/ComponentSkeleton';

// assets
import DeleteTwoTone from '@ant-design/icons/DeleteTwoTone';
import HeartFilled from '@ant-design/icons/HeartFilled';
import MinusSquareFilled from '@ant-design/icons/MinusSquareFilled';
import PlayCircleFilled from '@ant-design/icons/PlayCircleFilled';
import SmileFilled from '@ant-design/icons/SmileFilled';

const ListItem = styled('li')(({ theme }) => ({
  margin: theme.spacing(0.5)
}));

ListItem.displayName = 'ListItem';

// ==============================|| COMPONENTS - CHIPS ||============================== //

export default function ComponentChip() {
  const theme = useTheme();

  const [chipData, setChipData] = useState([
    { key: 0, label: 'Angular' },
    { key: 1, label: 'jQuery' },
    { key: 2, label: 'Polymer' },
    { key: 3, label: 'React' },
    { key: 4, label: 'Vue.js' }
  ]);
  const handleDelete = (chipToDelete) => () => {
    setChipData((chips) => chips.filter((chip) => chip.key !== chipToDelete.key));
  };

  return (
    <ComponentSkeleton>
      <ComponentHeader
        title="Chips"
        caption="Chips are compact elements that represent an input, attribute, or action."
        directory="src/pages/components-overview/chips"
        link="https://mui.com/material-ui/react-chip/"
      />
      <ComponentWrapper>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <MainCard title="Basic">
              <Grid container spacing={2}>
                <Grid>
                  <Chip label="Default" />
                </Grid>
                <Grid>
                  <Chip label="Color" color="primary" />
                </Grid>
                <Grid>
                  <Chip label="Disabled" color="primary" disabled />
                </Grid>
                <Grid>
                  <Chip label="Clickable" color="primary" onClick={() => {}} />
                </Grid>
                <Grid>
                  <Chip label="Deletable" color="primary" onDelete={() => {}} />
                </Grid>
                <Grid>
                  <Chip
                    avatar={<Avatar variant="rounded" alt="Natacha" src="/assets/images/users/avatar-1.png" />}
                    label="Avatar"
                    color="primary"
                  />
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <MainCard title="Outlined">
              <Grid container spacing={2}>
                <Grid>
                  <Chip label="Default" variant="outlined" />
                </Grid>
                <Grid>
                  <Chip label="Color" variant="outlined" color="primary" />
                </Grid>
                <Grid>
                  <Chip label="Disabled" variant="outlined" color="primary" disabled />
                </Grid>
                <Grid>
                  <Chip label="Clickable" variant="outlined" color="primary" onClick={() => {}} />
                </Grid>
                <Grid>
                  <Chip label="Deletable" variant="outlined" color="primary" onDelete={() => {}} />
                </Grid>
                <Grid>
                  <Chip
                    variant="outlined"
                    avatar={<Avatar variant="rounded" alt="Natacha" src="/assets/images/users/avatar-6.png" />}
                    label="Avatar"
                    color="primary"
                  />
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <MainCard title="Lighter">
              <Grid container spacing={2}>
                <Grid>
                  <Chip label="Default" variant="light" />
                </Grid>
                <Grid>
                  <Chip label="Color" variant="light" color="primary" />
                </Grid>
                <Grid>
                  <Chip label="Disabled" variant="light" color="primary" disabled />
                </Grid>
                <Grid>
                  <Chip label="Clickable" variant="light" color="primary" onClick={() => {}} />
                </Grid>
                <Grid>
                  <Chip label="Deletable" variant="light" color="primary" onDelete={() => {}} />
                </Grid>
                <Grid>
                  <Chip
                    variant="light"
                    avatar={<Avatar variant="rounded" alt="Natacha" src="/assets/images/users/avatar-6.png" />}
                    label="Avatar"
                    color="primary"
                  />
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <MainCard title="Combined">
              <Grid container spacing={2}>
                <Grid>
                  <Chip label="Default" variant="combined" />
                </Grid>
                <Grid>
                  <Chip label="Color" variant="combined" color="primary" />
                </Grid>
                <Grid>
                  <Chip label="Disabled" variant="combined" color="primary" disabled />
                </Grid>
                <Grid>
                  <Chip label="Clickable" variant="combined" color="primary" onClick={() => {}} />
                </Grid>
                <Grid>
                  <Chip label="Deletable" variant="combined" color="primary" onDelete={() => {}} />
                </Grid>
                <Grid>
                  <Chip
                    variant="combined"
                    avatar={<Avatar variant="rounded" alt="Natacha" src="/assets/images/users/avatar-6.png" />}
                    label="Avatar"
                    color="primary"
                  />
                </Grid>
              </Grid>
            </MainCard>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <MainCard title="Deletable Icon">
              <Grid container spacing={2}>
                <Grid>
                  <Chip label="Default" onDelete={() => {}} color="error" />
                </Grid>
                <Grid>
                  <Chip
                    label="Custom Icon"
                    onDelete={() => {}}
                    color="error"
                    deleteIcon={<MinusSquareFilled style={{ fontSize: '1.15rem' }} />}
                  />
                </Grid>
                <Grid>
                  <Chip
                    variant="outlined"
                    label="Custom Icon"
                    onDelete={() => {}}
                    color="error"
                    deleteIcon={<DeleteTwoTone twoToneColor={theme.palette.error.main} style={{ fontSize: '1.15rem' }} />}
                  />
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <MainCard title="Avatar & Icon">
              <Grid container spacing={2}>
                <Grid>
                  <Chip color="secondary" variant="light" icon={<PlayCircleFilled />} label="Play" />
                </Grid>
                <Grid>
                  <Chip
                    variant="combined"
                    color="primary"
                    avatar={<Avatar variant="rounded" alt="Natacha" src="/assets/images/users/avatar-6.png" />}
                    label="Avatar"
                  />
                </Grid>
                <Grid>
                  <Chip color="warning" variant="outlined" icon={<SmileFilled />} label="Smile" />
                </Grid>
                <Grid>
                  <Chip icon={<HeartFilled />} color="error" label="Like" />
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <MainCard title="Size">
              <Grid container spacing={2}>
                <Grid>
                  <Chip color="primary" label="Small" size="small" />
                </Grid>
                <Grid>
                  <Chip color="primary" label="Default" />
                </Grid>
                <Grid>
                  <Chip color="primary" label="Large" size="large" />
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <MainCard title="Array">
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  listStyle: 'none',
                  border: '1px solid',
                  borderColor: 'grey.300',
                  borderRadius: 1,
                  p: 0.5,
                  m: 0
                }}
                component="ul"
              >
                {chipData.map((data) => (
                  <ListItem key={data.key}>
                    <Chip
                      size="small"
                      variant="combined"
                      label={data.label}
                      onDelete={data.label === 'React' ? undefined : handleDelete(data)}
                    />
                  </ListItem>
                ))}
              </Box>
            </MainCard>
          </Grid>
          <Grid size={12}>
            <MainCard title="Color">
              <Grid container spacing={2}>
                <Grid>
                  <Chip label="Primary" color="primary" />
                </Grid>
                <Grid>
                  <Chip label="Secondary" color="secondary" />
                </Grid>
                <Grid>
                  <Chip label="Success" color="success" />
                </Grid>
                <Grid>
                  <Chip label="Warning" color="warning" />
                </Grid>
                <Grid>
                  <Chip label="Info" color="info" />
                </Grid>
                <Grid>
                  <Chip label="Error" color="error" />
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
        </Grid>
      </ComponentWrapper>
    </ComponentSkeleton>
  );
}
