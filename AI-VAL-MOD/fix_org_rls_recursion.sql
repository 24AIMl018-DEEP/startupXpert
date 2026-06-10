-- ============================================================
-- Fix: org_members + organizations RLS infinite recursion
-- Run this in Supabase SQL Editor
-- ============================================================

-- Step 1: Drop all existing broken policies
DROP POLICY IF EXISTS "org_read"      ON organizations;
DROP POLICY IF EXISTS "org_insert"    ON organizations;
DROP POLICY IF EXISTS "org_update"    ON organizations;
DROP POLICY IF EXISTS "member_read"   ON org_members;
DROP POLICY IF EXISTS "member_insert" ON org_members;
DROP POLICY IF EXISTS "member_update" ON org_members;

-- Step 2: Create a SECURITY DEFINER function that checks membership
-- without triggering RLS (bypasses the policy check on org_members itself)
CREATE OR REPLACE FUNCTION is_org_member(p_org_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM org_members
    WHERE org_id = p_org_id AND user_id = p_user_id
  );
$$;

CREATE OR REPLACE FUNCTION is_org_admin(p_org_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM org_members
    WHERE org_id = p_org_id AND user_id = p_user_id
      AND role IN ('founder', 'admin')
  );
$$;

CREATE OR REPLACE FUNCTION get_user_org_ids(p_user_id uuid)
RETURNS uuid[]
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT ARRAY(
    SELECT org_id FROM org_members WHERE user_id = p_user_id
  );
$$;

-- Step 3: Re-create organizations policies (anyone can read organizations to validate invite codes during sign up)
CREATE POLICY "org_read" ON organizations FOR SELECT
  USING (true);

CREATE POLICY "org_insert" ON organizations FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "org_update" ON organizations FOR UPDATE
  USING (
    created_by = auth.uid()
    OR is_org_admin(id, auth.uid())
  );

-- Step 4: Re-create org_members policies (NO self-reference — use the functions)
-- SELECT: you can see your own row, or any row in orgs you belong to
CREATE POLICY "member_read" ON org_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR org_id = ANY(get_user_org_ids(auth.uid()))
  );

-- INSERT: founder/admin can add others; anyone can self-join via invite
-- We avoid querying org_members by checking organizations.created_by instead
CREATE POLICY "member_insert" ON org_members FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM organizations
      WHERE id = org_members.org_id
        AND (
          created_by = auth.uid()
          OR is_org_admin(org_members.org_id, auth.uid())
        )
    )
  );

-- UPDATE: own row or founder/admin
CREATE POLICY "member_update" ON org_members FOR UPDATE
  USING (
    user_id = auth.uid()
    OR is_org_admin(org_id, auth.uid())
  );

-- Step 5: Also allow org_members DELETE by founder/admin (optional but useful)
DROP POLICY IF EXISTS "member_delete" ON org_members;
CREATE POLICY "member_delete" ON org_members FOR DELETE
  USING (
    user_id = auth.uid()
    OR is_org_admin(org_id, auth.uid())
  );
