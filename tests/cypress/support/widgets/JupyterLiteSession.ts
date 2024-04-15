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
        return this.browser
            .iframe(selectors.wrapper)
            .waitForVisible(selectors.notebook)
            .contains(link)
            .scrollIntoView()
            .click();
    }

    setCodeInCell(cellIndex: number, code: string) {
        return this.browser
            .iframe(selectors.wrapper)
            .waitForVisible(selectors.notebook)
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
        return this.browser
            .iframe(selectors.wrapper)
            .waitForVisible(selectors.notebook)
            .find(selectors.cellIn)
            .eq(cellIndex)
            .invoke("text");
    }

    clickMenuTab(tabName: string) {
        return this.browser
            .iframe(selectors.wrapper)
            .waitForVisible(selectors.menuItem)
            .contains(tabName)
            .click()
            .then(($li) => {
                if ($li.find(".lm-Menu").length > 0) {
                    cy.contains(selectors.menuItem, tabName).should("be.visible").click();
                }
            });
    }

    getKernelStatus() {
        return this.browser
            .iframe(selectors.wrapper)
            .waitForVisible("#jp-main-statusbar span")
            .contains(/Python \(Pyodide\)/)
            .invoke("text");
    }

    isKernelIdle(): Cypress.Chainable<boolean> {
        return this.getKernelStatus().then((status) => {
            return status.includes("Idle");
        });
    }

    restartKernel(restartTimeout: number) {
        return this.browser
            .iframe(selectors.wrapper)
            .waitForVisible('button[data-command="kernelmenu:restart"]', "md")
            .click({ multiple: true, force: true })
            .then(() => {
                this.browser
                    .iframe(selectors.wrapper)
                    .waitForVisible(".jp-Dialog-button.jp-mod-accept", "md")
                    .click({ multiple: true, force: true });
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
