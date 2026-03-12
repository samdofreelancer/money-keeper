package com.personal.money.management.service.category.application.exception;

public class CategoryCyclicDependencyException extends RuntimeException {
    public CategoryCyclicDependencyException(String message) {
        super(message);
    }
}
