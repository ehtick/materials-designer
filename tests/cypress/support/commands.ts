/* eslint-disable @typescript-eslint/no-namespace */
/// <reference types="cypress" />

import isEqual from "lodash/isEqual";

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

declare global {
    interface UntilProps<T = boolean> {
        it: () => Cypress.Chainable;
        become?: T;
        delay?: number;
        timeout?: number;
    }

    namespace Cypress {
        interface Chainable {
            getIframeBody(iframeSelector: string): Chainable<Element>;
            until<T>(prop: UntilProps<T>): void;
        }
    }
}

Cypress.Commands.add("getIframeBody", (iframeSelector: string) => {
    cy.log("Getting iframe body for selector:", iframeSelector);

    return cy
        .get(iframeSelector, { log: true, timeout: 20000 })
        .should(($iframe) => {
            // Ensure the iframe's window object is available
            expect($iframe.contents().find("body")).to.exist;
        })
        .then(($iframe) => {
            // Access the contentWindow's document body
            const body = $iframe.contents().find("body");
            return cy.wrap(body);
        });
});

interface UntilProps<T = boolean> {
    it: () => Cypress.Chainable<JQuery<T> | Cypress.Chainable<T>>;
    become?: T;
    delay?: number;
    timeout?: number;
}

/**
 * @see https://github.com/cypress-io/cypress/issues/1936#issuecomment-536424157
 * @example
 *   it('should retry task', function() {
 *      let result = 0;
 *      cy.until({
 *          it: () => ++result,
 *          become: 3,
 *          timeout: 5000,
 *          delay: 500,
 *      });
 *  });
 */
Cypress.Commands.add(
    "until",
    <T>({
        it,
        become,
        delay = 2000,
        timeout = Cypress.config("defaultCommandTimeout"),
    }: UntilProps<T>) => {
        cy.log("Until start:");
        let latestResult: unknown;
        setTimeout(() => {
            if (typeof become === "function") {
                // eslint-disable-next-line no-unused-expressions
                expect(become(latestResult), `${become}`).to.be.true;
            } else {
                expect(latestResult).to.be.equal(typeof become === "undefined" ? true : become);
            }
        }, timeout);

        const retry = () => {
            const originalResult = it();

            const wrappedResult = Cypress.isCy(originalResult)
                ? originalResult
                : cy.wrap(originalResult, { log: false });

            wrappedResult.then((result) => {
                latestResult = result;
                let checkResult = false;
                if (typeof become === "function") {
                    checkResult = become(result);
                } else {
                    checkResult = isEqual(result, typeof become === "undefined" ? true : become);
                }

                if (checkResult) {
                    cy.log(`Until end: "${result}" is expected`);
                    return cy.wrap(result, { log: false });
                }
                cy.log(`Until retry: "${result}" is not expected`);
                cy.wait(delay);
                return retry();
            });
        };

        return retry();
    },
);
