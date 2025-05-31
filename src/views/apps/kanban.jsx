'use client';
import PropTypes from 'prop-types';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// material-ui
import Grid from '@mui/material/Grid';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';

// project imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import Board from 'sections/apps/kanban/Board';
import Backlogs from 'sections/apps/kanban/Backlogs';

import { APP_DEFAULT_PATH } from 'config';
import { handlerActiveItem, useGetMenuMaster } from 'api/menu';

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  };
}

// ==============================|| APPLICATION - KANBAN ||============================== //

export default function KanbanPage({ tab }) {
  const router = useRouter();
  const { menuMaster } = useGetMenuMaster();
  const openedItem = menuMaster.openedItem;

  const handleChange = (event, newValue) => {
    router.replace(`/apps/kanban/${newValue}`);
  };

  let breadcrumbTitle = '';
  let breadcrumbHeading = '';

  switch (tab) {
    case 'backlogs':
      breadcrumbTitle = 'backlogs';
      breadcrumbHeading = 'backlogs';
      break;
    case 'board':
    default:
      breadcrumbTitle = 'board';
      breadcrumbHeading = 'taskboard';
  }

  const breadcrumbLinks = [
    { title: 'home', to: APP_DEFAULT_PATH },
    { title: 'kanban', to: '/apps/kanban/board' },
    { title: breadcrumbTitle }
  ];

  useEffect(() => {
    if (openedItem !== 'kanban') handlerActiveItem('kanban');
  }, [openedItem]);

  return (
    <>
      <Breadcrumbs custom heading={breadcrumbHeading} links={breadcrumbLinks} />
      <Stack direction="row">
        <Grid container spacing={1} sx={{ width: 1 }}>
          <Grid size={12}>
            <Tabs value={tab} variant="scrollable" onChange={handleChange}>
              <Tab value="board" label={tab === 'board' ? 'Board' : 'View as Board'} {...a11yProps('board')} />
              <Tab value="backlogs" label={tab === 'backlogs' ? 'Backlogs' : 'View as Backlog'} {...a11yProps('backlogs')} />
            </Tabs>
          </Grid>
          <Grid size={12}>
            {tab === 'board' && <Board />}
            {tab === 'backlogs' && <Backlogs />}
          </Grid>
        </Grid>
      </Stack>
    </>
  );
}

KanbanPage.propTypes = { tab: PropTypes.string };
