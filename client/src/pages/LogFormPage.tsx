import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import TextArea from '../components/common/TextArea';
import Select from '../components/common/Select';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { logApi } from '../services/logService';
import { projectApi } from '../services/projectService';
import { LogFormData } from '../types/log';
import { Project } from '../types/project';
import { getTodayString } from '../lib/dateUtils';
import { getErrorMessage } from '../lib/api';

export default function LogFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState<LogFormData>({
    date: getTodayString(),
    title: '',
    completed: '',
    blockers: '',
    nextSteps: '',
    projectId: '',
    repositoryUrl: '',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProjects();
    if (isEditing && id) {
      loadLog(id);
    }
  }, [id, isEditing]);

  const loadProjects = async () => {
    try {
      const data = await projectApi.getAll();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  const loadLog = async (logId: string) => {
    try {
      setLoading(true);
      const log = await logApi.getById(logId);
      setFormData({
        date: log.date,
        title: log.title,
        completed: log.completed,
        blockers: log.blockers || '',
        nextSteps: log.nextSteps || '',
        projectId: log.projectId && typeof log.projectId === 'object' ? log.projectId._id : log.projectId || '',
        repositoryUrl: log.repositoryUrl || '',
        tags: log.tags || [],
      });
    } catch (err) {
      setFormErrors({ general: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setSubmitting(true);

    try {
      const submitData = {
        ...formData,
        projectId: formData.projectId || null,
      };

      if (isEditing && id) {
        await logApi.update(id, submitData);
      } else {
        await logApi.create(submitData);
      }

      navigate('/logs');
    } catch (err) {
      const message = getErrorMessage(err);
      setFormErrors({ general: message });
      setSubmitting(false);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags?.includes(tag) && (formData.tags?.length || 0) < 10) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tag],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((tag) => tag !== tagToRemove),
    });
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-8">
          {isEditing ? 'Edit Log' : 'New Log'}
        </h1>
        <Card>
          <LoadingSpinner />
        </Card>
      </div>
    );
  }

  const projectOptions = [
    { value: '', label: 'No project' },
    ...projects.map((p) => ({ value: p._id, label: p.name })),
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))]">
          {isEditing ? 'Edit Log' : 'New Log'}
        </h1>
        <p className="text-[rgb(var(--text-secondary))] mt-2">Record your daily development work</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {formErrors.general && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {formErrors.general}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="min-w-0">
              <Input
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                error={formErrors.date}
              />
            </div>

            <div className="min-w-0">
              <Select
                label="Project"
                value={formData.projectId || ''}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                options={projectOptions}
              />
            </div>
          </div>

          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="What did you work on?"
            required
            error={formErrors.title}
            helperText="3-100 characters"
          />

          <TextArea
            label="Completed Work"
            value={formData.completed}
            onChange={(e) => setFormData({ ...formData, completed: e.target.value })}
            placeholder="Describe what you accomplished today..."
            required
            rows={5}
            error={formErrors.completed}
            helperText="What tasks did you complete? What features did you implement?"
          />

          <TextArea
            label="Blockers"
            value={formData.blockers}
            onChange={(e) => setFormData({ ...formData, blockers: e.target.value })}
            placeholder="Any obstacles or issues? (optional)"
            rows={3}
          />

          <TextArea
            label="Next Steps"
            value={formData.nextSteps}
            onChange={(e) => setFormData({ ...formData, nextSteps: e.target.value })}
            placeholder="What's coming up next? (optional)"
            rows={3}
          />

          <Input
            label="Repository URL"
            type="url"
            value={formData.repositoryUrl}
            onChange={(e) => setFormData({ ...formData, repositoryUrl: e.target.value })}
            placeholder="https://github.com/user/repo"
            helperText="Optional: link to relevant repository"
          />

          <div>
            <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-2">
              Tags (optional)
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add a tag"
              />
              <Button type="button" onClick={handleAddTag} variant="secondary">
                Add
              </Button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-primary-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-[rgb(var(--border-color))]">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : isEditing ? 'Update Log' : 'Create Log'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/logs')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}