import { When } from "@badeball/cypress-cucumber-preprocessor";

import MaterialDesignerPage from "../../widgets/MaterialDesignerPage";

When("I see {string} in path", (filename: string) => {
    const { jupyterLiteSession } = new MaterialDesignerPage().designerWidget;
    jupyterLiteSession.assertPathInSidebar(filename);
});
