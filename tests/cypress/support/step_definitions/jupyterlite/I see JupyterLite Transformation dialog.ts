import { When } from "@badeball/cypress-cucumber-preprocessor";

import MaterialDesignerPage from "../../widgets/MaterialDesignerPage";

When("I see JupyterLite Transformation dialog", () => {
    new MaterialDesignerPage().designerWidget.jupyterLiteTransformationDialog.waitForVisible();
});
