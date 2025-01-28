import { DataTable, Then } from "@badeball/cypress-cucumber-preprocessor";
import MaterialDesignerPage from "../widgets/MaterialDesignerPage";
import { parseTable } from "@mat3ra/tede/src/js/cypress/utils/table";

interface MaterialSelection {
    name: string;
    index: number;
}

Then("I see materials in output selector", (table: DataTable) => {
    const materials = parseTable<MaterialSelection>(table);
    const materialDesignerPage = new MaterialDesignerPage();
    
    // Verify each material appears in the output selector
    materials.forEach(({ index }) => {
        materialDesignerPage.designerWidget.jupyterLiteTransformationDialog.verifyMaterialsOut(index);
    });
}); 