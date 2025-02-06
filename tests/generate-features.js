const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { generateTestFeaturesFromYAMLConfig } = require("@mat3ra/tede/dist/js/utils/index.js");
const { Utils } = require("@mat3ra/utils/server");

function generateFeatures(inputDir, outputDir) {
    try {
        const yamlFiles = glob.sync(path.join(inputDir, "*.yaml"));

        yamlFiles.forEach(yamlPath => {
            try {
                const config = Utils.yaml.readYAMLFile(yamlPath);
                const templatePath = path.join(inputDir, config.template);
                const templateContent = fs.readFileSync(templatePath, 'utf8');

                const yamlContent = fs.readFileSync(yamlPath, 'utf8');

                const features = generateTestFeaturesFromYAMLConfig(yamlContent, templateContent);

                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir, { recursive: true });
                }

                features.forEach(({ name, content }) => {
                    const outputPath = path.join(outputDir, `${name}.feature`);
                    fs.writeFileSync(outputPath, content);
                    console.log(`Generated: ${outputPath}`);
                });
            } catch (error) {
                console.error(`Error processing ${yamlPath}:`, error);
            }
        });
    } catch (error) {
        console.error('Error generating features:', error);
        throw error;
    }
}

generateFeatures("./cypress/templates", "./cypress/e2e");
