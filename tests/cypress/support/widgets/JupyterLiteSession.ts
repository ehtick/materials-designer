import Widget from "./Widget";
// TODO: celanup eveyrthing
const selectors = {
    wrapper: "iframe#jupyter-lite-iframe",
    main: "#main",
    notebook: ".jp-Notebook",
};

export default class JupyterLiteSession extends Widget {
    wrappedSelectors: typeof selectors;

    constructor() {
        super(selectors.wrapper);
        this.wrappedSelectors = this.getWrappedSelectors(selectors);
    }

    waitForVisible() {
        return cy.getIframeBody(selectors.wrapper).find(selectors.main).should("exist");
    }

    checkFileOpened(fileName: string) {
        return cy
            .getIframeBody(selectors.wrapper)
            .find(selectors.main)
            .find(`li[title*='${fileName}']`)
            .should("exist");
    }

    clickOnLink(link: string) {
        return cy
            .getIframeBody(selectors.wrapper)
            .find(selectors.notebook)
            .contains(link)
            .scrollIntoView()
            .click();
    }
}
