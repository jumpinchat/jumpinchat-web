import React from 'react';

export default (string, matches, replaceFunc) => {
  let last = 0;
  const result = [];
  matches.forEach((match, i) => {
    const keyBefore = `text-before${i}`;
    if (last < match.index) {
      result.push(<span key={keyBefore}>{string.slice(last, match.index)}</span>);
    }

    result.push(replaceFunc(match));
    last = match.lastIndex;
  });

  if (last < string.length) {
    result.push(<span key="text-last">{string.slice(last)}</span>);
  }
  return result;
};
