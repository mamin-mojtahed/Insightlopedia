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
            <p>{tags.join(', ')}</p>
        </div>
    );
};

export { Quote };
