import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { Page } from "@playwright/test";

import {
  CategoryUseCasesFactory,
  CategoryNotFoundError,
  CategoryValidationError,
} from "../CategoryUseCasesFactory";
import { CategoryUiPort } from "../../../domain/ports/category-ui.port";
import { CategoryApiPort } from "../../../domain/ports/category-api.port";
import { Category } from "../../../domain/models/category";
import { CATEGORY_CONFIG } from "../../config/category.config";

// Mock implementations
const mockCategoryUiPort: CategoryUiPort = {
  navigateToCategoryPage: vi.fn(),
  createCategory: vi.fn(),
  createUniqueCategory: vi.fn(),
  isCategoryCreated: vi.fn(),
  isCategoryChildOf: vi.fn(),
  createCategoryWithDuplicateName: vi.fn(),
  updateCategoryParent: vi.fn(),
  updateCategoryNameAndIcon: vi.fn(),
  deleteCategory: vi.fn(),
  isErrorMessageVisible: vi.fn(),
  isErrorMessageVisibleInErrorBox: vi.fn(),
  waitForToastMessage: vi.fn(),
  listCategories: vi.fn(),
  assertOnCategoryPage: vi.fn(),
};

const mockCategoryApiPort: CategoryApiPort = {
  getAllCategories: vi.fn(),
  createCategory: vi.fn(),
  deleteCategory: vi.fn(),
};

const mockPage = {
  reload: vi.fn(),
} as unknown as Page;

