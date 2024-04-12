import Widget from "./Widget";
// TODO: cleanup everything
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
        return this.browser.iframe(selectors.wrapper, "md").waitForVisible(selectors.main, "md");
    }

    checkFileOpened(fileName: string) {
        return this.browser
            .iframe(selectors.wrapper, "md")
            .waitForVisible(`li[title*='${fileName}']`);
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

    getKernelStatus() {
        return cy
            .getIframeBody(selectors.wrapper)
            .find("#jp-main-statusbar span")
            .contains(/Python \(Pyodide\)/)
            .invoke("text");
    }

    isKernelIdle(): Cypress.Chainable<boolean> {
        return this.getKernelStatus().then((status) => {
            return status.includes("Idle");
        });
    }

    restartKernel(restartTimeout: number) {
        return cy
            .getIframeBody(selectors.wrapper)
            .find('button[data-command="kernelmenu:restart"]', {
                timeout: restartTimeout,
            })
            .click({ multiple: true, force: true })
            .then(() => {
                cy.get(".jp-Dialog-button.jp-mod-accept", {
                    timeout: 2000,
                }).click({ multiple: true, force: true });
                return cy.wait(restartTimeout);
            });
    }

    waitForKernelIdleWithRestart(timeout = 120000, attempt = 1) {
        const maxAttempts = 3;
        const restartTimeout = 8000; // Specific timeout to wait for restart action
        const checkInterval = 12000; // Interval between checks

        cy.wait(checkInterval).then(() => {
            this.isKernelIdle().then((isIdle) => {
                if (isIdle) {
                    // If the kernel is idle, we are successful, function will return
                } else if (attempt < maxAttempts) {
                    this.restartKernel(restartTimeout).then(() => {
                        this.waitForKernelIdleWithRestart(
                            timeout - (attempt * checkInterval + restartTimeout),
                            attempt + 1,
                        );
                    });
                } else {
                    throw new Error("Kernel did not become idle after maximum attempts.");
                }
            });
        });
    }
}
