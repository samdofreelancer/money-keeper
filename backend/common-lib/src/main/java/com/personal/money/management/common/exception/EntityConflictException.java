package com.personal.money.management.common.exception;

/**
 * Exception thrown when an entity conflicts with existing data (e.g., duplicate unique values).
 */
public class EntityConflictException extends BusinessException {
    
    public EntityConflictException(String message) {
        super(message);
    }

    public EntityConflictException(String entityName, String field, String value) {
        super(String.format("%s with %s '%s' already exists", entityName, field, value));
    }
}
