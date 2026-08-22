import PropTypes from 'prop-types';
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { initialStoreItems, initialUsageLogs, initialVendors, initialCategories, initialMachineSales } from 'data/factoryStoreData';
import { supabase } from 'api/supabase';

const StoreInventoryContext = createContext();

const safeParseJSON = (key, fallback = []) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (err) {
    console.error(`SafeJSON Error parsing ${key}:`, err);
    return fallback;
  }
};

const initialMasterItemNames = [
  { id: 'MST-1', name: '3HP Electric Motor (3-Phase)', category: 'Electrical & Motors', defaultUnit: 'pcs' },
  { id: 'MST-2', name: 'SKF Ball Bearing 6205-2RS', category: 'Mechanical Parts', defaultUnit: 'pcs' },
  { id: 'MST-3', name: 'Omron Proximity Sensor NPN', category: 'Sensors & Automation', defaultUnit: 'pcs' },
  { id: 'MST-4', name: 'Hydraulic Cylinder 50x200mm', category: 'Hydraulics', defaultUnit: 'pcs' },
  { id: 'MST-5', name: 'Siemens PLC CPU 1214C DC/DC/DC', category: 'Electronics & PLC', defaultUnit: 'pcs' },
  { id: 'MST-6', name: 'Pneumatic Solenoid Valve 5/2 Way', category: 'Pneumatics', defaultUnit: 'pcs' },
  { id: 'MST-7', name: 'M8x50mm Stainless Steel Bolts', category: 'Fasteners & Hardware', defaultUnit: 'boxes' },
  { id: 'MST-8', name: 'Mild Steel Sheet 10mm (4x8 ft)', category: 'Raw Materials', defaultUnit: 'sheets' }
];

