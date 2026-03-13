Money Keeper Domain Model

Purpose

This document describes the core domain concepts used in the Money Keeper application.

It helps developers and AI tools understand the meaning of entities, their relationships, and the business rules behind financial operations.

---

Core Entities

Account

Represents a financial account that stores money.

Examples:

- Bank account
- Cash wallet
- Digital wallet

Typical fields:

- id
- name
- currency
- balance
- description

Responsibilities:

- Hold a monetary balance
- Record financial transactions
- Serve as the source or destination of transfers

Relationship:

An Account can have many Transactions.

---

Transaction

Represents a financial event affecting an account.

A transaction records money movement such as income, expense, or transfer.

Typical fields:

- id
- accountId
- categoryId
- amount
- transactionType
- dateTime
- note
- location
- fee

---

Transaction Types

The system supports multiple transaction types.

Income
Money added to an account.

Expense
Money spent from an account.

Transfer
Money moved between two accounts.

Borrow
Money received from someone that should be repaid.

Lend
Money given to someone that should be returned.

Adjustment
Manual correction of account balance.

---

Category

Categories classify transactions to help users understand spending patterns.

Examples:

- Food
- Transport
- Salary
- Shopping
- Entertainment

Typical fields:

- id
- name
- parentCategoryId
- type (income or expense)

Relationship:

A Category can be associated with many Transactions.

---

Domain Relationships

The core domain relationships can be represented as:

Account
|
| 1..*
v
Transaction -----> Category
|
|
v
Transfer (sourceAccount → destinationAccount)

Explanation:

- An Account contains many Transactions.
- Each Transaction belongs to one Category.
- Transfer transactions involve two accounts.

---

Financial Workflow Examples

Expense

User spends money from an account.

Example:

Account: Cash
Category: Food
Amount: -50

Effect:

- Account balance decreases
- Transaction recorded as Expense

---

Income

User receives money.

Example:

Account: Bank
Category: Salary
Amount: +2000

Effect:

- Account balance increases
- Transaction recorded as Income

---

Transfer

User moves money between accounts.

Example:

Source Account: Bank
Destination Account: Cash
Amount: 300

Effect:

- Bank balance decreases
- Cash balance increases
- Two linked transactions may be recorded

---

Domain Design Principles

The domain model follows these principles:

Clear separation of concerns
Accounts store balances.
Transactions record financial history.

Transactions are immutable records
Transactions should not be modified frequently after creation.

Categories organize financial data
They enable reporting and spending analysis.

Transfers involve two accounts
They represent movement of money within the system.

---

Usage in the Codebase

The domain concepts described here are used across:

Backend

- Entities
- Services
- Repositories

Frontend

- UI components
- Transaction forms
- Account views

Test Automation

- BDD feature scenarios
- Use cases
- Page objects

This shared domain model ensures consistency across the entire system.