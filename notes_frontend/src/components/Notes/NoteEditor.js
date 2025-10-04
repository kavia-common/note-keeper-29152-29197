import React, { useEffect, useMemo, useState } from 'react';

/**
 * NoteEditor allows editing of a note's title and content.
 * Provides Save, Cancel, and Delete with basic validation and inline errors.
 * Router-agnostic: actions are raised through props.
 */
// PUBLIC_INTERFACE
export default function NoteEditor({
  note = null,
  onSave,
  onCancel,
  onDelete,
  validate = (data) => {
    const errs = {};
    if ((data.title || '').trim().length === 0 && (data.content || '').trim().length === 0) {
      errs.form = 'Please enter a title or some content.';
    }
    return errs;
  },
}) {
  /** Manage local form state */
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setTitle(note?.title || '');
    setContent(note?.content || '');
    setErrors({});
  }, [note?.id]);

  const times = useMemo(() => {
    if (!note) return null;
    const created = new Date(note.createdAt || Date.now());
    const updated = new Date(note.updatedAt || note.createdAt || Date.now());
    return {
      createdLabel: created.toLocaleString(),
      updatedLabel: updated.toLocaleString(),
    };
  }, [note]);

  if (!note) {
    return (
      <div className="card" role="status" aria-live="polite">
        <h3 style={{ marginTop: 0 }}>Nothing to edit</h3>
        <p className="text-muted">Select or create a note to edit.</p>
      </div>
    );
  }

  const handleSave = () => {
    const payload = { title, content };
    const nextErrors = validate ? validate(payload) : {};
    setErrors(nextErrors || {});
    if (nextErrors && Object.keys(nextErrors).length > 0) {
      return;
    }
    if (onSave) onSave(note.id, payload);
  };

  const handleDelete = () => {
    if (onDelete) onDelete(note.id);
  };

  return (
    <form
      className="card"
      role="form"
      aria-label="Edit note"
      onSubmit={(e) => {
        e.preventDefault();
        handleSave();
      }}
    >
      <div className="mb-2" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <label htmlFor="note-title" className="sr-only">Title</label>
        <input
          id="note-title"
          className="input focus-ring"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          aria-invalid={errors.title ? 'true' : 'false'}
          aria-describedby={errors.title ? 'title-error' : undefined}
        />
      </div>

      <div className="mb-2">
        <label htmlFor="note-content" className="sr-only">Content</label>
        <textarea
          id="note-content"
          className="textarea focus-ring"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note here..."
          rows={12}
          aria-invalid={errors.content ? 'true' : 'false'}
          aria-describedby={errors.content ? 'content-error' : undefined}
        />
      </div>

      {errors.form && (
        <div
          id="form-error"
          role="alert"
          style={{
            color: 'white',
            background: 'var(--color-error)',
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 'var(--space-2)',
          }}
        >
          {errors.form}
        </div>
      )}
      {errors.title && (
        <div id="title-error" role="alert" style={{ color: 'var(--color-error)', marginBottom: 'var(--space-2)' }}>
          {errors.title}
        </div>
      )}
      {errors.content && (
        <div id="content-error" role="alert" style={{ color: 'var(--color-error)', marginBottom: 'var(--space-2)' }}>
          {errors.content}
        </div>
      )}

      <div className="mb-2" style={{ color: 'var(--neutral-500)', fontSize: 'var(--text-sm)' }}>
        <span aria-label="Created at">Created: {times?.createdLabel}</span>
        <span style={{ margin: '0 0.5rem' }}>•</span>
        <span aria-label="Updated at">Updated: {times?.updatedLabel}</span>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button
          type="button"
          className="btn btn-error focus-ring"
          onClick={handleDelete}
          aria-label="Delete note"
          title="Delete"
        >
          🗑️ Delete
        </button>
        <button
          type="button"
          className="btn focus-ring"
          onClick={() => onCancel && onCancel(note.id)}
          aria-label="Cancel editing"
          title="Cancel"
          style={{ background: 'var(--neutral-600)' }}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn focus-ring"
          aria-label="Save note"
          title="Save"
          style={{ background: 'var(--color-primary)' }}
        >
          💾 Save
        </button>
      </div>
    </form>
  );
}
