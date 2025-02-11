import { IframeBrowser } from "@mat3ra/tede/src/js/cypress/Browser";

import Widget from "./Widget";

// Selectors work for JL version https://github.com/Exabyte-io/jupyterlite/blob/7694a77e0a8cd495b0dbe1fb68cff3142fc5d32b/requirements.txt#L3
const SELECTORS = {
    iframe: "iframe#jupyter-lite-iframe",
    main: "#main",
    sidebar: {
        root: "#jp-left-stack",
        crumbs: ".jp-FileBrowser-crumbs",
        listing: ".jp-DirListing-content li",
        listingByIndex: (index: number) =>
            `#jp-left-stack .jp-DirListing-content li:nth-of-type(${index})`,
    },
    notebook: {
        root: ".jp-Notebook",
        cell: {
            input: ".jp-Cell .jp-InputArea-editor",
            link: ".jp-Cell .jp-InputArea a",
            byIndex: (index: number) =>
                `.jp-Notebook .jp-Cell:nth-child(${index}) .jp-InputArea-editor .CodeMirror`,
            output: (index: number) =>
                `.jp-Notebook .jp-Cell:nth-child(${index}) .jp-OutputArea-output pre`,
            stdin: ".lm-Widget.p-Widget input.jp-Stdin-input",
        },
    },
    menu: {
        tab: "#jp-MainMenu ul li",
        item: "#jp-mainmenu-run ul li",
    },
    kernel: {
        status: "#jp-bottom-panel #jp-main-statusbar div:nth-child(5) span",
        restart:
            '.jp-NotebookPanel:not(.p-mod-hidden) .jp-NotebookPanel-toolbar button[data-command="kernelmenu:restart"]',
    },
    dialog: ".jp-Dialog-button.jp-mod-accept",
    fileTab: ".lm-TabBar-tabLabel.p-TabBar-tabLabel",
};

export enum kernelStatus {
    Idle = "Idle",
    Busy = "Busy",
}

export default class JupyterLiteSession extends Widget {
    wrappedSelectors: typeof SELECTORS;

    private iframeAnchor: IframeBrowser;

    constructor() {
        super(SELECTORS.iframe);
        this.wrappedSelectors = this.getWrappedSelectors(SELECTORS);
        this.iframeAnchor = this.browser.iframe(SELECTORS.iframe, Widget.TimeoutType.md);
    }

    waitForVisible() {
        return this.iframeAnchor.waitForVisible(SELECTORS.main, Widget.TimeoutType.md);
    }

    doubleclickEntryInSidebar(sidebarEntry: string) {
        this.iframeAnchor.waitForExist(SELECTORS.sidebar.listing);
        this.iframeAnchor.doubleClickOnText(sidebarEntry, SELECTORS.sidebar.listing, {
            force: true,
        });
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
        this.iframeAnchor.waitForVisible(SELECTORS.sidebar.crumbs);
        this.iframeAnchor
            .getElementText(SELECTORS.sidebar.crumbs)
            .then((text: string) => console.log(text));
        return this.iframeAnchor.getElementText(SELECTORS.sidebar.crumbs);
    }

    checkEntryPresentInSidebar(sidebarEntry: string) {
        this.iframeAnchor.waitForVisible(SELECTORS.sidebar.listing);
        return this.iframeAnchor.get(SELECTORS.sidebar.listing).contains(sidebarEntry);
    }

    checkFileOpened(fileName: string) {
        return this.iframeAnchor.get(SELECTORS.fileTab).contains(fileName);
    }

    clickLinkInNotebookByItsTextContent(link: string) {
        this.iframeAnchor.waitForVisible(SELECTORS.notebook.root);
        this.iframeAnchor.clickOnText(link, SELECTORS.notebook.cell.link);
    }

    getOrSetCodeInCell(cellIndex: number, sourceCode = "") {
        const cellSelector = SELECTORS.notebook.cell.byIndex(cellIndex);
        this.iframeAnchor.waitForExist(cellSelector);

        return this.browser.execute((win) => {
            const iframe = win.document.querySelector(SELECTORS.iframe);
            const selector = SELECTORS.notebook.cell.byIndex(cellIndex);
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

    getOutputFromCell(cellIndex: number) {
        const outputSelector = SELECTORS.notebook.cell.output(cellIndex);
        this.iframeAnchor.waitForExist(outputSelector);
        return this.iframeAnchor.getElementText(outputSelector);
    }

    clickMenu(tabName: string, subItemName?: string) {
        this.iframeAnchor.clickOnText(tabName, SELECTORS.menu.tab);
        if (subItemName) {
            this.iframeAnchor.clickOnText(subItemName, SELECTORS.menu.item);
        }
    }

    isKernelInStatus(status: kernelStatus) {
        return this.iframeAnchor.getElementText(SELECTORS.kernel.status).then((text: string) => {
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
        this.iframeAnchor.click(SELECTORS.kernel.restart);
        this.iframeAnchor.waitForVisible(SELECTORS.dialog, Widget.TimeoutType.md);
        this.iframeAnchor.click(SELECTORS.dialog);
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

    enterTextIntoInput(text: string) {
        this.iframeAnchor.setInputValue(SELECTORS.notebook.cell.stdin, text,  true 
        );
    }
}
