import Widget from "./Widget";

const selectors = {
    wrapper: "#jupyterlite-transformation-dialog",
    dialog: "div[role='dialog']",
    materialsSelector: "[data-tid='materials-selector']",
    materialsSelectorItem: (index: number) => `[data-tid='select-material']:nth-of-type(${index})`,
    submitButton: "#jupyter-lite-transformation-dialog-submit-button",
};

export default class JupyterLiteTransformationDialog extends Widget {
    wrappedSelectors: typeof selectors;

    constructor() {
        super(selectors.wrapper);
        this.wrappedSelectors = this.getWrappedSelectors(selectors);
    }

    selectMaterial(index: number) {
        this.browser.click(this.wrappedSelectors.materialsSelector);
        this.browser.click(selectors.materialsSelectorItem(index));
    }

    submit() {
        this.browser.click(this.wrappedSelectors.submitButton);
    }
}
