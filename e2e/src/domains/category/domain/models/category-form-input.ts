export interface CategoryFormInput {
  id: string;
  name: string;
  icon: string;
  type: string;
  parentId?: string | null;
}
