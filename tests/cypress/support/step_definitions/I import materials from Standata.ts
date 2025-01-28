import { DataTable, When } from "@badeball/cypress-cucumber-preprocessor";
import MaterialDesignerPage from "../widgets/MaterialDesignerPage";
import { parseTable } from "@mat3ra/tede/src/js/cypress/utils/table";

interface MaterialImport {
    name: string;
    index: number;
}

When("I import materials from Standata", (table: DataTable) => {
    const materials = parseTable<MaterialImport>(table);
    const materialDesignerPage = new MaterialDesignerPage();
    
    // Open Standata dialog
    materialDesignerPage.designerWidget.headerMenu.selectMenuItemByNameAndItemNumber(
        "Input/Output",
        2,
    );
    
    // Select each material
    materials.forEach(({ name }) => {
        materialDesignerPage.designerWidget.standataDialog.selectMaterial(name);
    });
    
    // Submit the selection
    materialDesignerPage.designerWidget.standataDialog.submit();
}); 