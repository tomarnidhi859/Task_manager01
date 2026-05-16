import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { FiPlus, FiFolder, FiUsers, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Projects = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.data);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/projects', newProject);
      setProjects([...projects, res.data.data]);
      setShowModal(false);
      setNewProject({ name: '', description: '' });
      toast.success('Project created successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create project');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex-center" style={{ height: '50vh' }}>Loading projects...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-fade-in">
        <header className="flex-between" style={{ marginBottom: '2rem' }}>
          <div>
            <h1 style={{ marginBottom: '0.5rem' }}>Projects</h1>
            <p className="text-secondary">Manage and view all your active projects.</p>
          </div>
          {user?.role === 'admin' && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <FiPlus /> New Project
            </button>
          )}
        </header>

        {projects.length === 0 ? (
          <div className="glass flex-center" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-full)' }}>
              <FiFolder size={32} />
            </div>
            <h3>No projects found</h3>
            <p className="text-secondary">You aren't a member of any projects yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {projects.map(project => (
              <Link to={`/projects/${project._id}`} key={project._id} className="glass" style={{ 
                padding: '1.5rem', 
                borderRadius: 'var(--radius-lg)', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div className="flex-between" style={{ marginBottom: '1rem' }}>
                  <div style={{ padding: '0.5rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-md)' }}>
                    <FiFolder />
                  </div>
                  <span className="badge badge-in-progress">{project.status}</span>
                </div>
                
                <h3 style={{ marginBottom: '0.5rem' }}>{project.name}</h3>
                <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '1.5rem', flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {project.description}
                </p>

                <div className="flex-between" style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <FiUsers /> {project.members?.length || 0} Members
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <FiClock /> {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="flex-center" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 100
        }}>
          <div className="glass animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label className="form-label" htmlFor="name">Project Name</label>
                <input
                  type="text"
                  id="name"
                  className="form-input"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label" htmlFor="description">Description</label>
                <textarea
                  id="description"
                  className="form-input"
                  rows="4"
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  required
                ></textarea>
              </div>
              <div className="flex-between">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Projects;
