import { Given } from "@badeball/cypress-cucumber-preprocessor";

import { materialDesignerPage } from "../widgets/MaterialDesignerPage";

Given("I open DefaultImportModalDialog", () => {
    materialDesignerPage.designerWidget.headerMenu.selectMenuItemByNameAndItemNumber(
        "Input/Output",
        1,
    );
});
