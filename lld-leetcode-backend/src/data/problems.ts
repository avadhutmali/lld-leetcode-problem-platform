// src/data/problems.ts

export interface TestCase {
    id: number;
    title: string;
    input: string;
    expected: string;
}

export interface Problem {
    id: string;
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    // NEW: Object containing code for each language
    starterCode: {
        typescript: string;
        java: string;
        cpp: string;
    };
    testCases: TestCase[];
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
            { id: 1, title: "Fee Strategy", input: "Constraint: Remove if-else fee logic", expected: "Implement Strategy Pattern (FeeStrategy interface)" },
            { id: 2, title: "Single Responsibility", input: "Scenario: Ticket generation", expected: "Separate Ticket class or method, not inside main Logic" },
            { id: 3, title: "Extensibility", input: "Requirement: Add Truck support", expected: "New class can be added without changing ParkingLot.cpp/java" }
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
        testCases: []
    }
];