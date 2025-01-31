import { When } from "@badeball/cypress-cucumber-preprocessor";
import JupyterLiteTransformationDialogWidget from "../widgets/JupyterLiteTransformationDialogWidget";

When("I deselect all materials", () => {
    const jupyterLiteDialog = new JupyterLiteTransformationDialogWidget();
    jupyterLiteDialog.deselectAllMaterials();
}); 