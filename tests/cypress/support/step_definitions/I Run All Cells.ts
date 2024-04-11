import { When } from "@badeball/cypress-cucumber-preprocessor";

import MaterialDesignerPage from "../widgets/MaterialDesignerPage";

When("I Run All Cells", () => {
    const { jupyterLiteSession } = new MaterialDesignerPage().designerWidget;
    jupyterLiteSession.waitForKernelIdle();
    jupyterLiteSession.clickMenuTab("Run");
    jupyterLiteSession.clickMenuTab("Run All Cells");
    // We have to wait for python script to run, which actually takes quite a bit of time
    jupyterLiteSession.waitForKernelIdle(360000);
});
