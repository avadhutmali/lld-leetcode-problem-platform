// src/types/testCase.types.ts

/**
 * LLD Test Case Schema
 * Hybrid approach: Structural checks (automated) + AI evaluation (subjective)
 */

// ============ STRUCTURAL TEST CASE ============
// These are validated automatically via regex/AST - no AI needed

export interface StructuralCheck {
    id: string;
    name: string;                           // Display name: "Has FeeStrategy interface"
    type: 'structural';
    weight: number;                         // Points for this check (e.g., 10)
    
    // What to check (at least one required)
    check: {
        // Class/Interface existence
        hasClass?: string[];                // ["Vehicle", "Car", "Bike"]
        hasInterface?: string[];            // ["FeeStrategy", "ParkingStrategy"]
        hasAbstractClass?: string[];        // ["AbstractVehicle"]
        
        // Inheritance/Implementation
        classExtends?: { child: string; parent: string }[];      // Car extends Vehicle
        classImplements?: { class: string; interface: string }[];// CarFee implements FeeStrategy
        
        // Method checks
        hasMethod?: { class: string; method: string }[];         // ParkingLot.park()
        
        // Pattern indicators (regex-based)
        containsPattern?: string[];         // Regex patterns to find in code
        notContainsPattern?: string[];      // Patterns that should NOT exist (e.g., "if.*else.*if" for OCP)
        
        // Metrics
        maxMethodsPerClass?: number;        // SRP: no class should have more than N methods
        minClassCount?: number;             // Minimum number of classes expected
    };
    
    // Language-specific overrides (optional)
    languageHints?: {
        java?: Partial<StructuralCheck['check']>;
        typescript?: Partial<StructuralCheck['check']>;
        cpp?: Partial<StructuralCheck['check']>;
    };
}

// ============ AI-EVALUATED TEST CASE ============
// These require AI judgment - subjective design quality

export interface AICheck {
    id: string;
    name: string;                           // "Follows Single Responsibility"
    type: 'ai';
    weight: number;
    
    // Criteria for AI to evaluate
    criteria: string;                       // "Each class should have only one reason to change"
    
    // Expected indicators (helps AI grade more consistently)
    passIndicators?: string[];              // ["Separate classes for Ticket, Spot, Vehicle"]
    failIndicators?: string[];              // ["ParkingLot handles fees, tickets, and parking"]
}

// ============ COMBINED TYPE ============
export type LLDTestCase = StructuralCheck | AICheck;

// ============ EVALUATION RESULT ============
export interface TestCaseResult {
    id: string;
    name: string;
    type: 'structural' | 'ai';
    status: 'pass' | 'fail';
    reason: string;                         // Why it passed/failed
    pointsEarned: number;
    pointsPossible: number;
}

export interface EvaluationResult {
    totalScore: number;                     // Sum of earned points
    maxScore: number;                       // Sum of possible points
    percentage: number;                     // 0-100
    testResults: TestCaseResult[];
    summary: string;                        // AI-generated summary
    suggestions: string[];                  // Improvement tips
}
