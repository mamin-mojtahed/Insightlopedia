import React, { useState, useEffect, useRef } from 'react';
import { X, Plus } from 'lucide-react';
import { Figure } from '../types';

interface AddQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: { text: string; author: string; tags: string }) => Promise<void>;
  figures?: Figure[];
}

export const AddQuoteModal: React.FC<AddQuoteModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  figures = []
}) => {
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setText('');
      setAuthor('');
      setTags('');
      setError(null);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Please enter the quote text.');
      return;
    }
    if (!author.trim()) {
      setError('Please enter the author name.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onAdd({
        text: text.trim(),
        author: author.trim(),
        tags: tags.trim()
      });
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Failed to add quote.');
    }
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">
            Add New Quote
          </h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="modal-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="quote-text">Quote *</label>
            <textarea
              id="quote-text"
              ref={textareaRef}
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter timeless words or insight..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="quote-author">Author / Figure *</label>
            <input
              id="quote-author"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. Marcus Aurelius, Lao Tzu, Sadhguru..."
              list="figure-suggestions"
              required
            />
            {figures.length > 0 && (
              <datalist id="figure-suggestions">
                {figures.map((f) => {
                  const name = `${f.firstName} ${f.lastName}`.trim();
                  return <option key={f.id} value={name} />;
                })}
              </datalist>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="quote-tags">
              Topics / Tags <span className="label-hint">(optional)</span>
            </label>
            <input
              id="quote-tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. wisdom, stoicism, life"
            />
            <small className="field-help">
              Leave blank to automatically extract topics from the quote words.
            </small>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              <Plus size={16} />
              {isSubmitting ? 'Adding...' : 'Add Quote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddQuoteModal;
