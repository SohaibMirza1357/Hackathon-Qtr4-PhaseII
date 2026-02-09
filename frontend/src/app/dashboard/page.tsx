'use client';

/**
 * Dashboard page (T028-T039)
 *
 * Full task management UI: create, view, edit, toggle completion, and delete.
 * All data operations go through the FastAPI backend via apiFetch.
 */

import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/lib/auth-client';
import { apiFetch } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Task {
  id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Helper: clamp string length for validation feedback
// ---------------------------------------------------------------------------

function trimToMax(value: string, max: number): string {
  return value.slice(0, max);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  // ------ Session (for user_id in API URLs) ------
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // ------ Task list state ------
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ------ Create form state ------
  const [createTitle, setCreateTitle] = useState<string>('');
  const [createDescription, setCreateDescription] = useState<string>('');
  const [createSubmitting, setCreateSubmitting] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // ------ Edit state ------
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editSubmitting, setEditSubmitting] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);

  // ------ Optimistic toggle / delete in-progress tracking ------
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  // ---------------------------------------------------------------------------
  // Fetch tasks
  // ---------------------------------------------------------------------------

  const fetchTasks = useCallback(async () => {
    if (!userId) return;
    setLoadingTasks(true);
    setFetchError(null);
    try {
      const res = await apiFetch(`/api/${userId}/tasks`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFetchError(data?.detail || 'Failed to load tasks.');
        return;
      }
      const data: Task[] = await res.json();
      setTasks(data);
    } catch {
      setFetchError('Network error — could not reach the server.');
    } finally {
      setLoadingTasks(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // ---------------------------------------------------------------------------
  // Create task (T028, T030)
  // ---------------------------------------------------------------------------

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreateError(null);

    const title = createTitle.trim();
    if (!title) {
      setCreateError('Title is required.');
      return;
    }

    setCreateSubmitting(true);
    try {
      const res = await apiFetch(`/api/${userId}/tasks`, {
        method: 'POST',
        body: JSON.stringify({
          title,
          description: createDescription.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setCreateError(data?.detail || 'Failed to create task.');
        return;
      }

      const newTask: Task = await res.json();
      // Prepend so newest appears first (matches created_at DESC ordering)
      setTasks((prev) => [newTask, ...prev]);
      setCreateTitle('');
      setCreateDescription('');
    } catch {
      setCreateError('Network error — could not reach the server.');
    } finally {
      setCreateSubmitting(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Enter edit mode (T032)
  // ---------------------------------------------------------------------------

  function startEdit(task: Task) {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle('');
    setEditDescription('');
    setEditError(null);
  }

  // ---------------------------------------------------------------------------
  // Save edit (T033)
  // ---------------------------------------------------------------------------

  async function handleSaveEdit(id: string) {
    setEditError(null);

    const title = editTitle.trim();
    if (!title) {
      setEditError('Title is required.');
      return;
    }

    setEditSubmitting(true);
    try {
      const res = await apiFetch(`/api/${userId}/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title,
          description: editDescription.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setEditError(data?.detail || 'Failed to update task.');
        return;
      }

      const updated: Task = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      cancelEdit();
    } catch {
      setEditError('Network error — could not reach the server.');
    } finally {
      setEditSubmitting(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Toggle completion (T035, T036)
  // ---------------------------------------------------------------------------

  async function handleToggle(id: string) {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, is_completed: !t.is_completed } : t
      )
    );
    setTogglingIds((prev) => new Set(prev).add(id));

    try {
      const res = await apiFetch(`/api/${userId}/tasks/${id}/complete`, {
        method: 'PATCH',
      });

      if (!res.ok) {
        // Revert optimistic update on failure
        setTasks((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, is_completed: !t.is_completed } : t
          )
        );
        return;
      }

      const updated: Task = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch {
      // Revert on network error
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, is_completed: !t.is_completed } : t
        )
      );
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Delete task (T038, T039)
  // ---------------------------------------------------------------------------

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this task?'
    );
    if (!confirmed) return;

    setDeletingIds((prev) => new Set(prev).add(id));
    try {
      const res = await apiFetch(`/api/${userId}/tasks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
      }
    } catch {
      // Silently ignore network errors for delete — task remains in list
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 space-y-8">
      {/* ------------------------------------------------------------------ */}
      {/* Create Task Form                                                     */}
      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="create-task-heading">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2
            id="create-task-heading"
            className="text-lg font-semibold text-gray-900 mb-4"
          >
            Create New Task
          </h2>

          <form onSubmit={handleCreate} noValidate>
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label
                  htmlFor="create-title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Title <span aria-hidden="true">*</span>
                </label>
                <input
                  id="create-title"
                  type="text"
                  value={createTitle}
                  onChange={(e) =>
                    setCreateTitle(trimToMax(e.target.value, 200))
                  }
                  placeholder="What needs to be done?"
                  maxLength={200}
                  required
                  aria-required="true"
                  aria-describedby={
                    createError ? 'create-error' : undefined
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="create-description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description{' '}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  id="create-description"
                  value={createDescription}
                  onChange={(e) =>
                    setCreateDescription(trimToMax(e.target.value, 2000))
                  }
                  placeholder="Add more details…"
                  maxLength={2000}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                />
              </div>

              {/* Validation error */}
              {createError && (
                <p id="create-error" role="alert" className="text-red-600 text-sm">
                  {createError}
                </p>
              )}

              {/* Submit */}
              <div>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {createSubmitting ? 'Creating…' : 'Create Task'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Task List                                                            */}
      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="task-list-heading">
        <h2
          id="task-list-heading"
          className="text-lg font-semibold text-gray-900 mb-4"
        >
          Your Tasks
        </h2>

        {/* Loading skeleton */}
        {loadingTasks && (
          <div className="space-y-3" aria-busy="true" aria-label="Loading tasks">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Fetch error */}
        {!loadingTasks && fetchError && (
          <div role="alert" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-red-600 text-sm">{fetchError}</p>
            <button
              onClick={fetchTasks}
              className="mt-3 text-blue-600 text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loadingTasks && !fetchError && tasks.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <p className="text-gray-500 text-base">
              No tasks yet. Create your first task!
            </p>
          </div>
        )}

        {/* Task cards */}
        {!loadingTasks && !fetchError && tasks.length > 0 && (
          <ul role="list" className="space-y-3">
            {tasks.map((task) => (
              <li key={task.id}>
                <article
                  className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-opacity ${
                    task.is_completed ? 'opacity-60' : ''
                  }`}
                  aria-label={`Task: ${task.title}`}
                >
                  {editingId === task.id ? (
                    /* ---------------------------------------------------- */
                    /* Inline Edit Form                                       */
                    /* ---------------------------------------------------- */
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor={`edit-title-${task.id}`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Title <span aria-hidden="true">*</span>
                        </label>
                        <input
                          id={`edit-title-${task.id}`}
                          type="text"
                          value={editTitle}
                          onChange={(e) =>
                            setEditTitle(trimToMax(e.target.value, 200))
                          }
                          maxLength={200}
                          required
                          aria-required="true"
                          aria-describedby={
                            editError ? `edit-error-${task.id}` : undefined
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`edit-description-${task.id}`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Description{' '}
                          <span className="text-gray-400 font-normal">
                            (optional)
                          </span>
                        </label>
                        <textarea
                          id={`edit-description-${task.id}`}
                          value={editDescription}
                          onChange={(e) =>
                            setEditDescription(trimToMax(e.target.value, 2000))
                          }
                          maxLength={2000}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                        />
                      </div>

                      {editError && (
                        <p
                          id={`edit-error-${task.id}`}
                          role="alert"
                          className="text-red-600 text-sm"
                        >
                          {editError}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleSaveEdit(task.id)}
                          disabled={editSubmitting}
                          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-1.5 px-3 rounded-lg text-sm transition-colors"
                        >
                          {editSubmitting ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={editSubmitting}
                          className="border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium py-1.5 px-3 rounded-lg text-sm transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ---------------------------------------------------- */
                    /* Read-only view                                         */
                    /* ---------------------------------------------------- */
                    <div className="flex items-start gap-3">
                      {/* Completion checkbox */}
                      <div className="pt-0.5">
                        <input
                          type="checkbox"
                          id={`toggle-${task.id}`}
                          checked={task.is_completed}
                          onChange={() => handleToggle(task.id)}
                          disabled={togglingIds.has(task.id)}
                          aria-label={
                            task.is_completed
                              ? `Mark "${task.title}" as incomplete`
                              : `Mark "${task.title}" as complete`
                          }
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                        />
                      </div>

                      {/* Task content */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium text-gray-900 break-words ${
                            task.is_completed
                              ? 'line-through text-gray-400'
                              : ''
                          }`}
                        >
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="mt-1 text-sm text-gray-600 break-words">
                            {task.description}
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-shrink-0 flex-wrap gap-2">
                        <button
                          onClick={() => startEdit(task)}
                          className="border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-1.5 px-3 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          aria-label={`Edit task: ${task.title}`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          disabled={deletingIds.has(task.id)}
                          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-1.5 px-3 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          aria-label={`Delete task: ${task.title}`}
                        >
                          {deletingIds.has(task.id) ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
