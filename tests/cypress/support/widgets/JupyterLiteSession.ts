import Widget from "./Widget";

const menuTabXpathMap: Record<string, string> = {
    File: '//*[@id="jp-MainMenu"]/ul/li[1]',
    Edit: '//*[@id="jp-MainMenu"]/ul/li[2]',
    View: '//*[@id="jp-MainMenu"]/ul/li[3]',
    Run: "#jp-MainMenu ul li:nth-child(4) div:nth-child(2)",
    Kernel: '//*[@id="jp-MainMenu"]/ul/li[5]',
    Tabs: '//*[@id="jp-MainMenu"]/ul/li[6]',
    Settings: '//*[@id="jp-MainMenu"]/ul/li[7]',
};
const menuItemXpathMap: Record<string, string> = {
    "Run All Cells": `//*[@id="jp-mainmenu-run"]/ul/li[12]`,
    "Restart Kernel": `//*[@id="jp-mainmenu-kernel"]/ul/li[3]`,
    "Restart Kernel and Clear All Outputs": `//*[@id="jp-mainmenu-kernel"]/ul/li[4]`,
};

const selectors = {
    iframe: "iframe#jupyter-lite-iframe",
    wrapper: "#main",
    notebook: ".jp-Notebook",
    cellIn: `.jp-Cell .jp-InputArea-editor`,
    cellInIndex: (index: number) =>
        `.jp-Notebook .jp-Cell:nth-child(${index}) .jp-InputArea-editor .CodeMirror`,
    menuTab: (tabName: string) => menuTabXpathMap[tabName],
    menuItem: (name: string) => menuItemXpathMap[name],
    kernelStatusSpan: "#jp-bottom-panel #jp-main-statusbar div:nth-child(5) span",
    restartKernel:
        '.jp-NotebookPanel:not(.p-mod-hidden) .jp-NotebookPanel-toolbar button[data-command="kernelmenu:restart"]',
    dialogAccept: ".jp-Dialog-button.jp-mod-accept",
    fileSelectorByFileName: (fileName: string) => `li[title*='${fileName}']`,
};

export enum kernelStatus {
    Idle = "Idle",
    Busy = "Busy",
}

export default class JupyterLiteSession extends Widget {
    wrappedSelectors: typeof selectors;

    private iframeAnchor: any;

    constructor() {
        super(selectors.iframe);
        this.wrappedSelectors = this.getWrappedSelectors(selectors);
        this.iframeAnchor = this.browser.iframe(selectors.iframe, Widget.TimeoutType.md);
    }

    waitForVisible() {
        return this.iframeAnchor.waitForVisible(selectors.wrapper, Widget.TimeoutType.md);
    }

    checkFileOpened(fileName: string) {
        return this.iframeAnchor.waitForVisible(selectors.fileSelectorByFileName(fileName));
    }

    clickLinkInNotebookByItsTextContent(link: string) {
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
        this.iframeAnchor.getElement(selectors.menuTab(tabName)).click();
        // console.log("TAB", selectors.menuTab(tabName));
        if (subItemName) {
            // console.log("XPATH", selectors.menuItem(subItemName));
            return this.iframeAnchor
                .getElementByXpath(selectors.menuItem(subItemName))
                .click({ force: true });
        }
    }

    isKernelInStatus(status: kernelStatus) {
        return this.iframeAnchor.getElementText(selectors.kernelStatusSpan).then((text: string) => {
            return text.includes(status);
        });
    }

    isKernelIdle() {
        return this.isKernelInStatus(kernelStatus.Idle);
    }

    isKernelBusy() {
        return this.isKernelInStatus(kernelStatus.Busy);
    }

    restartKernel() {
        this.iframeAnchor.waitForVisible(selectors.restartKernel).click();
        this.iframeAnchor.waitForVisible(selectors.dialogAccept, Widget.TimeoutType.md);
        this.iframeAnchor.waitForVisible(selectors.dialogAccept).click();
    }

    waitForKernelInStatusWithCallback(status: kernelStatus, callback: () => void) {
        this.browser.retry(
            () => {
                return this.isKernelInStatus(status).then((isIdle: boolean) => {
                    if (!isIdle) {
                        callback();
                    }
                    return isIdle;
                });
            },
            true,
            Widget.TimeoutType.md,
            Widget.TimeoutType.xl,
        );
    }

    waitForKernelIdleWithRestart() {
        // We need to wait some time to allow kernel to start on its own, if there's an issue, we restart and wait for some time again.
        // Times are empirically determined. Usually takes 12-15 seconds for kernel to start.
        this.waitForKernelInStatusWithCallback(kernelStatus.Idle, () => {
            this.restartKernel();
        });
    }

    waitForKernelIdle() {
        this.waitForKernelInStatusWithCallback(kernelStatus.Idle, () => {});
    }
}
