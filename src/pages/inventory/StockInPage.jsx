import { useState } from 'react';
import { useStoreInventory } from 'context/StoreInventoryContext';

// material-ui
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Drawer,
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
import { ImportOutlined, SearchOutlined, ArrowUpOutlined } from '@ant-design/icons';

// project imports
import MainCard from 'components/MainCard';

const UNIT_OPTIONS = ['PCS', 'KG', 'Liter', 'Meter', 'Set'];

const DEFAULT_CATEGORIES = [
  'General',
  'Electrical & Motors',
  'Mechanical Parts',
  'Sensors & Automation',
  'Hydraulics',
  'Pneumatics',
  'Raw Materials',
  'Fasteners & Hardware'
];

export default function StockInPage() {
  const { items = [], masterItemNames = [], categories = [], usageLogs = [], receiveStock, addNewItem } = useStoreInventory();

  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState([]);

  // Available categories list
  const categoryOptions = categories.length > 0 ? categories.map((c) => c.name) : DEFAULT_CATEGORIES;

  // Combine items & masterItemNames for autocomplete options
  const existingNamesList = Array.from(
    new Set([
      ...items.map((i) => i.name),
      ...masterItemNames.map((m) => m.name)
    ])
  );

  // Stock In Drawer Form State (6 Inputs)
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    itemName: '',
    itemCode: `RM-${Math.floor(100 + Math.random() * 900)}`,
    category: 'General',
    unit: 'PCS',
    startingStock: 50,
    lowStockWarningAt: 10
  });

  // Handle Item Name Selection
  const handleItemNameChange = (event, newValue) => {
    const selectedName = newValue || '';
    const matchedItem = items.find((i) => i.name.toLowerCase() === selectedName.toLowerCase());

    if (matchedItem) {
      setForm((prev) => ({
        ...prev,
        itemName: matchedItem.name,
        itemCode: matchedItem.itemCode || prev.itemCode,
        category: matchedItem.category || prev.category,
        unit: matchedItem.unit || 'PCS',
        lowStockWarningAt: matchedItem.minLevel || prev.lowStockWarningAt
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        itemName: selectedName
      }));
    }
  };

  // Filter logs for IN transactions
  const stockInLogs = usageLogs.filter((log) => {
    const isIN = log.type.includes('IN');
    const matchesSearch =
      log.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.usedBy && log.usedBy.toLowerCase().includes(searchTerm.toLowerCase()));

    return isIN && matchesSearch;
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

  // Handle Submit (Record Stock In)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.itemName.trim()) return;

    // Check if item already exists in items
    const existingItem = items.find(
      (i) => i.itemCode.toLowerCase() === form.itemCode.toLowerCase() || i.name.toLowerCase() === form.itemName.toLowerCase()
    );

    if (existingItem) {
      // Receive stock for existing item
      receiveStock(existingItem.id, form.startingStock, 'Shipment Inward', `PO-${Math.floor(1000 + Math.random() * 9000)}`);
    } else {
      // Create new store item & receive stock
      addNewItem({
        name: form.itemName,
        itemCode: form.itemCode || `RM-${Math.floor(100 + Math.random() * 900)}`,
        category: form.category,
        unit: form.unit,
        totalStock: parseInt(form.startingStock) || 1,
        minLevel: parseInt(form.lowStockWarningAt) || 10,
        unitPrice: 0,
        rackLocation: 'Main Store'
      });

      // Record inward log
      receiveStock(form.itemCode, form.startingStock, 'Shipment Inward', `PO-${Math.floor(1000 + Math.random() * 9000)}`);
    }

    // Reset Form & Close Drawer
    setForm({
      itemName: '',
      itemCode: `RM-${Math.floor(100 + Math.random() * 900)}`,
      category: 'General',
      unit: 'PCS',
      startingStock: 50,
      lowStockWarningAt: 10
    });
    setModalOpen(false);
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
      {/* Search Bar Controls */}
      <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
        <Grid item xs={12} sm={6}>
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

        <Grid item xs={12} sm={6} sx={{ textAlign: 'right' }}>
          <Typography variant="caption" color="textSecondary">
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
                      <Chip label={log.usedBy || 'Shipment'} size="small" color="success" variant="light" />
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

      {/* Drawer: Add Stock In (6 Inputs Form) */}
      <Drawer anchor="right" open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box sx={{ width: 420, p: 3 }}>
          <Typography variant="h4" sx={{ mb: 3 }}>
            📥 Add Stock In
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              {/* 1. Item Name */}
              <Autocomplete
                freeSolo
                options={existingNamesList}
                value={form.itemName}
                onInputChange={(event, newInputValue) => handleItemNameChange(event, newInputValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Item Name"
                    required
                    placeholder="e.g. 3HP Electric Motor or type new"
                  />
                )}
              />

              {/* 2. Item Code */}
              <TextField
                label="Item Code (Short ID)"
                fullWidth
                required
                placeholder="e.g. RM-001"
                value={form.itemCode}
                onChange={(e) => setForm({ ...form, itemCode: e.target.value })}
              />

              {/* 3. Category */}
              <TextField
                select
                label="Category"
                fullWidth
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {categoryOptions.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>

              {/* 4. Unit */}
              <TextField
                select
                id="itemUnit"
                label="Unit"
                fullWidth
                required
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
              >
                {UNIT_OPTIONS.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </TextField>

              {/* 5. Starting Stock / Quantity Received */}
              <TextField
                label="Starting Stock (Quantity Received)"
                type="number"
                fullWidth
                required
                inputProps={{ min: 1 }}
                value={form.startingStock}
                onChange={(e) => setForm({ ...form, startingStock: parseInt(e.target.value) || 1 })}
              />

              {/* 6. Low Stock Warning At */}
              <TextField
                label="Low Stock Warning At (Min Level)"
                type="number"
                fullWidth
                required
                inputProps={{ min: 1 }}
                value={form.lowStockWarningAt}
                onChange={(e) => setForm({ ...form, lowStockWarningAt: parseInt(e.target.value) || 1 })}
              />

              {/* Action Buttons */}
              <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 2 }}>
                <Button variant="outlined" color="secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="contained" color="success" type="submit">
                  Record Stock In
                </Button>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Drawer>
    </MainCard>
  );
}
