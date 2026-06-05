/**
 * POCKETBASE TO SUPABASE DATA MIGRATION SCRIPT (SQLITE VERSION)
 *
 * INSTRUCTIONS:
 * 1. Locate your PocketBase database file. It is typically found at `pb_data/data.db`.
 * 2. Copy the `data.db` file and place it in the same directory as this script.
 * 3. Update the SUPABASE_SERVICE_ROLE_KEY below.
 * 4. Run `pnpm add @supabase/supabase-js better-sqlite3`
 * 5. Run `node migration.mjs`
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import Database from 'better-sqlite3';

const SUPABASE_URL = '';
const SUPABASE_SERVICE_ROLE_KEY = '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Map to keep track of PocketBase IDs (15-char) to Supabase UUIDs
const idMap = new Map();

function getUUID(pbId) {
  if (!pbId) return null;
  if (!idMap.has(pbId)) {
    idMap.set(pbId, crypto.randomUUID());
  }
  return idMap.get(pbId);
}

function getDate(pbDate) {
  if (!pbDate) return new Date().toISOString();
  // PocketBase dates are in "YYYY-MM-DD HH:MM:SS" format, we need to convert to ISO string
  return pbDate.replace(' ', 'T');
}

async function migrate() {
  console.log('🚀 Starting Migration from PocketBase SQLite to Supabase...');

  let db;
  try {
    db = new Database('data.db', { fileMustExist: true });
    console.log('📂 Successfully connected to PocketBase data.db!');
  } catch (error) {
    console.error(
      '❌ Could not find data.db. Please ensure you copied your pb_data/data.db file to this directory.',
      error,
    );
    process.exit(1);
  }

  // 1. Read Tables
  const pbEmployees = db.prepare('SELECT * FROM employees').all();
  const pbProducts = db.prepare('SELECT * FROM products').all();
  const pbRates = db.prepare('SELECT * FROM rates').all();
  const pbSales = db.prepare('SELECT * FROM sales').all();
  const pbCommissions = db.prepare('SELECT * FROM commissions').all();

  // 2. Migrate Metals (Products)
  console.log(`\n📦 Migrating ${pbProducts.length} Metals (Products)...`);
  const metals = pbProducts.map((p) => ({
    id: getUUID(p.id),
    name: p.name,
    price: p.price || 0,
    created_at: getDate(p.created),
    updated_at: getDate(p.updated),
  }));
  const { error: metalsErr } = await supabase.from('metals').insert(metals);
  if (metalsErr) console.error('Error inserting metals:', metalsErr);
  else console.log('✅ Metals migrated successfully!');

  // 3. Migrate Employees
  console.log(`\n👥 Migrating ${pbEmployees.length} Employees...`);
  const employees = pbEmployees.map((e) => ({
    id: getUUID(e.id),
    name: e.name,
    weight: e.weight || 0,
    is_permanent: e.is_permanent === 1 || e.is_permanent === true || e.is_permanent === 'true',
    created_at: getDate(e.created),
    updated_at: getDate(e.updated),
  }));
  const { error: empErr } = await supabase.from('employees').insert(employees);
  if (empErr) console.error('Error inserting employees:', empErr);
  else console.log('✅ Employees migrated successfully!');

  // 4. Migrate Rates
  console.log(`\n📈 Migrating ${pbRates.length} Commission Rates...`);
  const rates = pbRates.map((r) => ({
    id: getUUID(r.id),
    min_units: r.lower_limit === null ? 0 : r.lower_limit,
    max_units: r.upper_limit === 0 ? 9999 : r.upper_limit,
    rate: (r.rate || 0) * 100, // Convert 0.2 to 20%
    created_at: getDate(r.created),
    updated_at: getDate(r.updated),
  }));
  const { error: ratesErr } = await supabase.from('rates').insert(rates);
  if (ratesErr) console.error('Error inserting rates:', ratesErr);
  else console.log('✅ Rates migrated successfully!');

  // 5. Migrate Daily Records (Sales + Commissions)
  console.log(`\n📑 Migrating ${pbSales.length} Daily Records (Merging with Commissions)...`);

  // Group commissions by sale_id
  const commissionsBySale = {};
  pbCommissions.forEach((c) => {
    if (!commissionsBySale[c.sale_id]) commissionsBySale[c.sale_id] = [];
    commissionsBySale[c.sale_id].push(c);
  });

  const dailyRecords = pbSales.map((s) => {
    // Parse nested JSON arrays from PocketBase
    const pbEmps = typeof s.employees === 'string' ? JSON.parse(s.employees) : s.employees || [];
    const pbProds = typeof s.products === 'string' ? JSON.parse(s.products) : s.products || [];
    const pbRatesNested = typeof s.rates === 'string' ? JSON.parse(s.rates) : s.rates || [];

    // Transform Production Details
    const production_details = pbProds.map((p, i) => ({
      metal_id: getUUID(p.id),
      units:
        i === pbProds.length - 1
          ? Math.round((s.units - Math.floor((s.units / pbProds.length) * (pbProds.length - 1))) * 100) / 100
          : Math.floor(s.units / pbProds.length), // Pb does not have per-product units, so we divide total units equally among products
      snapshot_price: p.price || 0,
    }));

    // Calculate avg price for the day based on the snapshot products
    let snapshot_avg_price = 0;
    if (production_details.length > 0) {
      snapshot_avg_price = production_details.reduce((sum, p) => sum + p.snapshot_price, 0) / production_details.length;
    }

    // Transform Employees & Match with their exact historical Commission!
    const saleCommissions = commissionsBySale[s.id] || [];

    const employees_json = pbEmps
      .filter((e) => e.isSelected) // Only include selected employees
      .map((e) => {
        // Find the exact historical payout from the PocketBase commissions table
        const matchingComm = saleCommissions.find((c) => c.employee_id === e.id);
        const commission_earned = matchingComm ? matchingComm.commission : 0;

        return {
          employee_id: getUUID(e.id),
          snapshot_weight: e.weight,
          commission_earned: commission_earned,
          base_commission: commission_earned, // Assuming no bonus in legacy
          bonus_amount: (s.additional_payment || 0) * e.weight, // Distribute additional payment as bonus (legacy had no per-employee bonus, so we apply total additional payment as bonus to each employee for simplicity)
        };
      });

    // Transform Rates Snapshot
    const snapshot_rates_json = pbRatesNested.map((r) => ({
      id: getUUID(r.id),
      min_units: r.lower_limit === null ? 0 : r.lower_limit,
      max_units: r.upper_limit === 0 ? 9999 : r.upper_limit,
      rate: (r.rate || 0) * 100,
    }));

    return {
      id: getUUID(s.id),
      date: s.date ? s.date.split(' ')[0] : s.created.split(' ')[0],
      total_units: s.units || 0,
      snapshot_avg_price: snapshot_avg_price,
      snapshot_rates_json: snapshot_rates_json,
      production_details: production_details,
      employees: employees_json,
      note: s.notes || '',
      disable_negative_commissions:
        s.is_negative_allowed === 0 || s.is_negative_allowed === false || s.is_negative_allowed === 'false', // Invert boolean
      idle_employee_count: s.idle_employee_count || 0,
      additional_bonus_per_weight: s.additional_payment || 0,
      created_at: getDate(s.created),
      updated_at: getDate(s.updated),
    };
  });

  // Batch insert in chunks of 100 to avoid request size limits
  const CHUNK_SIZE = 100;
  for (let i = 0; i < dailyRecords.length; i += CHUNK_SIZE) {
    const chunk = dailyRecords.slice(i, i + CHUNK_SIZE);
    const { error: recErr } = await supabase.from('daily_records').insert(chunk);
    if (recErr) {
      console.error(`Error inserting daily records batch ${i}:`, recErr);
    } else {
      console.log(`✅ Migrated daily records ${i} to ${i + chunk.length}`);
    }
  }

  console.log('\n🎉 MIGRATION COMPLETE! All PocketBase data has been successfully ported to Supabase UUID format.');
}

migrate();
