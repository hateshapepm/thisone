'use client';

// material-ui
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';

// project imports
import MainCard from 'components/MainCard';
import ComponentHeader from 'components/cards/ComponentHeader';
import Breadcrumb from 'components/@extended/Breadcrumbs';
import ComponentWrapper from 'sections/components-overview/ComponentWrapper';
import ComponentSkeleton from 'sections/components-overview/ComponentSkeleton';

// assets
import RightOutlined from '@ant-design/icons/RightOutlined';

// ==============================|| COMPONENTS - BREADCRUMBS ||============================== //

export default function ComponentBreadcrumb() {
  const theme = useTheme();

  return (
    <ComponentSkeleton>
      <ComponentHeader
        title="Breadcrumbs"
        caption="Breadcrumbs allow users to make selections from a range of values."
        directory="src/pages/components-overview/breadcrumbs"
        link="https://mui.com/material-ui/react-breadcrumbs/"
      />
      <ComponentWrapper>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <MainCard title="Basic">
              <Breadcrumb
                card
                title={false}
                sx={{ mb: '0px !important', bgcolor: 'grey.50', ...theme.applyStyles('dark', { bgcolor: 'dark.main' }) }}
              />
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <MainCard title="Custom Separator">
              <Breadcrumb
                card
                title={false}
                separator={RightOutlined}
                sx={{ mb: '0px !important', bgcolor: 'grey.50', ...theme.applyStyles('dark', { bgcolor: 'dark.main' }) }}
              />
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <MainCard title="With Title">
              <Breadcrumb
                card
                titleBottom={false}
                separator={RightOutlined}
                sx={{ mb: '0px !important', bgcolor: 'grey.50', ...theme.applyStyles('dark', { bgcolor: 'dark.main' }) }}
              />
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <MainCard title="Title Bottom">
              <Breadcrumb
                card
                separator={RightOutlined}
                sx={{ mb: '0px !important', bgcolor: 'grey.50', ...theme.applyStyles('dark', { bgcolor: 'dark.main' }) }}
              />
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <MainCard title="With Icons">
              <Breadcrumb
                card
                icons
                titleBottom={false}
                separator={RightOutlined}
                sx={{ mb: '0px !important', bgcolor: 'grey.50', ...theme.applyStyles('dark', { bgcolor: 'dark.main' }) }}
              />
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <MainCard title="Only Dashboard Icons">
              <Breadcrumb
                card
                title
                icon
                titleBottom={false}
                separator={RightOutlined}
                sx={{ mb: '0px !important', bgcolor: 'grey.50', ...theme.applyStyles('dark', { bgcolor: 'dark.main' }) }}
              />
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <MainCard title="Collapsed Breadcrumbs">
              <Breadcrumb
                card
                title
                titleBottom={false}
                maxItems={2}
                separator={RightOutlined}
                sx={{ mb: '0px !important', bgcolor: 'grey.50', ...theme.applyStyles('dark', { bgcolor: 'dark.main' }) }}
              />
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <MainCard title="No Card with Divider">
              <Breadcrumb title divider titleBottom={false} separator={RightOutlined} sx={{ mb: '0px !important' }} />
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <MainCard title="No Card & No Divider">
              <Breadcrumb title titleBottom={false} separator={RightOutlined} sx={{ mb: '0px !important' }} />
            </MainCard>
          </Grid>
        </Grid>
      </ComponentWrapper>
    </ComponentSkeleton>
  );
}
