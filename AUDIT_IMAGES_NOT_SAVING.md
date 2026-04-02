# Industry-Standard Audit: Multiple Images Not Saving

## Issue Summary
Multiple images uploaded in AddProperty/EditProperty but only first image (or no images) saved to property_image table.

---

## Root Cause Analysis

### Issue 1: insertPropertyImages() Called But May Fail Silently ⚠️ CRITICAL
**Location**: propertyService.ts, create() method, line ~95

**Problem**:
```typescript
if (imageUrls.length > 0) {
  await insertPropertyImages(data.Id, imageUrls);
}
```

**Issues**:
- No error handling if insertPropertyImages() fails
- Error thrown but not caught
- Property created successfully even if images fail to save
- No logging to debug failures

**Impact**: Images fail to insert but user sees success message

---

### Issue 2: property_image Table Insert May Have RLS Issues ⚠️ CRITICAL
**Location**: Database - property_image table

**Problem**:
- property_image table has RLS enabled
- RLS policies may block INSERT operations
- No policy allows authenticated users to insert images

**Current RLS Policy**:
```sql
CREATE POLICY "Property owners can manage images" ON public.property_image
  FOR ALL USING (true);
```

**Issue**: Policy uses USING (true) but no WITH CHECK clause for INSERT

**Impact**: INSERT operations blocked by RLS

---

### Issue 3: insertPropertyImages() Function Not Awaiting Properly ⚠️ HIGH
**Location**: propertyService.ts, insertPropertyImages() function

**Problem**:
```typescript
const insertPropertyImages = async (propertyId: number, imageUrls: string[]): Promise<void> => {
  const images = imageUrls.map((url, idx) => ({ Property_Id: propertyId, Image_Url: url, Display_Order: idx }));
  const { error } = await supabase.from('property_image').insert(images);
  if (error) throw new Error(`Failed to save images: ${error.message}`);
};
```

**Issues**:
- Function defined outside propertyService object
- May not have proper scope/context
- Error thrown but not caught in create()

**Impact**: Errors not propagated to UI

---

### Issue 4: No Error Handling in create() Method ⚠️ HIGH
**Location**: propertyService.ts, create() method

**Problem**:
```typescript
if (imageUrls.length > 0) {
  await insertPropertyImages(data.Id, imageUrls);
}
```

**Missing**:
- Try-catch around insertPropertyImages()
- Error logging
- User notification

**Impact**: Silent failures, user unaware images didn't save

---

### Issue 5: uploadImages() May Fail on First Error ⚠️ HIGH
**Location**: propertyService.ts, uploadImages() function

**Problem**:
```typescript
const uploadImages = async (files: File[]): Promise<string[]> => {
  const urls: string[] = [];
  for (const file of files) {
    const fileName = `${Date.now()}-${Math.random()}-${file.name}`;
    const { data, error } = await supabase.storage.from('property-images').upload(fileName, file, { upsert: false });
    if (error) throw new Error(`Image upload failed: ${error.message}`);
    const { data: urlData } = supabase.storage.from('property-images').getPublicUrl(data.path);
    if (urlData?.publicUrl) urls.push(urlData.publicUrl);
  }
  return urls;
};
```

**Issues**:
- If one file fails, entire upload stops
- No partial success handling
- Throws error immediately

**Impact**: If 1 of 5 images fails, all 5 fail

---

### Issue 6: getPublicUrl() May Return Undefined ⚠️ MEDIUM
**Location**: propertyService.ts, uploadImages() function

**Problem**:
```typescript
const { data: urlData } = supabase.storage.from('property-images').getPublicUrl(data.path);
if (urlData?.publicUrl) urls.push(urlData.publicUrl);
```

**Issues**:
- getPublicUrl() may not return publicUrl
- Silent skip if URL undefined
- No error thrown

**Impact**: Some images uploaded but URLs not captured

---

### Issue 7: RLS Policy Missing WITH CHECK Clause ⚠️ CRITICAL
**Location**: Database - property_image RLS policy

**Current Policy**:
```sql
CREATE POLICY "Property owners can manage images" ON public.property_image
  FOR ALL USING (true);
```

**Problem**:
- USING clause only applies to SELECT/UPDATE/DELETE
- INSERT requires WITH CHECK clause
- No WITH CHECK defined

**Fix Required**:
```sql
CREATE POLICY "Property owners can manage images" ON public.property_image
  FOR ALL USING (true) WITH CHECK (true);
```

**Impact**: INSERT operations blocked

---

### Issue 8: No Validation of Image URLs Before Insert ⚠️ MEDIUM
**Location**: propertyService.ts, insertPropertyImages() function

**Problem**:
- No check if imageUrls array is empty
- No check if URLs are valid
- No check if Property_Id exists

**Impact**: Invalid data inserted or insert fails silently

---

### Issue 9: Supabase Storage Bucket May Not Be Public ⚠️ HIGH
**Location**: Supabase - property-images bucket

**Problem**:
- Bucket may not be public
- getPublicUrl() returns URL but access denied
- Images uploaded but not accessible

**Impact**: URLs saved but images not viewable

---

### Issue 10: No Logging for Debugging ⚠️ MEDIUM
**Location**: propertyService.ts

**Problem**:
- uploadImages() has no console.log
- insertPropertyImages() has no console.log
- No way to debug failures

**Impact**: Silent failures, impossible to troubleshoot

---

## Detailed Issue Breakdown

### AddProperty.tsx Issues:
1. Passes imageFiles array to create()
2. No error handling if create() fails
3. No logging of upload progress

### EditProperty.tsx Issues:
1. Same as AddProperty
2. Doesn't handle image removal properly
3. No validation before upload

### propertyService.ts Issues:
1. uploadImages() not part of propertyService object
2. insertPropertyImages() not part of propertyService object
3. No error handling in create()
4. No error handling in update()
5. No logging
6. No validation

### Database Issues:
1. RLS policy missing WITH CHECK clause
2. property_image table may have RLS blocking inserts
3. property-images bucket may not be public

---

## Solution Priority

### CRITICAL (Must Fix):
1. Fix RLS policy - add WITH CHECK clause
2. Add error handling in create() around insertPropertyImages()
3. Add error handling in update() around insertPropertyImages()
4. Add logging to uploadImages()
5. Add logging to insertPropertyImages()

### HIGH (Should Fix):
6. Make uploadImages() part of propertyService
7. Make insertPropertyImages() part of propertyService
8. Add validation in insertPropertyImages()
9. Verify property-images bucket is public
10. Add try-catch in uploadImages() for partial success

### MEDIUM (Nice to Have):
11. Add progress tracking
12. Add image compression
13. Add retry logic

---

## Verdict

**Root Cause**: RLS policy missing WITH CHECK clause + no error handling = silent failures

**Severity**: CRITICAL - Images not persisting to database

**Fix Complexity**: LOW - Simple RLS fix + error handling

**Estimated Time**: 15-20 minutes

