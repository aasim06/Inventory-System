import { useState } from 'react';
import { useStoreInventory } from 'context/StoreInventoryContext';

// material-ui
import {
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
  Grid,
  IconButton,
  InputAdornment,
  OutlinedInput,
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
import { PlusOutlined, SearchOutlined, DeleteOutlined, EditOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';

// project imports
import MainCard from 'components/MainCard';

export default function VendorsPage() {
  const { vendors, addVendor, updateVendor, deleteVendor, deleteMultipleVendors } = useStoreInventory();

  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState([]);

  // Add Vendor Drawer State
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [newVendor, setNewVendor] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    category: 'General Supplies',
    address: ''
  });

  // Edit Vendor Drawer State
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);

  // Single Delete Confirmation Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState(null);

  // Bulk Delete Confirmation Dialog State
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  const filteredVendors = vendors.filter((v) => {
    return (
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Checkbox Selection Handlers
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredVendors.map((n) => n.id);
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

  // Handle Add Vendor Submit
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newVendor.name) return;
    addVendor(newVendor);
    setNewVendor({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      category: 'General Supplies',
      address: ''
    });
    setAddDrawerOpen(false);
  };

  // Handle Open Edit Drawer
  const handleOpenEdit = (vendor) => {
    setEditingVendor({ ...vendor });
    setEditDrawerOpen(true);
  };

  // Handle Edit Vendor Submit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingVendor || !editingVendor.name) return;
    updateVendor(editingVendor.id, editingVendor);
    setEditDrawerOpen(false);
    setEditingVendor(null);
  };

  // Handle Open Delete Modal
  const handleOpenDelete = (vendor) => {
    setVendorToDelete(vendor);
    setDeleteDialogOpen(true);
  };

  // Handle Confirm Single Delete Vendor
  const handleConfirmSingleDelete = () => {
    if (vendorToDelete) {
      deleteVendor(vendorToDelete.id);
      setSelected((prev) => prev.filter((id) => id !== vendorToDelete.id));
    }
    setDeleteDialogOpen(false);
    setVendorToDelete(null);
  };

  // Handle Confirm Bulk Delete Vendors
  const handleConfirmBulkDelete = () => {
    if (selected.length > 0) {
      deleteMultipleVendors(selected);
      setSelected([]);
    }
    setBulkDeleteDialogOpen(false);
  };

  return (
    <MainCard
      title="Store Vendors & Suppliers Directory"
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
            + Add New Vendor
          </Button>
        </Stack>
      }
    >
      {/* Search Header */}
      <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
        <Grid item xs={12} sm={6}>
          <OutlinedInput
            fullWidth
            placeholder="Search vendor name, contact person, supplied category..."
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
              <strong style={{ color: '#ff4d4f' }}>{selected.length} vendors selected for deletion</strong>
            ) : (
              `Total ${filteredVendors.length} Registered Vendors`
            )}
          </Typography>
        </Grid>
      </Grid>

      {/* Vendors Table */}
      <TableContainer>
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={selected.length > 0 && selected.length < filteredVendors.length}
                  checked={filteredVendors.length > 0 && selected.length === filteredVendors.length}
                  onChange={handleSelectAllClick}
                  inputProps={{ 'aria-label': 'select all vendors' }}
                />
              </TableCell>
              <TableCell>Vendor ID</TableCell>
              <TableCell>Vendor / Company Name</TableCell>
              <TableCell>Contact Person</TableCell>
              <TableCell>Phone Number</TableCell>
              <TableCell>Email Address</TableCell>
              <TableCell>Supplied Category</TableCell>
              <TableCell>Address / City</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredVendors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    No registered vendors found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredVendors.map((vendor) => {
                const isVendorSelected = isSelected(vendor.id);

                return (
                  <TableRow key={vendor.id} hover selected={isVendorSelected}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isVendorSelected}
                        onChange={(e) => handleSelectOne(e, vendor.id)}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {vendor.id}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {vendor.name}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{vendor.contactPerson}</Typography>
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PhoneOutlined style={{ fontSize: 13, color: '#1677ff' }} />
                        <Typography variant="body2">{vendor.phone}</Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <MailOutlined style={{ fontSize: 13, color: '#fa8c16' }} />
                        <Typography variant="caption">{vendor.email}</Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Chip label={vendor.category} size="small" color="primary" variant="light" />
                    </TableCell>

                    <TableCell>
                      <Typography variant="caption" color="textSecondary">
                        {vendor.address}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Edit Vendor">
                          <IconButton color="primary" size="small" onClick={() => handleOpenEdit(vendor)}>
                            <EditOutlined />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete Vendor">
                          <IconButton color="error" size="small" onClick={() => handleOpenDelete(vendor)}>
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

      {/* Drawer 1: Add New Vendor */}
      <Drawer anchor="right" open={addDrawerOpen} onClose={() => setAddDrawerOpen(false)}>
        <Box sx={{ width: 420, p: 3 }}>
          <Typography variant="h4" sx={{ mb: 3 }}>
            Add New Vendor / Supplier
          </Typography>

          <form onSubmit={handleAddSubmit}>
            <Stack spacing={2.5}>
              <TextField
                label="Vendor / Company Name"
                fullWidth
                required
                value={newVendor.name}
                onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
              />

              <TextField
                label="Contact Person Name"
                fullWidth
                required
                value={newVendor.contactPerson}
                onChange={(e) => setNewVendor({ ...newVendor, contactPerson: e.target.value })}
              />

              <TextField
                label="Phone Number"
                fullWidth
                required
                value={newVendor.phone}
                onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
              />

              <TextField
                label="Email Address"
                type="email"
                fullWidth
                value={newVendor.email}
                onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
              />

              <TextField
                label="Supplied Material Category"
                fullWidth
                value={newVendor.category}
                onChange={(e) => setNewVendor({ ...newVendor, category: e.target.value })}
              />

              <TextField
                label="Office / Factory Address"
                fullWidth
                multiline
                rows={2}
                value={newVendor.address}
                onChange={(e) => setNewVendor({ ...newVendor, address: e.target.value })}
              />

              <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 2 }}>
                <Button variant="outlined" color="secondary" onClick={() => setAddDrawerOpen(false)}>
                  Cancel
                </Button>
                <Button variant="contained" type="submit">
                  Save Vendor
                </Button>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Drawer>

      {/* Drawer 2: Edit Vendor */}
      <Drawer anchor="right" open={editDrawerOpen} onClose={() => setEditDrawerOpen(false)}>
        <Box sx={{ width: 420, p: 3 }}>
          <Typography variant="h4" sx={{ mb: 3 }}>
            Edit Vendor Details
          </Typography>

          {editingVendor && (
            <form onSubmit={handleEditSubmit}>
              <Stack spacing={2.5}>
                <TextField
                  label="Vendor ID"
                  fullWidth
                  disabled
                  value={editingVendor.id}
                />

                <TextField
                  label="Vendor / Company Name"
                  fullWidth
                  required
                  value={editingVendor.name}
                  onChange={(e) => setEditingVendor({ ...editingVendor, name: e.target.value })}
                />

                <TextField
                  label="Contact Person Name"
                  fullWidth
                  required
                  value={editingVendor.contactPerson}
                  onChange={(e) => setEditingVendor({ ...editingVendor, contactPerson: e.target.value })}
                />

                <TextField
                  label="Phone Number"
                  fullWidth
                  required
                  value={editingVendor.phone}
                  onChange={(e) => setEditingVendor({ ...editingVendor, phone: e.target.value })}
                />

                <TextField
                  label="Email Address"
                  type="email"
                  fullWidth
                  value={editingVendor.email}
                  onChange={(e) => setEditingVendor({ ...editingVendor, email: e.target.value })}
                />

                <TextField
                  label="Supplied Material Category"
                  fullWidth
                  value={editingVendor.category}
                  onChange={(e) => setEditingVendor({ ...editingVendor, category: e.target.value })}
                />

                <TextField
                  label="Office / Factory Address"
                  fullWidth
                  multiline
                  rows={2}
                  value={editingVendor.address}
                  onChange={(e) => setEditingVendor({ ...editingVendor, address: e.target.value })}
                />

                <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 2 }}>
                  <Button variant="outlined" color="secondary" onClick={() => setEditDrawerOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="contained" color="primary" type="submit">
                    Update Vendor Changes
                  </Button>
                </Stack>
              </Stack>
            </form>
          )}
        </Box>
      </Drawer>

      {/* Modal 3: Confirm Single Delete Vendor Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>
          🗑️ Delete Vendor Confirmation
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete vendor <strong>"{vendorToDelete?.name}"</strong> ({vendorToDelete?.id})? This action will remove the vendor from your directory.
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

      {/* Modal 4: Confirm Bulk Delete Multiple Vendors Dialog */}
      <Dialog open={bulkDeleteDialogOpen} onClose={() => setBulkDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>
          🗑️ Delete All Selected Vendors Confirmation
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete all <strong>{selected.length} selected vendors</strong> from your directory? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setBulkDeleteDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirmBulkDelete} variant="contained" color="error">
            Delete All {selected.length} Vendors
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
