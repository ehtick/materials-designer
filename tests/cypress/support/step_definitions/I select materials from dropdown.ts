import { DataTable, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import MaterialDesignerPage from "../widgets/MaterialDesignerPage";
import { parseTable } from "@mat3ra/tede/src/js/cypress/utils/table";

interface MaterialSelection {
    name: string;
    index: number;
}

When("I select materials from dropdown", (table: DataTable) => {
    const materials = parseTable<MaterialSelection>(table);
    const materialDesignerPage = new MaterialDesignerPage();
    
    // Select each material from the dropdown
    materials.forEach(({ index }) => {
        materialDesignerPage.designerWidget.jupyterLiteTransformationDialog.selectMaterialsIn(index);
    });
});

Then("I see materials selected", (table: DataTable) => {
    const materials = parseTable<MaterialSelection>(table);
    const materialDesignerPage = new MaterialDesignerPage();
    
    // Verify each material is selected
    materials.forEach(({ index }) => {
        materialDesignerPage.designerWidget.jupyterLiteTransformationDialog.verifyMaterialsOut(index);
    });
}); 