export function StoreInventoryProvider({ children }) {
  // Clear old legacy demo cache on mount if present
  useEffect(() => {
    const legacyKeys = [
      'store_inventory_items',
      'store_usage_logs',
      'store_vendors',
      'store_machine_sales',
      'store_customer_payments',
      'store_vendor_payments'
    ];
    legacyKeys.forEach((key) => localStorage.removeItem(key));
  }, []);

  // 1. Inventory Items State (Clean Zero Start)
  const [items, setItems] = useState(() => safeParseJSON('rehmat_store_items_v2', []));

  // 2. Usage & Issue Logs State (Clean Zero Start)
  const [usageLogs, setUsageLogs] = useState(() => safeParseJSON('rehmat_store_usage_logs_v2', []));

  // 3. Vendors / Suppliers State (Clean Zero Start)
  const [vendors, setVendors] = useState(() => safeParseJSON('rehmat_store_vendors_v2', []));

  // 4. Categories State
  const [categories, setCategories] = useState(() => safeParseJSON('rehmat_store_categories_v2', initialCategories));

  // 7. Pre-saved Master Item Names List State
  const [masterItemNames, setMasterItemNames] = useState(() => safeParseJSON('rehmat_store_master_item_names_v2', initialMasterItemNames));

  const initialMachineModels = [
    'Rehmat 20" Lawn Mower (Petrol Engine)',
    'Rehmat Electric Lawn Cutter 18"',
    'Rehmat Heavy Duty Lawn Mower 24"',
    'Rehmat Grass Trimmer & Cutter 2-Stroke',
    'Rehmat Hand Push Lawn Roller Mower'
  ];

  // 8. Customer Machine Sales State (Clean Zero Start)
  const [machineSales, setMachineSales] = useState(() => safeParseJSON('rehmat_store_machine_sales_v2', []));

  // 9. Master Machine Models Catalog State
  const [machineModels, setMachineModels] = useState(() => safeParseJSON('store_machine_models', initialMachineModels));

  // 10. Machine BOM Recipes State
  const [machineRecipes, setMachineRecipes] = useState(() => {
    const parsed = safeParseJSON('store_machine_recipes', null);
    if (parsed && Array.isArray(parsed) && parsed.length > 0) {
      // Filter out test entries like 'Emmami' if user wants real lawn mower recipe
      const clean = parsed.filter(r => !(r.modelName || '').toLowerCase().includes('emmami'));
      if (clean.length > 0) return clean;
    }
    return [
      {
        id: 'BOM-1',
        modelName: 'Rehmat 20" Lawn Mower (Petrol Engine)',
        description: 'Standard 20-Inch Heavy Duty Petrol Engine Lawn Mower Assembly Formula',
        ingredients: [
          { itemName: '3HP Electric Motor (3-Phase)', qty: 1, unit: 'pcs' },
          { itemName: 'SKF Ball Bearing 6205-2RS', qty: 2, unit: 'pcs' },
          { itemName: 'M8x50mm Stainless Steel Bolts', qty: 1, unit: 'boxes' }
        ]
      },
      {
        id: 'BOM-2',
        modelName: 'Rehmat Electric Lawn Cutter 18"',
        description: 'Compact 18-Inch Electric Cutter Assembly Formula',
        ingredients: [
          { itemName: '3HP Electric Motor (3-Phase)', qty: 1, unit: 'pcs' },
          { itemName: 'SKF Ball Bearing 6205-2RS', qty: 4, unit: 'pcs' },
          { itemName: 'M8x50mm Stainless Steel Bolts', qty: 2, unit: 'boxes' }
        ]
      }
    ];
  });

  // 11. Customer Payments & Ledger Entries State (Clean Zero Start)
  const [customerPayments, setCustomerPayments] = useState(() => safeParseJSON('rehmat_store_customer_payments_v2', []));

  // 12. Vendor Payments & Ledger Entries State (Clean Zero Start)
  const [vendorPayments, setVendorPayments] = useState(() => safeParseJSON('rehmat_store_vendor_payments_v2', []));

  // Sync state to LocalStorage as secondary backup
  useEffect(() => {
    localStorage.setItem('rehmat_store_items_v2', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('rehmat_store_machine_sales_v2', JSON.stringify(machineSales));
  }, [machineSales]);

  useEffect(() => {
    localStorage.setItem('rehmat_store_usage_logs_v2', JSON.stringify(usageLogs));
  }, [usageLogs]);

  useEffect(() => {
    localStorage.setItem('rehmat_store_vendors_v2', JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem('rehmat_store_categories_v2', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('rehmat_store_master_item_names_v2', JSON.stringify(masterItemNames));
  }, [masterItemNames]);

  useEffect(() => {
    localStorage.setItem('rehmat_store_machine_recipes_v2', JSON.stringify(machineRecipes));
  }, [machineRecipes]);

  useEffect(() => {
    localStorage.setItem('rehmat_store_customer_payments_v2', JSON.stringify(customerPayments));
  }, [customerPayments]);

  useEffect(() => {
    localStorage.setItem('rehmat_store_vendor_payments_v2', JSON.stringify(vendorPayments));
  }, [vendorPayments]);

  // Fetch initial data from Supabase for multi-device sync
  const fetchSupabaseData = async () => {
    try {
      // 1. Fetch Items
      const { data: dbItems, error: itemsErr } = await supabase.from('items').select('*');
      if (!itemsErr && dbItems && dbItems.length > 0) {
        const mappedItems = dbItems.map((i) => ({
          id: i.id,
          name: i.name,
          itemCode: i.sku_code || i.id,
          category: i.category || 'General',
          unit: i.unit || 'PCS',
          totalStock: parseFloat(i.current_stock) || 0,
          usedToday: 0,
          remainingStock: parseFloat(i.current_stock) || 0,
          unitPrice: parseFloat(i.unit_price) || 0,
          minLevel: parseFloat(i.min_threshold) || 10,
          rackLocation: i.location || 'Main Store',
          status: parseFloat(i.current_stock) <= 0 ? 2 : parseFloat(i.current_stock) <= (parseFloat(i.min_threshold) || 10) ? 0 : 1
        }));
        setItems(mappedItems);
      } else if (!itemsErr && (!dbItems || dbItems.length === 0)) {
        // AUTO-SEED: Sync local storage items up to Supabase if Supabase is fresh empty!
        const localItems = safeParseJSON('rehmat_store_items_v2', []);
        if (localItems && localItems.length > 0) {
          const itemsToInsert = localItems.map((i) => ({
            id: i.id,
            name: i.name,
            sku_code: i.itemCode || i.id,
            category: i.category || 'General',
            unit: i.unit || 'PCS',
            current_stock: i.remainingStock !== undefined ? i.remainingStock : (i.totalStock || 0),
            unit_price: i.unitPrice || 0,
            min_threshold: i.minLevel || 10,
            location: i.rackLocation || 'Main Store'
          }));
          await supabase.from('items').upsert(itemsToInsert);
          setItems(localItems);
        }
      }

      // 2. Fetch Usage Logs
      const { data: dbLogs, error: logErr } = await supabase.from('usage_logs').select('*');
      if (!logErr && dbLogs && dbLogs.length > 0) {
        setUsageLogs(dbLogs.map(l => ({
          id: l.id,
          type: l.type || 'Stock Out',
          itemCode: l.item_code || l.item_id,
          itemName: l.item_name,
          qtyUsed: parseFloat(l.qty_used) || 1,
          unitPrice: parseFloat(l.unit_price) || 0,
          lineTotal: parseFloat(l.line_total) || 0,
          usedBy: l.used_by,
          department: l.department || 'Store',
          issuedBy: l.issued_by || 'Store Manager',
          time: l.time || 'Today',
          dateISO: l.timestamp || l.created_at || new Date().toISOString()
        })));
      } else if (!logErr && (!dbLogs || dbLogs.length === 0)) {
        const localLogs = safeParseJSON('rehmat_store_usage_logs_v2', []);
        if (localLogs && localLogs.length > 0) {
          const logsToInsert = localLogs.map(l => ({
            id: l.id,
            type: l.type || 'Stock Out',
            item_id: l.itemCode || l.id,
            item_name: l.itemName || 'Item',
            item_code: l.itemCode,
            qty_used: parseFloat(l.qtyUsed) || 1,
            unit_price: parseFloat(l.unitPrice) || 0,
            line_total: parseFloat(l.lineTotal) || 0,
            used_by: l.usedBy || 'Store',
            department: l.department || 'Production',
            time: l.time || 'Today',
            timestamp: l.dateISO || new Date().toISOString()
          }));
          await supabase.from('usage_logs').upsert(logsToInsert);
          setUsageLogs(localLogs);
        }
      }

      // 3. Fetch Vendors
      const { data: dbVendors, error: vndErr } = await supabase.from('vendors').select('*');
      if (!vndErr && dbVendors && dbVendors.length > 0) {
        setVendors(dbVendors.map(v => ({
          id: v.id,
          name: v.name,
          companyName: v.company_name || v.name,
          phone: v.phone || 'N/A',
          email: v.email || 'N/A',
          address: v.city_address || v.address || 'Local',
          openingBalance: parseFloat(v.opening_balance) || 0,
          balanceType: v.balance_type || 'Payable',
          currentBalance: parseFloat(v.current_balance) || 0
        })));
      }

      // 4. Fetch Machine Sales
      const { data: dbSales, error: salesErr } = await supabase.from('machine_sales').select('*').order('created_at', { ascending: false });
      if (!salesErr && dbSales && dbSales.length > 0) {
        setMachineSales(dbSales.map(s => ({
          id: s.id,
          saleNo: s.sale_no || s.id,
          customerName: s.customer_name,
          customerPhone: s.customer_phone || 'N/A',
          cityAddress: s.city_address || 'Lahore',
          machineName: s.machine_name,
          serialNo: s.serial_no,
          qty: parseFloat(s.qty) || 1,
          unitPrice: parseFloat(s.unit_price) || 0,
          discountAmount: parseFloat(s.discount_amount) || 0,
          lineTotal: parseFloat(s.line_total) || 0,
          paidAmount: parseFloat(s.paid_amount) || 0,
          balanceAmount: parseFloat(s.balance_amount) || 0,
          paymentStatus: s.payment_status || 'Paid',
          time: s.time || new Date(s.created_at).toLocaleString(),
          items: s.items || []
        })));
      } else if (!salesErr && (!dbSales || dbSales.length === 0)) {
        const localSales = safeParseJSON('rehmat_store_machine_sales_v2', []);
        if (localSales && localSales.length > 0) {
          const salesToInsert = localSales.map(s => ({
            id: s.id,
            sale_no: s.saleNo || s.id,
            customer_name: s.customerName || 'Customer',
            customer_phone: s.customerPhone,
            city_address: s.cityAddress,
            machine_name: s.machineName,
            serial_no: s.serialNo,
            qty: parseFloat(s.qty) || 1,
            unit_price: parseFloat(s.unitPrice) || 0,
            discount_amount: parseFloat(s.discountAmount) || 0,
            line_total: parseFloat(s.lineTotal) || 0,
            paid_amount: parseFloat(s.paidAmount) || 0,
            balance_amount: parseFloat(s.balanceAmount) || 0,
            payment_status: s.paymentStatus || 'Paid',
            items: s.items || []
          }));
          await supabase.from('machine_sales').upsert(salesToInsert);
          setMachineSales(localSales);
        }
      }

      // 5. Fetch Customer Payments
      const { data: dbCustPay } = await supabase.from('customer_payments').select('*');
      if (dbCustPay && dbCustPay.length > 0) {
        setCustomerPayments(dbCustPay.map(cp => ({
          id: cp.id,
          customerName: cp.customer_name,
          date: cp.payment_date,
          amountPaid: parseFloat(cp.amount_paid) || 0,
          paymentMethod: cp.payment_method || 'Cash',
          referenceNo: cp.reference_no,
          notes: cp.notes
        })));
      }

      // 6. Fetch Vendor Payments
      const { data: dbVndPay } = await supabase.from('vendor_payments').select('*');
      if (dbVndPay && dbVndPay.length > 0) {
        setVendorPayments(dbVndPay.map(vp => ({
          id: vp.id,
          vendorName: vp.vendor_name,
          date: vp.payment_date,
          amountPaid: parseFloat(vp.amount_paid) || 0,
          paymentMethod: vp.payment_method || 'Cash',
          referenceNo: vp.reference_no,
          notes: vp.notes
        })));
      }

      // 7. Fetch Categories
      const { data: dbCategories, error: catErr } = await supabase.from('categories').select('*');
      if (!catErr && dbCategories && dbCategories.length > 0) {
        setCategories(dbCategories.map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description
        })));
      }

      // 8. Fetch Master Item Names
      const { data: dbMaster, error: mstErr } = await supabase.from('master_item_names').select('*');
      if (!mstErr && dbMaster && dbMaster.length > 0) {
        setMasterItemNames(dbMaster.map((m) => ({
          id: m.id,
          name: m.name,
          category: m.category,
          defaultUnit: m.default_unit
        })));
      }
    } catch (err) {
      console.log('Supabase Sync Notice:', err.message);
    }
  };

  useEffect(() => {
    fetchSupabaseData();

    // Auto-refetch on window focus for multi-device sync
    const handleFocus = () => fetchSupabaseData();
    window.addEventListener('focus', handleFocus);

    // Periodic cloud poll every 20 seconds
    const interval = setInterval(fetchSupabaseData, 20000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  // ==============================|| ACTIONS ||============================== //

  // Master Item Names Actions
  const addMasterItemName = async (nameData) => {
    const itemObj = typeof nameData === 'string' ? { name: nameData } : nameData;
    const newName = itemObj.name;
    const skuCode = itemObj.skuCode || `SKU-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const unitPrice = parseFloat(itemObj.unitPrice) || 0;
    const category = itemObj.category || 'General';
    const defaultUnit = itemObj.defaultUnit || 'PCS';
    const initialStock = parseInt(itemObj.initialStock) || 0;
    const minThreshold = parseInt(itemObj.minThreshold || itemObj.minLevel) || 10;

    const newMaster = {
      id: `MST-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newName,
      skuCode,
      unitPrice,
      category,
      defaultUnit,
      initialStock,
      minThreshold
    };

    setMasterItemNames((prev) => [newMaster, ...prev]);

    try {
      await supabase.from('master_item_names').insert([{
        name: newName,
        category,
        default_unit: defaultUnit
      }]);
    } catch (e) {
      console.error(e);
    }
  };

  const updateMasterItemName = async (id, updatedData) => {
    setMasterItemNames((prev) => prev.map((m) => (m.id === id ? { ...m, ...updatedData } : m)));

    try {
      await supabase.from('master_item_names').update({
        name: updatedData.name,
        category: updatedData.category,
        default_unit: updatedData.defaultUnit
      }).eq('id', id);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteMasterItemName = async (id) => {
    setMasterItemNames((prev) => prev.filter((m) => m.id !== id));

    try {
      await supabase.from('master_item_names').delete().eq('id', id);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteMultipleMasterItemNames = async (ids) => {
    const idsSet = new Set(ids);
    setMasterItemNames((prev) => prev.filter((m) => !idsSet.has(m.id)));

    try {
      await supabase.from('master_item_names').delete().in('id', ids);
    } catch (e) {
      console.error(e);
    }
  };

  // 1. Issue Stock / Daily Usage Action
  const issueStock = async (itemIdOrObj, qtyUsedParam, usedByParam, departmentParam = 'Production Line', issuedByParam = 'Store Keeper', notesParam = '', unitPriceParam = 0) => {
    let itemId = itemIdOrObj;
    let qtyUsed = qtyUsedParam;
    let usedBy = usedByParam;
    let department = departmentParam;
    let issuedBy = issuedByParam;
    let notes = notesParam;
    let unitPrice = unitPriceParam;

    if (typeof itemIdOrObj === 'object' && itemIdOrObj !== null) {
      itemId = itemIdOrObj.itemId || itemIdOrObj.itemName || itemIdOrObj.itemCode;
      qtyUsed = itemIdOrObj.qtyUsed;
      usedBy = itemIdOrObj.usedBy;
      department = itemIdOrObj.department || 'Production Line';
      issuedBy = itemIdOrObj.issuedBy || 'Store Keeper';
      notes = itemIdOrObj.notes || '';
      unitPrice = itemIdOrObj.unitPrice || 0;
    }

    const targetItem = items.find(
      (i) =>
        i.id === itemId ||
        i.itemCode === itemId ||
        (i.name || '').toLowerCase() === (itemId || '').toLowerCase()
    );
    if (!targetItem) return false;

    const actualQty = Math.abs(parseInt(qtyUsed) || 1);
    const price = parseFloat(unitPrice) > 0 ? parseFloat(unitPrice) : (targetItem.unitPrice || 0);
    const lineTotal = actualQty * price;
    const newRemainingStock = Math.max(0, targetItem.remainingStock - actualQty);
    const newUsedToday = targetItem.usedToday + actualQty;
    const isLowStock = newRemainingStock <= targetItem.minLevel;

    // Update Item State
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === targetItem.id) {
          return {
            ...item,
            usedToday: newUsedToday,
            remainingStock: newRemainingStock,
            status: newRemainingStock === 0 ? 2 : isLowStock ? 0 : 1
          };
        }
        return item;
      })
    );

    // Record Usage Log Entry
    const now = new Date();
    const newLog = {
      id: `USG-${Math.floor(100000 + Math.random() * 900000)}`,
      itemCode: targetItem.itemCode,
      itemName: targetItem.name,
      qtyUsed: actualQty,
      unitPrice: price,
      lineTotal: lineTotal,
      usedBy,
      department,
      issuedBy,
      time: `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      dateISO: now.toISOString(),
      type: 'OUT (Daily Usage)',
      remainingStockAfter: newRemainingStock,
      status: 1,
      notes
    };

    setUsageLogs((prev) => [newLog, ...prev]);

    try {
      await supabase.from('items').update({
        current_stock: newRemainingStock
      }).eq('id', targetItem.id);

      await supabase.from('usage_logs').insert([{
        id: newLog.id,
        type: 'Stock Out',
        item_id: targetItem.id,
        item_name: targetItem.name,
        item_code: targetItem.itemCode,
        qty_used: actualQty,
        unit_price: price,
        line_total: lineTotal,
        used_by: usedBy,
        department,
        time: newLog.time,
        timestamp: now.toISOString()
      }]);
    } catch (e) {
      console.error(e);
    }

    return true;
  };

  // 2. Receive Stock / Store IN Action
  const receiveStock = async (itemId, qtyReceived, supplierName = 'Vendor Shipment', refNo = 'PO-' + Math.floor(1000 + Math.random() * 9000), unitPrice = 0) => {
    const targetItem = items.find((i) => i.id === itemId || i.itemCode === itemId || i.name.toLowerCase() === (itemId || '').toLowerCase());
    if (!targetItem) return false;

    const actualQty = Math.abs(parseInt(qtyReceived) || 1);
    const price = parseFloat(unitPrice) || targetItem.unitPrice || 0;
    const lineTotal = actualQty * price;
    const newTotalStock = targetItem.totalStock + actualQty;
    const newRemainingStock = targetItem.remainingStock + actualQty;
    const isLowStock = newRemainingStock <= targetItem.minLevel;

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === targetItem.id) {
          return {
            ...item,
            totalStock: newTotalStock,
            remainingStock: newRemainingStock,
            unitPrice: price > 0 ? price : item.unitPrice,
            status: isLowStock ? 0 : 1
          };
        }
        return item;
      })
    );

    const now = new Date();
    const newLog = {
      id: `IN-${Math.floor(100000 + Math.random() * 900000)}`,
      itemCode: targetItem.itemCode,
      itemName: targetItem.name,
      qtyUsed: actualQty,
      unitPrice: price,
      lineTotal: lineTotal,
      usedBy: supplierName,
      department: 'Store Inward',
      issuedBy: 'Store Manager',
      time: `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      dateISO: now.toISOString(),
      type: 'IN (Shipment Received)',
      remainingStockAfter: newRemainingStock,
      status: 1,
      notes: `Shipment Ref: ${refNo}`
    };

    setUsageLogs((prev) => [newLog, ...prev]);

    try {
      await supabase.from('items').update({
        current_stock: newRemainingStock,
        unit_price: price > 0 ? price : targetItem.unitPrice
      }).eq('id', targetItem.id);

      await supabase.from('usage_logs').insert([{
        id: newLog.id,
        type: 'Stock In',
        item_id: targetItem.id,
        item_name: targetItem.name,
        item_code: targetItem.itemCode,
        qty_used: actualQty,
        unit_price: price,
        line_total: lineTotal,
        used_by: supplierName,
        department: 'Store Inward',
        time: newLog.time,
        timestamp: now.toISOString()
      }]);
    } catch (e) {
      console.error(e);
    }

    return true;
  };

  // 3. Add New Inventory Item to Store
  const addNewItem = async (newItemData) => {
    const newItem = {
      ...newItemData,
      id: `INV-${Date.now().toString().slice(-4)}`,
      itemCode: newItemData.itemCode || `SKU-${Math.floor(10000000 + Math.random() * 90000000)}`,
      usedToday: 0,
      remainingStock: newItemData.totalStock,
      status: 1
    };
    setItems((prev) => [newItem, ...prev]);

    try {
      await supabase.from('items').upsert([{
        id: newItem.id,
        name: newItem.name,
        sku_code: newItem.itemCode,
        category: newItem.category || 'General',
        unit: newItem.unit || 'PCS',
        current_stock: newItem.totalStock || 0,
        unit_price: newItem.unitPrice || 0,
        min_threshold: newItem.minLevel || 10,
        location: newItem.rackLocation || 'Main Store'
      }]);
    } catch (e) {
      console.error(e);
    }
  };

  // 4. Update Item
  const updateItem = async (itemId, updatedData) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === itemId) {
          const newTotal = updatedData.totalStock !== undefined ? parseInt(updatedData.totalStock) || 0 : i.totalStock;
          const newRemaining = Math.max(0, newTotal - i.usedToday);
          return {
            ...i,
            ...updatedData,
            totalStock: newTotal,
            remainingStock: newRemaining
          };
        }
        return i;
      })
    );

    try {
      await supabase.from('items').update({
        name: updatedData.name,
        category: updatedData.category,
        current_stock: updatedData.totalStock,
        unit: updatedData.unit,
        unit_price: updatedData.unitPrice,
        min_threshold: updatedData.minLevel,
        location: updatedData.rackLocation
      }).eq('id', itemId);
    } catch (e) {
      console.error(e);
    }
  };

  // 5. Delete Inventory Item
  const deleteItem = async (itemId) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));

    try {
      await supabase.from('items').delete().eq('id', itemId);
    } catch (e) {
      console.error(e);
    }
  };

  // Bulk Delete Items
  const deleteMultipleItems = async (itemIds) => {
    const idsSet = new Set(itemIds);
    setItems((prev) => prev.filter((i) => !idsSet.has(i.id)));

    try {
      await supabase.from('items').delete().in('id', itemIds);
    } catch (e) {
      console.error(e);
    }
  };

  // Clean Duplicate Test Items Action
  const cleanDuplicateItems = async () => {
    const seen = new Set();
    const cleaned = items.filter((item) => {
      if (item.totalStock === 0 && item.unitPrice === 0 && item.remainingStock === 0) {
        const key = `${(item.name || '').toLowerCase()}_zero`;
        if (seen.has(key)) return false;
        seen.add(key);
      }
      return true;
    });

    setItems(cleaned);
    localStorage.setItem('store_inventory_items', JSON.stringify(cleaned));

    try {
      await supabase.from('items').delete().eq('current_stock', 0).eq('unit_price', 0);
    } catch (e) {
      console.error(e);
    }
  };

  // 6. Vendor Actions
  const addVendor = async (vendorData) => {
    const newVendor = {
      ...vendorData,
      id: `VND-${Math.floor(10 + Math.random() * 90)}`
    };
    setVendors((prev) => [newVendor, ...prev]);

    try {
      await supabase.from('vendors').insert([{
        name: vendorData.name,
        contact_person: vendorData.contactPerson,
        phone: vendorData.phone,
        email: vendorData.email,
        address: vendorData.address,
        supplied_category: vendorData.suppliedCategory,
        status: 1,
        rating: 5.0
      }]);
    } catch (e) {
      console.error(e);
    }
  };

  const updateVendor = async (vendorId, updatedData) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, ...updatedData } : v))
    );

    try {
      await supabase.from('vendors').update({
        name: updatedData.name,
        contact_person: updatedData.contactPerson,
        phone: updatedData.phone,
        email: updatedData.email,
        address: updatedData.address,
        supplied_category: updatedData.suppliedCategory
      }).eq('id', vendorId);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteVendor = async (vendorId) => {
    setVendors((prev) => prev.filter((v) => v.id !== vendorId));

    try {
      await supabase.from('vendors').delete().eq('id', vendorId);
    } catch (e) {
      console.error(e);
    }
  };

  // Bulk Delete Vendors
  const deleteMultipleVendors = async (vendorIds) => {
    const idsSet = new Set(vendorIds);
    setVendors((prev) => prev.filter((v) => !idsSet.has(v.id)));

    try {
      await supabase.from('vendors').delete().in('id', vendorIds);
    } catch (e) {
      console.error(e);
    }
  };

  // 7. Delete Logs Actions
  const deleteMultipleLogs = async (logIds) => {
    const idsSet = new Set(logIds);
    setUsageLogs((prev) => prev.filter((l) => !idsSet.has(l.id)));

    try {
      await supabase.from('usage_logs').delete().in('id', logIds);
    } catch (e) {
      console.error(e);
    }
  };

  // 8. Category Actions
  const addCategory = async (categoryData) => {
    const newCategory = {
      id: `CAT-${Math.floor(100 + Math.random() * 900)}`,
      name: categoryData.name,
      description: categoryData.description || ''
    };
    setCategories((prev) => [newCategory, ...prev]);

    try {
      await supabase.from('categories').insert([{
        name: categoryData.name,
        description: categoryData.description || ''
      }]);
    } catch (e) {
      console.error(e);
    }
  };

  const updateCategory = async (categoryId, updatedData) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, ...updatedData } : c))
    );

    try {
      await supabase.from('categories').update({
        name: updatedData.name,
        description: updatedData.description || ''
      }).eq('id', categoryId);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteCategory = async (categoryId) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));

    try {
      await supabase.from('categories').delete().eq('id', categoryId);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteMultipleCategories = async (categoryIds) => {
    const idsSet = new Set(categoryIds);
    setCategories((prev) => prev.filter((c) => !idsSet.has(c.id)));

    try {
      await supabase.from('categories').delete().in('id', categoryIds);
    } catch (e) {
      console.error(e);
    }
  };

  // Usage Logs Actions
  const deleteLog = async (logId) => {
    setUsageLogs((prev) => prev.filter((l) => l.id !== logId));
    try {
      await supabase.from('usage_logs').delete().eq('id', logId);
    } catch (e) {
      console.error(e);
    }
  };

  const updateLog = async (logId, updatedData) => {
    setUsageLogs((prev) =>
      prev.map((l) => (l.id === logId ? { ...l, ...updatedData } : l))
    );
    try {
      await supabase.from('usage_logs').update({
        item_name: updatedData.itemName,
        used_by: updatedData.usedBy,
        qty_used: updatedData.qtyUsed
      }).eq('id', logId);
    } catch (e) {
      console.error(e);
    }
  };

  // Machine Sales Actions
  const addMachineSale = async (newSaleData) => {
    const now = new Date();
    const id = newSaleData.id || `MS-${Math.floor(10000 + Math.random() * 90000)}`;

    const itemsList = (newSaleData.items && newSaleData.items.length > 0)
      ? newSaleData.items.map((i) => {
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
        machineName: newSaleData.machineName || 'Machine',
        serialNo: newSaleData.serialNo || '',
        qty: parseInt(newSaleData.qty) || 1,
        unitPrice: parseFloat(newSaleData.unitPrice) || 0,
        discount: parseFloat(newSaleData.discount) || 0,
        discountAmount: (((parseInt(newSaleData.qty) || 1) * (parseFloat(newSaleData.unitPrice) || 0)) * (parseFloat(newSaleData.discount) || 0)) / 100,
        lineTotal: Math.max(0, ((parseInt(newSaleData.qty) || 1) * (parseFloat(newSaleData.unitPrice) || 0)) - ((((parseInt(newSaleData.qty) || 1) * (parseFloat(newSaleData.unitPrice) || 0)) * (parseFloat(newSaleData.discount) || 0)) / 100))
      }];

    const subTotalVal = itemsList.reduce((sum, i) => sum + i.lineTotal, 0);
    const discountVal = parseFloat(newSaleData.discountAmount) || 0;
    const netTotalVal = Math.max(0, subTotalVal - discountVal);
    const totalQtySum = itemsList.reduce((sum, i) => sum + i.qty, 0);
    const paidVal = parseFloat(newSaleData.paidAmount) || 0;
    const balanceVal = Math.max(0, netTotalVal - paidVal);

    // Auto-register machine names to Master Catalog if new
    itemsList.forEach((i) => {
      if (i.machineName && i.machineName.trim()) {
        addMachineModel(i.machineName);
      }
    });

    const dateFormatted = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const fullDateString = `${dateFormatted}, ${timeFormatted}`;
    const firstMachine = itemsList[0] || {};

    const newEntry = {
      id,
      customerName: newSaleData.customerName || 'Customer',
      customerPhone: newSaleData.customerPhone || '',
      cityAddress: newSaleData.cityAddress || '',
      items: itemsList,
      machineName: itemsList.length > 1 ? `${firstMachine.machineName} (+${itemsList.length - 1} more)` : firstMachine.machineName,
      serialNo: firstMachine.serialNo || '',
      qty: totalQtySum,
      unitPrice: firstMachine.unitPrice,
      subTotal: subTotalVal,
      discountAmount: discountVal,
      lineTotal: netTotalVal,
      paidAmount: paidVal,
      balanceAmount: balanceVal,
      paymentStatus: newSaleData.paymentStatus || (paidVal >= netTotalVal ? 'Paid' : paidVal > 0 ? 'Partial' : 'Unpaid'),
      warrantyTerms: newSaleData.warrantyTerms || '1 Year Motor & Frame Free Service Warranty',
      time: fullDateString,
      dateISO: now.toISOString()
    };

    setMachineSales((prev) => [newEntry, ...prev]);

    try {
      await supabase.from('machine_sales').upsert([{
        id: newEntry.id,
        sale_no: newEntry.saleNo || newEntry.id,
        customer_name: newEntry.customerName,
        customer_phone: newEntry.customerPhone,
        city_address: newEntry.cityAddress,
        machine_name: newEntry.machineName,
        serial_no: newEntry.serialNo,
        qty: newEntry.qty,
        unit_price: newEntry.unitPrice,
        discount_amount: newEntry.discountAmount,
        line_total: newEntry.lineTotal,
        paid_amount: newEntry.paidAmount,
        balance_amount: newEntry.balanceAmount,
        payment_status: newEntry.paymentStatus,
        time: newEntry.time,
        items: newEntry.items || []
      }]);
    } catch (e) {
      console.error('Supabase addMachineSale Error:', e);
    }
    return newEntry;
  };

  const updateMachineSale = async (id, updatedData) => {
    setMachineSales((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updatedData } : m))
    );
    try {
      await supabase.from('machine_sales').update({
        customer_name: updatedData.customerName,
        customer_phone: updatedData.customerPhone,
        city_address: updatedData.cityAddress,
        machine_name: updatedData.machineName,
        serial_no: updatedData.serialNo,
        qty: updatedData.qty,
        unit_price: updatedData.unitPrice,
        line_total: updatedData.lineTotal,
        paid_amount: updatedData.paidAmount,
        balance_amount: updatedData.balanceAmount,
        payment_status: updatedData.paymentStatus
      }).eq('id', id);
    } catch (e) {
      console.error(e);
    }
  };

  const addMachineModel = (modelName) => {
    if (!modelName || !modelName.trim()) return;
    const trimmed = modelName.trim();
    if (!machineModels.some((m) => m.toLowerCase() === trimmed.toLowerCase())) {
      setMachineModels((prev) => [...prev, trimmed]);
    }
  };

  const saveMachineRecipe = (recipeObj) => {
    setMachineRecipes((prev) => {
      const existingIdx = prev.findIndex((r) => r.modelName.toLowerCase() === recipeObj.modelName.toLowerCase());
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = { ...copy[existingIdx], ...recipeObj };
        return copy;
      }
      return [{ id: `BOM-${Date.now()}`, ...recipeObj }, ...prev];
    });
  };

  const deleteMachineRecipe = (id) => {
    setMachineRecipes((prev) => prev.filter((r) => r.id !== id));
  };

  const deleteMachineSale = async (id) => {
    setMachineSales((prev) => prev.filter((m) => m.id !== id));
    try {
      await supabase.from('machine_sales').delete().eq('id', id);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteMultipleMachineSales = async (ids) => {
    const idsSet = new Set(ids);
    setMachineSales((prev) => prev.filter((m) => !idsSet.has(m.id)));
    try {
      await supabase.from('machine_sales').delete().in('id', ids);
    } catch (e) {
      console.error(e);
    }
  };

  // ----------------------------------------------------
  // BOM MACHINE RECIPES & PRODUCTION ASSEMBLY ACTIONS
  // ----------------------------------------------------

  // Batch Assemble Machine (Deducts all raw materials based on Recipe)
  const assembleMachine = (modelName, buildQty = 1) => {
    const recipe = machineRecipes.find((r) => r.modelName.toLowerCase() === modelName.toLowerCase());
    if (!recipe || !recipe.ingredients || recipe.ingredients.length === 0) {
      return { success: false, message: `No BOM Recipe formula found for ${modelName}. Please define recipe first.` };
    }

    const deductedList = [];
    recipe.ingredients.forEach((ing) => {
      const requiredQty = (parseFloat(ing.qty) || 1) * buildQty;
      // Deduct from store stock
      issueStock({
        itemName: ing.itemName,
        qtyUsed: requiredQty,
        usedBy: `Assembly: ${buildQty}x ${modelName}`,
        department: 'Assembly Floor (BOM Production)',
        unitPrice: 0
      });
      deductedList.push({ itemName: ing.itemName, qtyDeducted: requiredQty });
    });

    return { success: true, count: buildQty, deductedList };
  };

  // ----------------------------------------------------
  // CUSTOMER LEDGER & PAYMENTS ACTIONS
  // ----------------------------------------------------
  const addCustomerPayment = async (paymentData) => {
    const paymentId = `PAY-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    const formattedTime = `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

    const newPayment = {
      id: paymentId,
      invoiceId: paymentData.invoiceId || '',
      customerName: paymentData.customerName || 'Walk-in Customer',
      amountPaid: parseFloat(paymentData.amountPaid) || 0,
      paymentMethod: paymentData.paymentMethod || 'Cash',
      referenceNo: paymentData.referenceNo || '',
      notes: paymentData.notes || '',
      time: formattedTime,
      createdAt: now.toISOString()
    };

    setCustomerPayments((prev) => [newPayment, ...prev]);

    // Auto-update machine sales invoice paid amount & status if matching invoiceId
    if (paymentData.invoiceId) {
      setMachineSales((prevSales) =>
        prevSales.map((sale) => {
          if (sale.id === paymentData.invoiceId) {
            const updatedPaid = (sale.paidAmount || 0) + newPayment.amountPaid;
            const netBill = sale.lineTotal || 0;
            const updatedStatus = updatedPaid >= netBill ? 'Paid' : updatedPaid > 0 ? 'Partial' : 'Unpaid';
            return {
              ...sale,
              paidAmount: updatedPaid,
              paymentStatus: updatedStatus
            };
          }
          return sale;
        })
      );
    }

    try {
      await supabase.from('customer_payments').upsert([{
        id: newPayment.id,
        customer_name: newPayment.customerName,
        payment_date: newPayment.time,
        amount_paid: newPayment.amountPaid,
        payment_method: newPayment.paymentMethod,
        reference_no: newPayment.referenceNo,
        notes: newPayment.notes
      }]);
    } catch (e) {
      console.error('Supabase addCustomerPayment Error:', e);
    }
  };

  // ----------------------------------------------------
  // VENDOR LEDGER & PAYABLE ACTIONS
  // ----------------------------------------------------
  const addVendorPayment = async (paymentData) => {
    const paymentId = `VPAY-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    const formattedTime = `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

    const newPayment = {
      id: paymentId,
      vendorName: paymentData.vendorName || 'Supplier',
      amountPaid: parseFloat(paymentData.amountPaid) || 0,
      paymentMethod: paymentData.paymentMethod || 'Cash',
      referenceNo: paymentData.referenceNo || '',
      notes: paymentData.notes || '',
      time: formattedTime,
      createdAt: now.toISOString()
    };

    setVendorPayments((prev) => [newPayment, ...prev]);

    try {
      await supabase.from('vendor_payments').upsert([{
        id: newPayment.id,
        vendor_name: newPayment.vendorName,
        payment_date: newPayment.time,
        amount_paid: newPayment.amountPaid,
        payment_method: newPayment.paymentMethod,
        reference_no: newPayment.referenceNo,
        notes: newPayment.notes
      }]);
    } catch (e) {
      console.error('Supabase addVendorPayment Error:', e);
    }
  };

  // ----------------------------------------------------
  // FULL BACKUP EXPORT & IMPORT & RESET ACTIONS
  // ----------------------------------------------------
  const exportFullBackupData = () => {
    const backupObj = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      items,
      usageLogs,
      vendors,
      categories,
      masterItemNames,
      machineSales,
      machineModels,
      machineRecipes,
      customerPayments,
      vendorPayments
    };
    return JSON.stringify(backupObj, null, 2);
  };

  const importFullBackupData = (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.items && Array.isArray(data.items)) setItems(data.items);
      if (data.usageLogs && Array.isArray(data.usageLogs)) setUsageLogs(data.usageLogs);
      if (data.vendors && Array.isArray(data.vendors)) setVendors(data.vendors);
      if (data.categories && Array.isArray(data.categories)) setCategories(data.categories);
      if (data.masterItemNames && Array.isArray(data.masterItemNames)) setMasterItemNames(data.masterItemNames);
      if (data.machineSales && Array.isArray(data.machineSales)) setMachineSales(data.machineSales);
      if (data.machineModels && Array.isArray(data.machineModels)) setMachineModels(data.machineModels);
      if (data.machineRecipes && Array.isArray(data.machineRecipes)) setMachineRecipes(data.machineRecipes);
      if (data.customerPayments && Array.isArray(data.customerPayments)) setCustomerPayments(data.customerPayments);
      if (data.vendorPayments && Array.isArray(data.vendorPayments)) setVendorPayments(data.vendorPayments);

      return { success: true, message: 'All Store Data Successfully Restored!' };
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Invalid Backup JSON File format.' };
    }
  };

  const resetAllDataToZero = () => {
    const keysToRemove = [
      'store_inventory_items',
      'store_usage_logs',
      'store_vendors',
      'store_machine_sales',
      'store_customer_payments',
      'store_vendor_payments',
      'rehmat_store_items_v2',
      'rehmat_store_usage_logs_v2',
      'rehmat_store_vendors_v2',
      'rehmat_store_machine_sales_v2',
      'rehmat_store_customer_payments_v2',
      'rehmat_store_vendor_payments_v2'
    ];

    keysToRemove.forEach((key) => localStorage.removeItem(key));

    setItems([]);
    setUsageLogs([]);
    setVendors([]);
    setMachineSales([]);
    setCustomerPayments([]);
    setVendorPayments([]);

    return { success: true, message: 'All demo data reset to 0! System is now clean.' };
  };

  // 13. Memoized Speed Optimizations & Computed Metrics
  const totalInventoryCount = useMemo(
    () => items.reduce((acc, i) => acc + (Number(i.remainingStock) || 0), 0),
    [items]
  );

  const totalValuation = useMemo(
    () => items.reduce((acc, i) => acc + ((Number(i.remainingStock) || 0) * (Number(i.unitPrice) || 0)), 0),
    [items]
  );

  const todayISO = useMemo(() => new Date().toISOString().split('T')[0], []);

  const todayLogs = useMemo(() => {
    const todayStr = new Date().toDateString();
    return usageLogs.filter((log) => {
      if (!log) return false;
      if (log.time && String(log.time).toLowerCase().includes('today')) return true;
      const isoStr = log.dateISO || log.timestamp;
      if (isoStr) {
        const parsed = new Date(isoStr);
        if (!isNaN(parsed.getTime())) {
          return parsed.toDateString() === todayStr;
        }
      }
      return true;
    });
  }, [usageLogs]);

  const todayStockInQty = useMemo(
    () => todayLogs.filter((log) => log.type && log.type.toUpperCase().includes('IN')).reduce((acc, log) => acc + (parseInt(log.qtyUsed) || 0), 0),
    [todayLogs]
  );

  const todayStockOutQty = useMemo(
    () => todayLogs.filter((log) => log.type && log.type.toUpperCase().includes('OUT')).reduce((acc, log) => acc + (parseInt(log.qtyUsed) || 0), 0),
    [todayLogs]
  );

  const lowStockAlerts = useMemo(
    () => items.filter((i) => (Number(i.remainingStock) || 0) <= (Number(i.minLevel) || 0)),
    [items]
  );

  // 14. Memoized Context Provider Value (Prevents Unnecessary Cascade Re-renders)
  const contextValue = useMemo(
    () => ({
      items,
      usageLogs,
      vendors,
      categories,
      masterItemNames,
      machineSales,
      machineModels,
      machineRecipes,
      customerPayments,
      vendorPayments,
      addMachineModel,
      saveMachineRecipe,
      deleteMachineRecipe,
      assembleMachine,
      addCustomerPayment,
      addVendorPayment,
      exportFullBackupData,
      importFullBackupData,
      resetAllDataToZero,
      totalInventoryCount,
      totalValuation,
      dailyUsageCount: todayStockOutQty,
      todayStockInQty,
      todayStockOutQty,
      lowStockAlerts,
      issueStock,
      receiveStock,
      addNewItem,
      updateItem,
      deleteItem,
      deleteMultipleItems,
      cleanDuplicateItems,
      addVendor,
      updateVendor,
      deleteVendor,
      deleteMultipleVendors,
      addCategory,
      updateCategory,
      deleteCategory,
      deleteMultipleCategories,
      deleteLog,
      updateLog,
      deleteMultipleLogs,
      addMasterItemName,
      updateMasterItemName,
      deleteMasterItemName,
      deleteMultipleMasterItemNames,
      addMachineSale,
      updateMachineSale,
      deleteMachineSale,
      deleteMultipleMachineSales
    }),
    [
      items,
      usageLogs,
      vendors,
      categories,
      masterItemNames,
      machineSales,
      machineModels,
      machineRecipes,
      customerPayments,
      vendorPayments,
      totalInventoryCount,
      totalValuation,
      todayStockInQty,
      todayStockOutQty,
      lowStockAlerts
    ]
  );

  return (
    <StoreInventoryContext.Provider value={contextValue}>
      {children}
    </StoreInventoryContext.Provider>
  );
}

StoreInventoryProvider.propTypes = {
  children: PropTypes.node
};

export const useStoreInventory = () => useContext(StoreInventoryContext);
