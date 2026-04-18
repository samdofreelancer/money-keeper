package com.personal.money.management.core.shared.domain;

import com.personal.money.management.core.account.domain.model.Account;
import com.personal.money.management.core.account.domain.model.AccountType;
import com.personal.money.management.core.category.domain.model.Category;
import com.personal.money.management.core.category.domain.model.CategoryType;
import com.personal.money.management.core.settings.domain.model.AppSettings;
import com.personal.money.management.core.shared.domain.valueobject.AccountName;
import com.personal.money.management.core.shared.domain.valueobject.CurrencyCode;
import com.personal.money.management.core.shared.domain.valueobject.Money;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests validating aggregate root boundaries in the Money Keeper domain.
 *
 * <p>These tests verify that:</p>
 * <ul>
 *   <li>All aggregate roots are properly annotated with @AggregateRoot</li>
 *   <li>Aggregate roots maintain their identity correctly</li>
 *   <li>Aggregate roots enforce business consistency rules</li>
 *   <li>Boundaries between aggregates are respected</li>
 * </ul>
 */
@DisplayName("Aggregate Root Boundary Tests")
class AggregateRootBoundaryTest {

    @Nested
    @DisplayName("Account Aggregate Root Tests")
    class AccountAggregateTests {

        @Test
        @DisplayName("Account should have @AggregateRoot annotation")
        void testAccountAnnotation() {
            assertTrue(Account.class.isAnnotationPresent(AggregateRoot.class),
                    "Account should be marked as @AggregateRoot");

            AggregateRoot annotation = Account.class.getAnnotation(AggregateRoot.class);
            assertEquals("account", annotation.boundedContext());
        }

        @Test
        @DisplayName("Account aggregate should maintain identity when created")
        void testAccountIdentity() {
            AccountName name = AccountName.of("Main Checking");
            Money initialBalance = Money.of(BigDecimal.valueOf(1000), CurrencyCode.of("USD"));
            Account account = new Account(name, initialBalance, AccountType.BANK_ACCOUNT, "My primary account");

            assertNull(account.getId(), "New account should have no ID");
            assertTrue(account.isActive(), "New account should be active");
        }
    }

    @Nested
    @DisplayName("Category Aggregate Root Tests")
    class CategoryAggregateTests {

        @Test
        @DisplayName("Category should have @AggregateRoot annotation")
        void testCategoryAnnotation() {
            assertTrue(Category.class.isAnnotationPresent(AggregateRoot.class),
                    "Category should be marked as @AggregateRoot");

            AggregateRoot annotation = Category.class.getAnnotation(AggregateRoot.class);
            assertEquals("category", annotation.boundedContext());
        }

        @Test
        @DisplayName("Category should enforce no cyclic parent rule")
        void testCategoryParentCyclicPrevention() {
            Category parent = new Category("Transport", "🚗", CategoryType.EXPENSE, null);
            
            assertThrows(IllegalArgumentException.class, () -> parent.setParent(parent),
                    "Category cannot be its own parent");
        }

        @Test
        @DisplayName("Category should support hierarchical structure")
        void testCategoryHierarchy() {
            Category parent = new Category("Food", "🍔", CategoryType.EXPENSE, null);
            Category child = new Category("Restaurants", "🍽", CategoryType.EXPENSE, parent);

            assertEquals(parent, child.getParent());
        }
    }

    @Nested
    @DisplayName("AppSettings Aggregate Root Tests")
    class AppSettingsAggregateTests {

        @Test
        @DisplayName("AppSettings should have @AggregateRoot annotation")
        void testAppSettingsAnnotation() {
            assertTrue(AppSettings.class.isAnnotationPresent(AggregateRoot.class),
                    "AppSettings should be marked as @AggregateRoot");

            AggregateRoot annotation = AppSettings.class.getAnnotation(AggregateRoot.class);
            assertEquals("settings", annotation.boundedContext());
        }

        @Test
        @DisplayName("AppSettings should manage global settings")
        void testAppSettingsSingleton() {
            AppSettings settings = new AppSettings(1L, "USD");

            assertEquals(1L, settings.getId());
            assertEquals("USD", settings.getDefaultCurrency());
        }
    }

    @Nested  
    @DisplayName("Aggregate Boundary Isolation Tests")
    class AggregateBoundaryIsolationTests {

        @Test
        @DisplayName("Aggregates should maintain independent state")
        void testBoundaryIsolation() {
            Account account = new Account(
                    AccountName.of("Savings"),
                    Money.of(BigDecimal.valueOf(1000), CurrencyCode.of("USD")),
                    AccountType.BANK_ACCOUNT,
                    null
            );

            Category category = new Category("Salary", "💼", CategoryType.INCOME, null);
            AppSettings settings = new AppSettings(1L, "USD");

            // Each aggregate maintains its own independent state
            assertNotNull(account.getName());
            assertNotNull(category.getName());
            assertNotNull(settings.getDefaultCurrency());
        }
    }

    @Nested
    @DisplayName("Annotation Metadata Tests")  
    class AnnotationMetadataTests {

        @Test
        @DisplayName("Annotations should preserve metadata for reflection")
        void testAnnotationMetadata() {
            AggregateRoot accountAnnotation = Account.class.getAnnotation(AggregateRoot.class);
            assertNotNull(accountAnnotation);
            assertEquals("account", accountAnnotation.boundedContext());
            assertTrue(accountAnnotation.description().length() > 0);

            AggregateRoot categoryAnnotation = Category.class.getAnnotation(AggregateRoot.class);
            assertNotNull(categoryAnnotation);
            assertEquals("category", categoryAnnotation.boundedContext());

            AggregateRoot settingsAnnotation = AppSettings.class.getAnnotation(AggregateRoot.class);
            assertNotNull(settingsAnnotation);
            assertEquals("settings", settingsAnnotation.boundedContext());
        }
    }
}
