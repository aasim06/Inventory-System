// ==============================|| FACTORY STORE INVENTORY MOCK DATA ||============================== //

export const initialStoreItems = [
  {
    id: 'INV-1001',
    itemCode: 'SKU-84564564',
    name: '3HP Electric Motor (3-Phase)',
    category: 'Electrical & Motors',
    totalStock: 45,
    usedToday: 4,
    remainingStock: 41,
    unit: 'pcs',
    unitPrice: 180,
    minLevel: 10,
    rackLocation: 'Rack A-01',
    status: 1 // 1: Healthy, 0: Pending/Low, 2: Out of Stock
  },
  {
    id: 'INV-1002',
    itemCode: 'SKU-98764564',
    name: 'SKF Ball Bearing 6205-2RS',
    category: 'Mechanical Parts',
    totalStock: 120,
    usedToday: 15,
    remainingStock: 105,
    unit: 'pcs',
    unitPrice: 12,
    minLevel: 25,
    rackLocation: 'Bin B-04',
    status: 1
  },
  {
    id: 'INV-1003',
    itemCode: 'SKU-98756325',
    name: 'Omron Proximity Sensor NPN',
    category: 'Sensors & Automation',
    totalStock: 14,
    usedToday: 6,
    remainingStock: 8,
    unit: 'pcs',
    unitPrice: 25,
    minLevel: 10, // LOW STOCK
    rackLocation: 'Rack C-02',
    status: 0
  },
  {
    id: 'INV-1004',
    itemCode: 'SKU-98652366',
    name: 'Hydraulic Cylinder 50x200mm',
    category: 'Hydraulics',
    totalStock: 12,
    usedToday: 2,
    remainingStock: 10,
    unit: 'pcs',
    unitPrice: 210,
    minLevel: 5,
    rackLocation: 'Floor Rack D',
    status: 1
  },
  {
    id: 'INV-1005',
    itemCode: 'SKU-13286564',
    name: 'Siemens PLC CPU 1214C DC/DC/DC',
    category: 'Electronics & PLC',
    totalStock: 8,
    usedToday: 1,
    remainingStock: 7,
    unit: 'pcs',
    unitPrice: 450,
    minLevel: 3,
    rackLocation: 'Cabinet E-01',
    status: 1
  },
  {
    id: 'INV-1006',
    itemCode: 'SKU-86739658',
    name: 'Pneumatic Solenoid Valve 5/2 Way',
    category: 'Pneumatics',
    totalStock: 35,
    usedToday: 8,
    remainingStock: 27,
    unit: 'pcs',
    unitPrice: 45,
    minLevel: 12,
    rackLocation: 'Bin B-18',
    status: 1
  },
  {
    id: 'INV-1007',
    itemCode: 'SKU-13256498',
    name: 'M8x50mm Stainless Steel Bolts',
    category: 'Fasteners & Hardware',
    totalStock: 60,
    usedToday: 12,
    remainingStock: 48,
    unit: 'boxes',
    unitPrice: 15,
    minLevel: 20,
    rackLocation: 'Bin F-01',
    status: 1
  },
  {
    id: 'INV-1008',
    itemCode: 'SKU-98753263',
    name: 'Mild Steel Sheet 10mm (4x8 ft)',
    category: 'Raw Materials',
    totalStock: 5,
    usedToday: 2,
    remainingStock: 3,
    unit: 'sheets',
    unitPrice: 320,
    minLevel: 5, // LOW STOCK
    rackLocation: 'Yard Storage',
    status: 0
  }
];

export const initialUsageLogs = [
  {
    id: 'USG-984947',
    itemCode: 'SKU-98764564',
    itemName: 'SKF Ball Bearing 6205-2RS',
    qtyUsed: 8,
    usedBy: 'Zubair Ahmed',
    department: 'Assembly Line 1',
    issuedBy: 'Store Keeper - Farhan',
    time: 'Today, 09:30 AM',
    dateISO: '2026-08-09T09:30:00Z',
    type: 'OUT (Daily Usage)',
    remainingStockAfter: 105,
    status: 1 // 1: Approved, 0: Pending, 2: Rejected
  },
  {
    id: 'USG-002434',
    itemCode: 'SKU-84564564',
    itemName: '3HP Electric Motor (3-Phase)',
    qtyUsed: 2,
    usedBy: 'Ali Raza',
    department: 'Maintenance Dept',
    issuedBy: 'Store Keeper - Farhan',
    time: 'Today, 08:45 AM',
    dateISO: '2026-08-09T08:45:00Z',
    type: 'OUT (Daily Usage)',
    remainingStockAfter: 41,
    status: 1
  },
  {
    id: 'USG-988784',
    itemCode: 'SKU-98756325',
    itemName: 'Omron Proximity Sensor NPN',
    qtyUsed: 4,
    usedBy: 'Hamza Khan',
    department: 'Electrical Line B',
    issuedBy: 'Store Keeper - Tariq',
    time: 'Today, 08:15 AM',
    dateISO: '2026-08-09T08:15:00Z',
    type: 'OUT (Daily Usage)',
    remainingStockAfter: 8,
    status: 1
  },
  {
    id: 'USG-774120',
    itemCode: 'SKU-86739658',
    itemName: 'Pneumatic Solenoid Valve 5/2 Way',
    qtyUsed: 5,
    usedBy: 'Kamran Shah',
    department: 'Pneumatic Fitting Line',
    issuedBy: 'Store Keeper - Farhan',
    time: 'Yesterday, 04:30 PM',
    dateISO: '2026-08-08T16:30:00Z',
    type: 'OUT (Daily Usage)',
    remainingStockAfter: 27,
    status: 1
  },
  {
    id: 'USG-554109',
    itemCode: 'SKU-13256498',
    itemName: 'M8x50mm Stainless Steel Bolts',
    qtyUsed: 10,
    usedBy: 'Usman Ghani',
    department: 'Machine Framing Unit',
    issuedBy: 'Store Keeper - Tariq',
    time: 'Yesterday, 02:15 PM',
    dateISO: '2026-08-08T14:15:00Z',
    type: 'OUT (Daily Usage)',
    remainingStockAfter: 48,
    status: 1
  }
];

export const initialVendors = [
  {
    id: 'VND-01',
    name: 'Siemens Industrial',
    contactPerson: 'Tariq Mehmood',
    phone: '+92 300 1234567',
    email: 'sales@siemens-supplier.pk',
    category: 'Electrical & Motors',
    address: 'Site Industrial Area, Karachi'
  },
  {
    id: 'VND-02',
    name: 'SKF Bearings Co.',
    contactPerson: 'Zubair Khan',
    phone: '+92 321 9876543',
    email: 'info@skf-distributor.pk',
    category: 'Mechanical Bearings',
    address: 'Brandreth Road, Lahore'
  },
  {
    id: 'VND-03',
    name: 'Omron Automation',
    contactPerson: 'Asad Ali',
    phone: '+92 333 4567890',
    email: 'orders@omron-pk.com',
    category: 'Sensors & Automation',
    address: 'Gulberg III, Lahore'
  },
  {
    id: 'VND-04',
    name: 'National Fasteners',
    contactPerson: 'Haris Malik',
    phone: '+92 345 6789012',
    email: 'support@nationalfasteners.pk',
    category: 'Hardware & Fasteners',
    address: 'I.I. Chundrigar Road, Karachi'
  }
];
