'use client';
import PropTypes from 'prop-types';

import { useEffect, useState } from 'react';

// next
import { useRouter } from 'next/navigation';

// material-ui
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Box from '@mui/material/Box';

// project imports
import MainCard from 'components/MainCard';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import TabProfile from 'sections/apps/profiles/account/TabProfile';
import TabPersonal from 'sections/apps/profiles/account/TabPersonal';
import TabAccount from 'sections/apps/profiles/account/TabAccount';
import TabPassword from 'sections/apps/profiles/account/TabPassword';
import TabRole from 'sections/apps/profiles/account/TabRole';
import TabSettings from 'sections/apps/profiles/account/TabSettings';

import { APP_DEFAULT_PATH } from 'config';
import { handlerActiveItem, useGetMenuMaster } from 'api/menu';

// assets
import ContainerOutlined from '@ant-design/icons/ContainerOutlined';
import FileTextOutlined from '@ant-design/icons/FileTextOutlined';
import LockOutlined from '@ant-design/icons/LockOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';
import TeamOutlined from '@ant-design/icons/TeamOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';

// ==============================|| PROFILE - ACCOUNT ||============================== //

export default function AccountProfile({ tab }) {
  const router = useRouter();
  const { menuMaster } = useGetMenuMaster();
  const openedItem = menuMaster.openedItem;

  const [value, setValue] = useState(tab);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    router.replace(`/apps/profiles/account/${newValue}`);
  };

  let breadcrumbTitle = '';
  let breadcrumbHeading = '';

  switch (tab) {
    case 'personal':
      breadcrumbTitle = 'personal';
      breadcrumbHeading = 'personal';
      break;
    case 'my-account':
      breadcrumbTitle = 'my-account';
      breadcrumbHeading = 'my-account';
      break;
    case 'password':
      breadcrumbTitle = 'change-password';
      breadcrumbHeading = 'change-password';
      break;
    case 'role':
      breadcrumbTitle = 'role';
      breadcrumbHeading = 'accountant';
      break;
    case '/apps/profiles/account/settings':
      breadcrumbTitle = 'settings';
      breadcrumbHeading = 'account-settings';
      break;
    case 'basic':
    default:
      breadcrumbTitle = 'basic';
      breadcrumbHeading = 'basic-profile';
  }

  let breadcrumbLinks = [
    { title: 'home', to: APP_DEFAULT_PATH },
    { title: 'account-profile', to: '/apps/profiles/account/basic' },
    { title: breadcrumbTitle }
  ];

  if (tab === 'basic') {
    breadcrumbLinks = [{ title: 'home', to: APP_DEFAULT_PATH }, { title: 'account-profile' }];
  }

  useEffect(() => {
    if (openedItem !== 'account-profile') handlerActiveItem('account-profile');
  }, [openedItem]);

  return (
    <>
      <Breadcrumbs custom heading={breadcrumbHeading} links={breadcrumbLinks} />
      <MainCard border={false} boxShadow>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons="auto" aria-label="account profile tab">
            <Tab label="Profile" value="basic" icon={<UserOutlined />} iconPosition="start" />
            <Tab label="Personal" value="personal" icon={<FileTextOutlined />} iconPosition="start" />
            <Tab label="My Account" value="my-account" icon={<ContainerOutlined />} iconPosition="start" />
            <Tab label="Change Password" value="password" icon={<LockOutlined />} iconPosition="start" />
            <Tab label="Role" value="role" icon={<TeamOutlined />} iconPosition="start" />
            <Tab label="Settings" value="settings" icon={<SettingOutlined />} iconPosition="start" />
          </Tabs>
        </Box>
        <Box sx={{ mt: 2.5 }}>
          {tab === 'basic' && <TabProfile />}
          {tab === 'personal' && <TabPersonal />}
          {tab === 'my-account' && <TabAccount />}
          {tab === 'password' && <TabPassword />}
          {tab === 'role' && <TabRole />}
          {tab === 'settings' && <TabSettings />}
        </Box>
      </MainCard>
    </>
  );
}

AccountProfile.propTypes = { tab: PropTypes.string };
