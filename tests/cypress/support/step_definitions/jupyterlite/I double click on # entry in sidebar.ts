import { When } from "@badeball/cypress-cucumber-preprocessor";

import MaterialDesignerPage from "../../widgets/MaterialDesignerPage";

When("I double click on {string} entry in sidebar", (sidebarEntryName: string) => {
    new MaterialDesignerPage().designerWidget.jupyterLiteSession.doubleclickEntryInSidebar(
        sidebarEntryName,
    );
});
