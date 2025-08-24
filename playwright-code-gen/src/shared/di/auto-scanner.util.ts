import * as fs from 'fs';
import * as path from 'path';
import { isAutoInjectable } from './auto-injectable.decorator';

/**
 * Scans directories recursively for TypeScript/JavaScript files and discovers
 * classes decorated with @AutoInjectable()
 */
export class AutoScanner {
  /**
   * Scans a directory for auto-injectable classes
   */
  static async scanDirectory(directory: string): Promise<any[]> {
    const autoInjectableClasses: any[] = [];
    
    // Recursively scan the directory
    await this.scanDirectoryRecursive(directory, autoInjectableClasses);
    
    return autoInjectableClasses;
  }

  /**
   * Recursively scans a directory for TypeScript/JavaScript files
   */
  private static async scanDirectoryRecursive(
    dir: string,
    classes: any[],
    visited: Set<string> = new Set()
  ): Promise<void> {
    // Avoid infinite loops with circular symlinks
    const realPath = fs.realpathSync(dir);
    if (visited.has(realPath)) {
      return;
    }
    visited.add(realPath);

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // Skip node_modules and other common directories to avoid
          if (!this.shouldSkipDirectory(entry.name)) {
            await this.scanDirectoryRecursive(fullPath, classes, visited);
          }
        } else if (this.isSupportedFile(entry.name)) {
          await this.scanFileForAutoInjectableClasses(fullPath, classes);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`Warning: Could not scan directory ${dir}:`, errorMessage);
    }
  }

  /**
   * Determines if a directory should be skipped during scanning
   */
  private static shouldSkipDirectory(dirName: string): boolean {
    const skipDirs = [
      'node_modules',
      '.git',
      '.vscode',
      'dist',
      'build',
      'coverage',
      'test-results',
      'allure-results',
      'allure-report'
    ];
    return skipDirs.includes(dirName) || dirName.startsWith('.');
  }

  /**
   * Checks if a file is a supported TypeScript/JavaScript file
   */
  private static isSupportedFile(fileName: string): boolean {
    const supportedExtensions = ['.ts', '.js', '.mjs', '.cjs'];
    const ext = path.extname(fileName).toLowerCase();
    return supportedExtensions.includes(ext) && !fileName.endsWith('.d.ts');
  }

  /**
   * Scans a single file for auto-injectable classes
   */
  private static async scanFileForAutoInjectableClasses(
    filePath: string,
    classes: any[]
  ): Promise<void> {
    try {
      // Convert relative path to absolute path for proper import
      const absolutePath = path.resolve(filePath);
      const module = await import(absolutePath);
      
      // Check all exports from the module
      for (const exportName in module) {
        const exportedValue = module[exportName];
        
        // Check if it's a class and has the auto-injectable metadata
        if (typeof exportedValue === 'function' && isAutoInjectable(exportedValue)) {
          classes.push(exportedValue);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`Warning: Could not scan file ${filePath}:`, errorMessage);
    }
  }

  /**
   * Scans multiple directories for auto-injectable classes
   */
  static async scanDirectories(directories: string[]): Promise<any[]> {
    const allClasses: any[] = [];
    
    for (const directory of directories) {
      const classes = await this.scanDirectory(directory);
      allClasses.push(...classes);
    }
    
    return allClasses;
  }
}
