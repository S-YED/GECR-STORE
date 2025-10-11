/*
  # Equipment Inventory Management System - Database Schema

  ## Overview
  Complete database schema for GECR Store equipment inventory system with authentication, 
  department management, equipment tracking, and audit logging.

  ## New Tables
  
  ### 1. departments
  Stores organizational departments/branches
  - `id` (uuid, primary key) - Unique department identifier
  - `name` (text, unique) - Department name (e.g., "Electronic and Communication")
  - `created_at` (timestamptz) - Record creation timestamp
  - `created_by` (uuid) - Reference to user who created the department

  ### 2. equipments
  Main inventory table for tracking equipment
  - `id` (uuid, primary key) - Unique equipment identifier
  - `order_no` (text) - Order/reference number
  - `name` (text) - Equipment name
  - `purchase_date` (date) - Date of purchase
  - `supplier` (text) - Supplier/vendor name
  - `amount` (numeric) - Purchase amount/cost
  - `condition` (text) - Current condition (e.g., "Serviceable")
  - `department_id` (uuid) - Foreign key to departments
  - `room_name` (text) - Location/room name
  - `quantity` (integer) - Number of units
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  - `created_by` (uuid) - Reference to user who created the record
  - `updated_by` (uuid) - Reference to user who last updated the record

  ### 3. audit_logs
  Tracks all changes to equipment records
  - `id` (uuid, primary key) - Unique log identifier
  - `equipment_id` (uuid) - Reference to equipment
  - `order_no` (text) - Equipment order number (for reference)
  - `action` (text) - Action performed (INSERT, UPDATE, DELETE)
  - `old_data` (jsonb) - Previous state (for updates/deletes)
  - `new_data` (jsonb) - New state (for inserts/updates)
  - `performed_by` (uuid) - User who performed the action
  - `performed_at` (timestamptz) - When the action occurred

  ## Security
  
  ### Row Level Security (RLS)
  All tables have RLS enabled with the following policies:
  
  #### departments table:
  - Authenticated users can view all departments
  - Authenticated users can insert new departments
  - Authenticated users can update departments
  - Only authenticated users can delete departments

  #### equipments table:
  - Authenticated users can view all equipment
  - Authenticated users can insert new equipment
  - Authenticated users can update equipment
  - Authenticated users can delete equipment

  #### audit_logs table:
  - Authenticated users can view all audit logs
  - System can insert audit logs (via triggers)

  ## Database Triggers
  
  ### Equipment Audit Triggers
  - `audit_equipment_insert` - Logs equipment creation
  - `audit_equipment_update` - Logs equipment modifications
  - `audit_equipment_delete` - Logs equipment deletion
  
  These triggers automatically capture all changes to equipment records including
  the user who made the change and complete before/after state.

  ## Indexes
  - `idx_equipments_order_no` - Fast lookup by order number
  - `idx_equipments_department` - Fast filtering by department
  - `idx_equipments_created_at` - Efficient date-based queries
  - `idx_audit_logs_equipment` - Fast audit log retrieval by equipment
  - `idx_audit_logs_performed_at` - Time-based audit log queries

  ## Sample Data
  Includes initial departments and comprehensive sample equipment records:
  - 21 equipment items across all departments
  - Realistic pricing from ₹3,500 to ₹8,50,000
  - Various suppliers and locations
  - Different lab assignments and quantities
  - Mix of electronics, mechanical, civil, and computer science equipment
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- DEPARTMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view departments"
  ON departments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert departments"
  ON departments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update departments"
  ON departments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete departments"
  ON departments FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- EQUIPMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS equipments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_no text NOT NULL,
  name text NOT NULL,
  purchase_date date,
  supplier text,
  amount numeric(12, 2) DEFAULT 0,
  condition text DEFAULT 'Serviceable',
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  room_name text,
  quantity integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE equipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view equipment"
  ON equipments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert equipment"
  ON equipments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update equipment"
  ON equipments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete equipment"
  ON equipments FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- AUDIT LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id uuid,
  order_no text,
  action text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  performed_by uuid REFERENCES auth.users(id),
  performed_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_equipments_order_no ON equipments(order_no);
CREATE INDEX IF NOT EXISTS idx_equipments_department ON equipments(department_id);
CREATE INDEX IF NOT EXISTS idx_equipments_created_at ON equipments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_equipment ON audit_logs(equipment_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_at ON audit_logs(performed_at DESC);

-- =====================================================
-- AUDIT TRIGGER FUNCTIONS
-- =====================================================

-- Function to audit equipment insertions
CREATE OR REPLACE FUNCTION audit_equipment_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (equipment_id, order_no, action, new_data, performed_by, performed_at)
  VALUES (
    NEW.id,
    NEW.order_no,
    'INSERT',
    to_jsonb(NEW),
    auth.uid(),
    now()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to audit equipment updates
CREATE OR REPLACE FUNCTION audit_equipment_update()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (equipment_id, order_no, action, old_data, new_data, performed_by, performed_at)
  VALUES (
    NEW.id,
    NEW.order_no,
    'UPDATE',
    to_jsonb(OLD),
    to_jsonb(NEW),
    auth.uid(),
    now()
  );
  
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to audit equipment deletions
CREATE OR REPLACE FUNCTION audit_equipment_delete()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (equipment_id, order_no, action, old_data, performed_by, performed_at)
  VALUES (
    OLD.id,
    OLD.order_no,
    'DELETE',
    to_jsonb(OLD),
    auth.uid(),
    now()
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ATTACH TRIGGERS TO EQUIPMENTS TABLE
-- =====================================================

DROP TRIGGER IF EXISTS trigger_audit_equipment_insert ON equipments;
CREATE TRIGGER trigger_audit_equipment_insert
  AFTER INSERT ON equipments
  FOR EACH ROW
  EXECUTE FUNCTION audit_equipment_insert();

DROP TRIGGER IF EXISTS trigger_audit_equipment_update ON equipments;
CREATE TRIGGER trigger_audit_equipment_update
  BEFORE UPDATE ON equipments
  FOR EACH ROW
  EXECUTE FUNCTION audit_equipment_update();

DROP TRIGGER IF EXISTS trigger_audit_equipment_delete ON equipments;
CREATE TRIGGER trigger_audit_equipment_delete
  BEFORE DELETE ON equipments
  FOR EACH ROW
  EXECUTE FUNCTION audit_equipment_delete();

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert departments (matching original data)
INSERT INTO departments (name) VALUES
  ('Electronic and Communication'),
  ('Civil'),
  ('Computer Science'),
  ('Mechanical')
ON CONFLICT (name) DO NOTHING;

-- Insert sample equipment data (comprehensive dataset)
DO $$
DECLARE
  dept_ece uuid;
  dept_civil uuid;
  dept_cs uuid;
  dept_mech uuid;
BEGIN
  -- Get department IDs
  SELECT id INTO dept_ece FROM departments WHERE name = 'Electronic and Communication';
  SELECT id INTO dept_civil FROM departments WHERE name = 'Civil';
  SELECT id INTO dept_cs FROM departments WHERE name = 'Computer Science';
  SELECT id INTO dept_mech FROM departments WHERE name = 'Mechanical';

  -- Insert equipment records
  INSERT INTO equipments (order_no, name, purchase_date, supplier, amount, condition, department_id, room_name, quantity) VALUES
    ('10', 'Signal Generator', '2016-12-03', 'UNION INSTRUMENTS, BANGALORE', 87343, 'Serviceable', dept_ece, 'Microprocessor Lab', 7),
    ('VT/121', 'EXIDE 100AH Battery (Tubular Type) 12V', '2018-03-17', 'Vasundhara Technologies, Bangalore', 89920, 'Serviceable', dept_ece, 'Power Electronics Lab', 5),
    ('13', 'STEPPER MOTOR Interface', '2016-12-03', 'UNION INSTRUMENTS, BANGALORE', 56419, 'Serviceable', dept_ece, 'Microprocessor Lab', 5),
    ('14', 'DC MOTOR Interface', '2016-12-03', 'UNION INSTRUMENTS, BANGALORE', 33205, 'Serviceable', dept_ece, 'Microprocessor Lab', 5),
    ('11', 'PCI DIOT', '2016-12-03', 'UNION INSTRUMENTS, BANGALORE', 89411, 'Serviceable', dept_ece, 'Microprocessor Lab', 5),
    ('9', 'KeyBoard Interface', '2016-12-03', 'UNION INSTRUMENTS, BANGALORE', 23615, 'Serviceable', dept_ece, 'Microprocessor Lab', 5),
    ('32', 'WiFi Router', '2027-12-27', 'Clive Technologies, Ramanagara', 8104, 'Serviceable', dept_cs, 'Network Lab', 3),
    ('OSC/001', 'Digital Storage Oscilloscope', '2019-05-15', 'Tektronix India Pvt Ltd', 125000, 'Serviceable', dept_ece, 'Electronics Lab', 2),
    ('CNC/M01', 'CNC Milling Machine', '2020-08-22', 'Ace Micromatic Group', 850000, 'Serviceable', dept_mech, 'Manufacturing Lab', 1),
    ('LAB/PC15', 'High Performance Workstation', '2021-01-10', 'Dell Technologies', 95000, 'Serviceable', dept_cs, 'Programming Lab', 25),
    ('NET/AN02', 'Network Analyzer', '2019-11-08', 'Keysight Technologies', 180000, 'Serviceable', dept_ece, 'RF Lab', 1),
    ('CONC/T01', 'Concrete Testing Machine', '2018-06-12', 'Controls Group India', 220000, 'Serviceable', dept_civil, 'Materials Lab', 1),
    ('LAT/001', 'Precision Lathe Machine', '2020-03-18', 'Bharat Heavy Electricals Ltd', 450000, 'Serviceable', dept_mech, 'Workshop', 2),
    ('ARD/KIT5', 'Arduino Development Kit', '2021-09-05', 'Arduino Store India', 3500, 'Serviceable', dept_cs, 'IoT Lab', 15),
    ('SPEC/AN1', 'Spectrum Analyzer', '2019-07-20', 'Rohde & Schwarz', 320000, 'Serviceable', dept_ece, 'Communication Lab', 1),
    ('SOIL/T02', 'Soil Testing Equipment Set', '2018-12-03', 'Aimil Ltd', 75000, 'Serviceable', dept_civil, 'Geotechnical Lab', 1),
    ('3D/PR01', '3D Printer (Industrial Grade)', '2021-04-14', 'Stratasys India', 280000, 'Serviceable', dept_mech, 'Design Lab', 2),
    ('SRV/R01', 'High-End Server Rack', '2020-11-25', 'HPE India', 450000, 'Serviceable', dept_cs, 'Data Center', 3),
    ('PWR/SUP3', 'Programmable Power Supply', '2019-02-28', 'Keithley Instruments', 65000, 'Serviceable', dept_ece, 'Power Lab', 4),
    ('SURV/EQ1', 'Total Station Survey Equipment', '2018-09-15', 'Leica Geosystems', 380000, 'Serviceable', dept_civil, 'Survey Lab', 2),
    ('CMP/ENG1', 'Compressor Engine Test Rig', '2020-07-08', 'Techno Instruments', 195000, 'Serviceable', dept_mech, 'Thermal Lab', 1)
  ON CONFLICT DO NOTHING;
END $$;