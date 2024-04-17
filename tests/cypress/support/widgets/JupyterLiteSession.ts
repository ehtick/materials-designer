import Widget from "./Widget";

const selectors = {
    iframe: "iframe#jupyter-lite-iframe",
    wrapper: "#main",
    notebook: ".jp-Notebook",
    cellIn: `.jp-Cell .jp-InputArea-editor`,
    cellInIndex: (index: number) =>
        `.jp-Notebook .jp-Cell:nth-child(${index}) .jp-InputArea-editor .CodeMirror`,
    menuTab: (tabName: string) =>
        `li[role="menuitem"] > div.p-MenuBar-itemLabel:contains("${tabName}")`,
    menuItem: (tabName: string) => `li[role="menuitem"] > div.p-Menu-item:contains("${tabName}")`,
    runAllCellsXpath: `//*[@id="jp-mainmenu-run"]/ul/li[12]/div[2]`,
    kernelStatus: '//span[contains(text(), "Python (Pyodide) | ")]',
    statusIdle: "Python (Pyodide) | Idle",
    restartKernel: 'button[data-command="kernelmenu:restart"]',
    dialogAccept: ".jp-Dialog-button.jp-mod-accept",
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
            // @ts-ignore
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
            // @ts-ignore
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
        this.browser.iframe(selectors.iframe).clickFirst(selectors.menuTab(tabName));
        if (subItemName) {
            this.browser
                .iframe(selectors.iframe)
                .getElementByXpath(selectors.runAllCellsXpath)
                .click({ force: true });
        }
    }

    isKernelIdle() {
        return this.browser
            .iframe(selectors.iframe)
            .getElementTextByXpath(selectors.kernelStatus, "md")
            .then((text) => {
                return text === selectors.statusIdle;
            });
    }

    restartKernel() {
        this.browser.iframe(selectors.iframe).clickFirst(selectors.restartKernel, { force: true });
        this.browser.iframe(selectors.iframe).waitForVisible(selectors.dialogAccept, "md");
        this.browser.iframe(selectors.iframe).clickFirst(selectors.dialogAccept);
    }

    waitForKernelIdleWithRestart() {
        // We need to wait some time to allow kernel to start on its own, if there's and issue, we restart and wait for some time again
        cy.wait(12000);
        this.isKernelIdle().then((idle) => {
            if (!idle) {
                this.restartKernel();
                this.isKernelIdle();
            }
            return idle;
        });
    }
}
