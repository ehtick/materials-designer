import { When } from "@badeball/cypress-cucumber-preprocessor";

import MaterialDesignerPage from "../widgets/MaterialDesignerPage";

When("I see code in the cell {string} is:", (index: string, code: string) => {
    new MaterialDesignerPage().designerWidget.jupyterLiteSession
        .getCodeFromCell(parseInt(index, 10))
        .should("eq", code);
});
