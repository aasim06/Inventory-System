import { useState } from 'react';
import { useStoreInventory } from 'context/StoreInventoryContext';

// material-ui
import {
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';

// icons
import { ImportOutlined, SearchOutlined, ArrowUpOutlined, ReloadOutlined } from '@ant-design/icons';

// project imports
import MainCard from 'components/MainCard';

export default function StockInPage() {
  const { items, usageLogs, receiveStock } = useStoreInventory();

  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selected, setSelected] = useState([]);

  // Stock In Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(items[0]?.id || '');
  const [qtyReceived, setQtyReceived] = useState(20);
  const [supplierName, setSupplierName] = useState('Siemens Industrial');
  const [poNumber, setPoNumber] = useState('PO-9982');

  // Filter logs for IN transactions & date range
  const stockInLogs = usageLogs.filter((log) => {
    const isIN = log.type.includes('IN');
    const matchesSearch =
      log.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.usedBy.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesDate = true;
    if (log.dateISO) {
      const logDay = log.dateISO.split('T')[0];
      if (startDate && logDay < startDate) matchesDate = false;
      if (endDate && logDay > endDate) matchesDate = false;
    }

    return isIN && matchesSearch && matchesDate;
  });

  // Checkbox Handlers
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = stockInLogs.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleSelectOne = (event, id) => {
    event.stopPropagation();
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const handleSubmit = () => {
    if (!selectedItemId) return;
    receiveStock(selectedItemId, qtyReceived, supplierName, poNumber);
    setModalOpen(false);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <MainCard
      title="Stock In (Shipments Received)"
      secondary={
        <Button variant="contained" color="success" startIcon={<ImportOutlined />} onClick={() => setModalOpen(true)}>
          + Add Stock In
        </Button>
      }
    >
      {/* Search Bar & Date Filter Controls */}
      <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
        <Grid item xs={12} md={5}>
          <OutlinedInput
            fullWidth
            placeholder="Search Stock In logs by Item Name, SKU Code, Supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <SearchOutlined />
              </InputAdornment>
            }
          />
        </Grid>

        <Grid item xs={6} sm={4} md={2.5}>
          <TextField
            label="From Date"
            type="date"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Grid>

        <Grid item xs={6} sm={4} md={2.5}>
          <TextField
            label="To Date"
            type="date"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Grid>

        <Grid item xs={12} sm={4} md={2} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
          {(startDate || endDate || searchTerm) && (
            <Button size="small" variant="outlined" color="secondary" startIcon={<ReloadOutlined />} onClick={handleResetFilters} sx={{ mb: 0.5 }}>
              Reset
            </Button>
          )}
          <Typography variant="caption" color="textSecondary" display="block">
            {selected.length > 0 ? (
              <strong style={{ color: '#52c41a' }}>{selected.length} selected</strong>
            ) : (
              `Total ${stockInLogs.length} Stock In Records`
            )}
          </Typography>
        </Grid>
      </Grid>

      {/* Stock In Table */}
      <TableContainer>
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={selected.length > 0 && selected.length < stockInLogs.length}
                  checked={stockInLogs.length > 0 && selected.length === stockInLogs.length}
                  onChange={handleSelectAllClick}
                  inputProps={{ 'aria-label': 'select all stock in' }}
                />
              </TableCell>
              <TableCell>Log ID / Time</TableCell>
              <TableCell>Item Code / SKU</TableCell>
              <TableCell>Item Name</TableCell>
              <TableCell align="center">Quantity Added</TableCell>
              <TableCell>Supplier / Vendor</TableCell>
              <TableCell>PO Ref Number</TableCell>
              <TableCell align="right">Stock Level After</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stockInLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    No Stock In shipment records found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              stockInLogs.map((log) => {
                const isItemSelected = isSelected(log.id);

                return (
                  <TableRow key={log.id} hover selected={isItemSelected}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        onChange={(e) => handleSelectOne(e, log.id)}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {log.id}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {log.time}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {log.itemCode}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {log.itemName}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography variant="subtitle1" fontWeight={700} color="success.main" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <ArrowUpOutlined /> {log.qtyUsed}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip label={log.usedBy} size="small" color="success" variant="light" />
                    </TableCell>

                    <TableCell>
                      <Typography variant="caption" color="textSecondary">
                        {log.notes || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                        {log.remainingStockAfter} available
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal: Add Stock In */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>📥 Add Stock In (Receive Shipment)</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Select Item Received</InputLabel>
              <Select value={selectedItemId} label="Select Item Received" onChange={(e) => setSelectedItemId(e.target.value)}>
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
              label="PO Ref Number / Delivery Challan"
              fullWidth
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleSubmit}>
            Record Stock In
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
