import React, { useEffect, useState } from 'react';
import { useAdmin } from '../hooks/useAdmin';

const SubscribersManagement: React.FC = () => {
  const { subscribers, fetchSubscribers, deleteSubscriber } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSubscribers().finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Delete this subscriber?')) {
      await deleteSubscriber(id);
      fetchSubscribers();
    }
  };

  const filteredSubscribers = subscribers?.filter((sub: any) =>
    sub.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Loading...</div>;

  return (
    <div className="subscribers-management">
      <h1>Newsletter Subscribers</h1>
      <input
        type="search"
        placeholder="Search by email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <p>Total Subscribers: {subscribers?.length || 0}</p>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Subscribed Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredSubscribers?.map((sub: any) => (
            <tr key={sub.id}>
              <td>{sub.email}</td>
              <td>{new Date(sub.createdAt).toLocaleDateString()}</td>
              <td>
                <button onClick={() => handleDelete(sub.id)} className="btn-danger">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SubscribersManagement;
