import { PlayerColor } from '@/types/game';

export const PLAYER_COLORS: PlayerColor[] = [
  { id: 'red', hex: '#C51111', label: 'Red' },
  { id: 'blue', hex: '#132ED1', label: 'Blue' },
  { id: 'green', hex: '#117F2D', label: 'Green' },
  { id: 'purple', hex: '#6B2FBB', label: 'Purple' },
  { id: 'yellow', hex: '#F5F557', label: 'Yellow' },
  { id: 'black', hex: '#3F474E', label: 'Black' },
  { id: 'white', hex: '#D7E1F1', label: 'White' },
  { id: 'orange', hex: '#EF7D0D', label: 'Orange' },
  { id: 'pink', hex: '#EC54BB', label: 'Pink' },
  { id: 'brown', hex: '#71491E', label: 'Brown' },
  { id: 'cyan', hex: '#38FEDC', label: 'Cyan' },
  { id: 'lime', hex: '#50EF39', label: 'Lime' },
  { id: 'maroon', hex: '#6B2737', label: 'Maroon' },
  { id: 'rose', hex: '#EC7578', label: 'Rose' },
  { id: 'banana', hex: '#F5F07A', label: 'Banana' },
  { id: 'coral', hex: '#F19D1A', label: 'Coral' },
  { id: 'gray', hex: '#8397A7', label: 'Gray' },
  { id: 'tan', hex: '#928776', label: 'Tan' },
];

export function getColor(id: string): PlayerColor {
  return PLAYER_COLORS.find(c => c.id === id) ?? PLAYER_COLORS[0];
}
