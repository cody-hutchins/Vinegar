import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface LibraryState {
  backgroundNotification: {
    show: boolean,
    message: string,
    total: number,
    progress: number,
  },
  songs: {
    sortingOptions: {
      albumName: string,
      artistName: string,
      name: string,
      genre: string,
      releaseDate: string,
      durationInMillis: string,
      dateAdded: string,
    },
    sorting: "dateAdded" |"name",
    sortOrder: "asc" | "desc",
    listing: string[],
    meta: { total: number, progress: number },
    search: string,
    displayListing: string[],
    downloadState: number, // 0 = not started, 1 = in progress, 2 = complete, 3 = empty library
  },
  albums: {
    sortingOptions: {
      artistName: string,
      name: string,
      genre: string,
      releaseDate: string,
    },
    viewAs: string,
    sorting: "dateAdded"| "name", // [0] = recentlyadded page, [1] = albums page
    sortOrder: "desc" | "asc", // [0] = recentlyadded page, [1] = albums page
    listing: string[],
    meta: { total: number, progress: number },
    search: string,
    displayListing: string[],
    downloadState: number, // 0 = not started, 1 = in progress, 2 = complete, 3 = empty library
  },
  artists: {
    sortingOptions: {
      artistName: string,
      name: string,
      genre: string,
      releaseDate: string,
    },
    viewAs: string,
    sorting: "dateAdded" |"name", // [0] = recentlyadded page, [1] = albums page
    sortOrder: "desc" |"asc", // [0] = recentlyadded page, [1] = albums page
    listing: string[],
    meta: { total: number, progress: number },
    search: string,
    displayListing: string[],
    downloadState: number, // 0 = not started, 1 = in progress, 2 = complete, 3 = empty library
  },
  localsongs: string[],
};

export const useLibraryStore = create<LibraryState>()(immer((set) => ({
  backgroundNotification: {
    show: false,
    message: "",
    total: 0,
    progress: 0,
  },
  songs: {
    sortingOptions: {
      albumName: "0",
      artistName: "0",
      name: "0",
      genre: "0",
      releaseDate: "0",
      durationInMillis: "0",
      dateAdded: "0",
    },
    sorting: "name",
    sortOrder: "asc",
    listing: [],
    meta: { total: 0, progress: 0 },
    search: "",
    displayListing: [],
    downloadState: 0, // 0 = not started, 1 = in progress, 2 = complete, 3 = empty library
  },
  albums: {
    sortingOptions: {
      artistName: "0",
      name: "0",
      genre: "0",
      releaseDate: "0",
    },
    viewAs: "covers",
    sorting: "dateAdded", // [0] = recentlyadded page, [1] = albums page
    sortOrder: "desc", // [0] = recentlyadded page, [1] = albums page
    listing: [],
    meta: { total: 0, progress: 0 },
    search: "",
    displayListing: [],
    downloadState: 0, // 0 = not started, 1 = in progress, 2 = complete, 3 = empty library
  },
  artists: {
    sortingOptions: {
      artistName: "0",
      name: "0",
      genre: "0",
      releaseDate: "0",
    },
    viewAs: "covers",
    sorting: "dateAdded", // [0] = recentlyadded page, [1] = albums page
    sortOrder: "desc", // [0] = recentlyadded page, [1] = albums page
    listing: [],
    meta: { total: 0, progress: 0 },
    search: "",
    displayListing: [],
    downloadState: 0, // 0 = not started, 1 = in progress, 2 = complete, 3 = empty library
  },
  localsongs: [],
})));