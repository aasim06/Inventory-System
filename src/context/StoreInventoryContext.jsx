import PropTypes from 'prop-types';
import { createContext, useContext, useState, useEffect } from 'react';
import { initialStoreItems, initialUsageLogs, initialVendors, initialCompanies } from 'data/factoryStoreData';
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
  // 1. Inventory Items State
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('store_inventory_items');
    return saved ? JSON.parse(saved) : initialStoreItems;
  });

  // 2. Usage & Issue Logs State
  const [usageLogs, setUsageLogs] = useState(() => {
    const saved = localStorage.getItem('store_usage_logs');
    return saved ? JSON.parse(saved) : initialUsageLogs;
  });

  // 3. Vendors / Suppliers State
  const [vendors, setVendors] = useState(() => {
    const saved = localStorage.getItem('store_vendors');
    return saved ? JSON.parse(saved) : initialVendors;
  });

  // 4. Companies State
  const [companies, setCompanies] = useState(() => {
    const saved = localStorage.getItem('store_companies');
    return saved ? JSON.parse(saved) : initialCompanies;
  });

  // 5. Pre-saved Master Item Names List State
  const [masterItemNames, setMasterItemNames] = useState(() => {
    const saved = localStorage.getItem('store_master_item_names');
    return saved ? JSON.parse(saved) : initialMasterItemNames;
  });

  // Sync state to LocalStorage as secondary backup
  useEffect(() => {
    localStorage.setItem('store_inventory_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('store_usage_logs', JSON.stringify(usageLogs));
  }, [usageLogs]);

  useEffect(() => {
    localStorage.setItem('store_vendors', JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem('store_companies', JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    localStorage.setItem('store_master_item_names', JSON.stringify(masterItemNames));
  }, [masterItemNames]);

  // Fetch initial data from Supabase if available
  useEffect(() => {
    const fetchSupabaseData = async () => {
      try {
        // Fetch Store Items
        const { data: dbItems, error: itemsErr } = await supabase.from('store_items').select('*');
        if (!itemsErr && dbItems && dbItems.length > 0) {
          const mappedItems = dbItems.map((i) => ({
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
          }));
          setItems(mappedItems);
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

        // Fetch Companies
        const { data: dbCompanies, error: cmpErr } = await supabase.from('companies').select('*');
        if (!cmpErr && dbCompanies && dbCompanies.length > 0) {
          const mappedCompanies = dbCompanies.map((c) => ({
            id: c.id,
            name: c.name,
            description: c.description
          }));
          setCompanies(mappedCompanies);
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
    const newName = typeof nameData === 'string' ? nameData : nameData.name;
    const category = typeof nameData === 'object' && nameData.category ? nameData.category : 'General';
    const defaultUnit = typeof nameData === 'object' && nameData.defaultUnit ? nameData.defaultUnit : 'pcs';

    const newMaster = {
      id: `MST-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newName,
      category,
      defaultUnit
    };

    setMasterItemNames((prev) => [newMaster, ...prev]);

    try {
      await supabase.from('master_item_names').insert([{ name: newName, category, default_unit: defaultUnit }]);
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
  const issueStock = async (itemId, qtyUsed, usedBy, department = 'Production Line', issuedBy = 'Store Keeper', notes = '') => {
    const targetItem = items.find((i) => i.id === itemId || i.itemCode === itemId);
    if (!targetItem) return false;

    const actualQty = Math.abs(parseInt(qtyUsed) || 1);
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
  const receiveStock = async (itemId, qtyReceived, supplierName = 'Vendor Shipment', refNo = 'PO-' + Math.floor(1000 + Math.random() * 9000)) => {
    const targetItem = items.find((i) => i.id === itemId || i.itemCode === itemId);
    if (!targetItem) return false;

    const actualQty = Math.abs(parseInt(qtyReceived) || 1);
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

    // Auto-save to master item names if not present
    const exists = masterItemNames.some((m) => m.name.toLowerCase() === newItemData.name.toLowerCase());
    if (!exists && newItemData.name) {
      addMasterItemName({
        name: newItemData.name,
        category: newItemData.category,
        defaultUnit: newItemData.unit
      });
    }

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

  // 8. Company Actions
  const addCompany = async (companyData) => {
    const newCompany = {
      id: `CMP-${Math.floor(100 + Math.random() * 900)}`,
      name: companyData.name,
      description: companyData.description || ''
    };
    setCompanies((prev) => [newCompany, ...prev]);

    try {
      await supabase.from('companies').insert([{
        name: companyData.name,
        description: companyData.description || ''
      }]);
    } catch (e) {
      console.error(e);
    }
  };

  const updateCompany = async (companyId, updatedData) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === companyId ? { ...c, ...updatedData } : c))
    );

    try {
      await supabase.from('companies').update({
        name: updatedData.name,
        description: updatedData.description || ''
      }).eq('id', companyId);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteCompany = async (companyId) => {
    setCompanies((prev) => prev.filter((c) => c.id !== companyId));

    try {
      await supabase.from('companies').delete().eq('id', companyId);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteMultipleCompanies = async (companyIds) => {
    const idsSet = new Set(companyIds);
    setCompanies((prev) => prev.filter((c) => !idsSet.has(c.id)));

    try {
      await supabase.from('companies').delete().in('id', companyIds);
    } catch (e) {
      console.error(e);
    }
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
        companies,
        masterItemNames,
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
        addVendor,
        updateVendor,
        deleteVendor,
        deleteMultipleVendors,
        addCompany,
        updateCompany,
        deleteCompany,
        deleteMultipleCompanies,
        deleteMultipleLogs,
        addMasterItemName,
        updateMasterItemName,
        deleteMasterItemName,
        deleteMultipleMasterItemNames
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
