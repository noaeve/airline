import { randomElement } from "./random.js";

const surnames = {
    "_": ["Pot", "Vent", "Tail", "Mote", "Fort", "Kent", "Drill", "Fang", "Gold", "Hall"],
    "astana": ["Kozlov", "Aitbayev"],
    "bangkok": [],
    "beijing": ["Chen", "Li"],
    "delhi": ["Kumar", "Nair", "Jain"],
    "hanoi": ["Le", "Pham"],
    "hobart": [],
    "istanbul": ["Kaya", "Demir"],
    "jakarta": [],
    "kabul": [],
    "kathmandu": ["Sharma","Thapa"],
    "manila": ["Garcia", "Ramos"],
    "melbourne": [],
    "perth": [],
    "riyadh": ["Al-Saud", "Al-Harbi"],
    "seoul": ["Lee", "Park"],
    "singapore": ["Yeo", "Lim"],
    "sydney": [],
    "tehran": ["Hosseini"],
    "tokyo": ["Sato", "Ono"],
    "ulaanbaatar": ["Bat-Erdene", "Munkh-Orgil"],
    "wellington": [],
};
const titles = [
    "Mr", "Mr", "Mr", "Dr", "Ms", "Mrs", "Miss"
];

function randomName(cities) {
    const names = surnames["_"].slice();
    for (var i = 0; i < arguments.length; i++) {
        const a = surnames[arguments[i]];
        if(a) {
            names.push(...a);
            names.push(...a);
            names.push(...a);
        }
    }
    return randomElement(titles) + ' ' + randomElement(names);
}

export { randomName };