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
    threat:         Threat;
    prep:           Prep;
    environment:    string[];
    premise:        string;
    sections:       Section[];
    checks:         Check[];
    tags:           string[];
    creature_type?: string[];
    dm_notes?:      string;
}

export type Category = "Phenomenon" | "Location" | "NPC" | "Object";

export interface Check {
    check:  string;
    detail: string;
}

export type Genre = "cosmic" | "liminal" | "psychological" | "folk" | "body horror" | "gothic" | "melancholic";

export type Pillar = "exploration" | "social" | "combat";

export type Prep = "drop-in" | "short" | "quest";

export interface Section {
    title:       string;
    description: string;
    examples?:   string[];
}

export type Threat = "nuisance" | "deadly" | "safe";
