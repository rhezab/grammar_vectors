export function reshapeWordPairData(data, categoryOne, categoryTwo) {
  return data.map((curr, index) => {
    return [
      {
        x: Number(curr.x_1),
        y: Number(curr.y_1),
        word: curr.word_1,
        xAxis: curr.x_axis,
        yAxis: curr.y_axis,
        category: categoryOne,
        which: '1'
      },
      {
        x: Number(curr.x_2),
        y: Number(curr.y_2),
        word: curr.word_2,
        xAxis: curr.x_axis,
        yAxis: curr.y_axis,
        category: categoryTwo,
        which: '2'
      }
    ];
  });
}

export function getCorrectGradient(d) {
  if (Math.abs(d.x_2 - d.x_1) - Math.abs(d.y_2 - d.y_1) > 0) {
    if (d.x_2 - d.x_1 > 0) {
      return 'url(#gradient-to-right)';
    }
    return 'url(#gradient-to-left)';
  }
  if (d.y_2 - d.y_1 < 0) {
    return 'url(#gradient-to-top)';
  }
  return 'url(#gradient-to-bottom)';
}

export function getCoordinates(data, xAxis, yAxis) {
  return data.map((curr, index) => {
    return {
      sourceWord: curr.sourceWord,
      sourceX: curr.sourceVector[xAxis],
      sourceY: curr.sourceVector[yAxis],
      targetWord: curr.targetWord,
      targetX: curr.targetVector[xAxis],
      targetY: curr.targetVector[yAxis]
    };
  });
}

export function getPolar(coordinates) {
  return coordinates.map((curr, index) => {
    const x = curr.targetX - curr.sourceX;
    const y = curr.targetY - curr.sourceY;
    return {
      sourceWord: curr.sourceWord,
      targetWord: curr.targetWord,
      distance: Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)),
      angle: Math.atan2(y, x)
    };
  });
}

// export function getDomain(polar, key) {
//   return polar.reduce((acc, curr, index) => {
//     const radius =
//     return {
//       max: curr[key] > acc.max ? curr[key] : acc.max,
//       min: curr[key] < acc.min ? curr[key] : acc.min
//     };
//   }, {max: -Infinity, min: Infinity});
// }

export function getDomain(coordinates) {
  return coordinates.reduce((acc, curr, index) => {
    const radius = Math.sqrt(Math.pow(curr.x, 2) + Math.pow(curr.y, 2));
    return {
      max: radius > acc.max ? radius : acc.max,
      min: radius < acc.min ? radius : acc.min
    };
  }, {max: -Infinity, min: Infinity});
}

export function getCircleCoordinates(polar) {
  return polar.map((curr, index) => {
    const scaledDistance = curr.distance;
    return {
      sourceWord: curr.sourceWord,
      targetWord: curr.targetWord,
      x: scaledDistance === 0 ? 0 : scaledDistance * Math.cos(curr.angle),
      y: scaledDistance === 0 ? 0 : scaledDistance * Math.sin(curr.angle)
    };
  });
}

export function getCircleCoordinatesQuickly(data, xAxis, yAxis) {
  return data.map((curr, index) => {
    const sourceWord = curr.sourceWord;
    const sourceX = curr.sourceVector[xAxis];
    const sourceY = curr.sourceVector[yAxis];
    const targetWord = curr.targetWord;
    const targetX = curr.targetVector[xAxis];
    const targetY = curr.targetVector[yAxis];

    const x = targetX - sourceX;
    const y = targetY - sourceY;
    // const distance = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    // const angle = Math.atan2(y, x);

    // const circleX = distance === 0 ? 0 : distance * Math.cos(angle);
    // const circleY = distance === 0 ? 0 : distance * Math.sin(angle);

    return {
      sourceWord,
      targetWord,
      x,
      y
    };
  });
}

export function getGuidelineData(domain, data) {
  if (data.length > 0) {
    return data.map((curr, index) => {
      const distance = Math.sqrt(Math.pow(curr.x, 2) + Math.pow(curr.y, 2));
      const scaleFactor = domain.max / distance;
      return [{x: 0, y: 0}, {x: curr.x * scaleFactor, y: curr.y * scaleFactor}];
    });
  }
  return [];
}

export function getRadialAxesData(scale, numAxes) {
  const result = Array(numAxes).fill(0);
  return result.map((curr, index) => {
    return {
      angle: 0,
      angle0: 2 * Math.PI,
      radius0: scale(index + 1),
      radius: scale(index + 1 + 0.01)
    };
  });
}

export function buildVoronoiPoints(circleCoordinates) {
  return circleCoordinates.map((curr, index) => {
    return 0;
  });
}

export function nodeMap(circleCoordinates) {
  return circleCoordinates.reduce((acc, curr, index) => {
    acc[curr.sourceWord] = curr;
    return acc;
  }, {});
}

export function nodeMapTarget(circleCoordinates) {
  return circleCoordinates.reduce((acc, curr, index) => {
    acc[curr.targetWord] = curr;
    return acc;
  }, {});
}
