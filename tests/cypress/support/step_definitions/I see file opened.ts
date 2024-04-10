import { When } from "@badeball/cypress-cucumber-preprocessor";

import MaterialDesignerPage from "../widgets/MaterialDesignerPage";

When("I see file {string} opened", (filename: string) => {
    const { jupyterLiteSession } = new MaterialDesignerPage().designerWidget;
    jupyterLiteSession.waitForVisible("md");
    jupyterLiteSession.checkFileOpened(filename);
});
