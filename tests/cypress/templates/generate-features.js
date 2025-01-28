const fs = require('fs');
const path = require('path');

// Set up paths
const TEMPLATE_DIR = __dirname;

// Read the test cases from JSON file
const configPath = path.join(TEMPLATE_DIR, 'test-cases.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Create a function to generate a table from an array of objects
const generateTable = (items, columns) => {
    if (!items || !Array.isArray(items)) {
        return '';
    }
    return items.map(item => {
        const cells = columns.map(col => item[col]);
        return `      | ${cells.join(' | ')} |`;
    }).join('\n');
};

// Create a function to evaluate the template string
const expandTemplate = (template, context) => {
    return template.replace(/\${([^}]+)}/g, (match, key) => {
        const trimmedKey = key.trim();
        
        // Handle table generation for any key ending with '_table'
        if (trimmedKey.endsWith('_table')) {
            const dataKey = trimmedKey.replace('_table', '');
            const data = context[dataKey];
            if (data && Array.isArray(data)) {
                // Infer columns from the first item in the array
                const columns = data[0] ? Object.keys(data[0]) : [];
                return generateTable(data, columns);
            }
        }

        // For all other variables, simply look them up in the context
        return context[trimmedKey] ?? match;
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
