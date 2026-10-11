import { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import TextArea from '../components/common/TextArea';
import Select from '../components/common/Select';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { projectApi } from '../services/projectService';
import { Project, ProjectFormData, PROJECT_COLORS, getProjectColorClass } from '../types/project';
import { getErrorMessage } from '../lib/api';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    color: 'blue',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectApi.getAll();
      setProjects(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setSubmitting(true);

    try {
      if (editingProject) {
        await projectApi.update(editingProject._id, formData);
      } else {
        await projectApi.create(formData);
      }
      
      await loadProjects();
      handleCloseForm();
    } catch (err) {
      const message = getErrorMessage(err);
      setFormErrors({ general: message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      color: project.color,
    });
    setShowForm(true);
  };

  const handleDelete = async (project: Project) => {
    if (!window.confirm(`Delete "${project.name}"? Associated logs will be preserved with project reference removed.`)) {
      return;
    }

    try {
      await projectApi.delete(project._id);
      await loadProjects();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProject(null);
    setFormData({ name: '', description: '', color: 'blue' });
    setFormErrors({});
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-8">Projects</h1>
        <Card>
          <LoadingSpinner />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))]">Projects</h1>
          <p className="text-[rgb(var(--text-secondary))] mt-2">Manage your projects</p>
        </div>
        <Button onClick={() => setShowForm(true)}>+ New Project</Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-4">
            {editingProject ? 'Edit Project' : 'New Project'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formErrors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {formErrors.general}
              </div>
            )}

            <Input
              label="Project Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My Project"
              required
              error={formErrors.name}
            />

            <TextArea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description..."
              rows={3}
            />

            <Select
              label="Color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value as any })}
              options={PROJECT_COLORS.map((c) => ({ value: c.value, label: c.label }))}
            />

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editingProject ? 'Update' : 'Create'}
              </Button>
              <Button type="button" variant="secondary" onClick={handleCloseForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {projects.length === 0 ? (
        <Card>
          <EmptyState
            title="No projects yet"
            description="Create your first project to organize your development logs."
            action={{
              label: 'Create Project',
              onClick: () => setShowForm(true),
            }}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project._id}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded ${getProjectColorClass(project.color)}`} />
                  <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">{project.name}</h3>
                </div>
              </div>
              
              {project.description && (
                <p className="text-[rgb(var(--text-secondary))] text-sm mb-4">{project.description}</p>
              )}

              <div className="flex gap-2 pt-3 border-t border-[rgb(var(--border-color))]">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleEdit(project)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(project)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
