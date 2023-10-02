import ReactDragListView from 'react-drag-listview'

import { MouseEvent, createRef, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { setChoosenVideo, setPlaylistVideos, setVideoAction, updatePlaylist } from "../redux/video/video-slice";

export function PlaylistView (){
    const inputRef = createRef<HTMLInputElement>();
    const videoState = useAppSelector((state) => state.video)
    const dispatch = useAppDispatch()

    const getPlaylist = (searchWord?: string) => {
        const path = process.env.REACT_APP_PLAYLIST_DATA_URL! + videoState.currentPlaylist?.id;
        fetch(path)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            dispatch(setPlaylistVideos(data.playlistPosition.map((d: any) => d.video)));
            console.log();
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    }

    useEffect(getPlaylist, [])

    const onVideoSelect = (e: MouseEvent) => {
        console.log(e.currentTarget.id);
        dispatch(setChoosenVideo(e.currentTarget.id));
        dispatch(setVideoAction('play'));
    }

    const dragProps = {
        onDragEnd(fromIndex: number, toIndex: number) {
          const data = videoState.currentPlaylist?.playlistPosition!;
          const item = data.splice(fromIndex, 1)[0];
          data.splice(toIndex, 0, item);
          const newList = data.sort((p1, p2) => p1.position - p2.position);
          dispatch(updatePlaylist({...videoState.currentPlaylist!, playlistPosition: newList}));
        },
        nodeSelector: 'div',
      }

    console.log(videoState.playlistVideos);
    return (
        <div><table>
                {videoState.playlistVideos.map((item) => <tr><div
                    onClick={onVideoSelect}
                    id={item.id}
                    key={item.id}>{item.title}
                </div></tr>)}
            </table>    
        </div>
    )
}