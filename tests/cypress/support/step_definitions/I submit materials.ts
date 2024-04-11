import { When } from "@badeball/cypress-cucumber-preprocessor";

import MaterialDesignerPage from "../widgets/MaterialDesignerPage";

When("I submit materials", () => {
    const { jupyterLiteTransformationDialog } = new MaterialDesignerPage().designerWidget;
    jupyterLiteTransformationDialog.verifyMaterialsOut(1);
    jupyterLiteTransformationDialog.submit();
});
