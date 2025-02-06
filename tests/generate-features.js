const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { TestFeatureGenerator } = require("@mat3ra/tede/src/js/utils/TestFeatureGenerator");
const { yaml } = require("@mat3ra/utils/server");

function generateFeatures(inputDir, outputDir) {
    try {
        const yamlFiles = glob.sync(path.join(inputDir, "*.yaml"));

        yamlFiles.forEach(yamlPath => {
            try {
                const config = yaml.readYAMLFile(yamlPath);
                const templatePath = path.join(inputDir, config.template);
                const templateContent = fs.readFileSync(templatePath, 'utf8');

                const yamlContent = fs.readFileSync(yamlPath, 'utf8');
                const features = TestFeatureGenerator.generate(yamlContent, templateContent);

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
        throw error;  // Re-throw to handle it in the calling code if needed
    }
}

generateFeatures("./cypress/templates", "./cypress/e2e");
