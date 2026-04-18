package com.personal.money.management.core.shared.infrastructure.adapter;

/**
 * Exception thrown when external tax authority service integration fails.
 * 
 * This exception is part of the anti-corruption layer, separating external service errors
 * from internal domain exceptions.
 */
public class TaxAuthorityException extends RuntimeException {
    
    public TaxAuthorityException(String message) {
        super(message);
    }
    
    public TaxAuthorityException(String message, Throwable cause) {
        super(message, cause);
    }
}
