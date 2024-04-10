import { When } from "@badeball/cypress-cucumber-preprocessor";

import MaterialDesignerPage from "../widgets/MaterialDesignerPage";

When("I set code in the cell {string} to:", (index: string, code: string) => {
    new MaterialDesignerPage().designerWidget.jupyterLiteSession.setCodeInCell(
        parseInt(index, 10),
        code,
    );
});
