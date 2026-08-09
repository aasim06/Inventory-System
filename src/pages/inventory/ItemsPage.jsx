import { useState } from 'react';
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
  Drawer,
  FormControl,
  Grid,
  IconButton,
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
  Typography,
  Tooltip
} from '@mui/material';

// icons
import { PlusOutlined, SearchOutlined, ImportOutlined, ExportOutlined, DeleteOutlined, EditOutlined, WarningOutlined } from '@ant-design/icons';

// project imports
import MainCard from 'components/MainCard';

export default function ItemsPage() {
  const { items, masterItemNames = [], issueStock, receiveStock, addNewItem, updateItem, deleteItem, deleteMultipleItems } = useStoreInventory();

  // Search & Category filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Checkbox Selection State
  const [selected, setSelected] = useState([]);

  // Stock Out Modal State
  const [stockOutOpen, setStockOutOpen] = useState(false);
  const [targetItem, setTargetItem] = useState(null);
  const [qtyUsed, setQtyUsed] = useState(5);
  const [usedBy, setUsedBy] = useState('Zubair Ahmed');
  const [department, setDepartment] = useState('Assembly Line 1');
  const [notes, setNotes] = useState('Daily production issue');

  // Stock In Modal State
  const [stockInOpen, setStockInOpen] = useState(false);
  const [qtyReceived, setQtyReceived] = useState(10);
  const [supplierName, setSupplierName] = useState('Siemens Industrial');

  // Add Item Drawer State
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    itemCode: `SKU-${Math.floor(10000000 + Math.random() * 90000000)}`,
    name: '',
    category: 'Electrical & Motors',
    totalStock: 50,
    unit: 'pcs',
    unitPrice: 25,
    minLevel: 10,
    rackLocation: 'Rack A-01'
  });

  // Edit Item Drawer State
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Single Item Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Bulk Delete Confirmation Dialog State
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  const categories = ['All', ...new Set(items.map((i) => i.category))];

  const filteredItems = items.filter((i) => {
    const matchesSearch =
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.rackLocation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || i.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Checkbox Selection Handlers
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredItems.map((n) => n.id);
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

  // Open Handlers
  const handleOpenStockOut = (item) => {
    setTargetItem(item);
    setQtyUsed(1);
    setStockOutOpen(true);
  };

  const handleOpenStockIn = (item) => {
    setTargetItem(item);
    setQtyReceived(10);
    setStockInOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem({ ...item });
    setEditDrawerOpen(true);
  };

  const handleOpenDelete = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  // Submit Handlers
  const handleStockOutSubmit = () => {
    if (!targetItem || !usedBy) return;
    const ok = issueStock(targetItem.id, qtyUsed, usedBy, department, 'Store Keeper', notes);
    if (ok) setStockOutOpen(false);
    else alert('Insufficient stock!');
  };

  const handleStockInSubmit = () => {
    if (!targetItem) return;
    receiveStock(targetItem.id, qtyReceived, supplierName);
    setStockInOpen(false);
  };

  const handleAddItemSubmit = (e) => {
    e.preventDefault();
    if (!newItem.name) {
      alert('Please select or type an item name.');
      return;
    }
    addNewItem(newItem);
    setAddDrawerOpen(false);
    setNewItem({
      itemCode: `SKU-${Math.floor(10000000 + Math.random() * 90000000)}`,
      name: '',
      category: 'Electrical & Motors',
      totalStock: 50,
      unit: 'pcs',
      unitPrice: 25,
      minLevel: 10,
      rackLocation: 'Rack A-01'
    });
  };

  const handleEditItemSubmit = (e) => {
    e.preventDefault();
    if (!editingItem || !editingItem.name) return;
    updateItem(editingItem.id, editingItem);
    setEditDrawerOpen(false);
    setEditingItem(null);
  };

  const handleConfirmSingleDelete = () => {
    if (itemToDelete) {
      deleteItem(itemToDelete.id);
      setSelected((prev) => prev.filter((id) => id !== itemToDelete.id));
    }
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleConfirmBulkDelete = () => {
    if (selected.length > 0) {
      deleteMultipleItems(selected);
      setSelected([]);
    }
    setBulkDeleteDialogOpen(false);
  };

  return (
    <MainCard
      title="Store Inventory Items"
      secondary={
        <Stack direction="row" spacing={1.5}>
          {selected.length > 0 && (
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteOutlined />}
              onClick={() => setBulkDeleteDialogOpen(true)}
            >
              Delete Selected ({selected.length})
            </Button>
          )}
          <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => setAddDrawerOpen(true)}>
            Add New Item
          </Button>
        </Stack>
      }
    >
      {/* Search & Category Filter Header */}
      <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
        <Grid item xs={12} sm={5}>
          <OutlinedInput
            fullWidth
            placeholder="Search items, SKU code, rack location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <SearchOutlined />
              </InputAdornment>
            }
          />
        </Grid>

        <Grid item xs={12} sm="auto">
          <FormControl sx={{ minWidth: 240, width: 240 }}>
            <InputLabel>Category</InputLabel>
            <Select value={selectedCategory} label="Category" onChange={(e) => setSelectedCategory(e.target.value)}>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={3} sx={{ textAlign: 'right' }}>
          <Typography variant="caption" color="textSecondary">
            {selected.length > 0 ? (
              <strong style={{ color: '#ff4d4f' }}>{selected.length} items selected for deletion</strong>
            ) : (
              `Total ${filteredItems.length} Store Items`
            )}
          </Typography>
        </Grid>
      </Grid>

      {/* Items Table */}
      <TableContainer>
        <Table sx={{ minWidth: 750 }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={selected.length > 0 && selected.length < filteredItems.length}
                  checked={filteredItems.length > 0 && selected.length === filteredItems.length}
                  onChange={handleSelectAllClick}
                  inputProps={{ 'aria-label': 'select all items' }}
                />
              </TableCell>
              <TableCell>Item Code / SKU</TableCell>
              <TableCell>Item Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="center">Total Stock</TableCell>
              <TableCell align="center">Used Today</TableCell>
              <TableCell align="center">Remaining Available Stock</TableCell>
              <TableCell align="right">Unit Price</TableCell>
              <TableCell>Location</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.map((item) => {
              const isLow = item.remainingStock <= item.minLevel;
              const isItemSelected = isSelected(item.id);

              return (
                <TableRow key={item.id} hover selected={isItemSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={isItemSelected}
                      onChange={(e) => handleSelectOne(e, item.id)}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {item.itemCode}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {item.name}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip label={item.category} size="small" variant="light" color="primary" />
                  </TableCell>

                  <TableCell align="center">
                    {item.totalStock} {item.unit}
                  </TableCell>

                  <TableCell align="center">
                    <Typography variant="subtitle2" color="error.main" fontWeight={700}>
                      {item.usedToday} {item.unit}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                      <Typography variant="subtitle1" fontWeight={700} color={isLow ? 'error.main' : 'success.main'}>
                        {item.remainingStock} {item.unit}
                      </Typography>
                      {isLow && (
                        <Tooltip title={`Low Stock! Minimum level is ${item.minLevel} ${item.unit}`}>
                          <Chip icon={<WarningOutlined />} label="Low" size="small" color="warning" />
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>

                  <TableCell align="right">${item.unitPrice}</TableCell>

                  <TableCell>
                    <Chip label={item.rackLocation || 'Store'} size="small" sx={{ bgcolor: 'grey.100' }} />
                  </TableCell>

                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Stock Out (Usage)">
                        <IconButton color="primary" size="small" onClick={() => handleOpenStockOut(item)}>
                          <ExportOutlined />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Stock In (Shipment Received)">
                        <IconButton color="success" size="small" onClick={() => handleOpenStockIn(item)}>
                          <ImportOutlined />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Edit Item">
                        <IconButton color="info" size="small" onClick={() => handleOpenEdit(item)}>
                          <EditOutlined />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete Item">
                        <IconButton color="error" size="small" onClick={() => handleOpenDelete(item)}>
                          <DeleteOutlined />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal 1: Stock Out */}
      <Dialog open={stockOutOpen} onClose={() => setStockOutOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>📤 Stock Out (Usage): {targetItem?.name}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="caption" color="textSecondary" display="block">
                Available Stock Right Now:
              </Typography>
              <Typography variant="h5" color="primary.main" fontWeight={700}>
                {targetItem?.remainingStock} {targetItem?.unit}
              </Typography>
            </Box>

            <TextField
              label="Quantity Used / Issued"
              type="number"
              fullWidth
              inputProps={{ min: 1, max: targetItem?.remainingStock }}
              value={qtyUsed}
              onChange={(e) => setQtyUsed(Math.max(1, parseInt(e.target.value) || 1))}
            />

            <TextField
              label="Who Used (Operator / Worker Name)"
              fullWidth
              required
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
              label="Notes"
              fullWidth
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setStockOutOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleStockOutSubmit}>
            Record Stock Out
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal 2: Stock In */}
      <Dialog open={stockInOpen} onClose={() => setStockInOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>📥 Stock In: {targetItem?.name}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Quantity Received"
              type="number"
              fullWidth
              inputProps={{ min: 1 }}
              value={qtyReceived}
              onChange={(e) => setQtyReceived(Math.max(1, parseInt(e.target.value) || 1))}
            />

            <TextField
              label="Supplier / Vendor"
              fullWidth
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setStockInOpen(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleStockInSubmit}>
            Record Stock In
          </Button>
        </DialogActions>
      </Dialog>

      {/* Drawer 3: Add New Item */}
      <Drawer anchor="right" open={addDrawerOpen} onClose={() => setAddDrawerOpen(false)}>
        <Box sx={{ width: 420, p: 3 }}>
          <Typography variant="h4" sx={{ mb: 3 }}>
            Add New Item to Store
          </Typography>

          <form onSubmit={handleAddItemSubmit}>
            <Stack spacing={2.5}>
              <TextField
                label="Item Code / SKU"
                fullWidth
                required
                value={newItem.itemCode}
                onChange={(e) => setNewItem({ ...newItem, itemCode: e.target.value })}
              />

              {/* Autocomplete for Saved Master Item Names */}
              <Autocomplete
                freeSolo
                options={masterItemNames.map((m) => m.name)}
                value={newItem.name}
                onInputChange={(event, newInputValue) => {
                  const matchedMaster = masterItemNames.find((m) => m.name.toLowerCase() === newInputValue.toLowerCase());
                  setNewItem({
                    ...newItem,
                    name: newInputValue,
                    category: matchedMaster ? matchedMaster.category : newItem.category,
                    unit: matchedMaster ? matchedMaster.defaultUnit : newItem.unit
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Item Name (Select saved or type new)"
                    required
                    placeholder="Pick pre-saved item name or type new"
                  />
                )}
              />

              <TextField
                label="Category"
                fullWidth
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Total Stock"
                    type="number"
                    fullWidth
                    required
                    value={newItem.totalStock}
                    onChange={(e) => setNewItem({ ...newItem, totalStock: parseInt(e.target.value) || 0 })}
                  />
                </Grid>
                <Grid item xs={6}>
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
                <Grid item xs={6}>
                  <TextField
                    label="Unit Price ($)"
                    type="number"
                    fullWidth
                    value={newItem.unitPrice}
                    onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Min Level"
                    type="number"
                    fullWidth
                    value={newItem.minLevel}
                    onChange={(e) => setNewItem({ ...newItem, minLevel: parseInt(e.target.value) || 5 })}
                  />
                </Grid>
              </Grid>

              <TextField
                label="Location"
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

      {/* Drawer 4: Edit Item */}
      <Drawer anchor="right" open={editDrawerOpen} onClose={() => setEditDrawerOpen(false)}>
        <Box sx={{ width: 420, p: 3 }}>
          <Typography variant="h4" sx={{ mb: 3 }}>
            Edit Item Details
          </Typography>

          {editingItem && (
            <form onSubmit={handleEditItemSubmit}>
              <Stack spacing={2.5}>
                <TextField
                  label="Item Code / SKU"
                  fullWidth
                  disabled
                  value={editingItem.itemCode}
                />

                <TextField
                  label="Item Name"
                  fullWidth
                  required
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                />

                <TextField
                  label="Category"
                  fullWidth
                  value={editingItem.category}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                />

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Total Stock"
                      type="number"
                      fullWidth
                      required
                      value={editingItem.totalStock}
                      onChange={(e) => setEditingItem({ ...editingItem, totalStock: parseInt(e.target.value) || 0 })}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Unit"
                      fullWidth
                      value={editingItem.unit}
                      onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Unit Price ($)"
                      type="number"
                      fullWidth
                      value={editingItem.unitPrice}
                      onChange={(e) => setEditingItem({ ...editingItem, unitPrice: parseFloat(e.target.value) || 0 })}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Min Level"
                      type="number"
                      fullWidth
                      value={editingItem.minLevel}
                      onChange={(e) => setEditingItem({ ...editingItem, minLevel: parseInt(e.target.value) || 5 })}
                    />
                  </Grid>
                </Grid>

                <TextField
                  label="Rack Location"
                  fullWidth
                  value={editingItem.rackLocation}
                  onChange={(e) => setEditingItem({ ...editingItem, rackLocation: e.target.value })}
                />

                <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 2 }}>
                  <Button variant="outlined" color="secondary" onClick={() => setEditDrawerOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="contained" color="primary" type="submit">
                    Update Item Changes
                  </Button>
                </Stack>
              </Stack>
            </form>
          )}
        </Box>
      </Drawer>

      {/* Modal 5: Confirm Single Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>
          🗑️ Delete Item Confirmation
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete item <strong>"{itemToDelete?.name}"</strong> ({itemToDelete?.itemCode})? This action will permanently remove the item from your store inventory.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirmSingleDelete} variant="contained" color="error">
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal 6: Confirm Bulk Delete Multiple Items Dialog */}
      <Dialog open={bulkDeleteDialogOpen} onClose={() => setBulkDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>
          🗑️ Delete All Selected Items Confirmation
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete all <strong>{selected.length} selected items</strong> from your store inventory? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setBulkDeleteDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirmBulkDelete} variant="contained" color="error">
            Delete All {selected.length} Items
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
