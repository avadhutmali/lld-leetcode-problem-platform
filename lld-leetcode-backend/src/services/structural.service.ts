// src/services/structural.service.ts

import { StructuralCheck, TestCaseResult } from '../types/testCase.types';

/**
 * Structural Analyzer - Validates code structure using regex patterns
 * No AI needed - fast and deterministic
 */

type Language = 'java' | 'typescript' | 'cpp';

// Language-specific regex patterns for common constructs
const PATTERNS = {
    java: {
        class: (name: string) => new RegExp(`\\bclass\\s+${name}\\b`, 'i'),
        interface: (name: string) => new RegExp(`\\binterface\\s+${name}\\b`, 'i'),
        abstractClass: (name: string) => new RegExp(`\\babstract\\s+class\\s+${name}\\b`, 'i'),
        extends: (child: string, parent: string) => new RegExp(`\\bclass\\s+${child}\\s+extends\\s+${parent}\\b`, 'i'),
        implements: (cls: string, iface: string) => new RegExp(`\\bclass\\s+${cls}[^{]*implements\\s+[^{]*\\b${iface}\\b`, 'i'),
        method: (cls: string, method: string) => new RegExp(`class\\s+${cls}[^}]*\\b${method}\\s*\\(`, 'is'),
    },
    typescript: {
        class: (name: string) => new RegExp(`\\bclass\\s+${name}\\b`, 'i'),
        interface: (name: string) => new RegExp(`\\binterface\\s+${name}\\b`, 'i'),
        abstractClass: (name: string) => new RegExp(`\\babstract\\s+class\\s+${name}\\b`, 'i'),
        extends: (child: string, parent: string) => new RegExp(`\\bclass\\s+${child}\\s+extends\\s+${parent}\\b`, 'i'),
        implements: (cls: string, iface: string) => new RegExp(`\\bclass\\s+${cls}[^{]*implements\\s+[^{]*\\b${iface}\\b`, 'i'),
        method: (cls: string, method: string) => new RegExp(`class\\s+${cls}[^}]*\\b${method}\\s*[(<]`, 'is'),
    },
    cpp: {
        class: (name: string) => new RegExp(`\\bclass\\s+${name}\\b`, 'i'),
        interface: (name: string) => new RegExp(`\\bclass\\s+${name}\\s*\\{[^}]*virtual[^}]*=\\s*0`, 'is'), // Pure virtual = interface
        abstractClass: (name: string) => new RegExp(`\\bclass\\s+${name}\\s*\\{[^}]*virtual`, 'is'),
        extends: (child: string, parent: string) => new RegExp(`\\bclass\\s+${child}\\s*:\\s*(public|protected|private)?\\s*${parent}\\b`, 'i'),
        implements: (cls: string, iface: string) => new RegExp(`\\bclass\\s+${cls}\\s*:\\s*(public|protected|private)?\\s*${iface}\\b`, 'i'),
        method: (cls: string, method: string) => new RegExp(`class\\s+${cls}[^}]*\\b${method}\\s*\\(`, 'is'),
    }
};

/**
 * Count classes in code
 */
function countClasses(code: string, language: Language): number {
    const pattern = language === 'cpp' 
        ? /\bclass\s+\w+/g 
        : /\bclass\s+\w+/g;
    const matches = code.match(pattern);
    return matches ? matches.length : 0;
}

/**
 * Count methods in a specific class (approximate)
 */
function countMethodsInClass(code: string, className: string, language: Language): number {
    // Extract class body (simplified - doesn't handle nested classes perfectly)
    const classPattern = new RegExp(`class\\s+${className}[^{]*\\{([^}]*)\\}`, 'is');
    const match = code.match(classPattern);
    if (!match) return 0;
    
    const classBody = match[1];
    
    // Count method-like patterns (function declarations)
    const methodPatterns = {
        java: /\b(public|private|protected)?\s*(static)?\s*\w+\s+\w+\s*\([^)]*\)\s*\{/g,
        typescript: /\b\w+\s*\([^)]*\)\s*(:\s*\w+)?\s*\{/g,
        cpp: /\b\w+\s+\w+\s*\([^)]*\)\s*(const)?\s*\{/g,
    };
    
    const matches = classBody.match(methodPatterns[language]);
    return matches ? matches.length : 0;
}

