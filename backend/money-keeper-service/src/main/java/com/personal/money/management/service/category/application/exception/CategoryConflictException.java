package com.personal.money.management.service.category.application.exception;

public class CategoryConflictException extends RuntimeException {
    public CategoryConflictException(String message) {
        super(message);
    }

    public CategoryConflictException(String message, Throwable cause) {
        super(message, cause);
    }
}
