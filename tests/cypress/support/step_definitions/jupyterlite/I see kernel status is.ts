import { When } from "@badeball/cypress-cucumber-preprocessor";

import MaterialDesignerPage from "../../widgets/MaterialDesignerPage";

When("I see kernel status is Idle", () => {
    const { jupyterLiteSession } = new MaterialDesignerPage().designerWidget;

    cy.until({
        it: () => {
            return jupyterLiteSession.isKernelIdle();
        },
        timeout: 100000,
    });
});
