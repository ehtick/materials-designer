import { Then } from "@badeball/cypress-cucumber-preprocessor";

import BrowserManager from "@mat3ra/tede/src/js/cypress/BrowserManager";

Then("I see file {string} on filesystem", (fileName: string) => {
    BrowserManager.getBrowser().assertFileDownloadedWithRetry(fileName);
});
