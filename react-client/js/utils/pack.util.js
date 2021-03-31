const aspect = 0.75;

function defineGrid(itemCount, containerWidth, containerHeight) {
  const grids = [];
  for (let i = 1; i <= itemCount; i += 1) {
    const x = i;
    const y = Math.ceil(itemCount / i);
    let itemWidth;
    let itemHeight;

    if (x >= y) {
      itemWidth = Math.floor(containerWidth / x);
      itemHeight = itemWidth * aspect;
    } else {
      itemHeight = Math.floor(containerHeight / y);
      itemWidth = itemHeight / aspect;
    }

    if (itemHeight > containerHeight) {
      itemHeight = containerHeight;
      itemWidth = itemHeight / aspect;
    } else if (itemWidth > containerWidth) {
      itemWidth = containerWidth;
      itemHeight = itemWidth * aspect;
    }

    const area = itemWidth * itemHeight;
    grids.push({
      x,
      y,
      area,
      width: Math.floor(itemWidth),
      height: Math.floor(itemHeight),
    });
  }

  return grids;
}

export default function fullPack(itemCount, areaWidth, areaHeight) {
  if (itemCount === 0) {
    return null;
  }

  const containerArea = areaWidth * areaHeight;
  const grid = defineGrid(itemCount, areaWidth, areaHeight);
  const maxArea = grid
    .filter(({
      area, x, y, width, height,
    }) => {
      const validArea = (area * itemCount) <= containerArea;
      const xFits = (width * x) <= areaWidth;
      const yFits = (height * y) <= areaHeight;
      return validArea && xFits && yFits;
    })
    .sort((a, b) => {
      if (a.area < b.area) return 1;
      if (a.area > b.area) return -1;
      return 0;
    });

  return maxArea[0];
}
