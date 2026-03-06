const fs = require('fs').promises;
const path = require('path');

const USER = 'weihua-studio';
const INDEX_URLS = {
  zh: 'https://gist.githubusercontent.com/weihua-studio/051d3a6a6a50ef1690166b9502212c5e/raw/1562b13f01211aba547b6c2f503676f2cf1ea6b1/library_index.json',
  en: 'https://gist.githubusercontent.com/weihua-studio/07ca630b76a6e93f26367df8112c248f/raw/2434214848fc1dab76fdc36e0d7e143355acdc0c/library_index_GlobalWorld.json'
};

function fileNameFromRawUrl(rawUrl) {
  const parsed = new URL(rawUrl);
  const parts = parsed.pathname.split('/').filter(Boolean);
  const fileName = decodeURIComponent(parts[parts.length - 1]);
  const gistId = parts[1];
  return `${gistId}_${fileName}`;
}

async function fetchText(url) {
  const response = await fetch(url, { headers: { 'User-Agent': 'github-action' } });
  if (!response.ok) {
    throw new Error(`Request failed for ${url}: ${response.status}`);
  }
  return response.text();
}

async function writeFile(targetPath, content) {
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, content, 'utf8');
}

(async function main() {
  const manifest = {
    generatedAt: new Date().toISOString(),
    indexes: {},
    libraries: {}
  };
  const api = `https://api.github.com/users/${USER}/gists`;

  console.log('Fetching gists list from', api);
  const res = await fetch(api, { headers: { 'User-Agent': 'github-action' } });
  if (!res.ok) throw new Error(`Gists API failed: ${res.status}`);
  const gists = await res.json();

  await fs.mkdir('data', { recursive: true });

  for (const gist of gists) {
    for (const [fileName, meta] of Object.entries(gist.files)) {
      if (!fileName.toLowerCase().endsWith('.json')) {
        continue;
      }

      try {
        console.log('Fetching', meta.raw_url);
        const text = await fetchText(meta.raw_url);
        const localName = `${gist.id}_${fileName}`;
        const localPath = path.join('data', localName);

        await writeFile(localPath, text);
        manifest.libraries[meta.raw_url] = `data/${localName}`;
        console.log('Saved', localPath);
      } catch (error) {
        console.error('Error fetching file', meta.raw_url, error);
      }
    }
  }

  for (const [lang, url] of Object.entries(INDEX_URLS)) {
    const localPath = `data/library_index_${lang}.json`;
    console.log('Fetching fixed index', url);
    const text = await fetchText(url);
    await writeFile(localPath, text);
    manifest.indexes[lang] = localPath;

    try {
      const parsed = JSON.parse(text);
      for (const remoteUrl of Object.values(parsed)) {
        manifest.libraries[remoteUrl] = manifest.libraries[remoteUrl] || `data/${fileNameFromRawUrl(remoteUrl)}`;
      }
    } catch (error) {
      console.error(`Failed to parse ${localPath}`, error);
    }
  }

  await writeFile('data/manifest.json', JSON.stringify(manifest, null, 2) + '\n');
  console.log('Saved data/manifest.json');
  console.log('Done.');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
