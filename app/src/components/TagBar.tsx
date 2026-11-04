import React from 'react';

interface TagBarProps {
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export const TagBar: React.FC<TagBarProps> = ({ tags, selectedTag, onSelectTag }) => {
  return (
    <div className="tag-bar">
      <button
        type="button"
        className={`tag-button ${selectedTag === null ? 'selected' : ''}`}
        onClick={() => onSelectTag(null)}
      >
        ALL
      </button>
      {tags.map(tag => (
        <button
          key={tag}
          type="button"
          className={`tag-button ${selectedTag === tag ? 'selected' : ''}`}
          onClick={() => onSelectTag(selectedTag === tag ? null : tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
};

