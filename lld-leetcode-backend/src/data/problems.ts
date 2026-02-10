// src/data/problems.ts

export interface Problem {
    id: string;
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    starterCode: string;
}

export const PROBLEMS: Problem[] = [
    {
        id: "1",
        title: "Design a Parking Lot",
        description: "Design a parking lot system that can handle different vehicle types (Car, Bike, Truck). The system should assign spots based on vehicle size and calculate fees.",
        difficulty: "Medium",
        starterCode: `class ParkingLot {
  // Write your code here
}
`
    },
    {
        id: "2",
        title: "Notification System",
        description: "Design a notification system that can send alerts via Email, SMS, and Push Notification. Ensure it follows the Open/Closed Principle so new types can be added easily.",
        difficulty: "Easy",
        starterCode: `interface Notification {
  send(message: string): void;
}
`
    }
];