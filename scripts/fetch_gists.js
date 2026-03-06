const fs = require('fs').promises;

(async function main(){
  const user = 'weihua-studio';
  const api = `https://api.github.com/users/${user}/gists`;
  console.log('Fetching gists list from', api);

  const res = await fetch(api, { headers: { 'User-Agent': 'github-action' } });
  if (!res.ok) throw new Error(`Gists API failed: ${res.status}`);
  const gists = await res.json();

  await fs.mkdir('data', { recursive: true });

  for (const gist of gists) {
    for (const [fname, meta] of Object.entries(gist.files)) {
      // Save JSON files and also any file that looks like JSON
      if (!fname.toLowerCase().endsWith('.json')) continue;
      try {
        console.log('Fetching', meta.raw_url);
        const r = await fetch(meta.raw_url);
        if (!r.ok) { console.warn('Failed', meta.raw_url); continue; }
        const txt = await r.text();
        const outName = `data/${gist.id}_${fname}`;
        await fs.writeFile(outName, txt, 'utf8');
        console.log('Saved', outName);
      } catch (e) { console.error('Error fetching file', meta.raw_url, e); }
    }
  }
  console.log('Done.');
})().catch(e => { console.error(e); process.exit(1); });
