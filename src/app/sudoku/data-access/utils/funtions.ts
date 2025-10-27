const encodeBoard = (board: number[][]): string =>
  board.reduce(
    (result: string, row: number[], i: number) =>
      result +
      `%5B${encodeURIComponent(row as unknown as string)}%5D${
        i === board.length - 1 ? '' : '%2C'
      }`,
    ''
  );

export const encodeParams = (params: Record<string, number[][]>): string =>
  Object.keys(params)
    .map((key: string) => key + '=' + `%5B${encodeBoard(params[key])}%5D`)
    .join('&');
