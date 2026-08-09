import { useState } from 'react';
import { useStoreInventory } from 'context/StoreInventoryContext';

// material-ui
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Drawer from '@mui/material/Drawer';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';

// project imports
import MainCard from 'components/MainCard';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';
import MonthlyBarChart from 'sections/dashboard/default/MonthlyBarChart';
import UniqueVisitorCard from 'sections/dashboard/default/UniqueVisitorCard';
import OrdersTable from 'sections/dashboard/default/OrdersTable';

// assets
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import ExportOutlined from '@ant-design/icons/ExportOutlined';
import ImportOutlined from '@ant-design/icons/ImportOutlined';
import WarningOutlined from '@ant-design/icons/WarningOutlined';
import ToolOutlined from '@ant-design/icons/ToolOutlined';
import ArrowRightOutlined from '@ant-design/icons/ArrowRightOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';

const avatarSX = {
  width: 36,
  height: 36,
  fontSize: '1rem'
};

const actionSX = {
  mt: 0.75,
  ml: 1,
  top: 'auto',
  right: 'auto',
  alignSelf: 'flex-start',
  transform: 'none'
};

// ==============================|| FACTORY STORE INVENTORY DASHBOARD ||============================== //

export default function DashboardDefault() {
  const {
    items,
    usageLogs,
    totalInventoryCount,
    totalValuation,
    dailyUsageCount,
    todayStockInQty,
    todayStockOutQty,
    lowStockAlerts,
    issueStock,
    receiveStock,
    addNewItem
  } = useStoreInventory();

  // Issue Dialog State
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(items[0]?.id || '');
  const [qtyUsed, setQtyUsed] = useState(5);
  const [usedBy, setUsedBy] = useState('Zubair Ahmed');
  const [department, setDepartment] = useState('Assembly Line 1');
  const [issueNotes, setIssueNotes] = useState('Daily production issue');

  // Receive Dialog State
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
  const [receiveItemId, setReceiveItemId] = useState(items[0]?.id || '');
  const [qtyReceived, setQtyReceived] = useState(20);
  const [supplierName, setSupplierName] = useState('Siemens Industrial');
  const [poNumber, setPoNumber] = useState('PO-9952');

  // Add Item Drawer State
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    itemCode: `SKU-${Math.floor(10000000 + Math.random() * 90000000)}`,
    name: '',
    category: 'Hardware',
    totalStock: 50,
    unit: 'pcs',
    unitPrice: 25,
    minLevel: 10,
    rackLocation: 'Rack A-02'
  });

  // Today's Usage Logs
  const todayLogs = usageLogs.filter((log) => log.time.includes('Today'));

  // Issue Stock Submit
  const handleIssueSubmit = () => {
    if (!selectedItemId || !usedBy) {
      alert('Please select an item and enter operator name (Who Used).');
      return;
    }
    const success = issueStock(selectedItemId, qtyUsed, usedBy, department, 'Store Keeper', issueNotes);
    if (success) {
      setIssueDialogOpen(false);
    } else {
      alert('Cannot issue stock. Stock insufficient!');
    }
  };

  // Receive Stock Submit
  const handleReceiveSubmit = () => {
    if (!receiveItemId) return;
    receiveStock(receiveItemId, qtyReceived, supplierName, poNumber);
    setReceiveDialogOpen(false);
  };

  // Add New Item Submit
  const handleAddItemSubmit = (e) => {
    e.preventDefault();
    addNewItem(newItem);
    setAddDrawerOpen(false);
  };

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      {/* Header Title */}
      <Grid size={12}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Factory Store Inventory & Daily Usage Dashboard
          </Typography>

        </Box>
      </Grid>

      {/* Low Stock Warning Alert Banner */}
      {lowStockAlerts.length > 0 && (
        <Grid size={12}>
          <Alert severity="warning" icon={<WarningOutlined style={{ fontSize: 20 }} />}>
            <strong>ATTENTION REQUIRED:</strong> {lowStockAlerts.length} store item(s) are below minimum reorder threshold! Reorder soon to maintain production speed.
          </Alert>
        </Grid>
      )}

      {/* Row 1: Top Metric Cards (Exact requested titles & metrics) */}
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <AnalyticEcommerce
          title="Total Items"
          count={items.length.toString()}
          extra="items tracked"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <AnalyticEcommerce
          title="Total Stock"
          count={totalInventoryCount.toString()}
          extra="units on hand"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <AnalyticEcommerce
          title="Today's Stock In"
          count={`+${todayStockInQty || 0}`}
          color="success"
          extra="units received"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <AnalyticEcommerce
          title="Today's Stock Out"
          count={`−${todayStockOutQty || 0}`}
          isLoss={todayStockOutQty > 0}
          color={todayStockOutQty > 0 ? 'warning' : 'primary'}
          extra="units used"
        />
      </Grid>

      {/* Row 2: Stock Flow Chart & Daily Usage Bar Chart */}
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <UniqueVisitorCard />
      </Grid>
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Grid>
            <Typography variant="h5">Daily Usage Distribution</Typography>
          </Grid>
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <Box sx={{ p: 3, pb: 0 }}>
            <Stack sx={{ gap: 2 }}>
              <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                Today's Total Issued Items
              </Typography>
              <Typography variant="h3">{dailyUsageCount} units</Typography>
            </Stack>
          </Box>
          <MonthlyBarChart />
        </MainCard>
      </Grid>

      {/* Row 3: Main Table: Today's Usage & Who Used Each Item (Exact Mantis OrdersTable component) */}
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Grid>
            <Typography variant="h5">Today's Inventory Usage & Store Issuance Log</Typography>
          </Grid>
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <OrdersTable />
        </MainCard>
      </Grid>

      {/* Row 3 Side Card: Low Stock Watchlist & Operator Activity */}
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Grid>
            <Typography variant="h5">Recent Store Issuances & Alerts</Typography>
          </Grid>
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <List
            component="nav"
            sx={{
              px: 0,
              py: 0,
              '& .MuiListItemButton-root': {
                py: 1.5,
                px: 2,
                '& .MuiAvatar-root': avatarSX,
                '& .MuiListItemSecondaryAction-root': { ...actionSX, position: 'relative' }
              }
            }}
          >
            {usageLogs.slice(0, 4).map((log) => (
              <ListItem
                key={log.id}
                component={ListItemButton}
                divider
                secondaryAction={
                  <Stack sx={{ alignItems: 'flex-end' }}>
                    <Typography variant="subtitle1" noWrap color="error.main" fontWeight={700}>
                      -{log.qtyUsed}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'primary.main' }} noWrap>
                      {log.remainingStockAfter} remaining
                    </Typography>
                  </Stack>
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ color: 'primary.main', bgcolor: 'primary.lighter' }}>
                    <UserOutlined />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={<Typography variant="subtitle2">{log.itemName}</Typography>}
                  secondary={`Used by: ${log.usedBy} (${log.department})`}
                />
              </ListItem>
            ))}
          </List>
        </MainCard>
      </Grid>

      {/* DIALOG 1: Issue Item / Store OUT */}
      <Dialog open={issueDialogOpen} onClose={() => setIssueDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>📤 Issue Inventory Item (Store OUT)</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Select Item to Issue</InputLabel>
              <Select
                value={selectedItemId}
                label="Select Item to Issue"
                onChange={(e) => setSelectedItemId(e.target.value)}
              >
                {items.map((i) => (
                  <MenuItem key={i.id} value={i.id}>
                    {i.name} ({i.remainingStock} {i.unit} available)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Quantity Used / Issued"
              type="number"
              fullWidth
              inputProps={{ min: 1 }}
              value={qtyUsed}
              onChange={(e) => setQtyUsed(Math.max(1, parseInt(e.target.value) || 1))}
            />

            <TextField
              label="Who Used (Operator / Worker Name)"
              fullWidth
              required
              placeholder="e.g. Zubair Ahmed"
              value={usedBy}
              onChange={(e) => setUsedBy(e.target.value)}
            />

            <TextField
              label="Department / Workstation"
              fullWidth
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />

            <TextField
              label="Usage Notes / Work Order #"
              fullWidth
              value={issueNotes}
              onChange={(e) => setIssueNotes(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setIssueDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleIssueSubmit}>
            Record Issuance
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG 2: Receive Stock / Store IN */}
      <Dialog open={receiveDialogOpen} onClose={() => setReceiveDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>📦 Receive Stock Shipment (Store IN)</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Select Item Received</InputLabel>
              <Select
                value={receiveItemId}
                label="Select Item Received"
                onChange={(e) => setReceiveItemId(e.target.value)}
              >
                {items.map((i) => (
                  <MenuItem key={i.id} value={i.id}>
                    {i.name} ({i.remainingStock} {i.unit} in stock)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Quantity Received"
              type="number"
              fullWidth
              inputProps={{ min: 1 }}
              value={qtyReceived}
              onChange={(e) => setQtyReceived(Math.max(1, parseInt(e.target.value) || 1))}
            />

            <TextField
              label="Supplier / Vendor Name"
              fullWidth
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
            />

            <TextField
              label="PO Number / Delivery Challan"
              fullWidth
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setReceiveDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleReceiveSubmit}>
            Add Received Stock
          </Button>
        </DialogActions>
      </Dialog>

      {/* DRAWER: Add New Inventory Item */}
      <Drawer anchor="right" open={addDrawerOpen} onClose={() => setAddDrawerOpen(false)}>
        <Box sx={{ width: 420, p: 3 }}>
          <Typography variant="h4" sx={{ mb: 3 }}>
            Add New Item to Factory Store
          </Typography>

          <form onSubmit={handleAddItemSubmit}>
            <Stack spacing={2.5}>
              <TextField
                label="Item SKU / Tracking Code"
                fullWidth
                required
                value={newItem.itemCode}
                onChange={(e) => setNewItem({ ...newItem, itemCode: e.target.value })}
              />

              <TextField
                label="Inventory Item Name"
                fullWidth
                required
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              />

              <TextField
                label="Category"
                fullWidth
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              />

              <Grid container spacing={2}>
                <Grid size={6}>
                  <TextField
                    label="Total Initial Stock"
                    type="number"
                    fullWidth
                    required
                    value={newItem.totalStock}
                    onChange={(e) => setNewItem({ ...newItem, totalStock: parseInt(e.target.value) || 0 })}
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    label="Unit (pcs, kg, etc.)"
                    fullWidth
                    required
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={6}>
                  <TextField
                    label="Unit Cost ($)"
                    type="number"
                    fullWidth
                    value={newItem.unitPrice}
                    onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })}
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    label="Min Reorder Level"
                    type="number"
                    fullWidth
                    value={newItem.minLevel}
                    onChange={(e) => setNewItem({ ...newItem, minLevel: parseInt(e.target.value) || 5 })}
                  />
                </Grid>
              </Grid>

              <TextField
                label="Rack / Storage Location"
                fullWidth
                value={newItem.rackLocation}
                onChange={(e) => setNewItem({ ...newItem, rackLocation: e.target.value })}
              />

              <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 2 }}>
                <Button variant="outlined" color="secondary" onClick={() => setAddDrawerOpen(false)}>
                  Cancel
                </Button>
                <Button variant="contained" type="submit">
                  Save Item
                </Button>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Drawer>
    </Grid>
  );
}
