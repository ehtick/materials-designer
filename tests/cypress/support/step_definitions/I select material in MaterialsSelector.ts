import { DataTable, When } from "@badeball/cypress-cucumber-preprocessor";
import MaterialDesignerPage from "../widgets/MaterialDesignerPage";
import { parseTable } from "@mat3ra/tede/src/js/cypress/utils/table";

interface MaterialSelection {
    name: string;
    index: number;
}

When("I select materials in MaterialsSelector", (table: DataTable) => {
    const materials = parseTable<MaterialSelection>(table);
    const materialDesignerPage = new MaterialDesignerPage();
    
    // Select each material by name
    materials.forEach(({ name }) => {
        materialDesignerPage.designerWidget.jupyterLiteTransformationDialog.selectMaterialByName(name);
    });
}); 