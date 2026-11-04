import React from 'react';
import { Figure as FigureType } from '../types';

export type FigureProps = FigureType;

export const Figure: React.FC<FigureProps> = ({ firstName, lastName }) => {
  return (
    <div>
      <p>First Name: {firstName}</p>
      <p>Last Name: {lastName}</p>
    </div>
  );
};

export default Figure;
