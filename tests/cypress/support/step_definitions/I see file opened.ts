import { When } from "@badeball/cypress-cucumber-preprocessor";

import MaterialDesignerPage from "../widgets/MaterialDesignerPage";

When("I see file {string} opened", (filename: string) => {
    cy.get("#jupyter-lite-iframe", { log: true, timeout: 20000 })
        .should(($iframe) => {
            expect($iframe.contents()).to.exist;
        })
        .then(($iframe) => {
            const body = $iframe.contents().find("body");
            return cy.wrap(body, { log: true });
        });
    // new MaterialDesignerPage().designerWidget.jupyterLiteSession.waitForVisible();
});
