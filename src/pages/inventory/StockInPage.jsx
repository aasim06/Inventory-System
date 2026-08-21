import { useState, useRef } from 'react';
import { useStoreInventory } from 'context/StoreInventoryContext';

// material-ui
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Drawer,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  OutlinedInput,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';

// icons
import { ImportOutlined, SearchOutlined, ArrowUpOutlined, PlusOutlined, DeleteOutlined, EditOutlined, PrinterOutlined } from '@ant-design/icons';

// project imports
import MainCard from 'components/MainCard';
import rehmatLogo from 'assets/images/rehmat-logo.jpg';

export default function StockInPage() {
  const { items = [], vendors = [], masterItemNames = [], usageLogs = [], receiveStock, addNewItem, deleteLog, updateLog, deleteMultipleLogs } = useStoreInventory();

  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState([]);
  const itemSelectRef = useRef(null);
  const qtyRef = useRef(null);

  // Vendor options list
  const vendorList = vendors.length > 0
    ? vendors.map((v) => v.name)
    : ['Faisal (Ghulam & Sons)', 'Amjad Tech Traders', 'Saqlain Electronics', 'Lahore Hardware Mart', 'General Supplier'];

  // Add Drawer Form State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState({
    vendor: '',
    itemName: '',
    qty: 1,
    unitPrice: 0
  });

  // Edit Drawer Form State
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editingLog, setEditingLog] = useState(null);

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // Print Invoice Modal State
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printData, setPrintData] = useState(null);

  // Combine all items list from store items and master item names for complete dropdown options
  const existingNamesList = Array.from(
    new Set([
      ...items.map((i) => i.name),
      ...(masterItemNames || []).map((m) => m.name)
    ])
  ).filter(Boolean);

  // Auto-fill unit price when selecting item name
  const handleItemNameChange = (event, newInputValue) => {
    const val = typeof newInputValue === 'string' ? newInputValue : (newInputValue?.name || '');
    const matchedItem = items.find((i) => i.name.toLowerCase() === val.toLowerCase());
    if (matchedItem) {
      setForm((prev) => ({
        ...prev,
        itemName: val,
        unitPrice: matchedItem.unitPrice || prev.unitPrice
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        itemName: val
      }));
    }
  };

  // Add Quick Item to Table below (triggered when pressing Enter on QTY field)
  const handleQuickAddToList = () => {
    if (!form.itemName.trim()) return;

    const matchedItem = items.find((i) => i.name.toLowerCase() === form.itemName.toLowerCase());
    const qtyVal = parseInt(form.qty) || 1;
    const priceVal = parseFloat(form.unitPrice) || 0;
    const poCode = `PO-${Math.floor(1000 + Math.random() * 9000)}`;

    if (matchedItem) {
      receiveStock(matchedItem.id, qtyVal, form.vendor, poCode, priceVal);
    } else {
      const newCode = `RM-${Math.floor(100 + Math.random() * 900)}`;
      addNewItem({
        name: form.itemName,
        itemCode: newCode,
        category: 'General',
        unit: 'PCS',
        totalStock: qtyVal,
        minLevel: 10,
        unitPrice: priceVal,
        rackLocation: 'Main Store'
      });
      receiveStock(newCode, qtyVal, form.vendor, poCode, priceVal);
    }

    setForm((prev) => ({
      ...prev,
      itemName: '',
      qty: 1,
      unitPrice: 0
    }));

    // Auto-focus back to ITEM SELECT for non-stop typing
    setTimeout(() => {
      if (itemSelectRef.current) {
        itemSelectRef.current.focus();
      }
    }, 50);
  };

  // Mouse Click Handler on Green Save Button (Triggers Print Vendor Invoice Modal)
  const handleSaveButtonClick = () => {
    if (form.itemName.trim()) {
      handleQuickAddToList();
    }

    setPrintData({
      id: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'Stock In (Receiving Invoice)',
      vendor: form.vendor,
      itemName: form.itemName,
      qty: form.qty,
      unitPrice: form.unitPrice,
      lineTotal: (parseInt(form.qty) || 1) * (parseFloat(form.unitPrice) || 0),
      time: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    });

    setPrintModalOpen(true);
  };

  // Open Print Modal for Row Log
  const handleOpenPrint = (log) => {
    setPrintData({
      id: log.itemCode || `INV-${log.id}`,
      type: 'Stock In Receipt',
      vendor: log.usedBy || 'Vendor',
      itemName: log.itemName,
      qty: log.qtyUsed,
      unitPrice: log.unitPrice || 0,
      lineTotal: log.lineTotal || log.qtyUsed * (log.unitPrice || 0),
      time: log.time
    });
    setPrintModalOpen(true);
  };

  // Close Print Modal & Focus Item Select Input
  const handleClosePrintModal = () => {
    setPrintModalOpen(false);
    setTimeout(() => {
      if (itemSelectRef.current) {
        itemSelectRef.current.focus();
      }
    }, 50);
  };

  // Trigger System Print Window
  const handlePrint = () => {
    window.print();
  };

  // Open Edit Drawer
  const handleOpenEdit = (log) => {
    setEditingLog({
      ...log,
      vendor: log.usedBy || vendorList[0],
      qty: log.qtyUsed || 1,
      unitPrice: log.unitPrice || 0
    });
    setEditDrawerOpen(true);
  };

  // Edit Submit Handler
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingLog) return;
    const qtyVal = parseInt(editingLog.qty) || 1;
    const priceVal = parseFloat(editingLog.unitPrice) || 0;

    updateLog(editingLog.id, {
      itemName: editingLog.itemName,
      usedBy: editingLog.vendor,
      qtyUsed: qtyVal,
      unitPrice: priceVal,
      lineTotal: qtyVal * priceVal
    });
    setEditDrawerOpen(false);
  };

  // Single Delete Handlers
  const handleOpenDelete = (log) => {
    setLogToDelete(log);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (logToDelete) {
      deleteLog(logToDelete.id);
      setSelected((prev) => prev.filter((id) => id !== logToDelete.id));
      setDeleteDialogOpen(false);
      setLogToDelete(null);
    }
  };

  // Bulk Delete Handler
  const handleConfirmBulkDelete = () => {
    if (selected.length > 0) {
      deleteMultipleLogs(selected);
      setSelected([]);
      setBulkDeleteDialogOpen(false);
    }
  };

  // Filter logs for IN transactions
  const stockInLogs = usageLogs.filter((log) => {
    const isIN = log.type && log.type.toUpperCase().includes('IN');
    const matchesSearch =
      log.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.usedBy && log.usedBy.toLowerCase().includes(searchTerm.toLowerCase()));

    return isIN && matchesSearch;
  });

  // Checkbox Selection Handlers
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

  const lineTotal = (parseInt(form.qty) || 0) * (parseFloat(form.unitPrice) || 0);

  return (
    <Stack spacing={3}>
      {/* 1. TOP SECTION: Record Stock In Form Card */}
      <MainCard
        title=" Record Stock In (Receiving Invoice)"
        sx={{
          boxShadow: (theme) => (theme.palette.mode === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.35)' : '0 2px 10px rgba(0, 0, 0, 0.05)'),
          borderRadius: 2
        }}
      >
        <form onSubmit={(e) => { e.preventDefault(); handleQuickAddToList(); }}>
          <Grid container spacing={2.5} alignItems="center">
            {/* ROW 1 */}
            {/* 1. SELECT VENDOR / SUPPLIER */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                select
                label="SELECT VENDOR / SUPPLIER *"
                fullWidth
                required
                value={form.vendor}
                onChange={(e) => setForm({ ...form, vendor: e.target.value })}
              >
                <MenuItem value="" disabled>
                  <em>Select Name</em>
                </MenuItem>
                {vendorList.map((v) => (
                  <MenuItem key={v} value={v}>
                    {v}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* 2. ITEM SELECT */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Autocomplete
                freeSolo
                options={existingNamesList}
                value={form.itemName}
                onChange={(event, newValue) => handleItemNameChange(event, newValue)}
                onInputChange={(event, newInputValue) => handleItemNameChange(event, newInputValue)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: '41.38px',
                    minHeight: '41.38px',
                    py: 0
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    inputRef={itemSelectRef}
                    label="ITEM SELECT *"
                    required
                    placeholder="Select Item"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (qtyRef.current) {
                          qtyRef.current.focus();
                          qtyRef.current.select();
                        }
                      }
                    }}
                  />
                )}
              />
            </Grid>

            {/* 3. QTY */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                label="QTY *"
                type="number"
                fullWidth
                required
                inputRef={qtyRef}
                inputProps={{ min: 1 }}
                value={form.qty}
                onChange={(e) => setForm({ ...form, qty: parseInt(e.target.value) || 1 })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleQuickAddToList();
                  }
                }}
              />
            </Grid>

            {/* ROW 2 */}
            {/* 4. UNIT PRICE */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                label="UNIT PRICE (PKR)"
                type="number"
                fullWidth
                inputProps={{ min: 0 }}
                value={form.unitPrice}
                onChange={(e) => setForm({ ...form, unitPrice: parseFloat(e.target.value) || 0 })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleQuickAddToList();
                  }
                }}
              />
            </Grid>

            {/* 5. LINE TOTAL */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                label="LINE TOTAL (PKR)"
                fullWidth
                value={`Rs. ${lineTotal.toLocaleString()}`}
                InputProps={{
                  readOnly: true,
                  style: { fontWeight: 800, color: '#10b981', fontSize: '1.05rem' }
                }}
                sx={{
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.12)' : '#ecfdf5'),
                  borderRadius: 1
                }}
              />
            </Grid>

            {/* 6. SAVE BUTTON */}
            <Grid size={{ xs: 12, sm: 12, md: 4 }}>
              <Button
                variant="contained"
                type="button"
                onClick={handleSaveButtonClick}
                fullWidth
                startIcon={<PlusOutlined />}
                sx={{
                  height: '41.38px',
                  bgcolor: '#10b981',
                  '&:hover': { bgcolor: '#059669' },
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
                }}
              >
                + Save Stock In Invoice
              </Button>
            </Grid>
          </Grid>
        </form>
      </MainCard>

      {/* 2. BOTTOM SECTION: Stock In Logs Table Card */}
      <MainCard
        title="Stock In (Receiving Logs)"
        secondary={
          selected.length > 0 && (
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteOutlined />}
              onClick={() => setBulkDeleteDialogOpen(true)}
            >
              Delete Selected ({selected.length})
            </Button>
          )
        }
      >
        {/* Search Header */}
        <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
          <Grid item xs={12} sm={6}>
            <OutlinedInput
              fullWidth
              placeholder="Search Stock In logs by Item Name, Vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <SearchOutlined />
                </InputAdornment>
              }
            />
          </Grid>

          <Grid item xs={12} sm={6} sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="textSecondary">
              {selected.length > 0 ? (
                <strong style={{ color: '#ff4d4f' }}>{selected.length} records selected for deletion</strong>
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
                <TableCell>ITEM SELECT</TableCell>
                <TableCell align="center">QTY</TableCell>
                <TableCell align="center">UNIT PRICE</TableCell>
                <TableCell align="right">LINE TOTAL</TableCell>
                <TableCell align="right">DATE & TIME</TableCell>
                <TableCell align="center">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stockInLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="textSecondary">
                      No Stock In shipment records found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                stockInLogs.map((log) => {
                  const isItemSelected = isSelected(log.id);
                  const matchedItem = items.find((i) => i.name.toLowerCase() === (log.itemName || '').toLowerCase());
                  const unitPriceVal = (log.unitPrice && log.unitPrice > 0) ? log.unitPrice : (matchedItem?.unitPrice || 0);
                  const lineTotalVal = (log.lineTotal && log.lineTotal > 0) ? log.lineTotal : (log.qtyUsed * unitPriceVal);

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
                          {log.itemName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {log.itemCode}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Typography variant="subtitle1" fontWeight={700} color="success.main" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <ArrowUpOutlined /> +{log.qtyUsed}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Typography variant="body2">
                          Rs. {unitPriceVal.toLocaleString()}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="subtitle2" fontWeight={700}>
                          Rs. {lineTotalVal.toLocaleString()}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="caption" color="textSecondary">
                          {log.time}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Print Receipt">
                            <IconButton color="info" size="small" onClick={() => handleOpenPrint(log)}>
                              <PrinterOutlined />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Stock In">
                            <IconButton color="primary" size="small" onClick={() => handleOpenEdit(log)}>
                              <EditOutlined />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Record">
                            <IconButton color="error" size="small" onClick={() => handleOpenDelete(log)}>
                              <DeleteOutlined />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </MainCard>

      {/* Edit Stock In Drawer */}
      <Drawer anchor="right" open={editDrawerOpen} onClose={() => setEditDrawerOpen(false)}>
        <Box sx={{ width: 440, p: 3 }}>
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
            ✏️ Edit Stock In Record
          </Typography>

          {editingLog && (
            <form onSubmit={handleEditSubmit}>
              <Stack spacing={2.5}>
                <TextField
                  select
                  label="SELECT VENDOR / SUPPLIER *"
                  fullWidth
                  required
                  value={editingLog.vendor}
                  onChange={(e) => setEditingLog({ ...editingLog, vendor: e.target.value })}
                >
                  {vendorList.map((v) => (
                    <MenuItem key={v} value={v}>
                      {v}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="ITEM SELECT *"
                  fullWidth
                  required
                  value={editingLog.itemName}
                  onChange={(e) => setEditingLog({ ...editingLog, itemName: e.target.value })}
                />

                <TextField
                  label="QTY *"
                  type="number"
                  fullWidth
                  required
                  inputProps={{ min: 1 }}
                  value={editingLog.qty}
                  onChange={(e) => setEditingLog({ ...editingLog, qty: parseInt(e.target.value) || 1 })}
                />

                <TextField
                  label="UNIT PRICE"
                  type="number"
                  fullWidth
                  inputProps={{ min: 0 }}
                  value={editingLog.unitPrice}
                  onChange={(e) => setEditingLog({ ...editingLog, unitPrice: parseFloat(e.target.value) || 0 })}
                />

                <TextField
                  label="LINE TOTAL"
                  fullWidth
                  disabled
                  value={`Rs. ${((parseInt(editingLog.qty) || 0) * (parseFloat(editingLog.unitPrice) || 0)).toLocaleString()}`}
                />

                <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 2 }}>
                  <Button variant="outlined" color="secondary" onClick={() => setEditDrawerOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="contained" color="primary" type="submit">
                    Update Record
                  </Button>
                </Stack>
              </Stack>
            </form>
          )}
        </Box>
      </Drawer>

      {/* Single Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Delete Stock In Record</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the Stock In record for <strong>{logToDelete?.itemName}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete Record
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <Dialog open={bulkDeleteDialogOpen} onClose={() => setBulkDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Bulk Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{selected.length}</strong> selected Stock In records?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setBulkDeleteDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirmBulkDelete} color="error" variant="contained">
            Delete {selected.length} Selected
          </Button>
        </DialogActions>
      </Dialog>

      {/* 📄 Print Invoice Receipt Modal Dialog */}
      <Dialog open={printModalOpen} onClose={handleClosePrintModal} maxWidth="md" fullWidth>
        <style>
          {`
            @media print {
              @page {
                size: auto;
                margin: 8mm;
              }
              body * {
                visibility: hidden !important;
              }
              #printable-invoice-stockin, #printable-invoice-stockin * {
                visibility: visible !important;
              }
              #printable-invoice-stockin {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
              }
              .MuiDialogActions-root,
              .MuiDialogTitle-root,
              .no-print,
              button {
                display: none !important;
              }
            }
          `}
        </style>

        <DialogTitle className="no-print" sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h5" fontWeight={700}>📄 Vendor Stock Receiving Invoice & Statement</Typography>
          <Chip label={printData?.type || 'Stock In'} color="success" size="small" />
        </DialogTitle>

        <DialogContent dividers sx={{ p: { xs: 1.5, sm: 3 } }}>
          {printData && (() => {
            const activeVendorLogs = stockInLogs.filter(
              (log) => (log.usedBy || '').toLowerCase() === (printData.vendor || '').toLowerCase()
            );

            const displayLogs = activeVendorLogs.length > 0 ? activeVendorLogs : [
              {
                id: printData.id,
                itemName: printData.itemName,
                itemCode: printData.id,
                qtyUsed: printData.qty,
                unitPrice: printData.unitPrice,
                lineTotal: printData.lineTotal
              }
            ];

            const grandTotalSum = displayLogs.reduce((sum, item) => {
              const total = item.lineTotal || (item.qtyUsed * (item.unitPrice || 0));
              return sum + total;
            }, 0);

            return (
              <Box id="printable-invoice-stockin" sx={{ position: 'relative', overflow: 'hidden', p: { xs: 2, sm: 3 }, bgcolor: '#ffffff', color: '#111827', borderRadius: 1 }}>
                {/* 🏢 Watermark Background Logo */}
                <Box
                  component="img"
                  src={rehmatLogo}
                  alt="Watermark Logo"
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '55%',
                    maxWidth: 360,
                    opacity: 0.08,
                    pointerEvents: 'none',
                    zIndex: 0,
                    borderRadius: '50%'
                  }}
                />
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography variant="h3" fontWeight={800} align="center" sx={{ color: '#10b981', mb: 0.5, letterSpacing: '0.5px' }}>
                    REHMAT LAWN MOWERS
                  </Typography>
                <Typography variant="subtitle1" fontWeight={700} align="center" sx={{ color: '#10b981', mb: 0.5 }}>
                  FACTORY STORE INVENTORY & RECEIVING
                </Typography>
                <Typography variant="caption" display="block" align="center" color="textSecondary" sx={{ mb: 2 }}>
                  Official Receiving & Vendor Shipment Statement
                </Typography>

                <Divider sx={{ my: 1.5 }} />

                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="textSecondary" display="block">INVOICE / PO NO:</Typography>
                    <Typography variant="subtitle2" fontWeight={700}>{printData.id}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }} sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="textSecondary" display="block">DATE & TIME:</Typography>
                    <Typography variant="subtitle2" fontWeight={700}>{printData.time}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
                    <Typography variant="caption" color="textSecondary" display="block">VENDOR / SUPPLIER NAME:</Typography>
                    <Typography variant="h5" fontWeight={800} color="primary.main">{printData.vendor}</Typography>
                  </Grid>
                </Grid>

                {/* Complete Multi-Item Table for Vendor */}
                <TableContainer sx={{ border: '1px solid #e5e7eb', borderRadius: 1, mb: 2 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#f9fafb' }}>
                      <TableRow>
                        <TableCell><strong>#</strong></TableCell>
                        <TableCell><strong>ITEM DESCRIPTION</strong></TableCell>
                        <TableCell align="center"><strong>QTY</strong></TableCell>
                        <TableCell align="right"><strong>UNIT PRICE</strong></TableCell>
                        <TableCell align="right"><strong>TOTAL AMOUNT</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {displayLogs.map((item, idx) => {
                        const itemUnitPrice = item.unitPrice || 0;
                        const itemLineTotal = item.lineTotal || (item.qtyUsed * itemUnitPrice);
                        return (
                          <TableRow key={item.id || idx} hover>
                            <TableCell>{idx + 1}</TableCell>
                            <TableCell>
                              <Typography variant="subtitle2" fontWeight={700}>{item.itemName}</Typography>
                              {item.itemCode && (
                                <Typography variant="caption" color="textSecondary" display="block">
                                  {item.itemCode}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="subtitle2" fontWeight={700} color="success.main">
                                +{item.qtyUsed}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">Rs. {itemUnitPrice.toLocaleString()}</TableCell>
                            <TableCell align="right">
                              <Typography variant="subtitle2" fontWeight={700}>
                                Rs. {itemLineTotal.toLocaleString()}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ bgcolor: '#ecfdf5', p: 2, borderRadius: 1.5, textAlign: 'right', border: '1px solid #a7f3d0' }}>
                  <Typography variant="caption" color="textSecondary" display="block">TOTAL VENDOR INVOICE AMOUNT ({displayLogs.length} Items):</Typography>
                  <Typography variant="h3" fontWeight={800} color="#059669">
                    Rs. {grandTotalSum.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
          })()}
        </DialogContent>

        <DialogActions className="no-print" sx={{ p: 2.5, justifyContent: 'space-between' }}>
          <Button variant="outlined" color="secondary" onClick={handleClosePrintModal} size="large" className="no-print">
            Close & Continue
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<PrinterOutlined />}
            onClick={handlePrint}
            size="large"
            className="no-print"
            sx={{ px: 3, fontWeight: 700 }}
          >
            Print Vendor Invoice ({stockInLogs.filter(log => (log.usedBy || '').toLowerCase() === (printData?.vendor || '').toLowerCase()).length || 1} Items)
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
