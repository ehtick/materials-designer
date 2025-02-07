import { DataTable, When } from "@badeball/cypress-cucumber-preprocessor";
import { parseTable } from "@mat3ra/tede/src/js/cypress/utils/table";

import MaterialDesignerPage from "../widgets/MaterialDesignerPage";

interface MaterialSelection {
    name: string;
    index: number;
}

When("I import materials from Standata", (table: DataTable) => {
    const materials = parseTable<MaterialSelection>(table);
    const materialDesignerPage = new MaterialDesignerPage();

    materialDesignerPage.designerWidget.headerMenu.selectMenuItemByNameAndItemNumber(
        "Input/Output",
        2,
    );

    materialDesignerPage.designerWidget.standataDialog.openMaterialsDropdown();

    materials.forEach(({ name }) => {
        materialDesignerPage.designerWidget.standataDialog.selectMaterial(name);
    });

    materialDesignerPage.designerWidget.standataDialog.submit();
});
