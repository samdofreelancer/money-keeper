package com.personal.money.management.core.config;

import com.personal.money.management.core.category.application.exception.CategoryHasChildException;
import com.personal.money.management.core.category.application.exception.CategoryNotFoundException;
import com.personal.money.management.core.category.application.exception.CategoryCyclicDependencyException;
import com.personal.money.management.core.category.application.exception.CategoryConflictException;
import com.personal.money.management.core.category.interfaces.api.dto.ApiErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(CategoryNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleCategoryNotFoundException(CategoryNotFoundException ex) {
        ApiErrorResponse errorResponse = new ApiErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            HttpStatus.NOT_FOUND.getReasonPhrase(),
            ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    @ExceptionHandler(CategoryHasChildException.class)
    public ResponseEntity<ApiErrorResponse> handleCategoryHasChildException(CategoryHasChildException ex) {
        ApiErrorResponse errorResponse = new ApiErrorResponse(
            HttpStatus.CONFLICT.value(),
            HttpStatus.CONFLICT.getReasonPhrase(),
            ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }

    @ExceptionHandler(CategoryCyclicDependencyException.class)
    public ResponseEntity<ApiErrorResponse> handleCategoryCyclicDependencyException(CategoryCyclicDependencyException ex) {
        ApiErrorResponse errorResponse = new ApiErrorResponse(
            HttpStatus.CONFLICT.value(),
            HttpStatus.CONFLICT.getReasonPhrase(),
            ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }

    @ExceptionHandler(CategoryConflictException.class)
    public ResponseEntity<ApiErrorResponse> handleCategoryConflictException(CategoryConflictException ex) {
        ApiErrorResponse errorResponse = new ApiErrorResponse(
            HttpStatus.CONFLICT.value(),
            HttpStatus.CONFLICT.getReasonPhrase(),
            ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }
}
