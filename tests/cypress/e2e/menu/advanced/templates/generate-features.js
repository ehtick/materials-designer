const fs = require('fs');
const path = require('path');

// Set up paths
const TEMPLATE_DIR = __dirname;
const FEATURES_DIR = path.join(__dirname, '../features');

// Create features directory if it doesn't exist
if (!fs.existsSync(FEATURES_DIR)) {
  fs.mkdirSync(FEATURES_DIR, { recursive: true });
}

// Read the template file
const templatePath = path.join(TEMPLATE_DIR, 'jupyterlite-api-examples.feature.template');
const templateContent = fs.readFileSync(templatePath, 'utf8');

// Read the test cases from JSON file
const configPath = path.join(TEMPLATE_DIR, 'test-cases.json');
const { testCases } = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Create a function to evaluate the template string
const expandTemplate = (template, context) => {
  return template.replace(/\${([^}]+)}/g, (match, key) => {
    return context[key.trim()] ?? match;
  });
};

// Generate feature files for each test case
testCases.forEach(testCase => {
  const expandedContent = expandTemplate(templateContent, testCase);
  const outputPath = path.join(
    FEATURES_DIR,
    `jupyterlite-api-${testCase.output_name}.feature`
  );
  
  fs.writeFileSync(outputPath, expandedContent);
  console.log(`Generated: ${outputPath}`);
}); 