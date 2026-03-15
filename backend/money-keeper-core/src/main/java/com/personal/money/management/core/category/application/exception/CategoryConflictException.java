package com.personal.money.management.core.category.application.exception;

public class CategoryConflictException extends RuntimeException {
    public CategoryConflictException(String message) {
        super(message);
    }

    public CategoryConflictException(String message, Throwable cause) {
        super(message, cause);
    }
}
