#!/bin/sh

if ! [ -z "$BASEPATH" ]; then 
  echo "Replacing basepath with: $BASEPATH"

  # Escape BASEPATH for sed substitution
  #  - replaces / with \/
  #  - replaces " with \"
  escaped_basepath=$(printf '%s\n' "$BASEPATH" | sed -e 's/[\/&]/\\&/g' -e 's/"/\\"/g')

  # run the substitution
  #  replaces <base href="/" />
  #  with whatever BASEPATH is set to
  sed -i "s/<base href=\"\/\" \/>/<base href=\"$escaped_basepath\" \/>/g" /usr/share/nginx/html/index.html

  echo "Replaced basepath in index.html"
fi 