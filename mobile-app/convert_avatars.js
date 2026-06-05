const fs = require('fs');
const path = require('path');

const avatarDir = path.join(__dirname, 'src/assets/avatars');
const outputFile = path.join(__dirname, 'src/assets/AvatarData.js');

const avatars = {};

for (let i = 1; i <= 10; i++) {
    const fileName = `dr${i}.png`;
    const filePath = path.join(avatarDir, fileName);
    if (fs.existsSync(filePath)) {
        const base64 = fs.readFileSync(filePath).toString('base64');
        avatars[`dr${i}`] = `data:image/png;base64,${base64}`;
        console.log(`Converted ${fileName} to base64`);
    }
}

const content = `export const AVATAR_DATA = ${JSON.stringify(avatars, null, 2)};`;
fs.writeFileSync(outputFile, content);
console.log('Created AvatarData.js');
