import { When } from "@badeball/cypress-cucumber-preprocessor";

import MaterialDesignerPage from "../../widgets/MaterialDesignerPage";

When("I Run All Cells", () => {
    const { jupyterLiteSession } = new MaterialDesignerPage().designerWidget;
    jupyterLiteSession.waitForKernelIdleWithRestart();
    jupyterLiteSession.clickMenuTab("Run");
    jupyterLiteSession.clickMenuTab("Run All Cells");
});
