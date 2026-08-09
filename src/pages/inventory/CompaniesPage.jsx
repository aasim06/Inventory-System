import { useState } from 'react';
import { useStoreInventory } from 'context/StoreInventoryContext';

// material-ui
import {
  Box,
  Button,
  Checkbox,
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
import { PlusOutlined, SearchOutlined, DeleteOutlined, EditOutlined, BankOutlined } from '@ant-design/icons';

// project imports
import MainCard from 'components/MainCard';

export default function CompaniesPage() {
  const { companies = [], addCompany, updateCompany, deleteCompany, deleteMultipleCompanies } = useStoreInventory();

  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState([]);

  // Add Company Drawer State
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    description: ''
  });

  // Edit Company Drawer State
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

  // Single Delete Confirmation Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState(null);

  // Bulk Delete Confirmation Dialog State
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  const filteredCompanies = companies.filter((c) => {
    return (
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Checkbox Selection Handlers
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredCompanies.map((c) => c.id);
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

  // Submit Add Handler
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newCompany.name.trim()) return;
    addCompany(newCompany);
    setNewCompany({ name: '', description: '' });
    setAddDrawerOpen(false);
  };

  // Submit Edit Handler
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingCompany || !editingCompany.name.trim()) return;
    updateCompany(editingCompany.id, editingCompany);
    setEditDrawerOpen(false);
    setEditingCompany(null);
  };

  // Single Delete Confirm Handler
  const handleConfirmSingleDelete = () => {
    if (companyToDelete) {
      deleteCompany(companyToDelete.id);
      setSelected((prev) => prev.filter((id) => id !== companyToDelete.id));
    }
    setDeleteDialogOpen(false);
    setCompanyToDelete(null);
  };

  // Bulk Delete Confirm Handler
  const handleConfirmBulkDelete = () => {
    if (selected.length > 0) {
      deleteMultipleCompanies(selected);
      setSelected([]);
    }
    setBulkDeleteDialogOpen(false);
  };

  return (
    <MainCard
      title="Companies Directory"
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

          <Button
            variant="contained"
            color="primary"
            startIcon={<PlusOutlined />}
            onClick={() => setAddDrawerOpen(true)}
          >
            + Add Company
          </Button>
        </Stack>
      }
    >
      {/* Search Bar Controls */}
      <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
        <Grid item xs={12} sm={6}>
          <OutlinedInput
            fullWidth
            placeholder="Search companies by Name or Description..."
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
              <strong style={{ color: '#1677ff' }}>{selected.length} selected</strong>
            ) : (
              `Total ${filteredCompanies.length} Companies`
            )}
          </Typography>
        </Grid>
      </Grid>

      {/* Companies Table */}
      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={selected.length > 0 && selected.length < filteredCompanies.length}
                  checked={filteredCompanies.length > 0 && selected.length === filteredCompanies.length}
                  onChange={handleSelectAllClick}
                  inputProps={{ 'aria-label': 'select all companies' }}
                />
              </TableCell>
              <TableCell>Company ID</TableCell>
              <TableCell>Company Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCompanies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    No companies found. Click "+ Add Company" to create one.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredCompanies.map((c) => {
                const isCompanySelected = isSelected(c.id);

                return (
                  <TableRow key={c.id} hover selected={isCompanySelected}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isCompanySelected}
                        onChange={(e) => handleSelectOne(e, c.id)}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {c.id}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                        🏢 {c.name}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {c.description || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Edit Company">
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => {
                              setEditingCompany(c);
                              setEditDrawerOpen(true);
                            }}
                          >
                            <EditOutlined />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete Company">
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => {
                              setCompanyToDelete(c);
                              setDeleteDialogOpen(true);
                            }}
                          >
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

      {/* Drawer 1: Add Company */}
      <Drawer anchor="right" open={addDrawerOpen} onClose={() => setAddDrawerOpen(false)}>
        <Box sx={{ width: 420, p: 3 }}>
          <Typography variant="h4" sx={{ mb: 3 }}>
            🏢 Add New Company
          </Typography>

          <form onSubmit={handleAddSubmit}>
            <Stack spacing={2.5}>
              <TextField
                label="Company Name"
                fullWidth
                required
                placeholder="e.g. Siemens Pakistan Ltd"
                value={newCompany.name}
                onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
              />

              <TextField
                label="Description"
                fullWidth
                multiline
                rows={4}
                placeholder="Enter company description or notes..."
                value={newCompany.description}
                onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
              />

              <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 2 }}>
                <Button variant="outlined" color="secondary" onClick={() => setAddDrawerOpen(false)}>
                  Cancel
                </Button>
                <Button variant="contained" type="submit">
                  Save Company
                </Button>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Drawer>

      {/* Drawer 2: Edit Company */}
      <Drawer anchor="right" open={editDrawerOpen} onClose={() => setEditDrawerOpen(false)}>
        <Box sx={{ width: 420, p: 3 }}>
          <Typography variant="h4" sx={{ mb: 3 }}>
            Edit Company Details
          </Typography>

          {editingCompany && (
            <form onSubmit={handleEditSubmit}>
              <Stack spacing={2.5}>
                <TextField
                  label="Company ID"
                  fullWidth
                  disabled
                  value={editingCompany.id}
                />

                <TextField
                  label="Company Name"
                  fullWidth
                  required
                  value={editingCompany.name}
                  onChange={(e) => setEditingCompany({ ...editingCompany, name: e.target.value })}
                />

                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={4}
                  value={editingCompany.description}
                  onChange={(e) => setEditingCompany({ ...editingCompany, description: e.target.value })}
                />

                <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 2 }}>
                  <Button variant="outlined" color="secondary" onClick={() => setEditDrawerOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="contained" color="primary" type="submit">
                    Update Company
                  </Button>
                </Stack>
              </Stack>
            </form>
          )}
        </Box>
      </Drawer>

      {/* Modal 3: Confirm Single Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>
          🗑️ Delete Company Confirmation
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete company <strong>"{companyToDelete?.name}"</strong>?
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

      {/* Modal 4: Confirm Bulk Delete Dialog */}
      <Dialog open={bulkDeleteDialogOpen} onClose={() => setBulkDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>
          🗑️ Delete All Selected Companies Confirmation
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete all <strong>{selected.length} selected companies</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setBulkDeleteDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirmBulkDelete} variant="contained" color="error">
            Delete All {selected.length} Companies
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
