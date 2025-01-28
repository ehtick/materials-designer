const fs = require('fs');
const path = require('path');

// Set up paths
const TEMPLATE_DIR = __dirname;

// Read the test cases from JSON file
const configPath = path.join(TEMPLATE_DIR, 'test-cases.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Create a function to evaluate the template string
const expandTemplate = (template, context) => {
    return template.replace(/\${([^}]+)}/g, (match, key) => {
        // Handle array of materials
        if (key.trim() === 'materials_table') {
            if (!context.materials || !Array.isArray(context.materials)) {
                return '';
            }
            // Generate materials table
            return context.materials.map(material => 
                `      | ${material.material_name} | ${material.material_index} |`
            ).join('\n');
        }
        // For single material references, use the first material in the array if it exists
        if (key.trim() === 'material_name' && context.materials && context.materials.length > 0) {
            return context.materials[0].material_name;
        }
        if (key.trim() === 'material_index' && context.materials && context.materials.length > 0) {
            return context.materials[0].material_index;
        }
        return context[key.trim()] ?? match;
    });
};

const processTestCases = (categoryData) => {
    categoryData.forEach(templateGroup => {
        const templatePath = path.join(TEMPLATE_DIR, templateGroup.template_name);
        const templateContent = fs.readFileSync(templatePath, 'utf8');

        templateGroup.testCases.forEach(testCase => {
            const expandedContent = expandTemplate(templateContent, testCase);
            const featuresDir = testCase.feature_path;
            const outputPath = path.join(
                `${testCase.feature_path}`,
                `${testCase.feature_name}.feature`
            );
            
            if (!fs.existsSync(featuresDir)) {
                fs.mkdirSync(featuresDir, { recursive: true });
            }
            
            fs.writeFileSync(outputPath, expandedContent);
            console.log(`Generated: ${outputPath}`);
        });
    });
};

Object.keys(config).forEach(category => {
    processTestCases(config[category]);
});
