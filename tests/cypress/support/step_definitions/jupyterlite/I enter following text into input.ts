import { When } from "@badeball/cypress-cucumber-preprocessor";
import MaterialDesignerPage from "../../widgets/MaterialDesignerPage";

When("I enter the following text into input", (text: string) => {
    new MaterialDesignerPage().designerWidget.jupyterLiteSession.enterTextIntoInput(text);
});
