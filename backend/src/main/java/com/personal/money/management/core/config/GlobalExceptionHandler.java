package com.personal.money.management.core.config;

import com.personal.money.management.core.category.application.exception.CategoryHasChildException;
import com.personal.money.management.core.category.application.exception.CategoryNotFoundException;
import com.personal.money.management.core.category.application.exception.CategoryCyclicDependencyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(CategoryNotFoundException.class)
    public ResponseEntity<String> handleCategoryNotFoundException(CategoryNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(CategoryHasChildException.class)
    public ResponseEntity<String> handleCategoryHasChildException(CategoryHasChildException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }

    @ExceptionHandler(CategoryCyclicDependencyException.class)
    public ResponseEntity<String> handleCategoryCyclicDependencyException(CategoryCyclicDependencyException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }
}
