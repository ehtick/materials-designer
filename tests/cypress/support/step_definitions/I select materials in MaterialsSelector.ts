import { DataTable, When } from "@badeball/cypress-cucumber-preprocessor";
import { parseTable } from "@mat3ra/tede/src/js/cypress/utils/table";

import MaterialDesignerPage from "../widgets/MaterialDesignerPage";

interface MaterialSelection {
    name: string;
    index: number;
}

const defaultMaterial = "Silicon FCC";

When("I select materials in MaterialsSelector", (table: DataTable) => {
    const materials = parseTable<MaterialSelection>(table);
    const materialDesignerPage = new MaterialDesignerPage();

    // First remove Silicon FCC that's selected by default
    materialDesignerPage.designerWidget.jupyterLiteTransformationDialog.removeMaterial(
        defaultMaterial,
    );

    // Select each material from the table
    materials.forEach(({ name }) => {
        materialDesignerPage.designerWidget.jupyterLiteTransformationDialog.selectMaterialByName(
            name,
        );
    });
});
