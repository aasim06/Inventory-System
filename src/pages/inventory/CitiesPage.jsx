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
import { PlusOutlined, SearchOutlined, DeleteOutlined, EditOutlined, EnvironmentOutlined } from '@ant-design/icons';

// project imports
import MainCard from 'components/MainCard';

export default function CitiesPage() {
  const { cities = [], addCity, updateCity, deleteCity, deleteMultipleCities } = useStoreInventory();

  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState([]);

  // Add City Drawer State
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [newCity, setNewCity] = useState({
    name: '',
    description: ''
  });

  // Edit City Drawer State
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editingCity, setEditingCity] = useState(null);

  // Single Delete Confirmation Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cityToDelete, setCityToDelete] = useState(null);

  // Bulk Delete Confirmation Dialog State
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  const filteredCities = cities.filter((c) => {
    return (
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Checkbox Selection Handlers
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredCities.map((c) => c.id);
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
    if (!newCity.name.trim()) return;
    addCity(newCity);
    setNewCity({ name: '', description: '' });
    setAddDrawerOpen(false);
  };

  // Submit Edit Handler
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingCity || !editingCity.name.trim()) return;
    updateCity(editingCity.id, editingCity);
    setEditDrawerOpen(false);
    setEditingCity(null);
  };

  // Single Delete Confirm Handler
  const handleConfirmSingleDelete = () => {
    if (cityToDelete) {
      deleteCity(cityToDelete.id);
      setSelected((prev) => prev.filter((id) => id !== cityToDelete.id));
    }
    setDeleteDialogOpen(false);
    setCityToDelete(null);
  };

  // Bulk Delete Confirm Handler
  const handleConfirmBulkDelete = () => {
    if (selected.length > 0) {
      deleteMultipleCities(selected);
      setSelected([]);
    }
    setBulkDeleteDialogOpen(false);
  };

  return (
    <MainCard
      title="Cities Directory"
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
            + Add City
          </Button>
        </Stack>
      }
    >
      {/* Search Bar Controls */}
      <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
        <Grid item xs={12} sm={6}>
          <OutlinedInput
            fullWidth
            placeholder="Search cities by Name or Description..."
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
              `Total ${filteredCities.length} Cities`
            )}
          </Typography>
        </Grid>
      </Grid>

      {/* Cities Table */}
      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={selected.length > 0 && selected.length < filteredCities.length}
                  checked={filteredCities.length > 0 && selected.length === filteredCities.length}
                  onChange={handleSelectAllClick}
                  inputProps={{ 'aria-label': 'select all cities' }}
                />
              </TableCell>
              <TableCell>City ID</TableCell>
              <TableCell>City Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    No cities found. Click "+ Add City" to create one.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredCities.map((c) => {
                const isCitySelected = isSelected(c.id);

                return (
                  <TableRow key={c.id} hover selected={isCitySelected}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isCitySelected}
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
                        📍 {c.name}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {c.description || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Edit City">
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => {
                              setEditingCity(c);
                              setEditDrawerOpen(true);
                            }}
                          >
                            <EditOutlined />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete City">
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => {
                              setCityToDelete(c);
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

      {/* Drawer 1: Add City */}
      <Drawer anchor="right" open={addDrawerOpen} onClose={() => setAddDrawerOpen(false)}>
        <Box sx={{ width: 420, p: 3 }}>
          <Typography variant="h4" sx={{ mb: 3 }}>
            📍 Add New City
          </Typography>

          <form onSubmit={handleAddSubmit}>
            <Stack spacing={2.5}>
              <TextField
                label="City Name"
                fullWidth
                required
                placeholder="e.g. Karachi"
                value={newCity.name}
                onChange={(e) => setNewCity({ ...newCity, name: e.target.value })}
              />

              <TextField
                label="Description"
                fullWidth
                multiline
                rows={4}
                placeholder="Enter city description or region details..."
                value={newCity.description}
                onChange={(e) => setNewCity({ ...newCity, description: e.target.value })}
              />

              <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 2 }}>
                <Button variant="outlined" color="secondary" onClick={() => setAddDrawerOpen(false)}>
                  Cancel
                </Button>
                <Button variant="contained" type="submit">
                  Save City
                </Button>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Drawer>

      {/* Drawer 2: Edit City */}
      <Drawer anchor="right" open={editDrawerOpen} onClose={() => setEditDrawerOpen(false)}>
        <Box sx={{ width: 420, p: 3 }}>
          <Typography variant="h4" sx={{ mb: 3 }}>
            Edit City Details
          </Typography>

          {editingCity && (
            <form onSubmit={handleEditSubmit}>
              <Stack spacing={2.5}>
                <TextField
                  label="City ID"
                  fullWidth
                  disabled
                  value={editingCity.id}
                />

                <TextField
                  label="City Name"
                  fullWidth
                  required
                  value={editingCity.name}
                  onChange={(e) => setEditingCity({ ...editingCity, name: e.target.value })}
                />

                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={4}
                  value={editingCity.description}
                  onChange={(e) => setEditingCity({ ...editingCity, description: e.target.value })}
                />

                <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 2 }}>
                  <Button variant="outlined" color="secondary" onClick={() => setEditDrawerOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="contained" color="primary" type="submit">
                    Update City
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
          🗑️ Delete City Confirmation
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete city <strong>"{cityToDelete?.name}"</strong>?
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
          🗑️ Delete All Selected Cities Confirmation
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete all <strong>{selected.length} selected cities</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setBulkDeleteDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirmBulkDelete} variant="contained" color="error">
            Delete All {selected.length} Cities
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
