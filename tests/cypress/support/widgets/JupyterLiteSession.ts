import Widget from "./Widget";

const menuItemXpathMap = {
    "Run All Cells": `//*[@id="jp-mainmenu-run"]/ul/li[12]`,
    "Restart Kernel": `//*[@id="jp-mainmenu-kernel"]/ul/li[3]`,
    "Restart Kernel and Clear All Outputs": `//*[@id="jp-mainmenu-kernel"]/ul/li[4]`,
};

// TODO: Figure out how to click menu in the JL (pointerdown event?) and use the generalized clickMenu method instead of literal Xpath
const selectors = {
    iframe: "iframe#jupyter-lite-iframe",
    wrapper: "#main",
    notebook: ".jp-Notebook",
    cellIn: `.jp-Cell .jp-InputArea-editor`,
    cellInIndex: (index: number) =>
        `.jp-Notebook .jp-Cell:nth-child(${index}) .jp-InputArea-editor .CodeMirror`,
    menuTab: (tabName: string) =>
        `li[role="menuitem"] > div.p-MenuBar-itemLabel:contains("${tabName}")`,
    menuItem: (name: string | number) => menuItemXpathMap[name],
    kernelStatus: '//span[contains(text(), "Python (Pyodide) | ")]',
    kernelStatusLiteral: (status: string) => `Python (Pyodide) | ${status}`,
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
                .getElementByXpath(selectors.menuItem(subItemName))
                .click({ force: true });
        }
    }

    isKernelIdle() {
        return this.browser
            .iframe(selectors.iframe)
            .getElementTextByXpath(selectors.kernelStatus, "md")
            .then((text) => {
                return text === selectors.kernelStatusLiteral("Idle");
            });
    }

    isKernelBusy() {
        return this.browser
            .iframe(selectors.iframe)
            .getElementTextByXpath(selectors.kernelStatus, "md")
            .then((text) => {
                return text === selectors.kernelStatusLiteral("Busy");
            });
    }

    restartKernel() {
        this.browser.iframe(selectors.iframe).clickFirst(selectors.restartKernel, { force: true });
        this.browser.iframe(selectors.iframe).waitForVisible(selectors.dialogAccept, "md");
        this.browser.iframe(selectors.iframe).clickFirst(selectors.dialogAccept);
    }

    waitForKernelIdleWithRestart() {
        // We need to wait some time to allow kernel to start on its own, if there's an issue, we restart and wait for some time again.
        // Times are empirically determined.
        this.browser.retry(
            () => {
                return this.isKernelIdle().then((isIdle) => {
                    if (!isIdle) {
                        this.restartKernel();
                    }
                    return isIdle;
                });
            },
            true,
            15000,
            60000,
        );
    }
}
