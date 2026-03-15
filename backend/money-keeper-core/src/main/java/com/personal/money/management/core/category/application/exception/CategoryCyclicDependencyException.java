package com.personal.money.management.core.category.application.exception;

public class CategoryCyclicDependencyException extends RuntimeException {
    public CategoryCyclicDependencyException(String message) {
        super(message);
    }
}
