import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { FiCheckSquare, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Tasks = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    try {
      // Find all projects the user is part of
      const projectsRes = await api.get('/projects');
      const projects = projectsRes.data.data;
      
      let allTasks = [];
      // Fetch tasks for each project and filter those assigned to the user
      for (const project of projects) {
        const tasksRes = await api.get(`/projects/${project._id}/tasks`);
        const myTasksInProject = tasksRes.data.data.filter(t => t.assignee?._id === user?._id);
        
        // Add project name to each task for display purposes
        const tasksWithProject = myTasksInProject.map(t => ({ ...t, projectName: project.name }));
        allTasks = [...allTasks, ...tasksWithProject];
      }
      
      setTasks(allTasks);
    } catch (err) {
      toast.error('Failed to load your tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      toast.success('Status updated');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return <Layout><div className="flex-center" style={{ height: '50vh' }}>Loading...</div></Layout>;
  }

  return (
    <Layout>
      <div className="animate-fade-in">
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>My Tasks</h1>
          <p className="text-secondary">View all tasks currently assigned to you.</p>
        </header>

        {tasks.length === 0 ? (
          <div className="glass flex-center" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--success-bg)', color: 'var(--success)', borderRadius: 'var(--radius-full)' }}>
              <FiCheckSquare size={32} />
            </div>
            <h3>All caught up!</h3>
            <p className="text-secondary">You don't have any tasks assigned to you right now.</p>
          </div>
        ) : (
          <div className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Task Name</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Project</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Priority</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: '500' }}>{task.title}</div>
                      <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <FiClock /> {new Date(task.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      <Link to={`/projects/${task.project}`} style={{ color: 'var(--primary)' }}>
                        {task.projectName}
                      </Link>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <select 
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Tasks;
