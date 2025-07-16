import { Given } from "@cucumber/cucumber";

import { CustomWorld } from "../../../support/world";
import { NavigateToApplicationUseCase } from "../../application/use-cases/navigate-to-application.use-case";

Given(
  "I am on the Money Keeper application",
  async function (this: CustomWorld) {
    const navigateUseCase = new NavigateToApplicationUseCase(this);
    await navigateUseCase.execute();
  }
);
