import Widget from "./Widget";
// TODO: celanup eveyrthing
const selectors = {
    wrapper: "iframe#jupyter-lite-iframe",
    main: "#main",
};

export default class JupyterLiteSession extends Widget {
    wrappedSelectors: typeof selectors;

    constructor() {
        super(selectors.wrapper);
        this.wrappedSelectors = this.getWrappedSelectors(selectors);
    }

    waitForVisible() {
        return cy.getIframeBody("#jupyter-lite-iframe").find("#main").should("exist");
    }

    checkFileOpened(fileName: string) {
        return cy
            .getIframeBody("#jupyter-lite-iframe")
            .find("#main")
            .find(`li[title="Name: ${fileName}"]`)
            .should("exist");
    }
}
