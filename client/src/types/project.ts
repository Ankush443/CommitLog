export interface Project {
  _id: string;
  name: string;
  description?: string;
  color: ProjectColor;
  createdAt: string;
  updatedAt: string;
}

export type ProjectColor = 
  | 'blue' 
  | 'green' 
  | 'purple' 
  | 'orange' 
  | 'pink' 
  | 'teal' 
  | 'red' 
  | 'amber';

export interface ProjectFormData {
  name: string;
  description?: string;
  color?: ProjectColor;
}

export const PROJECT_COLORS: { value: ProjectColor; label: string; class: string }[] = [
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
  { value: 'teal', label: 'Teal', class: 'bg-teal-500' },
  { value: 'red', label: 'Red', class: 'bg-red-500' },
  { value: 'amber', label: 'Amber', class: 'bg-amber-500' },
];

export const getProjectColorClass = (color: ProjectColor): string => {
  const colorConfig = PROJECT_COLORS.find(c => c.value === color);
  return colorConfig?.class || 'bg-blue-500';
};
