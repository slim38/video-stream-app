import React, { Component } from 'react';
import { MouseEvent } from 'react'
import './control-area.css';
import { VideoPlayer } from '../video-player/video-player';
import { VideoList } from '../video-list/video-list';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { setDisplayedList } from '../redux/video/video-slice';
import { VideoUpdateScreen } from '../video-update-screen/video-update-screen';
import VideoUpload from '../video-upload/video-upload';
import { PlaylistList } from '../playlist-list/playlist-list';
import { PlaylistEdit } from '../playlist-edit/playlist-edit';
import { PlaylistCreate } from '../create-playlist/create-playlist';

export function ControlArea() {
    const videoState = useAppSelector((state) => state.video)
    const dispatch = useAppDispatch()
    function change(e: MouseEvent) {
        dispatch(setDisplayedList(e.currentTarget.id === 'video' ? 'video' : 'playlist'));
    }
        return (
            <div>
            {
                videoState.videoAction === 'edit' ?
                <VideoUpdateScreen/> :
                videoState.videoAction === 'play' ?
                <VideoPlayer key={videoState.currentVideo?.id}/> :
                videoState.videoAction === 'editPlaylist' ?
                <PlaylistEdit/> :
                videoState.videoAction === 'createPlaylist' ? 
                <PlaylistCreate/> :
                <VideoUpload/>
            }
            <div className="responsive-component">
                <nav className="navbar">
                    <ul className="nav-list">
                        <li id='video' onClick={change}><a href='#video'>Videos</a></li>
                        <li id='playlist' onClick={change}><a href="#playlist">Playlists</a></li>
                    </ul>
                        <div className="nav-button">
                            <button>Logout</button>
                        </div>
                </nav>
            <div className="scrollable-content">
                {videoState.displayedList === 'video' ? <VideoList/> : <PlaylistList/>}
            </div>
            </div>
            </div>
        );
    
}
