const axios = require('axios');
const fs = require('fs');
const chains = ['eth', 'bsc', 'ftm', 'avax', 'cro', 'arbi', 'poly', 'base', 'sol', 'sonic'];


async function fetchTokenData(contract) {
    for (const chain of chains) {
        try {
            console.log(`🔍 Trying chain: ${chain}`);

            const metaUrl = `https://api-legacy.bubblemaps.io/map-metadata?chain=${chain}&token=${contract}`;
            const mapUrl = `https://api-legacy.bubblemaps.io/map-data?chain=${chain}&token=${contract}`;

            const headers = {
                'x-api-key': process.env.BUBBLEMAPS_API_KEY || '', // 🔐 Optional
            };

            const [metaRes, mapRes] = await Promise.all([
                axios.get(metaUrl, { headers }),
                axios.get(mapUrl, { headers }),
            ]);

            const meta = metaRes.data;
            const map = mapRes.data;



            const logs = {
                meta: meta,
                map: map,
            };

            fs.writeFileSync('logs.json', JSON.stringify(logs, null, 2), 'utf-8');

            if (!map.nodes || !Array.isArray(map.nodes)) {
                throw new Error("Invalid map data: nodes is not an array");
            }

            const maxSupplyRaw = map.metadata?.max_amount;

            console.log(`🔍 Max Supply Raw: ${maxSupplyRaw}`);

            const formatNumberWithSuffix = (num) => {
                if (num >= 1e18) return (num / 1e18).toFixed(2) + 'Q'; // Quintillion
                if (num >= 1e15) return (num / 1e15).toFixed(2) + 'P'; // Quadrillion
                if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T'; // Trillion
                if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';   // Billion
                if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';   // Million
                if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';   // Thousand
                return num.toLocaleString(); // raw number with commas
            };

            const maxSupplyFormatted = formatNumberWithSuffix(maxSupplyRaw);
            console.log(`🔍 Max Supply Formatted: ${maxSupplyFormatted}`);

            return {
                chain,
                name: map.full_name,
                symbol: map.symbol,
                maxsupply: maxSupplyFormatted || 'N/A',
                decentralizationScore: meta.decentralisation_score || 'N/A',
                percentcexs: meta.identified_supply.percent_in_cexs || 'N/A',
                percentcontracts: meta.identified_supply.percent_in_contracts || 'N/A',
                clusters: map.nodes,
                topHolders: map.nodes.slice(0, 3).map((n, i) => ({
                    rank: i + 1,
                    name: n.name || n.address,
                    amount: n.amount,
                    percentage: n.percentage,
                })),
            };
        } catch (err) {
            console.log(`❌ ${chain.toUpperCase()} failed: ${err.message}`);
        }
    }

    throw new Error('Token not found on any chain.');
}

module.exports = { fetchTokenData };
