import { IframeBrowser } from "@mat3ra/tede/src/js/cypress/Browser";

import Widget from "./Widget";

const selectors = {
    iframe: "iframe#jupyter-lite-iframe",
    wrapper: "#main",
    sidebarPath: ".jp-FileBrowser-crumbs",
    sidebar: "#jp-left-stack",
    sidebarEntryByIndexInTree: (index: number) =>
        `${selectors.sidebar} .jp-DirListing-content li:nth-of-type(${index})`,
    sidebarEntry: () => `${selectors.sidebar} .jp-DirListing-content li`,
    notebook: ".jp-Notebook",
    cellIn: `.jp-Cell .jp-InputArea-editor`,
    cellInIndex: (index: number) =>
        `.jp-Notebook .jp-Cell:nth-child(${index}) .jp-InputArea-editor .CodeMirror`,
    menuTab: "#jp-MainMenu ul li",
    menuItem: "#jp-mainmenu-run ul li",
    kernelStatusSpan: "#jp-bottom-panel #jp-main-statusbar div:nth-child(5) span",
    restartKernel:
        '.jp-NotebookPanel:not(.p-mod-hidden) .jp-NotebookPanel-toolbar button[data-command="kernelmenu:restart"]',
    dialogAccept: ".jp-Dialog-button.jp-mod-accept",
    fileTabSelector: ".lm-TabBar-tabLabel.p-TabBar-tabLabel",
};

export enum kernelStatus {
    Idle = "Idle",
    Busy = "Busy",
}

export default class JupyterLiteSession extends Widget {
    wrappedSelectors: typeof selectors;

    private iframeAnchor: IframeBrowser;

    constructor() {
        super(selectors.iframe);
        this.wrappedSelectors = this.getWrappedSelectors(selectors);
        this.iframeAnchor = this.browser.iframe(selectors.iframe, Widget.TimeoutType.md);
    }

    waitForVisible() {
        return this.iframeAnchor.waitForVisible(selectors.wrapper, Widget.TimeoutType.md);
    }

    doubleclickEntryInSidebar(sidebarEntry: string) {
        const selector = selectors.sidebarEntry();
        this.iframeAnchor.waitForExist(selector);
        // The force flag is needed because the sidebar is partially covered with other UI elements in JupyterLite layout.
        // Double-clicking on the sidebar entry does work when visually inspected, but Cypress doesn't register that.
        this.iframeAnchor.doubleClickOnText(sidebarEntry, selector, { force: true });
    }

    assertPathInSidebar(path: string) {
        this.browser.retry(() => {
            const value = this.getPathInSidebar();
            return value.then((text: string) => {
                return text === path;
            });
        }, true);
    }

    getPathInSidebar() {
        this.iframeAnchor.waitForVisible(selectors.sidebarPath);
        this.iframeAnchor
            .getElementText(selectors.sidebarPath)
            .then((text: string) => console.log(text));
        return this.iframeAnchor.getElementText(selectors.sidebarPath);
    }

    checkEntryPresentInSidebar(sidebarEntry: string) {
        this.iframeAnchor.waitForVisible(selectors.sidebarEntry());
        return this.iframeAnchor.get(selectors.sidebarEntry()).contains(sidebarEntry);
    }

    checkFileOpened(fileName: string) {
        return this.iframeAnchor.get(selectors.fileTabSelector).contains(fileName);
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
        this.iframeAnchor.clickOnText(tabName, selectors.menuTab);
        if (subItemName) {
            this.iframeAnchor.clickOnText(subItemName, selectors.menuItem);
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
        this.iframeAnchor.click(selectors.restartKernel);
        this.iframeAnchor.waitForVisible(selectors.dialogAccept, Widget.TimeoutType.md);
        this.iframeAnchor.click(selectors.dialogAccept);
    }

    waitForKernelInStatusWithCallback(status: kernelStatus, callback?: () => void) {
        this.browser.retry(
            () => {
                return this.isKernelInStatus(status).then((isInStatus: boolean) => {
                    if (!isInStatus && callback) {
                        callback();
                    }
                    return isInStatus;
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
        this.waitForKernelInStatusWithCallback(kernelStatus.Idle);
    }

    waitForKernelBusy() {
        this.waitForKernelInStatusWithCallback(kernelStatus.Busy);
    }
}
