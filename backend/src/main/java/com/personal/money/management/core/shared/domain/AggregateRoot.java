package com.personal.money.management.core.shared.domain;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks a class as an Aggregate Root in the Domain-Driven Design context.
 *
 * <p>An Aggregate Root is:</p>
 * <ul>
 *   <li>The entry point to an aggregate cluster</li>
 *   <li>Identified by a unique identity (typically an ID)</li>
 *   <li>Responsible for maintaining internal consistency of its aggregate</li>
 *   <li>The only part of the aggregate that external objects hold references to</li>
 *   <li>Manages the lifecycle of entities and value objects within its aggregate</li>
 * </ul>
 *
 * <p>Usage considerations:</p>
 * <ul>
 *   <li>Apply this annotation only to domain model classes</li>
 *   <li>Aggregate roots must have an identity (id field)</li>
 *   <li>All business logic for the aggregate should be centralized in the root</li>
 *   <li>External access to aggregate internals must go through the root</li>
 *   <li>Consider aggregate boundaries carefully - keep aggregates small</li>
 * </ul>
 *
 * <p>Example:</p>
 * <pre>
 * {@code
 * @AggregateRoot
 * public class Account {
 *     private final Long id;
 *     private final AccountName name;
 *     private final Money balance;
 *
 *     public Account(AccountName name, Money balance) {
 *         this.id = null;
 *         this.name = name;
 *         this.balance = balance;
 *     }
 *     
 *     // Business methods managing the aggregate state
 * }
 * }
 * </pre>
 *
 * <p>Related Patterns:</p>
 * <ul>
 *   <li>Entity - Objects with identity within an aggregate</li>
 *   <li>Value Object - Immutable objects identified by their values</li>
 *   <li>Bounded Context - Business domain partition containing related aggregates</li>
 * </ul>
 *
 * @see com.personal.money.management.core.shared.domain.valueobject
 * @since 1.0
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface AggregateRoot {
    /**
     * The name/identifier of the bounded context this aggregate belongs to.
     * This helps with understanding domain partitions.
     *
     * @return bounded context name
     */
    String boundedContext() default "";

    /**
     * Description of the aggregate's responsibility in the domain model.
     * This documents what business purpose this aggregate serves.
     *
     * @return aggregate purpose and responsibility
     */
    String description() default "";
}