/**
 * Run a single structural check
 */
export function runStructuralCheck(
    code: string, 
    testCase: StructuralCheck, 
    language: Language
): TestCaseResult {
    const check = testCase.check;
    const patterns = PATTERNS[language];
    const reasons: string[] = [];
    let passed = true;

    // Get language-specific overrides if any
    const langOverrides = testCase.languageHints?.[language];
    const effectiveCheck = langOverrides ? { ...check, ...langOverrides } : check;

    // Check: hasClass
    if (effectiveCheck.hasClass) {
        for (const className of effectiveCheck.hasClass) {
            if (!patterns.class(className).test(code)) {
                passed = false;
                reasons.push(`Missing class: ${className}`);
            }
        }
    }

    // Check: hasInterface
    if (effectiveCheck.hasInterface) {
        for (const ifaceName of effectiveCheck.hasInterface) {
            if (!patterns.interface(ifaceName).test(code)) {
                passed = false;
                reasons.push(`Missing interface: ${ifaceName}`);
            }
        }
    }

    // Check: hasAbstractClass
    if (effectiveCheck.hasAbstractClass) {
        for (const className of effectiveCheck.hasAbstractClass) {
            if (!patterns.abstractClass(className).test(code)) {
                passed = false;
                reasons.push(`Missing abstract class: ${className}`);
            }
        }
    }

    // Check: classExtends
    if (effectiveCheck.classExtends) {
        for (const { child, parent } of effectiveCheck.classExtends) {
            if (!patterns.extends(child, parent).test(code)) {
                passed = false;
                reasons.push(`${child} should extend ${parent}`);
            }
        }
    }

    // Check: classImplements
    if (effectiveCheck.classImplements) {
        for (const { class: cls, interface: iface } of effectiveCheck.classImplements) {
            if (!patterns.implements(cls, iface).test(code)) {
                passed = false;
                reasons.push(`${cls} should implement ${iface}`);
            }
        }
    }

    // Check: hasMethod
    if (effectiveCheck.hasMethod) {
        for (const { class: cls, method } of effectiveCheck.hasMethod) {
            if (!patterns.method(cls, method).test(code)) {
                passed = false;
                reasons.push(`Missing method: ${cls}.${method}()`);
            }
        }
    }

    // Check: containsPattern (custom regex)
    if (effectiveCheck.containsPattern) {
        for (const pattern of effectiveCheck.containsPattern) {
            if (!new RegExp(pattern, 'is').test(code)) {
                passed = false;
                reasons.push(`Missing required pattern`);
            }
        }
    }

    // Check: notContainsPattern (anti-patterns)
    if (effectiveCheck.notContainsPattern) {
        for (const pattern of effectiveCheck.notContainsPattern) {
            if (new RegExp(pattern, 'is').test(code)) {
                passed = false;
                reasons.push(`Contains anti-pattern (violates design principle)`);
            }
        }
    }

    // Check: maxMethodsPerClass
    if (effectiveCheck.maxMethodsPerClass) {
        const classNames = code.match(/class\s+(\w+)/g)?.map(m => m.replace('class ', '')) || [];
        for (const className of classNames) {
            const methodCount = countMethodsInClass(code, className, language);
            if (methodCount > effectiveCheck.maxMethodsPerClass) {
                passed = false;
                reasons.push(`${className} has ${methodCount} methods (max: ${effectiveCheck.maxMethodsPerClass})`);
            }
        }
    }

    // Check: minClassCount
    if (effectiveCheck.minClassCount) {
        const classCount = countClasses(code, language);
        if (classCount < effectiveCheck.minClassCount) {
            passed = false;
            reasons.push(`Only ${classCount} classes found (minimum: ${effectiveCheck.minClassCount})`);
        }
    }

    return {
        id: testCase.id,
        name: testCase.name,
        type: 'structural',
        status: passed ? 'pass' : 'fail',
        reason: passed ? 'All structural requirements met' : reasons.join('; '),
        pointsEarned: passed ? testCase.weight : 0,
        pointsPossible: testCase.weight,
    };
}

/**
 * Run all structural checks for a problem
 */
export function runAllStructuralChecks(
    code: string,
    testCases: StructuralCheck[],
    language: Language
): TestCaseResult[] {
    return testCases.map(tc => runStructuralCheck(code, tc, language));
}
