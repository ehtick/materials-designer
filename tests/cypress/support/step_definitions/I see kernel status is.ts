import { When } from "@badeball/cypress-cucumber-preprocessor";

import MaterialDesignerPage from "../widgets/MaterialDesignerPage";

When("I see kernel status is {string}", (expectedStatus: string) => {
    const { jupyterLiteSession } = new MaterialDesignerPage().designerWidget;

    cy.until({
        it: () => {
            return jupyterLiteSession.getKernelStatus().then((status: string) => {
                const baseStatus = status.split(" | ")[1];
                return baseStatus === expectedStatus;
            });
        },
        timeout: 100000,
    });
});
