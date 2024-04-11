import Widget from "./Widget";

const selectors = {
    wrapper: "#jupyterlite-transformation-dialog",
    dialog: "div[role='dialog']",
    materialsInSelector: "[data-tid='materials-in-selector']",
    materialsInSelectorItem: (index: number) =>
        `[data-tid='select-material']:nth-of-type(${index})`,
    materialsOutSelector: "[data-tid='materials-out-selector']",
    materialsOutSelectorItem: (index: number) =>
        `[data-tid='select-material']:nth-of-type(${index})`,
    submitButton: "#jupyterlite-transformation-dialog-submit-button",
};

export default class JupyterLiteTransformationDialog extends Widget {
    wrappedSelectors: typeof selectors;

    constructor() {
        super(selectors.wrapper);
        this.wrappedSelectors = this.getWrappedSelectors(selectors);
    }

    selectMaterialsIn(index: number) {
        this.browser.click(this.wrappedSelectors.materialsInSelector);
        this.browser.click(selectors.materialsInSelectorItem(index));
    }

    verifyMaterialsOut(index: number) {
        this.browser.click(this.wrappedSelectors.materialsOutSelector);
        this.browser.waitForVisible(selectors.materialsOutSelectorItem(index), "xl");
        // this.browser.click(selectors.materialsOutSelectorItem(index));
    }

    submit() {
        this.browser.click(this.wrappedSelectors.submitButton, { force: true });
    }
}
