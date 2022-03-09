const homePath = 'home';
const separator = '/';
const hardwarePathPart = 'hardware';
const infoPathPart = 'info';

const splitPath = pathString => {
    //  Workspace and room paths must begin with the '/' separator.
    if (pathString.charAt(0) !== separator) {
        return null;
    }
    return pathString.substring(1).split(separator);
}

const canonicalPath = location => {
    return location.hash === '' ? homePath : location.hash.substring(1);
}

const hash = location => {
    return location.hash === '' ? null : location.hash.substring(1);
}


const makePath = pathParts => separator + pathParts.join(separator);

// Limit the result to 3 parts: '#', the workspace ID, and the room ID
const removeModalPaths = pathString => pathString.split('/', 3).join('/');

module.exports = {
    getHash: hash,
    canonicalPath: canonicalPath,
    hardwarePathPart: hardwarePathPart,
    homePath: homePath,
    infoPathPart: infoPathPart,
    makePath: makePath,
    removeModalPaths: removeModalPaths,
    splitPath: splitPath
};
