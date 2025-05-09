export type PriorityOption = (typeof PriorityOptions)[number]["value"];

export const PriorityOptions = [
    { value: "P1", label: "Urgent", color: "#FF0000" },
    { value: "P2", label: "High", color: "#FFA500" },
    { value: "P3", label: "Medium", color: "#FFFF00" },
    { value: "P4", label: "Low", color: "#00FF00" },
    { value: "P5", label: "No priority", color: "#808080" },
];
