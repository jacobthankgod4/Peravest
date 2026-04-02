import React, { useState, useEffect } from 'react';
import { blogAdminService } from '../../services/blogService';
import Swal from 'sweetalert2';

const BlogManagement: React.FC = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image_url: '',
    author_name: 'PeraVest Team',
    author_email: ''
  });

  useEffect(() => {
    loadBlogs();
  }, [statusFilter]);

  const loadBlogs = async () => {
    try {
      console.log('Loading blogs with filter:', statusFilter);
      const filters = statusFilter !== 'all' ? { status: statusFilter } : undefined;
      console.log('Calling blogAdminService.getBlogs with filters:', filters);
      const data = await blogAdminService.getBlogs(filters);
      console.log('Blog data received:', data);
      setBlogs(data);
    } catch (error) {
      console.error('Failed to load blogs:', error);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      // For now, create local URL for preview
      const localUrl = URL.createObjectURL(file);
      setFormData({ ...formData, image_url: localUrl });
      Swal.fire('Info', 'Image preview set', 'info');
    } catch (error) {
      Swal.fire('Error', 'Failed to process image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const handleTitleChange = (title: string) => {
    setFormData({ ...formData, title, slug: generateSlug(title) });
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      Swal.fire('Warning', 'Title and content are required', 'warning');
      return;
    }

    try {
      if (editingBlog) {
        await blogAdminService.updateBlog(editingBlog.id, formData);
        Swal.fire('Success!', 'Blog updated', 'success');
      } else {
        await blogAdminService.createBlog(formData);
        Swal.fire('Success!', 'Blog created', 'success');
      }
      resetForm();
      loadBlogs();
    } catch (error) {
      Swal.fire('Error', 'Failed to save blog', 'error');
    }
  };

  const handleEdit = (blog: any) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt || '',
      content: blog.content,
      image_url: blog.image_url || '',
      author_name: blog.author_name,
      author_email: blog.author_email || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Delete blog?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      confirmButtonColor: '#dc3545'
    });

    if (result.isConfirmed) {
      try {
        await blogAdminService.deleteBlog(id);
        Swal.fire('Deleted!', 'Blog deleted', 'success');
        loadBlogs();
      } catch (error) {
        Swal.fire('Error', 'Failed to delete blog', 'error');
      }
    }
  };

  const handlePublish = async (id: number, currentStatus: string) => {
    try {
      if (currentStatus === 'published') {
        await blogAdminService.unpublishBlog(id);
        Swal.fire('Success!', 'Blog unpublished', 'success');
      } else {
        await blogAdminService.publishBlog(id);
        Swal.fire('Success!', 'Blog published', 'success');
      }
      loadBlogs();
    } catch (error) {
      Swal.fire('Error', 'Failed to update status', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      image_url: '',
      author_name: 'PeraVest Team',
      author_email: ''
    });
    setEditingBlog(null);
    setShowForm(false);
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Blog Management</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ maxWidth: '150px' }}>
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <button className="theme-btn" onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}>
            {showForm ? 'Cancel' : '+ New Blog'}
          </button>
        </div>
      </div>

      {showForm && (
        <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '10px', marginBottom: '2rem' }}>
          <h5 style={{ marginBottom: '1rem' }}>{editingBlog ? 'Edit Blog' : 'Create Blog'}</h5>
          
          <div style={{ marginBottom: '1rem' }}>
            <label>Title *</label>
            <input type="text" className="form-control" value={formData.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Blog title" />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Slug (URL)</label>
            <input type="text" className="form-control" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="blog-url-slug" />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Excerpt</label>
            <textarea className="form-control" rows={2} value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} placeholder="Short description" />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Content *</label>
            <textarea className="form-control" rows={8} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} placeholder="Blog content" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label>Image</label>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                style={{
                  border: `2px dashed ${dragActive ? '#09c398' : '#dee2e6'}`,
                  borderRadius: '8px',
                  padding: '1rem',
                  textAlign: 'center',
                  background: dragActive ? '#f0fdf4' : '#f8f9fa',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onClick={() => document.getElementById('imageInput')?.click()}
              >
                {uploading ? (
                  <div>Uploading...</div>
                ) : formData.image_url ? (
                  <div>
                    <img src={formData.image_url} alt="Preview" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '4px', marginBottom: '0.5rem' }} />
                    <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>Click or drag to change</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>Drag & drop image or click to select</div>
                  </div>
                )}
                <input
                  id="imageInput"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </div>
              <small style={{ color: '#6c757d', display: 'block', marginTop: '0.5rem' }}>Or enter URL below</small>
              <input
                type="text"
                className="form-control"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="/assets/img/blog/image.jpg"
                style={{ marginTop: '0.5rem' }}
              />
            </div>
            <div>
              <label>Author Name</label>
              <input type="text" className="form-control" value={formData.author_name} onChange={(e) => setFormData({ ...formData, author_name: e.target.value })} />
            </div>
          </div>

          <button className="theme-btn" onClick={handleSave}>
            {editingBlog ? 'Update Blog' : 'Create Blog'}
          </button>
        </div>
      )}

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Status</th>
              <th>Published</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map(blog => (
              <tr key={blog.id}>
                <td style={{ fontWeight: 600 }}>{blog.title}</td>
                <td>{blog.author_name}</td>
                <td>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: blog.status === 'published' ? '#28a745' : blog.status === 'draft' ? '#ffc107' : '#6c757d',
                    color: '#fff'
                  }}>
                    {blog.status}
                  </span>
                </td>
                <td>{blog.published_at ? new Date(blog.published_at).toLocaleDateString() : '-'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="theme-btn" onClick={() => handleEdit(blog)} style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>
                      Edit
                    </button>
                    <button className="theme-btn" onClick={() => handlePublish(blog.id, blog.status)} style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', background: blog.status === 'published' ? '#6c757d' : '#28a745' }}>
                      {blog.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>
                    <button className="theme-btn" onClick={() => handleDelete(blog.id)} style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', background: '#dc3545' }}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {blogs.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#757f95' }}>
          <p>No blogs found. {statusFilter !== 'all' ? `No ${statusFilter} blogs.` : 'Create your first blog post!'}</p>
          <small>Check browser console for debugging info.</small>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;
