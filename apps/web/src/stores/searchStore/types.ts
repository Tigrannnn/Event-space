export interface SearchState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
}