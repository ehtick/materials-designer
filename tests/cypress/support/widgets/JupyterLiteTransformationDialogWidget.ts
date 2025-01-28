import Widget from "./Widget";

const selectors = {
    wrapper: "#jupyterlite-transformation-dialog",
    dialog: "div[role='dialog']",
    materialsInSelector: "[data-tid='materials-in-selector']",
    materialsSelectorItem: (materialName: string) =>
        `[data-tid='select-material']:contains("${materialName}")`,
    selectedMaterialChip: (materialName: string) =>
        `.MuiChip-root:contains("${materialName}") .MuiChip-deleteIcon`,
    materialsOutSelector: "[data-tid='materials-out-selector']",
    materialsOutSelectorItem: (index: number) =>
        `[data-tid='materials-out-selector']:nth-of-type(${index})`,
    submitButton: "#jupyterlite-transformation-dialog-submit-button",
};

export default class JupyterLiteTransformationDialog extends Widget {
    wrappedSelectors: typeof selectors;

    constructor() {
        super(selectors.wrapper);
        this.wrappedSelectors = this.getWrappedSelectors(selectors);
    }

    removeMaterial(materialName: string) {
        this.browser.click(selectors.selectedMaterialChip(materialName));
    }

    selectMaterialByName(materialName: string) {
        this.browser.click(this.wrappedSelectors.materialsInSelector);
        this.browser.waitForVisible('.MuiAutocomplete-popper', "xl");
        this.browser.click(selectors.materialsSelectorItem(materialName));
    }

    verifyMaterialsOut(index: number) {
        this.browser.click(this.wrappedSelectors.materialsOutSelector);
        this.browser.waitForVisible(selectors.materialsOutSelectorItem(index), "xl");
    }

    submit() {
        this.browser.click(this.wrappedSelectors.submitButton, { force: true });
    }
}
