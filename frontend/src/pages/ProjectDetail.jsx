import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { FiPlus, FiMoreVertical, FiClock, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New Task Modal State
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', assignee: '' });
  
  // Add Member Modal State
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');

  useEffect(() => {
    fetchProjectAndTasks();
  }, [id]);

  const fetchProjectAndTasks = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/tasks`)
      ]);
      setProject(projectRes.data.data);
      setTasks(tasksRes.data.data);
    } catch (err) {
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/projects/${id}/tasks`, newTask);
      setTasks([...tasks, res.data.data]);
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', priority: 'medium', assignee: '' });
      toast.success('Task created successfully!');
      
      // Refresh tasks to get populated fields
      const tasksRes = await api.get(`/projects/${id}/tasks`);
      setTasks(tasksRes.data.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/members`, { email: newMemberEmail });
      toast.success('Member added successfully!');
      setShowMemberModal(false);
      setNewMemberEmail('');
      
      // Refresh project to get new member
      const projectRes = await api.get(`/projects/${id}`);
      setProject(projectRes.data.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add member');
    }
  };

  if (loading) {
    return <Layout><div className="flex-center" style={{ height: '50vh' }}>Loading...</div></Layout>;
  }

  if (!project) {
    return <Layout><div className="flex-center" style={{ height: '50vh' }}>Project not found</div></Layout>;
  }

  const columns = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'done', title: 'Done' }
  ];

  return (
    <Layout>
      <div className="animate-fade-in">
        <header className="flex-between" style={{ marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <h1 style={{ margin: 0 }}>{project.name}</h1>
              <span className={`badge badge-${project.status === 'active' ? 'in-progress' : 'todo'}`}>{project.status}</span>
            </div>
            <p className="text-secondary" style={{ maxWidth: '600px' }}>{project.description}</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {project.members.slice(0, 3).map((member, i) => (
                <img 
                  key={member._id}
                  src={member.avatar || `https://ui-avatars.com/api/?name=${member.name}&background=random`} 
                  alt={member.name}
                  title={member.name}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--bg-main)', marginLeft: i > 0 ? '-12px' : 0 }}
                />
              ))}
              {project.members.length > 3 && (
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--bg-main)', marginLeft: '-12px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  +{project.members.length - 3}
                </div>
              )}
            </div>
            {(user?.role === 'admin' || project.owner._id === user?._id) && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-secondary" onClick={() => setShowMemberModal(true)}>
                  <FiUsers /> Add Member
                </button>
                <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
                  <FiPlus /> Add Task
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Kanban Board */}
        <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
          {columns.map(col => {
            const columnTasks = tasks.filter(t => t.status === col.id);
            
            return (
              <div key={col.id} className="glass" style={{ minWidth: '320px', flex: 1, padding: '1rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column' }}>
                <div className="flex-between" style={{ marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {col.title} <span style={{ fontSize: '0.8rem', padding: '0.1rem 0.5rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', color: 'var(--text-muted)' }}>{columnTasks.length}</span>
                  </h3>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flexGrow: 1 }}>
                  {columnTasks.length === 0 ? (
                    <div className="flex-center" style={{ padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      No tasks
                    </div>
                  ) : (
                    columnTasks.map(task => (
                      <div key={task._id} style={{ 
                        padding: '1rem', 
                        backgroundColor: 'var(--bg-secondary)', 
                        borderRadius: 'var(--radius-md)', 
                        border: '1px solid var(--border-color)',
                        borderLeft: `3px solid var(--${task.priority === 'urgent' ? 'danger' : task.priority === 'high' ? 'warning' : task.priority === 'low' ? 'success' : 'info'})`
                      }}>
                        <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                          <span className={`badge badge-${task.priority}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>{task.priority}</span>
                          
                          {/* Quick Status Change */}
                          <select 
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '0.75rem', outline: 'none', cursor: 'pointer' }}
                            value={task.status}
                            onChange={(e) => handleStatusChange(task._id, e.target.value)}
                          >
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="done">Done</option>
                          </select>
                        </div>
                        
                        <h4 style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>{task.title}</h4>
                        
                        <div className="flex-between" style={{ marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {task.assignee ? (
                              <img src={task.assignee.avatar} alt={task.assignee.name} title={task.assignee.name} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                            ) : (
                              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}>Un</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="flex-center" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 100
        }}>
          <div className="glass animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Create New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input type="text" className="form-input" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows="3" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} required></textarea>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">Priority</label>
                  <select className="form-input" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">Assignee</label>
                  <select className="form-input" value={newTask.assignee} onChange={e => setNewTask({...newTask, assignee: e.target.value})}>
                    <option value="">Unassigned</option>
                    {project.members.map(m => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex-between">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="flex-center" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 100
        }}>
          <div className="glass animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Add Team Member</h2>
            <form onSubmit={handleAddMember}>
              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label">User Email</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="user@example.com"
                  value={newMemberEmail} 
                  onChange={e => setNewMemberEmail(e.target.value)} 
                  required 
                />
              </div>
              <div className="flex-between">
                <button type="button" className="btn btn-secondary" onClick={() => setShowMemberModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ProjectDetail;
