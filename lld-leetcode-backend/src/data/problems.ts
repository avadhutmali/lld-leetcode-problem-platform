// src/data/problems.ts

import { LLDTestCase } from '../types/testCase.types';

export interface Problem {
    id: string;
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    starterCode: {
        typescript: string;
        java: string;
        cpp: string;
    };
    testCases: LLDTestCase[];  // New structured test cases
}

export const PROBLEMS: Problem[] = [
    {
        id: "1",
        title: "Refactor: Parking Lot System",
        description: `
### Problem Statement
You are given a legacy **Parking Lot** system that is poorly designed. 
Currently, the \`ParkingLot\` class handles everything: managing spots, calculating fees using a massive \`if-else\` block, and printing tickets.

### Issues to Fix:
1. **Violation of SRP:** The \`ParkingLot\` class is doing too much (Logic + Data + Printing).
2. **Violation of OCP:** Adding a new vehicle type (e.g., "Truck") requires modifying the core \`calculateFee\` method.
3. **Scalability:** The system uses a simple list and doesn't handle different parking strategies.

### Your Task:
Refactor the code to use:
* **Strategy Pattern** for Fee Calculation.
* **Separate Classes** for \`Ticket\`, \`Spot\`, and \`ParkingLot\`.
* Ensure the code is extensible for future vehicle types.
        `,
        difficulty: "Medium",
        starterCode: {
            typescript: `// BROKEN CODE: Refactor this!

class ParkingLot {
    spots: any[] = [];

    // Bad Design: Hardcoded fee logic
    calculateFee(type: string, hours: number) {
        if (type === "Car") return hours * 20;
        else if (type === "Bike") return hours * 10;
        else return 0;
    }

    // Bad Design: Mixed responsibility
    park(type: string) {
        console.log("Parking a " + type);
        this.spots.push(type);
    }
}`,
            java: `// BROKEN CODE: Refactor this!
import java.util.*;

public class ParkingLot {
    private List<String> spots = new ArrayList<>();

    // VIOLATION: Open/Closed Principle
    // If we add "Truck", we must modify this code.
    public double calculateFee(String type, int hours) {
        if (type.equals("Car")) {
            return hours * 20;
        } else if (type.equals("Bike")) {
            return hours * 10;
        }
        return 0;
    }

    public void parkVehicle(String type) {
        System.out.println("Parking " + type);
        spots.add(type);
    }
}`,
            cpp: `// BROKEN CODE: Refactor this!
#include <iostream>
#include <vector>
#include <string>

using namespace std;

class ParkingLot {
    vector<string> spots;

public:
    // VIOLATION: OCP & Magic Numbers
    double calculateFee(string type, int hours) {
        if (type == "Car") return hours * 20.0;
        else if (type == "Bike") return hours * 10.0;
        return 0.0;
    }

    void park(string type) {
        cout << "Parking " << type << endl;
        spots.push_back(type);
    }
};`
        },
        testCases: [
            // ===== STRUCTURAL CHECKS (Automated) =====
            {
                id: "struct-1",
                name: "Has FeeStrategy Interface",
                type: "structural",
                weight: 15,
                check: {
                    hasInterface: ["FeeStrategy"],
                },
                languageHints: {
                    cpp: { containsPattern: ["class\\s+FeeStrategy[^}]*virtual.*=\\s*0"] }
                }
            },
            {
                id: "struct-2",
                name: "Has Vehicle Class Hierarchy",
                type: "structural",
                weight: 15,
                check: {
                    hasClass: ["Vehicle"],
                    minClassCount: 3,
                }
            },
            {
                id: "struct-3",
                name: "No If-Else Chain for Fees",
                type: "structural",
                weight: 20,
                check: {
                    notContainsPattern: ["if.*Car.*else.*if.*Bike"],
                }
            },
            {
                id: "struct-4",
                name: "Separate Ticket Class",
                type: "structural",
                weight: 10,
                check: {
                    hasClass: ["Ticket"],
                }
            },
            // ===== AI CHECKS (Subjective) =====
            {
                id: "ai-1",
                name: "Single Responsibility Principle",
                type: "ai",
                weight: 15,
                criteria: "Each class should have only one reason to change. ParkingLot should not handle fee calculation directly.",
                passIndicators: ["Fee calculation delegated to strategy", "Ticket generation in separate class"],
                failIndicators: ["ParkingLot calculates fees directly", "One class does everything"]
            },
            {
                id: "ai-2",
                name: "Open/Closed Principle",
                type: "ai",
                weight: 15,
                criteria: "Adding a new vehicle type (e.g., Truck) should not require modifying existing classes.",
                passIndicators: ["New vehicle = new class implementing interface", "Strategy pattern used"],
                failIndicators: ["Would need to add else-if for new vehicle", "Hardcoded vehicle types"]
            },
            {
                id: "ai-3",
                name: "Code Quality & Extensibility",
                type: "ai",
                weight: 10,
                criteria: "Code is clean, well-organized, and easy to extend.",
                passIndicators: ["Clear naming", "Proper encapsulation", "Follows language conventions"],
                failIndicators: ["Magic numbers", "Poor naming", "Tight coupling"]
            }
        ]
    },
    {
        id: "2",
        title: "Notification System",
        description: "Design a notification system that can send alerts via Email, SMS, and Push Notification. Ensure it follows the Open/Closed Principle so new types can be added easily.",
        difficulty: "Easy",
        starterCode: {
            typescript: `interface Notification { send(msg: string): void; }`,
            java: `interface Notification { void send(String msg); }`,
            cpp: `class Notification { virtual void send(string msg) = 0; };`
        },
        testCases: [
            // Structural
            {
                id: "struct-1",
                name: "Has Notification Interface",
                type: "structural",
                weight: 20,
                check: {
                    hasInterface: ["Notification"],
                },
                languageHints: {
                    cpp: { containsPattern: ["class\\s+Notification[^}]*virtual"] }
                }
            },
            {
                id: "struct-2",
                name: "Has Multiple Notification Types",
                type: "structural",
                weight: 20,
                check: {
                    minClassCount: 3,
                }
            },
            {
                id: "struct-3",
                name: "EmailNotification Exists",
                type: "structural",
                weight: 10,
                check: {
                    hasClass: ["EmailNotification"],
                }
            },
            {
                id: "struct-4",
                name: "SMSNotification Exists",
                type: "structural",
                weight: 10,
                check: {
                    hasClass: ["SMSNotification"],
                }
            },
            // AI
            {
                id: "ai-1",
                name: "Open/Closed Principle",
                type: "ai",
                weight: 25,
                criteria: "Adding a new notification type (e.g., Slack) should only require adding a new class.",
                passIndicators: ["Each notification type is a separate class", "Common interface implemented"],
                failIndicators: ["Switch/case on notification type", "Single class handles all types"]
            },
            {
                id: "ai-2",
                name: "Proper Abstraction",
                type: "ai",
                weight: 15,
                criteria: "The design uses proper abstraction with interfaces/abstract classes.",
                passIndicators: ["Interface defines contract", "Concrete classes implement interface"],
                failIndicators: ["No abstraction used", "Direct instantiation only"]
            }
        ]
    }
];