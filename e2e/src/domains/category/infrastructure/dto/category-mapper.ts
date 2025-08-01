import { Category } from "../../domain/models/category";
import { CategoryFormInput } from "./category-form-input";

export function toDomain(dto: CategoryFormInput): Category {
  return {
    id: dto.id,
    name: dto.name,
    icon: dto.icon,
    type: dto.type,
    parentId: dto.parentId ?? null,
  };
}

export function toDto(domain: Category): CategoryFormInput {
  return {
    id: domain.id,
    name: domain.name,
    icon: domain.icon,
    type: domain.type,
    parentId: domain.parentId ?? null,
  };
}
