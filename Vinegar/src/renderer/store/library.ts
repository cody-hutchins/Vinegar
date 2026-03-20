import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { asyncForEach, notyf } from "../main/helpers.js";
import { CiderCache } from "../main/cidercache.js";
import { MusicKitTools } from "../main/musickittools.js";

interface LibraryState {
  backgroundNotification: {
    show: boolean;
    message: string;
    total: number;
    progress: number;
  };
  selectedMediaItems: MusicKit.MediaItem[];
  songs: {
    sortingOptions: {
      albumName: string;
      artistName: string;
      name: string;
      genre: string;
      releaseDate: string;
      durationInMillis: string;
      dateAdded: string;
    };
    sorting: "dateAdded" | "name";
    sortOrder: "asc" | "desc";
    listing: MusicKit.Songs[];
    meta: { total: number; progress: number };
    search: string;
    displayListing: MusicKit.Songs[];
    downloadState: number; // 0 = not started, 1 = in progress, 2 = complete, 3 = empty library
  };
  albums: {
    sortingOptions: {
      artistName: string;
      name: string;
      genre: string;
      releaseDate: string;
    };
    viewAs: string;
    sorting: "dateAdded" | "name"; // [0] = recentlyadded page, [1] = albums page
    sortOrder: "desc" | "asc"; // [0] = recentlyadded page, [1] = albums page
    listing: MusicKit.LibraryAlbums[];
    meta: { total: number; progress: number };
    search: string;
    displayListing: MusicKit.LibraryAlbums[];
    downloadState: number; // 0 = not started, 1 = in progress, 2 = complete, 3 = empty library
  };
  artists: {
    sortingOptions: {
      artistName: string;
      name: string;
      genre: string;
      releaseDate: string;
    };
    viewAs: string;
    sorting: "dateAdded" | "name"; // [0] = recentlyadded page, [1] = albums page
    sortOrder: "desc" | "asc"; // [0] = recentlyadded page, [1] = albums page
    listing: MusicKit.Artists[];
    meta: { total: number; progress: number };
    search: string;
    displayListing: MusicKit.Artists[];
    downloadState: number; // 0 = not started, 1 = in progress, 2 = complete, 3 = empty library
  };
  playlists: {
    listing: MusicKit.Playlists[];
    details: Record<string, any>;
    loadingState: number; // 0 loading, 1 loaded, 2 error
    id: string;
    trackMapping: Record<string, any>;
  };

  socialBadges: {
    badgeMap: Record<string, any>;
    version: string;
    mediaItems: string[];
    mediaItemDLState: number; // 0 = not started, 1 = in progress, 2 = complete
  };
  localsongs: string[];
  getLibraryGenres: () => Array<string>;
  sortPlaylists: () => void;
}

