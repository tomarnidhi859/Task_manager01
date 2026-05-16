import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';
import api from '../services/api';
import { FiCheckCircle, FiClock, FiAlertCircle, FiList } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    todo: 0,
    'in-progress': 0,
    done: 0,
    overdue: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/tasks/dashboard/stats');
        setStats(res.data.data);
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Tasks', value: stats.total, icon: <FiList size={24} />, color: 'var(--primary)', bg: 'var(--primary-light)' },
    { title: 'To Do', value: stats.todo, icon: <FiCheckCircle size={24} />, color: 'var(--text-secondary)', bg: 'var(--bg-tertiary)' },
    { title: 'In Progress', value: stats['in-progress'], icon: <FiClock size={24} />, color: 'var(--info)', bg: 'var(--info-bg)' },
    { title: 'Completed', value: stats.done, icon: <FiCheckCircle size={24} />, color: 'var(--success)', bg: 'var(--success-bg)' },
    { title: 'Overdue', value: stats.overdue, icon: <FiAlertCircle size={24} />, color: 'var(--danger)', bg: 'var(--danger-bg)' },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex-center" style={{ height: '50vh' }}>
          <div className="text-muted">Loading dashboard...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-fade-in">
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>Welcome back, {user?.name.split(' ')[0]}!</h1>
          <p className="text-secondary">Here's what's happening with your projects today.</p>
        </header>

        {/* Stats Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          {statCards.map((card, index) => (
            <div key={index} className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div className="text-secondary" style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                    {card.title}
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {card.value}
                  </div>
                </div>
                <div style={{ 
                  padding: '0.75rem', 
                  borderRadius: 'var(--radius-md)', 
                  backgroundColor: card.bg, 
                  color: card.color 
                }}>
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dashboard Content Area */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Recent Activity</h3>
            <div className="flex-center" style={{ height: '200px', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <p className="text-muted">Activity feed coming soon...</p>
            </div>
          </div>
          
          <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Upcoming Deadlines</h3>
            <div className="flex-center" style={{ height: '200px', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <p className="text-muted">No upcoming deadlines.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
