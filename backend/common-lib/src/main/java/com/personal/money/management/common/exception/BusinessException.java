package com.personal.money.management.common.exception;

/**
 * Base exception class for all business logic exceptions in the Money Keeper application.
 * Extend this class to create domain-specific exceptions.
 */
public class BusinessException extends RuntimeException {
    
    public BusinessException(String message) {
        super(message);
    }

    public BusinessException(String message, Throwable cause) {
        super(message, cause);
    }
}
