// assets
import DollarOutlined from '@ant-design/icons/DollarOutlined';
import LoginOutlined from '@ant-design/icons/LoginOutlined';
import PhoneOutlined from '@ant-design/icons/PhoneOutlined';
import RocketOutlined from '@ant-design/icons/RocketOutlined';

// type

// icons
const icons = { DollarOutlined, LoginOutlined, PhoneOutlined, RocketOutlined };

// ==============================|| MENU ITEMS - PAGES ||============================== //

const pages = {
  id: 'group-pages',
  title: 'pages',
  type: 'group',
  children: [
    {
      id: 'authentication',
      title: 'authentication',
      type: 'collapse',
      icon: icons.LoginOutlined,
      children: [
        {
          id: 'login',
          title: 'login',
          type: 'item',
          url: '/pages/login',
          target: true
        },
        {
          id: 'register',
          title: 'register',
          type: 'item',
          url: '/pages/register',
          target: true
        },
        {
          id: 'forgot-password',
          title: 'forgot-password',
          type: 'item',
          url: '/pages/forgot-password',
          target: true
        },
        {
          id: 'reset-password',
          title: 'reset-password',
          type: 'item',
          url: '/pages/reset-password',
          target: true
        },
        {
          id: 'check-mail',
          title: 'check-mail',
          type: 'item',
          url: '/pages/check-mail',
          target: true
        },
        {
          id: 'code-verification',
          title: 'code-verification',
          type: 'item',
          url: '/pages/code-verification',
          target: true
        }
      ]
    },
    {
      id: 'maintenance',
      title: 'maintenance',
      type: 'collapse',
      icon: icons.RocketOutlined,
      isDropdown: true,
      children: [
        {
          id: 'error-404',
          title: 'error-404',
          type: 'item',
          url: '/404',
          target: true
        },
        {
          id: 'error-500',
          title: 'error-500',
          type: 'item',
          url: '/pages/500',
          target: true
        },
        {
          id: 'coming-soon',
          title: 'coming-soon',
          type: 'item',
          url: '/pages/coming-soon',
          target: true
        },
        {
          id: 'under-construction',
          title: 'under-construction',
          type: 'item',
          url: '/pages/under-construction',
          target: true
        }
      ]
    },
    {
      id: 'contact-us',
      title: 'contact-us',
      type: 'item',
      url: '/contact-us',
      icon: icons.PhoneOutlined,
      target: true
    },
    {
      id: 'pricing',
      title: 'pricing',
      type: 'item',
      url: '/pages/pricing',
      icon: icons.DollarOutlined
    }
  ]
};

export default pages;
