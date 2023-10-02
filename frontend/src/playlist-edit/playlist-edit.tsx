import { ChangeEvent, RefObject, createRef, useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "../redux/hooks"
import { PlaylistListItem, VideoListItem, setCurrentPlaylist, setPlaylistList, setVideoAction } from "../redux/video/video-slice";

type EditListType = VideoListItem & { included: boolean, ref: RefObject<HTMLInputElement>}

export function PlaylistEdit() {
    const videoState = useAppSelector((state) => state.video)
    const dispatch = useAppDispatch()
    const [editList, updateEditList]: [any, (list: any) => void] = useState([]);
    
    const titleRef = createRef<HTMLInputElement>();

    const setEditList = () => {
        const videos = videoState.videoList;
        
        const playlistVideos: EditListType[] = [...videoState.playlistVideos
            .map(v => { return {...v, included: true, ref: createRef<HTMLInputElement>()}
                }
            )
        ];

        videos.forEach((video) => {
            if (!playlistVideos.map(v => v.id).includes(video.id)) {
                playlistVideos.push({...video, included: false, ref: createRef<HTMLInputElement>()})
            }
        });
        updateEditList(playlistVideos);
    }

    function save() {
        const currentList = videoState.currentPlaylist
        const path = process.env.REACT_APP_PLAYLIST_DATA_URL! + currentList?.id;
        const videos = editList
        .filter((v: EditListType) => v.included)
        .map((v: EditListType) => {
            return {
                videoId: v.id,
                position: 10,
            };
        })
        const body = {
            title: titleRef.current?.value,
            playlistPosition: videos
        }
        console.log(body);
        fetch(path, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        })
        .then(_ => {
            const newList: PlaylistListItem[] = videoState.playlistList.map((playlist) => {
                if (playlist.id === videoState.currentPlaylist?.id) {
                    return {
                        title: titleRef.current?.value ?? playlist.title,
                        id: playlist.id,
                        playlistPosition: editList
                        .filter((v: EditListType) => v.included)
                        .map((v: EditListType) => {
                            return {
                                videoId: v.id,
                                position: 10,
                            };
                        })
                    };
                }
                return playlist;
            });
            dispatch(setPlaylistList(newList));
            dispatch(setCurrentPlaylist(videoState.currentPlaylist?.id!));
            dispatch(setVideoAction('play'))
            console.log('test');
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    }

    const setIncluded = (e: ChangeEvent) => {
        updateEditList(editList.map((video: any) => {
            if (video.id === e.currentTarget.id) {
                video.included = !video.included;
            }
            return video;
        }));
        console.log('');
    }

    useEffect(setEditList, [videoState.currentPlaylist?.id])

    return (
        <div><table>
            <tr><th>Playlistname</th></tr>
            <tr><td><input ref={titleRef} type='text'/></td></tr>
            <tr><th>Title</th><th>Included</th></tr>
            {editList.map((obj: EditListType) => <tr>
                    <td>{obj.title + ' '}</td>
                    <td><input type='checkbox' id={obj.id} ref={obj.ref} onChange={setIncluded} defaultChecked={obj.included}/></td>
                </tr>
            )}
            <tr><td></td><td><button onClick={save}>save</button></td></tr>
            </table>
            
        </div>
    )
}