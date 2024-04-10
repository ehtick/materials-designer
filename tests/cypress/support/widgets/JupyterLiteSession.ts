import Widget from "./Widget";

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

    waitForVisible(timeout: BrowserTimeout) {
        return cy
            .get("#jupyter-lite-iframe", { log: true, timeout: 20000 })
            .iframe()
            .get("body #main")
            .should("exist");
    }

    checkFileOpened(fileName: string) {
        return cy
            .get("#jupyter-lite-iframe", { log: true, timeout: 20000 })
            .iframe()
            .get("body #main")
            .find(`li[title="Name: ${fileName}"]`)
            .should("exist");
    }
}
