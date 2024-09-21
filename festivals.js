const festivals = [
    {
        "name": "Holi Festival",
        "cities": ["delhi", "kathmandu"],
        "start": new Date("2025-02-15"),
        "end": new Date("2025-03-15"),
        "message": "for the Holi Festival",
        "info": "This colourful holiday is celebrated in India and Nepal and is about the triumph of good over evil."
    },
    {
        "name": "Harbin Snow Sculpture Festival",
        "cities": ["beijing"],
        "start": new Date("2025-12-05"),
        "end": new Date("2026-01-05"),
        "message": "to attend the Harbin Snow Sculpture Festival",
        "info": "This festival is celebrated in China and is a beautiful and unique event that showcases ice and snow sculptures."
    },
    {
        "name": "Cherry Blossoms",
        "cities": ["tokyo"],
        "start": new Date("2025-03-15"),
        "end": new Date("2025-04-15"),
        "message": "to see the Cherry Blossoms",
        "info": "This festival is celebrated in China and is a beautiful and unique event that showcases ice and snow sculptures."
    },
    {
        "name": "Diwali",
        "cities": ["delhi"],
        "start": new Date("2025-10-02"),
        "end": new Date("2025-11-30"),
        "message": "for Diwali",
        "info": "Diwali is celebrated in India and is also commonly called the Indian Festival of Lights."
    },
    {
        "name": "Songkran",
        "cities": ["bangkok"],
        "start": new Date("2025-03-20"),
        "end": new Date("2025-04-13"),
        "message": "for Songkran",
        "info": "Songkran Celebrated in Thailand. It involves splashing water at other people."
    },
    {
        "name": "Loy Krathong",
        "cities": ["bangkok"],
        "start": new Date("2025-11-01"),
        "end": new Date("2025-11-30"),
        "message": "to attend Loy Krathong",
        "info": "Loi Krathong, the Thailand Festival of Light, means floating basket."
    },
    {
        "name": "Chingay Parade",
        "cities": ["singapore"],
        "start": new Date("2025-02-01"),
        "end": new Date("2025-02-28"),
        "message": "to see the Chingay Parade",
        "info": "This parade celebrates Singapore’s multi-ethnic culture."
    },
    {
        "name": "Durga Puja",
        "cities": ["delhi"],
        "start": new Date("2025-09-10"),
        "end": new Date("2025-10-05"),
        "message": "for Durga Puja",
        "info": "Durga Puja is a Hindu festival that celebrates good over evil and light over darkness."
    },
    {
        "name": "Singapore Art Festival",
        "cities": ["singapore"],
        "start": new Date("2025-01-03"),
        "end": new Date("2025-01-30"),
        "message": "to visit the Singapore Art Festival",
        "info": "This is a festival in Singapore that showcases beautiful art."
    },
    {
        "name": "Bali Kite Festival",
        "cities": ["jakarta"],
        "start": new Date("2025-07-10"),
        "end": new Date("2025-08-20"),
        "message": "to see the Kite Festival",
        "info": "This is an Indonesian festival showing a variety of different kites."
    },
];

function festivalsFor(date) {
    const match = [];
    for (var i = 0; i < festivals.length; i++) {
        const f = festivals[i];
        if (date >= f.start && date <= f.end) {
            match.push(f);
        }
    }
    return match;
}

export { festivalsFor };