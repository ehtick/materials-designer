const { TestFeatureGenerator } = require("@mat3ra/tede/src/js/scripts/generate-features");

const generator = new TestFeatureGenerator("./cypress/templates/", "./cypress/e2e/");

generator.generate();
