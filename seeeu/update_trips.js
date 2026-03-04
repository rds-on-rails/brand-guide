const fs = require('fs');
const https = require('https');

const terms = {
    "disneyland-paris": "disneyland paris",
    "mount-titlis": "mount titlis",
    "cologne-day-trip": "cologne cathedral germany",
    "keukenhof-gardens": "keukenhof tulips",
    "giethoorn-mega": "giethoorn canals",
    "normandy-special": "mont saint michel",
    "french-riviera": "cannes french riviera",
    "super-switzerland": "swiss alps mountain",
    "dolomites-dreamscape": "dolomites italy",
    "flower-parade": "tulip fields holland"
};

async function getImageUrl(term) {
    return new Promise((resolve) => {
        https.get(`https://unsplash.com/napi/search/photos?query=${encodeURIComponent(term)}&per_page=1`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json.results[0].urls.regular);
                } catch { resolve("https://images.unsplash.com/photo-1500530855697-b586d8e0f4f2?auto=format&fit=crop&q=80&w=800"); }
            });
            res.on('error', () => resolve("https://images.unsplash.com/photo-1500530855697-b586d8e0f4f2?auto=format&fit=crop&q=80&w=800"));
        });
    });
}

(async () => {
    let fileContent = fs.readFileSync('./src/data/trips.ts', 'utf-8');

    for (const [id, term] of Object.entries(terms)) {
        const newUrl = await getImageUrl(term);

        const regex = new RegExp(`(id:\\s*"${id}"[\\s\\S]*?imageUrl:\\s*")[^"]+(")`);
        if (fileContent.match(regex)) {
            fileContent = fileContent.replace(regex, `$1${newUrl}$2`);
            console.log(`Updated ${id} with ${newUrl}`);
        }
    }

    fs.writeFileSync('./src/data/trips.ts', fileContent, 'utf-8');
    console.log("trips.ts updated successfully with regular URLs!");
})();
