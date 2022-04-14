#!/usr/bin/env bash

# Check for prerequisites
IS_CONVERT_INSTALLED=$(command -v convert)
IS_IMAGEOPTIM_INSTALLED=$(command -v imageoptim)

if [ -z "$IS_CONVERT_INSTALLED" ]
then
  echo The ImageMagick convert executable must be in the PATH. >&2
  echo See https://imagemagick.org/ for details. >&2
fi
if [ -z "$IS_IMAGEOPTIM_INSTALLED" ]
then
  echo The ImageOptim executable must be in the PATH. >&2
  echo See https://imageoptim.com/mac for details. >&2
fi

if [ -z "$IS_CONVERT_INSTALLED" ] || [ -z "$IS_IMAGEOPTIM_INSTALLED" ]
then
  exit 1;
fi

# Loop over file arguments
for file in "$@"
do
  # Preserve the originals
  SOURCE_FILE="${file}"
  if grep -q ".jpg$" <<< "${file}"
  then
    SOURCE_FILE="${file}.orig"
    mv "${file}" "${SOURCE_FILE}"
  fi

  NEW_FILE="${file%.*}.jpg"
  convert "${SOURCE_FILE}" -resize 5760x5760\> -background white -flatten -quality 90 "${NEW_FILE}"
  imageoptim "${NEW_FILE}"
done
