package com.personal.money.management.core.shared.infrastructure.adapter;

/**
 * Exception thrown when external exchange rate service integration fails.
 * 
 * This exception is part of the anti-corruption layer, separating external service errors
 * from internal domain exceptions.
 */
public class ExchangeRateException extends RuntimeException {
    
    public ExchangeRateException(String message) {
        super(message);
    }
    
    public ExchangeRateException(String message, Throwable cause) {
        super(message, cause);
    }
}
