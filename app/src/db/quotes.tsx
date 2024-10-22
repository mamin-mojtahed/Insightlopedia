import React from 'react';

interface QuoteProps {
    id: number;
    figure_id: number;
    text: string;
    tags: string[];
}

const Quote: React.FC<QuoteProps> = ({ id, figure_id, text, tags }) => {
    return (
        <div className="quote">
            <p><strong>{text}</strong></p>
            <div className="tags">
                {tags.map(tag => (
                    <button
                        key={tag}
                        className="tag-button"
                        style={{ fontFamily: 'inherit', fontSize: 'inherit' }}
                        onClick={() => {
                            const event = new CustomEvent('tagSelected', { detail: tag });
                            window.dispatchEvent(event);
                        }}
                    >
                        {tag}
                    </button>
                ))}
            </div>
        </div>
    );
};

export { Quote, type QuoteProps };
