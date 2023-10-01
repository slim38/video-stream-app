import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store';
import { Payload } from '@nestjs/microservices';

export interface VideoListItem { title: string; id: string; description: string; }
export interface PlaylistListItem { title: string, id: string, playlistPosition: { video: VideoListItem, position: number }};

export interface VideoState {
    currentVideo: VideoListItem | undefined;
    videoList: VideoListItem[];
    displayedList: 'video' | 'playlist';
    playlistList: PlaylistListItem[];
    videoSearchWord: string | undefined;
    playlistSearchWord: string | undefined;
    videoAction: 'play' | 'edit' | 'upload';
}

const initialState: VideoState = {
    currentVideo: undefined,
    videoList: [],
    displayedList: 'video',
    playlistList: [],
    videoSearchWord: undefined,
    playlistSearchWord: undefined,
    videoAction: 'play',
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
    setChoosenVideo: (state, action: PayloadAction<string>) => {
        state.currentVideo = state.videoList.find((video) => video.id === action.payload);
    },
    setDisplayedList: (state, action: PayloadAction<'video' | 'playlist'>) => {
        state.displayedList = action.payload;
    },
    setVideoSearchWord: (state, action: PayloadAction<string>) => {
        state.videoSearchWord = action.payload;
    },
    setVideoAction: (state, action: PayloadAction<'play' | 'edit' | 'upload'>) => {
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
} = videoSlice.actions
export const videoReducer = videoSlice.reducer;
export const selectVideo = (state: RootState) => state.video