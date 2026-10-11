import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { logApi } from '../services/logService';
import { projectApi } from '../services/projectService';
import { Log, LogFilters, PaginationData } from '../types/log';
import { Project } from '../types/project';
import { formatDate } from '../lib/dateUtils';
import { getProjectColorClass } from '../types/project';
import { getErrorMessage } from '../lib/api';

export default function LogsPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<Log[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  const [filters, setFilters] = useState<LogFilters>({
    search: '',
    projectId: '',
    from: '',
    to: '',
    page: 1,
    limit: 50,
  });

  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    loadLogs();
  }, [filters]);

  const loadProjects = async () => {
    try {
      const data = await projectApi.getAll();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const { logs: data, pagination: paginationData } = await logApi.getAll(filters);
      setLogs(data);
      setPagination(paginationData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters({ ...filters, search: searchInput, page: 1 });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setFilters({
      search: '',
      projectId: '',
      from: '',
      to: '',
      page: 1,
      limit: 50,
    });
  };

  const handleDelete = async (log: Log) => {
    if (!window.confirm(`Delete log "${log.title}"?`)) {
      return;
    }

    try {
      await logApi.delete(log._id);
      await loadLogs();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const projectOptions = [
    { value: '', label: 'All projects' },
    ...projects.map((p) => ({ value: p._id, label: p.name })),
  ];

  const hasActiveFilters = filters.search || filters.projectId || filters.from || filters.to;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))]">Logs</h1>
          <p className="text-[rgb(var(--text-secondary))] mt-2">All your development logs</p>
        </div>
        <Button onClick={() => navigate('/logs/new')}>+ New Log</Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <div className="flex gap-2">
              <Input
                placeholder="Search logs..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
              <Button onClick={handleSearch}>Search</Button>
            </div>
          </div>

          <Select
            value={filters.projectId || ''}
            onChange={(e) => setFilters({ ...filters, projectId: e.target.value, page: 1 })}
            options={projectOptions}
          />

          <div className="flex gap-2">
            <Input
              type="date"
              placeholder="From"
              value={filters.from || ''}
              onChange={(e) => setFilters({ ...filters, from: e.target.value, page: 1 })}
            />
            <Input
              type="date"
              placeholder="To"
              value={filters.to || ''}
              onChange={(e) => setFilters({ ...filters, to: e.target.value, page: 1 })}
            />
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-[rgb(var(--border-color))]">
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              Clear all filters
            </Button>
          </div>
        )}
      </Card>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <Card>
          <LoadingSpinner />
        </Card>
      ) : logs.length === 0 ? (
        <Card>
          <EmptyState
            title={hasActiveFilters ? 'No logs found' : 'No logs yet'}
            description={
              hasActiveFilters
                ? 'Try adjusting your filters or search terms.'
                : 'Create your first log to start tracking your development work.'
            }
            action={
              hasActiveFilters
                ? { label: 'Clear Filters', onClick: handleClearFilters }
                : { label: 'Create Log', onClick: () => navigate('/logs/new') }
            }
          />
        </Card>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {logs.map((log) => (
              <Card key={log._id} padding={false}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm text-[rgb(var(--text-secondary))]">{formatDate(log.date)}</span>
                        {log.projectId && typeof log.projectId === 'object' && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-[rgb(var(--bg-tertiary))] rounded text-xs font-medium">
                            <span
                              className={`w-2 h-2 rounded ${getProjectColorClass(log.projectId.color)}`}
                            />
                            {log.projectId.name}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-2">{log.title}</h3>
                      <p className="text-[rgb(var(--text-secondary))] whitespace-pre-wrap line-clamp-3">
                        {log.completed}
                      </p>
                    </div>
                  </div>

                  {(log.blockers || log.nextSteps || log.repositoryUrl || (log.tags && log.tags.length > 0)) && (
                    <div className="mt-4 pt-4 border-t border-[rgb(var(--border-color))] space-y-2">
                      {log.blockers && (
                        <div className="text-sm">
                          <span className="font-medium text-red-700">Blockers:</span>
                          <span className="text-[rgb(var(--text-secondary))] ml-2">{log.blockers.substring(0, 100)}...</span>
                        </div>
                      )}
                      {log.nextSteps && (
                        <div className="text-sm">
                          <span className="font-medium text-blue-700">Next:</span>
                          <span className="text-[rgb(var(--text-secondary))] ml-2">{log.nextSteps.substring(0, 100)}...</span>
                        </div>
                      )}
                      {log.tags && log.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {log.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="secondary" onClick={() => navigate(`/logs/edit/${log._id}`)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(log)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Card>
              <div className="flex items-center justify-between">
                <div className="text-sm text-[rgb(var(--text-secondary))]">
                  Showing {logs.length} of {pagination.total} logs
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={pagination.page === 1}
                    onClick={() => setFilters({ ...filters, page: pagination.page - 1 })}
                  >
                    Previous
                  </Button>
                  <span className="px-4 py-2 text-sm text-[rgb(var(--text-secondary))]">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => setFilters({ ...filters, page: pagination.page + 1 })}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
