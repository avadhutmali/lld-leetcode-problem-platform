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
    },
    {
        id: "3",
        title: "Design a Logger Library",
        description: "Build a logger that supports INFO, DEBUG, and ERROR levels. The client should configure an output sink (Console/File) without changing logger core logic.",
        difficulty: "Easy",
        starterCode: {
            typescript: `class Logger {
  log(level: string, message: string) {
    console.log(level + ": " + message);
  }
}`,
            java: `public class Logger {
    public void log(String level, String message) {
        System.out.println(level + ": " + message);
    }
}`,
            cpp: `#include <iostream>
#include <string>

class Logger {
public:
    void log(const std::string& level, const std::string& message) {
        std::cout << level << ": " << message << std::endl;
    }
};`
        },
        testCases: [
            {
                id: "struct-1",
                name: "Has LogSink Interface",
                type: "structural",
                weight: 20,
                check: { hasInterface: ["LogSink"] },
                languageHints: {
                    cpp: { containsPattern: ["class\\s+LogSink[^}]*virtual"] }
                }
            },
            {
                id: "struct-2",
                name: "Has ConsoleSink",
                type: "structural",
                weight: 15,
                check: { hasClass: ["ConsoleSink"] }
            },
            {
                id: "struct-3",
                name: "Has FileSink",
                type: "structural",
                weight: 15,
                check: { hasClass: ["FileSink"] }
            },
            {
                id: "ai-1",
                name: "Extensible Sink Design",
                type: "ai",
                weight: 25,
                criteria: "Logger should depend on sink abstraction so new sinks can be added without changing Logger.",
                passIndicators: ["Dependency injection used", "No hardcoded output in Logger"],
                failIndicators: ["Logger directly uses console/file APIs"]
            },
            {
                id: "ai-2",
                name: "Readable and Maintainable API",
                type: "ai",
                weight: 25,
                criteria: "Public API should be clean, with clear log level handling and low coupling.",
                passIndicators: ["Simple API", "Clear naming"],
                failIndicators: ["Confusing parameters", "Duplicated logic"]
            }
        ]
    },
    {
        id: "4",
        title: "Coffee Machine",
        description: "Design a coffee machine that can prepare Espresso, Cappuccino, and Latte. Keep recipe preparation logic separate from inventory tracking.",
        difficulty: "Easy",
        starterCode: {
            typescript: `class CoffeeMachine {
  make(type: string) {
    if (type === "ESPRESSO") return "Espresso";
    if (type === "CAPPUCCINO") return "Cappuccino";
    return "Latte";
  }
}`,
            java: `public class CoffeeMachine {
    public String make(String type) {
        if (type.equals("ESPRESSO")) return "Espresso";
        if (type.equals("CAPPUCCINO")) return "Cappuccino";
        return "Latte";
    }
}`,
            cpp: `#include <string>

class CoffeeMachine {
public:
    std::string make(const std::string& type) {
        if (type == "ESPRESSO") return "Espresso";
        if (type == "CAPPUCCINO") return "Cappuccino";
        return "Latte";
    }
};`
        },
        testCases: [
            {
                id: "struct-1",
                name: "Has Beverage Interface",
                type: "structural",
                weight: 20,
                check: { hasInterface: ["Beverage"] },
                languageHints: {
                    cpp: { containsPattern: ["class\\s+Beverage[^}]*virtual"] }
                }
            },
            {
                id: "struct-2",
                name: "Has Espresso Class",
                type: "structural",
                weight: 10,
                check: { hasClass: ["Espresso"] }
            },
            {
                id: "struct-3",
                name: "Has Cappuccino Class",
                type: "structural",
                weight: 10,
                check: { hasClass: ["Cappuccino"] }
            },
            {
                id: "struct-4",
                name: "Has Latte Class",
                type: "structural",
                weight: 10,
                check: { hasClass: ["Latte"] }
            },
            {
                id: "ai-1",
                name: "Factory-like Object Creation",
                type: "ai",
                weight: 25,
                criteria: "Object creation should be centralized and easy to extend.",
                passIndicators: ["Factory method/class", "No long if-else chain in service method"],
                failIndicators: ["Hardcoded type branching everywhere"]
            },
            {
                id: "ai-2",
                name: "Separation of Responsibilities",
                type: "ai",
                weight: 25,
                criteria: "Recipe creation and inventory/state updates should be separated.",
                passIndicators: ["Dedicated classes/components"],
                failIndicators: ["Single god class for all responsibilities"]
            }
        ]
    },
    {
        id: "5",
        title: "Elevator Control System",
        description: "Design an elevator system for a 20-floor building. Add a scheduling strategy so request handling can be swapped without modifying core elevator classes.",
        difficulty: "Medium",
        starterCode: {
            typescript: `class ElevatorSystem {
  dispatch(requestFloor: number, currentFloor: number) {
    if (requestFloor > currentFloor) return "UP";
    return "DOWN";
  }
}`,
            java: `public class ElevatorSystem {
    public String dispatch(int requestFloor, int currentFloor) {
        if (requestFloor > currentFloor) return "UP";
        return "DOWN";
    }
}`,
            cpp: `#include <string>

class ElevatorSystem {
public:
    std::string dispatch(int requestFloor, int currentFloor) {
        if (requestFloor > currentFloor) return "UP";
        return "DOWN";
    }
};`
        },
        testCases: [
            {
                id: "struct-1",
                name: "Has SchedulingStrategy Interface",
                type: "structural",
                weight: 20,
                check: { hasInterface: ["SchedulingStrategy"] },
                languageHints: {
                    cpp: { containsPattern: ["class\\s+SchedulingStrategy[^}]*virtual"] }
                }
            },
            {
                id: "struct-2",
                name: "Has Elevator Class",
                type: "structural",
                weight: 10,
                check: { hasClass: ["Elevator"] }
            },
            {
                id: "struct-3",
                name: "Has ElevatorController Class",
                type: "structural",
                weight: 10,
                check: { hasClass: ["ElevatorController"] }
            },
            {
                id: "struct-4",
                name: "No Hardcoded Direction If-Else",
                type: "structural",
                weight: 15,
                check: { notContainsPattern: ["if.*UP.*else.*DOWN"] }
            },
            {
                id: "ai-1",
                name: "Strategy-driven Scheduling",
                type: "ai",
                weight: 25,
                criteria: "Scheduling should be pluggable via strategy (nearest car, scan, etc.).",
                passIndicators: ["Controller uses strategy abstraction"],
                failIndicators: ["Scheduling algorithm hardcoded in controller"]
            },
            {
                id: "ai-2",
                name: "State Management Design",
                type: "ai",
                weight: 20,
                criteria: "Elevator state (direction, floor, requests) should be encapsulated cleanly.",
                passIndicators: ["Clear state representation", "Good method boundaries"],
                failIndicators: ["Scattered state updates"]
            }
        ]
    },
    {
        id: "6",
        title: "Document Exporter",
        description: "Build a document exporter supporting PDF and Markdown. Add optional features like compression and encryption without editing base exporters.",
        difficulty: "Medium",
        starterCode: {
            typescript: `class Exporter {
  export(format: string, content: string) {
    if (format === "PDF") return "pdf:" + content;
    return "md:" + content;
  }
}`,
            java: `public class Exporter {
    public String export(String format, String content) {
        if (format.equals("PDF")) return "pdf:" + content;
        return "md:" + content;
    }
}`,
            cpp: `#include <string>

class Exporter {
public:
    std::string exportDoc(const std::string& format, const std::string& content) {
        if (format == "PDF") return "pdf:" + content;
        return "md:" + content;
    }
};`
        },
        testCases: [
            {
                id: "struct-1",
                name: "Has DocumentExporter Interface",
                type: "structural",
                weight: 20,
                check: { hasInterface: ["DocumentExporter"] },
                languageHints: {
                    cpp: { containsPattern: ["class\\s+DocumentExporter[^}]*virtual"] }
                }
            },
            {
                id: "struct-2",
                name: "Has PdfExporter",
                type: "structural",
                weight: 10,
                check: { hasClass: ["PdfExporter"] }
            },
            {
                id: "struct-3",
                name: "Has MarkdownExporter",
                type: "structural",
                weight: 10,
                check: { hasClass: ["MarkdownExporter"] }
            },
            {
                id: "struct-4",
                name: "Has Decorator Classes",
                type: "structural",
                weight: 15,
                check: { minClassCount: 4 }
            },
            {
                id: "ai-1",
                name: "Decorator Pattern Usage",
                type: "ai",
                weight: 25,
                criteria: "Compression/encryption should wrap exporters without modifying core implementations.",
                passIndicators: ["Composition over inheritance", "Decorator-like wrappers"],
                failIndicators: ["Feature toggles via large if-else"]
            },
            {
                id: "ai-2",
                name: "Open for Extension",
                type: "ai",
                weight: 20,
                criteria: "New export formats and new decorators should be added with minimal code changes.",
                passIndicators: ["Abstraction-driven design"],
                failIndicators: ["Tight coupling between features"]
            }
        ]
    },
    {
        id: "7",
        title: "Ride Sharing Dispatch",
        description: "Design a mini ride-sharing backend where riders request rides and available drivers get matched using a pluggable matching strategy.",
        difficulty: "Hard",
        starterCode: {
            typescript: `class RideService {
  assign(driverIds: string[], riderId: string) {
    return driverIds[0] + "->" + riderId;
  }
}`,
            java: `import java.util.*;

public class RideService {
    public String assign(List<String> driverIds, String riderId) {
        return driverIds.get(0) + "->" + riderId;
    }
}`,
            cpp: `#include <vector>
#include <string>

class RideService {
public:
    std::string assign(const std::vector<std::string>& driverIds, const std::string& riderId) {
        return driverIds[0] + "->" + riderId;
    }
};`
        },
        testCases: [
            {
                id: "struct-1",
                name: "Has MatchingStrategy Interface",
                type: "structural",
                weight: 20,
                check: { hasInterface: ["MatchingStrategy"] },
                languageHints: {
                    cpp: { containsPattern: ["class\\s+MatchingStrategy[^}]*virtual"] }
                }
            },
            {
                id: "struct-2",
                name: "Has Driver and Rider Entities",
                type: "structural",
                weight: 15,
                check: { hasClass: ["Driver", "Rider"] }
            },
            {
                id: "struct-3",
                name: "Has Trip Class",
                type: "structural",
                weight: 10,
                check: { hasClass: ["Trip"] }
            },
            {
                id: "struct-4",
                name: "Has Dispatcher Class",
                type: "structural",
                weight: 10,
                check: { hasClass: ["Dispatcher"] }
            },
            {
                id: "ai-1",
                name: "Decoupled Matching Logic",
                type: "ai",
                weight: 25,
                criteria: "Matching logic should be independent from trip lifecycle and entity models.",
                passIndicators: ["Strategy abstraction", "Dispatcher delegates matching"],
                failIndicators: ["Single class handles all concerns"]
            },
            {
                id: "ai-2",
                name: "Scalable Domain Modeling",
                type: "ai",
                weight: 20,
                criteria: "Design should support surge pricing, cancellation, and new matching algorithms.",
                passIndicators: ["Extension points", "Clean domain boundaries"],
                failIndicators: ["Hardcoded assumptions"]
            }
        ]
    },
    {
        id: "8",
        title: "Splitwise Expense Settlement",
        description: "Design an expense sharing system that supports equal, exact, and percentage split types. Settlement should be isolated from input parsing and storage concerns.",
        difficulty: "Hard",
        starterCode: {
            typescript: `class ExpenseService {
  split(total: number, users: string[]) {
    const share = total / users.length;
    return users.map(u => ({ user: u, amount: share }));
  }
}`,
            java: `import java.util.*;

public class ExpenseService {
    public Map<String, Double> split(double total, List<String> users) {
        Map<String, Double> out = new HashMap<>();
        double share = total / users.size();
        for (String user : users) out.put(user, share);
        return out;
    }
}`,
            cpp: `#include <vector>
#include <string>
#include <utility>

class ExpenseService {
public:
    std::vector<std::pair<std::string, double>> split(double total, const std::vector<std::string>& users) {
        std::vector<std::pair<std::string, double>> out;
        double share = total / users.size();
        for (const auto& user : users) out.push_back({user, share});
        return out;
    }
};`
        },
        testCases: [
            {
                id: "struct-1",
                name: "Has SplitStrategy Interface",
                type: "structural",
                weight: 20,
                check: { hasInterface: ["SplitStrategy"] },
                languageHints: {
                    cpp: { containsPattern: ["class\\s+SplitStrategy[^}]*virtual"] }
                }
            },
            {
                id: "struct-2",
                name: "Has EqualSplit and ExactSplit",
                type: "structural",
                weight: 15,
                check: { hasClass: ["EqualSplit", "ExactSplit"] }
            },
            {
                id: "struct-3",
                name: "Has PercentSplit",
                type: "structural",
                weight: 10,
                check: { hasClass: ["PercentSplit"] }
            },
            {
                id: "struct-4",
                name: "Has BalanceSheet",
                type: "structural",
                weight: 10,
                check: { hasClass: ["BalanceSheet"] }
            },
            {
                id: "ai-1",
                name: "Strategy-based Split Calculation",
                type: "ai",
                weight: 25,
                criteria: "Split algorithms should be encapsulated and selected without conditional explosion.",
                passIndicators: ["Separate classes for split algorithms"],
                failIndicators: ["Large branching in one method"]
            },
            {
                id: "ai-2",
                name: "Separation of Settlement Concerns",
                type: "ai",
                weight: 20,
                criteria: "Expense input, split computation, and balance updates should be decoupled.",
                passIndicators: ["Dedicated services/components"],
                failIndicators: ["Monolithic expense service"]
            }
        ]
    }
];