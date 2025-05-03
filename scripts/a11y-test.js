#!/usr/bin/env node

// Automated accessibility testing script for the personal finance dashboard
// This script uses axe-core to run accessibility tests on the application

import axeCore from 'axe-core';
import puppeteer from 'puppeteer';
import chalk from 'chalk';

// URLs to test
const urls = [
  'http://localhost:3000',
  'http://localhost:3000/dashboard',
  'http://localhost:3000/transactions',
  'http://localhost:3000/settings'
];

// Test configuration
const config = {
  runOnly: {
    type: 'tag',
    values: ['wcag2a', 'wcag2aa']
  },
  reporter: 'v2'
};

async function runA11yTests() {
  console.log(chalk.blue('Starting accessibility tests...'));
  
  const browser = await puppeteer.launch({ headless: "new" });
  const results = [];
  
  try {
    for (const url of urls) {
      console.log(chalk.yellow(`Testing: ${url}`));
      
      const page = await browser.newPage();
      
      try {
        // Navigate to the page
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Inject axe-core
        await page.evaluateHandle(`
          ${axeCore.source}
          window.axeResults = null;
          axe.run(document, ${JSON.stringify(config)})
            .then(results => {
              window.axeResults = results;
            });
        `);
        
        // Wait for axe to complete
        await page.waitForFunction('window.axeResults !== null', { timeout: 60000 });
        
        // Get the results
        const axeResults = await page.evaluate(() => window.axeResults);
        
        // Log violations
        if (axeResults.violations.length > 0) {
          console.log(chalk.red(`Found ${axeResults.violations.length} accessibility violations:`));
          
          axeResults.violations.forEach((violation, index) => {
            console.log(chalk.red(`\n${index + 1}. ${violation.id}: ${violation.help}`));
            console.log(chalk.gray(`Impact: ${violation.impact}`));
            console.log(chalk.gray(`Description: ${violation.description}`));
            console.log(chalk.gray(`WCAG: ${violation.tags.filter(tag => tag.includes('wcag')).join(', ')}`));
            
            violation.nodes.forEach((node, nodeIndex) => {
              console.log(chalk.yellow(`\n  Element ${nodeIndex + 1}:`));
              console.log(chalk.gray(`  ${node.html}`));
              console.log(chalk.gray(`  ${node.failureSummary}`));
            });
          });
        } else {
          console.log(chalk.green('No accessibility violations found!'));
        }
        
        results.push({
          url,
          violations: axeResults.violations,
          passes: axeResults.passes.length
        });
      } catch (error) {
        console.error(chalk.red(`Error testing ${url}:`), error);
        results.push({
          url,
          error: error.message
        });
      } finally {
        await page.close();
      }
    }
    
    // Print summary
    console.log(chalk.blue('\nAccessibility Test Summary:'));
    
    let totalViolations = 0;
    let totalPasses = 0;
    
    results.forEach(result => {
      if (result.error) {
        console.log(chalk.red(`${result.url}: Error - ${result.error}`));
      } else {
        totalViolations += result.violations.length;
        totalPasses += result.passes;
        console.log(
          `${result.url}: ${
            result.violations.length > 0 
              ? chalk.red(`${result.violations.length} violations`) 
              : chalk.green('No violations')
          }, ${chalk.green(`${result.passes} passes`)}`
        );
      }
    });
    
    console.log(chalk.blue(`\nTotal: ${totalViolations > 0 ? chalk.red(`${totalViolations} violations`) : chalk.green('No violations')}, ${chalk.green(`${totalPasses} passes`)}`));
    
    if (totalViolations > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red('Error running accessibility tests:'), error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runA11yTests(); 