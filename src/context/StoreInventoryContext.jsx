import PropTypes from 'prop-types';
import { createContext, useContext, useState, useEffect } from 'react';
import { initialStoreItems, initialUsageLogs, initialVendors, initialCategories, initialMachineSales } from 'data/factoryStoreData';
import { supabase } from 'api/supabase';

const StoreInventoryContext = createContext();

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
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('rehmat_store_items_v2');
    return saved ? JSON.parse(saved) : [];
  });

  // 2. Usage & Issue Logs State (Clean Zero Start)
  const [usageLogs, setUsageLogs] = useState(() => {
    const saved = localStorage.getItem('rehmat_store_usage_logs_v2');
    return saved ? JSON.parse(saved) : [];
  });

  // 3. Vendors / Suppliers State (Clean Zero Start)
  const [vendors, setVendors] = useState(() => {
    const saved = localStorage.getItem('rehmat_store_vendors_v2');
    return saved ? JSON.parse(saved) : [];
  });

  // 4. Categories State
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('rehmat_store_categories_v2');
    return saved ? JSON.parse(saved) : initialCategories;
  });

  // 7. Pre-saved Master Item Names List State
  const [masterItemNames, setMasterItemNames] = useState(() => {
    const saved = localStorage.getItem('rehmat_store_master_item_names_v2');
    return saved ? JSON.parse(saved) : initialMasterItemNames;
  });

  const initialMachineModels = [
    'Rehmat 20" Lawn Mower (Petrol Engine)',
    'Rehmat Electric Lawn Cutter 18"',
    'Rehmat Heavy Duty Lawn Mower 24"',
    'Rehmat Grass Trimmer & Cutter 2-Stroke',
    'Rehmat Hand Push Lawn Roller Mower'
  ];

  // 8. Customer Machine Sales State (Clean Zero Start)
  const [machineSales, setMachineSales] = useState(() => {
    const saved = localStorage.getItem('rehmat_store_machine_sales_v2');
    return saved ? JSON.parse(saved) : [];
  });

  // 9. Master Machine Models Catalog State
  const [machineModels, setMachineModels] = useState(() => {
    const saved = localStorage.getItem('store_machine_models');
    return saved ? JSON.parse(saved) : initialMachineModels;
  });

  // 10. Machine BOM Recipes State
  const [machineRecipes, setMachineRecipes] = useState(() => {
    const saved = localStorage.getItem('store_machine_recipes');
    const parsed = saved ? JSON.parse(saved) : null;
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
  const [customerPayments, setCustomerPayments] = useState(() => {
    const saved = localStorage.getItem('rehmat_store_customer_payments_v2');
    return saved ? JSON.parse(saved) : [];
  });

  // 12. Vendor Payments & Ledger Entries State (Clean Zero Start)
  const [vendorPayments, setVendorPayments] = useState(() => {
    const saved = localStorage.getItem('rehmat_store_vendor_payments_v2');
    return saved ? JSON.parse(saved) : [];
  });

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

  // Fetch initial data from Supabase if available
  useEffect(() => {
    const fetchSupabaseData = async () => {
      try {
        // Fetch Store Items
        const { data: dbItems, error: itemsErr } = await supabase.from('store_items').select('*');
        if (!itemsErr && dbItems && dbItems.length > 0) {
          const seen = new Set();
          const mappedItems = dbItems
            .map((i) => ({
              id: i.id,
              itemCode: i.item_code,
              name: i.name,
              category: i.category,
              totalStock: i.total_stock,
              usedToday: i.used_today,
              remainingStock: i.remaining_stock,
              unit: i.unit,
              unitPrice: i.unit_price,
              minLevel: i.min_level,
              rackLocation: i.rack_location,
              status: i.status
            }))
            .filter((i) => {
              if (i.totalStock === 0 && i.unitPrice === 0 && i.remainingStock === 0) {
                const key = `${(i.name || '').toLowerCase()}_zero`;
                if (seen.has(key)) return false;
                seen.add(key);
                return false; // remove all zero-price zero-stock test entries
              }
              return true;
            });

          setItems(mappedItems);

          // Clean up ghost rows in Supabase database automatically
          try {
            await supabase.from('store_items').delete().eq('total_stock', 0).eq('unit_price', 0);
          } catch (err) {
            console.error(err);
          }
        }

        // Fetch Vendors
        const { data: dbVendors, error: vndErr } = await supabase.from('vendors').select('*');
        if (!vndErr && dbVendors && dbVendors.length > 0) {
          const mappedVendors = dbVendors.map((v) => ({
            id: v.id,
            name: v.name,
            contactPerson: v.contact_person,
            phone: v.phone,
            email: v.email,
            address: v.address,
            suppliedCategory: v.supplied_category,
            totalOrders: v.total_orders,
            status: v.status,
            rating: v.rating
          }));
          setVendors(mappedVendors);
        }

        // Fetch Categories
        const { data: dbCategories, error: catErr } = await supabase.from('categories').select('*');
        if (!catErr && dbCategories && dbCategories.length > 0) {
          const mappedCategories = dbCategories.map((c) => ({
            id: c.id,
            name: c.name,
            description: c.description
          }));
          setCategories(mappedCategories);
        }

        // Fetch Master Item Names
        const { data: dbMaster, error: mstErr } = await supabase.from('master_item_names').select('*');
        if (!mstErr && dbMaster && dbMaster.length > 0) {
          const mappedMaster = dbMaster.map((m) => ({
            id: m.id,
            name: m.name,
            category: m.category,
            defaultUnit: m.default_unit
          }));
          setMasterItemNames(mappedMaster);
        }

        // Fetch Usage Logs
        const { data: dbLogs, error: logErr } = await supabase.from('usage_logs').select('*').order('created_at', { ascending: false });
        if (!logErr && dbLogs && dbLogs.length > 0) {
          const mappedLogs = dbLogs.map((l) => ({
            id: l.id,
            itemCode: l.item_code,
            itemName: l.item_name,
            qtyUsed: l.qty_used,
            usedBy: l.used_by,
            department: l.department,
            issuedBy: l.issued_by,
            time: `Today, ${new Date(l.date_iso || l.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            dateISO: l.date_iso || l.created_at,
            type: l.type,
            remainingStockAfter: l.remaining_stock_after,
            status: l.status,
            notes: l.notes
          }));
          setUsageLogs(mappedLogs);
        }
      } catch (err) {
        console.log('Supabase connection pending table creation:', err.message);
      }
    };

    fetchSupabaseData();
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
      await supabase.from('store_items').update({
        used_today: newUsedToday,
        remaining_stock: newRemainingStock,
        status: newRemainingStock === 0 ? 2 : isLowStock ? 0 : 1
      }).eq('id', targetItem.id);

      await supabase.from('usage_logs').insert([{
        item_code: targetItem.itemCode,
        item_name: targetItem.name,
        qty_used: actualQty,
        used_by: usedBy,
        department,
        issued_by: issuedBy,
        type: 'OUT (Daily Usage)',
        date_iso: now.toISOString(),
        remaining_stock_after: newRemainingStock,
        status: 1,
        notes
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
      await supabase.from('store_items').update({
        total_stock: newTotalStock,
        remaining_stock: newRemainingStock,
        status: isLowStock ? 0 : 1
      }).eq('id', targetItem.id);

      await supabase.from('usage_logs').insert([{
        item_code: targetItem.itemCode,
        item_name: targetItem.name,
        qty_used: actualQty,
        used_by: supplierName,
        department: 'Store Inward',
        issued_by: 'Store Manager',
        type: 'IN (Shipment Received)',
        date_iso: now.toISOString(),
        remaining_stock_after: newRemainingStock,
        status: 1,
        notes: `Shipment Ref: ${refNo}`
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
      await supabase.from('store_items').insert([{
        item_code: newItem.itemCode,
        name: newItem.name,
        category: newItem.category,
        total_stock: newItem.totalStock,
        used_today: 0,
        remaining_stock: newItem.totalStock,
        unit: newItem.unit,
        unit_price: newItem.unitPrice,
        min_level: newItem.minLevel,
        rack_location: newItem.rackLocation,
        status: 1
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
      await supabase.from('store_items').update({
        name: updatedData.name,
        category: updatedData.category,
        total_stock: updatedData.totalStock,
        unit: updatedData.unit,
        unit_price: updatedData.unitPrice,
        min_level: updatedData.minLevel,
        rack_location: updatedData.rackLocation
      }).eq('id', itemId);
    } catch (e) {
      console.error(e);
    }
  };

  // 5. Delete Inventory Item
  const deleteItem = async (itemId) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));

    try {
      await supabase.from('store_items').delete().eq('id', itemId);
    } catch (e) {
      console.error(e);
    }
  };

  // Bulk Delete Items
  const deleteMultipleItems = async (itemIds) => {
    const idsSet = new Set(itemIds);
    setItems((prev) => prev.filter((i) => !idsSet.has(i.id)));

    try {
      await supabase.from('store_items').delete().in('id', itemIds);
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
      await supabase.from('store_items').delete().eq('total_stock', 0).eq('unit_price', 0);
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
      await supabase.from('machine_sales').insert([{
        id: newEntry.id,
        customer_name: newEntry.customerName,
        customer_phone: newEntry.customerPhone,
        city_address: newEntry.cityAddress,
        machine_name: newEntry.machineName,
        serial_no: newEntry.serialNo,
        qty: newEntry.qty,
        unit_price: newEntry.unitPrice,
        line_total: newEntry.lineTotal,
        paid_amount: newEntry.paidAmount,
        balance_amount: newEntry.balanceAmount,
        payment_status: newEntry.paymentStatus,
        warranty_terms: newEntry.warrantyTerms,
        date_iso: newEntry.dateISO
      }]);
    } catch (e) {
      console.error(e);
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
        payment_status: updatedData.paymentStatus,
        warranty_terms: updatedData.warrantyTerms
      }).eq('id', id);
    } catch (e) {
      console.error(e);
    }
  };

  const addMachineModel = (modelName) => {
    if (!modelName || !modelName.trim()) return;
    const trimmed = modelName.trim();
    setMachineModels((prev) => {
      if (prev.some((m) => m.toLowerCase() === trimmed.toLowerCase())) return prev;
      const updated = [trimmed, ...prev];
      localStorage.setItem('store_machine_models', JSON.stringify(updated));
      return updated;
    });
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
  const saveMachineRecipe = (recipeData) => {
    const id = recipeData.id || `BOM-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecipe = {
      ...recipeData,
      id,
      updatedAt: new Date().toISOString()
    };

    setMachineRecipes((prev) => {
      const idx = prev.findIndex((r) => r.id === id || r.modelName.toLowerCase() === recipeData.modelName.toLowerCase());
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = newRecipe;
        return updated;
      }
      return [newRecipe, ...prev];
    });

    // Auto add model to master catalog if new
    if (recipeData.modelName) {
      addMachineModel(recipeData.modelName);
    }
  };

  const deleteMachineRecipe = (id) => {
    setMachineRecipes((prev) => prev.filter((r) => r.id !== id));
  };

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
  const addCustomerPayment = (paymentData) => {
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
  };

  // ----------------------------------------------------
  // VENDOR LEDGER & PAYABLE ACTIONS
  // ----------------------------------------------------
  const addVendorPayment = (paymentData) => {
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

  // Computed Metrics
  const totalInventoryCount = items.reduce((acc, i) => acc + i.remainingStock, 0);
  const totalValuation = items.reduce((acc, i) => acc + i.remainingStock * i.unitPrice, 0);

  const todayLogs = usageLogs.filter((log) => log.time && log.time.includes('Today'));
  const todayStockInQty = todayLogs.filter((log) => log.type.includes('IN')).reduce((acc, log) => acc + (parseInt(log.qtyUsed) || 0), 0);
  const todayStockOutQty = todayLogs.filter((log) => log.type.includes('OUT')).reduce((acc, log) => acc + (parseInt(log.qtyUsed) || 0), 0);

  const lowStockAlerts = items.filter((i) => i.remainingStock <= i.minLevel);

  return (
    <StoreInventoryContext.Provider
      value={{
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
      }}
    >
      {children}
    </StoreInventoryContext.Provider>
  );
}

StoreInventoryProvider.propTypes = {
  children: PropTypes.node
};

export const useStoreInventory = () => useContext(StoreInventoryContext);
