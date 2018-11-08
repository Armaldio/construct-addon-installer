const gitlog = require('gitlog');
const fs = require('fs');

const options = {
  repo: `${__dirname}/..`,
  number: 200,
  fields:
    ['hash', 'abbrevHash', 'subject', 'authorName', 'authorEmail', 'committerName', 'authorDate', 'body', 'rawBody'],
  execOptions: {
    maxBuffer: 1024000,
  },
};

let string = '';

function addShield(elem) {
  console.log(`Elem: ${elem}`);
  if (elem.split(' ')[0].toLowerCase() === 'add') { return `![Shield](https://img.shields.io/badge/status-add-green.svg) ${elem.substr(elem.indexOf(' ') + 1)}`; } else if (elem.split(' ')[0].toLowerCase() === 'fix') { return `![Shield](https://img.shields.io/badge/status-fix-yellow.svg) ${elem.substr(elem.indexOf(' ') + 1)}`; } else if (elem.split(' ')[0].toLowerCase() === 'update' || elem.split(' ')[0].toLowerCase() === 'updated') { return `![Shield](https://img.shields.io/badge/status-update-blue.svg) ${elem.substr(elem.indexOf(' ') + 1)}`; }
  return elem;
}

function beautify(rawBody) {
  rawBody = rawBody.split('\n');

  let insideApp = false;
  let insideExtension = false;

  for (let i = 0; i < rawBody.length; i++) {
    if (rawBody[i].includes('Extension:')) {
      insideExtension = true;
      insideApp = false;
      rawBody[i] = `* ${rawBody[i]}`;
    } else if (rawBody[i].includes('App:')) {
      rawBody[i] = `* ${rawBody[i]}`;
      insideApp = true;
      insideExtension = false;
    } else if (!rawBody[i].startsWith('*') && rawBody[i] !== '') { rawBody[i] = ((insideApp || insideExtension) ? '\t- ' : '- ') + addShield(rawBody[i]); }
  }

  rawBody = rawBody.filter(v => v !== '');

  return rawBody.join('\n');
}

gitlog(options, (error, commits) => {
  for (let i = 0; i < commits.length; i++) {
    const commit = commits[i];
    string += `[${commit.authorName}](mailto:${commit.authorEmail}) - ${commit.authorDate} - [Commit](https://github.com/WebCreationClub/construct-addon-installer/commit/${commit.hash})
<br>
${beautify(commit.rawBody)}

<hr>

`;
  }
  fs.writeFileSync('CHANGELOG.md', string, 'utf8');
});
