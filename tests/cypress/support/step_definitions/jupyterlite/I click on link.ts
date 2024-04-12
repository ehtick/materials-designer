import { When } from "@badeball/cypress-cucumber-preprocessor";

import MaterialDesignerPage from "../../widgets/MaterialDesignerPage";

When("I click on {string} link", (link: string) => {
    new MaterialDesignerPage().designerWidget.jupyterLiteSession.clickOnLink(link);
});