export const useLibraryStore = create<LibraryState>()(
  immer((set, get) => ({
    selectedMediaItems: [],
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
    playlists: {
      listing: [],
      details: {},
      loadingState: 0, // 0 loading, 1 loaded, 2 error
      id: "",
      trackMapping: {},
    },
    socialBadges: {
      badgeMap: {},
      version: "",
      mediaItems: [],
      mediaItemDLState: 0, // 0 = not started, 1 = in progress, 2 = complete
    },
    localsongs: [],
    // Actually fills the store doesn't return
    getLibrarySongs: () =>
      set((state) => {
        this.mkapi("songs", true, "", { limit: 100, l: this.mklang }, { includeResponseMeta: !0 }).then((response) => {
          state.songs.listing = response.data.data;
          state.songs.meta = response.data.meta;
        });
      }),
    getLibraryGenres: () => {
      const genres: string[] = [];
      get().songs.listing.forEach((item) => {
        item.attributes.genreNames.forEach((genre) => {
          if (!genres.includes(genre)) {
            genres.push(genre);
          }
        });
      });
      return genres;
    },
    // Actually fills the store doesn't return
    getLibraryAlbums: () =>
      set(async (state) => {
        this.mkapi("albums", true, "", { limit: 100, l: this.mklang }, { includeResponseMeta: !0 }).then((response) => {
          state.albums.listing = response.data.data;
          state.albums.meta = response.data.meta;
        });
      }),
    isInLibrary(playParams?: { isLibrary: boolean; catalogId: string; id: string }) {
      let id = "";
      // ugly code to check if current playback item is in library
      if (typeof playParams === "undefined") {
        return true;
      }
      if (playParams["isLibrary"]) {
        return true;
      } else if (playParams["catalogId"]) {
        id = playParams["catalogId"];
      } else if (playParams["id"]) {
        id = playParams["id"];
      }
      const found = get().songs.listing.filter((item) => {
        if (item["attributes"]) {
          if (item["attributes"]["playParams"] && item["attributes"]["playParams"]["catalogId"] === id) {
            return item;
          }
        }
      });
      if (found.length !== 0) {
        return true;
      } else {
        return false;
      }
    },
    searchLibrarySongs: () =>
      set((state) => {
        const prefs = this.cfg.libraryPrefs.songs;

        function sortSongs() {
          // sort get().songs.displayListing by song.attributes[get().songs.sorting] in descending or ascending order based on alphabetical order and numeric order
          // check if song.attributes[get().songs.sorting] is a number and if so, sort by number if not, sort by alphabetical order ignoring case
          state.songs.displayListing.sort((a, b) => {
            if (!a.attributes && !b.attributes) return 0;
            else if (!a.attributes) return -1;
            else if (!b.attributes) return 1;
            let aa = a.attributes[prefs.sort];
            let bb = b.attributes[prefs.sort];
            if (prefs.sort === "genre") {
              aa = a.attributes!.genreNames[0];
              bb = b.attributes!.genreNames[0];
            } else if (prefs.sort === "dateAdded") {
              aa = a.relationships?.albums?.data[0]?.attributes?.dateAdded;
              bb = b.relationships?.albums?.data[0]?.attributes?.dateAdded;
              // if dateAdded is equal, an entire album was added at once, so sorting by track number (in reverse order because lower track number should be above in descending mode)
              if (aa === bb) {
                aa = b.attributes.trackNumber;
                bb = a.attributes.trackNumber;
              }
            } else if (prefs.sort === "artistName") {
              if (a.relationships?.artists?.data[0]?.id === b.relationships?.artists?.data[0]?.id) {
                aa = a.attributes.albumName;
                bb = b.attributes.albumName;
              }
              if (a.relationships?.albums?.data[0]?.id === b.relationships?.albums?.data[0]?.id) {
                aa = a.attributes.trackNumber;
                bb = b.attributes.trackNumber;
              }
            } else if (prefs.sort === "albumName") {
              if (a.relationships?.albums?.data[0]?.id === b.relationships?.albums?.data[0]?.id) {
                aa = a.attributes.trackNumber;
                bb = b.attributes.trackNumber;
              }
            }
            if (aa === null) {
              aa = "";
            }
            if (bb === null) {
              bb = "";
            }
            if (prefs.sortOrder === "asc") {
              if (aa.toString().match(/^\d+$/) && bb.toString().match(/^\d+$/)) {
                return aa - bb;
              } else {
                return aa.toString().toLowerCase().localeCompare(bb.toString().toLowerCase());
              }
            } else if (prefs.sortOrder === "desc") {
              if (aa.toString().match(/^\d+$/) && bb.toString().match(/^\d+$/)) {
                return bb - aa;
              } else {
                return bb.toString().toLowerCase().localeCompare(aa.toString().toLowerCase());
              }
            }
          });
        }

        if (get().songs.search === "") {
          state.songs.displayListing = get().songs.listing;
          sortSongs();
        } else {
          state.songs.displayListing = get().songs.listing.filter((item) => {
            let itemName = item.attributes!.name.toLowerCase();
            let searchTerm = get().songs.search.toLowerCase();
            let artistName = "";
            let albumName = "";
            if (item.attributes!.artistName !== null) {
              artistName = item.attributes!.artistName.toLowerCase();
            }
            if (item.attributes!.albumName !== null) {
              albumName = item.attributes!.albumName.toLowerCase();
            }

            // remove any non-alphanumeric characters and spaces from search term and item name
            searchTerm = searchTerm.replace(/[^\p{L}\p{N} ]/gu, "");
            itemName = itemName.replace(/[^\p{L}\p{N} ]/gu, "");
            artistName = artistName.replace(/[^\p{L}\p{N} ]/gu, "");
            albumName = albumName.replace(/[^\p{L}\p{N} ]/gu, "");

            if (itemName.includes(searchTerm) || artistName.includes(searchTerm) || albumName.includes(searchTerm)) {
              return item;
            }
          });
          sortSongs();
        }
      }),
    // Actually sets the album sorting from the config
    getAlbumSort: () =>
      set((state) => {
        state.albums.sortOrder = this.cfg.libraryPrefs.albums.sortOrder;
        state.albums.sorting = this.cfg.libraryPrefs.albums.sort;
      }),
    // make a copy of searchLibrarySongs except use Albums instead of Songs
    searchLibraryAlbums: (index: number) =>
      set((state) => {
        function sortAlbums() {
          // sort get().albums.displayListing by album.attributes[get().albums.sorting[index]] in descending or ascending order based on alphabetical order and numeric order
          // check if album.attributes[get().albums.sorting[index]] is a number and if so, sort by number if not, sort by alphabetical order ignoring case
          state.albums.displayListing.sort((a, b) => {
            let aa = a.attributes[get().albums.sorting[index]];
            let bb = b.attributes[get().albums.sorting[index]];
            if (get().albums.sorting[index] === "genre") {
              aa = a.attributes.genreNames[0];
              bb = b.attributes.genreNames[0];
            } else if (get().albums.sorting[index] === "dateAdded") {
              aa = a.attributes?.dateAdded;
              bb = b.attributes?.dateAdded;
            }
            if (aa === null) {
              aa = "";
            }
            if (bb === null) {
              bb = "";
            }
            if (get().albums.sortOrder[index] === "asc") {
              if (aa.toString().match(/^\d+$/) && bb.toString().match(/^\d+$/)) {
                return aa - bb;
              } else {
                return aa.toString().toLowerCase().localeCompare(bb.toString().toLowerCase());
              }
            } else if (get().albums.sortOrder[index] === "desc") {
              if (aa.toString().match(/^\d+$/) && bb.toString().match(/^\d+$/)) {
                return bb - aa;
              } else {
                return bb.toString().toLowerCase().localeCompare(aa.toString().toLowerCase());
              }
            }
          });
        }

        if (get().albums.search === "") {
          state.albums.displayListing = get().albums.listing;
          sortAlbums();
        } else {
          state.albums.displayListing = get().albums.listing.filter((item) => {
            let itemName = item.attributes.name.toLowerCase();
            let searchTerm = get().albums.search.toLowerCase();
            let artistName = "";
            let albumName = "";
            if (item.attributes.artistName !== null) {
              artistName = item.attributes.artistName.toLowerCase();
            }
            if (item.attributes.albumName !== null) {
              albumName = item.attributes.albumName.toLowerCase();
            }

            // remove any non-alphanumeric characters and spaces from search term and item name
            searchTerm = searchTerm.replace(/[^\p{L}\p{N} ]/gu, "");
            itemName = itemName.replace(/[^\p{L}\p{N} ]/gu, "");
            artistName = artistName.replace(/[^\p{L}\p{N} ]/gu, "");
            albumName = albumName.replace(/[^\p{L}\p{N} ]/gu, "");

            if (itemName.includes(searchTerm) || artistName.includes(searchTerm) || albumName.includes(searchTerm)) {
              return item;
            }
          });
          sortAlbums();
        }
      }),
    // make a copy of searchLibrarySongs except use Albums instead of Songs
    searchLibraryArtists: (index) =>
      set((state) => {
        function sortArtists() {
          // sort get().albums.displayListing by album.attributes[get().albums.sorting[index]] in descending or ascending order based on alphabetical order and numeric order
          // check if album.attributes[get().albums.sorting[index]] is a number and if so, sort by number if not, sort by alphabetical order ignoring case
          state.artists.displayListing.sort((a, b) => {
            let aa = a.attributes[get().artists.sorting[index]];
            let bb = b.attributes[get().artists.sorting[index]];
            if (get().artists.sorting[index] === "genre") {
              aa = a.attributes.genreNames[0];
              bb = b.attributes.genreNames[0];
            }
            if (aa === null) {
              aa = "";
            }
            if (bb === null) {
              bb = "";
            }
            if (get().artists.sortOrder[index] === "asc") {
              if (aa.toString().match(/^\d+$/) && bb.toString().match(/^\d+$/)) {
                return aa - bb;
              } else {
                return aa.toString().toLowerCase().localeCompare(bb.toString().toLowerCase());
              }
            } else if (get().artists.sortOrder[index] === "desc") {
              if (aa.toString().match(/^\d+$/) && bb.toString().match(/^\d+$/)) {
                return bb - aa;
              } else {
                return bb.toString().toLowerCase().localeCompare(aa.toString().toLowerCase());
              }
            }
          });
        }

        if (get().artists.search === "") {
          state.artists.displayListing = get().artists.listing;
          sortArtists();
        } else {
          state.artists.displayListing = get().artists.listing.filter((item) => {
            let itemName = item.attributes!.name.toLowerCase();
            let searchTerm = get().artists.search.toLowerCase();
            const artistName = "";
            const albumName = "";
            // if (item.attributes.artistName !== null) {
            //     artistName = item.attributes.artistName.toLowerCase()
            // }
            // if (item.attributes.albumName !== null) {
            //     albumName = item.attributes.albumName.toLowerCase()
            // }

            // remove any non-alphanumeric characters and spaces from search term and item name
            searchTerm = searchTerm.replace(/[^\p{L}\p{N} ]/gu, "");
            itemName = itemName.replace(/[^\p{L}\p{N} ]/gu, "");

            if (itemName.includes(searchTerm) || artistName.includes(searchTerm) || albumName.includes(searchTerm)) {
              return item;
            }
          });
          sortArtists();
        }
      }),
    getLibrarySongsFull: async (force = false) =>
      set((state) => {
        let library = [];
        const cacheId = "library-songs";
        const downloaded = null;
        this.resetRecentlyAdded();
        if (get().songs.downloadState === 2 && !force) {
          return;
        }
        if (get().songs.downloadState === 1) {
          return;
        }
        const librarySongs = await CiderCache.getCache(cacheId);
        if (librarySongs) {
          state.songs.listing.data = librarySongs;
          this.searchLibrarySongs();
        }
        if (this.songstest) {
          return;
        }
        state.songs.downloadState = 1;
        state.backgroundNotification.show = true;
        state.backgroundNotification.message = this.getLz("notification.updatingLibrarySongs");

        library = await MusicKitTools.v3Continuous({
          href: `/v1/me/library/songs/`,
          options: {
            "include[library-songs]": "catalog,artists,albums",
            "fields[artists]": "name,url,id",
            "fields[albums]": "name,url,id",
            platform: "web",
            "fields[catalog]": "artistUrl,albumUrl",
            "fields[songs]": "artistName,artistUrl,artwork,contentRating,editorialArtwork,name,playParams,releaseDate,url",
            limit: 100,
            l: this.mklang,
          },
          onProgress: (data) => {
            console.debug(`${data.total}/${data.response.data.meta.total}`);
            state.backgroundNotification.show = true;
            state.backgroundNotification.message = this.getLz("notification.updatingLibrarySongs");
            state.backgroundNotification.total = data.response.data.meta.total;
            state.backgroundNotification.progress = data.total;
          },
          onSuccess: () => {},
        });

        state.songs.listing = library;
        state.songs.downloadState = 2;
        state.backgroundNotification.show = false;
        this.searchLibrarySongs();
        CiderCache.putCache(cacheId, library);
        console.debug("Done!");

        return;
      }),
    // copy the getLibrarySongsFull function except change Songs to Albums
    getLibraryAlbumsFull: async (force = false, index) =>
      set((state) => {
        let library = [];
        const cacheId = "library-albums";
        let downloaded = null;
        if ((get().albums.downloadState === 2 || get().albums.downloadState === 1) && !force) {
          return;
        }
        const libraryAlbums = await CiderCache.getCache(cacheId);
        if (libraryAlbums) {
          state.albums.listing = libraryAlbums;
          this.searchLibraryAlbums(index);
        }
        if (this.songstest) {
          return;
        }
        state.albums.downloadState = 1;
        state.backgroundNotification.show = true;
        state.backgroundNotification.message = this.getLz("notification.updatingLibraryAlbums");

        function downloadChunk() {
          state.albums.downloadState = 1;
          const params = {
            "include[library-albums]": "catalog,artists,albums",
            "fields[artists]": "name,url,id",
            // "fields[albums]": "name,url,id",
            platform: "web",
            "fields[catalog]": "artistUrl,albumUrl",
            "fields[albums]": "artistName,artistUrl,artwork,contentRating,editorialArtwork,name,playParams,releaseDate,url",
            limit: 100,
            l: this.mklang,
          };
          const safeparams = {
            platform: "web",
            limit: "60",
            "include[library-albums]": "artists",
            "include[library-artists]": "catalog",
            "include[albums]": "artists",
            "fields[artists]": "name,url",
            "fields[albums]": "artistName,artistUrl,artwork,contentRating,editorialArtwork,name,playParams,releaseDate,url",
            includeOnly: "catalog,artists",
          };
          if (downloaded === null) {
            this.mk.api
              .music(`/v1/me/library/albums/`, params)
              .then((response) => {
                processChunk(response.data);
              })
              .catch((error) => {
                console.debug("safe loading");
                this.mk.api
                  .music(`/v1/me/library/albums/`, safeparams)
                  .then((response) => {
                    processChunk(response.data);
                  })
                  .catch((error) => {
                    console.log("safe loading failed", error);
                    this.library.albums.downloadState = 2;
                    this.library.backgroundNotification.show = false;
                  });
              });
          } else {
            if (downloaded.next !== null) {
              this.mk.api
                .music(downloaded.next, params)
                .then((response) => {
                  processChunk(response.data);
                })
                .catch((error) => {
                  console.debug("safe loading");
                  this.mk.api
                    .music(downloaded.next, safeparams)
                    .then((response) => {
                      processChunk(response.data);
                    })
                    .catch((error) => {
                      console.log("safe loading failed", error);
                      this.library.albums.downloadState = 2;
                      this.library.backgroundNotification.show = false;
                    });
                });
            } else {
              console.debug("Download next", downloaded.next);
            }
          }
        }

        function processChunk(response) {
          downloaded = response;
          library = library.concat(downloaded.data);
          state.backgroundNotification.show = true;
          state.backgroundNotification.message = this.getLz("notification.updatingLibraryAlbums");
          state.backgroundNotification.total = downloaded.meta.total;
          state.backgroundNotification.progress = library.length;
          if (downloaded.meta.total === 0) {
            state.albums.downloadState = 3;
            return;
          }
          if (typeof downloaded.next === "undefined") {
            console.debug("downloaded.next is undefined");
            state.albums.listing = library;
            state.albums.downloadState = 2;
            state.backgroundNotification.show = false;
            CiderCache.putCache(cacheId, library);
            this.searchLibraryAlbums(index);
          }
          if (downloaded.meta.total > library.length || typeof downloaded.meta.next !== "undefined") {
            console.debug(`downloading next chunk - ${library.length} albums so far`);
            downloadChunk();
          } else {
            state.albums.listing = library;
            state.albums.downloadState = 2;
            state.backgroundNotification.show = false;
            CiderCache.putCache(cacheId, library);
            this.searchLibraryAlbums(index);
            // console.log(library)
          }
        }

        downloadChunk();
      }),
    // copy the getLibrarySongsFull function except change Songs to Albums
    getLibraryArtistsFull: (force = false, index) =>
      set((state) => {
        let library = [];
        const cacheId = "library-artists";
        let downloaded = null;
        if ((get().artists.downloadState === 2 || get().artists.downloadState === 1) && !force) {
          return;
        }
        const libraryArtists = await CiderCache.getCache(cacheId);
        if (libraryArtists) {
          state.artists.listing = libraryArtists;
          this.searchLibraryArtists(index);
        }
        if (this.songstest) {
          return;
        }
        state.artists.downloadState = 1;
        state.backgroundNotification.show = true;
        state.backgroundNotification.message = this.getLz("notification.updatingLibraryArtists");

        function downloadChunk() {
          state.artists.downloadState = 1;
          const params = {
            include: "catalog",
            // "include[library-artists]": "catalog,artists,albums",
            // "fields[artists]": "name,url,id",
            // "fields[albums]": "name,url,id",
            platform: "web",
            // "fields[catalog]": "artistUrl,albumUrl",
            // "fields[artists]": "artistName,artistUrl,artwork,contentRating,editorialArtwork,name,playParams,releaseDate,url",
            limit: 100,
            l: this.mklang,
          };
          const safeparams = {
            include: "catalog",
            platform: "web",
            limit: 50,
          };
          if (downloaded === null) {
            this.mk.api
              .music(`/v1/me/library/artists/`, params)
              .then((response) => {
                processChunk(response.data);
              })
              .catch((error) => {
                console.debug("safe loading");
                this.mk.api
                  .music(`/v1/me/library/artists/`, safeparams)
                  .then((response) => {
                    processChunk(response.data);
                  })
                  .catch((error) => {
                    console.log("safe loading failed", error);
                    this.library.artists.downloadState = 2;
                    this.library.backgroundNotification.show = false;
                  });
              });
          } else {
            if (downloaded.next !== null) {
              this.mk.api
                .music(downloaded.next, params)
                .then((response) => {
                  processChunk(response.data);
                })
                .catch((error) => {
                  console.log("safe loading");
                  this.mk.api
                    .music(downloaded.next, safeparams)
                    .then((response) => {
                      processChunk(response.data);
                    })
                    .catch((error) => {
                      console.log("safe loading failed", error);
                      this.library.artists.downloadState = 2;
                      this.library.backgroundNotification.show = false;
                    });
                });
            } else {
              console.log("Download next", downloaded.next);
            }
          }
        }

        function processChunk(response) {
          downloaded = response;
          library = library.concat(downloaded.data);
          state.backgroundNotification.show = true;
          state.backgroundNotification.message = this.getLz("notification.updatingLibraryArtists");
          state.backgroundNotification.total = downloaded.meta.total;
          state.backgroundNotification.progress = library.length;
          if (downloaded.meta.total === 0) {
            state.albums.downloadState = 3;
            return;
          }
          if (typeof downloaded.next === "undefined") {
            console.log("downloaded.next is undefined");
            state.artists.listing = library;
            state.artists.downloadState = 2;
            state.artists.show = false;
            CiderCache.putCache(cacheId, library);
            this.searchLibraryArtists(index);
          }
          if (downloaded.meta.total > library.length || typeof downloaded.meta.next !== "undefined") {
            console.log(`downloading next chunk - ${library.length} artists so far`);
            downloadChunk();
          } else {
            state.artists.listing = library;
            state.artists.downloadState = 2;
            state.backgroundNotification.show = false;
            CiderCache.putCache(cacheId, library);
            this.searchLibraryArtists(index);
            // console.log(library)
          }
        }

        downloadChunk();
      }),
    addToLibrary(id) {
      this.mk.addToLibrary(id).then((data) => {
        this.getLibrarySongsFull(true);
      });
      notyf.success(this.getLz("action.addToLibrary.success"));
    },
    removeFromLibrary(kind, id) {
      const truekind = !kind.endsWith("s") ? kind + "s" : kind;
      this.mk.api
        .music(
          `v1/me/library/${truekind}/${id.toString()}`,
          {},
          {
            fetchOptions: {
              method: "DELETE",
            },
          },
        )
        .then((data) => {
          this.getLibrarySongsFull(true);
        });
      notyf.success(this.getLz("action.removeFromLibrary.success"));
    },
    async inLibrary(items: MusicKit.MediaItem[] = []) {
      const types = [];

      for (const item of items) {
        let type = item.type;
        if (type.slice(-1) !== "s") {
          type += "s";
        }
        type = type.replace("library-", "");
        const id = item.attributes.playParams?.catalogId ?? item.attributes.playParams.id ?? item.id;

        const index = types.findIndex(function (_type) {
          return type.type === _type;
        }, type);
        if (index === -1) {
          types.push({ type: type, id: [id] });
        } else {
          types[index].id.push(id);
        }
      }
      let types2 = types.map(function (item) {
        return {
          [`ids[${item.type}]`]: [item.id],
        };
      });
      types2 = types2.reduce(function (result, item) {
        const key = Object.keys(item)[0]; //first property: a, b, c
        result[key] = item[key];
        return result;
      }, {});
      return (
        await this.mk.api.music(`/v1/catalog/${this.mk.storefrontId}`, {
          ...{
            "omit[resource]": "autos",
            relate: "library",
            fields: "inLibrary",
          },
          ...types2,
        })
      ).data.data;
    },

    addSelectedToNewPlaylist: () =>
      set(async (state) => {
        let pl_items: { id: string; type: string }[] = [];
        for (let i = 0; i < state.selectedMediaItems.length; i++) {
          if (state.selectedMediaItems[i].kind === "song" || state.selectedMediaItems[i].kind === "songs") {
            state.selectedMediaItems[i].kind = "songs";
            pl_items.push({
              id: state.selectedMediaItems[i].id,
              type: state.selectedMediaItems[i].kind,
            });
          } else if (
            (state.selectedMediaItems[i].kind === "album" || state.selectedMediaItems[i].kind === "albums") &&
            !state.selectedMediaItems[i].isLibrary
          ) {
            state.selectedMediaItems[i].kind = "albums";
            const res = await this.mk.api.music(`/v1/catalog/${this.mk.storefrontId}/albums/${state.selectedMediaItems[i].id}/tracks`);
            const ids = res.data.data.map(function (i) {
              return { id: i.id, type: i.type };
            });
            pl_items = pl_items.concat(ids);
          } else if (state.selectedMediaItems[i].kind === "library-song" || state.selectedMediaItems[i].kind === "library-songs") {
            state.selectedMediaItems[i].kind = "library-songs";
            pl_items.push({
              id: state.selectedMediaItems[i].id,
              type: state.selectedMediaItems[i].kind,
            });
          } else if (
            state.selectedMediaItems[i].kind === "library-album" ||
            state.selectedMediaItems[i].kind === "library-albums" ||
            (state.selectedMediaItems[i].kind === "album" && state.selectedMediaItems[i].isLibrary)
          ) {
            state.selectedMediaItems[i].kind = "library-albums";
            const res = await this.mk.api.music(`/v1/me/library/albums/${state.selectedMediaItems[i].id}/tracks`);
            const ids = res.data.data.map(function (i) {
              return { id: i.id, type: i.type };
            });
            pl_items = pl_items.concat(ids);
          } else {
            pl_items.push({
              id: state.selectedMediaItems[i].id,
              type: state.selectedMediaItems[i].kind,
            });
          }
        }
        this.modals.addToPlaylist = false;
        this.newPlaylist(this.getLz("term.newPlaylist"), pl_items);
      }),
    addSelectedToPlaylist: async (playlist_id) =>
      set((state) => {
        let pl_items: { id: string; type: string }[] = [];
        const song_ids = [];
        for (let i = 0; i < state.selectedMediaItems.length; i++) {
          if (state.selectedMediaItems[i].kind === "song" || state.selectedMediaItems[i].kind === "songs") {
            state.selectedMediaItems[i].kind = "songs";
            pl_items.push({
              id: state.selectedMediaItems[i].id,
              type: state.selectedMediaItems[i].kind,
            });
            song_ids.push(state.selectedMediaItems[i].id);
          } else if (
            (state.selectedMediaItems[i].kind === "album" || state.selectedMediaItems[i].kind === "albums") &&
            !state.selectedMediaItems[i].isLibrary
          ) {
            state.selectedMediaItems[i].kind = "albums";
            const res = await this.mk.api.music(`/v1/catalog/${this.mk.storefrontId}/albums/${state.selectedMediaItems[i].id}/tracks`);
            const ids = res.data.data.map(function (i) {
              return { id: i.id, type: i.type };
            });
            pl_items = pl_items.concat(ids);
            song_ids.push(...ids.map((id) => id.id));
          } else if (state.selectedMediaItems[i].kind === "library-song" || state.selectedMediaItems[i].kind === "library-songs") {
            state.selectedMediaItems[i].kind = "library-songs";
            pl_items.push({
              id: state.selectedMediaItems[i].id,
              type: state.selectedMediaItems[i].kind,
            });
            song_ids.push(state.selectedMediaItems[i].id);
          } else if (
            state.selectedMediaItems[i].kind === "library-album" ||
            state.selectedMediaItems[i].kind === "library-albums" ||
            (state.selectedMediaItems[i].kind === "album" && state.selectedMediaItems[i].isLibrary)
          ) {
            state.selectedMediaItems[i].kind = "library-albums";
            const res = await this.mk.api.music(`/v1/me/library/albums/${state.selectedMediaItems[i].id}/tracks`);
            const ids = res.data.data.map(function (i) {
              return { id: i.id, type: i.type };
            });
            pl_items = pl_items.concat(ids);
            song_ids.push(...ids.map((id) => id.id));
          } else {
            pl_items.push({
              id: state.selectedMediaItems[i].id,
              type: state.selectedMediaItems[i].kind,
            });
            song_ids.push(state.selectedMediaItems[i].id);
          }
        }
        state.modals.addToPlaylist = false;

        if (await this.isSongInPlaylist(song_ids, playlist_id)) {
          this.confirm(this.getLz("action.addToPlaylist.duplicate"), (result) => {
            if (result) {
              this.addToPlaylist(playlist_id, pl_items);
            }
          });
        } else {
          this.addToPlaylist(playlist_id, pl_items);
        }
      }),
    async isSongInPlaylist(song_ids: number[], playlist_id: string) {
      let isInPlaylist = false;
      const playlistTracks = (
        await this.mk.api.music(`/v1/me/library/playlists/${playlist_id}/tracks`, {
          platform: "web",
          l: this.mklang,
        })
      ).data?.data;

      playlistTracks.forEach((track) => {
        if (song_ids.includes(track.id)) {
          isInPlaylist = true;
        }
      });
      return isInPlaylist;
    },
    addToPlaylist(pid, pitems) {
      this.mk.api
        .music(
          `/v1/me/library/playlists/${pid}/tracks`,
          {},
          {
            fetchOptions: {
              method: "POST",
              body: JSON.stringify({
                data: pitems,
              }),
            },
          },
        )
        .then(() => {
          if (this.page === "playlist_" + pid) {
            this.getPlaylistFromID(this.showingPlaylist.id, true);
          }
        });
    },
    select_removeMediaItem(id) {
      this.selectedMediaItems
        .filter((item) => item.guid === id)
        .forEach((item) => {
          this.selectedMediaItems.splice(this.selectedMediaItems.indexOf(item), 1);
        });
    },
    select_hasMediaItem(id) {
      const found = this.selectedMediaItems.find((item) => item.guid === id);
      if (found) {
        return true;
      } else {
        return false;
      }
    },
    select_selectMediaItem(id, kind, index, guid, library) {
      if (!this.select_hasMediaItem(guid)) {
        this.selectedMediaItems.push({
          id: id,
          kind: kind,
          index: index,
          guid: guid,
          isLibrary: library,
        });
      }
    },
    getPlaylistFolderChildren(id) {
      return this.playlists.listing.filter((playlist) => {
        if (playlist.parent === id) {
          return playlist;
        }
      });
    },
    async getPlaylistFromID(id, transient = false) {
      const params = {
        include: "tracks",
        platform: "web",
        "include[library-playlists]": "catalog,tracks",
        "fields[playlists]": "curatorName,playlistType,name,artwork,url,playParams",
        "include[library-songs]": "catalog,artists,albums,playParams,name,artwork,url",
        "fields[catalog]": "artistUrl,albumUrl,url",
        "fields[songs]": "artistUrl,albumUrl,playParams,name,artwork,url,artistName,albumName,durationInMillis",
        l: this.mklang,
      };
      if (!transient) {
        this.playlists.loadingState = 0;
      }
      this.mk.api
        .music(`/v1/me/library/playlists/${id}`, params)
        .then((res) => {
          this.getPlaylistContinuous(res, transient);
        })
        .catch((e) => {
          console.debug(e);
          try {
            this.mk.api.music(`/v1/catalog/${this.mk.storefrontId}/playlists/${id}`, params).then((res) => {
              this.getPlaylistContinuous(res, transient);
            });
          } catch (err) {
            console.debug(err);
          }
        });
    },
    async getArtistFromID(id) {
      this.page = "";
      const artistData = await this.mkapi(
        "artists",
        false,
        id,
        {
          views:
            "featured-release,full-albums,appears-on-albums,featured-albums,featured-on-albums,singles,compilation-albums,live-albums,latest-release,top-music-videos,similar-artists,top-songs,playlists,more-to-hear,more-to-see",
          extend: "centeredFullscreenBackground,artistBio,bornOrFormed,editorialArtwork,editorialVideo,isGroup,origin,hero",
          "extend[playlists]": "trackCount",
          "include[songs]": "albums",
          "fields[albums]":
            "artistName,artistUrl,artwork,contentRating,editorialArtwork,editorialVideo,name,playParams,releaseDate,url,trackCount",
          "limit[artists:top-songs]": 20,
          "art[url]": "f",
          l: this.mklang,
        },
        { includeResponseMeta: !0 },
      );
      console.debug(artistData.data.data[0]);
      this.artistPage.data = artistData.data.data[0];
      this.page = "artist-page";
    },
    newPlaylist(name = this.getLz("term.newPlaylist"), tracks = []) {
      const request = {
        name: name,
      };
      if (tracks.length > 0) {
        request.tracks = tracks;
      }
      this.mk.api
        .music(
          `/v1/me/library/playlists`,
          {},
          {
            fetchOptions: {
              method: "POST",
              body: JSON.stringify({
                attributes: { name: name },
                relationships: {
                  tracks: { data: tracks },
                },
              }),
            },
          },
        )
        .then((res) => {
          res = res.data.data[0];
          console.debug(res);
          this.appRoute(`playlist_` + res.id);
          this.showingPlaylist = [];
          this.getPlaylistFromID(this.page.substring(9), true);
          this.playlists.listing.push({
            id: res.id,
            attributes: {
              name: name,
            },
            parent: "p.playlistsroot",
          });
          this.sortPlaylists();
          setTimeout(() => {
            this.refreshPlaylists(false, false);
          }, 8000);
        });
    },
    deletePlaylist(id) {
      this.confirm(this.getLz("term.deletePlaylist"), (ok) => {
        if (ok) {
          this.mk.api
            .music(
              `/v1/me/library/playlists/${id}`,
              {},
              {
                fetchOptions: {
                  method: "DELETE",
                },
              },
            )
            .then((res) => {
              // remove this playlist from playlists.listing if it exists
              const found = get().playlists.listing.find((item) => item.id === id);
              if (found) {
                this.playlists.listing.splice(this.playlists.listing.indexOf(found), 1);
              }
              setTimeout(() => {
                this.refreshPlaylists(false, false);
              }, 8000);
            });
        }
      });
    },

    async getPlaylistContinuous(response: MusicKit.Playlists, transient = false) {
      response = response.data.data[0];
      const playlistId = response.id;
      this.playlists.loadingState = !transient ? 0 : 1;
      this.showingPlaylist = response;
      if (!response.relationships?.tracks?.next) {
        this.playlists.loadingState = 1;
        return;
      }

      function getPlaylistTracks(next) {
        this.apiCall(this.musicBaseUrl + next, (res) => {
          if (this.showingPlaylist.id !== playlistId) {
            return;
          }
          this.showingPlaylist.relationships.tracks.data = this.showingPlaylist.relationships.tracks.data.concat(res.data);
          if (res.next) {
            getPlaylistTracks(res.next);
          } else {
            this.playlists.loadingState = 1;
          }
        });
      }

      getPlaylistTracks(response.relationships.tracks.next);
    },
    async editPlaylistFolder(id: string, name = this.getLz("term.newPlaylist")) {
      this.mk.api
        .music(`/v1/me/library/playlist-folders/${id}`, {
          fetchOptions: {
            method: "PATCH",
            body: JSON.stringify({
              attributes: { name: name },
            }),
          },
        })
        .then((res) => {
          this.refreshPlaylists(false, false);
        });
    },
    async editPlaylist(id: string, name = this.getLz("term.newPlaylist")) {
      this.mk.api
        .music(`/v1/me/library/playlists/${id}`, {
          fetchOptions: {
            method: "PATCH",
            body: JSON.stringify({
              attributes: { name: name },
            }),
          },
        })
        .then((res) => {
          this.refreshPlaylists(false, false);
        });
    },
    async editPlaylistDescription(id: string, name = this.getLz("term.newPlaylist")) {
      this.mk.api
        .music(
          `/v1/me/library/playlists/${id}`,
          {},
          {
            fetchOptions: {
              method: "PATCH",
              body: JSON.stringify({
                attributes: { description: name },
              }),
            },
          },
        )
        .then((res) => {
          this.refreshPlaylists(false, false);
        });
    },
    refreshPlaylists: async (localOnly = false, useCachedPlaylists = true) =>
      set(async (state) => {
        const trackMap = this.cfg.advanced.playlistTrackMapping;
        const newListing: MusicKit.Playlists[] = [];
        const trackMapping: Record<string, any> = {};

        if (useCachedPlaylists) {
          const cachedPlaylist = await CiderCache.getCache("library-playlists");
          const cachedTrackMapping = await CiderCache.getCache("library-playlists-tracks");

          if (cachedPlaylist) {
            console.debug("[CiderCache] Using cached playlist");
            state.playlists.listing = cachedPlaylist;
            state.sortPlaylists();
          } else {
            console.debug("[CiderCache] Playlist has no cache");
          }

          if (cachedTrackMapping) {
            console.debug("[CiderCache] Using cached track mapping");
            state.playlists.trackMapping = cachedTrackMapping;
          }
          if (localOnly) {
            return;
          }
        }

        state.backgroundNotification.message = this.getLz("notification.buildingPlaylistCache");
        state.backgroundNotification.show = true;

        async function deepScan(parent = "p.playlistsroot") {
          console.debug(`scanning ${parent}`);
          // const playlistData = await this.mk.api.music(`/v1/me/library/playlist-folders/${parent}/children/`)
          const playlistData = await MusicKitTools.v3Continuous({
            href: `/v1/me/library/playlist-folders/${parent}/children/`,
          });
          console.log(playlistData);
          await asyncForEach(playlistData, async (playlist: MusicKit.Playlists) => {
            playlist.parent = parent;
            if (playlist.type !== "library-playlist-folders" && typeof playlist.attributes.playParams["versionHash"] !== "undefined") {
              playlist.parent = "p.applemusic";
            }
            playlist.children = [];
            playlist.tracks = [];
            try {
              if (trackMap) {
                const tracks = await this.mk.api.music(playlist.href + "/tracks").catch((e) => {
                  // no tracks
                  e = null;
                });
                tracks.data.data.forEach((track) => {
                  if (!trackMapping[track.id]) {
                    trackMapping[track.id] = [];
                  }
                  trackMapping[track.id].push(playlist.id);

                  if (typeof track.attributes.playParams.catalogId === "string") {
                    if (!trackMapping[track.attributes.playParams.catalogId]) {
                      trackMapping[track.attributes.playParams.catalogId] = [];
                    }
                    trackMapping[track.attributes.playParams.catalogId].push(playlist.id);
                  }
                });
              }
            } catch (e) {
              console.log(e);
            }
            if (playlist.type === "library-playlist-folders") {
              try {
                await deepScan(playlist.id).catch((e) => {});
              } catch (e) {
                console.log(e);
              }
            }
            newListing.push(playlist);
          });
        }

        await deepScan();

        state.backgroundNotification.show = false;
        get().playlists.listing = newListing;
        state.sortPlaylists();
        if (trackMap) {
          CiderCache.putCache("library-playlists-tracks", trackMapping);
          state.playlists.trackMapping = trackMapping;
        }
        CiderCache.putCache("library-playlists", newListing);
      }),
    sortPlaylists: () =>
      set((state) => {
        state.playlists.listing.sort((a, b) => {
          if (a.type === "library-playlist-folders" && b.type !== "library-playlist-folders") {
            return -1;
          } else if (a.type !== "library-playlist-folders" && b.type === "library-playlist-folders") {
            return 1;
          } else {
            return 0;
          }
        });
      }),
    getSocialBadges(cb = () => {}) {
      try {
        this.mk.api.music("/v1/social/badging-map").then((data) => {
          this.socialBadges.badgeMap = data.data.results.badgingMap;
          cb(data.data.results.badgingMap);
        });
      } catch (ex) {
        this.socialBadges.badgeMap = {};
      }
    },
    addFavorite(id, type) {
      this.cfg.home.favoriteItems.push({
        id: id,
        type: type,
      });
    },

    async syncFavorites() {
      const notify = notyf.open({
        className: "notyf-info",
        type: "info",
        message: `[${this.getLz("home.syncFavorites")}] ${this.getLz("home.syncFavorites.gettingArtists")}`,
      });
      const results = await MusicKitTools.v3Continuous({
        href: "/v1/me/library/artists",
        options: {
          include: ["catalog"],
          "fields[artists]": ["inFavorites"],
        },
      });
      const favs = [];
      // for each result
      results.forEach((result) => {
        try {
          if (result.relationships?.catalog?.data[0]?.attributes?.inFavorites) {
            if (!favs.includes(result.relationships?.catalog?.data[0].id)) {
              favs.push(result.relationships?.catalog?.data[0].id);
            }
          }
        } catch (e) {
          e = null;
        }
      });
      notyf.success(`[${this.getLz("home.syncFavorites")}] ${this.getLz("action.done")}`);
      this.cfg.home.followedArtists = favs;
      return favs;
    },
    async setArtistFavorite(id, val = true) {
      if (val) {
        if (!this.cfg.home.followedArtists.includes(id)) {
          this.cfg.home.followedArtists.push(id);
        }
        await this.mk.api.music(
          `/v1/me/favorites`,
          {
            "art[url]": "f",
            "ids[artists]": this.artistPage.data.id,
            l: this.mklang,
            platform: "web",
          },
          {
            fetchOptions: {
              method: "POST",
            },
          },
        );
      } else {
        if (this.cfg.home.followedArtists.includes(id)) {
          this.cfg.home.followedArtists.splice(this.cfg.home.followedArtists.indexOf(id), 1);
        }
        await this.mk.api.music(
          `/v1/me/favorites`,
          {
            "art[url]": "f",
            "ids[artists]": this.artistPage.data.id,
            l: this.mklang,
            platform: "web",
          },
          {
            fetchOptions: {
              method: "DELETE",
            },
          },
        );
      }
    },
    async showSocialListeningTo() {
      const contentIds = Object.keys(this.socialBadges.badgeMap);
      this.showCollection({ data: this.socialBadges.mediaItems }, "Friends Listening To", "albums");
      if (this.socialBadges.mediaItemDLState === 1 || this.socialBadges.mediaItemDLState === 2) {
        return;
      }
      this.socialBadges.mediaItemDLState = 2;
      await asyncForEach(contentIds, async (item) => {
        try {
          let type = "albums";
          if (item.includes("pl.")) {
            type = "playlists";
          }
          if (item.includes("ra.")) {
            type = "stations";
          }
          const found = await this.mk.api.music(`/v1/catalog/${this.mk.storefrontId}/${type}/${item}`);
          this.socialBadges.mediaItems.push(found.data.data[0]);
        } catch (e) {
          console.log(e);
        }
      });
    },
    newPlaylistFolder: (name = this.getLz("term.newPlaylistFolder")) =>
      set((state) => {
        this.mk.api
          .music("/v1/me/library/playlist-folders/", {
            fetchOptions: {
              method: "POST",
              body: JSON.stringify({
                attributes: { name: name },
              }),
            },
          })
          .then((res) => {
            const playlist = res.data.data[0];
            state.playlists.listing.push({
              id: playlist.id,
              attributes: {
                name: playlist.attributes.name,
              },
              type: "library-playlist-folders",
              parent: "p.playlistsroot",
            });
            state.sortPlaylists();
            setTimeout(() => {
              state.refreshPlaylists(false, false);
            }, 13000);
          });
      }),
    getArtistInfo(id: string, _isLibrary: boolean) {
      this.getArtistFromID(id);
      //this.getTypeFromID("artist",id,isLibrary,query)
    },
  })),
);
