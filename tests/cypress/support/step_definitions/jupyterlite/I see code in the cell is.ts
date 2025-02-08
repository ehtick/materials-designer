import { When } from "@badeball/cypress-cucumber-preprocessor";
import { sharedUtils } from "utils";

import MaterialDesignerPage from "../../widgets/MaterialDesignerPage";

When("I see code in the cell {string} is:", (index: string, code: string) => {
    new MaterialDesignerPage().designerWidget.jupyterLiteSession
        .getCodeFromCell(parseInt(index, 10))
        .then((cellCode) => {
            expect(sharedUtils.str.removeNewLinesAndExtraSpaces(cellCode)).to.equal(
                sharedUtils.str.removeNewLinesAndExtraSpaces(code),
            );
        });
});
