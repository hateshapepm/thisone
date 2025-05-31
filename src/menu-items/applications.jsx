// project imports
import { handlerCustomerDialog } from 'api/customer';
import { NavActionType } from 'config';

// assets
import BuildOutlined from '@ant-design/icons/BuildOutlined';
import CalendarOutlined from '@ant-design/icons/CalendarOutlined';
import CustomerServiceOutlined from '@ant-design/icons/CustomerServiceOutlined';
import FileTextOutlined from '@ant-design/icons/FileTextOutlined';
import MessageOutlined from '@ant-design/icons/MessageOutlined';
import ShoppingCartOutlined from '@ant-design/icons/ShoppingCartOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';
import AppstoreAddOutlined from '@ant-design/icons/AppstoreAddOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import LinkOutlined from '@ant-design/icons/LinkOutlined';

// type

// icons
const icons = {
  BuildOutlined,
  CalendarOutlined,
  CustomerServiceOutlined,
  MessageOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  AppstoreAddOutlined,
  FileTextOutlined,
  PlusOutlined,
  LinkOutlined
};

// ==============================|| MENU ITEMS - APPLICATIONS ||============================== //

const applications = {
  id: 'group-applications',
  title: 'applications',
  icon: icons.AppstoreAddOutlined,
  type: 'group',
  children: [
    {
      id: 'chat',
      title: 'chat',
      type: 'item',
      url: '/apps/chat',
      icon: icons.MessageOutlined,
      breadcrumbs: false
    },
    {
      id: 'calendar',
      title: 'calendar',
      type: 'item',
      url: '/apps/calendar',
      icon: icons.CalendarOutlined,
      actions: [
        {
          type: NavActionType.LINK,
          label: 'Full Calendar',
          icon: icons.LinkOutlined,
          url: 'https://fullcalendar.io/docs/react',
          target: true
        }
      ]
    },
    {
      id: 'kanban',
      title: 'kanban',
      type: 'item',
      icon: BuildOutlined,
      url: '/apps/kanban/board',
      breadcrumbs: false
    },
    {
      id: 'customer',
      title: 'customer',
      type: 'collapse',
      icon: icons.CustomerServiceOutlined,
      children: [
        {
          id: 'customer-list',
          title: 'list',
          type: 'item',
          url: '/apps/customer/list',
          actions: [
            {
              type: NavActionType.FUNCTION,
              label: 'Add Customer',
              function: () => handlerCustomerDialog(true),
              icon: icons.PlusOutlined
            }
          ]
        },
        {
          id: 'customer-card',
          title: 'cards',
          type: 'item',
          url: '/apps/customer/card'
        }
      ]
    },
    {
      id: 'invoice',
      title: 'invoice',
      url: '/apps/invoice/dashboard',
      type: 'collapse',
      icon: icons.FileTextOutlined,
      breadcrumbs: false,
      children: [
        {
          id: 'invoice-create',
          title: 'create',
          type: 'item',
          url: '/apps/invoice/create',
          breadcrumbs: false
        },
        {
          id: 'invoice-details',
          title: 'details',
          type: 'item',
          url: '/apps/invoice/details/1',
          breadcrumbs: false
        },
        {
          id: 'invoice-list',
          title: 'list',
          type: 'item',
          url: '/apps/invoice/list',
          breadcrumbs: false
        },
        {
          id: 'invoice-edit',
          title: 'edit',
          type: 'item',
          url: '/apps/invoice/edit/1',
          breadcrumbs: false
        }
      ]
    },
    {
      id: 'profile',
      title: 'profile',
      type: 'collapse',
      icon: icons.UserOutlined,
      children: [
        {
          id: 'user-profile',
          title: 'user-profile',
          type: 'item',
          url: '/apps/profiles/user/personal',
          breadcrumbs: false
        },
        {
          id: 'account-profile',
          title: 'account-profile',
          type: 'item',
          url: '/apps/profiles/account/basic',
          breadcrumbs: false
        }
      ]
    },

    {
      id: 'e-commerce',
      title: 'e-commerce',
      type: 'collapse',
      icon: icons.ShoppingCartOutlined,
      children: [
        {
          id: 'products',
          title: 'products',
          type: 'item',
          url: '/apps/e-commerce/products'
        },
        {
          id: 'product-details',
          title: 'product-details',
          type: 'item',
          url: '/apps/e-commerce/product-details/1',
          breadcrumbs: false
        },
        {
          id: 'product-list',
          title: 'product-list',
          type: 'item',
          url: '/apps/e-commerce/products-list'
        },
        {
          id: 'add-new-product',
          title: 'add-new-product',
          type: 'item',
          url: '/apps/e-commerce/add-product'
        },
        {
          id: 'checkout',
          title: 'checkout',
          type: 'item',
          url: '/apps/e-commerce/checkout'
        }
      ]
    }
  ]
};

export default applications;
