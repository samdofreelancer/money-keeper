package com.personal.money.management.service.account.application.exception;

public class DuplicateAccountNameException extends RuntimeException {
    public DuplicateAccountNameException(String message) {
        super(message);
    }
}
