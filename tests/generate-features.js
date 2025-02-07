const path = require('path');
const glob = require('glob');
const { generateFeatureFilesFromConfig } = require("@mat3ra/tede");
const { Utils } = require("@mat3ra/utils/server");

function generateFeatures(inputDir, outputDir) {
    const yamlFiles = glob.sync(path.join(inputDir, "*.yaml"));
    const testConfigs = yamlFiles.map(yamlPath => Utils.yaml.readYAMLFile(yamlPath));

    testConfigs.forEach(testConfig => {
        generateFeatureFilesFromConfig(testConfig, inputDir, outputDir);
    });
}
inputDir = path.join(__dirname, "cypress/templates");
outputDir = path.join(__dirname, "cypress/e2e");
generateFeatures(inputDir, outputDir);
