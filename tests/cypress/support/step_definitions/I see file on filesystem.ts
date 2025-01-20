import { Then } from "@badeball/cypress-cucumber-preprocessor";

import { WebAppBrowserManager } from "../../WebAppBrowser";

Then("I see file {string} on filesystem", (fileName: string) => {
    WebAppBrowserManager.getBrowser().assertFileDownloadedWithRetry(fileName);
});
