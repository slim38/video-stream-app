import { MouseEvent, createRef, useEffect } from "react";   
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { setChoosenVideo, setCurrentPlaylist, setPlaylistList, setVideoAction, setVideoList, switchToPlView } from "../redux/video/video-slice";
import { PlaylistView } from "../playlist-view/playlist-view";

export function PlaylistList (){
    const inputRef = createRef<HTMLInputElement>();
    const videoState = useAppSelector((state) => state.video)
    const dispatch = useAppDispatch()
   
    const getPlaylists = (searchWord?: string) => {
        const path = process.env.REACT_APP_PLAYLIST_DATA_URL! + (searchWord ? `search/${searchWord}` : '');
        fetch(path)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            dispatch(setPlaylistList(data));
            dispatch(setCurrentPlaylist(data));
            console.log('test');
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    }

    useEffect(() => getPlaylists(), []);

    const onSearch = () => {
        console.log(inputRef?.current?.value)
        getPlaylists(inputRef?.current?.value.trim());
    }

    const playlistSelect = (e: MouseEvent) => {
        console.log(e.currentTarget.id);
        dispatch(setCurrentPlaylist(e.currentTarget.id));
        dispatch(switchToPlView());
    }

    const onEdit = (e: MouseEvent) => {
        console.log('Edit!')
        dispatch(setCurrentPlaylist(e.currentTarget.id));
        dispatch(setVideoAction('editPlaylist'));
    }

    const onUploadWish = () => dispatch(setVideoAction('createPlaylist'));

    return (
        <div>{videoState.displayedList === 'playlistView' ? <PlaylistView/> : <div><div>
        <input type='text' ref={inputRef}/>
        <button onClick={onSearch}>search</button>
        <button onClick={onUploadWish}>Create Playlist</button>
    </div>
    <div>
        {videoState.playlistList.map((item) => <div
            onClick={playlistSelect}
            id={item.id}
            key={item.id}>{item.title}
            <button onClick={onEdit}>edit</button>
        </div>)}
        </div>
        </div>}
    </div>
        )
}