import Widget from "./Widget";
// TODO: celanup eveyrthing
const selectors = {
    wrapper: "iframe#jupyter-lite-iframe",
    main: "#main",
    notebook: ".jp-Notebook",
    cellIn: `.jp-Cell-inputWrapper .jp-InputArea-editor`,
    menuItem: 'li[role="menuitem"]',
    runTab: 'li[role="menuitem"] > div:contains("Run")',
    runAllCells: 'li[role="menuitem"] > div:contains("Run All Cells")',
};

export default class JupyterLiteSession extends Widget {
    wrappedSelectors: typeof selectors;

    constructor() {
        super(selectors.wrapper);
        this.wrappedSelectors = this.getWrappedSelectors(selectors);
    }

    waitForVisible() {
        return cy
            .getIframeBody(selectors.wrapper)
            .find(selectors.main, { timeout: 10000 })
            .should("exist", { timeout: 10000 });
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

    setCodeInCell(cellIndex: number, code: string) {
        return cy
            .getIframeBody(selectors.wrapper)
            .find(selectors.notebook)
            .find(selectors.cellIn)
            .eq(cellIndex)
            .find(".CodeMirror")
            .then((element) => {
                const codeMirrorInstance = element[0].CodeMirror;
                if (codeMirrorInstance) {
                    codeMirrorInstance.setValue(code);
                } else {
                    throw new Error("Unable to access CodeMirror instance.");
                }
            });
    }

    getCodeFromCell(cellIndex: number): Cypress.Chainable<string> {
        return cy
            .getIframeBody(selectors.wrapper)
            .find(selectors.notebook)
            .find(selectors.cellIn)
            .eq(cellIndex)
            .invoke("text");
    }

    clickMenuTab(tabName: string) {
        return cy
            .getIframeBody(selectors.wrapper)
            .contains(selectors.menuItem, tabName)
            .click()
            .then(($li) => {
                if ($li.find(".lm-Menu").length > 0) {
                    cy.contains(selectors.menuItem, tabName).should("be.visible").click();
                }
            });
    }

    waitForKernelIdle(timeout = 120000) {
        return cy
            .getIframeBody(selectors.wrapper)
            .find(selectors.main)
            .find(".p-Widget", { timeout })
            .contains("Python (Pyodide) | Idle", { timeout })
            .should("exist", { timeout });
    }
}
