import calcItemDimensions from './pack.util';

describe('pack.util', () => {
  const width = 1280;
  const height = 800;
  it('should return nothing when items === 0', () => {
    const items = 0;
    expect(calcItemDimensions(items, width, height)).toEqual(null);
  });

  it('should have x = 3 and y = 2 for > 4 items', () => {
    const items = 6;
    const { x, y } = calcItemDimensions(items, width, height);
    expect({ x, y }).toEqual({ x: 3, y: 2 });
  });

  it('should return dimensions for single item', () => {
    const items = 1;
    const calc = calcItemDimensions(items, width, height);
    expect(calc.x).toEqual(1);
    expect(calc.y).toEqual(1);
  });
});
