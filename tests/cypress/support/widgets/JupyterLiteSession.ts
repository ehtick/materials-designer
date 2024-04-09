import Widget from "./Widget";

const selectors = {
    wrapper: "#jupyter-lite-iframe",
    main: "#main",
};

export default class JupyterLiteSession extends Widget {
    wrappedSelectors: typeof selectors;

    constructor() {
        super(selectors.wrapper);
        this.wrappedSelectors = this.getWrappedSelectors(selectors);
    }

    waitForVisible() {
        cy.wait(10000);
        cy.getIframeBody("#jupyter-lite-iframe");
        // .find(".jp-LabShell").should("be.visible");
    }
}
