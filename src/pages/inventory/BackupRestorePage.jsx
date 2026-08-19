import { useState } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';

// ant design icons
import DownloadOutlined from '@ant-design/icons/DownloadOutlined';
import UploadOutlined from '@ant-design/icons/UploadOutlined';
import SafetyCertificateOutlined from '@ant-design/icons/SafetyCertificateOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';

import MainCard from 'components/MainCard';
import { useStoreInventory } from 'context/StoreInventoryContext';

export default function BackupRestorePage() {
  const {
    items,
    usageLogs,
    machineSales,
    machineRecipes,
    customerPayments,
    vendorPayments,
    exportFullBackupData,
    importFullBackupData
  } = useStoreInventory();

  const [restoreStatus, setRestoreStatus] = useState(null);

  // 1-Click Backup Export Handler
  const handleDownloadBackup = () => {
    const jsonStr = exportFullBackupData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rehmat_Lawn_Mowers_Backup_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Restore Backup File Handler
  const handleFileRestoreUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const res = importFullBackupData(content);
      if (res.success) {
        setRestoreStatus({ type: 'success', message: res.message });
      } else {
        setRestoreStatus({ type: 'error', message: res.message });
      }
    };
    reader.readAsText(file);
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      {/* Banner Header */}
      <MainCard
        sx={{
          mb: 3,
          background: (theme) => (theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' : '#ffffff'),
          borderLeft: '5px solid #059669'
        }}
      >
        <Typography variant="h3" fontWeight={800} color="textPrimary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SafetyCertificateOutlined style={{ color: '#059669' }} /> Data Safety, Backup & System Restore
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
          Guarantee 100% data safety. Download 1-click complete system backup files and restore system state across computers.
        </Typography>
      </MainCard>

      {/* System Data Summary Box */}
      <MainCard sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
          Current System Database Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4} md={2.4}>
            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary" display="block">STORE ITEMS</Typography>
              <Typography variant="h4" fontWeight={800} color="primary.main">{items.length}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4} md={2.4}>
            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary" display="block">STOCK LOGS</Typography>
              <Typography variant="h4" fontWeight={800} color="primary.main">{usageLogs.length}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4} md={2.4}>
            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary" display="block">MACHINE SALES</Typography>
              <Typography variant="h4" fontWeight={800} color="success.main">{machineSales.length}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4} md={2.4}>
            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary" display="block">BOM RECIPES</Typography>
              <Typography variant="h4" fontWeight={800} color="primary.main">{machineRecipes.length}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4} md={2.4}>
            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary" display="block">PAYMENT ENTRIES</Typography>
              <Typography variant="h4" fontWeight={800} color="primary.main">
                {customerPayments.length + vendorPayments.length}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </MainCard>

      {/* Backup & Restore Action Cards */}
      <Grid container spacing={3}>
        {/* 1-Click Backup Export Card */}
        <Grid item xs={12} md={6}>
          <MainCard sx={{ height: '100%', border: '1px solid #bbf7d0', bgcolor: '#f0fdf4' }}>
            <Typography variant="h4" fontWeight={800} color="#15803d" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <DownloadOutlined /> 1-Click Backup Download
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Download a complete JSON snapshot file containing all items, stock history, customer bills, recipes, and payment logs to your computer.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<DownloadOutlined />}
              onClick={handleDownloadBackup}
              sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' }, fontWeight: 800, py: 1.5, px: 3 }}
            >
              Download Complete Backup File (.json)
            </Button>
          </MainCard>
        </Grid>

        {/* Restore Backup File Card */}
        <Grid item xs={12} md={6}>
          <MainCard sx={{ height: '100%', border: '1px solid #bfdbfe', bgcolor: '#eff6ff' }}>
            <Typography variant="h4" fontWeight={800} color="#1d4ed8" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <UploadOutlined /> Restore Backup File
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Upload a previously downloaded `.json` backup file to restore all store inventory records and customer ledgers.
            </Typography>

            {restoreStatus && (
              <Alert
                severity={restoreStatus.type}
                icon={restoreStatus.type === 'success' ? <CheckCircleOutlined /> : undefined}
                sx={{ mb: 2, fontWeight: 700 }}
              >
                {restoreStatus.message}
              </Alert>
            )}

            <Button
              variant="contained"
              component="label"
              size="large"
              startIcon={<UploadOutlined />}
              sx={{ bgcolor: '#2563eb', '&:hover': { bgcolor: '#1d4ed8' }, fontWeight: 800, py: 1.5, px: 3 }}
            >
              Upload & Restore Backup (.json)
              <input type="file" accept=".json" hidden onChange={handleFileRestoreUpload} />
            </Button>
          </MainCard>
        </Grid>
      </Grid>
    </Box>
  );
}
