package com.personal.money.management.common.exception;

/**
 * Exception thrown when a requested entity is not found in the database.
 */
public class EntityNotFoundException extends BusinessException {
    
    public EntityNotFoundException(String message) {
        super(message);
    }

    public EntityNotFoundException(String entityName, Long id) {
        super(String.format("%s not found with id: %d", entityName, id));
    }

    public EntityNotFoundException(String entityName, String identifier) {
        super(String.format("%s not found: %s", entityName, identifier));
    }
}
