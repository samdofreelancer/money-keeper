import 'reflect-metadata';

export const AUTO_INJECTABLE_METADATA_KEY = Symbol('auto-injectable');

/**
 * Decorator that marks a class as auto-injectable for automatic registration
 * in the DI container. Classes decorated with @AutoInjectable() will be
 * automatically discovered and registered without manual provider definitions.
 */
export function AutoInjectable(): ClassDecorator {
  return (target: any) => {
    // Store metadata to identify auto-injectable classes
    Reflect.defineMetadata(AUTO_INJECTABLE_METADATA_KEY, true, target);
    
    // Also apply NestJS @Injectable decorator for compatibility
    // This ensures the class can be properly instantiated by NestJS
    const Injectable = require('@nestjs/common').Injectable;
    Injectable()(target);
  };
}

/**
 * Checks if a class is marked as auto-injectable
 */
export function isAutoInjectable(target: any): boolean {
  return Reflect.getMetadata(AUTO_INJECTABLE_METADATA_KEY, target) === true;
}

/**
 * Gets all auto-injectable classes from a list of classes
 */
export function getAutoInjectableClasses(classes: any[]): any[] {
  return classes.filter(cls => isAutoInjectable(cls));
}
