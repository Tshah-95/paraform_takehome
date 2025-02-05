declare type Question = {
  required: boolean;
  private: boolean;
  label: string;
  name: string;
  type: string;
  values: any[];
  description?: string;
};

declare type Job = {
  id: number;
  name: string;
  status: "open" | "closed";
  opened_at: string;
  departments: string[];
  location: string;
  openings: number;
  employment_type?: string;
  content: string;
  questions: Question[];
  salary_details?: {
    min_value: number;
    max_value: number;
    unit: string;
  };
};
