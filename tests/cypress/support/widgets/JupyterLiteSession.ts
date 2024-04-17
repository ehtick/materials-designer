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
        const menuTabSelector = selectors.menuItem(tabName);
        this.browser.iframe(selectors.iframe).clickFirst(menuTabSelector);
        if (subItemName) {
            const submenuItemSelector = selectors.menuItem(subItemName);
            this.browser.iframe(selectors.iframe).clickFirst(submenuItemSelector);
        }
    }

    isKernelIdle() {
        return this.browser
            .iframe(selectors.iframe)
            .getElementTextByXpath(selectors.kernelStatus)
            .then((text) => {
                return text === selectors.statusIdle;
            });
    }

    restartKernel() {
        return this.browser
            .iframe(selectors.iframe)
            .clickFirst(selectors.restartKernel, { force: true })
            .then(() => {
                return this.browser
                    .iframe(selectors.iframe)
                    .waitForVisible(selectors.dialogAccept, "md")
                    .then(() => {
                        return this.browser
                            .iframe(selectors.iframe)
                            .clickFirst(selectors.dialogAccept);
                    });
            });
    }

    waitForKernelIdleWithRestart() {
        const checkInterval = 15000; // 15 seconds to check if kernel becomes idle
        const totalTimeout = 60000; // Total timeout of 60 seconds

        cy.until({
            it: () =>
                this.isKernelIdle().then((isIdle) => {
                    if (!isIdle) {
                        return this.restartKernel().then(() => false);
                    }
                    return true;
                }),
            become: true,
            delay: checkInterval,
            timeout: totalTimeout,
        });
    }
}
