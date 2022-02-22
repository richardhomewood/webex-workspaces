const homePath = 'home';

const splitPath = pathString => {
  const delimiter = '/';
  //  Workspace and room paths must begin with the '/' delimiter.
  if (pathString.charAt(0) !== delimiter) {
    return null;
  }
  return pathString.substring(1).split(delimiter);
}

const canonicalPath = location => {
  return location.hash === '' ? homePath : location.hash.substring(1);
}

module.exports.homePath = homePath;
module.exports.splitPath = splitPath;
module.exports.canonicalPath = canonicalPath;
