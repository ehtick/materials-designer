import Widget from "./Widget";

const menuItemXpathMap: Record<string, string> = {
    "Run All Cells": `//*[@id="jp-mainmenu-run"]/ul/li[12]`,
    "Restart Kernel": `//*[@id="jp-mainmenu-kernel"]/ul/li[3]`,
    "Restart Kernel and Clear All Outputs": `//*[@id="jp-mainmenu-kernel"]/ul/li[4]`,
};

const selectors = {
    // TODO: remove unused selectors
    iframe: "iframe#jupyter-lite-iframe",
    wrapper: "#main",
    notebook: ".jp-Notebook",
    cellIn: `.jp-Cell .jp-InputArea-editor`,
    cellInIndex: (index: number) =>
        `.jp-Notebook .jp-Cell:nth-child(${index}) .jp-InputArea-editor .CodeMirror`,
    menuTab: (tabName: string) =>
        `li[role="menuitem"] > div.p-MenuBar-itemLabel:contains("${tabName}")`,
    menuItem: (name: string) => menuItemXpathMap[name],
    kernelStatus: '//span[contains(text(), "Python (Pyodide) | ")]',
    kernelStatusLiteral: (status: string) => `Python (Pyodide) | ${status}`,
    restartKernel: 'button[data-command="kernelmenu:restart"]',
    dialogAccept: ".jp-Dialog-button.jp-mod-accept",
    fileSelectorByFileName: (fileName: string) => `li[title*='${fileName}']`,
};

export default class JupyterLiteSession extends Widget {
    wrappedSelectors: typeof selectors;

    private iframeAnchor: any;

    constructor() {
        super(selectors.iframe);
        this.wrappedSelectors = this.getWrappedSelectors(selectors);
        // TODO: use enums for timeouts
        this.iframeAnchor = this.browser.iframe(selectors.iframe, "lg");
    }

    waitForVisible() {
        return this.iframeAnchor.waitForVisible(selectors.wrapper, "lg");
    }

    checkFileOpened(fileName: string) {
        return this.iframeAnchor.waitForVisible(selectors.fileSelectorByFileName(fileName));
    }

    // TODO: change name to clickLinkInNotebookByItsTextContent
    clickOnLink(link: string) {
        this.iframeAnchor.waitForVisible(selectors.notebook);
        this.iframeAnchor.clickOnText(link, selectors.notebook);
    }

    // If `code` is passed - assuming `set`, otherwise - `get`
    getOrSetCodeInCell(cellIndex: number, sourceCode = "") {
        const cellSelector = selectors.cellInIndex(cellIndex);
        this.iframeAnchor.waitForExist(cellSelector);

        return this.browser.execute((win) => {
            // @ts-ignore
            const iframe = win.document.querySelector(selectors.iframe);
            const selector = selectors.cellInIndex(cellIndex);
            const cell = iframe.contentWindow.document.body.querySelector(selector);
            const codeMirrorInstance = cell.CodeMirror;
            if (!codeMirrorInstance) {
                throw new Error("Unable to access CodeMirror instance.");
            }
            return sourceCode
                ? codeMirrorInstance.setValue(sourceCode)
                : codeMirrorInstance.getValue();
        });
    }

    setCodeInCell(cellIndex: number, code: string) {
        return this.getOrSetCodeInCell(cellIndex, code);
    }

    getCodeFromCell(cellIndex: number) {
        return this.getOrSetCodeInCell(cellIndex);
    }

    clickMenu(tabName: string, subItemName?: string) {
        this.iframeAnchor.clickFirst(selectors.menuTab(tabName));
        if (subItemName) {
            this.browser
                .iframe(selectors.iframe)
                .getElementByXpath(selectors.menuItem(subItemName))
                .click({ force: true });
        }
    }

    isKernelInStatus(status: string) {
        return this.iframeAnchor
            .getElementTextByXpath(selectors.kernelStatus)
            .then((text: string) => {
                return text === selectors.kernelStatusLiteral(status);
            });
    }

    isKernelIdle() {
        // TODO: use enums for statuses
        return this.isKernelInStatus("Idle");
    }

    isKernelBusy() {
        return this.isKernelInStatus("Busy");
    }

    restartKernel() {
        this.iframeAnchor.clickFirst(selectors.restartKernel, { force: true });
        this.iframeAnchor.waitForVisible(selectors.dialogAccept, "md");
        this.iframeAnchor.clickFirst(selectors.dialogAccept);
    }

    waitForKernelIdleWithRestart() {
        // We need to wait some time to allow kernel to start on its own, if there's an issue, we restart and wait for some time again.
        // Times are empirically determined.
        this.browser.retry(
            () => {
                return this.isKernelIdle().then((isIdle: boolean) => {
                    if (!isIdle) {
                        this.restartKernel();
                    }
                    return isIdle;
                });
            },
            true,
            // TODO: use enums for delay, timeout
            "md",
            "xl",
        );
    }
}
