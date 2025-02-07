import { Then } from "@badeball/cypress-cucumber-preprocessor";
import MaterialDesignerPage from "../../widgets/MaterialDesignerPage";

function normalizeText(code: string) {
    return code.replace(/\s/g, "");
}

Then("I see output in the cell {string} is:", (index: string, expectedOutput: string) => {
    const { jupyterLiteSession } = new MaterialDesignerPage().designerWidget;
    const cellIndex = parseInt(index, 10);
    
    // First wait for kernel to be idle to ensure cell execution is complete
    jupyterLiteSession.waitForKernelIdle();
    
    // Then get and verify the output
    jupyterLiteSession
        .getOutputFromCell(cellIndex)
        .then((actualOutput) => {
            expect(normalizeText(actualOutput)).to.equal(normalizeText(expectedOutput));
        });
});
