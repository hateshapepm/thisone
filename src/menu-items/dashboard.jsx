// project imports
import { useGetMenu } from 'api/menu';

// assets
import DashboardOutlined from '@ant-design/icons/DashboardOutlined';
import GoldOutlined from '@ant-design/icons/GoldOutlined';
import LoadingOutlined from '@ant-design/icons/LoadingOutlined';

// type

const icons = { dashboard: DashboardOutlined, components: GoldOutlined, loading: LoadingOutlined };

const invoiceItem = { id: 'invoice1', title: 'invoice', type: 'item', url: '/dashboard/invoice', breadcrumbs: false };

const loadingMenu = {
  id: 'group-dashboard-loading',
  title: 'dashboard',
  type: 'group',
  icon: icons.loading,
  children: [
    {
      id: 'dashboard1',
      title: 'dashboard',
      type: 'collapse',
      icon: icons.loading,
      children: [
        {
          id: 'default1',
          title: 'loading',
          type: 'item',
          url: '/dashboard/default',
          breadcrumbs: false
        },
        {
          id: 'analytics1',
          title: 'loading',
          type: 'item',
          url: '/dashboard/analytics',
          breadcrumbs: false
        },
        {
          id: 'sls1',
          title: 'loading',
          type: 'item',
          url: '/dashboard/sls',
          breadcrumbs: false
        },
        invoiceItem
      ]
    }
  ]
};

const defaultMenu = {
  id: 'group-dashboard-loading',
  title: 'dashboard',
  type: 'group',
  icon: icons.dashboard,
  children: [
    {
      id: 'dashboard1',
      title: 'dashboard',
      type: 'collapse',
      icon: icons.dashboard,
      children: [
        {
          id: 'default1',
          title: 'default',
          type: 'item',
          url: '/dashboard/default',
          breadcrumbs: false
        },
        {
          id: 'analytics1',
          title: 'analytics',
          type: 'item',
          url: '/dashboard/analytics',
          breadcrumbs: false
        },
        {
          id: 'sls1',
          title: 'SLS',
          type: 'item',
          url: '/dashboard/sls',
          breadcrumbs: false
        },
        invoiceItem
      ]
    }
  ]
};

// ==============================|| MENU ITEMS - API ||============================== //

export function MenuFromAPI() {
  const { menu, menuLoading } = useGetMenu();

  if (menuLoading) return loadingMenu;

  const subChildrenList = (children) => {
    return children?.map((subList) => {
      return fillItem(subList);
    });
  };

  const itemList = (subList) => {
    const list = fillItem(subList);

    // if collapsible item, we need to feel its children as well
    if (subList.type === 'collapse') {
      list.children = subChildrenList(subList.children);
    }
    return list;
  };

  const childrenList = menu?.children?.map((subList) => {
    return itemList(subList);
  });

  if (!childrenList?.length) return defaultMenu;

  const menuList = fillItem(menu, childrenList);
  return menuList;
}

function fillItem(item, children) {
  return {
    ...item,
    title: item?.title,
    icon: item?.icon ? icons[item.icon] : undefined,
    ...(children && { children })
  };
}
