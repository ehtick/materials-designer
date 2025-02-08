import { Then } from "@badeball/cypress-cucumber-preprocessor";
import { sharedUtils } from "@mat3ra/utils";

import MaterialDesignerPage from "../../widgets/MaterialDesignerPage";

Then("I see output in the cell {string} is:", (index: string, expectedOutput: string) => {
    const { jupyterLiteSession } = new MaterialDesignerPage().designerWidget;
    const cellIndex = parseInt(index, 10);

    jupyterLiteSession.getOutputFromCell(cellIndex).then((actualOutput) => {
        expect(sharedUtils.str.removeNewLinesAndExtraSpaces(actualOutput)).to.equal(
            sharedUtils.str.removeNewLinesAndExtraSpaces(expectedOutput),
        );
    });
});
