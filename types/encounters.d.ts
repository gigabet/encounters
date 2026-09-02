export interface EncountersD {
    encounters: Encounter[];
}

export interface Encounter {
    id:             string;
    title:          string;
    category:       Category;
    pillars:        Pillar[];
    pitch:          string;
    genre:          Genre[];
    creature_type?: string[];
    threat:         Threat;
    prep:           Prep;
    environment:    string[];
    premise:        string;
    sections:       Section[];
    dm_notes?:      string;
    checks:         Check[];
    tags:           string[];
}

export type Category = "Location" | "Object" | "NPC" | "Phenomenon";

export interface Check {
    check:  string;
    detail: string;
}

export type Genre = "gothic" | "body horror" | "folk horror" | "melancholic" | "liminal" | "psychological" | "cosmic";

export type Pillar = "exploration" | "combat" | "social";

export type Prep = "drop-in" | "short" | "quest";

export interface Section {
    title:       string;
    description: string;
    examples?:   string[];
}

export type Threat = "deadly" | "nuisance" | "safe";