describe("CategoryUseCasesFactory", () => {
  let factory: CategoryUseCasesFactory;
  let mockTrackingCallback: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockTrackingCallback = vi.fn();
    factory = new CategoryUseCasesFactory(
      mockCategoryUiPort,
      mockCategoryApiPort
    );
  });

  describe("Constructor", () => {
    it("should accept injected dependencies", () => {
      const customFactory = new CategoryUseCasesFactory(
        mockCategoryUiPort,
        mockCategoryApiPort
      );
      expect(customFactory).toBeInstanceOf(CategoryUseCasesFactory);
    });

    it("should create default API client when not provided", () => {
      const factoryWithoutApi = new CategoryUseCasesFactory(mockCategoryUiPort);
      expect(factoryWithoutApi).toBeInstanceOf(CategoryUseCasesFactory);
    });

    it("should use custom API config when provided", () => {
      const customConfig = { baseURL: "http://custom-api.com" };
      const factoryWithCustomConfig = new CategoryUseCasesFactory(
        mockCategoryUiPort,
        undefined,
        customConfig
      );
      expect(factoryWithCustomConfig).toBeInstanceOf(CategoryUseCasesFactory);
    });
  });

  describe("Input Validation", () => {
    it("should throw validation error for empty category name", async () => {
      await expect(
        factory.createCategory("", "icon", "EXPENSE")
      ).rejects.toThrow(CategoryValidationError);
    });

    it("should throw validation error for category name exceeding max length", async () => {
      const longName = "a".repeat(CATEGORY_CONFIG.MAX_NAME_LENGTH + 1);
      await expect(
        factory.createCategory(longName, "icon", "EXPENSE")
      ).rejects.toThrow(CategoryValidationError);
    });

    it("should throw validation error for negative name length in generateUniqueName", () => {
      expect(() => factory.generateUniqueName(-1)).toThrow(
        CategoryValidationError
      );
    });
  });

  describe("ensureParentCategoryExists", () => {
    const parentName = "TestParent";
    const icon = "test-icon";
    const type = "EXPENSE";

    it("should return existing parent category ID when found", async () => {
      const existingCategory: Category = {
        id: "existing-id",
        name: parentName,
        icon,
        type,
      };

      (mockCategoryApiPort.getAllCategories as Mock).mockResolvedValue([
        existingCategory,
      ]);

      const result = await factory.ensureParentCategoryExists(
        parentName,
        icon,
        type,
        mockTrackingCallback
      );

      expect(result).toBe("existing-id");
      expect(mockTrackingCallback).toHaveBeenCalledWith(
        "existing-id",
        parentName,
        { isParent: true }
      );
    });

    it("should create parent category when not found", async () => {
      const createdCategory: Category = {
        id: "new-id",
        name: parentName,
        icon,
        type: "EXPENSE",
      };

      (mockCategoryApiPort.getAllCategories as Mock)
        .mockResolvedValueOnce([]) // No existing categories
        .mockResolvedValueOnce([createdCategory]); // Category exists after creation

      (mockCategoryApiPort.createCategory as Mock).mockResolvedValue(
        createdCategory
      );

      const result = await factory.ensureParentCategoryExists(
        parentName,
        icon,
        type,
        mockTrackingCallback
      );

      expect(result).toBe("new-id");
      expect(mockCategoryApiPort.createCategory).toHaveBeenCalledWith({
        id: "",
        name: parentName,
        icon,
        type: "EXPENSE",
      });
      expect(mockTrackingCallback).toHaveBeenCalledWith("new-id", parentName, {
        isParent: true,
      });
    });

    it("should throw CategoryNotFoundError when category creation verification fails", async () => {
      const createdCategory: Category = {
        id: "new-id",
        name: parentName,
        icon,
        type: "EXPENSE",
      };

      (mockCategoryApiPort.getAllCategories as Mock)
        .mockResolvedValueOnce([]) // No existing categories
        .mockResolvedValueOnce([]); // Still no categories after "creation"

      (mockCategoryApiPort.createCategory as Mock).mockResolvedValue(
        createdCategory
      );

      await expect(
        factory.ensureParentCategoryExists(parentName, icon, type)
      ).rejects.toThrow(CategoryNotFoundError);
    });
  });

  describe("createCategory", () => {
    const categoryName = "TestCategory";
    const icon = "test-icon";
    const type = "EXPENSE";

    it("should create category successfully with default options", async () => {
      const categoryId = "test-id";
      (mockCategoryUiPort.createCategory as Mock).mockResolvedValue(categoryId);

      const result = await factory.createCategory(categoryName, icon, type);

      expect(mockCategoryUiPort.navigateToCategoryPage).toHaveBeenCalled();
      expect(mockCategoryUiPort.createCategory).toHaveBeenCalledWith(
        categoryName,
        icon,
        type,
        undefined,
        false
      );
      expect(result).toBe(categoryId);
      expect(factory.lastCreatedCategoryName).toBe(categoryName);
    });

    it("should handle category creation with tracking callback", async () => {
      const categoryId = "test-id";
      (mockCategoryUiPort.createCategory as Mock).mockResolvedValue(categoryId);

      await factory.createCategory(categoryName, icon, type, {
        trackCreatedCategory: mockTrackingCallback,
      });

      expect(mockTrackingCallback).toHaveBeenCalledWith(
        categoryId,
        categoryName
      );
    });

    it("should handle expected errors without throwing", async () => {
      (mockCategoryUiPort.createCategory as Mock).mockResolvedValue(undefined);

      const result = await factory.createCategory(categoryName, icon, type, {
        expectError: true,
      });

      expect(result).toBeUndefined();
      expect(factory.lastCreatedCategoryName).not.toBe(categoryName);
    });
  });

  describe("createUniqueCategory", () => {
    const categoryName = "UniqueCategory";
    const icon = "unique-icon";
    const type = "INCOME";

    it("should create unique category successfully", async () => {
      const categoryId = "unique-id";
      (mockCategoryUiPort.createUniqueCategory as Mock).mockResolvedValue(
        categoryId
      );

      const result = await factory.createUniqueCategory(
        categoryName,
        icon,
        type,
        {
          trackCreatedCategory: mockTrackingCallback,
        }
      );

      expect(mockCategoryUiPort.createUniqueCategory).toHaveBeenCalledWith(
        categoryName,
        icon,
        type,
        undefined,
        false
      );
      expect(mockTrackingCallback).toHaveBeenCalledWith(
        categoryId,
        categoryName
      );
      expect(result).toBe(categoryId);
    });
  });

  describe("createChildCategory", () => {
    const childName = "ChildCategory";
    const parentName = "ParentCategory";
    const icon = "child-icon";
    const type = "EXPENSE";

    it("should create child category successfully via API", async () => {
      const parentCategory: Category = {
        id: "parent-id",
        name: parentName,
        icon,
        type,
      };

      const childCategory: Category = {
        id: "child-id",
        name: childName,
        icon,
        type: "EXPENSE",
        parentId: "parent-id",
      };

      (mockCategoryApiPort.getAllCategories as Mock).mockResolvedValue([
        parentCategory,
      ]);
      (mockCategoryApiPort.createCategory as Mock).mockResolvedValue(
        childCategory
      );
      (mockCategoryUiPort.isCategoryCreated as Mock).mockResolvedValue(true);

      await factory.createChildCategory(
        childName,
        icon,
        type,
        parentName,
        mockTrackingCallback,
        mockPage
      );

      expect(mockCategoryApiPort.createCategory).toHaveBeenCalledWith({
        id: "",
        name: childName,
        icon,
        type: "EXPENSE",
        parentId: "parent-id",
      });
      expect(mockTrackingCallback).toHaveBeenCalledWith(
        "parent-id",
        parentName,
        { isParent: true }
      );
      expect(mockTrackingCallback).toHaveBeenCalledWith("child-id", childName, {
        isParent: false,
      });
      expect(mockPage.reload).toHaveBeenCalled();
    });

    it("should throw error when child category is not visible after creation", async () => {
      const parentCategory: Category = {
        id: "parent-id",
        name: parentName,
        icon,
        type,
      };

      const childCategory: Category = {
        id: "child-id",
        name: childName,
        icon,
        type: "EXPENSE",
        parentId: "parent-id",
      };

      (mockCategoryApiPort.getAllCategories as Mock).mockResolvedValue([
        parentCategory,
      ]);
      (mockCategoryApiPort.createCategory as Mock).mockResolvedValue(
        childCategory
      );
      (mockCategoryUiPort.isCategoryCreated as Mock).mockResolvedValue(false);

      await expect(
        factory.createChildCategory(
          childName,
          icon,
          type,
          parentName,
          mockTrackingCallback,
          mockPage
        )
      ).rejects.toThrow(CategoryNotFoundError);
    });
  });

  describe("createCategoryWithParentWorkflow", () => {
    it("should complete parent-child workflow successfully", async () => {
      const childName = "WorkflowChild";
      const parentName = "WorkflowParent";
      const icon = "workflow-icon";
      const type = "EXPENSE";

      const parentCategory: Category = {
        id: "parent-id",
        name: parentName,
        icon,
        type,
      };

      (mockCategoryApiPort.getAllCategories as Mock).mockResolvedValue([
        parentCategory,
      ]);
      (mockCategoryUiPort.createUniqueCategory as Mock).mockResolvedValue(
        "child-id"
      );

      await factory.createCategoryWithParentWorkflow(
        childName,
        icon,
        type,
        parentName,
        mockTrackingCallback
      );

      expect(mockTrackingCallback).toHaveBeenCalledWith(
        "parent-id",
        parentName,
        { isParent: true }
      );
      expect(mockCategoryUiPort.createUniqueCategory).toHaveBeenCalledWith(
        childName,
        icon,
        type,
        parentName,
        false
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle API errors gracefully in ensureParentCategoryExists", async () => {
      const error = new Error("API Error");
      (mockCategoryApiPort.getAllCategories as Mock).mockRejectedValue(error);

      await expect(
        factory.ensureParentCategoryExists("test", "icon", "EXPENSE")
      ).rejects.toThrow(error);
    });

    it("should handle UI errors gracefully in createCategory", async () => {
      const error = new Error("UI Error");
      (mockCategoryUiPort.createCategory as Mock).mockRejectedValue(error);

      await expect(
        factory.createCategory("test", "icon", "EXPENSE")
      ).rejects.toThrow(error);
    });
  });

  describe("Utility Methods", () => {
    it("should generate unique name of specified length", () => {
      const length = 10;
      const name = factory.generateUniqueName(length);

      expect(name).toHaveLength(length);
      expect(name).toMatch(/^[A-Za-z0-9]+$/);
    });

    it("should generate different names on multiple calls", () => {
      const name1 = factory.generateUniqueName(10);
      const name2 = factory.generateUniqueName(10);

      expect(name1).not.toBe(name2);
    });
  });

  describe("Specialized Creation Methods", () => {
    it("should attempt to create category with exceeding max length", async () => {
      (mockCategoryUiPort.createCategory as Mock).mockResolvedValue(undefined);
      const onCreated = vi.fn();

      await factory.attemptToCreateCategoryWithNameExceedingMaxLength(
        "icon",
        "EXPENSE",
        onCreated
      );

      expect(onCreated).toHaveBeenCalledWith(expect.any(String));
      expect(mockCategoryUiPort.navigateToCategoryPage).toHaveBeenCalled();
    });

    it("should create category with generated name", async () => {
      const categoryId = "generated-id";
      (mockCategoryUiPort.createCategory as Mock).mockResolvedValue(categoryId);
      const onCreated = vi.fn();

      const result = await factory.createCategoryWithGeneratedName(
        15,
        "icon",
        "EXPENSE",
        onCreated
      );

      expect(result).toHaveLength(15);
      expect(onCreated).toHaveBeenCalledWith(result);
      expect(mockCategoryUiPort.createCategory).toHaveBeenCalled();
    });

    it("should attempt to create category with duplicate name", async () => {
      factory.lastCreatedCategoryName = "DuplicateName";
      (mockCategoryUiPort.createCategory as Mock).mockResolvedValue(undefined);
      const onCreated = vi.fn();

      await factory.attemptToCreateCategoryWithDuplicateName(
        "icon",
        "EXPENSE",
        onCreated
      );

      expect(onCreated).toHaveBeenCalledWith("DuplicateName");
      expect(mockCategoryUiPort.createCategory).toHaveBeenCalledWith(
        "DuplicateName",
        "icon",
        "EXPENSE",
        undefined,
        true
      );
    });
  });
});
