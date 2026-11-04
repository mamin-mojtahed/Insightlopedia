export interface Figure {
  id: number;
  firstName: string;
  lastName: string;
}

export interface Quote {
  id: number;
  figure_id: number;
  text: string;
  tags: string[];
}

