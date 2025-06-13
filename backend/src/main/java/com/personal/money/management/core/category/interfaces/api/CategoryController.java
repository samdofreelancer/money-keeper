package com.personal.money.management.core.category.interfaces.api;

import com.personal.money.management.core.category.application.CategoryService;
import com.personal.money.management.core.category.domain.model.Category;
import com.personal.money.management.core.category.interfaces.api.dto.CategoryRequest;
import com.personal.money.management.core.category.interfaces.api.dto.CategoryResponse;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping
    public CategoryResponse create(@Valid @RequestBody CategoryRequest request) {
        Category category = categoryService.createCategory(
                request.getName(),
                request.getIcon(),
                request.getType(),
                request.getParentId()
        );
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getIcon(),
                category.getType(),
                category.getParent() != null ? category.getParent().getId() : null
        );
    }
}