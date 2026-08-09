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
  DialogTitle,
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
import { ExportOutlined, SearchOutlined, ArrowDownOutlined } from '@ant-design/icons';

// project imports
import MainCard from 'components/MainCard';

export default function StockOutPage() {
  const { items, usageLogs, issueStock } = useStoreInventory();

  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState([]);

  // Stock Out Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(items[0]?.id || '');
  const [qtyUsed, setQtyUsed] = useState(5);
  const [usedBy, setUsedBy] = useState('Zubair Ahmed');
  const [department, setDepartment] = useState('Assembly Line 1');
  const [notes, setNotes] = useState('Daily production issue');

  // Filter logs for OUT transactions only
  const stockOutLogs = usageLogs.filter(
    (log) =>
      log.type.includes('OUT') &&
      (log.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.usedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedItemObj = items.find((i) => i.id === selectedItemId);

  // Checkbox Handlers
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = stockOutLogs.map((n) => n.id);
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
    if (!selectedItemId || !usedBy) {
      alert('Please select an item and enter operator name (Who Used).');
      return;
    }
    const success = issueStock(selectedItemId, qtyUsed, usedBy, department, 'Store Keeper', notes);
    if (success) {
      setModalOpen(false);
    } else {
      alert('Cannot issue stock. Stock insufficient!');
    }
  };

  return (
    <MainCard
      title="Stock Out (Daily Usage Logs & Issuance)"
      secondary={
        <Button variant="contained" color="primary" startIcon={<ExportOutlined />} onClick={() => setModalOpen(true)}>
          + Record Stock Out (Usage)
        </Button>
      }
    >
      {/* Search Bar */}
      <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
        <Grid item xs={12} sm={6}>
          <OutlinedInput
            fullWidth
            placeholder="Search Stock Out logs by Item Name, Worker Name (Who Used), Dept..."
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
              `Total ${stockOutLogs.length} Stock Out Records`
            )}
          </Typography>
        </Grid>
      </Grid>

      {/* Stock Out Table */}
      <TableContainer>
        <Table sx={{ minWidth: 750 }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={selected.length > 0 && selected.length < stockOutLogs.length}
                  checked={stockOutLogs.length > 0 && selected.length === stockOutLogs.length}
                  onChange={handleSelectAllClick}
                  inputProps={{ 'aria-label': 'select all stock out' }}
                />
              </TableCell>
              <TableCell>Log ID / Time</TableCell>
              <TableCell>Item Code / SKU</TableCell>
              <TableCell>Item Name</TableCell>
              <TableCell align="center">Qty Used / Issued</TableCell>
              <TableCell>Who Used Each Item (Operator Name)</TableCell>
              <TableCell>Department / Line</TableCell>
              <TableCell align="right">Remaining Stock After</TableCell>
              <TableCell>Issued By</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stockOutLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    No Stock Out usage records found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              stockOutLogs.map((log) => {
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
                      <Typography variant="subtitle1" fontWeight={700} color="error.main" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <ArrowDownOutlined /> -{log.qtyUsed}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip label={log.usedBy} size="small" color="primary" variant="outlined" sx={{ fontWeight: 600 }} />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{log.department}</Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                        {log.remainingStockAfter} available
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="caption" color="textSecondary">
                        {log.issuedBy}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Drawer: Add Stock Out / Issue Item */}
      <Drawer anchor="right" open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box sx={{ width: 420, p: 3 }}>
          <Typography variant="h4" sx={{ mb: 3 }}>
            📤 Issue Item (Store OUT)
          </Typography>

          <Stack spacing={2.5}>
            <FormControl fullWidth>
              <InputLabel>Select Item to Issue</InputLabel>
              <Select value={selectedItemId} label="Select Item to Issue" onChange={(e) => setSelectedItemId(e.target.value)}>
                {items.map((i) => (
                  <MenuItem key={i.id} value={i.id}>
                    {i.name} ({i.remainingStock} {i.unit} in stock)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedItemObj && (
              <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="caption" color="textSecondary" display="block">
                  Current Stock Level:
                </Typography>
                <Typography variant="h6" color="primary.main" fontWeight={700}>
                  {selectedItemObj.remainingStock} {selectedItemObj.unit} Available
                </Typography>
              </Box>
            )}

            <TextField
              label="Quantity Used / Issued"
              type="number"
              fullWidth
              inputProps={{ min: 1, max: selectedItemObj?.remainingStock }}
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
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 2 }}>
              <Button variant="outlined" color="secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="contained" color="primary" onClick={handleSubmit}>
                Record Stock Out
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Drawer>
    </MainCard>
  );
}
