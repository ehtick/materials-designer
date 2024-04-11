import Widget from "./Widget";
// TODO: celanup eveyrthing
const selectors = {
    wrapper: "iframe#jupyter-lite-iframe",
    main: "#main",
    notebook: ".jp-Notebook",
    cellIn: `.jp-Cell-inputWrapper .jp-InputArea-editor`,
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
            .should("exist");
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
            .getIframeBody(selectors.wrapper) // Assuming this is the correct selector for the iframe
            .contains('li[role="menuitem"]', tabName) // Find the li with the specific text
            .click() // Click the li element to open the dropdown if necessary
            .then(($li) => {
                if ($li.find(".lm-Menu").length > 0) {
                    // Check if there is a dropdown menu
                    // If the clicked tab has a dropdown menu, wait until the menu is visible
                    cy.contains('li[role="menuitem"]', tabName).should("be.visible").click(); // Click the actual menu item now that the dropdown is visible
                }
            });
    }

    waitForKernelIdle(timeout = 60000) {
        return cy
            .getIframeBody(selectors.wrapper)
            .find(selectors.main)
            .find(".p-Widget", { timeout })
            .contains("Python (Pyodide) | Idle", { timeout })
            .should("exist", { timeout });
    }
}
