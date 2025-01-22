const fs = require('fs');
const path = require('path');

// Set up paths
const TEMPLATE_DIR = __dirname;

// Read the test cases from JSON file
const configPath = path.join(TEMPLATE_DIR, 'test-cases.json');
const { testCases } = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Generate feature files for each test case
testCases.forEach(testCase => {
  // Read the template file
  const templatePath = path.join(TEMPLATE_DIR, testCase.template_name);
  const templateContent = fs.readFileSync(templatePath, 'utf8');

  // Create a function to evaluate the template string
  const expandTemplate = (template, context) => {
    return template.replace(/\${([^}]+)}/g, (match, key) => {
      return context[key.trim()] ?? match;
    });
  };

  const expandedContent = expandTemplate(templateContent, testCase);
  const featuresDir=testCase.feature_path
  const outputPath = path.join(
    `${testCase.feature_path}`,
    `${testCase.feature_name}.feature`
  );
  // Create features directory if it doesn't exist
  if (!fs.existsSync(featuresDir)) {
    fs.mkdirSync(featuresDir, { recursive: true });
  }
  fs.writeFileSync(outputPath, expandedContent);
  console.log(`Generated: ${outputPath}`);
});
