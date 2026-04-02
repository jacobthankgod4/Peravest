import { supabase } from '../lib/supabase';

export const propertyAdminService = {
  async deleteProperty(id: number, adminEmail: string) {
    const { data: property, error: fetchError } = await supabase
      .from('property')
      .select('Title')
      .eq('Id', id)
      .single();

    if (fetchError) throw fetchError;

    const { error } = await supabase
      .from('property')
      .delete()
      .eq('Id', id);

    if (error) throw error;

    await supabase.from('admin_audit_log').insert({
      admin_email: adminEmail,
      action: 'DELETE_PROPERTY',
      table_name: 'property',
      record_id: id.toString(),
      details: { property_id: id, title: property.Title }
    });
  },

  async togglePublish(id: number, status: 'active' | 'inactive', adminEmail: string) {
    const { data, error } = await supabase
      .from('property')
      .update({ Status: status })
      .eq('Id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('admin_audit_log').insert({
      admin_email: adminEmail,
      action: status === 'active' ? 'PUBLISH_PROPERTY' : 'UNPUBLISH_PROPERTY',
      table_name: 'property',
      record_id: id.toString(),
      details: { property_id: id, new_status: status }
    });

    return data;
  },

  async archiveProperty(id: number, adminEmail: string) {
    const { data, error } = await supabase
      .from('property')
      .update({ Status: 'archived' })
      .eq('Id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('admin_audit_log').insert({
      admin_email: adminEmail,
      action: 'ARCHIVE_PROPERTY',
      table_name: 'property',
      record_id: id.toString(),
      details: { property_id: id }
    });

    return data;
  },

  async duplicateProperty(id: number, adminEmail: string) {
    const { data: original, error: fetchError } = await supabase
      .from('property')
      .select('*')
      .eq('Id', id)
      .single();

    if (fetchError) throw fetchError;

    const { Id, created_at, ...propertyData } = original;

    const { data: newProperty, error } = await supabase
      .from('property')
      .insert({
        ...propertyData,
        Title: `${propertyData.Title} (Copy)`,
        Status: 'inactive'
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from('admin_audit_log').insert({
      admin_email: adminEmail,
      action: 'DUPLICATE_PROPERTY',
      table_name: 'property',
      record_id: newProperty.Id.toString(),
      details: { original_id: id, new_id: newProperty.Id }
    });

    return newProperty;
  },

  async updateStatus(id: number, status: string, adminEmail: string) {
    const { data, error } = await supabase
      .from('property')
      .update({ Status: status })
      .eq('Id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('admin_audit_log').insert({
      admin_email: adminEmail,
      action: 'UPDATE_PROPERTY_STATUS',
      table_name: 'property',
      record_id: id.toString(),
      details: { property_id: id, new_status: status }
    });

    return data;
  }
};
