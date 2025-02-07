import { DataTable, Then } from "@badeball/cypress-cucumber-preprocessor";
import { parseTable } from "@mat3ra/tede/src/js/cypress/utils/table";

import MaterialDesignerPage from "../widgets/MaterialDesignerPage";

interface MaterialSelection {
    name: string;
    index: number;
}

Then("I see materials in output selector", (table: DataTable) => {
    const materials = parseTable<MaterialSelection>(table);
    const materialDesignerPage = new MaterialDesignerPage();

    materials.forEach(({ index }) => {
        materialDesignerPage.designerWidget.jupyterLiteTransformationDialog.verifyMaterialsOut(
            index,
        );
    });
});
