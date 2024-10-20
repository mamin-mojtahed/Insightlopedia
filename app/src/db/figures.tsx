import React from 'react';

interface FigureProps {
    id: number;
    firstName: string;
    lastName: string;
}

const Figure: React.FC<FigureProps> = ({ id, firstName, lastName }) => {
    return (
        <div>
            <p>First Name: {firstName}</p>
            <p>Last Name: {lastName}</p>
        </div>
    );
};

export { Figure, type FigureProps };
