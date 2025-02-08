import { Then } from "@badeball/cypress-cucumber-preprocessor";
import MaterialDesignerPage from "../../widgets/MaterialDesignerPage";

Then("I see output in the cell {string} matches:", (index: string, expectedPattern: string) => {
    const { jupyterLiteSession } = new MaterialDesignerPage().designerWidget;
    const cellIndex = parseInt(index, 10);
    
    jupyterLiteSession
        .getOutputFromCell(cellIndex)
        .then((actualOutput) => {
            const regex = new RegExp(expectedPattern);
            expect(actualOutput).to.match(regex);
        });
});
