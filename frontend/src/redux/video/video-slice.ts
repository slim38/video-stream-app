import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store';

export interface VideoListItem { title: string; id: string; description: string; }
export interface PlaylistListItem { title: string, id: string, playlistPosition: { video: VideoListItem, position: number }[]};

export interface VideoState {
    currentVideo: VideoListItem | undefined;
    videoList: VideoListItem[];
    displayedList: 'video' | 'playlist' | 'playlistView';
    playlistList: PlaylistListItem[];
    currentPlaylist: PlaylistListItem | undefined;
    videoSearchWord: string | undefined;
    playlistSearchWord: string | undefined;
    videoAction: 'play' | 'edit' | 'upload' | 'editPlaylist' | 'createPlaylist';
    playlistVideos: VideoListItem[];
}

const initialState: VideoState = {
    currentVideo: undefined,
    videoList: [],
    displayedList: 'video',
    playlistList: [],
    videoSearchWord: undefined,
    playlistSearchWord: undefined,
    videoAction: 'play',
    currentPlaylist: undefined,
    playlistVideos: []
}

export const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    setVideoList: (state, action: PayloadAction<VideoListItem[]>) => {
        state.videoList = action.payload;
        if (state.currentVideo === undefined) {
            state.currentVideo = action.payload[0];
        }
    },
    setPlaylistList: (state, action: PayloadAction<PlaylistListItem[]>) => {
        state.playlistList = action.payload;
        if (state.currentPlaylist === undefined) {
            state.currentPlaylist = action.payload[0];
        }
    },
    setCurrentPlaylist: (state, action: PayloadAction<string>) => {
        state.currentPlaylist = state.playlistList.find(pl => pl.id === action.payload);
        if (state.currentPlaylist?.playlistPosition) {
            state.currentPlaylist.playlistPosition = state.currentPlaylist?.playlistPosition
                                                     .sort((a, b) => a.position - b.position); 
        }
    },
    switchToPlView: (state) => {
        state.displayedList = 'playlistView';
    },
    setChoosenVideo: (state, action: PayloadAction<string>) => {
        state.currentVideo = state.videoList.find((video) => video.id === action.payload);
    },
    setDisplayedList: (state, action: PayloadAction<'video' | 'playlist'>) => {
        state.displayedList = action.payload;
    },
    updatePlaylist: (state, action: PayloadAction<PlaylistListItem>) => {
        state.currentPlaylist = action.payload;
    },
    setVideoSearchWord: (state, action: PayloadAction<string>) => {
        state.videoSearchWord = action.payload;
    },
    setPlaylistVideos: (state, action: PayloadAction<VideoListItem[]>) => {
        state.playlistVideos = action.payload;
    },
    setVideoAction: (state, action: PayloadAction<'play' | 'edit' | 'upload' | 'editPlaylist' | 'createPlaylist'>) => {
        state.videoAction = action.payload;
    },
    deleteVideo: (state, action: PayloadAction<string>) => {
        state.videoList = state.videoList.filter((video) => video.id !== action.payload);
        state.currentVideo = state.videoList[0];
        state.videoAction = 'play';
    }
  },
})

// Action creators are generated for each case reducer function
export const {
    setVideoList,
    setChoosenVideo,
    setDisplayedList,
    setVideoSearchWord,
    setVideoAction,
    deleteVideo,
    setPlaylistList,
    setCurrentPlaylist,
    switchToPlView,
    updatePlaylist,
    setPlaylistVideos
} = videoSlice.actions
export const videoReducer = videoSlice.reducer;
export const selectVideo = (state: RootState) => state.video