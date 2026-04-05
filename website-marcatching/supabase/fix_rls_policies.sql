-- ============================================================
-- FIX: RLS policies for admin dashboard
-- Run this in Supabase SQL Editor
-- 
-- Problem: Admin dashboard uses anon key (cookie-based auth),
-- but RLS policies only allowed writes for auth.role() = 'authenticated'
-- (Supabase Auth users). This caused "TypeError: Load failed" errors.
-- ============================================================

-- 1. Drop old "Authenticated full access" policies that don't work with anon key
DROP POLICY IF EXISTS "Authenticated full access links" ON links;
DROP POLICY IF EXISTS "Authenticated full access contact" ON contact;
DROP POLICY IF EXISTS "Authenticated full access products" ON products;
DROP POLICY IF EXISTS "Authenticated full access vouchers" ON vouchers;
DROP POLICY IF EXISTS "Authenticated full access orders" ON orders;
DROP POLICY IF EXISTS "Authenticated full access course_materials" ON course_materials;
DROP POLICY IF EXISTS "Authenticated full access course_access_emails" ON course_access_emails;
DROP POLICY IF EXISTS "Authenticated full access enrollments" ON course_enrollments;

-- 2. Add public read for orders (was missing)
DROP POLICY IF EXISTS "Public read orders" ON orders;
CREATE POLICY "Public read orders" ON orders FOR SELECT USING (true);

-- 3. Add public write policies for LINKS
DROP POLICY IF EXISTS "Public insert links" ON links;
DROP POLICY IF EXISTS "Public update links" ON links;
DROP POLICY IF EXISTS "Public delete links" ON links;
CREATE POLICY "Public insert links" ON links FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update links" ON links FOR UPDATE USING (true);
CREATE POLICY "Public delete links" ON links FOR DELETE USING (true);

-- 4. Add public write policies for CONTACT
DROP POLICY IF EXISTS "Public insert contact" ON contact;
DROP POLICY IF EXISTS "Public update contact" ON contact;
DROP POLICY IF EXISTS "Public delete contact" ON contact;
CREATE POLICY "Public insert contact" ON contact FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update contact" ON contact FOR UPDATE USING (true);
CREATE POLICY "Public delete contact" ON contact FOR DELETE USING (true);

-- 5. Add public write policies for PRODUCTS
DROP POLICY IF EXISTS "Public insert products" ON products;
DROP POLICY IF EXISTS "Public update products" ON products;
DROP POLICY IF EXISTS "Public delete products" ON products;
CREATE POLICY "Public insert products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update products" ON products FOR UPDATE USING (true);
CREATE POLICY "Public delete products" ON products FOR DELETE USING (true);

-- 6. Add public write policies for VOUCHERS
DROP POLICY IF EXISTS "Public insert vouchers" ON vouchers;
DROP POLICY IF EXISTS "Public update vouchers" ON vouchers;
DROP POLICY IF EXISTS "Public delete vouchers" ON vouchers;
CREATE POLICY "Public insert vouchers" ON vouchers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update vouchers" ON vouchers FOR UPDATE USING (true);
CREATE POLICY "Public delete vouchers" ON vouchers FOR DELETE USING (true);

-- 7. Add public write policies for ORDERS (update/delete for admin status toggle)
DROP POLICY IF EXISTS "Public update orders" ON orders;
DROP POLICY IF EXISTS "Public delete orders" ON orders;
CREATE POLICY "Public update orders" ON orders FOR UPDATE USING (true);
CREATE POLICY "Public delete orders" ON orders FOR DELETE USING (true);

-- 8. Add public write policies for COURSE_MATERIALS
DROP POLICY IF EXISTS "Public insert course_materials" ON course_materials;
DROP POLICY IF EXISTS "Public update course_materials" ON course_materials;
DROP POLICY IF EXISTS "Public delete course_materials" ON course_materials;
CREATE POLICY "Public insert course_materials" ON course_materials FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update course_materials" ON course_materials FOR UPDATE USING (true);
CREATE POLICY "Public delete course_materials" ON course_materials FOR DELETE USING (true);

-- 9. Add public write policies for COURSE_ACCESS_EMAILS
DROP POLICY IF EXISTS "Public insert course_access_emails" ON course_access_emails;
DROP POLICY IF EXISTS "Public update course_access_emails" ON course_access_emails;
DROP POLICY IF EXISTS "Public delete course_access_emails" ON course_access_emails;
CREATE POLICY "Public insert course_access_emails" ON course_access_emails FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update course_access_emails" ON course_access_emails FOR UPDATE USING (true);
CREATE POLICY "Public delete course_access_emails" ON course_access_emails FOR DELETE USING (true);

-- 10. Add public insert for COURSE_ENROLLMENTS (registration flow)
DROP POLICY IF EXISTS "Public insert enrollments" ON course_enrollments;
CREATE POLICY "Public insert enrollments" ON course_enrollments FOR INSERT WITH CHECK (true);

-- Done! All admin operations should now work.
