export const getTagColor = (id: number) => {
  const presetTagColor = [
    "pink",
    "red",
    "orange",
    "cyan",
    "green",
    "blue",
    "purple",
    "geekblue",
    "magenta",
    "volcano",
    "gold",
    "lime",
  ];
  const index = id % presetTagColor.length;
  return Number.isNaN(index) ? "red" : presetTagColor[index];
};
