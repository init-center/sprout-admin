export default function combineClassNames(...classNames: string[]): string {
  return classNames.reduce((acc, cur) => {
    return cur ? `${acc} ${cur}` : acc;
  });
}
