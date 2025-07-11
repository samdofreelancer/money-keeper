const fs = require('fs');
const path = require('path');

function fixJsonReport() {
  const reportPath = path.join(__dirname, '..', 'reports', 'cucumber-report.json');
  const backupPath = reportPath + '.backup';
  
  console.log('Checking JSON report file...');
  
  try {
    // Create backup
    fs.copyFileSync(reportPath, backupPath);
    console.log('Backup created at:', backupPath);
    
    // Read the file
    const content = fs.readFileSync(reportPath, 'utf8');
    console.log('File size:', content.length, 'characters');
    
    // Try to parse
    try {
      JSON.parse(content);
      console.log('JSON is valid!');
      return true;
    } catch (parseError) {
      console.log('JSON parse error:', parseError.message);
      console.log('Error position:', parseError.message.match(/position (\d+)/)?.[1]);
      
      // Try to fix common issues
      let fixedContent = content;
      
      // Remove trailing commas
      fixedContent = fixedContent.replace(/,(\s*[}\]])/g, '$1');
      
      // Fix double quotes issues
      fixedContent = fixedContent.replace(/""([^"]*)""/g, '"$1"');
      
      // Fix incomplete JSON objects/arrays
      if (!fixedContent.trim().endsWith(']')) {
        fixedContent = fixedContent.trim();
        if (fixedContent.endsWith(',')) {
          fixedContent = fixedContent.slice(0, -1);
        }
        fixedContent += ']';
      }
      
      // Try to parse fixed content
      try {
        JSON.parse(fixedContent);
        console.log('Fixed JSON successfully!');
        
        // Write fixed content
        fs.writeFileSync(reportPath, fixedContent);
        console.log('Fixed JSON written to:', reportPath);
        return true;
      } catch (fixError) {
        console.log('Could not fix JSON automatically:', fixError.message);
        
        // If we can't fix it, try to extract valid JSON up to the error
        const errorPos = parseInt(parseError.message.match(/position (\d+)/)?.[1]) || 0;
        if (errorPos > 0) {
          console.log('Attempting to truncate at error position...');
          
          // Find the last complete JSON object/array before the error
          let truncatedContent = content.substring(0, errorPos);
          
          // Try to close any open arrays/objects
          let openBrackets = 0;
          let openBraces = 0;
          
          for (let i = 0; i < truncatedContent.length; i++) {
            const char = truncatedContent[i];
            if (char === '[') openBrackets++;
            else if (char === ']') openBrackets--;
            else if (char === '{') openBraces++;
            else if (char === '}') openBraces--;
          }
          
          // Remove trailing comma if exists
          truncatedContent = truncatedContent.trim();
          if (truncatedContent.endsWith(',')) {
            truncatedContent = truncatedContent.slice(0, -1);
          }
          
          // Close open structures
          for (let i = 0; i < openBraces; i++) {
            truncatedContent += '}';
          }
          for (let i = 0; i < openBrackets; i++) {
            truncatedContent += ']';
          }
          
          try {
            JSON.parse(truncatedContent);
            fs.writeFileSync(reportPath, truncatedContent);
            console.log('Successfully truncated and fixed JSON');
            return true;
          } catch (truncateError) {
            console.log('Truncation also failed:', truncateError.message);
          }
        }
        
        return false;
      }
    }
  } catch (error) {
    console.error('Error reading file:', error);
    return false;
  }
}

function regenerateReport() {
  console.log('Regenerating fresh report...');
  
  const reportsDir = path.join(__dirname, '..', 'reports');
  const reportPath = path.join(reportsDir, 'cucumber-report.json');
  
  // Create a minimal valid JSON structure
  const minimalReport = [];
  
  try {
    fs.writeFileSync(reportPath, JSON.stringify(minimalReport, null, 2));
    console.log('Created minimal JSON report');
    return true;
  } catch (error) {
    console.error('Failed to create minimal report:', error);
    return false;
  }
}

// Main execution
console.log('Starting JSON report fix...');

if (!fixJsonReport()) {
  console.log('Automatic fix failed, regenerating minimal report...');
  if (regenerateReport()) {
    console.log('Report regenerated successfully');
  } else {
    console.error('Failed to regenerate report');
    process.exit(1);
  }
}

console.log('JSON report fix completed');
