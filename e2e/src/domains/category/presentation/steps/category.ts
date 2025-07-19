import { Given, When, Then, DataTable } from '@cucumber/cucumber';

Given(`the system has no categories`, async () => {
    // [Given] Sets up the initial state of the system.
});

When(`I create a category with name {string}, icon {string}, type {string}`, async (arg0: string, arg1: string, arg2: string) => {
    // [When] Describes the action or event that triggers the scenario.
});

Then(`the category {string} should be created successfully`, async (arg0: string) => {
    // [Then] Describes the expected outcome or result of the scenario.
});

Given(`a category {string} with icon {string} and type {string} exists`, async (arg0: string, arg1: string, arg2: string) => {
    // [Given] Sets up the initial state of the system.
});

When(`I create a category with name {string}, icon {string}, type {string}, and parent {string}`, async (arg0: string, arg1: string, arg2: string, arg3: string) => {
    // [When] Describes the action or event that triggers the scenario.
});

Then(`the category {string} should be created as a child of {string}`, async (arg0: string, arg1: string) => {
    // [Then] Describes the expected outcome or result of the scenario.
});

When(`I create another category with name {string}, icon {string}, type {string}`, async (arg0: string, arg1: string, arg2: string) => {
    // [When] Describes the action or event that triggers the scenario.
});

Then(`the category creation should fail with error {string}`, async (arg0: string) => {
    // [Then] Describes the expected outcome or result of the scenario.
});

Given(`a category {string} with icon {string} and type {string} and parent {string} exists`, async (arg0: string, arg1: string, arg2: string, arg3: string) => {
    // [Given] Sets up the initial state of the system.
});

When(`I update category {string} to have parent {string}`, async (arg0: string, arg1: string) => {
    // [When] Describes the action or event that triggers the scenario.
});

Then(`the update should fail with error {string}`, async (arg0: string) => {
    // [Then] Describes the expected outcome or result of the scenario.
});

When(`I create a category with a name longer than the maximum allowed length`, async () => {
    // [When] Describes the action or event that triggers the scenario.
});

When(`I delete the category {string}`, async (arg0: string) => {
    // [When] Describes the action or event that triggers the scenario.
});

Then(`the deletion should fail with error {string}`, async (arg0: string) => {
    // [Then] Describes the expected outcome or result of the scenario.
});

When(`I create a category with name {string}, icon {string}, and type {string}`, async (arg0: string, arg1: string, arg2: string) => {
    // [When] Describes the action or event that triggers the scenario.
});

Given(`categories {string}, {string}, and {string} exist`, async (arg0: string, arg1: string, arg2: string) => {
    // [Given] Sets up the initial state of the system.
});

When(`I list all categories`, async () => {
    // [When] Describes the action or event that triggers the scenario.
});

Then(`I should see {string}, {string}, and {string} in the`, async (arg0: string, arg1: string, arg2: string) => {
    // [Then] Describes the expected outcome or result of the scenario.
});