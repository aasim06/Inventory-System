// assets
import {
  DashboardOutlined,
  DatabaseOutlined,
  ImportOutlined,
  ExportOutlined,
  TeamOutlined,
  BankOutlined,
  EnvironmentOutlined,
  AppstoreOutlined,
  HistoryOutlined,
  BarChartOutlined,
  PlusSquareOutlined
} from '@ant-design/icons';

const icons = {
  DashboardOutlined,
  DatabaseOutlined,
  ImportOutlined,
  ExportOutlined,
  TeamOutlined,
  BankOutlined,
  EnvironmentOutlined,
  AppstoreOutlined,
  HistoryOutlined,
  BarChartOutlined,
  PlusSquareOutlined
};

// ==============================|| MENU ITEMS - FACTORY STORE INVENTORY ||============================== //

const inventoryMenu = {
  id: 'group-inventory',
  title: 'Store Inventory',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard/default',
      icon: icons.DashboardOutlined,
      breadcrumbs: false
    },
    {
      id: 'items',
      title: 'Items',
      type: 'item',
      url: '/inventory/items',
      icon: icons.DatabaseOutlined
    },
    {
      id: 'add-item-name',
      title: 'Add Item Name',
      type: 'item',
      url: '/inventory/add-item-name',
      icon: icons.PlusSquareOutlined
    },
    {
      id: 'stock-in',
      title: 'Stock In',
      type: 'item',
      url: '/inventory/stock-in',
      icon: icons.ImportOutlined
    },
    {
      id: 'stock-out',
      title: 'Stock Out (Usage)',
      type: 'item',
      url: '/inventory/stock-out',
      icon: icons.ExportOutlined
    },
    {
      id: 'vendors',
      title: 'Vendors',
      type: 'item',
      url: '/inventory/vendors',
      icon: icons.TeamOutlined
    },
    {
      id: 'companies',
      title: 'Companies',
      type: 'item',
      url: '/inventory/companies',
      icon: icons.BankOutlined
    },
    {
      id: 'cities',
      title: 'Cities',
      type: 'item',
      url: '/inventory/cities',
      icon: icons.EnvironmentOutlined
    },
    {
      id: 'categories',
      title: 'Categories',
      type: 'item',
      url: '/inventory/categories',
      icon: icons.AppstoreOutlined
    },
    {
      id: 'ledger',
      title: 'Store Ledger & History',
      type: 'item',
      url: '/inventory/ledger',
      icon: icons.HistoryOutlined
    },
    {
      id: 'reports',
      title: 'Reports & Analytics',
      type: 'item',
      url: '/inventory/reports',
      icon: icons.BarChartOutlined
    }
  ]
};

export default inventoryMenu;
