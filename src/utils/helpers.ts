export const formatAuthorName = (author: string) => {
  if (!author) return 'Unknown';
  return author
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const generatePhotoTitle = (author: string, id: string): string => {
  return `${formatAuthorName(author)} #${id}`;
};

export const generatePhotoDescription = (
  author: string,
  width: number,
  height: number
): string => {
  return `A beautiful photograph by ${formatAuthorName(
    author
  )}. This image has dimensions of ${width} × ${height} pixels.`;
};
