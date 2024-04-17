import Widget from "./Widget";
// TODO: cleanup everything
const selectors = {
    iframe: "iframe#jupyter-lite-iframe",
    wrapper: "#main",
    notebook: ".jp-Notebook",
    cellIn: `.jp-Cell .jp-InputArea-editor`,
    cellInIndex: (index: number) =>
        `.jp-Notebook .jp-Cell:nth-child(${index}) .jp-InputArea-editor .CodeMirror`,
    menuItem: (tabName: string) => `li[role="menuitem"] > div:contains("${tabName}")`,
    kernelStatus: '//span[contains(text(), "Python (Pyodide)")]',
    statusIdle: "Python (Pyodide) | Idle",
    restartKernel: 'button[data-command="kernelmenu:restart"]',
    dialogAccept: ".jp-Dialog-button.jp-mod-accept",
    runTab: 'li[role="menuitem"] > div:contains("Run")',
    runAllCells: 'li[role="menuitem"] > div:contains("Run All Cells")',
};

export default class JupyterLiteSession extends Widget {
    wrappedSelectors: typeof selectors;

    constructor() {
        super(selectors.iframe);
        this.wrappedSelectors = this.getWrappedSelectors(selectors);
    }

    waitForVisible() {
        return this.browser.iframe(selectors.iframe, "md").waitForVisible(selectors.wrapper, "md");
    }

    checkFileOpened(fileName: string) {
        return this.browser
            .iframe(selectors.iframe, "md")
            .waitForVisible(`li[title*='${fileName}']`);
    }

    clickOnLink(link: string) {
        this.browser.iframe(selectors.iframe).waitForVisible(selectors.notebook);
        this.browser.iframe(selectors.iframe).clickOnText(link);
    }

    setCodeInCell(cellIndex: number, code: string) {
        this.browser.iframe(selectors.iframe, "md").waitForExist(selectors.cellInIndex(cellIndex));

        this.browser.execute((win) => {
            const iframe = win.document.querySelector(selectors.iframe);
            const selector = selectors.cellInIndex(cellIndex);
            const cell = iframe.contentWindow.document.body.querySelector(selector);
            const codeMirrorInstance = cell.CodeMirror;
            if (!codeMirrorInstance) {
                throw new Error("Unable to access CodeMirror instance.");
            }
            codeMirrorInstance.setValue(code);
        });
    }

    getCodeFromCell(cellIndex: number): Cypress.Chainable<string> {
        const cellSelector = selectors.cellInIndex(cellIndex);
        this.browser.iframe(selectors.iframe).waitForExist(cellSelector);
        return this.browser.execute((win) => {
            const iframe = win.document.querySelector(selectors.iframe);
            const cell = iframe.contentWindow.document.body.querySelector(cellSelector);
            const codeMirrorInstance = cell.CodeMirror;
            if (!codeMirrorInstance) {
                throw new Error("Unable to access CodeMirror instance.");
            }
            return codeMirrorInstance.getValue();
        });
    }

    clickMenu(tabName: string, subItemName?: string) {
        const menuTabSelector = selectors.menuItemNew(tabName);
        this.browser.iframe(selectors.iframe).clickFirst(menuTabSelector);
        if (subItemName) {
            const submenuItemSelector = selectors.menuItemNew(subItemName);
            this.browser.iframe(selectors.iframe).clickFirst(submenuItemSelector);
        }
    }

    getKernelStatus() {
        return this.browser
            .iframe(selectors.iframe)
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
            .iframe(selectors.iframe)
            .waitForVisible('button[data-command="kernelmenu:restart"]', "md")
            .click({ multiple: true, force: true })
            .then(() => {
                this.browser
                    .iframe(selectors.iframe)
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
