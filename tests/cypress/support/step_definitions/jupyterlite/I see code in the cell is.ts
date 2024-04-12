import { When } from "@badeball/cypress-cucumber-preprocessor";

import MaterialDesignerPage from "../../widgets/MaterialDesignerPage";

function normalizeText(code: string) {
    return code.replace(/\s/g, "");
}

When("I see code in the cell {string} is:", (index: string, code: string) => {
    new MaterialDesignerPage().designerWidget.jupyterLiteSession
        .getCodeFromCell(parseInt(index, 10))
        .then((cellCode) => {
            expect(normalizeText(cellCode)).to.equal(normalizeText(code));
        });
});
