const https = require('https');

const terms = [
    'disneyland paris',
    'mount titlis switzerland',
    'cologne cathedral',
    'keukenhof tulips',
    'giethoorn netherland',
    'mont saint michel france',
    'cannes',
    'swiss alps',
    'dolomites italy',
    'tulip fields holland'
];

async function getImageUrl(term) {
    return new Promise((resolve) => {
        https.get(`https://unsplash.com/napi/search/photos?query=${encodeURIComponent(term)}&per_page=1`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json.results[0].id);
                } catch { resolve(null); }
            });
        });
    });
}

(async () => {
    for (const term of terms) {
        const id = await getImageUrl(term);
        console.log(`${term.padEnd(25)} : https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=800`);
    }
})();
