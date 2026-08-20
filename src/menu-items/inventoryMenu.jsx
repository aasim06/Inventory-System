// assets
import {
  DashboardOutlined,
  DatabaseOutlined,
  ImportOutlined,
  ExportOutlined,
  TeamOutlined,
  AppstoreOutlined,
  HistoryOutlined,
  BarChartOutlined,
  PlusSquareOutlined,
  FileTextOutlined,
  ToolOutlined,
  UserOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';

const icons = {
  DashboardOutlined,
  DatabaseOutlined,
  ImportOutlined,
  ExportOutlined,
  TeamOutlined,
  AppstoreOutlined,
  HistoryOutlined,
  BarChartOutlined,
  PlusSquareOutlined,
  FileTextOutlined,
  ToolOutlined,
  UserOutlined,
  SafetyCertificateOutlined
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
      id: 'machine-sales',
      title: 'Machine Sales & Invoices',
      type: 'item',
      url: '/inventory/machine-sales',
      icon: icons.FileTextOutlined
    },
    {
      id: 'customer-ledgers',
      title: 'Customer Khaata Ledgers',
      type: 'item',
      url: '/inventory/customer-ledgers',
      icon: icons.UserOutlined
    },
    {
      id: 'vendor-ledgers',
      title: 'Vendor Payables',
      type: 'item',
      url: '/inventory/vendor-ledgers',
      icon: icons.TeamOutlined
    },
    {
      id: 'vendors',
      title: 'Vendors & Parties',
      type: 'item',
      url: '/inventory/vendors',
      icon: icons.TeamOutlined
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
    },
    {
      id: 'backup-restore',
      title: 'Data Backup & Restore',
      type: 'item',
      url: '/inventory/backup-restore',
      icon: icons.SafetyCertificateOutlined
    }
  ]
};

export default inventoryMenu;
