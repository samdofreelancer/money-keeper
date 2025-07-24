export interface Category {
  id: string;
  name: string;
  icon: string;
  type: string;
  parentId?: string | null;
}
