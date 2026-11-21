import type { TacticalVolumeContact } from "@monohud/react";
import type { Hull } from "./state";

export type Contact = TacticalVolumeContact & {
  model: Hull;
  klass: string;
};

export const CONTACTS: Contact[] = [
  {
    id: "warden",
    label: "Warden",
    kind: "hostile",
    model: "corvette",
    klass: "Corvette",
    bearing: 222,
    range: 0.38,
    elevation: 0.5,
    code: "HX-1",
  },
  {
    id: "kestrel",
    label: "Kestrel",
    kind: "friendly",
    model: "frigate",
    klass: "Frigate",
    bearing: 38,
    range: 0.46,
    elevation: 0.3,
    code: "FR-2",
  },
  {
    id: "halcyon",
    label: "Halcyon",
    kind: "neutral",
    model: "freighter",
    klass: "Freighter",
    bearing: 128,
    range: 0.72,
    elevation: -0.25,
    code: "NT-7",
  },
  {
    id: "drift",
    label: "Drift swarm",
    kind: "hostile",
    model: "swarm",
    klass: "Swarm",
    bearing: 304,
    range: 0.81,
    elevation: -0.6,
    code: "SW-4",
  },
];

export const CONTACT_IDS: readonly string[] = CONTACTS.map((contact) => contact.id);

export const SCOPE_RANGE = 40;

export function contactById(id: string): Contact {
  return CONTACTS.find((contact) => contact.id === id) ?? CONTACTS[0];
}
