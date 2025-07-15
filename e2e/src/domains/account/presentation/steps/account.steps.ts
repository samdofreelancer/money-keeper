// This file serves as the main entry point for account-related step definitions
// The actual step implementations are organized into separate files by responsibility:

// Import all step definitions to register them with Cucumber
import "./setup.steps";     // Setup-related steps (Given steps for initial state)
import "./form.steps";      // Form actions (When steps for user interactions)
import "./assertions.steps"; // Verification steps (Then steps for assertions)

export {};
