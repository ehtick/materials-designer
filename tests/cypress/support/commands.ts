/// <reference types="cypress" />

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
    namespace Cypress {
        interface Chainable {
            getIframeBody(iframeSelector: string): Chainable<Element>;
        }
    }
}

Cypress.Commands.add("getIframeBody", (iframeSelector: string) => {
    cy.log("Getting iframe body for selector:", iframeSelector);

    return cy
        .get(iframeSelector, { log: true, timeout: 10000 })
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
