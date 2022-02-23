const homePath = 'home';
const separator = '/';
const devicePath = 'device';

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

const isDevicePath = path => path.indexOf(`${separator}${devicePath}${separator}`) > -1

const makePath = pathParts => separator + pathParts.join(separator);

module.exports = {
    canonicalPath: canonicalPath,
    devicePath: devicePath,
    homePath: homePath,
    isDevicePath: isDevicePath,
    makePath: makePath,
    splitPath: splitPath
};
