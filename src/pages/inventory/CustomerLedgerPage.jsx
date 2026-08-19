import React, { useState } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Chip from '@mui/material/Chip';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';

import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Autocomplete from '@mui/material/Autocomplete';
import Tooltip from '@mui/material/Tooltip';

// ant design icons
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import DollarOutlined from '@ant-design/icons/DollarOutlined';
import PrinterOutlined from '@ant-design/icons/PrinterOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import DownOutlined from '@ant-design/icons/DownOutlined';
import UpOutlined from '@ant-design/icons/UpOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';

import MainCard from 'components/MainCard';
import { useStoreInventory } from 'context/StoreInventoryContext';

const formatFullDate = (timeStr, dateISO) => {
  if (dateISO) {
    const d = new Date(dateISO);
    if (!isNaN(d.getTime())) {
      const dateFormatted = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const timeFormatted = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      return `${dateFormatted}, ${timeFormatted}`;
    }
  }
  if (timeStr && timeStr.includes('Today,')) {
    const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    return timeStr.replace('Today,', `${todayStr},`);
  }
  return timeStr || '';
};

export default function CustomerLedgerPage() {
  const { machineSales = [], machineModels = [], customerPayments = [], addCustomerPayment, updateMachineSale, deleteMachineSale } = useStoreInventory();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');

  // Expand Customer Invoices Row State
  const [expandedCustomer, setExpandedCustomer] = useState(null);

  // Individual Machine Invoice Print Modal State
  const [printInvoiceModalOpen, setPrintInvoiceModalOpen] = useState(false);
  const [printInvoiceData, setPrintInvoiceData] = useState(null);

  // Individual Machine Invoice Edit Drawer State
  const [editInvoiceDrawerOpen, setEditInvoiceDrawerOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);

  // Individual Machine Invoice Delete Dialog State
  const [deleteInvoiceDialogOpen, setDeleteInvoiceDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

  // Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedCustomerForPay, setSelectedCustomerForPay] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    customerName: '',
    invoiceId: '',
    amountPaid: '',
    paymentMethod: 'Cash',
    referenceNo: '',
    notes: ''
  });

  // Statement Print Modal State
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printCustomerData, setPrintCustomerData] = useState(null);

  // Group Machine Sales by Customer
  const customerMap = {};
  machineSales.forEach((sale) => {
    const custKey = (sale.customerName || 'Walk-in Customer').trim();
    if (!customerMap[custKey]) {
      customerMap[custKey] = {
        customerName: custKey,
        phone: sale.customerPhone || '',
        city: sale.cityAddress || '',
        totalInvoicesCount: 0,
        totalPurchasesVal: 0,
        totalPaidVal: 0,
        balanceVal: 0,
        invoices: []
      };
    }
    const billTotal = sale.lineTotal || 0;
    const paid = sale.paidAmount || 0;

    customerMap[custKey].totalInvoicesCount += 1;
    customerMap[custKey].totalPurchasesVal += billTotal;
    customerMap[custKey].totalPaidVal += paid;
    customerMap[custKey].invoices.push(sale);
    if (!customerMap[custKey].phone && sale.customerPhone) customerMap[custKey].phone = sale.customerPhone;
    if (!customerMap[custKey].city && sale.cityAddress) customerMap[custKey].city = sale.cityAddress;
  });

  // Calculate Net Balances
  const customerList = Object.values(customerMap).map((cust) => {
    const balance = Math.max(0, cust.totalPurchasesVal - cust.totalPaidVal);
    return { ...cust, balanceVal: balance };
  });

  // Filtered List
  const filteredCustomers = customerList.filter(
    (c) =>
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Computed Overall Summary
  const grandTotalBilled = customerList.reduce((acc, c) => acc + c.totalPurchasesVal, 0);
  const grandTotalCollected = customerList.reduce((acc, c) => acc + c.totalPaidVal, 0);
  const grandTotalReceivables = customerList.reduce((acc, c) => acc + c.balanceVal, 0);

  // Open Payment Modal
  const handleOpenPaymentModal = (cust) => {
    setSelectedCustomerForPay(cust);
    setPaymentForm({
      customerName: cust.customerName,
      invoiceId: cust.invoices.length === 1 ? cust.invoices[0].id : '',
      amountPaid: '',
      remainingBalance: cust.balanceVal,
      paymentMethod: 'Cash',
      referenceNo: '',
      notes: ''
    });
    setPaymentModalOpen(true);
  };

  // Submit Payment Handler
  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    const paidNum = parseFloat(paymentForm.amountPaid) || 0;
    if (paidNum <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    addCustomerPayment({
      customerName: paymentForm.customerName,
      invoiceId: paymentForm.invoiceId,
      amountPaid: paidNum,
      paymentMethod: paymentForm.paymentMethod,
      referenceNo: paymentForm.referenceNo,
      notes: paymentForm.notes
    });

    setPaymentModalOpen(false);
  };

  // Open Print Invoice Modal
  const handleOpenPrintInvoice = (inv) => {
    setPrintInvoiceData(inv);
    setPrintInvoiceModalOpen(true);
  };

  // Open Edit Invoice Drawer
  const handleOpenEditInvoice = (inv) => {
    const itemsArray = (inv.items && inv.items.length > 0) ? inv.items : [
      {
        machineName: inv.machineName,
        serialNo: inv.serialNo,
        qty: inv.qty,
        unitPrice: inv.unitPrice,
        discount: inv.discount || 0
      }
    ];

    setEditingInvoice({ ...inv, items: itemsArray });
    setEditInvoiceDrawerOpen(true);
  };

  const handleEditInvoiceSubmit = (e) => {
    e.preventDefault();
    if (!editingInvoice) return;

    const itemsList = (editingInvoice.items && editingInvoice.items.length > 0)
      ? editingInvoice.items.map((i) => {
          const q = parseInt(i.qty) || 1;
          const p = parseFloat(i.unitPrice) || 0;
          const discPercent = parseFloat(i.discount) || 0;
          const gross = q * p;
          const discAmount = (gross * discPercent) / 100;
          const lineTotal = Math.max(0, gross - discAmount);
          return {
            machineName: i.machineName || 'Machine',
            serialNo: i.serialNo || '',
            qty: q,
            unitPrice: p,
            discount: discPercent,
            discountAmount: discAmount,
            lineTotal
          };
        })
      : [{
          machineName: editingInvoice.machineName,
          serialNo: editingInvoice.serialNo,
          qty: parseInt(editingInvoice.qty) || 1,
          unitPrice: parseFloat(editingInvoice.unitPrice) || 0,
          discount: parseFloat(editingInvoice.discount) || 0,
          discountAmount: (((parseInt(editingInvoice.qty) || 1) * (parseFloat(editingInvoice.unitPrice) || 0)) * (parseFloat(editingInvoice.discount) || 0)) / 100,
          lineTotal: Math.max(0, ((parseInt(editingInvoice.qty) || 1) * (parseFloat(editingInvoice.unitPrice) || 0)) - ((((parseInt(editingInvoice.qty) || 1) * (parseFloat(editingInvoice.unitPrice) || 0)) * (parseFloat(editingInvoice.discount) || 0)) / 100))
        }];

    const subTotal = itemsList.reduce((sum, i) => sum + i.lineTotal, 0);
    const discSum = itemsList.reduce((sum, i) => sum + (i.discountAmount || 0), 0);
    const total = subTotal;
    const totalQtySum = itemsList.reduce((sum, i) => sum + i.qty, 0);
    const paid = parseFloat(editingInvoice.paidAmount) || 0;
    const bal = Math.max(0, total - paid);
    const status = paid >= total ? 'Paid' : paid > 0 ? 'Partial' : 'Unpaid';
    const firstMachine = itemsList[0] || {};

    updateMachineSale(editingInvoice.id, {
      customerName: editingInvoice.customerName,
      customerPhone: editingInvoice.customerPhone,
      cityAddress: editingInvoice.cityAddress,
      items: itemsList,
      machineName: itemsList.length > 1 ? `${firstMachine.machineName} (+${itemsList.length - 1} more)` : firstMachine.machineName,
      serialNo: firstMachine.serialNo,
      qty: totalQtySum,
      unitPrice: firstMachine.unitPrice,
      subTotal,
      discountAmount: discSum,
      lineTotal: total,
      paidAmount: paid,
      balanceAmount: bal,
      paymentStatus: status,
      warrantyTerms: editingInvoice.warrantyTerms
    });

    setEditInvoiceDrawerOpen(false);
  };

  const handleEditItemChange = (index, field, value) => {
    setEditingInvoice((prev) => {
      if (!prev) return prev;
      const updated = [...(prev.items || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, items: updated };
    });
  };

  const handleAddEditItemRow = () => {
    setEditingInvoice((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: [
          ...(prev.items || []),
          { machineName: '', serialNo: '', qty: 1, unitPrice: 0, discount: 0 }
        ]
      };
    });
  };

  const handleRemoveEditItemRow = (index) => {
    setEditingInvoice((prev) => {
      if (!prev || (prev.items || []).length <= 1) return prev;
      return {
        ...prev,
        items: prev.items.filter((_, idx) => idx !== index)
      };
    });
  };

  // Delete Invoice Handler
  const handleConfirmDeleteInvoice = () => {
    if (invoiceToDelete) {
      deleteMachineSale(invoiceToDelete.id);
      setInvoiceToDelete(null);
      setDeleteInvoiceDialogOpen(false);
    }
  };
  const handlePrintStatement = (cust) => {
    const custPaymentsList = customerPayments.filter(
      (p) => p.customerName.toLowerCase() === cust.customerName.toLowerCase()
    );
    setPrintCustomerData({
      ...cust,
      payments: custPaymentsList
    });
    setPrintModalOpen(true);
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      {/* Top Banner Header */}
      <MainCard
        sx={{
          mb: 3,
          background: (theme) => (theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' : '#ffffff'),
          borderLeft: '5px solid #3b82f6'
        }}
      >
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid item xs={12} md={6}>
            <Typography variant="h3" fontWeight={800} color="textPrimary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <UserOutlined style={{ color: '#3b82f6' }} /> Customer Receivables & Khaata Ledger
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
              Track customer accounts, machine sale receivables, record partial/full cash payments, and print account statements.
            </Typography>
          </Grid>

          {/* Metric Summary Cards */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, width: '100%' }}>
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc'),
                  borderRadius: 1.5,
                  border: '1px solid',
                  borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0'),
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="caption" color="textSecondary" fontWeight={700} display="block" noWrap>
                  TOTAL BILLED
                </Typography>
                <Typography variant="subtitle1" fontWeight={800} color="primary.main">
                  Rs. {grandTotalBilled.toLocaleString()}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 1.5,
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.12)' : '#f0fdf4'),
                  borderRadius: 1.5,
                  border: '1px solid',
                  borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.3)' : '#bbf7d0'),
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="caption" color="textSecondary" fontWeight={700} display="block" noWrap>
                  COLLECTED
                </Typography>
                <Typography variant="subtitle1" fontWeight={800} color="success.main">
                  Rs. {grandTotalCollected.toLocaleString()}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 1.5,
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.12)' : '#fef2f2'),
                  borderRadius: 1.5,
                  border: '1px solid',
                  borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.3)' : '#fecaca'),
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="caption" color="textSecondary" fontWeight={700} display="block" noWrap>
                  RECEIVABLES
                </Typography>
                <Typography variant="subtitle1" fontWeight={800} color="error.main">
                  Rs. {grandTotalReceivables.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </MainCard>

      {/* Main Ledger Card */}
      <MainCard>
        {/* Search Bar */}
        <Box sx={{ mb: 2.5, maxWidth: 450 }}>
          <OutlinedInput
            fullWidth
            placeholder="Search Customer by Name, Phone, City..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <SearchOutlined />
              </InputAdornment>
            }
          />
        </Box>

        {/* Customer Table */}
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead sx={{ bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#fafafa') }}>
              <TableRow>
                <TableCell><strong>CUSTOMER NAME & CITY</strong></TableCell>
                <TableCell align="center"><strong>PHONE NO</strong></TableCell>
                <TableCell align="center"><strong>INVOICES</strong></TableCell>
                <TableCell align="right"><strong>TOTAL PURCHASES</strong></TableCell>
                <TableCell align="right"><strong>AMOUNT PAID</strong></TableCell>
                <TableCell align="right"><strong>PENDING BALANCE</strong></TableCell>
                <TableCell align="center"><strong>ACTIONS</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="textSecondary">
                      No Customer Ledgers Found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((cust, idx) => {
                  const isExpanded = expandedCustomer === cust.customerName;

                  return (
                    <React.Fragment key={idx}>
                      <TableRow hover sx={{ bgcolor: isExpanded ? (theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc') : 'inherit' }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => setExpandedCustomer(isExpanded ? null : cust.customerName)}
                              sx={{ color: 'primary.main' }}
                            >
                              {isExpanded ? <UpOutlined /> : <DownOutlined />}
                            </IconButton>
                            <Box>
                              <Typography variant="subtitle1" fontWeight={800} color="textPrimary">
                                {cust.customerName}
                              </Typography>
                              {cust.city && (
                                <Typography variant="caption" color="textSecondary" display="block">
                                  {cust.city}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" fontWeight={600} color="textSecondary">
                            {cust.phone || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${cust.totalInvoicesCount} Invoices`}
                            size="small"
                            color={isExpanded ? 'primary' : 'default'}
                            variant={isExpanded ? 'filled' : 'outlined'}
                            clickable
                            onClick={() => setExpandedCustomer(isExpanded ? null : cust.customerName)}
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle2" fontWeight={700}>
                            Rs. {cust.totalPurchasesVal.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle2" fontWeight={700} color="success.main">
                            Rs. {cust.totalPaidVal.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle1" fontWeight={800} color={cust.balanceVal > 0 ? 'error.main' : 'success.main'}>
                            Rs. {cust.balanceVal.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<DollarOutlined />}
                              onClick={() => handleOpenPaymentModal(cust)}
                              sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, fontWeight: 700 }}
                            >
                              Receive Payment
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<PrinterOutlined />}
                              onClick={() => handlePrintStatement(cust)}
                              sx={{ fontWeight: 700 }}
                            >
                              Statement
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Invoices Breakdown Row */}
                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 2, p: 2, bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#f1f5f9'), borderRadius: 2, border: '1px solid #cbd5e1' }}>
                              <Typography variant="subtitle2" fontWeight={800} color="primary.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                📄 Customer Machine Sale Invoices ({cust.invoices.length})
                              </Typography>
                              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5 }}>
                                <Table size="small">
                                  <TableHead sx={{ bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#e2e8f0') }}>
                                    <TableRow>
                                      <TableCell><strong>INVOICE NO / DATE</strong></TableCell>
                                      <TableCell><strong>MACHINES PURCHASED</strong></TableCell>
                                      <TableCell align="center"><strong>QTY</strong></TableCell>
                                      <TableCell align="right"><strong>NET BILL</strong></TableCell>
                                      <TableCell align="right"><strong>PAID</strong></TableCell>
                                      <TableCell align="right"><strong>BALANCE</strong></TableCell>
                                      <TableCell align="center"><strong>STATUS</strong></TableCell>
                                      <TableCell align="center"><strong>ACTIONS</strong></TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {cust.invoices.map((inv) => {
                                      const invItemsList = (inv.items && inv.items.length > 0) ? inv.items : [
                                        { machineName: inv.machineName, serialNo: inv.serialNo, qty: inv.qty, unitPrice: inv.unitPrice }
                                      ];

                                      return (
                                        <TableRow key={inv.id} hover>
                                          <TableCell>
                                            <Typography variant="subtitle2" fontWeight={800} color="primary.main">
                                              {inv.id}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary" display="block">
                                              {formatFullDate(inv.time, inv.dateISO)}
                                            </Typography>
                                          </TableCell>

                                          <TableCell>
                                            <Typography variant="subtitle2" fontWeight={700}>
                                              {invItemsList[0]?.machineName}
                                            </Typography>
                                            {invItemsList.length > 1 && (
                                              <Typography variant="caption" color="primary.main" fontWeight={700} display="block">
                                                + {invItemsList.length - 1} more machines
                                              </Typography>
                                            )}
                                          </TableCell>

                                          <TableCell align="center">
                                            <Typography variant="subtitle2" fontWeight={700}>
                                              {inv.qty || invItemsList.reduce((acc, i) => acc + (i.qty || 1), 0)}
                                            </Typography>
                                          </TableCell>

                                          <TableCell align="right">
                                            <Typography variant="subtitle2" fontWeight={800}>
                                              Rs. {(inv.lineTotal || 0).toLocaleString()}
                                            </Typography>
                                          </TableCell>

                                          <TableCell align="right">
                                            <Typography variant="body2" color="success.main" fontWeight={700}>
                                              Rs. {(inv.paidAmount || 0).toLocaleString()}
                                            </Typography>
                                          </TableCell>

                                          <TableCell align="right">
                                            <Typography variant="body2" color={(inv.lineTotal - (inv.paidAmount || 0)) > 0 ? 'error.main' : 'textSecondary'} fontWeight={800}>
                                              Rs. {Math.max(0, (inv.lineTotal || 0) - (inv.paidAmount || 0)).toLocaleString()}
                                            </Typography>
                                          </TableCell>

                                          <TableCell align="center">
                                            <Chip
                                              label={inv.paymentStatus || (inv.paidAmount >= inv.lineTotal ? 'Paid' : inv.paidAmount > 0 ? 'Partial' : 'Unpaid')}
                                              color={(inv.paidAmount >= inv.lineTotal) ? 'success' : inv.paidAmount > 0 ? 'warning' : 'error'}
                                              size="small"
                                            />
                                          </TableCell>

                                          <TableCell align="center">
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                              <Tooltip title="Print Customer Machine Bill">
                                                <IconButton color="info" size="small" onClick={() => handleOpenPrintInvoice(inv)}>
                                                  <PrinterOutlined />
                                                </IconButton>
                                              </Tooltip>
                                              <Tooltip title="Edit Record">
                                                <IconButton color="primary" size="small" onClick={() => handleOpenEditInvoice(inv)}>
                                                  <EditOutlined />
                                                </IconButton>
                                              </Tooltip>
                                              <Tooltip title="Delete Record">
                                                <IconButton color="error" size="small" onClick={() => { setInvoiceToDelete(inv); setDeleteInvoiceDialogOpen(true); }}>
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
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </MainCard>

      {/* RECORD CUSTOMER PAYMENT MODAL */}
      <Dialog
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 24px 48px rgba(0,0,0,0.2)'
          }
        }}
      >
        <form onSubmit={handlePaymentSubmit}>
          <DialogTitle sx={{ fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
            <DollarOutlined /> Receive Payment (Khaata Entry)
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            {selectedCustomerForPay && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ p: 2, bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : '#f0fdf4'), borderRadius: 1.5, border: '1px solid #bbf7d0' }}>
                  <Typography variant="h4" fontWeight={800} color="primary.main">
                    {selectedCustomerForPay.customerName}
                  </Typography>
                  <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 0.5 }}>
                    Current Pending Balance: <strong style={{ color: '#ef4444' }}>Rs. {selectedCustomerForPay.balanceVal.toLocaleString()}</strong>
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" fontWeight={700} color="textSecondary" display="block" sx={{ mb: 0.5 }}>
                    APPLY TO INVOICE (OPTIONAL)
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    value={paymentForm.invoiceId}
                    onChange={(e) => setPaymentForm({ ...paymentForm, invoiceId: e.target.value })}
                  >
                    <MenuItem value="">-- All Customer Invoices --</MenuItem>
                    {selectedCustomerForPay.invoices.map((inv) => (
                      <MenuItem key={inv.id} value={inv.id}>
                        {inv.id} (Bill: Rs. {inv.lineTotal.toLocaleString()})
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="caption" fontWeight={700} color="textSecondary" display="block" sx={{ mb: 0.5 }}>
                        AMOUNT RECEIVED (RS) *
                      </Typography>
                      <TextField
                        type="number"
                        fullWidth
                        required
                        placeholder="Enter amount received..."
                        inputProps={{ min: 0 }}
                        value={paymentForm.amountPaid}
                        onChange={(e) => {
                          const val = e.target.value;
                          const paidNum = parseFloat(val) || 0;
                          const currentPending = selectedCustomerForPay ? selectedCustomerForPay.balanceVal : 0;
                          const calculatedRem = Math.max(0, currentPending - paidNum);
                          setPaymentForm({
                            ...paymentForm,
                            amountPaid: val,
                            remainingBalance: calculatedRem
                          });
                        }}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="caption" fontWeight={700} color="textSecondary" display="block" sx={{ mb: 0.5 }}>
                        NEW REMAINING BALANCE (RS)
                      </Typography>
                      <TextField
                        type="number"
                        fullWidth
                        placeholder="0"
                        inputProps={{ min: 0 }}
                        value={
                          paymentForm.remainingBalance !== undefined && paymentForm.remainingBalance !== ''
                            ? paymentForm.remainingBalance
                            : (selectedCustomerForPay ? Math.max(0, selectedCustomerForPay.balanceVal - (parseFloat(paymentForm.amountPaid) || 0)) : 0)
                        }
                        onChange={(e) => {
                          const remVal = e.target.value;
                          const remNum = parseFloat(remVal) || 0;
                          const currentPending = selectedCustomerForPay ? selectedCustomerForPay.balanceVal : 0;
                          const calculatedPaid = Math.max(0, currentPending - remNum);
                          setPaymentForm({
                            ...paymentForm,
                            amountPaid: calculatedPaid,
                            remainingBalance: remVal
                          });
                        }}
                        sx={{
                          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.12)' : '#ecfdf5'),
                          borderRadius: 1
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>

                <Box>
                  <Typography variant="caption" fontWeight={700} color="textSecondary" display="block" sx={{ mb: 0.5 }}>
                    PAYMENT METHOD *
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  >
                    <MenuItem value="Cash">Cash</MenuItem>
                    <MenuItem value="Bank Transfer">Bank Transfer / Online</MenuItem>
                    <MenuItem value="Cheque">Cheque</MenuItem>
                    <MenuItem value="Easypaisa / JazzCash">Easypaisa / JazzCash</MenuItem>
                  </TextField>
                </Box>

                <Box>
                  <Typography variant="caption" fontWeight={700} color="textSecondary" display="block" sx={{ mb: 0.5 }}>
                    REFERENCE / CHEQUE NO
                  </Typography>
                  <TextField
                    placeholder="e.g. TXN-908123"
                    fullWidth
                    value={paymentForm.referenceNo}
                    onChange={(e) => setPaymentForm({ ...paymentForm, referenceNo: e.target.value })}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" fontWeight={700} color="textSecondary" display="block" sx={{ mb: 0.5 }}>
                    NOTES / REMARKS
                  </Typography>
                  <TextField
                    placeholder="Optional transaction details..."
                    fullWidth
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  />
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc'), borderTop: '1px solid', borderColor: 'divider' }}>
            <Button onClick={() => setPaymentModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, fontWeight: 800, px: 3 }}>
              Confirm Payment Collection
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* PRINTABLE CUSTOMER ACCOUNT STATEMENT MODAL */}
      <Dialog open={printModalOpen} onClose={() => setPrintModalOpen(false)} maxWidth="md" fullWidth>
        <style>
          {`
            @media print {
              @page {
                size: A4 portrait;
                margin: 6mm;
              }
              body * {
                visibility: hidden !important;
              }
              #printable-customer-statement, #printable-customer-statement * {
                visibility: visible !important;
              }
              #printable-customer-statement {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                padding: 0 !important;
                margin: 0 !important;
                box-shadow: none !important;
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

        <DialogTitle className="no-print" sx={{ fontWeight: 800 }}>Customer Account Statement Voucher</DialogTitle>
        <DialogContent dividers>
          {printCustomerData && (
            <Box id="printable-customer-statement" sx={{ p: 2, bgcolor: '#ffffff', color: '#111827' }}>
              <Typography variant="h3" fontWeight={800} align="center" sx={{ color: '#166534', mb: 0.5 }}>
                REHMAT LAWN MOWERS
              </Typography>
              <Typography variant="subtitle1" fontWeight={700} align="center" color="textSecondary">
                CUSTOMER ACCOUNT LEDGER STATEMENT
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary" display="block">CUSTOMER NAME:</Typography>
                  <Typography variant="h5" fontWeight={800}>{printCustomerData.customerName}</Typography>
                  {printCustomerData.phone && <Typography variant="body2">{printCustomerData.phone}</Typography>}
                  {printCustomerData.city && <Typography variant="caption" color="textSecondary">{printCustomerData.city}</Typography>}
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="textSecondary" display="block">RECEIVABLE BALANCE:</Typography>
                  <Typography variant="h4" fontWeight={800} color={printCustomerData.balanceVal > 0 ? 'error.main' : 'success.main'}>
                    Rs. {printCustomerData.balanceVal.toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>

              {/* Invoices Breakdown Table */}
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Machine Invoices History:</Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell><strong>INVOICE NO</strong></TableCell>
                      <TableCell><strong>DATE</strong></TableCell>
                      <TableCell align="right"><strong>BILL TOTAL</strong></TableCell>
                      <TableCell align="right"><strong>PAID</strong></TableCell>
                      <TableCell align="right"><strong>BALANCE</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {printCustomerData.invoices.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell><strong>{inv.id}</strong></TableCell>
                        <TableCell>{formatFullDate(inv.time, inv.dateISO)}</TableCell>
                        <TableCell align="right">Rs. {inv.lineTotal.toLocaleString()}</TableCell>
                        <TableCell align="right">Rs. {(inv.paidAmount || 0).toLocaleString()}</TableCell>
                        <TableCell align="right">Rs. {Math.max(0, inv.lineTotal - (inv.paidAmount || 0)).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions className="no-print" sx={{ p: 2 }}>
          <Button className="no-print" onClick={() => setPrintModalOpen(false)}>Close</Button>
          <Button className="no-print" variant="contained" startIcon={<PrinterOutlined />} onClick={() => window.print()} sx={{ fontWeight: 800 }}>
            Print Account Statement
          </Button>
        </DialogActions>
      </Dialog>

      {/* EDIT INDIVIDUAL MACHINE INVOICE DRAWER */}
      <Drawer anchor="right" open={editInvoiceDrawerOpen} onClose={() => setEditInvoiceDrawerOpen(false)}>
        <Box sx={{ width: { xs: '100vw', sm: 620 }, p: { xs: 2, sm: 3 } }}>
          <Typography variant="h4" sx={{ mb: 2.5, fontWeight: 800, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            ✏️ Edit Machine Sale Record
          </Typography>
          {editingInvoice && (() => {
            const editItemsList = editingInvoice.items && editingInvoice.items.length > 0 ? editingInvoice.items : [
              { machineName: editingInvoice.machineName || '', serialNo: editingInvoice.serialNo || '', qty: editingInvoice.qty || 1, unitPrice: editingInvoice.unitPrice || 0, discount: 0 }
            ];

            const editSubTotal = editItemsList.reduce((sum, i) => {
              const q = parseInt(i.qty) || 1;
              const p = parseFloat(i.unitPrice) || 0;
              const discPercent = parseFloat(i.discount) || 0;
              const gross = q * p;
              const discAmt = (gross * discPercent) / 100;
              return sum + Math.max(0, gross - discAmt);
            }, 0);

            const editPaid = parseFloat(editingInvoice.paidAmount) || 0;
            const editBalance = Math.max(0, editSubTotal - editPaid);

            return (
              <form onSubmit={handleEditInvoiceSubmit}>
                <Stack spacing={2.5}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Customer Name *"
                        fullWidth
                        required
                        value={editingInvoice.customerName}
                        onChange={(e) => setEditingInvoice({ ...editingInvoice, customerName: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Customer Phone"
                        fullWidth
                        value={editingInvoice.customerPhone}
                        onChange={(e) => setEditingInvoice({ ...editingInvoice, customerPhone: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="City / Address"
                        fullWidth
                        value={editingInvoice.cityAddress}
                        onChange={(e) => setEditingInvoice({ ...editingInvoice, cityAddress: e.target.value })}
                      />
                    </Grid>
                  </Grid>

                  {/* Machine Items List Section */}
                  <Box sx={{ p: 2, bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc'), borderRadius: 1.5, border: '1px solid #cbd5e1' }}>
                    <Typography variant="subtitle2" fontWeight={800} color="primary.main" sx={{ mb: 1.5 }}>
                      MACHINES INVOICED ({editItemsList.length} Items)
                    </Typography>

                    <Stack spacing={2}>
                      {editItemsList.map((rowItem, idx) => {
                        const q = parseInt(rowItem.qty) || 1;
                        const p = parseFloat(rowItem.unitPrice) || 0;
                        const d = parseFloat(rowItem.discount) || 0;
                        const gross = q * p;
                        const lineTot = Math.max(0, gross - (gross * d) / 100);

                        return (
                          <Box key={idx} sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid #cbd5e1' }}>
                            <Grid container spacing={1.5} alignItems="center">
                              <Grid item xs={12} sm={7}>
                                <Autocomplete
                                  freeSolo
                                  options={machineModels}
                                  value={rowItem.machineName}
                                  onChange={(event, newValue) => handleEditItemChange(idx, 'machineName', newValue || '')}
                                  onInputChange={(event, newInputValue) => handleEditItemChange(idx, 'machineName', newInputValue || '')}
                                  renderInput={(params) => (
                                    <TextField {...params} label="MACHINE MODEL *" size="small" required />
                                  )}
                                />
                              </Grid>
                              <Grid item xs={12} sm={5}>
                                <TextField
                                  label="SERIAL / ENGINE NO"
                                  size="small"
                                  fullWidth
                                  value={rowItem.serialNo}
                                  onChange={(e) => handleEditItemChange(idx, 'serialNo', e.target.value)}
                                />
                              </Grid>

                              <Grid item xs={4}>
                                <TextField
                                  label="QTY *"
                                  type="number"
                                  size="small"
                                  fullWidth
                                  required
                                  inputProps={{ min: 1, style: { textAlign: 'center' } }}
                                  value={rowItem.qty}
                                  onChange={(e) => handleEditItemChange(idx, 'qty', parseInt(e.target.value) || 1)}
                                />
                              </Grid>
                              <Grid item xs={4}>
                                <TextField
                                  label="RATE (RS) *"
                                  type="number"
                                  size="small"
                                  fullWidth
                                  required
                                  inputProps={{ min: 0, style: { textAlign: 'right' } }}
                                  value={rowItem.unitPrice}
                                  onChange={(e) => handleEditItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                                />
                              </Grid>
                              <Grid item xs={4}>
                                <TextField
                                  label="DISC (%)"
                                  type="number"
                                  size="small"
                                  fullWidth
                                  inputProps={{ min: 0, max: 100, style: { textAlign: 'right' } }}
                                  InputProps={{
                                    endAdornment: <InputAdornment position="end">%</InputAdornment>
                                  }}
                                  value={rowItem.discount || ''}
                                  onChange={(e) => handleEditItemChange(idx, 'discount', parseFloat(e.target.value) || 0)}
                                />
                              </Grid>

                              <Grid item xs={8}>
                                <Typography variant="caption" color="textSecondary" fontWeight={600}>
                                  Line Total: <strong style={{ color: '#16a34a' }}>Rs. {lineTot.toLocaleString()}</strong>
                                </Typography>
                              </Grid>
                              <Grid item xs={4} sx={{ textAlign: 'right' }}>
                                {editItemsList.length > 1 && (
                                  <Button
                                    size="small"
                                    color="error"
                                    startIcon={<DeleteOutlined />}
                                    onClick={() => handleRemoveEditItemRow(idx)}
                                    sx={{ textTransform: 'none' }}
                                  >
                                    Remove
                                  </Button>
                                )}
                              </Grid>
                            </Grid>
                          </Box>
                        );
                      })}
                    </Stack>

                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<PlusOutlined />}
                      onClick={handleAddEditItemRow}
                      sx={{ mt: 1.5, fontWeight: 700 }}
                    >
                      + Add Machine Item
                    </Button>
                  </Box>

                  {/* Financial Summary */}
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        label="TOTAL INVOICE (RS)"
                        fullWidth
                        value={`Rs. ${editSubTotal.toLocaleString()}`}
                        InputProps={{
                          readOnly: true,
                          style: { fontWeight: 800, color: '#16a34a' }
                        }}
                        sx={{ bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.12)' : '#ecfdf5'), borderRadius: 1 }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="PAID AMOUNT (RS) *"
                        type="number"
                        fullWidth
                        required
                        value={editingInvoice.paidAmount}
                        onChange={(e) => setEditingInvoice({ ...editingInvoice, paidAmount: parseFloat(e.target.value) || 0 })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="REMAINING BALANCE (RS)"
                        fullWidth
                        value={`Rs. ${editBalance.toLocaleString()}`}
                        InputProps={{
                          readOnly: true,
                          style: { fontWeight: 800, color: editBalance > 0 ? '#ef4444' : '#16a34a' }
                        }}
                        sx={{
                          bgcolor: editBalance > 0 ? (theme => theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.12)' : '#fef2f2') : (theme => theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.12)' : '#ecfdf5'),
                          borderRadius: 1
                        }}
                      />
                    </Grid>
                  </Grid>

                  <TextField
                    label="Warranty Terms & Note"
                    fullWidth
                    multiline
                    rows={2}
                    value={editingInvoice.warrantyTerms}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, warrantyTerms: e.target.value })}
                  />

                  <Button variant="contained" color="primary" type="submit" fullWidth size="large" sx={{ fontWeight: 700, mt: 1, py: 1.2 }}>
                    Update Machine Sale Record
                  </Button>
                </Stack>
              </form>
            );
          })()}
        </Box>
      </Drawer>

      {/* DELETE INDIVIDUAL MACHINE INVOICE DIALOG */}
      <Dialog open={deleteInvoiceDialogOpen} onClose={() => setDeleteInvoiceDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Delete Machine Sale Invoice</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete the machine sale invoice <strong>{invoiceToDelete?.id}</strong> for <strong>{invoiceToDelete?.customerName}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteInvoiceDialogOpen(false)} color="secondary">Cancel</Button>
          <Button onClick={handleConfirmDeleteInvoice} color="error" variant="contained">Delete Invoice</Button>
        </DialogActions>
      </Dialog>

      {/* PRINT OFFICIAL CUSTOMER MACHINE SALE INVOICE MODAL */}
      <Dialog open={printInvoiceModalOpen} onClose={() => setPrintInvoiceModalOpen(false)} maxWidth="md" fullWidth>
        <style>
          {`
            @media print {
              @page {
                size: A4 portrait;
                margin: 6mm;
              }
              body * {
                visibility: hidden !important;
              }
              #printable-single-invoice, #printable-single-invoice * {
                visibility: visible !important;
              }
              #printable-single-invoice {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                padding: 0 !important;
                margin: 0 !important;
                box-shadow: none !important;
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
          <Typography variant="h5" fontWeight={700}>📄 Official Customer Machine Sale Invoice</Typography>
          <Chip label={printInvoiceData?.paymentStatus || 'Paid'} color={printInvoiceData?.paymentStatus === 'Paid' ? 'success' : 'warning'} size="small" />
        </DialogTitle>

        <DialogContent dividers sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          {printInvoiceData && (() => {
            const displayItems = (printInvoiceData.items && printInvoiceData.items.length > 0) ? printInvoiceData.items : [
              {
                machineName: printInvoiceData.machineName,
                serialNo: printInvoiceData.serialNo,
                qty: printInvoiceData.qty,
                unitPrice: printInvoiceData.unitPrice,
                lineTotal: printInvoiceData.lineTotal
              }
            ];

            return (
              <Box id="printable-single-invoice" sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: '#ffffff', color: '#1e293b', borderRadius: 1 }}>
                <Box sx={{ pb: 1.5, mb: 2, borderBottom: '2px solid #0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h4" fontWeight={800} sx={{ color: '#166534', letterSpacing: '0.5px' }}>
                      REHMAT LAWN MOWERS
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={600} color="textSecondary">
                      Machinery Sales & Tax Invoice Voucher
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block">
                      Main GT Road / Factory Industrial Area, Pakistan | Tel: +92 300 1234567
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" fontWeight={700} color="textSecondary" display="block">
                      INVOICE NUMBER
                    </Typography>
                    <Typography variant="h6" fontWeight={800} color="primary.main">
                      {printInvoiceData.id}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 0.2 }}>
                      Date: {formatFullDate(printInvoiceData.time, printInvoiceData.dateISO)}
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={2} sx={{ mb: 2, p: 1.2, bgcolor: '#f8fafc', borderRadius: 1, border: '1px solid #e2e8f0' }}>
                  <Grid item xs={12} sm={7}>
                    <Typography variant="caption" fontWeight={700} color="textSecondary" display="block">
                      CUSTOMER DETAILS:
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={800} color="#0f172a">
                      {printInvoiceData.customerName}
                    </Typography>
                    {printInvoiceData.customerPhone && (
                      <Typography variant="body2" color="textSecondary">
                        Contact: {printInvoiceData.customerPhone}
                      </Typography>
                    )}
                    {printInvoiceData.cityAddress && (
                      <Typography variant="caption" color="textSecondary" display="block">
                        Address: {printInvoiceData.cityAddress}
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={12} sm={5} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                    <Typography variant="caption" fontWeight={700} color="textSecondary" display="block">
                      PAYMENT STATUS:
                    </Typography>
                    <Chip
                      label={printInvoiceData.paymentStatus || (printInvoiceData.paidAmount >= printInvoiceData.lineTotal ? 'Paid' : 'Partial')}
                      color={(printInvoiceData.paidAmount >= printInvoiceData.lineTotal) ? 'success' : printInvoiceData.paidAmount > 0 ? 'warning' : 'error'}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 800, mt: 0.5 }}
                    />
                  </Grid>
                </Grid>

                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1, mb: 2, borderColor: '#cbd5e1' }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, color: '#334155', whiteSpace: 'nowrap' }}>#</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#334155', whiteSpace: 'nowrap' }}>MACHINE MODEL & SPECS</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: '#334155', whiteSpace: 'nowrap' }}>SERIAL NO</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: '#334155', whiteSpace: 'nowrap' }}>QTY</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: '#334155', whiteSpace: 'nowrap' }}>RATE</TableCell>
                        {displayItems.some(i => (parseFloat(i.discount) || 0) > 0) && (
                          <TableCell align="right" sx={{ fontWeight: 700, color: '#334155', whiteSpace: 'nowrap' }}>DISCOUNT</TableCell>
                        )}
                        <TableCell align="right" sx={{ fontWeight: 700, color: '#334155', whiteSpace: 'nowrap' }}>AMOUNT</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {displayItems.map((item, idx) => {
                        const q = parseInt(item.qty) || 1;
                        const p = parseFloat(item.unitPrice) || 0;
                        const d = parseFloat(item.discount) || 0;
                        const gross = q * p;
                        const lineAmt = item.lineTotal !== undefined && !isNaN(item.lineTotal) ? item.lineTotal : Math.max(0, gross - (gross * d) / 100);

                        return (
                          <TableRow key={idx}>
                            <TableCell>{idx + 1}</TableCell>
                            <TableCell>
                              <Typography variant="subtitle2" fontWeight={700} color="#0f172a">
                                {item.machineName || 'Machine'}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body2" color="textSecondary">
                                {item.serialNo || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">{q}</TableCell>
                            <TableCell align="right">Rs. {p.toLocaleString()}</TableCell>
                            {displayItems.some(i => (parseFloat(i.discount) || 0) > 0) && (
                              <TableCell align="right" sx={{ color: 'error.main' }}>
                                {d > 0 ? `${d}% (-Rs. ${((gross * d) / 100).toLocaleString()})` : '-'}
                              </TableCell>
                            )}
                            <TableCell align="right">
                              <Typography variant="subtitle2" fontWeight={700}>
                                Rs. {lineAmt.toLocaleString()}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 1.5, bgcolor: '#ffffff', borderRadius: 1, border: '1px solid #e2e8f0', height: '100%' }}>
                      <Typography variant="caption" fontWeight={700} color="textSecondary" display="block">
                        GUARANTEE / WARRANTY TERMS:
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                        {printInvoiceData.warrantyTerms || '1 Year Motor & Frame Free Service Warranty'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 1, border: '1px solid #cbd5e1', textAlign: 'right' }}>
                      <Typography variant="caption" color="textSecondary" display="block">SUBTOTAL:</Typography>
                      <Typography variant="subtitle1" fontWeight={700}>
                        Rs. {(printInvoiceData.subTotal || printInvoiceData.lineTotal || 0).toLocaleString()}
                      </Typography>

                      {(printInvoiceData.discountAmount || 0) > 0 && (
                        <Typography variant="body2" color="error.main" sx={{ mt: 0.3 }}>
                          Discount: -Rs. {(printInvoiceData.discountAmount || 0).toLocaleString()}
                        </Typography>
                      )}

                      <Divider sx={{ my: 1 }} />

                      <Typography variant="caption" fontWeight={700} color="textSecondary" display="block">
                        NET PAYABLE INVOICE TOTAL:
                      </Typography>
                      <Typography variant="h4" fontWeight={800} color="#166534">
                        Rs. {(printInvoiceData.lineTotal || 0).toLocaleString()}
                      </Typography>

                      <Divider sx={{ my: 1 }} />

                      <Typography variant="body2" color="success.main" fontWeight={600}>
                        Paid: Rs. {(printInvoiceData.paidAmount || 0).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color={(printInvoiceData.lineTotal - (printInvoiceData.paidAmount || 0)) > 0 ? 'error.main' : 'textSecondary'} fontWeight={600}>
                        Balance Due: Rs. {Math.max(0, (printInvoiceData.lineTotal || 0) - (printInvoiceData.paidAmount || 0)).toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ pt: 3, display: 'flex', justifyContent: 'space-between' }}>
                  <Box sx={{ width: '40%', textAlign: 'center', borderTop: '1px solid #94a3b8', pt: 0.5 }}>
                    <Typography variant="caption" color="textSecondary" fontWeight={600}>Customer Signature / Receiver</Typography>
                  </Box>
                  <Box sx={{ width: '40%', textAlign: 'center', borderTop: '1px solid #94a3b8', pt: 0.5 }}>
                    <Typography variant="caption" color="textSecondary" fontWeight={600}>Authorized Signature (Rehmat Lawn Mowers)</Typography>
                  </Box>
                </Box>
              </Box>
            );
          })()}
        </DialogContent>
        <DialogActions className="no-print" sx={{ p: 2 }}>
          <Button className="no-print" onClick={() => setPrintInvoiceModalOpen(false)}>Close & Continue</Button>
          <Button className="no-print" variant="contained" color="success" startIcon={<PrinterOutlined />} onClick={() => window.print()} sx={{ fontWeight: 700 }}>
            Print Customer Machine Bill
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
