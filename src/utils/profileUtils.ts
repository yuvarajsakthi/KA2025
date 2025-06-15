
const colors = [
  'bg-red-500',
  'bg-blue-500', 
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-cyan-500'
];

export const getProfileInitials = (name: string): string => {
  const nameParts = name.trim().split(' ');
  if (nameParts.length >= 2) {
    return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export const getProfileColor = (userId: string): string => {
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export const getValidProfileImage = (avatar: string, userId: string, name: string): { type: 'letter'; initials: string; color: string } => {
  // Always return letter profile instead of photos
  return {
    type: 'letter',
    initials: getProfileInitials(name),
    color: getProfileColor(userId)
  };
};
