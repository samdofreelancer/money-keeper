package com.personal.money.management.service.category.application.exception;

public class CategoryHasChildException extends RuntimeException {
    public CategoryHasChildException(Long categoryId) {
        super("Cannot delete category with child categories. Category id: " + categoryId);
    }
}
