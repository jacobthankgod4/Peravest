import { supabase } from '../lib/supabase';

export const blogAdminService = {
  async getBlogs(filters?: { status?: string }) {
    let query = supabase.from('blogs').select('*').order('created_at', { ascending: false });
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getBlogById(id: number) {
    const { data, error } = await supabase.from('blogs').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async createBlog(blogData: any) {
    const { data, error } = await supabase.from('blogs').insert([{
      ...blogData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'draft'
    }]).select().single();
    if (error) throw error;
    return data;
  },

  async updateBlog(id: number, blogData: any) {
    const { data, error } = await supabase.from('blogs').update({
      ...blogData,
      updated_at: new Date().toISOString()
    }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteBlog(id: number) {
    const { error } = await supabase.from('blogs').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  async publishBlog(id: number) {
    const { data, error } = await supabase.from('blogs').update({
      status: 'published',
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async unpublishBlog(id: number) {
    const { data, error } = await supabase.from('blogs').update({
      status: 'draft',
      updated_at: new Date().toISOString()
    }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
};

export const blogPublicService = {
  async getPublishedBlogs(limit?: number) {
    let query = supabase.from('blogs').select('*').eq('status', 'published').order('published_at', { ascending: false });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getBlogBySlug(slug: string) {
    const { data, error } = await supabase.from('blogs').select('*').eq('slug', slug).eq('status', 'published').single();
    if (error) throw error;
    return data;
  }
};
